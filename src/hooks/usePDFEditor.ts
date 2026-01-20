import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFPage, PDFSource, CropBox, HistoryState } from '@/types/pdf';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const generateId = () => Math.random().toString(36).substring(2, 11);

const MAX_HISTORY = 20;

export function usePDFEditor() {
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [sources, setSources] = useState<PDFSource[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef(-1);

  // Save state to history
  const saveToHistory = useCallback((newPages: PDFPage[]) => {
    const newState: HistoryState = {
      pages: JSON.parse(JSON.stringify(newPages)),
      timestamp: Date.now(),
    };
    
    // Remove future states if we're not at the end
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(newState);
    
    // Limit history size
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }
  }, []);

  // Render thumbnail for a page
  const renderThumbnail = useCallback(async (
    arrayBuffer: ArrayBuffer,
    pageNum: number,
    scale: number = 0.3
  ): Promise<{ dataUrl: string; width: number; height: number }> => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    
    // Clean up
    page.cleanup();
    pdf.destroy();
    
    return { dataUrl, width: viewport.width / scale, height: viewport.height / scale };
  }, []);

  // Load PDF files
  const loadPDFs = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      const pdfFiles = files.filter(f => f.type === 'application/pdf');
      
      if (pdfFiles.length === 0) {
        throw new Error('Please select valid PDF files');
      }

      const newSources: PDFSource[] = [];
      const newPages: PDFPage[] = [];
      let totalPages = 0;
      let processedPages = 0;

      // First pass: count total pages
      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        totalPages += pdfDoc.getPageCount();
        newSources.push({
          file,
          arrayBuffer,
          pageCount: pdfDoc.getPageCount(),
        });
      }

      if (totalPages === 0) {
        throw new Error('The selected PDF(s) have no pages');
      }

      // Second pass: create pages with thumbnails
      for (let sourceIdx = 0; sourceIdx < newSources.length; sourceIdx++) {
        const source = newSources[sourceIdx];
        
        for (let pageIdx = 0; pageIdx < source.pageCount; pageIdx++) {
          const { dataUrl, width, height } = await renderThumbnail(
            source.arrayBuffer,
            pageIdx + 1
          );
          
          newPages.push({
            id: generateId(),
            pageIndex: pageIdx,
            sourceFileIndex: sources.length + sourceIdx,
            thumbnail: dataUrl,
            width,
            height,
          });
          
          processedPages++;
          setLoadingProgress(Math.round((processedPages / totalPages) * 100));
        }
      }

      setSources(prev => [...prev, ...newSources]);
      setPages(prev => {
        const updated = [...prev, ...newPages];
        saveToHistory(updated);
        return updated;
      });
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  }, [sources.length, renderThumbnail, saveToHistory]);

  // Reorder pages
  const reorderPages = useCallback((activeId: string, overId: string) => {
    setPages(prev => {
      const oldIndex = prev.findIndex(p => p.id === activeId);
      const newIndex = prev.findIndex(p => p.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const updated = [...prev];
      const [removed] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, removed);
      
      saveToHistory(updated);
      return updated;
    });
  }, [saveToHistory]);

  // Delete selected pages
  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    
    setPages(prev => {
      const updated = prev.filter(p => !selectedIds.has(p.id));
      saveToHistory(updated);
      return updated;
    });
    setSelectedIds(new Set());
  }, [selectedIds, saveToHistory]);

  // Duplicate selected pages
  const duplicateSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    
    setPages(prev => {
      const updated = [...prev];
      const selectedPages = prev.filter(p => selectedIds.has(p.id));
      
      // Find last selected index to insert after
      let lastSelectedIdx = -1;
      prev.forEach((p, idx) => {
        if (selectedIds.has(p.id)) lastSelectedIdx = idx;
      });
      
      const duplicates = selectedPages.map(p => ({
        ...p,
        id: generateId(),
        cropBox: p.cropBox ? { ...p.cropBox } : undefined,
      }));
      
      updated.splice(lastSelectedIdx + 1, 0, ...duplicates);
      saveToHistory(updated);
      return updated;
    });
    setSelectedIds(new Set());
  }, [selectedIds, saveToHistory]);

  // Apply crop to a page
  const applyCrop = useCallback((pageId: string, cropBox: CropBox) => {
    setPages(prev => {
      const updated = prev.map(p => 
        p.id === pageId ? { ...p, cropBox } : p
      );
      saveToHistory(updated);
      return updated;
    });
    setSelectedIds(new Set());
  }, [saveToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const state = historyRef.current[historyIndexRef.current];
      setPages(state.pages);
      setSelectedIds(new Set());
    }
  }, []);

  // Check if can undo
  const canUndo = historyIndexRef.current > 0;

  // Toggle page selection
  const toggleSelection = useCallback((pageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  }, []);

  // Select all
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(pages.map(p => p.id)));
  }, [pages]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Export PDF
  const exportPDF = useCallback(async (): Promise<string> => {
    if (pages.length === 0) {
      throw new Error('No pages to export');
    }

    setIsLoading(true);
    setError(null);

    try {
      const outputDoc = await PDFDocument.create();

      for (const page of pages) {
        const source = sources[page.sourceFileIndex];
        if (!source) continue;

        const srcDoc = await PDFDocument.load(source.arrayBuffer);
        const [copiedPage] = await outputDoc.copyPages(srcDoc, [page.pageIndex]);

        if (page.cropBox) {
          const { x, y, width, height } = page.cropBox;
          // PDF coordinates are from bottom-left
          const pdfHeight = copiedPage.getHeight();
          copiedPage.setCropBox(x, pdfHeight - y - height, width, height);
          copiedPage.setMediaBox(x, pdfHeight - y - height, width, height);
        }

        outputDoc.addPage(copiedPage);
      }

      const pdfBytes = await outputDoc.save();
      
      // Convert to base64 for WebView compatibility
      const base64 = btoa(
        new Uint8Array(pdfBytes).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      return `data:application/pdf;base64,${base64}`;
    } finally {
      setIsLoading(false);
    }
  }, [pages, sources]);

  // Clear all
  const clearAll = useCallback(() => {
    setPages([]);
    setSources([]);
    setSelectedIds(new Set());
    historyRef.current = [];
    historyIndexRef.current = -1;
  }, []);

  return {
    pages,
    sources,
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
  };
}
