import React from 'react';

function Dashboard({ showNotification, updateInfo, onInstallUpdate, onStartSorting }) {
  const handleSendNotification = () => {
    if (window.electronAPI) {
      window.electronAPI.showNotification({
        title: 'FileSorter',
        body: 'This is a test notification!',
        silent: false,
      });
      showNotification('Notification sent!', 'success');
    } else {
      showNotification('Notifications require Electron runtime', 'error');
    }
  };

  const handleCheckUpdates = async () => {
    if (window.electronAPI) {
      showNotification('Checking for updates...', 'info');
    } else {
      showNotification('Auto-updater requires Electron runtime', 'error');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome to FileSorter</h2>
        <p>A production-ready Electron application with React</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-icon">📁</div>
          <h3>File Management</h3>
          <p>Organize and sort your files efficiently</p>
          <button className="card-button" onClick={onStartSorting}>
            Open Files
          </button>
        </div>

        <div className="card">
          <div className="card-icon">🔔</div>
          <h3>Notifications</h3>
          <p>Test the notification system</p>
          <button className="card-button" onClick={handleSendNotification}>
            Send Test
          </button>
        </div>

        <div className="card">
          <div className="card-icon">🔄</div>
          <h3>Auto Update</h3>
          <p>{updateInfo?.type === 'available' ? `Update v${updateInfo.version} available!` : 'Check for updates'}</p>
          {updateInfo?.type === 'downloaded' ? (
            <button className="card-button primary" onClick={onInstallUpdate}>
              Install Update
            </button>
          ) : (
            <button className="card-button" onClick={handleCheckUpdates}>
              Check Updates
            </button>
          )}
        </div>

        <div className="card">
          <div className="card-icon">⚙️</div>
          <h3>Settings</h3>
          <p>Configure application preferences</p>
          <button className="card-button" onClick={() => showNotification('Settings coming soon!', 'info')}>
            Open Settings
          </button>
        </div>
      </div>

      <div className="status-bar">
        <span className="status-item">
          Platform: {window.electronAPI ? 'Electron' : 'Web Browser'}
        </span>
        <span className="status-item">
          Status: Ready
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
