import { MyAnimation } from "./MyAnimation.js";
import { MyKeyframe } from "./MyKeyframe.js";

const DEGREE_TO_RAD = Math.PI / 180

/**
 * MyKeyframeAnimation
 * @constructor
 */
export class MyKeyframeAnimation extends MyAnimation {
    constructor(scene, keyframes) {
        super(scene);
        
        this.keyframes = keyframes;
        this.currentKeyframe = 0;
        this.active = false;
        this.ended = false;
        this.lastKeyframeTransfMat = this.buildLastKeyframeTransf();
    }

    /**
     * Iniitializes time-related variables
     * @returns 0 on success, 1 otherwise
     */
    initAnimationTime(){
        if(this.keyframes.length === 0){
            console.log("Error initiating animation: no keyframes in animation.")
            return 1;
        }
        this.timeElapsed = 0;
        this.startTime = this.keyframes[0].instant;
        this.endTime = this.keyframes[this.keyframes.length -1].instant;
        return 0;
    }

    /**
     * 
     * @param {MyKeyframe} thisKeyframe - The current keyframe object
     * @param {MyKeyframe} nextKeyframe - The next keyframe object
     * @param {Float32Array} percentageComplete - Float representing for what part of the tranformation we have to interpolate the transformation
     */
     linearInterpolateTransf(thisKeyframe, nextKeyframe, percentageComplete){
        var translationInterpolated = vec3.create();
        var rotationInterpolated = vec3.create();
        var scaleInterpolated = vec3.create();

        vec3.lerp(translationInterpolated, thisKeyframe.translation, nextKeyframe.translation, percentageComplete);
        vec3.lerp(rotationInterpolated, thisKeyframe.rotation, nextKeyframe.rotation, percentageComplete);
        vec3.lerp(scaleInterpolated, thisKeyframe.scale, nextKeyframe.scale, percentageComplete);

        return this.buildTransfMatrix(translationInterpolated, rotationInterpolated, scaleInterpolated);
    }

    /**
     * 
     * @param {MyKeyframe} keyframe from which to generate the transformation matrix
     * @returns The transformation matrix for the keyframe
     */
    buildTransfMatrix(translation, rotation, scale){
        let transfMatrix = mat4.create();

        mat4.translate(transfMatrix, transfMatrix, translation);
        mat4.rotate(transfMatrix, transfMatrix, rotation[0] * DEGREE_TO_RAD, [1, 0, 0]); // x
        mat4.rotate(transfMatrix, transfMatrix, rotation[1] * DEGREE_TO_RAD, [0, 1, 0]); // y
        mat4.rotate(transfMatrix, transfMatrix, rotation[2] * DEGREE_TO_RAD, [0, 0, 1]); // z
        mat4.scale(transfMatrix, transfMatrix, scale);

        return transfMatrix;
    }

    buildLastKeyframeTransf(){
        if(this.keyframes.length === 0){
            console.log("Error building the last keyframe's transformation matrix: The animation has no keyframes.");
            return this.mat4(0.0,0.0);
        }
        let lastKeyframe = this.keyframes[this.keyframes.length - 1];
        return this.buildTransfMatrix(lastKeyframe.translation, lastKeyframe.rotation, lastKeyframe.scale);
    }

    /** 
     * Update the animation
     * @param {integer} t - the current instant
     */
    update(t) {
        this.timeElapsed += t;

        this.active = (this.startTime < this.timeElapsed);
        if(!this.active)
            return;

        if(this.currentKeyframe < 0){
            console.log("Error updating keyframe animation: keyframe cannot be less than 0.")
            return;
        }

        // if the animation is still playing
        if(this.timeElapsed < this.endTime) {
            if(this.currentKeyframe < (this.keyframes.length - 1)){
                // if necessary, update the keyframe counter
                if(this.timeElapsed > this.keyframes[this.currentKeyframe + 1].instant)
                    this.currentKeyframe++;
                let currentKeyframeObj = this.keyframes[this.currentKeyframe];
                let nextKeyframeObj = this.keyframes[this.currentKeyframe + 1];
                let timeSinceKeyframeBegin = (this.timeElapsed - currentKeyframeObj.instant);
                let keyframeDuration = nextKeyframeObj.instant - currentKeyframeObj.instant;
                let completePercent = timeSinceKeyframeBegin / keyframeDuration;

                this.animationTransfMatrix = this.linearInterpolateTransf(currentKeyframeObj, nextKeyframeObj, completePercent)
            }
        }
        else {
            this.animationTransfMatrix = this.lastKeyframeTransfMat;
            this.ended = true;
            console.log("ended");
        }
    }

    /** 
     * Apply the animation transfMatrix
     */
    apply() {
        if(!this.active){
            let nullMatrix = mat4.create();
            mat4.scale(nullMatrix, nullMatrix, [0, 0, 0]);
            this.scene.multMatrix(nullMatrix);
            return 0;
        }

        if(this.keyframes.length === 0){
            console.log("Error applying animation: no keyframes in animation.")
            return 1;
        }

        if(this.animationTransfMatrix === 'undefined'){
            console.log("Error applying animation: animation is not defined.")
            return 1;
        }

        this.scene.multMatrix(this.animationTransfMatrix)
        
        return 0;
    }
}