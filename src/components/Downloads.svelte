<script>
    import {onDestroy, onMount} from "svelte";
    import createPortal from "shared-resources/frontend/components/create-portal";
    import Localization from "../Localization";
    import Icon from "shared-resources/frontend/components/icon/Icon.svelte";

    export let open
    export let progress

    let modal
    const portal = createPortal(999, false)
    $: open ? portal.open() : portal.close()
    const translate = (key) => Localization.HOME[key]
    onMount(() => {
        portal.create(modal, {
            width: "fit-content",
            height: "fit-content",
            position: "fixed",
            inset: "auto",
            bottom: "8px",
            right: "8px"
        })
    })

    onDestroy(() => portal.destroy())

</script>

<div bind:this={modal} class="modal">
    <div class="header">
        {translate("DOWNLOADS")}
    </div>
    <div data-divider="-"></div>
    {#if progress.progress > -1}

        <div class="section">
            <div data-inline="-" style="justify-content: space-between">
                <small style="font-size: .75rem">{progress.name}</small>
                <small style="font-size: .65rem">{progress.size}mb</small>
            </div>
            <progress max="100" value={progress.progress}></progress>
        </div>
    {:else}
        <div data-empty="-" style="position: relative; transform: none; top: initial; left: initial">
            <Icon styles="font-size: 75px; color: #999;">file_download</Icon>
            {Localization.HOME.EMPTY}
        </div>
    {/if}
</div>

<style>
    .section{
        padding: 4px;
        width: 100%;
        display: grid;
        gap: 4px;
    }
    progress{
        width: 100%;
        height: 25px;
        border-radius: 25px;
    }
    progress[value]::-webkit-progress-bar {
        background-color: var(--pj-background-tertiary);
        border-radius: 5px;
        overflow: hidden;
    }
    progress[value]::-webkit-progress-value {
        background: var(--pj-accent-color);
    }
    .header {
        width: 100%;
        font-size: .9rem;
        font-weight: 550;
        text-align: left;
        padding-bottom: 8px;
    }

    .modal {
        border-radius: 3px;
        width: clamp(250px, 20vw, 1000px);
        height: fit-content;
        min-height: 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px;
        background: var(--pj-background-secondary);
        box-shadow: var(--pj-boxshadow);
    }
</style>