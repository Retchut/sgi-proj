/**
 * MyAnimation
 * @constructor
 */
export class MyAnimation {
    constructor(scene) {
        this.scene = scene;
        
        this.startTime;
        this.endTime;
        this.timeElapsed = 0;
        this.animationTransfMatrix = mat4.create();
    }

    /** 
     * Update the animation
     * @param {integer} t - the current instant
     */
    update(t) { }

    /** 
     * Apply the animation matrix
     */
    apply() { }
}