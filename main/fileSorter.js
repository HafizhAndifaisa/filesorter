const { ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif',
]);

function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function getFileTypeLabel(ext) {
  const types = {
    '.jpg': 'Image', '.jpeg': 'Image', '.png': 'Image', '.gif': 'Image',
    '.webp': 'Image', '.svg': 'Image', '.bmp': 'Image',
    '.mp4': 'Video', '.mov': 'Video', '.avi': 'Video', '.mkv': 'Video', '.webm': 'Video',
    '.mp3': 'Audio', '.wav': 'Audio', '.flac': 'Audio', '.aac': 'Audio', '.ogg': 'Audio',
    '.pdf': 'PDF', '.doc': 'Word', '.docx': 'Word',
    '.xls': 'Excel', '.xlsx': 'Excel',
    '.ppt': 'PowerPoint', '.pptx': 'PowerPoint',
    '.zip': 'Archive', '.rar': 'Archive', '.7z': 'Archive', '.tar': 'Archive', '.gz': 'Archive',
    '.txt': 'Text', '.md': 'Markdown', '.csv': 'CSV',
    '.js': 'JavaScript', '.ts': 'TypeScript', '.jsx': 'React', '.tsx': 'React',
    '.py': 'Python', '.java': 'Java', '.c': 'C', '.cpp': 'C++', '.go': 'Go', '.rs': 'Rust',
    '.html': 'HTML', '.css': 'CSS', '.json': 'JSON', '.xml': 'XML', '.yaml': 'YAML',
    '.dmg': 'Disk Image', '.iso': 'Disk Image',
    '.icns': 'Icon', '.ico': 'Icon', '.png': 'Image',
  };
  return types[ext] || 'File';
}

function setupFileSorter() {
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Folder to Sort',
      buttonLabel: 'Sort This Folder',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true };
    }

    return { canceled: false, folderPath: result.filePaths[0] };
  });

  ipcMain.handle('get-files', (event, folderPath) => {
    try {
      const entries = fs.readdirSync(folderPath, { withFileTypes: true });
      const files = entries
        .filter((entry) => entry.isFile())
        .map((entry) => {
          const filePath = path.join(folderPath, entry.name);
          const ext = getFileExtension(entry.name);
          const stats = fs.statSync(filePath);
          return {
            name: entry.name,
            path: filePath,
            ext,
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            type: getFileTypeLabel(ext),
            isImage: IMAGE_EXTENSIONS.has(ext),
            mtime: stats.mtime,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      return { success: true, folderPath, files };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('move-to-trash', async (event, filePath) => {
    try {
      await shell.trashItem(filePath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-file-thumbnail', (event, filePath) => {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const mimeMap = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
        '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
        '.bmp': 'image/bmp', '.ico': 'image/x-icon', '.tiff': 'image/tiff', '.tif': 'image/tiff',
      };
      const mime = mimeMap[ext] || 'image/png';
      const data = fs.readFileSync(filePath);
      const base64 = data.toString('base64');
      return { success: true, dataUrl: `data:${mime};base64,${base64}` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { setupFileSorter };
