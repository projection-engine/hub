import {v4} from "uuid"

const os = window.require("os")
const {ipcRenderer} = window.require("electron")
const pathRequire  = window.require("path")
export function getCall(channel, data, addMiddle = true) {
    return new Promise(resolve => {
        let listenID = v4().toString()
        if (data.listenID)
            listenID = data.listenID
        ipcRenderer.once(channel + (addMiddle ? "-" : "") + listenID, (ev, data) => {
            resolve(data)
        })

        ipcRenderer.send(channel, {...data, listenID})
    })
}

function createTunnel(channel, data, callback, once) {
    if (once)
        ipcRenderer.once(channel, (ev, data) => {
            if (callback) callback(ev, data)
        })
    else
        ipcRenderer.on(channel, (ev, data) => {
            if (callback) callback(ev, data)
        })
    ipcRenderer.send(channel, data)
}


export default class NodeFS {
    static #watcherCallback
    static sep = pathRequire.sep
    static rootDir = os.homedir()
    static resolvePath(path) {
        return pathRequire.resolve(path)
    }
    static async read(path, options = {}) {
        return (await getCall("fs-read", {path, options}))
    }

    static async write(path, data) {
        return (await getCall("fs-write", {path, data}))
    }

    static async rm(path, options = {}) {
        return (await getCall("fs-rm", {path, options}))
    }

    static async mkdir(path) {
        return (await getCall("fs-mkdir", {path}))
    }

    static async stat(path, options = {}) {
        return (await getCall("fs-stat", {path, options}))
    }

    static async exists(path) {
        return (await getCall("fs-exists", {path}))
    }

    static async readdir(path, options) {
        return (await getCall("fs-readdir", {path, options}))
    }

    static async lstat(path, options) {
        return (await getCall("fs-lstat", {path, options}))
    }

    static async rename(oldPath, newPath) {
        return (await getCall("fs-rename", {oldPath, newPath}))
    }
}