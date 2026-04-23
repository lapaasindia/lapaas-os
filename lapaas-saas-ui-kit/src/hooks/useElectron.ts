import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    // Check if running in Electron
    const electronAPI = window.electronAPI;
    if (electronAPI?.isElectron) {
      setIsElectron(true);
      setPlatform(electronAPI.platform);
      
      // Get app version
      electronAPI.getAppVersion().then(setAppVersion);
    }
  }, []);

  const minimizeToTray = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.minimizeToTray();
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if (window.electronAPI) {
      window.electronAPI.showNotification(title, body);
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, []);

  return {
    isElectron,
    appVersion,
    platform,
    minimizeToTray,
    showNotification
  };
}

// Hook to handle Electron navigation events
export function useElectronNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onNavigate((path) => {
        navigate(path);
      });
    }
  }, [navigate]);
}

// Hook to handle Electron quick capture
export function useElectronQuickCapture(onCapture: () => void) {
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onQuickCapture(onCapture);
    }
  }, [onCapture]);
}

// Hook to handle Electron timer events
export function useElectronTimer(onStartTimer: () => void) {
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onStartTimer(onStartTimer);
    }
  }, [onStartTimer]);
}

export default useElectron;
