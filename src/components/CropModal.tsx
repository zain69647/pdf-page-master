import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import type { PDFPage, CropBox } from '@/types/pdf';

interface CropModalProps {
  page: PDFPage;
  onApply: (pageId: string, cropBox: CropBox) => void;
  onClose: () => void;
}

export function CropModal({ page, onApply, onClose }: CropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cropBox, setCropBox] = useState<CropBox>(
    page.cropBox || { x: 0, y: 0, width: page.width, height: page.height }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startBox, setStartBox] = useState<CropBox | null>(null);

  // Scale factor for display
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 32;
      const containerHeight = containerRef.current.clientHeight - 32;
      const scaleX = containerWidth / page.width;
      const scaleY = containerHeight / page.height;
      setScale(Math.min(scaleX, scaleY, 1));
    }
  }, [page.width, page.height]);

  const handlePointerDown = useCallback((e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartBox({ ...cropBox });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [cropBox]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !startBox || !dragHandle) return;

    const dx = (e.clientX - startPos.x) / scale;
    const dy = (e.clientY - startPos.y) / scale;

    let newBox = { ...startBox };

    if (dragHandle === 'move') {
      newBox.x = Math.max(0, Math.min(page.width - startBox.width, startBox.x + dx));
      newBox.y = Math.max(0, Math.min(page.height - startBox.height, startBox.y + dy));
    } else {
      // Handle edge dragging
      if (dragHandle.includes('n')) {
        const newY = Math.max(0, Math.min(startBox.y + startBox.height - 50, startBox.y + dy));
        newBox.height = startBox.height - (newY - startBox.y);
        newBox.y = newY;
      }
      if (dragHandle.includes('s')) {
        newBox.height = Math.max(50, Math.min(page.height - startBox.y, startBox.height + dy));
      }
      if (dragHandle.includes('w')) {
        const newX = Math.max(0, Math.min(startBox.x + startBox.width - 50, startBox.x + dx));
        newBox.width = startBox.width - (newX - startBox.x);
        newBox.x = newX;
      }
      if (dragHandle.includes('e')) {
        newBox.width = Math.max(50, Math.min(page.width - startBox.x, startBox.width + dx));
      }
    }

    setCropBox(newBox);
  }, [isDragging, startBox, dragHandle, startPos, scale, page.width, page.height]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
    setStartBox(null);
  }, []);

  const handleReset = () => {
    setCropBox({ x: 0, y: 0, width: page.width, height: page.height });
  };

  const handleApply = () => {
    onApply(page.id, cropBox);
    onClose();
  };

  const displayWidth = page.width * scale;
  const displayHeight = page.height * scale;

  return (
    <div className="crop-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="bg-card rounded-xl max-w-[95vw] max-h-[90vh] flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Crop Page</h2>
          <button onClick={onClose} className="touch-btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop area */}
        <div 
          ref={containerRef}
          className="flex-1 p-4 flex items-center justify-center min-h-[300px] overflow-hidden"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div 
            className="relative bg-muted rounded overflow-hidden"
            style={{ width: displayWidth, height: displayHeight }}
          >
            {/* Page image */}
            {page.thumbnail && (
              <img
                src={page.thumbnail}
                alt="Page preview"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            )}

            {/* Dark overlay outside crop */}
            <div className="absolute inset-0 bg-background/70 pointer-events-none" />

            {/* Crop box */}
            <div
              className="absolute border-2 border-primary cursor-move"
              style={{
                left: cropBox.x * scale,
                top: cropBox.y * scale,
                width: cropBox.width * scale,
                height: cropBox.height * scale,
              }}
              onPointerDown={(e) => handlePointerDown(e, 'move')}
            >
              {/* Clear window showing the cropped area */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ 
                  clipPath: 'inset(0)',
                }}
              >
                {page.thumbnail && (
                  <img
                    src={page.thumbnail}
                    alt=""
                    className="absolute object-contain pointer-events-none"
                    style={{
                      width: displayWidth,
                      height: displayHeight,
                      left: -cropBox.x * scale,
                      top: -cropBox.y * scale,
                    }}
                    draggable={false}
                  />
                )}
              </div>

              {/* Corner handles */}
              {['nw', 'ne', 'sw', 'se'].map(corner => (
                <div
                  key={corner}
                  className="absolute w-6 h-6 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 touch-none"
                  style={{
                    left: corner.includes('e') ? '100%' : 0,
                    top: corner.includes('s') ? '100%' : 0,
                    cursor: `${corner}-resize`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, corner)}
                />
              ))}

              {/* Edge handles */}
              {['n', 's', 'e', 'w'].map(edge => (
                <div
                  key={edge}
                  className="absolute bg-primary/50 touch-none"
                  style={{
                    left: edge === 'w' ? 0 : edge === 'e' ? '100%' : '50%',
                    top: edge === 'n' ? 0 : edge === 's' ? '100%' : '50%',
                    width: edge === 'n' || edge === 's' ? '40%' : 4,
                    height: edge === 'e' || edge === 'w' ? '40%' : 4,
                    transform: `translate(${edge === 'e' ? '-100%' : edge === 'w' ? 0 : '-50%'}, ${edge === 's' ? '-100%' : edge === 'n' ? 0 : '-50%'})`,
                    cursor: `${edge === 'n' || edge === 's' ? 'ns' : 'ew'}-resize`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, edge)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button onClick={handleReset} className="touch-btn-secondary flex-1">
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
          <button onClick={handleApply} className="touch-btn-primary flex-1">
            <Check className="w-5 h-5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
}
