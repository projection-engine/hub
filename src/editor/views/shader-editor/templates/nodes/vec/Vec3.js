import Node from "../Node"
import DATA_TYPES from "../../../../../../../public/engine/static/DATA_TYPES"
import NODE_TYPES from "../../../../../../../public/engine/editor/libs/material-compiler/templates/NODE_TYPES"
import checkGlslFloat from "../../../utils/check-glsl-float"


export default class Vec3 extends Node {
    v = [0,0,0]
    uniform = false

    constructor() {
        super([
            {
                label: "Dynamic",
                key: "uniform",
                type: DATA_TYPES.CHECKBOX,
            },
            {label: "Vector", key: "v", type: DATA_TYPES.VEC3},
        ], [
            {label: "Value", key: "VEC3_VAR", type: DATA_TYPES.VEC3},
        ])

        this.name = "Vec3"
        this.size = 2
    }

    get type() {
        if (this.uniform)
            return NODE_TYPES.VARIABLE
        else
            return NODE_TYPES.STATIC
    }

     

    async getInputInstance(index, uniforms, uniformData) {

        if (this.uniform) {

            this.uniformName = `VEC3_VAR${index}`
            uniformData.push({
                label: this.name,
                key: this.uniformName,
                type: DATA_TYPES.VEC3,
                data: this.v
            })
            uniforms.push({
                label: this.name,
                key: this.uniformName,
                type: DATA_TYPES.VEC3
            })

            return `uniform float ${this.uniformName};`
        } else {
            this.uniformName = `VEC3_VAR${index}`
            return `#define ${this.uniformName} vec3(${checkGlslFloat(this.v[0])}, ${checkGlslFloat(this.v[1])}, ${checkGlslFloat(this.v[2])})`
        }
    }

    getFunctionCall(_, index) {
        this.VEC3_VAR = "VEC3_VAR" + index
        return ""
    }
}