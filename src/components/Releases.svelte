<script>
    import {onMount} from "svelte";
    import Localization from "../Localization";
    import ReleaseRow from "./ReleaseRow.svelte";

    import List from "./List.svelte";

    export let installedReleases = []
    export let setVersionOnDownload

    let searchString = ""
    let releases = []
    let defaultVersion
    onMount(() => {
        defaultVersion = localStorage.getItem("CURRENT_VERSION")
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

</script>

<div class="header-wrapper">
    <div class="header">{translate("RELEASES")}</div>
</div>


<List
        let:item
        getLabel={e => e.tag_name}
        items={releases}
        favoriteKey={"RELEASES"}
        getID={e => e.tag_name}
>
    <ReleaseRow
            setVersionOnDownload={setVersionOnDownload}
            defaultVersion={defaultVersion}
            setDefaultVersion={v => defaultVersion = v}
            installedReleases={installedReleases}
            release={item}
    />
</List>


<style>
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