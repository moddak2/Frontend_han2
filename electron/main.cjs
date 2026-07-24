const { app, BrowserWindow, desktopCapturer, ipcMain } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
const devServerUrl = 'http://localhost:5173';

ipcMain.handle('screen:get-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: { width: 320, height: 180 },
    fetchWindowIcons: true,
  });

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL(),
  }));
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#0b1020',
    title: 'Fronte',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    win.loadURL(devServerUrl);
    if (process.env.HAN2_OPEN_DEVTOOLS === '1') {
      win.webContents.openDevTools({ mode: 'detach' });
    }
    return;
  }

  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.fronte.desktop');
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
