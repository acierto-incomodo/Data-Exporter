const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    minWidth: 600,
    maxWidth: 600,
    minHeight: 400,
    maxHeight: 400,
    icon: path.join(__dirname, 'icons/icon.png'),
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  win.loadFile('index.html');
}

// Crear ventana
app.whenReady().then(createWindow);

// ===========================
// IPC para seleccionar carpeta
// ===========================
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

// ===========================
// IPC para copiar configuraciones
// ===========================
ipcMain.handle('copy-config', async (_, source, target) => {
  const itemsToCopy = [
    'options.txt',
    'xaero',
    path.join('config', 'jei')
  ];

  try {
    for (const item of itemsToCopy) {
      const srcPath = path.join(source, item);
      const destPath = path.join(target, item);
      if (fs.existsSync(srcPath)) {
        copyRecursiveSync(srcPath, destPath);
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

function copyRecursiveSync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// ===========================
// IPC para obtener versión de la app (package.json)
// ===========================
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// ===========================
// IPC para abrir URL externa
// ===========================
ipcMain.handle('open-external', async (_, url) => {
  await shell.openExternal(url);
});

// ===========================
// Cierre en macOS y Windows
// ===========================
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
