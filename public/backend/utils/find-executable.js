const fs = require('fs');
const path = require('path');

export default function findExecutable(folderPath, ext) {
    const files = fs.readdirSync(folderPath);
    let result
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const pathToFind = path.join(folderPath, file);
        if (file.includes(ext)) {
            result = pathToFind
            break
        }
    }
    return result
}