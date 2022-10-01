import NodeFS from "../NodeFS";
import FilesAPI from "./FilesAPI";
import FILE_TYPES from "../../../static/FILE_TYPES";
import RegistryAPI from "./RegistryAPI";
import {v4 as uuidv4, v4} from "uuid";
import ROUTES from "../../../static/ROUTES";
import FilesStore from "../../../editor/stores/FilesStore";
import TEXTURE_TEMPLATE from "../../../static/TEXTURE_TEMPLATE";
import {IMAGE_WORKER_ACTIONS} from "../../../../public/engine/production";
import ImageWorker from "../../../../public/engine/workers/image/ImageWorker";

const pathRequire = window.require("path")
// const {ipcRenderer} = window.require("electron")

function mapAsset(reg, type) {
    return reg.map(i => new Promise(resolve => {
        const split = i.path.split(FilesAPI.sep)
        resolve({
            type,
            registryID: i.id,
            name: split[split.length - 1].split(".")[0]
        })
    }))
}

export default class ContentBrowserAPI {

    static async rename(from, to) {
        const fromResolved = pathRequire.resolve(from)
        let newRegistry = await RegistryAPI.readRegistry()

        try {
            const stat = (await NodeFS.lstat(fromResolved))[1]
            if (stat !== undefined && stat.isDirectory) {
                await NodeFS.mkdir(to)
                const [, res] = await NodeFS.readdir(fromResolved)
                if (!res) return
                for (let i in res) {
                    const file = res[i]
                    const oldPath = fromResolved + FilesAPI.sep + `${file}`
                    const newPath = to + FilesAPI.sep + `${file}`
                    if ((await NodeFS.lstat(oldPath))[1].isDirectory)
                        await NodeFS.rename(oldPath, newPath)
                    else {
                        await NodeFS.rename(oldPath, newPath)
                        await RegistryAPI.updateRegistry(oldPath, newPath, newRegistry)
                    }
                }
                await NodeFS.rm(fromResolved, {recursive: true, force: true})
            } else if (stat !== undefined) {
                await NodeFS.rename(fromResolved, to)
                await RegistryAPI.updateRegistry(from, to, newRegistry)
            }

        } catch (error) {
            console.error(error)
        }
    }


    // static async fromDirectory(startPath, extension) {
    //     if (!(await NodeFS.exists(startPath))) return []
    //     let res = []
    //     let files = (await NodeFS.readdir(startPath))[1]
    //     for (let i = 0; i < files.length; i++) {
    //         const filename = pathRequire.join(startPath, files[i])
    //         const stat = (await NodeFS.lstat(filename))[1]
    //         if (stat && stat.isDirectory) {
    //             res.push(...(await ContentBrowserAPI.fromDirectory(filename, extension)))
    //         } else if (filename.indexOf(extension) >= 0) res.push(files[i])
    //     }
    //     return res
    // }

    static async openDialog() {
        return await new Promise(resolve => {
            const listenID = v4().toString()
            // ipcRenderer.once(ROUTES.FILE_DIALOG + listenID, (ev, data) => {
            //     resolve(data)
            // })
            // ipcRenderer.send(ROUTES.FILE_DIALOG, {listenID})
        })
    }

    static async foldersFromDirectory(startPath) {
        if (!(await NodeFS.exists(startPath))) return []
        let res = []
        let files = (await NodeFS.readdir(startPath))[1]
        for (let i = 0; i < files.length; i++) {
            const filename = pathRequire.join(startPath, files[i])
            const stat = (await NodeFS.lstat(filename))[1]

            if (stat.isDirectory) res.push(filename)
        }
        return res
    }


    static async refresh() {
        const reg = await RegistryAPI.readRegistry()
        const textureReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.TEXTURE)),
            meshesReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.MESH)),
            materialsReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.MATERIAL)),
            componentsReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.COMPONENT)),
            levelsReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.LEVEL)),
            uiReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.UI_LAYOUT)),
            materialInstancesReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.MATERIAL_INSTANCE)),
            simpleMaterialReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.SIMPLE_MATERIAL)),
            terrainReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.TERRAIN)),
            terrainMaterialReg = reg.filter(r => r.path && r.path.includes(FILE_TYPES.TERRAIN_MATERIAL)),
            promises = []


        promises.push(...mapAsset(textureReg, FILE_TYPES.TEXTURE))
        promises.push(...mapAsset(meshesReg, FILE_TYPES.MESH))
        promises.push(...mapAsset(materialsReg, FILE_TYPES.MATERIAL))
        promises.push(...mapAsset(componentsReg, FILE_TYPES.COMPONENT))
        promises.push(...mapAsset(simpleMaterialReg, FILE_TYPES.MATERIAL_INSTANCE))
        promises.push(...mapAsset(levelsReg, FILE_TYPES.LEVEL))
        promises.push(...mapAsset(uiReg, FILE_TYPES.UI_LAYOUT))
        promises.push(...mapAsset(materialInstancesReg, FILE_TYPES.MATERIAL_INSTANCE))
        promises.push(...mapAsset(terrainReg, FILE_TYPES.TERRAIN))
        promises.push(...mapAsset(terrainMaterialReg, FILE_TYPES.TERRAIN_MATERIAL))


        const loadedPromises = await Promise.all(promises)
        const result = {
            textures: [],
            meshes: [],
            materials: [],
            components: [],
            terrains: [],
            levels: [],
            uiLayouts: [],
            materialInstances: [],
            terrainMaterials: []
        }

        for (let i = 0; i < loadedPromises.length; i++) {
            const current = loadedPromises[i]
            switch (current.type) {
                case FILE_TYPES.TEXTURE:
                    result.textures.push(current)
                    break
                case FILE_TYPES.MESH:
                    result.meshes.push(current)
                    break
                case FILE_TYPES.MATERIAL:
                    result.materials.push(current)
                    break
                case FILE_TYPES.COMPONENT:
                    result.components.push(current)
                    break
                case FILE_TYPES.LEVEL:
                    result.levels.push(current)
                    break
                case FILE_TYPES.UI_LAYOUT:
                    result.uiLayouts.push(current)
                    break
                case FILE_TYPES.MATERIAL_INSTANCE:
                    result.materialInstances.push(current)
                    break
                case FILE_TYPES.TERRAIN:
                    result.terrains.push(current)
                    break
                case FILE_TYPES.TERRAIN_MATERIAL:
                    result.terrainMaterials.push(current)
                    break
                default:
                    break
            }
        }
        return result
    }

    static async importFile(targetDir, filesToLoad) {
        let result = []
        try {
            for (let i = 0; i < filesToLoad.length; i++) {
                const filePath = filesToLoad[i]
                const name = filePath.split(pathRequire.sep).pop()
                const newRoot = targetDir + pathRequire.sep + name.split(".")[0]
                const fileID = uuidv4()
                const type = filePath.split(/\.([a-zA-Z0-9]+)$/)[1]
                switch (type) {
                    case "png":
                    case "jpg":
                    case "jpeg": {
                        if (!(await NodeFS.exists(newRoot + FILE_TYPES.TEXTURE))) {
                            const res = `data:image/${type};base64,` + (await FilesAPI.readFile(filePath, "base64"))
                            if (res) {
                                const data = JSON.stringify({...TEXTURE_TEMPLATE, base64: res})
                                await NodeFS.write(newRoot + FILE_TYPES.TEXTURE, data)
                                const reduced = await ImageWorker.request(
                                    IMAGE_WORKER_ACTIONS.RESIZE_IMAGE,
                                    {
                                        image: res,
                                        width: 256,
                                        height: 256
                                    })
                                await NodeFS.write(FilesAPI.resolvePath(FilesStore.PREVIEW_PATH + FilesAPI.sep + fileID + FILE_TYPES.PREVIEW), reduced)
                                await RegistryAPI.createRegistryEntry(fileID, newRoot.replace(FilesStore.ASSETS_PATH + FilesAPI.sep, "") + FILE_TYPES.TEXTURE)
                            } else
                                console.error(new Error("Error importing image"))
                        }
                        break
                    }
                    case "gltf":
                        result.push({
                            file: name.split(".")[0],
                            ids: await new Promise(resolve => {
                                const listenID = v4().toString()
                                // ipcRenderer.once(ROUTES.IMPORT_GLTF + listenID, (ev, data) => resolve(data))
                                // ipcRenderer.send(ROUTES.IMPORT_GLTF, {
                                //     filePath: filePath,
                                //     newRoot,
                                //     options: {},
                                //     projectPath: FilesAPI.path,
                                //     listenID,
                                //     fileName: filePath.split(pathRequire.sep).pop()
                                // })
                            })
                        })
                        break
                    default:
                        break
                }
            }
        } catch (error) {
            console.error(error)
        }
        return result
    }


}