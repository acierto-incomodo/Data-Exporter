const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    maxWidth: 600,
    minWidth: 600,
    height: 400,
    maxHeight: 400,
    minHeight: 400,
    icon: path.join(__dirname, 'icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

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
