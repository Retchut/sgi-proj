import { CGFscene, CGFshader } from '../../lib/CGF.js';
import { CGFaxis,CGFcamera } from '../../lib/CGF.js';
import { GameManager } from '../Game/GameManager.js';


var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);

        // enable picking
        this.setPickEnabled(true);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }

    /**
     * Initializes the scene cameras after parsing XML file.
     */
    initXMLCameras() {
        this.camera = this.graph.views[this.currentViewID];
        this.interface.setActiveCamera(this.camera);
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[6]);
                    this.lights[i].setSpotExponent(light[7]);
                    this.lights[i].setSpotDirection(light[8][0], light[8][1], light[8][2]);
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }
    }

    initShaders(){
        this.shaders = [
            new CGFshader(this.gl, 'scenes/shaders/simplePulsing.vert', 'scenes/shaders/simplePulsing.frag')
        ];
        this.selectedShader = 0;
        // dat.gui does not let us work with primitive values, so we have to wrap the boolean inside an object
        this.shadersController = { shadersActive : true, freezeShader : false };
        this.shaders[this.selectedShader].setUniformsValues({
            shaderTimeFactor : 0,
            shaderScaleFactor : this.graph.shaderScale,
            factors : vec3.create(),
            matColor : vec4.create()
        });
    }

    initAnimations(){
        this.animationsController = { freezeAnimations : false };
    }

    initGameManager(board){
        this.gameManager = new GameManager(this, board);
        this.gameManager.initGame();
    }

	logPicking(){
		if (this.pickMode == false) {
			// results can only be retrieved when picking mode is false
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i=0; i< this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj)
					{
						var customId = this.pickResults[i][1];
						// console.log("Picked object: " + obj + ", with pick id " + customId);
                        this.gameManager.handlePick(customId);
					}
				}
				this.pickResults.splice(0,this.pickResults.length);
			}		
		}
	}

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();
        this.initShaders();
        this.initAnimations();

        this.initXMLCameras();

        this.sceneInited = true;
    }

    /**
     * Method called periodically, used when it is necessary to update some internal state independent of the rendering display of the scene.
     * @param {Number} currTime
     */
    update(currTime){
        if(this.sceneInited){
            let elapsedTime;

            if(this.runTime == null) 
                elapsedTime = 0;
            else 
                elapsedTime = (this.animationsController.freezeAnimations) ? 0 : (currTime - this.runTime);

            this.runTime = currTime;

            for (const anim in this.graph.animations)
                this.graph.animations[anim].update(elapsedTime / 1000);

            if(this.shadersController.shadersActive && !this.shadersController.freezeShader)
                this.shaders[this.selectedShader].setUniformsValues({ shaderTimeFactor: currTime / 1000 % 100 });
        }
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup
		this.logPicking();
		this.clearPickRegistration();

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.axis.display();

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].update();
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}