
import * as XLSX from 'xlsx';
import type { ExtractedFile } from '../types';
import { CHILD_DATA_COLUMNS } from '../types';

export const downloadAsExcel = (data: ExtractedFile[]) => {
  const workbook = XLSX.utils.book_new();

  data.forEach(fileData => {
    if (fileData.data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(fileData.data, { header: CHILD_DATA_COLUMNS });
      // Clean sheet name, max 31 chars, no invalid chars
      const safeSheetName = fileData.fileName.replace(/[*?:[\]/\\]/g, '').substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
    }
  });

  if (workbook.SheetNames.length > 0) {
    XLSX.writeFile(workbook, 'HASIL_EKSTRAK_KK.xlsx');
  } else {
    alert("Tidak ada data valid untuk diunduh.");
  }
};
