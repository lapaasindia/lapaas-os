const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Window controls
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // Event listeners
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (event, path) => callback(path));
  },
  
  onQuickCapture: (callback) => {
    ipcRenderer.on('quick-capture', () => callback());
  },
  
  onStartTimer: (callback) => {
    ipcRenderer.on('start-timer', () => callback());
  },
  
  // Platform info
  platform: process.platform,
  isElectron: true
});

// Log that preload script loaded
console.log('Electron preload script loaded');
