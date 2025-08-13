import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, Archive } from 'lucide-react';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
}

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function FileUpload({ onFilesChange }: FileUploadProps): React.ReactNode {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    setError(null);
    const newFiles: File[] = [];
    let hasError = false;

    for (const file of Array.from(files)) {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (file.size > MAX_SIZE_BYTES) {
        setError(`File ${file.name} melebihi batas ukuran ${MAX_SIZE_MB}MB.`);
        hasError = true;
        break;
      }

      if (fileType === 'application/pdf' || fileExtension === 'pdf' || fileType === 'application/zip' || fileExtension === 'zip') {
        newFiles.push(file);
      } else {
        setError(`File ${file.name} memiliki tipe yang tidak didukung. Harap unggah .pdf atau .zip.`);
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      setSelectedFiles(newFiles);
      onFilesChange(newFiles);
    } else {
      setSelectedFiles([]);
      onFilesChange([]);
    }
  }, [onFilesChange]);

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
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

  return (
    <div className="fade-in">
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-56 sm:h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 
          ${isDragging 
            ? 'border-primary bg-primary/10 ring-4 ring-primary/20' 
            : 'border-border-hover hover:border-primary hover:bg-primary/5'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center p-5 text-center">
          <UploadCloud className={`w-8 h-8 sm:w-10 sm:h-10 mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-text-secondary'}`} />
          <p className="mb-2 text-xs sm:text-sm text-text-secondary">
            <span className="font-semibold text-primary">Klik untuk unggah</span> atau seret dan lepas
          </p>
          <p className="text-xs text-zinc-500">PDF atau ZIP (Maks. {MAX_SIZE_MB}MB)</p>
        </div>
        <input id="file-upload" type="file" className="hidden" multiple accept=".pdf,.zip,application/pdf,application/zip" onChange={onFileChange} />
      </label>

      {error && <p className="mt-3 text-sm text-danger text-center">{error}</p>}
      
      {selectedFiles.length > 0 && (
        <div className="mt-6 text-left">
          <h4 className="text-base sm:text-lg font-semibold text-text-primary mb-3">File terpilih:</h4>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 bg-background/50 p-3 rounded-lg border border-border">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center space-x-3 bg-surface/60 p-2.5 rounded-md">
                {getFileIcon(file.name)}
                <span className="text-sm text-text-secondary truncate flex-1">{file.name}</span>
                <span className="text-xs text-zinc-500 ml-auto whitespace-nowrap">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}