import INSTALL_PATH from "../static/INSTALL_PATH";
import readdir from "shared-resources/backend/utils/readdir";

const path = require("path")
const fs = require("fs")
export default function readInstalledVersions() {
    const dirName = __dirname + path.sep + INSTALL_PATH
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName)
        return []
    }
    return readdir(dirName)
}