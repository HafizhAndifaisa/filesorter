# AGENTS.md — Codebase Guide for AI Agents

## Overview

FileSorter is an Electron + React desktop app for macOS that lets users sort files one by one from a selected folder, choosing to keep or delete each file to trash.

## Architecture

```
┌─────────────────────────────────────────────┐
│                Main Process                  │
│  main.js (entry, window, IPC)               │
│  ├── fileSorter.js (folder/file operations) │
│  ├── notifications.js (OS notifications)    │
│  ├── menu.js (native menu bar)              │
│  └── updater.js (auto-update)               │
├─────────────────────────────────────────────┤
│            Preload Bridge                    │
│  preload.js → exposes window.electronAPI     │
├─────────────────────────────────────────────┤
│              Renderer Process                │
│  App.jsx (root, state, routing)             │
│  ├── Dashboard.jsx (main menu)              │
│  └── FileSorter.jsx (sorting UI)            │
└─────────────────────────────────────────────┘
```

## Key Files

### Main Process

| File | Purpose |
|------|---------|
| `main/main.js` | Creates BrowserWindow, registers IPC handlers, imports modules |
| `main/preload.js` | Exposes `window.electronAPI` via contextBridge (contextIsolation: true) |
| `main/fileSorter.js` | IPC handlers: `select-folder`, `get-files`, `move-to-trash`, `get-file-thumbnail` |
| `main/notifications.js` | IPC handlers: `show-notification`, `request-notification-permission`, `notification-supported` |
| `main/menu.js` | Native macOS menu bar (File, Edit, View, Window, Help) |
| `main/updater.js` | Auto-update via electron-updater with GitHub releases |

### Renderer Process

| File | Purpose |
|------|---------|
| `src/App.jsx` | Root component. Manages: `theme`, `sortingMode`, `updateInfo`, `notifications`. Routes between Dashboard and FileSorter. |
| `src/components/Dashboard.jsx` | Main dashboard with 4 cards: File Management, Notifications, Auto Update, Settings |
| `src/components/FileSorter.jsx` | File sorting UI with 3 views: idle (folder picker), sorting (review files), complete (summary) |
| `src/index.css` | CSS variables for theming (light/dark mode) |
| `src/App.css` | All component styles including FileSorter and zoom overlay |

## IPC Channels

### Main → Renderer (via webContents.send)

| Channel | Data | Purpose |
|---------|------|---------|
| `notification` | `{ type, title, body }` | Notification events (shown, clicked, closed) |
| `menu-command` | `{ action, files? }` | Menu bar commands |
| `update-available` | `{ version, releaseNotes }` | Update available |
| `update-downloaded` | `{ version }` | Update downloaded |
| `update-progress` | `{ percent }` | Download progress |

### Renderer → Main (via ipcRenderer.invoke)

| Channel | Parameters | Returns | Purpose |
|---------|-----------|---------|---------|
| `get-app-info` | — | `{ name, version, platform }` | App metadata |
| `get-theme` | — | `string` | Current theme |
| `set-theme` | `theme: string` | `string` | Set theme |
| `select-folder` | — | `{ canceled, folderPath }` | Open native folder picker |
| `get-files` | `folderPath: string` | `{ success, folderPath, files[] }` | List files in folder |
| `move-to-trash` | `filePath: string` | `{ success }` | Move file to trash |
| `get-file-thumbnail` | `filePath: string` | `{ success, dataUrl }` | Read image as base64 data URL |
| `show-notification` | `{ title, body, silent }` | `{ success }` | Show OS notification |
| `request-notification-permission` | — | `boolean` | Check notification support |
| `notification-supported` | — | `boolean` | Check if notifications supported |
| `check-for-updates` | — | — | Trigger update check |
| `install-update` | — | — | Install downloaded update |

## Component State Flow

### App.jsx

```
App
├── theme: 'light' | 'dark'
├── sortingMode: boolean → determines Dashboard or FileSorter
├── updateInfo: { type: 'available'|'downloaded'|'progress', ... }
└── notifications: [{ message, type, id }]
```

### FileSorter.jsx

```
FileSorter
├── view: 'idle' | 'sorting' | 'complete'
├── folderPath: string
├── files: [{ name, path, ext, size, sizeFormatted, type, isImage, mtime }]
├── currentIndex: number
├── kept: File[]
├── deleted: File[]
├── thumbnailUrl: string | null (base64 data URL)
├── zoomOpen: boolean
├── loading: boolean
└── error: string | null
```

**View transitions:**
- `idle` → user selects folder → `sorting`
- `sorting` → all files reviewed → `complete`
- `complete` → "Sort Another" → `idle`
- Any → ESC → `idle` (calls `onExit`)

## How to Add a New Feature

### 1. Add IPC Channel (Main Process)

In `main/fileSorter.js` or a new file:
```js
ipcMain.handle('my-new-channel', (event, param) => {
  // do something
  return { success: true, data: result };
});
```

Then in `main/main.js`, import and call the setup function.

### 2. Expose in Preload

In `main/preload.js`:
```js
myNewChannel: (param) => ipcRenderer.invoke('my-new-channel', param),
```

### 3. Use in Renderer

In React component:
```jsx
const result = await window.electronAPI.myNewChannel(param);
```

## Conventions

- **Context isolation** is enabled. Never use `nodeIntegration`. Always use preload + contextBridge.
- **No comments** in code unless explicitly requested.
- **CSS variables** for theming (defined in `index.css`). Use `var(--name)` in styles.
- **Component files** go in `src/components/`.
- **Main process modules** go in `main/`.
- **File names:** PascalCase for React components (`FileSorter.jsx`), camelCase for utilities (`fileSorter.js`).
