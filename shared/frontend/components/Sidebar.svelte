<script>
    import Icon from "./icon/Icon.svelte";
    import Localization from "../libs/Localization";
    import ResizableBar from "./resizable/ResizableBar.svelte";
    import ToolTip from "./tooltip/ToolTip.svelte";
    import logo from "../../APP_LOGO.png"

    const THRESHOLD = 65
    const {shell} = window.require("electron")

    export let tab
    export let setTab
    export let options

    let hidden = true
</script>

<div class="wrapper" style={hidden ? "width: 50px;" : undefined}>
    {#each options as op, i}
        <button class="button" class:active={tab === i} on:click={() => setTab(i)} class:hidden={hidden}>
            <Icon styles="font-size: .9rem">{op[0]}</Icon>
            {#if !hidden}
                {op[1]}
            {/if}
            <ToolTip content={op[1]}/>
        </button>
    {/each}

    <div
            class="button"
            style={"cursor: alias; padding: 8px; margin-top: auto;" + (hidden ? "justify-content: center;" : "justify-content: space-between;")}
            on:click={() => shell.openExternal("https://github.com/projection-engine")}
    >
        <img src={logo} alt="logo"/>
        {#if !hidden}
            <small>{Localization.COMPONENTS.ABOUT.VERSION}</small>
        {/if}
        <ToolTip content={Localization.COMPONENTS.ABOUT.VERSION}/>
    </div>
</div>
<ResizableBar
        type="width"
        onResizeEnd={(_, ref) => {

            const bBox = ref.getBoundingClientRect()
            if(bBox.width <= THRESHOLD)
                hidden = true
        }}
        onResizeStart={(isReset) => hidden = isReset}
/>

<style>
    small {
        font-size: .65rem
    }


    .wrapper {
        min-width: 50px;
        position: relative;
        padding: 4px;

        display: flex;
        flex-direction: column;

        gap: 4px;
        background: var(--pj-background-secondary);
        /*border-right: var(--pj-border-primary) 1px solid;*/
        overflow: hidden;
    }

    .button {
        display: flex;
        align-items: center;
        gap: 4px;

        width: 100%;
        height: 35px;

        border: none;
        border-radius: 5px;
        color: var(--pj-color-quaternary);
        font-size: .8rem;
        font-weight: 500;

        overflow: hidden;
        white-space: nowrap;
        cursor: pointer;
    }

    .button:hover,     .active {
        color: var(--pj-color-primary) !important;
        background: var(--pj-background-primary);
    }

    img {
        max-height: 100%;
        overflow: hidden;
        border-radius: 3px;
    }

    .hidden {
        justify-content: center;
        justify-items: center;
    }
</style>