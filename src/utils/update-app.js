import Localization from "../Localization";

const EXCEPTION = "APP-WINDOWS"
const {ipcRenderer} = window.require("electron")
const translate = (key) => Localization.HOME[key]
export default async function updateApp() {
    alert.pushAlert(translate("FETCHING_UPDATES"), "info")
    try {
        const res = await fetch("https://api.github.com/repos/projection-engine/hub/releases", {method: "get"})
        const json = await res.json()


        if (json.length === 0 || json[0].tag_name === EXCEPTION)
            alert.pushAlert(translate("NO_UPDATES"), "success", undefined, 7000)
        else {
            const version = json[0]
            const r = confirm(`Do you agree to update (${version.tag_name}) ?`)
            if(r) {
                ipcRenderer.send("update-app", version)
                alert.pushAlert(translate("INSTALLING_UPDATES", "info", undefined, 7000))
            }
        }
    } catch (err) {
        alert.pushAlert(translate("ERROR_UPDATE"))
    }
}