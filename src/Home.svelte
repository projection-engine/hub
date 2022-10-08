<script>
    import Localization from "./Localization";
    import Alert from "../shared/frontend/components/alert/Alert.svelte";
    import Sidebar from "../shared/frontend/components/Sidebar.svelte";
    import Projects from "./components/Projects.svelte";
    import ReleasesList from "./components/Releases.svelte";
    import ContextMenu from "../shared/frontend/components/context-menu/ContextMenu.svelte";
    import {onDestroy, onMount} from "svelte";
    import createPortal from "../shared/frontend/components/create-portal";
    import Downloads from "./components/Downloads.svelte";

    const {ipcRenderer} = window.require("electron")
    let tab = 0
    let downloadProgress = undefined
    let downloadTabOpen = false
    let installedReleases
    const translate = (key) => Localization.HOME[key]
    onMount(() => {
        let timeout
        ipcRenderer.on("download-progress", (event, progress) => {
            downloadProgress = progress.percent * 100
            if (downloadProgress === 100) {
                clearTimeout(timeout)
                timeout = setTimeout(() => {
                    downloadProgress = undefined
                    downloadTabOpen = false
                    alert.pushAlert(translate("DOWNLOAD_FINISHED"), "success")
                })
            } else if (!downloadTabOpen)
                downloadTabOpen = true
        })
        ipcRenderer.send("releases-update")
        setInterval(() => ipcRenderer.send("releases-update"), 1000)
        ipcRenderer.on("releases-update", (event, data) => installedReleases = data)
    })


</script>


<Alert/>

<ContextMenu/>
<div class="wrapper">
    <Sidebar
            tab={tab}
            setTab={v => {
                if(v > 1)
                    downloadTabOpen = !downloadTabOpen
                else
                    tab = v
            }}
            options={[
                ["view_in_ar", translate("PROJECTS")],
                ["inventory_2", translate("RELEASES")],
                ["file_download", translate("TOGGLE_DOWNLOADS"), "bottom", downloadTabOpen]
            ]}
    />
    <Downloads open={downloadTabOpen} progress={downloadProgress}/>
    <div class="tab">
        {#if tab === 0}
            <Projects/>
        {:else}
            <ReleasesList installedReleases={installedReleases}/>
        {/if}
    </div>
</div>


<style>
    .tab {
        width: 100%;
        position: relative;
        overflow: hidden;
        height: 100%;
        padding: 16px 5% 4px;

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 4px;
    }

    .wrapper {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        display: flex;
        position: relative;
        background-color: var(--pj-background-tertiary);
    }


</style>