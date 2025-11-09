const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  copyConfig: (src, dest) => ipcRenderer.invoke('copy-config', src, dest)
});
