<script>
    import Header from "./Header.svelte";
    import Localization from "../Localization";
    import {onDestroy, onMount} from "svelte";
    import NodeFS from "shared-resources/frontend/libs/NodeFS";
    import refreshProjects from "../utils/refresh-projects";
    import ProjectRow from "./ProjectRow.svelte";
    import {v4} from "uuid";
    import ContextMenuController from "shared-resources/frontend/libs/ContextMenuController";
    import BASE_PATH from "../BASE_PATH";
    import PROJECT_FILE_EXTENSION from "shared-resources/PROJECT_FILE_EXTENSION";
    import List from "./List.svelte";


    const pathLib = window.require("path")
    const os = window.require("os")
    const {ipcRenderer, shell} = window.require("electron")

    export let installedVersions

    let basePath
    let searchString = ""
    let projectsToShow = []
    let currentVersion
    let selected
    let defaultVersion

    $: isReleaseValid = installedVersions.find(v => v === defaultVersion)

    const translate = (key) => Localization.HOME[key]
    const internalID = v4()

    onMount(() => {
        defaultVersion = localStorage.getItem("CURRENT_VERSION")
        currentVersion = localStorage.getItem("CURRENT_VERSION")
        ContextMenuController.mount(
            {
                icon: "view_in_ar",
                label: Localization.HOME.LABEL_PROJECTS
            },
            [
                {
                    icon: "delete_forever",
                    label: "Delete",
                    onClick: async () => {
                        await NodeFS.rm(NodeFS.resolvePath(localStorage.getItem(BASE_PATH) + NodeFS.sep + selected), {
                            recursive: true,
                            force: true
                        })
                        projectsToShow = projectsToShow.filter(e => e.id !== selected)
                    }
                },
                {
                    icon: "folder",
                    label: "Open in explorer",
                    onClick: async () => shell.showItemInFolder(localStorage.getItem(BASE_PATH) + NodeFS.sep + selected)
                },
            ],
            internalID,
            ["data-card"]
        )
        if (!localStorage.getItem(BASE_PATH))
            localStorage.setItem(BASE_PATH, NodeFS.rootDir)
        basePath = localStorage.getItem(BASE_PATH)

    })
    $: {
        if (basePath)
            refreshProjects(basePath).then(r => projectsToShow = r).catch()
    }
    onDestroy(() => ContextMenuController.destroy(internalID))

</script>


<Header
        isReleaseValid={isReleaseValid}
        defaultVersion={defaultVersion}
        basePath={basePath}
        setBasePath={v => basePath = v}
        translate={translate}
        setSearchString={v => searchString = v}
        searchString={searchString}
        projectsToShow={projectsToShow}
        setProjectsToShow={v => projectsToShow = v}
/>

<div
        class="content"
        id={internalID}
        on:mousedown={e => {
            const found = document.elementsFromPoint(e.clientX, e.clientY).map(e => e.getAttribute("data-card")).filter(e => e != null)
            if(found != null)
                selected = found[0]
        }}
>
    <List
            let:item
            getLabel={e => e.meta.name}
            items={projectsToShow}
            favoriteKey={PROJECT_FILE_EXTENSION}
            getID={e => e.id}
    >
        <ProjectRow
                isReleaseValid={isReleaseValid}
                installedVersions={installedVersions}
                updateVersion={async version =>  {
                        await NodeFS.write(
                            item.path + NodeFS.sep + PROJECT_FILE_EXTENSION,
                         JSON.stringify({
                            ...item.meta,
                            version
                        }))
                        item.meta.version = version
                        projectsToShow = projectsToShow
                    }}
                selected={selected}
                open={() => {
                    if(item.meta.version !== defaultVersion){
                        alert.pushAlert("Project version is not installed.")
                    }else
                        ipcRenderer.send("open-project", {path: item.path, version: defaultVersion})
                }}
                data={item}
                onRename={async newName => {
                        const pathName = pathLib.resolve(localStorage.getItem(BASE_PATH) + NodeFS.sep + item.id + NodeFS.sep + PROJECT_FILE_EXTENSION)
                        const res = await NodeFS.read(pathName)
                        if (!res)
                            return
                        await NodeFS.write(
                            pathName,
                         JSON.stringify({
                            ...JSON.parse(res.toString()),
                            name: newName
                        }))
                        projectsToShow = projectsToShow
                    }}
        />
    </List>
</div>


<style>
    .content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 2px;

        align-items: flex-start;
        overflow-x: hidden;
        overflow-y: auto;
        height: 100%;
    }
</style>