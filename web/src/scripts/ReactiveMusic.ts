import { AudioSource, Behaviour, Collider, GameObject, Mathf, PhysicsMaterial, PhysicsMaterialCombine, Rigidbody, SphereCollider, serializable } from '@needle-tools/engine';
import { AudioAnalyser, Color, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';


export class ReactiveMusic extends Behaviour {

    static instance: ReactiveMusic;

    @serializable(AudioSource)
    audioSource!: AudioSource;

    private _frequencies = 32;

    private getValue(index: number) {
        if (index < 0 || index >= this.array.length) return 0;
        return this.array[index];
    }
    getValueNormalized(index: number) {
        return this.getValue(index) / 255;
    }
    getValueNormalized01(index: number) {
        const i = Math.floor(index * this._frequencies);
        return this.getValue(i) / 255;
    }
    getAverageFrequency() {
        return this.analyser?.getAverageFrequency();
    }
    getAverageFrequencyNormalized() {
        if (!this.analyser) return 0;
        return this.analyser.getAverageFrequency() / 255;
    }

    constructor() {
        super();
        ReactiveMusic.instance = this;
    }

    private array: Uint8Array = new Uint8Array(this._frequencies);
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
        const val = ReactiveMusic.instance.getValueNormalized(1);
        this._lastValue = val;
        if (val > 180) {
            this._delay = Mathf.remap(val, 100, 255, .5, .05);
            this._lastSpawn = this.context.time.time;
            const obj = GameObject.instantiate(this.prefab);
            if (!obj) return;
            if (obj instanceof Mesh && Math.random() > .5) {
                const mat = obj.material as MeshStandardMaterial;
                obj.material = mat.clone();
                obj.material.color = new Color(Math.random(), Math.random(), Math.random());
                obj.material.emissive = obj.material.color;
                obj.material.emissiveIntensity = Math.random() * 10;
            }
            obj!.visible = true;
            const s = val / 255;
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

    @serializable()
    index: number = 0;
    @serializable()
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
        const val = ReactiveMusic.instance.getValueNormalized(this.index);
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



export class ReactiveAttraction extends Behaviour {

    @serializable(Object3D)
    target?: Object3D;

    @serializable()
    dragFactor: number = 20;

    @serializable()
    massFactor: number = 5;

    @serializable()
    bouncyNess: number = .5;

    private _rbs: Rigidbody[] = [];

    start() {
        const colPhysicsMaterial: PhysicsMaterial = {
            bounceCombine: PhysicsMaterialCombine.Maximum,
            bounciness: this.bouncyNess,
            frictionCombine: PhysicsMaterialCombine.Maximum,
            dynamicFriction: .1,
        }
        for (const ch of this.gameObject.children) {
            const rb = GameObject.getOrAddComponent(ch, Rigidbody);
            this._rbs.push(rb);
            rb.useGravity = false;
            rb.autoMass = false
            rb.mass = ch.scale.x * this.massFactor;
            const col = GameObject.getOrAddComponent(ch, SphereCollider);
            col.radius = 1;
            col.sharedMaterial = colPhysicsMaterial
        }
    }

    private _temp = new Vector3();
    update(): void {
        const val = ReactiveMusic.instance.getValueNormalized(4);
        if (val > .53) {
            for (const rb of this._rbs) {
                rb.drag = .5;
                const rf = 5;
                const rdx = Mathf.remap(Math.random(), 0, 1, -rf, rf);
                const rdy = Mathf.remap(Math.random(), 0, 1, -rf, rf);
                const rdz = Mathf.remap(Math.random(), 0, 1, -rf, rf);
                this._temp.copy(this.target!.position)
                this._temp.x += rdx;
                this._temp.y += rdy;
                this._temp.z += rdz;
                const dir = this._temp.sub(rb.gameObject.position);
                dir.normalize();
                rb.applyImpulse(dir.multiplyScalar(val * 55));
            }
        }
        else if (val <= .3) {
            for (const rb of this._rbs) rb.drag += this.dragFactor * this.context.time.deltaTime;
        }
    }

}



export class ReactiveSpawnRaycast extends Behaviour {

    @serializable(ReactiveMusic)
    music!: ReactiveMusic;

    awake() {
        console.log(this.music)
        if (!this.music) this.music = ReactiveMusic.instance;
    }

    update(): void {
        const val = this.music.getAverageFrequencyNormalized();
        console.log(val);

    }

}