import { Behaviour, serializable, showBalloonMessage } from '@needle-tools/engine';

// Read about how to create a new component here: https://docs.needle.tools/scripting


export class RotateBrownian extends Behaviour {
    
    update(): void {
        this.gameObject.rotateX(0.01);
        this.gameObject.rotateY(0.01);
        this.gameObject.rotateZ(0.01);
    }
}