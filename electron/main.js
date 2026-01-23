const { app, BrowserWindow, ipcMain, systemPreferences, session } = require('electron');
const path = require('path');

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // nodeIntegration: false, // Default
            // contextIsolation: true, // Default
            sandbox: true, // Sandbox requires explicit permission handling
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

    // Handle screen sharing permission for sandbox
    // Handle screen sharing permission for sandbox
    mainWindow.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
        const { desktopCapturer } = require('electron');

        desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
            if (sources && sources.length > 0) {
                // Auto-select the first screen to unblock the user.
                // In a production app, we would send these sources to the UI for selection.
                callback({ video: sources[0], audio: 'loopback' });
                console.log('Display Media Granted: Auto-selected screen 0');
            } else {
                console.log('Display Media Denied: No sources found');
                // Should probably callback with deny? Or just fallback.
                // callback(null) denies it.
            }
        }).catch((err) => {
            console.error('Error in setDisplayMediaRequestHandler', err);
        });
    });

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
            if (mediaType === 'screen') {
                // systemPreferences.askForMediaAccess('screen') is not supported.
                // We must trigger a capture attempt to prompt the user.
                const status = systemPreferences.getMediaAccessStatus('screen');
                if (status === 'granted') return true;

                // Trigger prompt by asking for sources
                const { desktopCapturer } = require('electron');
                try {
                    await desktopCapturer.getSources({ types: ['screen'] });
                    return systemPreferences.getMediaAccessStatus('screen') === 'granted';
                } catch (e) {
                    console.log("Failed to get sources (likely denied):", e);
                    return false;
                }
            }

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

    ipcMain.handle('remote-control', async (event, action) => {
        try {
            // Lazy load robotjs to avoid startup crashes if not built correctly
            const robot = require('@jitsi/robotjs');
            const { width: screenWidth, height: screenHeight } = robot.getScreenSize();

            switch (action.type) {
                case 'mousemove':
                    // action.x and action.y should be normalized (0-1)
                    if (action.x >= 0 && action.x <= 1 && action.y >= 0 && action.y <= 1) {
                        const x = action.x * screenWidth;
                        const y = action.y * screenHeight;
                        robot.moveMouse(x, y);
                    }
                    break;
                case 'mousedown':
                    robot.mouseToggle('down', action.button || 'left');
                    break;
                case 'mouseup':
                    robot.mouseToggle('up', action.button || 'left');
                    break;
                case 'click':
                    robot.mouseClick(action.button || 'left', action.double || false);
                    break;
                case 'scroll':
                    robot.scrollMouse(action.dx || 0, action.dy || 0);
                    break;
                case 'keydown':
                    // Basic key mapping required. action.key should be robotjs compatible.
                    // For now, support simple characters and some special keys.
                    try {
                        robot.keyTap(action.key.toLowerCase(), action.modifiers);
                    } catch (e) {
                        console.log("Unsupported key:", action.key);
                    }
                    break;
            }
            return true;
        } catch (error) {
            console.error('Remote control error:', error);
            // If robotjs is missing, this handles graceful fallback (no-op)
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
