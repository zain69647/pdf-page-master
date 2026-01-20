import { AlertCircle, X } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in">
      <div className="bg-destructive text-destructive-foreground rounded-lg p-4 flex items-start gap-3 shadow-lg max-w-md mx-auto">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm">{message}</p>
        <button
          onClick={onDismiss}
          className="touch-btn-icon w-8 h-8 min-h-[32px] min-w-[32px] -mr-2 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
