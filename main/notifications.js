const { Notification, ipcMain, app } = require('electron');
const path = require('path');

function setupNotifications(mainWindow) {
  ipcMain.handle('request-notification-permission', async () => {
    if (Notification.isSupported()) {
      if (process.platform === 'darwin') {
        return true;
      }
      return true;
    }
    return false;
  });

  ipcMain.handle('show-notification', (event, { title, body, silent = false }) => {
    if (!Notification.isSupported()) {
      return { success: false, error: 'Notifications not supported' };
    }

    const notification = new Notification({
      title,
      body,
      silent,
      icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    });

    notification.on('show', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('notification', {
          type: 'shown',
          title,
          body,
        });
      }
    });

    notification.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('notification', {
          type: 'clicked',
          title,
          body,
        });
        mainWindow.show();
        mainWindow.focus();
      }
    });

    notification.on('close', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('notification', {
          type: 'closed',
          title,
          body,
        });
      }
    });

    notification.show();

    return { success: true };
  });

  ipcMain.handle('notification-supported', () => {
    return Notification.isSupported();
  });
}

module.exports = { setupNotifications };
