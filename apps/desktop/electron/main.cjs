const { app, BrowserWindow, dialog, ipcMain, shell, utilityProcess } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const net = require('node:net');

const isDev = !app.isPackaged;
let backend;
let windowRef;
let backendOrigin;

function reserveLoopbackPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

async function startBackend() {
  const root = process.env.INDUS_PROJECT_ROOT || path.join(app.getPath('documents'), 'Indus Projects');
  let origin;
  if (isDev) {
    origin = process.env.INDUS_DEV_SERVER_URL || 'http://127.0.0.1:5173';
    for (let attempt = 0; attempt < 120; attempt += 1) {
      try {
        const response = await fetch('http://127.0.0.1:4317/api/health', { signal: AbortSignal.timeout(1000) });
        if (response.ok) { backendOrigin = origin; return { origin, root }; }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error('Development backend did not become ready. Start it with npm run desktop.');
  }

  await fs.mkdir(root, { recursive: true });
  const readme = path.join(root, 'README.md');
  try { await fs.access(readme); }
  catch { await fs.writeFile(readme, '# My Indus Projects\n\nOpen a project folder from Settings to get started.\n'); }

  const port = await reserveLoopbackPort();
  origin = `http://127.0.0.1:${port}`;
  backendOrigin = origin;
  const serverEntry = path.join(process.resourcesPath, 'server', 'index.cjs');
  const staticDir = path.join(app.getAppPath(), 'dist');
  const env = {
    ...process.env,
    INDUS_PORT: String(port),
    INDUS_PROJECT_ROOT: root,
    INDUS_STATIC_DIR: isDev ? '' : staticDir,
    INDUS_ALLOWED_ORIGIN: origin,
    INDUS_AUTO_LOCAL_MODEL: '0',
    PATH: [
      process.env.PATH,
      '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin',
    ].filter(Boolean).join(path.delimiter),
  };

  backend = utilityProcess.fork(serverEntry, [], {
    serviceName: 'Indus Coding Agent backend',
    cwd: root,
    env,
    stdio: 'pipe',
  });
  backend.stderr?.on('data', data => console.error(`[Indus backend] ${data}`));
  backend.stdout?.on('data', data => console.log(`[Indus backend] ${data}`));

  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (!backend) throw new Error('Indus backend stopped before starting.');
    try {
      const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return { origin, root };
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  backend.kill();
  backend = undefined;
  throw new Error('Indus backend did not become ready. Check the application logs.');
}

async function createWindow(origin) {
  windowRef = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1000,
    minHeight: 680,
    title: 'Indus Coding Agent',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  windowRef.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  windowRef.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(origin)) event.preventDefault();
  });
  await windowRef.loadURL(isDev ? process.env.INDUS_DEV_SERVER_URL || 'http://127.0.0.1:5173' : origin);
  windowRef.show();
  windowRef.on('closed', () => { windowRef = undefined; });
}

ipcMain.handle('indus:select-project-folder', async () => {
  const result = await dialog.showOpenDialog(windowRef, {
    title: 'Open project folder',
    properties: ['openDirectory', 'createDirectory'],
  });
  return result.canceled ? null : result.filePaths[0] || null;
});

app.whenReady().then(async () => {
  try {
    const { origin } = await startBackend();
    await createWindow(origin);
  } catch (error) {
    console.error(error);
    await dialog.showMessageBox({
      type: 'error',
      title: 'Indus could not start',
      message: 'The Indus backend did not start.',
      detail: String(error),
    });
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0 && backend && backendOrigin) await createWindow(backendOrigin);
});
app.on('before-quit', () => {
  backend?.kill();
  backend = undefined;
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
