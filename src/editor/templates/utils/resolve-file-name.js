import AssetAPI from "../../../shared/libs/files/AssetAPI";

export default async function resolveFileName(path, ext){
    let n = path + ext
    let it = 0

    while (await AssetAPI.assetExists(n)) {
        n = path + `(${it})` + ext
        it++
    }
    return n
}