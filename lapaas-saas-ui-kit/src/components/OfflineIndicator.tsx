import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { syncManager } from '../services/syncManager';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setShowReconnected(true);
      setIsSyncing(true);
      
      // Sync pending changes
      await syncManager.syncAll();
      const count = await syncManager.getPendingCount();
      setPendingSync(count);
      setIsSyncing(false);
      
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    // Check pending sync count periodically
    const checkPending = async () => {
      const count = await syncManager.getPendingCount();
      setPendingSync(count);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const interval = setInterval(checkPending, 5000);
    checkPending();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && !showReconnected && pendingSync === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium transition-all duration-300 ${
        isOnline
          ? pendingSync > 0 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          : 'bg-yellow-600 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          isSyncing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Syncing your changes...</span>
            </>
          ) : pendingSync > 0 ? (
            <>
              <RefreshCw size={16} />
              <span>{pendingSync} changes pending sync</span>
            </>
          ) : (
            <>
              <Wifi size={16} />
              <span>Back online! All changes synced.</span>
            </>
          )
        ) : (
          <>
            <WifiOff size={16} />
            <span>You're offline. Changes will sync when back online.</span>
            {pendingSync > 0 && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded">{pendingSync} pending</span>}
          </>
        )}
      </div>
    </div>
  );
}
