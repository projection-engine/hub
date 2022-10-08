const path = require('path');
const {download} = require('electron-dl');

export default async function downloadFile(url, window, directory, filename) {
    const onProgress = status => window.webContents.send("download-progress", status);
    return download(window, url, {directory, filename, onProgress})
}