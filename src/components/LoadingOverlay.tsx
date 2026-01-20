interface LoadingOverlayProps {
  message: string;
  progress?: number;
}

export function LoadingOverlay({ message, progress }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-card rounded-xl p-6 max-w-[280px] w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8" />
          <p className="text-center text-foreground font-medium">{message}</p>
          
          {progress !== undefined && (
            <div className="w-full">
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {progress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
