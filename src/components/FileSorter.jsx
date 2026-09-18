import React, { useState, useEffect, useCallback } from 'react';

function FileIcon({ ext }) {
  const iconMap = {
    '.pdf': '📄', '.doc': '📝', '.docx': '📝', '.txt': '📝', '.md': '📝', '.csv': '📝',
    '.xls': '📊', '.xlsx': '📊', '.ppt': '📑', '.pptx': '📑',
    '.mp4': '🎬', '.mov': '🎬', '.avi': '🎬', '.mkv': '🎬', '.webm': '🎬',
    '.mp3': '🎵', '.wav': '🎵', '.flac': '🎵', '.aac': '🎵', '.ogg': '🎵',
    '.zip': '📦', '.rar': '📦', '.7z': '📦', '.tar': '📦', '.gz': '📦',
    '.js': '🟨', '.ts': '🟦', '.jsx': '⚛️', '.tsx': '⚛️',
    '.py': '🐍', '.java': '☕', '.go': '🔹', '.rs': '🦀',
    '.html': '🌐', '.css': '🎨', '.json': '📋', '.xml': '📋', '.yaml': '📋',
    '.dmg': '💿', '.iso': '💿',
  };
  return <span className="file-icon">{iconMap[ext] || '📄'}</span>;
}

function FileSorter({ onExit }) {
  const [view, setView] = useState('idle');
  const [folderPath, setFolderPath] = useState('');
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [kept, setKept] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  const currentFile = files[currentIndex];
  const totalFiles = files.length;
  const progress = totalFiles > 0 ? ((currentIndex + 1) / totalFiles) * 100 : 0;

  const handleSelectFolder = useCallback(async () => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return;
    }
    const result = await window.electronAPI.selectFolder();
    if (result.canceled) return;

    setLoading(true);
    setError(null);
    const fileResult = await window.electronAPI.getFiles(result.folderPath);
    setLoading(false);

    if (!fileResult.success) {
      setError(fileResult.error);
      return;
    }

    if (fileResult.files.length === 0) {
      setError('No files found in this folder');
      return;
    }

    setFolderPath(fileResult.folderPath);
    setFiles(fileResult.files);
    setCurrentIndex(0);
    setKept([]);
    setDeleted([]);
    setView('sorting');
  }, []);

  const handleKeep = useCallback(() => {
    if (view !== 'sorting' || !currentFile) return;
    setKept((prev) => [...prev, currentFile]);
    if (currentIndex + 1 >= totalFiles) {
      setView('complete');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [view, currentFile, currentIndex, totalFiles]);

  const handleDelete = useCallback(async () => {
    if (view !== 'sorting' || !currentFile) return;
    if (window.electronAPI) {
      await window.electronAPI.moveToTrash(currentFile.path);
    }
    setDeleted((prev) => [...prev, currentFile]);
    if (currentIndex + 1 >= totalFiles) {
      setView('complete');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [view, currentFile, currentIndex, totalFiles]);

  const handleCancel = useCallback(() => {
    setView('idle');
    setFolderPath('');
    setFiles([]);
    setCurrentIndex(0);
    setKept([]);
    setDeleted([]);
    setError(null);
    if (onExit) onExit();
  }, [onExit]);

  const handleSortAnother = useCallback(() => {
    setView('idle');
    setFolderPath('');
    setFiles([]);
    setCurrentIndex(0);
    setKept([]);
    setDeleted([]);
    setError(null);
    setThumbnailUrl(null);
    setZoomOpen(false);
  }, []);

  const openZoom = useCallback(() => {
    if (thumbnailUrl) setZoomOpen(true);
  }, [thumbnailUrl]);

  const closeZoom = useCallback(() => {
    setZoomOpen(false);
  }, []);

  useEffect(() => {
    if (view !== 'sorting' || !currentFile || !currentFile.isImage) {
      setThumbnailUrl(null);
      return;
    }
    let cancelled = false;
    const loadThumbnail = async () => {
      if (!window.electronAPI) return;
      const result = await window.electronAPI.getFileThumbnail(currentFile.path);
      if (!cancelled && result.success) {
        setThumbnailUrl(result.dataUrl);
      }
    };
    loadThumbnail();
    return () => { cancelled = true; };
  }, [view, currentFile]);

  useEffect(() => {
    if (view !== 'sorting') return;

    const handleKeyDown = (e) => {
      if (zoomOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeZoom();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleKeep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleDelete();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleKeep();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleDelete();
          break;
        case 'Escape':
          e.preventDefault();
          handleCancel();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, zoomOpen, handleKeep, handleDelete, handleCancel, closeZoom]);

  if (view === 'idle') {
    return (
      <div className="file-sorter">
        <div className="file-sorter-idle">
          <div className="idle-icon">📂</div>
          <h2>File Sorter</h2>
          <p>Select a folder to start sorting files. You'll review each file one by one and choose to keep or delete it.</p>
          <button className="select-folder-btn" onClick={handleSelectFolder} disabled={loading}>
            {loading ? 'Loading...' : 'Select Folder'}
          </button>
          {error && <div className="sorter-error">{error}</div>}
        </div>
      </div>
    );
  }

  if (view === 'complete') {
    return (
      <div className="file-sorter">
        <div className="file-sorter-complete">
          <div className="complete-icon">✅</div>
          <h2>Sorting Complete!</h2>
          <p className="folder-path">{folderPath}</p>
          <div className="summary">
            <div className="summary-item">
              <span className="summary-number">{totalFiles}</span>
              <span className="summary-label">Total Files</span>
            </div>
            <div className="summary-item kept">
              <span className="summary-number">{kept.length}</span>
              <span className="summary-label">Kept</span>
            </div>
            <div className="summary-item deleted">
              <span className="summary-number">{deleted.length}</span>
              <span className="summary-label">Deleted</span>
            </div>
          </div>
          <div className="complete-actions">
            <button className="sort-another-btn" onClick={handleSortAnother}>
              Sort Another Folder
            </button>
            <button className="back-btn" onClick={handleCancel}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="file-sorter">
      <div className="sorter-header">
        <div className="sorter-info">
          <span className="folder-name">{folderPath}</span>
          <span className="file-counter">{currentIndex + 1} / {totalFiles}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="file-preview-area">
        {currentFile?.isImage ? (
          thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={currentFile.name}
              className="file-thumbnail clickable"
              onClick={openZoom}
            />
          ) : (
            <div className="file-icon-large">
              <FileIcon ext={currentFile?.ext} />
            </div>
          )
        ) : (
          <div className="file-icon-large">
            <FileIcon ext={currentFile?.ext} />
          </div>
        )}
      </div>

      <div className="file-details">
        <h3 className="file-name">{currentFile?.name}</h3>
        <div className="file-meta">
          <span>{currentFile?.type}</span>
          <span className="meta-separator">·</span>
          <span>{currentFile?.sizeFormatted}</span>
        </div>
      </div>

      <div className="file-actions">
        <button className="action-btn delete" onClick={handleDelete} title="Delete (←)">
          <span className="action-icon">✕</span>
          <span className="action-label">Delete</span>
          <span className="action-key">←</span>
        </button>
        <button className="action-btn keep" onClick={handleKeep} title="Keep (→)">
          <span className="action-icon">✓</span>
          <span className="action-label">Keep</span>
          <span className="action-key">→</span>
        </button>
      </div>

      <div className="sorter-hints">
        <span>← Delete</span>
        <span>→ Keep</span>
        <span>Click image to zoom</span>
        <span>ESC Cancel</span>
      </div>

      {zoomOpen && thumbnailUrl && (
        <div className="zoom-overlay" onClick={closeZoom}>
          <button className="zoom-close" onClick={closeZoom}>✕</button>
          <img
            src={thumbnailUrl}
            alt={currentFile.name}
            className="zoom-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default FileSorter;
