import {fs} from "@tauri-apps/api";

export default async function readFile(path){
    const binary = await fs.readBinaryFile(path)
    return String.fromCharCode.apply(null, new Uint16Array(binary));

}