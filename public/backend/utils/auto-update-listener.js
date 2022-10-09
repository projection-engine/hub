import downloadFile from "./download-file";

const decompress = require("decompress");
const {ipcMain, app} = require("electron")
const path = require("path")
const fs = require('fs')

export default function autoUpdateListener(window) {
    ipcMain.on("update-app", async (event, data) => {
        const upperDir = path.resolve(__dirname, ".." + path.sep)
        console.log(data)
        try {
            const result = await downloadFile(data.assets[0].browser_download_url, window, upperDir + path.sep, "build.zip", true)
            if (result.isDone()) {
                fs.rmSync(upperDir + path.sep + "build", {recursive: true, force: true})

                await decompress(upperDir + path.sep + "build.zip", upperDir + path.sep)
                fs.rmSync(upperDir + path.sep + "build.zip", {recursive: true, force: true})
                app.relaunch()
                app.quit()
            }
        } catch (err) {
            console.error(err)
        }

    })
}