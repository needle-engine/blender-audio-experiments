import { Behaviour } from "@needle-tools/engine";

export class OccluderMesh extends Behaviour {
    start() {
        // ensure this object is not raycasted
        this.gameObject.layers.set(2);

        // 
    }
}