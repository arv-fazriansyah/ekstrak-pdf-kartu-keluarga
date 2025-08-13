import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import JSZip from 'jszip';
import type { ExtractedFile, ChildData, LoadingState } from '../types';
import { CHILD_DATA_COLUMNS } from '../types';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      'No.': { type: Type.STRING, description: 'Nomor urut anggota keluarga.' },
      Nama: { type: Type.STRING, description: 'Nama lengkap anak.' },
      NIK: { type: Type.STRING, description: 'Nomor Induk Kependudukan anak.' },
      'Tempat Lahir': { type: Type.STRING, description: 'Tempat lahir anak.' },
      'Tanggal Lahir': { type: Type.STRING, description: 'Tanggal lahir anak (format DD-MM-YYYY).' },
      'Nama Ayah': { type: Type.STRING, description: 'Nama lengkap ayah.' },
      'Tempat Lahir Ayah': { type: Type.STRING, description: 'Tempat lahir ayah.' },
      'Tanggal Lahir Ayah': { type: Type.STRING, description: 'Tanggal lahir ayah (format DD-MM-YYYY).' },
      'Pendidikan Ayah': { type: Type.STRING, description: 'Pendidikan terakhir ayah.' },
      'Pekerjaan Ayah': { type: Type.STRING, description: 'Jenis pekerjaan ayah.' },
      'Nama Ibu': { type: Type.STRING, description: 'Nama lengkap ibu.' },
      'Tempat Lahir Ibu': { type: Type.STRING, description: 'Tempat lahir ibu.' },
      'Tanggal Lahir Ibu': { type: Type.STRING, description: 'Tanggal lahir ibu (format DD-MM-YYYY).' },
      'Pendidikan Ibu': { type: Type.STRING, description: 'Pendidikan terakhir ibu.' },
      'Pekerjaan Ibu': { type: Type.STRING, description: 'Jenis pekerjaan ibu.' },
      'Alamat Lengkap': { type: Type.STRING, description: 'Alamat lengkap keluarga sesuai format: KP. ... RT .../RW ... DESA .... KEC. ... KAB. ... {KODE POS}' },
      'No. KK': { type: Type.STRING, description: 'Nomor Kartu Keluarga.' },
    },
    required: ['Nama', 'NIK', 'Tanggal Lahir', 'Nama Ayah', 'Nama Ibu', 'No. KK', 'Alamat Lengkap'],
    propertyOrdering: CHILD_DATA_COLUMNS
  }
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error.message && (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429"))) {
      console.log(`Rate limit hit. Retrying in ${delay / 1000}s... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2); 
    }
    throw error;
  }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const extractDataFromFile = async (file: File): Promise<ExtractedFile> => {
  const fileName = file.name;
  console.log(`Processing ${fileName}...`);
  try {
    const imagePart = await fileToGenerativePart(file);
    const prompt = `
      Periksa dokumen ini. Jika ini BUKAN Kartu Keluarga (KK) resmi Indonesia, kembalikan array JSON kosong [].
      Jika YA, analisis dokumen dan ekstrak informasi HANYA untuk anggota keluarga dengan status hubungan "ANAK".
      Untuk setiap anak, kumpulkan data berikut sesuai urutan yang ditentukan dalam skema.
      Identifikasi NAMA AYAH dan NAMA IBU dari kepala keluarga dan pasangannya, beserta data Tempat Lahir, Tanggal Lahir, Pendidikan, dan Pekerjaan mereka.
      Sertakan ALAMAT LENGKAP dan NO. KK yang tertera di dokumen.
      Pastikan semua data yang diekstrak untuk setiap anak mencakup detail ayah dan ibunya.
      Format output harus JSON yang sesuai dengan skema yang diberikan.
    `;
    
    const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      }
    }));

    const text = response.text.trim();
    if (!text) {
        console.log(`No valid data extracted from ${fileName} (likely not a KK or no children).`);
        return { fileName: fileName.replace(/\.[^/.]+$/, ""), data: [] };
    }
    
    const extractedData: ChildData[] = JSON.parse(text);
    console.log(`Successfully extracted ${extractedData.length} records from ${fileName}.`);
    return { fileName: fileName.replace(/\.[^/.]+$/, ""), data: extractedData };

  } catch (error: any) {
    console.error(`Error processing file ${fileName}:`, error);
    let errorMessage = "Gagal memproses file. Pastikan dokumen valid dan tidak rusak.";
    if (error.message && (error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("429"))) {
        errorMessage = "Batas permintaan API tercapai. Silakan coba lagi nanti.";
    } else if (error instanceof SyntaxError) {
        errorMessage = "Gagal mem-parsing respons dari AI. Respon tidak valid.";
    }
    return { fileName: fileName.replace(/\.[^/.]+$/, ""), data: [], error: errorMessage };
  }
};


export const extractDataFromFiles = async (
  files: File[],
  updateProgress: (progress: LoadingState) => void
): Promise<ExtractedFile[]> => {
  const allFilesToProcess: File[] = [];
  updateProgress({ processed: 0, total: files.length, currentFile: 'Membuka file zip...' });

  for (const file of files) {
    if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
      const zip = await JSZip.loadAsync(file);
      for (const relativePath in zip.files) {
        const zipEntry = zip.files[relativePath];
        if (!zipEntry.dir && (zipEntry.name.toLowerCase().endsWith('.pdf'))) {
          const blob = await zipEntry.async('blob');
          const pathParts = zipEntry.name.split('/');
          const simpleFileName = pathParts[pathParts.length - 1];
          const pdfFile = new File([blob], simpleFileName, { type: 'application/pdf' });
          allFilesToProcess.push(pdfFile);
        }
      }
    } else if (file.type === 'application/pdf') {
      allFilesToProcess.push(file);
    }
  }

  const CONCURRENCY_LIMIT = 5;
  const allResults: ExtractedFile[] = [];
  let processedCount = 0;
  const totalFiles = allFilesToProcess.length;

  updateProgress({ processed: 0, total: totalFiles, currentFile: 'Memulai ekstraksi...' });
  
  if (totalFiles === 0) {
      updateProgress({ processed: 0, total: 0, currentFile: 'Selesai' });
      return [];
  }

  for (let i = 0; i < totalFiles; i += CONCURRENCY_LIMIT) {
    const chunk = allFilesToProcess.slice(i, i + CONCURRENCY_LIMIT);
    
    const chunkPromises = chunk.map(file => 
      extractDataFromFile(file).then(result => {
        processedCount++;
        updateProgress({
          processed: processedCount,
          total: totalFiles,
          currentFile: file.name,
        });
        return result;
      })
    );
    
    const chunkResults = await Promise.all(chunkPromises);
    allResults.push(...chunkResults);
  }
  
  updateProgress({ processed: totalFiles, total: totalFiles, currentFile: 'Selesai' });
  
  // Sort results based on original file order to maintain consistency
  const fileOrderMap = new Map(
    allFilesToProcess.map((file, index) => [file.name.replace(/\.[^/.]+$/, ""), index])
  );
  
  return allResults.sort((a, b) => 
    (fileOrderMap.get(a.fileName) ?? Infinity) - (fileOrderMap.get(b.fileName) ?? Infinity)
  );
};