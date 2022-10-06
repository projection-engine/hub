<script>
    import Header from "./Header.svelte";
    import Icon from "../shared/components/icon/Icon.svelte";
    import Localization from "../shared/libs/Localization";
    import {onDestroy, onMount} from "svelte";

    import refreshProjects from "../utils/refresh-projects";
    import ProjectRow from "./ProjectRow.svelte";
    import {v4} from "uuid";
    import ContextMenuController from "../shared/libs/ContextMenuController";
    import {fs, path, shell} from "@tauri-apps/api";
    import readFile from "../utils/read-file";

    export let openProjects
    export let addOpenProjects

    let searchString = ""
    let projectsToShow = []
    let filtered
    const translate = (key) => Localization.HOME.HOME[key]
    const internalID = v4()

    let selected

    function openProject(p) {
        addOpenProjects(p)
    }

    async function load() {

        if (!localStorage.getItem("basePath")){
            projectsToShow = await refreshProjects(localStorage.getItem("basePath"))
            return
        }
        const documents = await path.documentDir()
        localStorage.setItem("basePath", documents)
        projectsToShow = await refreshProjects(documents)
    }

    onMount(() => {
        ContextMenuController.mount(
            {
                icon: "view_in_ar",
                label: Localization.HOME.HOME.LABEL_PROJECTS
            },
            [
                {
                    icon: "delete_forever",
                    label: "Delete",
                    onClick: async () => {
                        await fs.readDir(await path.resolve(localStorage.getItem("basePath") + "projects" + path.sep + selected), {recursive: true})
                        projectsToShow = projectsToShow.filter(e => e.id !== selected)
                    }
                },
                {
                    icon: "folder",
                    label: "Open in explorer",
                    onClick: async () => shell.open(localStorage.getItem("basePath") + "projects" + path.sep + selected)
                },
            ],
            internalID,
            ["data-card"]
        )
        load()

    })

    onDestroy(() => ContextMenuController.destroy(internalID))
    $: {
        console.log(projectsToShow)
        if (searchString)
            filtered = projectsToShow.filter(p => p.meta.name && p.meta.name.toLowerCase().includes(searchString.toLowerCase()))
        else
            filtered = [...projectsToShow]
    }
</script>


<Header

        setSearchString={v => searchString = v}
        searchString={searchString}
        projectsToShow={projectsToShow}
        setProjectsToShow={v => projectsToShow = v}
/>
{#if filtered.length === 0}
    <div class="empty-wrapper">
        <Icon styles="font-size: 100px; color: #999;">folder</Icon>
        {translate("EMPTY")}
    </div>
{:else}
    <div
            class="content"
            id={internalID}
            on:mousedown={e => {
                const found = document.elementsFromPoint(e.clientX, e.clientY).map(e => e.getAttribute("data-card")).filter(e => e != null)
                if(found != null)
                    selected = found[0]
            }}
    >
        {#each filtered as p}
            <ProjectRow
                    selected={selected}
                    openProjects={openProjects}
                    open={() => openProject(p)}
                    data={p}
                    onRename={async newName => {
                        const pathName =await path.resolve(localStorage.getItem("basePath") + "projects" + path.sep + p.id + path.sep + ".meta")
                        const data = await readFile(pathName)
                        await fs.writeFile(pathName, JSON.stringify({
                            ...JSON.parse(data),
                            name: newName
                        }))
                        projectsToShow = projectsToShow
                    }}
            />
        {/each}
    </div>
{/if}


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

    .empty-wrapper {
        color: #999 !important;
        display: grid;
        justify-content: center;
        justify-items: center;
        width: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: 550;
        font-size: 0.8rem;
    }

</style>