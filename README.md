# FileSorter

A macOS desktop application for sorting files one by one. Select a folder, review each file, and decide to keep or delete it to trash.

## Tech Stack

- **Electron 33** — Desktop application shell
- **React 18** — UI framework
- **Vite 6** — Build tool and dev server
- **electron-builder 25** — Packaging and distribution

## Features

- **File Sorting** — Select a folder, review files one by one, keep or delete to trash
- **Image Preview** — Thumbnail preview for image files (JPEG, PNG, GIF, WebP, SVG, BMP)
- **Image Zoom** — Click image to view in full-screen overlay
- **Keyboard Shortcuts** — Arrow keys for keep/delete, ESC to cancel
- **Dark/Light Theme** — Toggle between themes
- **Auto Update** — Check for updates via GitHub releases
- **Native Notifications** — OS-level notification support

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd filesorter

# Install dependencies
npm install
```

## Development

```bash
# Start development server (Vite + Electron)
npm start
```

This will start the Vite dev server on `localhost:5173` and launch Electron.

## Build

```bash
# Build for macOS (dmg + zip)
npm run build
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` | Keep file |
| `←` | Delete file to trash |
| `Space` / `Enter` | Keep file |
| `Delete` / `Backspace` | Delete file to trash |
| `Escape` | Cancel sorting / Close zoom |

## Project Structure

```
filesorter/
├── main/                    # Electron main process
│   ├── main.js              # Entry point, window creation, IPC
│   ├── preload.js           # Context bridge (electronAPI)
│   ├── fileSorter.js        # File sorting IPC handlers
│   ├── menu.js              # Native macOS menu
│   ├── notifications.js     # OS notification handlers
│   └── updater.js           # Auto-update system
├── src/                     # React renderer
│   ├── index.jsx            # React entry point
│   ├── App.jsx              # Root component, state management
│   ├── App.css              # Component styles
│   ├── index.css            # Global styles, CSS variables
│   └── components/
│       ├── Dashboard.jsx    # Main dashboard UI
│       └── FileSorter.jsx   # File sorting UI
├── assets/                  # App icons and assets
├── package.json             # Project config
└── vite.config.js           # Vite bundler config
```

## License

MIT
