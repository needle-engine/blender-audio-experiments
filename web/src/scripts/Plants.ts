import { Behaviour } from "@needle-tools/engine";
import { Vector3 } from "three";



export class Plant extends Behaviour {

    private _originalScale!: Vector3;
    private _targetScale!: Vector3;

    awake(): void {
        this._originalScale = new Vector3(1, 1, 1);// this.gameObject.scale.clone();
        this.gameObject.scale.set(0, 0, 0);
    }

    onEnable(): void {
        this.gameObject.scale.set(0, 0, 0);
        if (!this._targetScale) this._targetScale = new Vector3();
        this._targetScale.copy(this._originalScale);
        this._targetScale.multiplyScalar(.5 + Math.random() * .5);
    }

    update(): void {
        this.gameObject.scale.lerp(this._targetScale, this.context.time.deltaTime * 1);
    }

}