import React, { useState, useCallback } from 'react';
import { FileUp, Loader, FileSpreadsheet, Download, AlertTriangle, FileText, Archive, RefreshCcw } from 'lucide-react';
import type { ExtractedFile, LoadingState } from './types';
import { extractDataFromFiles } from './services/geminiService';
import { downloadAsExcel } from './services/excelService';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';

export default function App(): React.ReactNode {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedFile[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setExtractedData([]);
    setError(null);
  };

  const handleExtraction = useCallback(async () => {
    if (files.length === 0) {
      setError("Silakan pilih file untuk diekstrak.");
      return;
    }
    
    setError(null);
    setExtractedData([]);
    setLoadingState({ processed: 0, total: files.length, currentFile: 'Mempersiapkan...' });


    try {
      const results = await extractDataFromFiles(files, (progress) => {
        setLoadingState(progress);
      });
      
      const successfulExtractions = results.filter(result => !result.error && result.data.length > 0);
      const failedExtractions = results.filter(result => result.error);

      if (successfulExtractions.length > 0) {
        setExtractedData(successfulExtractions);
      }
      
      if (failedExtractions.length > 0) {
          const errorList = failedExtractions.map(f => `• ${f.fileName}: ${f.error}`).join('\n');
          setError(`Gagal mengekstrak data dari beberapa file:\n${errorList}`);
      }

    } catch (e: any) {
      console.error(e);
      setError(`Terjadi kesalahan fatal saat ekstraksi: ${e.message || 'Error tidak diketahui.'}`);
    } finally {
      setLoadingState(null);
    }
  }, [files]);
  
  const handleDownload = () => {
    if (extractedData.length > 0) {
      downloadAsExcel(extractedData);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setExtractedData([]);
    setError(null);
    setLoadingState(null);
  };
  
  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-red-400 flex-shrink-0" />;
    }
    if (fileName.toLowerCase().endsWith('.zip')) {
      return <Archive className="h-5 w-5 text-yellow-400 flex-shrink-0" />;
    }
    return <FileText className="h-5 w-5 text-text-secondary flex-shrink-0" />;
  };
  
  const isLoading = loadingState !== null;

  return (
    <div className="min-h-screen bg-transparent text-text-primary font-sans">
      <main className="container mx-auto px-4 py-4 sm:py-6">
        <header className="text-center mb-6">
          <div className="inline-block bg-violet-500/10 p-2 rounded-full mb-3 ring-1 ring-inset ring-violet-500/20">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
            Ekstraktor Data Kartu Keluarga
          </h1>
          <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
            Unggah file Kartu Keluarga (PDF/ZIP) untuk mengekstrak data secara otomatis.
          </p>
        </header>

        <div className="max-w-lg mx-auto bg-surface/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-border">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3 h-56">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-base font-semibold text-text-primary">Memproses File...</p>
              <p className="text-sm text-text-secondary text-center truncate w-full px-4">{`[${Math.floor(loadingState.processed)}/${loadingState.total}] ${loadingState.currentFile}`}</p>
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2 overflow-hidden">
                {loadingState.processed > 0 ? (
                  <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${loadingState.total > 0 ? (loadingState.processed / loadingState.total) * 100 : 0}%` }}
                  ></div>
                ) : (
                  <div className="bg-primary h-2 w-1/4 rounded-full animate-indeterminate"></div>
                )}
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-danger-bg border border-danger-border text-amber-300 px-3 py-2 rounded-md relative mb-4 flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-danger flex-shrink-0" />
                  <span className="whitespace-pre-wrap text-xs">{error}</span>
                </div>
              )}

              {extractedData.length > 0 ? (
                <div className="fade-in">
                  <h2 className="text-lg font-semibold text-text-primary mb-2 text-center">Hasil Ekstraksi</h2>
                  <ResultsDisplay data={extractedData} />
                  <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                      <button
                        onClick={handleReset}
                        className="text-sm bg-zinc-700 text-text-primary font-semibold py-1.5 px-3 rounded-md hover:bg-zinc-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-500/50 flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Mulai Lagi
                      </button>
                      <button
                        onClick={handleDownload}
                        className="text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-1.5 px-3 rounded-md hover:from-emerald-600 hover:to-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4" />
                        Unduh Excel
                      </button>
                  </div>
                </div>
              ) : (
                 <>
                  {files.length === 0 ? (
                    <FileUpload onFilesChange={handleFilesChange} />
                  ) : (
                    <div className="text-center fade-in">
                      <h3 className="text-base font-semibold text-text-primary mb-2">File Siap Diekstrak</h3>
                      <p className="text-sm text-text-secondary mb-4">{files.length} file dipilih. Klik tombol untuk memulai.</p>
                      
                      <div className="mt-4 text-left max-w-md mx-auto">
                        <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-2 bg-background/50 p-2 rounded-md border border-border">
                          {files.map((file, index) => (
                            <li key={index} className="flex items-center space-x-2 bg-surface/60 p-2 rounded-md">
                              {getFileIcon(file.name)}
                              <span className="text-xs text-text-secondary truncate flex-1">{file.name}</span>
                              <span className="text-xs text-zinc-500 ml-auto whitespace-nowrap">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                        <button
                          onClick={handleReset}
                          className="text-sm bg-zinc-700 text-text-primary font-semibold py-1.5 px-3 rounded-md hover:bg-zinc-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-500/50 w-full sm:w-auto"
                        >
                          Ganti File
                        </button>
                        <button
                          onClick={handleExtraction}
                          className="text-sm bg-gradient-to-r from-primary to-fuchsia-600 text-white font-semibold py-1.5 px-3 rounded-md hover:from-primary-hover hover:to-fuchsia-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-md flex items-center justify-center w-full sm:w-auto"
                          disabled={isLoading}
                        >
                          <FileUp className="mr-1.5 h-4 w-4" />
                          Ekstrak Data
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <footer className="text-center mt-8 text-xs text-zinc-500">
          <p>Dibuat dengan React, Tailwind, dan Gemini API.</p>
        </footer>
      </main>
    </div>
  );
}