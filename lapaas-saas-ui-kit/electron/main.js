const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeImage, shell } = require('electron');
const path = require('path');

// Keep references to prevent garbage collection
let mainWindow = null;
let tray = null;
let isQuitting = false;

// Check if running in development
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Lapaas OS',
    icon: path.join(__dirname, '../public/icons/icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset', // macOS style
    backgroundColor: '#0f172a',
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5174');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close - minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  // Create tray icon - use PNG for better compatibility
  const iconPath = path.join(__dirname, '../public/icons/icon-32.png');
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // Fallback: try 16px icon
      const fallbackPath = path.join(__dirname, '../public/icons/icon-16.png');
      trayIcon = nativeImage.createFromPath(fallbackPath);
    }
    // Resize for tray (16x16 on most platforms, 22x22 on some Linux)
    trayIcon = trayIcon.resize({ width: 16, height: 16 });
  } catch (e) {
    console.error('Failed to load tray icon:', e);
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Lapaas OS');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Lapaas OS',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'My Week',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', '/founder-os?tab=overview');
        }
      }
    },
    {
      label: 'Meetings',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', '/founder-os?tab=meetings');
        }
      }
    },
    {
      label: 'Requests',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', '/founder-os?tab=firewall');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Start Focus Timer',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('start-timer');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Double-click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function registerShortcuts() {
  // Global shortcut to show/hide app
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // Quick capture shortcut
  globalShortcut.register('CommandOrControl+Shift+N', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send('quick-capture');
    }
  });

  // Start timer shortcut
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (mainWindow) {
      mainWindow.webContents.send('start-timer');
    }
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('show-notification', (event, { title, body }) => {
  const { Notification } = require('electron');
  new Notification({ title, body }).show();
});
