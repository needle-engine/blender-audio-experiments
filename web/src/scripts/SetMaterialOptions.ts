import { Behaviour } from "@needle-tools/engine";
import { AdditiveBlending } from "three";

export class SetMaterialOptions extends Behaviour {
    
    start() {
        // set material to additive
        if (this.gameObject.material)
            this.gameObject.material.blending = AdditiveBlending;
    }
}