import { Behaviour } from "@needle-tools/engine";
import { Vector3 } from "three";
import { type IAudioInterface } from "./ReactiveMusic";

export class Plant extends Behaviour {

    private _originalScale!: Vector3;
    private _targetScale!: Vector3;

    // @nonSerialized
    spawner?: IAudioInterface;

    awake(): void {
        this._originalScale = new Vector3(1, 1, 1);// this.gameObject.scale.clone();
        this.gameObject.scale.set(0, 0, 0);

        // HACK set pos to 0 0 0
        for (const ch of this.gameObject.children) {
            ch.position.set(0, 0, 0);
        }
    }

    onEnable(): void {
        this.gameObject.scale.set(0, 0, 0);
        if (!this._targetScale) this._targetScale = new Vector3();
        this._targetScale.copy(this._originalScale);
        this._targetScale.multiplyScalar(.5 + Math.random() * .5);
    }

    update(): void {
        if (this.spawner) {
            let vol = this.spawner.currentVolume;
            vol *= vol;
            this.gameObject.scale.lerp(this._targetScale, this.context.time.deltaTime * 1 * vol);
        }
    }

}