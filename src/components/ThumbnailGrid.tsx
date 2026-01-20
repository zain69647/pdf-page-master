import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { PageThumbnail } from './PageThumbnail';
import type { PDFPage } from '@/types/pdf';

interface ThumbnailGridProps {
  pages: PDFPage[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onCrop: (page: PDFPage) => void;
  isDragMode: boolean;
}

export function ThumbnailGrid({
  pages,
  selectedIds,
  onSelect,
  onReorder,
  onCrop,
  isDragMode,
}: ThumbnailGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
        <div className="grid-thumbs p-4 pb-0">
          {pages.map((page, index) => (
            <PageThumbnail
              key={page.id}
              page={page}
              index={index}
              isSelected={selectedIds.has(page.id)}
              onSelect={onSelect}
              onCrop={onCrop}
              isDragMode={isDragMode}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
