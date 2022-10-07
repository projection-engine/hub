const {ipcMain} = require("electron")
const fs = require("fs")
const pathRequire = require("path")
const readFile = require("./utils/read-file")
const lstat = require("./utils/lstat")
const rm = require("./utils/rm")
const readdir = require("./utils/readdir")

module.exports = function () {
    ipcMain.on("fs-read", async (event, data) => {
        const {
            path, options, listenID
        } = data
        const result = await readFile(path, options)
        event.sender.send("fs-read-" + listenID, result[1])
    })

    ipcMain.on("fs-write", async (event, pkg) => {
        const {
            path, data, listenID
        } = pkg
        const result = await new Promise(resolve => {
            fs.writeFile(pathRequire.resolve(path), data, (err) => resolve(err))
        })
        event.sender.send("fs-write-" + listenID, result)
    })


    ipcMain.on("fs-rm", async (event, data) => {
        const {
            path, options, listenID
        } = data
        const result = await rm(path, options)
        event.sender.send("fs-rm-" + listenID, result[0])
    })

    ipcMain.on("fs-mkdir", async (event, data) => {
        const {
            path, listenID
        } = data
        const result = await new Promise(resolve => {
            fs.mkdir(pathRequire.resolve(path), (err) => resolve(err))
        })
        event.sender.send("fs-mkdir-" + listenID, result)
    })

    ipcMain.on("fs-stat", async (event, data) => {
        const {
            path, options, listenID
        } = data
        const result = await new Promise(resolve => {
            fs.stat(pathRequire.resolve(path), options, (err, res) => resolve(res ? {isDirectory: res.isDirectory(), ...res} : undefined))
        })
        event.sender.send("fs-stat-" + listenID, result)
    })

    ipcMain.on("fs-exists", async (event, data) => {
        const {
            path, listenID
        } = data
        const result = fs.existsSync(pathRequire.resolve(path))
        event.sender.send("fs-exists-" + listenID, result)
    })

    ipcMain.on("fs-readdir", async (event, data) => {
        const {
            path, options, listenID
        } = data

        const result = await readdir(path, options)
        event.sender.send("fs-readdir-" + listenID, result[1])
    })

    ipcMain.on("fs-lstat", async (event, data) => {
        const {
            path, options, listenID
        } = data
        const result = await lstat(path, options)
        event.sender.send("fs-lstat-" + listenID, result[1])
    })

    ipcMain.on("fs-rename", async (event, data) => {
        const {
            oldPath, newPath, listenID
        } = data
        const result = await new Promise(resolve => {
            fs.rename(pathRequire.resolve(oldPath), pathRequire.resolve(newPath), (err) => resolve(err))
        })
        event.sender.send("fs-rename-" + listenID, result)
    })
}


