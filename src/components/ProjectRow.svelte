<script>
    import Localization from "../Localization";
    import Input from "../../shared/frontend/components/input/Input.svelte";
    import Icon from "../../shared/frontend/components/icon/Icon.svelte";
    import "../css/ProjectRow.css"
    import ToolTip from "../../shared/frontend/components/tooltip/ToolTip.svelte";

    const translate = (key) => Localization.HOME[key]

    export let open
    export let data
    export let onRename
    export let selected

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

    <div class={"info card-home"} style="justify-content: flex-end; justify-items: flex-end">
        <strong>{changeDate}</strong>
        <small>{translate("LAST_MODIFIED")}</small>
    </div>
    <div data-vertdivider="-"></div>

    <button on:click={() => open()} data-focusbutton="-">Open</button>
</div>


<style>
    .item-data{
        display: grid;
        justify-content: flex-start;
    }
    small{
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
</style>
