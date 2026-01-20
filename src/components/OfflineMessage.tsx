import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineMessage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-50">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
          <WifiOff className="w-8 h-8 text-warning" />
        </div>
        
        <h1 className="text-xl font-semibold text-foreground mb-2">
          You're Offline
        </h1>
        
        <p className="text-muted-foreground mb-6">
          The app needs to load for the first time while online. Please check your internet connection and try again.
        </p>

        <button
          onClick={handleRefresh}
          className="touch-btn-primary mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
}
