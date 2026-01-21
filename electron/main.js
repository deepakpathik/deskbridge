const { app, BrowserWindow, ipcMain, systemPreferences } = require('electron');
const path = require('path');

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
        },
        backgroundColor: '#000000',
        show: false,
    });

    const isDev = !app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:3005');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }




    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
};

app.on('ready', () => {
    // Permission Handlers
    ipcMain.handle('check-permissions', async () => {
        if (process.platform !== 'darwin') return { screen: 'granted' }; // Assume granted on non-macOS for now

        try {
            const screen = systemPreferences.getMediaAccessStatus('screen');
            const mic = systemPreferences.getMediaAccessStatus('microphone');
            return { screen, mic };
        } catch (error) {
            console.error('Permission check failed:', error);
            return { screen: 'unknown', mic: 'unknown' };
        }
    });

    ipcMain.handle('request-media-access', async (event, mediaType) => {
        if (process.platform !== 'darwin') return true;
        try {
            return await systemPreferences.askForMediaAccess(mediaType);
        } catch (error) {
            console.error(`Failed to request ${mediaType} access:`, error);
            return false;
        }
    });

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
