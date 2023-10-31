import "@needle-tools/engine";
import "./codegen/register-types"
import { WebXRController, prefix } from "@needle-tools/engine";


export class WebXRControllerPatch {

    @prefix(WebXRController)
    raycast() {
        return false;
    }

}