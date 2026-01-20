import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Crop, Scissors } from 'lucide-react';
import type { PDFPage } from '@/types/pdf';

interface PageThumbnailProps {
  page: PDFPage;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onCrop: (page: PDFPage) => void;
  isDragMode: boolean;
}

export function PageThumbnail({
  page,
  index,
  isSelected,
  onSelect,
  onCrop,
  isDragMode,
}: PageThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: page.id,
    disabled: !isDragMode,
  });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }), [transform, transition, isDragging]);

  const handleClick = () => {
    if (!isDragMode) {
      onSelect(page.id);
    }
  };

  const handleCropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCrop(page);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDragMode ? { ...attributes, ...listeners } : {})}
      onClick={handleClick}
      className={`thumbnail-card animate-fade-in ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      {/* Thumbnail Image */}
      <div className="aspect-[3/4] bg-card flex items-center justify-center overflow-hidden">
        {page.thumbnail ? (
          <img
            src={page.thumbnail}
            alt={`Page ${index + 1}`}
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="spinner" />
        )}
        
        {/* Crop indicator */}
        {page.cropBox && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warning flex items-center justify-center">
            <Scissors className="w-3 h-3 text-warning-foreground" />
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      {/* Page number badge */}
      <div className="page-badge">
        {index + 1}
      </div>

      {/* Quick crop button */}
      {!isDragMode && (
        <button
          onClick={handleCropClick}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-secondary/80 backdrop-blur-sm flex items-center justify-center hover:bg-secondary transition-colors"
          title="Crop page"
        >
          <Crop className="w-4 h-4 text-foreground" />
        </button>
      )}
    </div>
  );
}
