<script>
    import "../css/ProjectRow.css"
    import Localization from "../Localization";
    import ToolTip from "shared-resources/frontend/components/tooltip/ToolTip.svelte";
    import Icon from "shared-resources/frontend/components/icon/Icon.svelte";

    const {ipcRenderer, shell} = window.require("electron")
    export let release
    export let installedReleases
    export let defaultVersion
    export let setDefaultVersion

    const translate = (key) => Localization.HOME[key]
    $: isInstalled = installedReleases.find(r => r === release.tag_name)

    function install() {

        const platform = navigator.userAgentData.platform.toLowerCase().split(/\s/)[0]
        const parsed = platform.includes("windows") ? "win32" : "linux"
        const foundRelease = release.assets.find(asset => asset.name.includes(parsed))
        if (!foundRelease) {
            alert.pushAlert(translate("NOT_COMPATIBLE"))
            return
        }
        ipcRenderer.send("install-version", {version: release.tag_name, requestPath: foundRelease.browser_download_url})
        if (!defaultVersion) {
            localStorage.setItem("CURRENT_VERSION", release.tag_name)
            setDefaultVersion(release.tag_name)
        }

    }
</script>

<div class={"wrapper card-home"}>
    <div class="group" style="justify-content: flex-start">
        <div class={"info card-home"} style="width: fit-content">
            <strong>{release.tag_name}</strong>
            <small>{(new Date(release.published_at)).toDateString()}</small>
        </div>
        {#if defaultVersion === release.tag_name}
            <div class="default-version">
                <small data-overflow="-" style="color: white">{translate("IS_DEFAULT_VERSION")}</small>
            </div>
        {/if}
    </div>
    <div class="group" style="justify-content: flex-end">
        <div on:click={() => shell.openExternal(release.html_url)} class="link">
            <small style="text-align: right" data-overflow="-">{translate("RELEASE_NOTES")}</small>
            <ToolTip content={translate("RELEASE_NOTES")}/>
        </div>
        <div data-vertdivider="-"></div>
        {#if !isInstalled}
            <button
                    class="button"
                    style="width: 30px;"
                    on:click={install}
            >
                <Icon styles="width: 1rem">download_file</Icon>
                <ToolTip content={translate("INSTALL")}/>
            </button>
        {:else}

            <button
                    style="--pj-accent-color: #ff5555"
                    class="button"
                    on:click={() => {
                    if(release.tag_name === defaultVersion)
                        setDefaultVersion(undefined)

                    ipcRenderer.send("uninstall-version", release.tag_name)
                }}
            >
                <Icon>delete_forever</Icon>
                <ToolTip content={translate("UNINSTALL")}/>
            </button>
            {#if defaultVersion !== release.tag_name}
                <div data-vertdivider="-"></div>
                <button
                        data-focusbutton="-"
                        on:click={() => {
                        localStorage.setItem("CURRENT_VERSION", release.tag_name)
                        setDefaultVersion(release.tag_name)
                    }}
                >
                    {translate("SET_AS_DEFAULT")}
                    <ToolTip content={translate("SET_AS_DEFAULT")}/>
                </button>
            {/if}
        {/if}
    </div>
</div>

<style>
    .default-version {
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;

        padding: 4px;
        border-radius: 10px;
        background: var(--pj-accent-color)
    }

    .group {
        display: flex;
        align-items: center;
        gap: 2px;
        width: fit-content;
    }

    .button {
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
    }

    strong {
        font-weight: 550;
    }

    .link {
        cursor: alias;
    }

    .link:hover {
        text-decoration: underline;
    }
</style>
