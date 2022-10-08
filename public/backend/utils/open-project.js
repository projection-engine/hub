import findExecutable from "./find-executable";
import readdir from "../../../shared/backend/utils/readdir";

const path = require("path");
const fs = require("fs")
const childProcess = require("child_process");

export default async function openProject(event, data, installPath) {
    const versionPath = installPath + path.sep + data.version
    if (!fs.existsSync(versionPath))
        return
    const children = (await readdir(versionPath))[1]
    if(!children)
        return
    try {
        console.log(children)
        const pathToFiles = versionPath + path.sep + children.find(e => !e.includes("."))
        const file = findExecutable(pathToFiles, ".exe")
        console.log(file, pathToFiles)
        if (!file)
            return
        process.env.PROJECT_TO_OPEN = data.path
        childProcess.execFile(file, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(data.toString());
        })
    } catch (err) {
        console.error(err)
        return
    }


}