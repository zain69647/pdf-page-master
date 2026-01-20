import { useRef } from 'react';
import { 
  Trash2, 
  Copy, 
  Download, 
  Undo2, 
  GripVertical,
  CheckSquare,
  XSquare,
  ImagePlus,
} from 'lucide-react';

interface ActionBarProps {
  selectedCount: number;
  totalCount: number;
  canUndo: boolean;
  isDragMode: boolean;
  isExporting: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onUndo: () => void;
  onToggleDragMode: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAddPages?: (files: File[]) => void;
}

export function ActionBar({
  selectedCount,
  totalCount,
  canUndo,
  isDragMode,
  isExporting,
  onDelete,
  onDuplicate,
  onExport,
  onUndo,
  onToggleDragMode,
  onSelectAll,
  onClearSelection,
  onAddPages,
}: ActionBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onAddPages) onAddPages(files);
    e.target.value = '';
  };

  return (
    <div className="action-bar animate-slide-up">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        {/* Left side - selection info / actions */}
        <div className="flex items-center gap-1">
          {selectedCount > 0 ? (
            <>
              <button
                onClick={onClearSelection}
                className="touch-btn-icon"
                title="Clear selection"
              >
                <XSquare className="w-5 h-5" />
              </button>
              <span className="text-sm text-muted-foreground min-w-[60px]">
                {selectedCount} / {totalCount}
              </span>
            </>
          ) : (
            <>
              <button
                onClick={onSelectAll}
                className="touch-btn-icon"
                title="Select all"
                disabled={totalCount === 0}
              >
                <CheckSquare className="w-5 h-5" />
              </button>
              <span className="text-sm text-muted-foreground">
                {totalCount} pages
              </span>
            </>
          )}
        </div>

        {/* Center actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleAddClick}
            className="touch-btn-icon"
            title="Add pages (PDF or images)"
          >
            <ImagePlus className="w-5 h-5 text-primary" />
          </button>

          <button
            onClick={onToggleDragMode}
            className={`touch-btn-icon ${isDragMode ? 'bg-primary text-primary-foreground' : ''}`}
            title={isDragMode ? 'Exit reorder mode' : 'Reorder pages'}
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <button
            onClick={onDelete}
            className="touch-btn-icon"
            disabled={selectedCount === 0}
            title="Delete selected"
          >
            <Trash2 className={`w-5 h-5 ${selectedCount > 0 ? 'text-destructive' : ''}`} />
          </button>

          <button
            onClick={onDuplicate}
            className="touch-btn-icon"
            disabled={selectedCount === 0}
            title="Duplicate selected"
          >
            <Copy className="w-5 h-5" />
          </button>

          <button
            onClick={onUndo}
            className="touch-btn-icon"
            disabled={!canUndo}
            title="Undo"
          >
            <Undo2 className="w-5 h-5" />
          </button>
        </div>

        {/* Right side - Export */}
        <button
          onClick={onExport}
          disabled={totalCount === 0 || isExporting}
          className="touch-btn-primary"
        >
          {isExporting ? (
            <div className="spinner w-5 h-5" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
}
