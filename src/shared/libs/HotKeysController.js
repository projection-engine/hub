import {Engine, ENVIRONMENT, KEYS,} from "../../../public/engine/production";


export default class HotKeysController {

    static activeView
    static views = new Map()
    static holding = new Map()
    static #onUpdate = () => null

    static initializeListener(onUpdate) {
        HotKeysController.#onUpdate = () => onUpdate(HotKeysController.views.get(HotKeysController.activeView))

        function handler(event) {
            const h = HotKeysController.holding

            if (event.repeat || Engine.environment !== ENVIRONMENT.DEV)
                return
            const activeView = HotKeysController.views.get(HotKeysController.activeView)
            const tagName = document.activeElement?.tagName
            if (tagName === "INPUT" || tagName === "TEXTAREA" || !activeView)
                return

            const keysToTest = activeView.actions.length
            if (event.type === "keydown") {
                if (event.ctrlKey) {
                    h.set(KEYS.ControlLeft, true)
                    h.set(KEYS.ControlRight, true)
                }
                if (event.altKey) {
                    h.set(KEYS.AltRight, true)
                    h.set(KEYS.AltLeft, true)
                }
                if (event.shiftKey) {
                    h.set(KEYS.ShiftLeft, true)
                    h.set(KEYS.ShiftRight, true)
                }

                h.set(event.code, true)
                for (let i = 0; i < keysToTest; i++) {
                    const currentAction = activeView.actions[i]
                    let valid = true
                    const required = currentAction.require
                    let toRemove = 0
                    if (h.get(KEYS.ControlLeft))
                        toRemove++
                    if (h.get(KEYS.ShiftLeft))
                        toRemove++
                    if (required.length === (h.size - toRemove)) {
                        for (let j = 0; j < required.length; j++)
                            valid = valid && h.get(required[j])
                        if (valid && !currentAction.disabled && currentAction.callback != null)
                            currentAction.callback()
                    }
                }
            } else {
                if (event.code === KEYS.ControlLeft || event.code === KEYS.ControlRight) {
                    h.delete(KEYS.ControlLeft)
                    h.delete(KEYS.ControlRight)
                }
                else if (event.code === KEYS.AltRight || event.code === KEYS.AltLeft) {
                    h.delete(KEYS.AltRight)
                    h.delete(KEYS.AltLeft)
                }
                else if (event.code === KEYS.ShiftLeft || event.code === KEYS.ShiftRight) {
                    h.delete(KEYS.ShiftLeft)
                    h.delete(KEYS.ShiftRight)
                }
                else
                    h.delete(event.code)
            }
        }

        document.addEventListener("keydown", handler)
        document.addEventListener("keyup", handler)
    }

    static bindAction(element, actions, icon, label) {
        const handler = () => {
            HotKeysController.activeView = element
            HotKeysController.holding.clear()
            HotKeysController.#onUpdate()
        }
        if (HotKeysController.views.get(element))
            HotKeysController.unbindAction(element)
        HotKeysController.views.set(element, {actions, icon, label, handler})

        element.addEventListener("mouseenter", handler)
    }

    static unbindAction(element) {
        const found = HotKeysController.views.get(element)
        if (!found)
            return
        const {handler} = found
        element.removeEventListener("mouseenter", handler)
        HotKeysController.views.delete(element)
    }
}