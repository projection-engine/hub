import {get} from "svelte/store";
import {contentBrowserStore} from "./templates/content-browser-store";
import NodeFS, {getCall} from "../../shared/libs/NodeFS";
import FilesAPI from "../../shared/libs/files/FilesAPI"
import handleDropFolder from "../views/content-browser/utils/handle-drop-folder";
import ROUTES from "../../static/ROUTES";
import ContentBrowserAPI from "../../shared/libs/files/ContentBrowserAPI";
import Localization from "../../shared/libs/Localization";
import {COMPONENTS, Engine} from "../../../public/engine/production";
import UIAPI from "../../../public/engine/production/apis/UIAPI";

export default class FilesStore {
    static data = get(contentBrowserStore)
    static initialized = false
    static toCut = []
    static #isWatching = false

    static get PREVIEW_PATH() {
        return FilesAPI.path + FilesAPI.sep + "previews"
    }

    static get ASSETS_PATH() {
        return FilesAPI.path + FilesAPI.sep + "assets"
    }

    static getStore(onChange) {
        if (!FilesStore.initialized) {
            FilesStore.initialized = true
            FilesAPI.readFile(FilesAPI.path + FilesAPI.sep + "bookmarks.meta", "json")
                .then(res => {
                    if (res)
                        FilesStore.updateStore({...FilesStore.data, bookmarks: res})
                })
            FilesStore.refreshFiles().catch()
        }
        return contentBrowserStore.subscribe(newValue => {
            onChange(newValue)
        })
    }

    static async refreshFiles() {
        try {
            const data = await getCall(ROUTES.REFRESH_CONTENT_BROWSER, {pathName: FilesAPI.path}, false)
            const fileTypes = await ContentBrowserAPI.refresh()
            FilesStore.updateStore({...FilesStore.data, items: data, ...fileTypes})
        } catch (err) {
            console.error(err)
        }

    }

    static unwatchFiles() {
        if (!FilesStore.#isWatching)
            return
        NodeFS.unwatch()
        FilesStore.#isWatching = false
    }

    static watchFiles() {
        if (FilesStore.#isWatching)
            return
        FilesStore.#isWatching = true
        NodeFS.watch(async (ev, data) => {
            const found = FilesStore.data.items.find(i => !i.isFolder && data.includes(i.id))
            if (found && Engine.UILayouts.get(found.registryID) != null) {
                const entity = Engine.entities.find(e => e.components.get(COMPONENTS.UI)?.uiLayoutID === found.registryID)
                if (!entity) {
                    Engine.UILayouts.delete(found.registryID)
                    return
                }
                Engine.UILayouts.set(found.registryID, await FilesAPI.readFile(data))
                UIAPI.updateUIEntity(entity)
                alert.pushAlert("Updating entity UI", "info")
            }
        })
    }

    static async createFolder(currentDirectory) {
        let path = currentDirectory.id + FilesAPI.sep + Localization.PROJECT.FILES.NEW_FOLDER
        const existing = await ContentBrowserAPI.foldersFromDirectory(FilesStore.ASSETS_PATH + currentDirectory.id)
        if (existing.length > 0)
            path += " - " + existing.length

        const [e] = await NodeFS.mkdir(FilesStore.ASSETS_PATH + path, {})
        if (!e)
            await FilesStore.refreshFiles()

        if (FilesStore.#isWatching)
            NodeFS.reWatch()
    }

    static updateStore(value = FilesStore.data) {
        FilesStore.data = value
        contentBrowserStore.set({...value})
    }

    static removeBlock(v) {
        const prev = FilesStore.data.bookmarks

        const n = prev.filter(i => !v.includes(i.path))
        FilesAPI.writeFile(FilesAPI.sep + "bookmarks.meta", JSON.stringify(n)).catch()
        FilesStore.updateStore({...FilesStore.data, bookmarks: n})
    }

    static addBookmark(id) {
        const prev = FilesStore.data.bookmarks

        const n = [...prev, {
            name: id.split(FilesAPI.sep).pop(),
            path: id
        }]
        FilesAPI.writeFile(FilesAPI.sep + "bookmarks.meta", JSON.stringify(n)).catch()
        FilesStore.updateStore({...FilesStore.data, bookmarks: n})
    }

    static removeBookmark(id) {
        const prev = FilesStore.data.bookmarks

        const n = prev.filter(i => i.path !== id)
        FilesAPI.writeFile(FilesAPI.sep + "bookmarks.meta", JSON.stringify(n)).catch()
        FilesStore.updateStore({...FilesStore.data, bookmarks: n})
    }

    static renameBookmark(id, newPath) {
        const prev = FilesStore.data.bookmarks
        const p = prev.filter(i => i.path !== id)
        const n = [...p, {
            name: newPath.split(FilesAPI.sep).pop(),
            path: newPath
        }]
        FilesAPI.writeFile(FilesAPI.sep + "bookmarks.meta", JSON.stringify(n)).catch()
        FilesStore.updateStore({...FilesStore.data, bookmarks: n})
    }

    static paste(target, setCurrentDirectory) {
        if (FilesStore.toCut.length > 0) {
            handleDropFolder(
                [...FilesStore.toCut],
                target,
                {id: target},
                setCurrentDirectory
            )
            FilesStore.toCut = []
        }
    }
}