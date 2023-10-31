import { Behaviour, GameObject, serializable } from "@needle-tools/engine";
import { Bone, Object3D, SkinnedMesh } from "three";
import { ReactiveSpawnRaycast } from "./ReactiveMusic";


export class DancingBones extends Behaviour {

    @serializable()
    fixEnds:boolean = false;

    private spawner?: ReactiveSpawnRaycast;
    private skinnedMeshes: SkinnedMesh[] = [];


    onEnable(): void {
        this.gameObject.traverse((child: Object3D) => {
            if (child instanceof SkinnedMesh) {
                if (!this.skinnedMeshes) this.skinnedMeshes = [];
                this.skinnedMeshes.push(child);
                child.layers.disableAll();
                child.layers.enable(2);
            }
        });
        this.spawner = this.gameObject.getComponentInParent(ReactiveSpawnRaycast)!;

    }

    private _offset = 0;

    update(): void {
        if (!this.spawner) return;
        const vol = this.spawner!.currentVolume;
        const freq = Math.pow(vol, 3);
        this._offset += freq * this.context.time.deltaTime * 10;
        const factor = this._offset;

        for (const mesh of this.skinnedMeshes) {
            for (let i = 0; i < mesh.skeleton.bones.length; i++) {
                const bone = mesh.skeleton.bones[i];
                if (this.fixEnds) {
                    if (i === 0 || i === mesh.skeleton.bones.length - 1) {
                        continue;
                    }
                }
                bone.rotation.x = Math.sin(factor * .5) * .1 * Math.sin(i * .1);
                bone.rotation.y = Math.sin(factor * .5) * .3;
                bone.rotation.z = Math.cos(factor * .5) * .1 * Math.cos(i * .1);
            }
        }
    }

}