import { CGFinterface, CGFapplication, dat } from '../../lib/CGF.js';

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

    initInterface(){
        this.initCameras();
        this.initLights();
        this.initShaders();
        this.initAnimations();
    }

    initCameras(){
        this.cameras = this.gui.addFolder('Camera Controls');
        this.cameras.add(this.scene, 'currentViewID', this.scene.viewIDs).name('Views').onChange(
            () => {
                this.scene.camera = this.scene.graph.views[this.scene.currentViewID];
                this.setActiveCamera(this.scene.camera);
            }
        )
    }

    initLights(){
        let lightIndex = 0;
        this.lights = this.gui.addFolder('Toggle Lights');
        this.lightsVisibility = this.gui.addFolder('Light Visibility');

        for (const lightName in this.scene.graph.lights){
            let light = this.scene.lights[lightIndex];
            light.setVisible(false);

            this.lights.add(light, 'enabled').name(lightName).onChange(
                () => {
                    light.update();
                }
            )
            
            this.lightsVisibility.add(light, 'visible').name(lightName).onChange(
                () => {
                    light.update();
                }
            )
            lightIndex++;
        }
    }

    initShaders(){
        this.shaderFolder = this.gui.addFolder('Shader Controls');
        this.shaderToggle = this.shaderFolder.add(this.scene.shadersController, 'shadersActive').name("Toggle Shader");
        this.shaderFreeze = this.shaderFolder.add(this.scene.shadersController, 'freezeShader').name("Freeze Shader");
    }

    initAnimations(){
        this.animationFolder = this.gui.addFolder('Animation Controls');
        this.animationFreeze = this.animationFolder.add(this.scene.animationsController, 'freezeAnimations').name("Freeze Animations");
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
        this.handleKeyDown(event.code);
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyHeld(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    handleKeyDown(keyCode){
        if(keyCode === "KeyM"){
            this.scene.graph.currentMaterial++;
        }
    }
}