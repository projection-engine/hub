const {app, BrowserWindow} = require("electron");

export default function startEvents(cb) {
    app.on('ready', () => cb());
    app.on('window-all-closed', async () => {
        if (process.platform !== 'darwin')
            app.quit();
    });
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            cb()
    });
}