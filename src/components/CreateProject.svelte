<script>
    import Input from "../../shared/frontend/components/input/Input.svelte";
    import Icon from "../../shared/frontend/components/icon/Icon.svelte";
    import {v4} from "uuid";
    import BASE_PATH from "../BASE_PATH";
    import NodeFS from "../../shared/frontend/libs/NodeFS";
    import PROJECT_FILE_EXTENSION from "../../shared/PROJECT_FILE_EXTENSION";

    export let translate
    export let close
    export let setProjectsToShow
    export let projectsToShow
    let input

    const create = async (name = translate("PROJECT_NAME")) => {
        const projectID = v4()
        const projectPath = localStorage.getItem(BASE_PATH) + NodeFS.sep + projectID
        if (!(await NodeFS.exists(NodeFS.resolvePath(localStorage.getItem(BASE_PATH))))) {
            alert.pushAlert("Directory not found, creating on root directory.")
            localStorage.setItem(BASE_PATH, NodeFS.rootDir)
        }

        const err = await NodeFS.mkdir(projectPath)
        const meta = {name: name, creationDate: (new Date()).toLocaleDateString(), version: localStorage.getItem("CURRENT_VERSION")}
        if (!err)
            await NodeFS.write(NodeFS.resolvePath(projectPath + NodeFS.sep + PROJECT_FILE_EXTENSION), JSON.stringify(meta))

        setProjectsToShow([
            ...projectsToShow,
            {
                id: projectID,
                meta,
                path: NodeFS.resolvePath(localStorage.getItem(BASE_PATH) + NodeFS.sep + projectID)
            }
        ])

        alert.pushAlert(translate("PROJECT_CREATED"), "success")
        close()
        input = ""
    }

</script>


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

<style>

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

</style>