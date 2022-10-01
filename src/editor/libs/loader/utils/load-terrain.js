import FilesAPI from "../../../../shared/libs/files/FilesAPI";
import FilesStore from "../../../stores/FilesStore";
import TerrainWorker from "../../../../../public/engine/workers/terrain/TerrainWorker";
import {COMPONENTS, Entity, GPU} from "../../../../../public/engine/production";
import dispatchRendererEntities, {ENTITY_ACTIONS} from "../../../stores/templates/dispatch-renderer-entities";

export default async function loadTerrain(reg) {
    const file = await FilesAPI.readFile(FilesStore.ASSETS_PATH + FilesAPI.sep + reg.path, "json")
    if (!file.image) {
        alert.pushAlert("No height-map present", "error")
        return
    }
    const data = await TerrainWorker.generate(file.image, file.scale, file.dimensions)
    GPU.allocateMesh(reg.id, data)
    const entity = new Entity()
    entity.addComponent(COMPONENTS.TERRAIN)

    entity.components.get(COMPONENTS.TERRAIN).terrainID = reg.id

    dispatchRendererEntities({type: ENTITY_ACTIONS.ADD, payload: entity})
}