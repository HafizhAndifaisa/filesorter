import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import FileSorter from './components/FileSorter';
import './App.css';

function App() {
  const [appInfo, setAppInfo] = useState(null);
  const [theme, setTheme] = useState('light');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sortingMode, setSortingMode] = useState(false);

  useEffect(() => {
    loadAppInfo();
    loadTheme();
    setupEventListeners();
  }, []);

  const loadAppInfo = async () => {
    if (window.electronAPI) {
      const info = await window.electronAPI.getAppInfo();
      setAppInfo(info);
    }
  };

  const loadTheme = async () => {
    if (window.electronAPI) {
      const currentTheme = await window.electronAPI.getTheme();
      setTheme(currentTheme);
    }
  };

  const setupEventListeners = () => {
    if (!window.electronAPI) return;

    window.electronAPI.onUpdateAvailable((info) => {
      setUpdateInfo({ type: 'available', ...info });
    });

    window.electronAPI.onUpdateDownloaded((info) => {
      setUpdateInfo({ type: 'downloaded', ...info });
    });

    window.electronAPI.onUpdateProgress((progress) => {
      setUpdateInfo({ type: 'progress', ...progress });
    });

    window.electronAPI.onNotification((data) => {
      setNotifications((prev) => [...prev, data]);
      setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 5000);
    });

    window.electronAPI.onMenuCommand((command) => {
      handleMenuCommand(command);
    });
  };

  const handleMenuCommand = (command) => {
    switch (command.action) {
      case 'check-updates':
        showNotification('Checking for updates...', 'info');
        break;
      case 'open-files':
        showNotification(`Opened ${command.files.length} file(s)`, 'success');
        break;
      case 'save':
        showNotification('File saved successfully', 'success');
        break;
      default:
        console.log('Menu command:', command);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    if (window.electronAPI) {
      await window.electronAPI.setTheme(newTheme);
    }
    setTheme(newTheme);
    document.body.classList.toggle('dark-mode', newTheme === 'dark');
  };

  const showNotification = (message, type = 'info') => {
    setNotifications((prev) => [...prev, { message, type, id: Date.now() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 5000);
  };

  const handleInstallUpdate = async () => {
    if (window.electronAPI) {
      await window.electronAPI.installUpdate();
    }
  };

  const handleStartSorting = () => {
    setSortingMode(true);
  };

  const handleExitSorting = () => {
    setSortingMode(false);
  };

  return (
    <div className={`app ${theme}`}>
      <header className="app-header">
        <div className="header-left">
          <h1>FileSorter</h1>
          {appInfo && <span className="version">v{appInfo.version}</span>}
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {sortingMode ? (
          <FileSorter onExit={handleExitSorting} />
        ) : (
          <Dashboard
            showNotification={showNotification}
            updateInfo={updateInfo}
            onInstallUpdate={handleInstallUpdate}
            onStartSorting={handleStartSorting}
          />
        )}
      </main>

      <div className="notifications-container">
        {notifications.map((notif, index) => (
          <div key={notif.id || index} className={`notification notification-${notif.type}`}>
            {notif.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
