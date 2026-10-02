const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('indusDesktop', {
  selectProjectFolder: () => ipcRenderer.invoke('indus:select-project-folder'),
});
