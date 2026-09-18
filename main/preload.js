const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),

  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  requestNotificationPermission: () => ipcRenderer.invoke('request-notification-permission'),
  notificationSupported: () => ipcRenderer.invoke('notification-supported'),

  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getFiles: (folderPath) => ipcRenderer.invoke('get-files', folderPath),
  moveToTrash: (filePath) => ipcRenderer.invoke('move-to-trash', filePath),
  getFileThumbnail: (filePath) => ipcRenderer.invoke('get-file-thumbnail', filePath),

  onNotification: (callback) => {
    ipcRenderer.on('notification', (event, data) => callback(data));
  },

  onMenuCommand: (callback) => {
    ipcRenderer.on('menu-command', (event, command) => callback(command));
  },

  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },

  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (event, info) => callback(info));
  },

  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-progress', (event, progress) => callback(progress));
  },

  installUpdate: () => ipcRenderer.invoke('install-update'),
});
