<script>
    import Localization from "../Localization";
    import Input from "shared-resources/frontend/components/input/Input.svelte";
    import Icon from "shared-resources/frontend/components/icon/Icon.svelte";
    import Dropdown from "shared-resources/frontend/components/dropdown/Dropdown.svelte";
    import "../css/ProjectRow.css"
    import ToolTip from "shared-resources/frontend/components/tooltip/ToolTip.svelte";

    const translate = (key) => Localization.HOME[key]

    export let open
    export let data
    export let onRename
    export let selected
    export let defaultVersion
    export let updateVersion
    export let installedVersions
    $: isSelected = selected === data.id
    let changeDate
    let hovered


    $: {
        if (data.meta.lastModification) {
            let a = new Date()
            let b = new Date(a.getTime() - 8.64e+7)
            let c = new Date(data.meta.lastModification)

            b.setHours(0)
            b.setMinutes(0)
            b.setSeconds(0, 0)

            a.setHours(0)
            a.setMinutes(0)
            a.setSeconds(0, 0)

            c.setHours(0)
            c.setMinutes(0)
            c.setSeconds(0, 0)

            if (a.getTime() === c.getTime())
                changeDate = "Today";
            else if (b.getTime() === c.getTime())
                changeDate = "Yesterday";
            else
                changeDate = data.meta.lastModification
        } else
            changeDate = translate("NEVER")
    }


    let openForChange = false
</script>


<div style={isSelected ? "border-color: var(--pj-accent-color)" : ""} class="wrapper card-home" data-card={data.id}
     on:mouseenter={() => hovered = true} on:mouseleave={() => hovered = false}>
    <div
            class="info card-home"
            style="width: 200%; display: flex; justify-content: unset; gap: 4px"
            on:dblclick={() => openForChange = true}
    >
        <ToolTip content={Localization.HOME.DOUBLE_CLICK}/>
        {#if openForChange}
            <Input
                    placeholder={data.meta.name}
                    searchString={data.meta.name}
                    width="200%"
                    setSearchString={v => {
                    data.meta.name = v
                    onRename(v)
                }}
                    onBlur={(changed, v) => {
                    if(changed){
                       onRename(v)
                       data.meta.name = v
                    }
                   openForChange = false
                }}
                    onEnter={v => {
                    data.meta.name = v
                    openForChange = false
                    onRename(v)
                }}
            />
        {:else}
            <div class="item-data">
                <strong>{data.meta.name}</strong>
                <small>{data.path}</small>
            </div>
        {/if}

    </div>

    <div class="content">
        <Dropdown asButton={true} buttonStyles=" background: var(--pj-background-primary);">
            <button style="border: none;min-width: 75px;" slot="button">
                {#if data.meta.version != null}
                    {data.meta.version}
                {:else}
                    {translate("NO_VERSION_USING_DEFAULT")}
                {/if}
            </button>
            <div class="warning">
                {translate("VERSION_WARNING")}
            </div>
            <div data-divider="-"></div>
            {#each installedVersions as version}
                <button on:click={() => updateVersion(version)}>
                    {#if data.meta.version === version}
                        <Icon styles="font-size: .9rem">check</Icon>
                        {:else}
                        <div style="width: .9rem"></div>
                    {/if}
                    {version}
                </button>
            {/each}
        </Dropdown>
        <div data-vertdivider="-"></div>
        <div class={"info card-home"} style="text-align: right" data-overflow="-">
            <strong>{changeDate}</strong>
            <small>{translate("LAST_MODIFIED")}</small>
        </div>
        <div data-vertdivider="-"></div>
        <button disabled={!defaultVersion} on:click={() => open()} data-focusbutton="-">Open</button>
    </div>
</div>


<style>
    .item-data {
        display: grid;
        justify-content: flex-start;
    }

    small {
        font-size: .65rem;
    }

    strong {
        font-weight: 550;
    }

    .open-icon > small {
        opacity: 0;
    }

    .hovered > small {
        opacity: 1;
    }

    .content {
        margin-left: 8px;
        width: fit-content;
        display: flex;
        align-items: center;
        gap: 2px;
        justify-content: flex-end;
        justify-items: flex-end;
    }
.warning{
    color: darkorange;
    padding: 4px;
    font-size: .75rem;
    font-weight: 550;
}
</style>
