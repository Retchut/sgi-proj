/**
 * Keyframe
 * @constructor
 * @param {integer} instant - instant the keyframe appears at
 * @param {Array} translation - translation of the keyframe
 * @param {Array} rotation - rotation of the keyframe
 * @param {Array} scale - scale of the keyframe
 */
export class MyKeyframe {
    constructor(instant, translation, rotation, scale) {
        this.instant = instant;
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
    }
}