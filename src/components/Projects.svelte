<script>
    import Header from "./Header.svelte";
    import Icon from "../../shared/frontend/components/icon/Icon.svelte";
    import Localization from "../Localization";
    import {onDestroy, onMount} from "svelte";
    import NodeFS from "../../shared/frontend/libs/NodeFS";
    import refreshProjects from "../utils/refresh-projects";
    import ProjectRow from "./ProjectRow.svelte";
    import {v4} from "uuid";
    import ContextMenuController from "../../shared/frontend/libs/ContextMenuController";
    import BASE_PATH from "../BASE_PATH";
    import PROJECT_FILE_EXTENSION from "../../shared/PROJECT_FILE_EXTENSION";
    import List from "./List.svelte";

    const pathLib = window.require("path")
    const os = window.require("os")
    const {ipcRenderer, shell} = window.require("electron")

    let searchString = ""
    let projectsToShow = []

    let selected

    const translate = (key) => Localization.HOME[key]
    const internalID = v4()

    onMount(() => {
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
        refreshProjects().then(r => projectsToShow = r).catch()
    })

    onDestroy(() => ContextMenuController.destroy(internalID))


</script>


<Header
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
                    selected={selected}
                    open={() => {
                      ipcRenderer.send("open-project", item)
                    }}
                    data={item}
                    onRename={async newName => {
                        const pathName = pathLib.resolve(localStorage.getItem(BASE_PATH) + NodeFS.sep + item.id + NodeFS.sep + PROJECT_FILE_EXTENSION)
                        const res = await NodeFS.read(pathName)
                        if (!res)
                            return
                        await NodeFS.write(pathName, JSON.stringify({
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