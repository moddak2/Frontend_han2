const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('frontendHan2', {
  appName: 'Fronte',
  version: '0.1.0',
  getScreenSources: () => ipcRenderer.invoke('screen:get-sources'),
});
