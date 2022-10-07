<script>
    import "../css/ProjectRow.css"
    import Localization from "../Localization";
    import Icon from "../../shared/frontend/components/icon/Icon.svelte";
    import ToolTip from "../../shared/frontend/components/tooltip/ToolTip.svelte";

    const {ipcRenderer} = window.require("electron")
    export let release
    export let openRelease

    const translate = (key) => Localization.HOME[key]
</script>

<div class={"wrapper card-home"}>
    <div class={"info card-home"}>
        <strong>{release.tag_name}</strong>
        <small>{(new Date(release.published_at)).toDateString()}</small>
    </div>
    <button on:click={() => openRelease()}  class="button card-home" >
        <Icon styles="font-size: .9rem">description</Icon>
        <ToolTip content={translate("RELEASE_NOTES")}/>
    </button>
    <button data-focusbutton="-" on:click={() => {
        ipcRenderer.send("install-version", {version: release.tag_name, requestPath: release.assets[0].browser_download_url})
    }}>
        {translate("INSTALL")}
    </button>
</div>

<style>
    strong {
        font-weight: 550;
    }
</style>
