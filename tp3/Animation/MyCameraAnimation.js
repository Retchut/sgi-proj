import { CGFcamera } from '../../lib/CGF.js';

export class MyCameraAnimation {
    constructor(scene, origin, destination, duration) {
        this.scene = scene;
        this.origin = origin;
        this.destination = destination;
        this.done = false;
        this.duration = duration;
        this.startTime = null;
        this.camera = new CGFcamera(this.origin.fov, this.origin.near, this.origin.far, this.origin.position, this.origin.target);
        this.scene.camera = this.camera;
        this.scene.interface.setActiveCamera(this.scene.camera);
    }

    update(currTime) {
        if (this.startTime === null) {
            this.startTime = currTime;
        }

        if ((currTime - this.startTime) <= this.duration) {
            let ratio = (currTime - this.startTime) / this.duration;
            let fov = this.origin.fov + this.ratio * (this.destination.fov - this.origin.fov);
            let position = vec3.create(), target = vec3.create();
            vec3.lerp(position, this.origin.position, this.destination.position, ratio);
            vec3.lerp(target, this.origin.target, this.destination.target, ratio);

            this.camera.setPosition(position);
            this.camera.setTarget(target);

            return true;
        } else {
            if (!this.ended) {
                this.scene.camera = this.destination;
                this.scene.interface.setActiveCamera(this.scene.camera);
            }
            this.ended = true;
            return false;
        }
    }

    getEnded() {
        return this.ended;
    }
}