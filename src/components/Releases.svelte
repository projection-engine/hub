<script>
    import {onMount} from "svelte";
    import Icon from "../../shared/frontend/components/icon/Icon.svelte";
    import Localization from "../Localization";
    import Input from "../../shared/frontend/components/input/Input.svelte";
    import ReleaseRow from "./ReleaseRow.svelte";
    import ReleaseInfo from "./ReleaseInfo.svelte";
    import List from "./List.svelte";

    let searchString = ""

    let releases = []
    onMount(() => {
        fetch("https://api.github.com/repos/projection-engine/editor/releases", {method: "get"})
            .then(async res => {
                releases = await res.json()
            })
            .catch(err => {
                console.error(err)
                alert.pushAlert("Some error occurred")
            })
    })

    const translate = (key) => Localization.HOME[key]
    let openRelease
</script>

<div class="header-wrapper" style={openRelease != null ? "gap: 8px; justify-content: flex-start" : undefined}>
    {#if openRelease != null}
        <button on:click={() => openRelease = undefined} class="button">
            <Icon>arrow_back</Icon>
        </button>
    {/if}
    <div class="header">{translate("RELEASES")}</div>
</div>
{#if !openRelease}

    <List
            let:item
            getLabel={e => e.tag_name}
            items={releases}
            favoriteKey={"RELEASES"}
            getID={e => e.tag_name}
    >
        <ReleaseRow release={item} openRelease={() => openRelease = item}/>
    </List>
{:else}
    <ReleaseInfo release={openRelease} close={() => openRelease = undefined}/>
{/if}

<style>
    .button {

        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
    }

    .header {
        font-weight: 550;
        font-size: 1.5rem;
        white-space: nowrap;
    }

    .header-wrapper {
        min-height: clamp(50px, 7vh, 100px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
        max-width: 100%;
    }
</style>