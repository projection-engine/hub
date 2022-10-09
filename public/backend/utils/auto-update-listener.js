import downloadFile from "./download-file";

const {ipcMain} = require("electron")
const path = require("path")
const fs = require('fs')
export default function autoUpdateListener(window) {
    ipcMain.on("update-app", async (event, data) => {
        const upperDir = path.resolve(__dirname, ".." + path.sep)
        fs.rmSync(upperDir + path.sep + "build")
        fs.mkdirSync(upperDir + path.sep + "build")

        const res = await downloadFile(data.assets[0].browser_download_url, window, upperDir + path.sep, "build", true)
        console.log(res)
    })
}