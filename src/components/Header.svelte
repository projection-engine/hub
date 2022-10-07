<script>

    import Input from "../../shared/frontend/components/input/Input.svelte";
    import Icon from "../../shared/frontend/components/icon/Icon.svelte";
    import {onDestroy, onMount} from "svelte";
    import createPortal from "../../shared/frontend/components/create-portal";
    import {v4} from "uuid";
    import NodeFS from "../../shared/frontend/libs/NodeFS";
    import PROJECT_FILE_EXTENSION from "../../shared/PROJECT_FILE_EXTENSION";
    import BASE_PATH from "../BASE_PATH";


    export let setProjectsToShow
    export let projectsToShow
    export let setSearchString
    export let searchString
    export let translate

    let openInput = false
    let modal
    let input = ""
    const create = async (name = translate("PROJECT_NAME")) => {
        const projectID = v4()
        const projectPath = localStorage.getItem(BASE_PATH) + NodeFS.sep + projectID
        if (!(await NodeFS.exists(NodeFS.resolvePath(localStorage.getItem(BASE_PATH))))) {
            alert.pushAlert("Directory not found, creating on root directory.")
            localStorage.setItem(BASE_PATH, NodeFS.rootDir)
        }

        const err = await NodeFS.mkdir(projectPath)
        if (!err)
            await NodeFS.write(NodeFS.resolvePath(projectPath + NodeFS.sep + PROJECT_FILE_EXTENSION), JSON.stringify({
                id: projectID, name, creationDate: new Date().toDateString()
            }))

        setProjectsToShow([
            ...projectsToShow,
            {
                id: projectID,
                meta: {name: name, creationDate: (new Date()).toLocaleDateString()},
                path: NodeFS.resolvePath(localStorage.getItem(BASE_PATH) + NodeFS.sep + projectID)
            }
        ])

        alert.pushAlert(translate("PROJECT_CREATED"), "success")
        openInput = false
        input = ""
    }

    function handler(event) {
        if (!modal.firstChild.contains(event.target))
            openInput = false

    }

    const portal = createPortal(999)
    $: openInput ? portal.open() : portal.close()
    onMount(() => {
        portal.create(modal, {backdropFilter: "blur(2px)"})
        document.addEventListener("mousedown", handler)
    })
    onDestroy(() => {
        portal.destroy()
        document.removeEventListener("mousedown", handler)
    })
</script>


<div class="wrapper">
    <div class="header">{translate("PROJECTS")}</div>

    <button on:click={() => openInput = !openInput} data-overflow="-" data-focusbutton="-" style="height: 25px">
        <Icon>add</Icon>
        {translate("CREATE")}
    </button>
</div>
<div bind:this={modal} class="modal">
    <div class="container">
        <div style="padding: 8px; width: 100%">
            <div style="font-size: 1.1rem; font-weight:550; margin-bottom: 8px">
                {translate("CREATE")}
            </div>
            <Input
                    hasBorder="true"
                    placeholder={translate("PROJECT_NAME")}
                    onEnter={create}
                    width="100%"
                    height={"30px"}
                    directChange={v => input = v}
            />
        </div>
        <div class="footer">
            <button

                    data-focusbutton="-"
                    on:click={() => create(input)}
            >
                <Icon>check</Icon>
                {translate("DONE")}
            </button>
        </div>
    </div>
</div>

<style>
    .wrapper {
        height: clamp(50px, 7vh, 100px);
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;
        max-width: 100%;
    }

    .header {
        font-weight: 550;
        font-size: 1.5rem;
    }


    .container {
        width: 50vw;
        height: fit-content;

        background-color: var(--pj-background-secondary);
        border: var(--pj-border-primary) 1px solid;
        border-radius: 3px;
        box-shadow: var(--pj-boxshadow);
        color: var(--pj-color-secondary);
    }

    .footer {
        border-top: var(--pj-border-primary) 1px solid;
        height: 35px;
        width: 100%;
        background: var(--pj-background-secondary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 4px;
    }

    .modal {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;

        position: fixed;
        z-index: 999;
    }


    .title {
        display: flex;
        align-items: center;
        gap: 16px;
        white-space: nowrap;
    }

    .title > h2 {
        margin: 0;
    }


</style>