import { AudioSource, Behaviour, Collider, GameObject, Mathf, PhysicsMaterialCombine, Rigidbody, SphereCollider, serializable } from '@needle-tools/engine';
import { AudioAnalyser, Color, Mesh, MeshStandardMaterial, Object3D } from 'three';

export class ReactiveMusic extends Behaviour {

    static instance: ReactiveMusic;

    @serializable(AudioSource)
    audioSource!: AudioSource;

    getValue(index: number) {
        if (index < 0 || index >= this.array.length) return 0;
        return this.array[index];
    }

    constructor() {
        super();
        ReactiveMusic.instance = this;
    }

    private array: Uint8Array = new Uint8Array(32);
    private analyser?: AudioAnalyser;

    awake() {
        AudioSource.registerWaitForAllowAudio(() => {
            this.analyser = new AudioAnalyser(this.audioSource.Sound!, this.array.length);
        })
    }

    update() {
        this.analyser?.analyser.getByteFrequencyData(this.array);
    }
}


export class ReactiveSpawn extends Behaviour {

    @serializable(Object3D)
    prefab?: Object3D;

    private _lastSpawn = 0;

    private _spawned: Object3D[] = [];

    awake() {
        if (this.prefab) {
            this.prefab.visible = false;
            const col = GameObject.getComponent(this.prefab, Collider);
            if (col) {
                col.sharedMaterial = {
                    bounceCombine: PhysicsMaterialCombine.Maximum,
                    bounciness: .95,
                    frictionCombine: PhysicsMaterialCombine.Maximum,
                    dynamicFriction: .1,
                    staticFriction: .1,
                }
                console.log(col);
            }
        }
    }

    private _lastValue = 0;
    private _delay = .1;

    update() {
        if (this.context.time.time - this._lastSpawn < this._delay) {
            return;
        }
        if (!this.prefab) return;
        const val = ReactiveMusic.instance.getValue(1);
        this._lastValue = val;
        if (val > 180) {
            this._delay = Mathf.remap(val, 100, 255, .5, .05);
            this._lastSpawn = this.context.time.time;
            const obj = GameObject.instantiate(this.prefab);
            if (!obj) return;
            if(obj instanceof Mesh && Math.random() > .5) {
                const mat = obj.material as MeshStandardMaterial;
                obj.material = mat.clone();
                obj.material.color = new Color(Math.random(), Math.random(), Math.random());
                obj.material.emissive = obj.material.color;
                obj.material.emissiveIntensity = Math.random() * 10;
            }
            obj!.visible = true;
            const s = val / 300;
            obj.scale.multiplyScalar(s * s * s * 5);
            const spacing = .3 + s;
            obj.position.x += Mathf.remap(Math.random(), 0, 1, -1, 1) * spacing;
            obj.position.z += Mathf.remap(Math.random(), 0, 1, -1, 1) * spacing;
            this._spawned.push(obj!);
            if (this._spawned.length > 30) {
                const obj = this._spawned.shift();
                if (obj) GameObject.destroy(obj);
            }
            // if(this.context.time.frame % 90 === 0) this.context.physics.engine?.clearCaches();
        }
    }
}

export class ReactiveSphere extends Behaviour {

    index: number = 0;
    factor: number = .1;

    start() {
        this.index = Math.floor(this.index);
        // for (const obj of this.gameObject.children) {
        //     const rb = GameObject.addNewComponent(obj, Rigidbody);
        //     rb.useGravity = false;
        //     const col = GameObject.addNewComponent(obj, SphereCollider);
        //     col.radius = 1;
        //     console.log(col);
        // }
    }

    update() {
        const val = ReactiveMusic.instance.getValue(this.index);
        let xyz = val * this.factor * .05;
        xyz *= xyz;
        if (xyz <= 0) return;
        for (const obj of this.gameObject.children) {
            if (!obj) continue;
            let size = xyz;
            if (obj["startSize"] === undefined) obj["startSize"] = obj.scale.x;
            size = xyz + obj["startSize"];
            obj.scale.set(size, size, size);
            obj.rotateY(xyz * .05);
            // const col = GameObject.getComponent(obj, SphereCollider);
            // col!.radius = xyz;
            if (!obj["startPos"]) obj["startPos"] = obj.position.clone();
            if (!obj["tOffset"]) obj["tOffset"] = Math.random() * 1000;
            const t = this.context.time.time * 2;
            const pf = 5 * 1 / obj["startSize"];
            const toff = obj["tOffset"];
            const offsetx = (Math.sin(t + toff) * .5) + .5;
            const offsety = (Math.sin(t + toff) * .5) + .5;
            const offsetz = (Math.sin(t + toff) * .5) + .5;
            obj.position.x = obj["startPos"].x + (offsetx * pf);
            obj.position.y = obj["startPos"].y + (offsety * pf);
            obj.position.z = obj["startPos"].z + (offsetz * pf);

            // if (obj instanceof Mesh) {
            //     if (!obj["emissionStrength"]) obj["emissionStrength"] = obj.material.emissiveIntensity;
            //     const tc = (xyz * xyz);
            //     obj.material.emissiveIntensity = obj["emissionStrength"] * .5 + (tc * 10);
            //     if (obj.material instanceof MeshStandardMaterial) {
            //         if (!obj.material["_emissionColor"]) obj.material["_emissionColor"] = obj.material.emissive.clone();
            //         obj.material.emissive.lerpColors(new Color(0x000000), obj.material["_emissionColor"], (xyz*xyz*xyz) * 2);
            //         obj.material.color.copy(obj.material.emissive);
            //     }
            // }
        }
    }
}