import { 
  Trash2, 
  Copy, 
  Download, 
  Undo2, 
  GripVertical,
  CheckSquare,
  XSquare,
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
}: ActionBarProps) {
  return (
    <div className="action-bar animate-slide-up">
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
