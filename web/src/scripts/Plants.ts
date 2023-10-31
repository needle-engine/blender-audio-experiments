import { Behaviour, Mathf, ObjectUtils, PrimitiveType, getParam, serializable } from "@needle-tools/engine";
import { Color, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { ReactiveSpawnRaycast, type IAudioInterface } from "./ReactiveMusic";

let showColliders = false;
const growFast = getParam("growfast");

export class Plant extends Behaviour {
    @serializable()
    speed: number = 1;

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
        cube.scale.x = .5;
        cube.scale.z = .5;
        cube.scale.y = 3;
        cube.position.copy(this.gameObject.position);
        const mat = new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0, depthWrite: false, colorWrite: false });;
        cube.material = mat;
        this.gameObject.parent!.add(cube);
    }

    onEnable(): void {
        this.gameObject.scale.set(0, 0, 0);
        if (!this._targetScale) this._targetScale = new Vector3();
        this._targetScale.copy(this._originalScale);
        this._targetScale.multiplyScalar(.6 + Math.random() * .8);
    }

    update(): void {
        if (this.spawner) {
            let vol = this.spawner.currentVolume;
            if (!growFast)
                vol = Math.pow(vol, 5);
            this.gameObject.scale.lerp(this._targetScale, this.context.time.deltaTime * 8 * vol * this.speed);
        }

        if (this._colliderCube) {
            this._colliderCube.position.copy(this.gameObject.position);
        }
    }

}


export class PlantEmission extends Behaviour {

    @serializable()
    speed: number = 1;

    private _offset: number = 0;
    private spawner?: ReactiveSpawnRaycast;

    private _materials: MeshStandardMaterial[] = [];
    private _speedFactor: number = 1;
    private _tint: Color = new Color();

    onEnable(): void {
        this._offset = Math.random() * 100;
        this._speedFactor = .5 + Math.random() * .5;
        this.spawner = this.gameObject.getComponentInParent(ReactiveSpawnRaycast)!;
        this._materials.length = 0;
        this.gameObject.traverseVisible((child) => {
            if (child instanceof Mesh) {
                if (child.material instanceof MeshStandardMaterial) {
                    const clone = child.material.clone();
                    child.material = clone;
                    this._materials.push(clone);
                }
            }
        });
        // this._tint = new Color();
        this._tint = this._materials[0]!.emissive.clone();
        this._tint.offsetHSL(Mathf.random(-.05, .05), 0, 0);
    }

    update(): void {

        const freq = Math.pow(this.spawner!.currentVolume, 4);
        this._offset += freq * this.context.time.deltaTime * 2;
        const factor = this._offset;
        for (const mat of this._materials) {
            mat.emissiveIntensity = Mathf.remap(Math.sin(factor * 3), -1, 1, .1, 2);
            mat.emissiveMap!.offset.x = (factor * this._speedFactor * this.speed) % 1;
            mat.emissive.set(this._tint);
        }
    }

}


export class StoneBehaviour extends Behaviour {

    private spawner?: ReactiveSpawnRaycast;

    @serializable()
    scaleFactorMin: number = .7;
    @serializable()
    scaleFactorMax: number = 1.5;

    private _targetScale!: Vector3;

    onEnable(): void {
        this.gameObject.rotation.y = Math.random() * Math.PI * 2;
        this.spawner = this.gameObject.getComponentInParent(ReactiveSpawnRaycast)!;
        this._targetScale = new Vector3(1,1,1).multiplyScalar(Mathf.random(this.scaleFactorMin, this.scaleFactorMax));
        this.gameObject.scale.set(0, 0, 0);
        // this.gameObject.rotation.x = Mathf.random(-.1, .1);
        // this.gameObject.rotation.z = Mathf.random(-.1, .1);
    }

    update(): void {
        if (!this.spawner) return;
        const freq = Math.pow(this.spawner!.currentVolume, 3);
        this.gameObject.scale.lerp(this._targetScale, this.context.time.deltaTime * freq * 20);
        // this.gameObject.rotateY(freq * this.context.time.deltaTime * 5 + this.context.time.deltaTime * .1);
    }

}