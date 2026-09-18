const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const { createMenu } = require('./menu');
const { initUpdater } = require('./updater');
const { setupNotifications } = require('./notifications');
const { setupFileSorter } = require('./fileSorter');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#ffffff',
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createMenu();
  createWindow();
  initUpdater(mainWindow);
  setupNotifications(mainWindow);
  setupFileSorter();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-app-info', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
  };
});

ipcMain.handle('get-theme', () => {
  return nativeTheme.themeSource;
});

ipcMain.handle('set-theme', (event, theme) => {
  nativeTheme.themeSource = theme;
  return nativeTheme.themeSource;
});

module.exports = { mainWindow };
