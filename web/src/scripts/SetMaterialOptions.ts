import { Behaviour } from "@needle-tools/engine";
import { AdditiveBlending } from "three";

export class SetMaterialOptions extends Behaviour {

    start() {
        // set material to additive
        // @ts-ignore
        if (this.gameObject.material)
        {
            // @ts-ignore
            this.gameObject.material.blending = AdditiveBlending;
            this.gameObject.material.depthWrite = false;
            this.gameObject.material.transparent = true;
        }
    }
}