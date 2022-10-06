import Localization from "../shared/libs/Localization";
import {fs, path} from "@tauri-apps/api"
import readFile from "./read-file";

export default async function refreshProjects(pathToRead) {
    try {
        const res = await fs.readDir(pathToRead)
        if (!(await fs.exists(pathToRead))) await fs.createDir(pathToRead)
        const data = []

        for (let i = 0; i < res.length; i++) {
            try {
                const current = res[i]
                if (!Array.isArray(current.children))
                    continue
                const children = await fs.readDir(current.path)
                console.log(children)
                if (!children.find(c => c.path.includes(".meta")))
                    continue
                let meta = await readFile(current.path + path.sep + ".meta")
                if(meta)
                    meta = JSON.parse(meta)
                const parts = current.path.split(path.sep)
                data.push({
                    id: parts.pop(),
                    meta,
                    settings: meta ? meta.settings : undefined
                })
            } catch (err) {
                console.error(err)
                continue
            }
        }
        return data.filter(e => e !== undefined).map(e => {
            let res = {...e}
            if (!res.meta) res.meta = {name: Localization.HOME.HOME.CREATE}
            if (!res.settings) res.settings = {}
            if (!res.meta.name) res.meta.name = Localization.HOME.HOME.CREATE
            return res
        })
    } catch (err) {
        console.error(err)
        return []
    }
}