// Type declarations for Electron API exposed via preload script

interface ElectronAPI {
  // App info
  getAppVersion: () => Promise<string>;
  
  // Window controls
  minimizeToTray: () => Promise<void>;
  
  // Notifications
  showNotification: (title: string, body: string) => Promise<void>;
  
  // Event listeners
  onNavigate: (callback: (path: string) => void) => void;
  onQuickCapture: (callback: () => void) => void;
  onStartTimer: (callback: () => void) => void;
  
  // Platform info
  platform: 'darwin' | 'win32' | 'linux';
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
