const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('frontendHan2', {
  appName: 'Frontend Han2',
  version: '0.0.1',
});
