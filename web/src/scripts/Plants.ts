import { Behaviour, ObjectUtils, PrimitiveType } from "@needle-tools/engine";
import { MeshBasicMaterial, Object3D, Vector3 } from "three";
import { type IAudioInterface } from "./ReactiveMusic";

let showColliders = false;

export class Plant extends Behaviour {

    private _originalScale!: Vector3;
    private _targetScale!: Vector3;

    // @nonSerialized
    spawner?: IAudioInterface;

    private _colliderCube?: Object3D;

    awake(): void {
        this._originalScale = new Vector3(1, 1, 1);// this.gameObject.scale.clone();
        this.gameObject.scale.set(0, 0, 0);

        // HACK set pos to 0 0 0
        for (const ch of this.gameObject.children) {
            ch.position.set(0, 0, 0);
        }

        // TODO: this is now scaled too so not really working well as a collider thingy
        const cube = ObjectUtils.createPrimitive(PrimitiveType.Cube);
        this._colliderCube = cube;
        cube.name = "IgnoreRaycast";
        cube.scale.y = 3;
        cube.position.copy(this.gameObject.position);
        const mat = new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0 });;
        cube.material = mat
        this.gameObject.parent!.add(cube);
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
            vol = Math.pow(vol, 5);
            this.gameObject.scale.lerp(this._targetScale, this.context.time.deltaTime * 15 * vol);
        }

        if (this._colliderCube) {
            this._colliderCube.position.copy(this.gameObject.position);
        }
    }

}