import Localization from "../Localization";
import NodeFS from "shared-resources/frontend/libs/NodeFS";

import PROJECT_FILE_EXTENSION from "shared-resources/PROJECT_FILE_EXTENSION";

export default async function refreshProjects(path) {

    const res = await NodeFS.readdir(path)
    if (!res)
        return []
    const data = []
    for (let i = 0; i < res.length; i++) {
        const itemPath = path + NodeFS.sep + res[i]
        const stat = await NodeFS.stat(itemPath)
        if(!stat.isDirectory)
            continue
        const children = await NodeFS.readdir(itemPath)
        if(!children)
            continue
        const metadata = children.find(c => c.includes(PROJECT_FILE_EXTENSION))

        if(!metadata)
            continue
        const blob = await NodeFS.read(itemPath + NodeFS.sep  + metadata)
        const parts = itemPath.split(NodeFS.sep)
        const parsedMetadata = JSON.parse(blob.toString())

        data.push({
            id: parts.pop(),
            meta: {...parsedMetadata, settings: undefined},
            settings: parsedMetadata?.settings,
            path: itemPath
        })
    }
    return data.filter(e => e !== undefined).map(e => {
        let res = {...e}
        if (!res.meta) res.meta = {name: Localization.HOME.CREATE}
        if (!res.settings) res.settings = {}
        if (!res.meta.name) res.meta.name = Localization.HOME.CREATE
        return res
    })
}