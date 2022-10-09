<script>
    import Icon from "shared-resources/frontend/components/icon/Icon.svelte";
    import {onDestroy, onMount} from "svelte";
    import createPortal from "shared-resources/frontend/components/create-portal";
    import BASE_PATH from "../BASE_PATH";
    import ToolTip from "shared-resources/frontend/components/tooltip/ToolTip.svelte";
    import CreateProject from "./CreateProject.svelte";

    const {ipcRenderer} = window.require("electron")


    export let setProjectsToShow
    export let projectsToShow
    export let setSearchString
    export let searchString
    export let translate
    export let setBasePath
    export let basePath
    export let defaultVersion
    export let isReleaseValid
    let openInput = false
    let modal

    function handler(event) {
        if (!modal.firstChild.contains(event.target))
            openInput = false
    }

    const portal = createPortal(999)
    $: openInput ? portal.open() : portal.close()

    onMount(() => {

        portal.create(modal, {backdropFilter: "blur(2px)"})
        document.addEventListener("mousedown", handler)
        ipcRenderer.on("open-selection", (event, data) => {
            if (data != null)
                setBasePath(data)
            localStorage.setItem(BASE_PATH, data)
        })
    })
    onDestroy(() => {
        portal.destroy()
        document.removeEventListener("mousedown", handler)
    })


</script>


<div class="wrapper">
    <div class="left-content">
        <div class="header">{translate("PROJECTS")}</div>
        <div data-vertdivider="-"></div>
        <small style="font-size: .7rem">{basePath}</small>
        <button
                class="settings-button"

                on:click={() => ipcRenderer.send("open-selection")}
        >
            <Icon styles="font-size: .9rem">settings</Icon>
            <ToolTip content={translate("CHANGE_BASE_DIR")}/>
        </button>
        <div data-vertdivider="-"></div>
        {#if defaultVersion}
            <small style={(isReleaseValid ? "": "color: #ff5555;") + "font-size: .7rem"}>
                {defaultVersion}
                {#if !isReleaseValid}
                    <ToolTip content={translate("NO_VERSION_INSTALLED")}/>
                {/if}
            </small>
        {:else}
            <small style="font-size: .7rem; color: #ff5555; font-weight: 550">{translate("NO_VERSION")}</small>
        {/if}
    </div>

    <button
            disabled={!isReleaseValid}
            on:click={() => openInput = true}
            data-overflow="-"
            data-focusbutton="-"
            style="height: 25px"
    >
        <Icon>add</Icon>
        {translate("CREATE")}
    </button>
</div>
<div bind:this={modal} class="modal">
    <div class="container">

        <CreateProject
                setProjectsToShow={setProjectsToShow}
                projectsToShow={projectsToShow}
                translate={translate}
                close={() => openInput = false}
        />
    </div>
</div>

<style>
    .settings-button {
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .left-content {
        display: flex;
        align-items: center;
        gap: 2px;
    }

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


    .modal {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;

        position: fixed;
        z-index: 999;
    }


</style>