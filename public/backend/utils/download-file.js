const path = require('path');
const {download} = require('electron-dl');

export default async function downloadFile(url, window, directory, filename, hideProgress) {
    let onProgress

    if (!hideProgress)
        onProgress = status => window.webContents.send("download-progress", status);
    console.log(onProgress)
    return download(window, url, {directory, filename, onProgress})
}