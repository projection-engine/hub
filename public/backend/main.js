const {BrowserWindow, ipcMain, screen} = require('electron');
const FSEvents = require("../../shared/backend/file-system");
const path = require("path");
const startEvents = require("./utils/start-events");
const readInstalledVersions = require("./utils/read-installed-versions");
const rm = require("../../shared/backend/utils/rm");
const INSTALL_PATH = require("./static/INSTALL_PATH");
const fs = require("fs")
const downloadFile = require("./utils/download-file");

async function createEnvironment() {
    FSEvents()

    const primaryDisplay = screen.getPrimaryDisplay()
    const {width, height} = primaryDisplay.workAreaSize
    const window = new BrowserWindow({
        minWidth: Math.max(width * .60, 800),
        minHeight: Math.max(height * .60, 600),
        webPreferences: {
            webSecurity: false,
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
            nativeWindowOpen: true,
            nodeIntegrationInWorker: true,
        },
        autoHideMenuBar: true,
        icon: path.resolve(__dirname, "../APP_LOGO.png"),
    });
    await window.loadFile(path.join(__dirname, '../index.html'))
    await window.webContents.executeJavaScript(`localStorage.setItem("installed", "${JSON.stringify(readInstalledVersions())}"); `)
    window.webContents.reload()
    window.on("ready-to-show", () => window.show())

    const installPath = __dirname + path.sep + INSTALL_PATH
    ipcMain.on("open-project", (event, data) => {
        // TODO
    })
    ipcMain.on("install-version", async (event, data) => {
        const {version, requestPath} = data

        if (!fs.existsSync(installPath))
            fs.mkdirSync(installPath)
        const DIR = installPath + path.sep + version
        const filePath = DIR + path.sep + "COMPRESSED.zip"
        if (fs.existsSync(DIR))
            return
        fs.mkdirSync(DIR)
        const result = await downloadFile(requestPath, filePath)
        console.log(result)
    })
    ipcMain.on("uninstall-version", async (event, ID) => {

        await rm(installPath + path.sep + ID, {recursive: true, force: true})
        await window.webContents.executeJavaScript(`localStorage.setItem("installed", "${JSON.stringify(readInstalledVersions())}"); `)
    })
}

startEvents(createEnvironment)