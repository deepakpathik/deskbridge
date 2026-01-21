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
        if (process.platform !== 'darwin') return { screen: 'granted', mic: 'granted', camera: 'granted', accessibility: 'granted' };

        try {
            const screen = systemPreferences.getMediaAccessStatus('screen');
            const mic = systemPreferences.getMediaAccessStatus('microphone');
            const camera = systemPreferences.getMediaAccessStatus('camera');
            const accessibility = systemPreferences.isTrustedAccessibilityClient(false) ? 'granted' : 'denied';

            return { screen, mic, camera, accessibility };
        } catch (error) {
            console.error('Permission check failed:', error);
            return { screen: 'unknown', mic: 'unknown', camera: 'unknown', accessibility: 'unknown' };
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

    ipcMain.handle('open-security-preferences', async (event, pane) => {
        if (process.platform !== 'darwin') return;

        // Map simplified names to actual preference pane anchors if possible, 
        // or just open the general pane.
        // Screen Recording: "Privacy_ScreenCapture"
        // Accessibility: "Privacy_Accessibility"
        // Microphone: "Privacy_Microphone"
        // Camera: "Privacy_Camera"

        const panemap = {
            screen: 'Privacy_ScreenCapture',
            accessibility: 'Privacy_Accessibility',
            microphone: 'Privacy_Microphone',
            camera: 'Privacy_Camera'
        };

        const anchor = panemap[pane] || 'Privacy';

        // This opens System Preferences. The exact URI scheme can vary by macOS version,
        // but passing the anchor to 'open' via shell is a common way.
        // Electron doesn't have a direct 'openSystemPreferences' API that takes an anchor easily across all versions.
        // However, we can use shell.openExternal.

        const { shell } = require('electron');
        await shell.openExternal(`x-apple.systempreferences:com.apple.preference.security?${anchor}`);
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
