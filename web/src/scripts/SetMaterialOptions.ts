import { Behaviour } from "@needle-tools/engine";
import { AdditiveBlending } from "three";

export class SetMaterialOptions extends Behaviour {

    start() {
        // set material to additive
        // @ts-ignore
        if (this.gameObject.material)
        {
            // @ts-ignore
            const mat = this.gameObject.material;
            mat.blending = AdditiveBlending;
            mat.depthWrite = false;
            mat.transparent = true;
            mat.opacity = 0.2;

            // HACK marcel doesn't like them :(
            // this.gameObject.visible = false;
        }
    }
}