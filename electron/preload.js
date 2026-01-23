const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    checkPermissions: () => ipcRenderer.invoke('check-permissions'),
    requestMediaAccess: (mediaType) => ipcRenderer.invoke('request-media-access', mediaType),
    openSecurityPreferences: (pane) => ipcRenderer.invoke('open-security-preferences', pane),
    performControlAction: (action) => ipcRenderer.invoke('remote-control', action),
});
