const {BrowserWindow, dialog, ipcMain, screen} = require('electron');
const FSEvents = require("../../shared/backend/file-system");
const path = require("path");
const startEvents = require("./utils/start-events");
const readInstalledVersions = require("./utils/read-installed-versions");
const rm = require("../../shared/backend/utils/rm");
const INSTALL_PATH = require("./static/INSTALL_PATH");
const fs = require("fs")
const downloadFile = require("./utils/download-file");
const childProcess = require("child_process");
const decompress = require("decompress");
const findExecutable = require("./utils/find-executable");
const openProject = require("./utils/open-project");

async function updateInstalls(win) {
    win.webContents.send("releases-update", (await readInstalledVersions())[1])
}

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
    window.webContents.on('did-finish-load', async (e) => {
        updateInstalls(window).catch()
    })
    window.webContents.on('releases-update', async (e) => {
        updateInstalls(window).catch()
    })
    window.on("ready-to-show", () => window.show())

    const installPath = __dirname + path.sep + INSTALL_PATH

    ipcMain.on("open-selection", async () => {
        const {canceled, filePaths} = await dialog.showOpenDialog({
            properties: ['openDirectory']
        })
        window.webContents.send("open-selection", canceled ? null : filePaths[0])
    })
    ipcMain.on("open-project", (...args) => openProject(args[0], args[1], installPath))
    ipcMain.on("install-version", async (event, data) => {
        const {version, requestPath} = data

        if (!fs.existsSync(installPath))
            fs.mkdirSync(installPath)
        const DIR = installPath + path.sep + version
        if (fs.existsSync(DIR))
            return
        fs.mkdirSync(DIR)
        const result = await downloadFile(requestPath, window, DIR, "COMPRESSED.zip")
        if (result.isDone()) {
            await decompress(DIR + path.sep + "COMPRESSED.zip", DIR)
            updateInstalls(window).catch()
        }


    })
    ipcMain.on("uninstall-version", async (event, ID) => {
        await rm(installPath + path.sep + ID, {recursive: true, force: true})
        updateInstalls(window).catch()
    })
}

startEvents(createEnvironment)