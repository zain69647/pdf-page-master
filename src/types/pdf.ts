export interface PDFPage {
  id: string;
  pageIndex: number;
  sourceFileIndex: number;
  thumbnail: string | null;
  width: number;
  height: number;
  cropBox?: CropBox;
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PDFSource {
  file: File;
  arrayBuffer: ArrayBuffer;
  pageCount: number;
}

export interface HistoryState {
  pages: PDFPage[];
  timestamp: number;
}

export type ActionMode = 'select' | 'reorder' | 'crop' | null;
