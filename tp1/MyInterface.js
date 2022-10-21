import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        this.initKeys();

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    initCameras(){
        this.cameras = this.gui.addFolder('Cameras');
        this.cameras.add(this.scene, 'currentViewID', this.scene.viewIDs).name('Views').onChange(
            () => {
                this.scene.camera = this.scene.graph.views[this.scene.currentViewID];
                this.setActiveCamera(this.scene.camera);
            }
        )
    }

    initLights(){
        let lightIndex = 0;
        this.lights = this.gui.addFolder('Lights');
        for (const lightName in this.scene.graph.lights){
            let light = this.scene.lights[lightIndex];
            this.lights.add(light, 'enabled').name(lightName).onChange(
                () => {
                    light.update()
                }
            )
            lightIndex++;
        }
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}