import Localization from "../shared/libs/Localization";
import {fs, path} from "@tauri-apps/api"

export default async function refreshProjects(pathToRead) {
    try {
        const res = await fs.readDir(pathToRead)
        if (!(await fs.exists(pathToRead))) await fs.createDir(pathToRead)
        const data = []
        for (let i = 0; i < res.length; i++) {
            const f = res[i]
            let filename = pathToRead + f

            const meta = (await fs.readBinaryFile(filename + "/.meta")).toString()
            const settings = (await fs.readBinaryFile(filename + "/.preferences")).toString()
            const parts = filename.split(path.sep)

            data.push({
                id: parts.pop(),
                meta: meta ? JSON.parse(meta) : undefined,
                settings: settings ? JSON.parse(settings) : undefined
            })
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