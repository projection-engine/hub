import findExecutable from "./find-executable";
import readdir from "shared-resources/backend/utils/readdir";
import PROJECT_FILE_EXTENSION from "shared-resources/PROJECT_FILE_EXTENSION";

const path = require("path");
const fs = require("fs")
const childProcess = require("child_process");

export default async function openProject(event, data, installPath) {
    const versionPath = installPath + path.sep + data.version
    if (!fs.existsSync(versionPath))
        return
    const children = (await readdir(versionPath))[1]
    if (!children)
        return
    try {

        const pathToFiles = versionPath + path.sep + children.find(e => !e.includes("."))
        const file = findExecutable(pathToFiles, ".exe")

        if (!file)
            return
        process.env.PROJECT_TO_OPEN = data.path + path.sep + PROJECT_FILE_EXTENSION

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