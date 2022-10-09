<script>
    import Localization from "./Localization";
    import Alert from "shared-resources/frontend/components/alert/Alert.svelte";
    import Sidebar from "shared-resources/frontend/components/Sidebar.svelte";
    import Projects from "./components/Projects.svelte";
    import ReleasesList from "./components/Releases.svelte";
    import ContextMenu from "shared-resources/frontend/components/context-menu/ContextMenu.svelte";
    import {onMount} from "svelte";

    import Downloads from "./components/Downloads.svelte";

    const {ipcRenderer} = window.require("electron")
    let tab = 0
    let downloadProgress = {
        progress: -1,
        name: undefined,
        size: -1
    }
    let downloadTabOpen = false
    let installedReleases
    const translate = (key) => Localization.HOME[key]
    onMount(() => {

        ipcRenderer.on("download-progress", (event, progress) => {
            console.log(progress)
            if (progress.percent * 100 >= 100 && downloadProgress.progress > -1) {
                downloadProgress = {
                    progress: -1,
                    name: undefined,
                    size: -1
                }
                downloadTabOpen = false
                alert.pushAlert(translate("DOWNLOAD_FINISHED"), "success")

            }
            if (progress.percent * 100 >= 100)
                return
            downloadProgress = {
                ...downloadProgress,
                progress: progress.percent * 100,
                size: (progress.totalBytes /1e+6).toFixed(2)
            }
            if (!downloadTabOpen)
                downloadTabOpen = true
        })
        ipcRenderer.send("releases-update")
        setInterval(() => ipcRenderer.send("releases-update"), 1000)
        ipcRenderer.on("releases-update", (event, data) => {

            installedReleases = data
            if (data.length === 0) {
                alert.pushAlert(translate("NO_VERSION_INSTALLED"), 7000)
                tab = 1
            }
        })
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
            <Projects installedVersions={installedReleases}/>
        {:else}
            <ReleasesList setVersionOnDownload={v => downloadProgress = {...downloadProgress, name: v}}
                          installedReleases={installedReleases}/>
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