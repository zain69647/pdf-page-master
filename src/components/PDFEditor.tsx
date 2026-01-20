import { useState, useCallback, useEffect } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { usePDFEditor } from '@/hooks/usePDFEditor';
import { UploadZone } from '@/components/UploadZone';
import { ThumbnailGrid } from '@/components/ThumbnailGrid';
import { ActionBar } from '@/components/ActionBar';
import { CropModal } from '@/components/CropModal';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ErrorToast } from '@/components/ErrorToast';
import type { PDFPage } from '@/types/pdf';

export function PDFEditor() {
  const {
    pages,
    selectedIds,
    isLoading,
    loadingProgress,
    error,
    canUndo,
    loadPDFs,
    reorderPages,
    deleteSelected,
    duplicateSelected,
    applyCrop,
    undo,
    toggleSelection,
    selectAll,
    clearSelection,
    exportPDF,
    clearAll,
    setError,
  } = usePDFEditor();

  const [isDragMode, setIsDragMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cropPage, setCropPage] = useState<PDFPage | null>(null);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const dataUrl = await exportPDF();
      
      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `edited-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [exportPDF, setError]);

  const handleCrop = useCallback((page: PDFPage) => {
    setCropPage(page);
  }, []);

  const handleCropApply = useCallback((pageId: string, cropBox: any) => {
    applyCrop(pageId, cropBox);
  }, [applyCrop]);

  const toggleDragMode = useCallback(() => {
    setIsDragMode(prev => !prev);
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">PDF Editor</h1>
          </div>

          {pages.length > 0 && (
            <button
              onClick={clearAll}
              className="touch-btn-ghost text-destructive"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 safe-bottom">
        {pages.length === 0 ? (
          <div className="p-4">
            <UploadZone
              onFilesSelected={loadPDFs}
              isLoading={isLoading}
              hasPages={false}
            />

            {/* Instructions */}
            <div className="mt-6 text-center text-muted-foreground text-sm space-y-2">
              <p>Upload PDF files to edit pages</p>
              <p>Works completely offline after first load</p>
            </div>
          </div>
        ) : (
          <>
            {/* Upload more button */}
            <div className="p-4 pb-0">
              <UploadZone
                onFilesSelected={loadPDFs}
                isLoading={isLoading}
                hasPages={true}
              />
            </div>

            {/* Mode indicator */}
            {isDragMode && (
              <div className="mx-4 mt-3 p-2 bg-primary/10 border border-primary/30 rounded-lg text-center text-sm text-primary">
                Drag pages to reorder • Tap done when finished
              </div>
            )}

            {/* Thumbnail grid */}
            <ThumbnailGrid
              pages={pages}
              selectedIds={selectedIds}
              onSelect={toggleSelection}
              onReorder={reorderPages}
              onCrop={handleCrop}
              isDragMode={isDragMode}
            />
          </>
        )}
      </main>

      {/* Action bar */}
      {pages.length > 0 && (
        <ActionBar
          selectedCount={selectedIds.size}
          totalCount={pages.length}
          canUndo={canUndo}
          isDragMode={isDragMode}
          isExporting={isExporting}
          onDelete={deleteSelected}
          onDuplicate={duplicateSelected}
          onExport={handleExport}
          onUndo={undo}
          onToggleDragMode={toggleDragMode}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
        />
      )}

      {/* Crop modal */}
      {cropPage && (
        <CropModal
          page={cropPage}
          onApply={handleCropApply}
          onClose={() => setCropPage(null)}
        />
      )}

      {/* Loading overlay */}
      {isLoading && !isExporting && (
        <LoadingOverlay
          message="Loading PDF..."
          progress={loadingProgress > 0 ? loadingProgress : undefined}
        />
      )}

      {isExporting && (
        <LoadingOverlay message="Preparing download..." />
      )}

      {/* Error toast */}
      {error && (
        <ErrorToast
          message={error}
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
}
