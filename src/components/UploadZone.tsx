import { useCallback, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
  hasPages: boolean;
}

export function UploadZone({ onFilesSelected, isLoading, hasPages }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFilesSelected(Array.from(files));
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.add('active');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.remove('active');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.remove('active');
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  if (hasPages) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="touch-btn-secondary w-full"
      >
        <Upload className="w-5 h-5" />
        <span>Add More PDFs</span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </button>
    );
  }

  return (
    <div
      ref={dropRef}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="drop-zone flex flex-col items-center justify-center gap-4 p-8 min-h-[280px] cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <FileText className="w-8 h-8 text-primary" />
      </div>
      
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Upload PDF Files
        </h2>
        <p className="text-sm text-muted-foreground">
          Tap to select or drag & drop
        </p>
      </div>

      <button
        disabled={isLoading}
        className="touch-btn-primary"
      >
        <Upload className="w-5 h-5" />
        <span>Select PDFs</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
