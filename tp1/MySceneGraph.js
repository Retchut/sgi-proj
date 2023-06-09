import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader } from '../lib/CGF.js';
import { MyRectangle } from './MyRectangle.js';
import { MyTriangle } from './MyTriangle.js';
import { MyCylinder } from './MyCylinder.js';
import { MySphere } from './MySphere.js';
import { MyTorus } from './MyTorus.js';

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
        this.scene.interface.initCameras();
        this.scene.interface.initLights();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }

        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        this.views = [];
        var viewIDs = [];

        var defaultViewID = this.reader.getString(viewsNode, 'default');
        if (defaultViewID == null)
            return "Missing 'default' attribute on <views> tag";

        this.defaultViewID = defaultViewID;
        var viewsChildren = viewsNode.children;
        if (viewsChildren.length === 0)
            return "No views declared in <views>";

        for (var i = 0; i < viewsChildren.length; i++) {
            var view = viewsChildren[i]
            
            if(view.nodeName != "perspective" && view.nodeName != "ortho"){
                this.onXMLMinorError("unknown perspective tag <" + view.nodeName + "> on view number " + i + ". The camera will be ignored.");
                continue;
            }

            var viewID = this.reader.getString(view, 'id');
            if (viewID == null){
                this.onXMLMinorError("No ID defined for view number " + i + "The camera will be ignored");
                continue;
            }

            // Checks for repeated IDs.
            if (this.views[viewID] != null){
                this.onXMLMinorError("ID must be unique for each view (conflict: ID = " + viewID + "). The duplicate will be ignored.");
                continue;
            }
            
            var near = this.reader.getFloat(view, 'near');
            if (near == null) {
                this.onXMLMinorError("no near attribute defined for view number " + i + ". Assuming 0.1");
                near = 0.1;
            }

            var far = this.reader.getFloat(view, 'far');
            if (far == null) {
                this.onXMLMinorError("no far attribute defined for view number " + i + ". Assuming 999");
                far = 999;
            }

            var viewsGrandchildren = viewsChildren[i].children;
            var malformedView = false;
            var from = vec3.create();
            var to = vec3.create();
            var up = vec3.create();
            for (var j = 0; j < viewsGrandchildren.length; j++) {
                var coords = this.parseCoordinates3D(viewsGrandchildren[j], "view <" + viewsGrandchildren[j].nodeName + "> tag, for view with ID " + viewID);
                // parseCoordinates3D returns a string on error, not an array
                if (!Array.isArray(coords)) {
                    if (view.nodeName === "ortho" && viewsGrandchildren[j].nodeName === "up") {
                        this.onXMLMinorError("Ortho camera <up> tag is malformed. Assuming the default value of [0,1,0].")
                        coords = [0, 1, 0];
                    }
                    else {
                        malformedView = true;
                        this.onXMLMinorError("Error fetching the coordinates for the camera's " + viewsGrandchildren[j].nodeName + " tag. Ignoring camera.")
                    }
                }

                switch (viewsGrandchildren[j].nodeName) {
                    case "from":
                        from = vec3.fromValues(coords[0], coords[1], coords[2])
                        break;
                    case "to":
                        to = vec3.fromValues(coords[0], coords[1], coords[2])
                        break;
                    case "up":
                        up = vec3.fromValues(coords[0], coords[1], coords[2])
                        break;
                    default:
                        this.onXMLMinorError("Unknown tag <" + viewsGrandchildren[j].nodeName + ">");
                        malformedView = true;
                        break;
                }
            }

            // check if any parameter of the camera was malformed (except the <up> tag)
            if (malformedView) {
                this.onXMLMinorError("The view " + viewID + " is malformed. Ignoring camera.");
                continue;
            }

            var viewObj;
            if (view.nodeName == "perspective") {
                // Get attribute unique to perspective projection cameras
                var angle = this.reader.getFloat(view, 'angle');
                if (angle == null) {
                    this.onXMLMinorError("no angle attribute defined for view number " + i + ". Assuming the value of 45º");
                    angle = 45;
                }

                viewObj = new CGFcamera(angle * DEGREE_TO_RAD, near, far, from, to);
            }
            else if (view.nodeName == "ortho") {
                // Get attributes unique to orthographic projection cameras

                // check if the <up> ortho camera tag was omitted, and assume default values if so
                if (vec3.length(up) === 0) {
                    up = vec3.fromValues(0, 1, 0);
                    this.onXMLMinorError("Ortho camera <up> tag was not specified. Assuming the default value of [0,1,0].")
                }

                var left = this.reader.getFloat(view, 'left');
                if (left == null) {
                    this.onXMLMinorError("no left attribute defined for view number " + i + ". Assuming the value of -5.");
                    left = -5;
                }
                var right = this.reader.getFloat(view, 'right');
                if (right == null) {
                    this.onXMLMinorError("no right attribute defined for view number " + i + ". Assuming the value of 5.");
                    right = 5;
                }
                var top = this.reader.getFloat(view, 'top');
                if (top == null) {
                    this.onXMLMinorError("no top attribute defined for view number " + i + ". Assuming the value of 5.");
                    top = 5;
                }
                var bottom = this.reader.getFloat(view, 'bottom');
                if (bottom == null) {
                    this.onXMLMinorError("no bottom attribute defined for view number " + i + ". Assuming the value of -5");
                    bottom = -5;
                }

                viewObj = new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, up);
            }

            viewIDs.push(viewID);
            this.views[viewID] = viewObj;
        }
        if (this.views[this.defaultViewID] == null)
            return "Default view " + this.defaultViewID + " is undefined.";

        this.scene.viewIDs = viewIDs;
        this.scene.currentViewID = this.defaultViewID;
        // this.scene.defaultCamera = this.views[this.defaultViewID];

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("Unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null){
                this.onXMLMinorError("No ID defined for light number " + i + ". This light will be ignored.");
                continue;
            }

            // Checks for repeated IDs.
            if (this.lights[lightId] != null){
                this.onXMLMinorError("ID must be unique for each light (conflict: ID = " + lightId + "). The duplicate will be ignored.");
                continue;
            }

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle))){
                    this.onXMLMinorError("unable to parse angle of the light for ID = " + lightId + ". Assuming 45º.");
                    angle = 45;
                }

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent))){
                    this.onXMLMinorError("unable to parse exponent of the light for ID = " + lightId + ". Assuming 1.");
                    exponent = 1;
                }

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.scene.numLights = numLights;
        this.log("Parsed lights");
        return null;
    }


    /**
     * Checks if the file exists. 
     * @param {string} path path to the file
     */
    fileExists(path) {
        let xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();                            // For all modern browsers
        }
        else if (window.ActiveXObject) {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");   		// For (older) IE
        }

        xmlhttp.open('HEAD', path, false);
        xmlhttp.send();
        return xmlhttp.status != 404;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        this.textures = [];

        var texturesChildren = texturesNode.children;

        for (var i = 0; i < texturesChildren.length; i++) {
            var textureID = this.reader.getString(texturesChildren[i], 'id');
            var textureFile = this.reader.getString(texturesChildren[i], 'file');

            // Checks if texture is null
            if (textureID == null){
                this.onXMLMinorError("No ID defined for texture number " + i + ". The texture will be ignored.");
                continue;
            }

            // Checks if texture ID is a reserved keyword
            if (textureID == "inherit" || textureID == "none"){
                this.onXMLMinorError("Invalid ID for texture number " + i + ": texture IDs cannot be \"inherit\" or \"none\". The texture will be ignored.");
                continue;
            }

            // Checks for repeated IDs.
            if (this.textures[textureID] != null){
                this.onXMLMinorError("ID must be unique for each texture (conflict: ID = " + textureID + "). The duplicate will be ignored.");
                continue;
            }

            // Checks if textureFile is null
            if (textureFile == null){
                this.onXMLMinorError("No file defined for texture number " + i + ". This texture will be ignored");
                continue;
            }

            if(!this.fileExists(textureFile)){
                this.onXMLMinorError("file " + textureFile + " of texture number " + i + " does not exist. This texture will be ignored");
                continue;
            }

            var texture = new CGFtexture(this.scene, textureFile);
            this.textures[textureID] = texture;
        }

        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;
        var grandChildren = [];

        this.materials = [];
        this.currentMaterial = 0;

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("Unknown tag <" + children[i].nodeName + ">. Ignoring this tag.");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null){
                this.onXMLMinorError("No ID defined for material number" + i + ". The material will be ignored.");
                continue;
            }

            // Checks if texture ID is a reserved keyword
            if (materialID == "inherit")
                return "Invalid ID for material number " + i + ": material IDs cannot be \"inherit\"";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null){
                this.onXMLMinorError("ID must be unique for each material (conflict: ID = " + materialID + "). The duplicate will be ignored.");
                continue;
            }

            var shininess = this.reader.getFloat(children[i], 'shininess');
            if (shininess == null){
                this.onXMLMinorError("no shininess defined for material " + materialID + ". Assuming shininess of 1.");
                shininess = 1;
            }

            var grandChildren = children[i].children;

            var material = new CGFappearance(this.scene);
            material.setTextureWrap("REPEAT", "REPEAT");

            // emission, ambient, diffuse, specular
            for (var j = 0; j < grandChildren.length; j++) {
                let r = this.reader.getString(grandChildren[j], 'r');
                let g = this.reader.getString(grandChildren[j], 'g');
                let b = this.reader.getString(grandChildren[j], 'b');
                let a = this.reader.getString(grandChildren[j], 'a');
                switch (grandChildren[j].nodeName) {
                    case "emission":
                        material.setEmission(r, g, b, a);
                        break;
                    case "ambient":
                        material.setAmbient(r, g, b, a);
                        break;
                    case "diffuse":
                        material.setDiffuse(r, g, b, a);
                        break;
                    case "specular":
                        material.setSpecular(r, g, b, a);
                        break;
                }
            }
            material.setShininess(shininess)
            this.materials[materialID] = material;
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("Unknown tag <" + children[i].nodeName + ">. Ignoring this tag.");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null){
                this.onXMLMinorError("No ID defined for transformation number " + i + ". The transformation will be ignored.");
                continue;
            }

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null){
                this.onXMLMinorError("ID must be unique for each transformation (conflict: ID = " + transformationID + "). The duplicate will be ignored.");
                continue;
            }

            var composition = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < composition.length; j++) {
                var operation = composition[j];
                switch (operation.nodeName) {
                    case "translate":
                        var coordinates;
                        coordinates = this.parseCoordinates3D(operation, "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates)){
                            this.onXMLMinorError(coordinates + " Assuming translation of [0,0,0]");
                            coordinates = vec3.create();
                        }
                        mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case "scale":
                        var coordinates;
                        coordinates = this.parseCoordinates3D(operation, "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates)){
                            this.onXMLMinorError(coordinates + " Assuming scaling of [1,1,1].");
                            coordinates = vec3.fromValues(1,1,1);
                        }
                        mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case "rotate":
                        var axisProp = this.reader.getString(operation, 'axis');
                        var axis = axisProp == 'x' ? [1, 0, 0] : (axisProp == 'y' ? [0, 1, 0] : [0, 0, 1]);
                        var angle = this.reader.getFloat(operation, 'angle');
                        if (axisProp != 'x' && axisProp != 'y' && axisProp != 'z') {
                            this.onXMLMinorError("Rotation axis of operation number " + j + " of transformation " + transformationID + " is invalid. Assuming rotation of 0 around the x axis.");
                            angle = 0.0;
                        }
                        if(angle == null){
                            this.onXMLMinorError("no angle property defined for the rotation operation number " + j + ". Assuming rotation of 0 around the x axis");
                            axis = [1,0,0];
                            angle = 0.0;
                        }
                        mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, axis);
                        break;
                    default:
                        this.onXMLMinorError("Operation " + operation.nodeName + " on initial transformation declaration of transformation " + transformationID + " is not valid. Ignoring this operation.");
                }
            }

            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;
        var grandChildren = [];

        this.primitives = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("Unknown tag <" + children[i].nodeName + ">. Ignoring this tag.");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null){
                this.onXMLMinorError("No ID defined for primitive number" + i + ". This primitive will be ignored.");
                continue;
            }

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null){
                this.onXMLMinorError("ID must be unique for each primitive (conflict: ID = " + primitiveId + "). The duplicate will be ignored.");
                continue;
            }

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var param = 'x1';
                var x1 = this.reader.getFloat(grandChildren[0], param);
                if (!(x1 != null && !isNaN(x1))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // y1
                param = 'y1';
                var y1 = this.reader.getFloat(grandChildren[0], param);
                if (!(y1 != null && !isNaN(y1))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // x2
                param = 'x2';
                var x2 = this.reader.getFloat(grandChildren[0], param);
                if (!(x2 != null && !isNaN(x2) && x2 > x1)){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // y2
                param = 'y2';
                var y2 = this.reader.getFloat(grandChildren[0], param);
                if (!(y2 != null && !isNaN(y2) && y2 > y1)){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);
                this.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'triangle') {
                // x1
                var param = 'x1';
                var x1 = this.reader.getFloat(grandChildren[0], param);
                if (!(x1 != null && !isNaN(x1))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // y1
                param = 'y1';
                var y1 = this.reader.getFloat(grandChildren[0], param);
                if (!(y1 != null && !isNaN(y1))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // z1
                param = 'z1';
                var z1 = this.reader.getFloat(grandChildren[0], param);
                if (!(z1 != null && !isNaN(z1))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // x2
                param = 'x2';
                var x2 = this.reader.getFloat(grandChildren[0], param);
                if (!(x2 != null && !isNaN(x2))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // y2
                param = 'y2';
                var y2 = this.reader.getFloat(grandChildren[0], param);
                if (!(y2 != null && !isNaN(y2))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // z2
                param = 'z2';
                var z2 = this.reader.getFloat(grandChildren[0], param);
                if (!(z2 != null && !isNaN(z2))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // x3
                param = 'x3';
                var x3 = this.reader.getFloat(grandChildren[0], param);
                if (!(x3 != null && !isNaN(x3))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // y3
                param = 'y3';
                var y3 = this.reader.getFloat(grandChildren[0], param);
                if (!(y3 != null && !isNaN(y3))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                // z3
                param = 'z3';
                var z3 = this.reader.getFloat(grandChildren[0], param);
                if (!(z3 != null && !isNaN(z3))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }

                var triangle = new MyTriangle(this.scene, primitiveId, x1, y1, z1, x2, y2, z2, x3, y3, z3);
                this.primitives[primitiveId] = triangle;
            }
            else if (primitiveType == 'cylinder') {
                var param = 'base';
                var minVal = 0;
                var reqType = 'float';
                var base = this.reader.getFloat(grandChildren[0], param);
                if(isNaN(base)){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(base < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                param = 'top';
                minVal = 0;
                reqType = 'float';
                var top = this.reader.getFloat(grandChildren[0], param);
                if(isNaN(top)){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(top < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                param = 'height';
                minVal = 0;
                reqType = 'integer';
                var height = this.reader.getFloat(grandChildren[0], param);
                if(isNaN(height)){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(height <= minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                param = 'slices';
                minVal = 1;
                reqType = 'integer';
                var slices = this.reader.getInteger(grandChildren[0], param);
                if (isNaN(slices)){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(slices < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                param = 'stacks';
                minVal = 1;
                reqType = 'integer';
                var stacks = this.reader.getInteger(grandChildren[0], param);
                if(isNaN(stacks)){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(stacks < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                var cylinder = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);
                this.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'sphere') {
                // radius
                var param = 'radius';
                var minVal = 0;
                var reqType = 'float';
                var radius = this.reader.getFloat(grandChildren[0], param);
                if (!(radius != null && !isNaN(radius))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(radius <= minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                // slices
                param = 'slices';
                minVal = 1;
                reqType = 'integer';
                var slices = this.reader.getInteger(grandChildren[0], param);
                if (!(slices != null && !isNaN(slices))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(slices < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                // stacks
                param = 'stacks';
                minVal = 1;
                reqType = 'integer';
                var stacks = this.reader.getInteger(grandChildren[0], param);
                if (!(stacks != null && !isNaN(stacks))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(stacks < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                var sphere = new MySphere(this.scene, primitiveId, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            }
            else if (primitiveType == 'torus') {
                // inner
                var param = 'inner';
                var minVal = 0;
                var reqType = 'float';
                var inner = this.reader.getFloat(grandChildren[0], param);
                if (!(inner != null && !isNaN(inner))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(inner < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                // outer
                param = 'outer';
                minVal = inner;
                reqType = 'float';
                var outer = this.reader.getFloat(grandChildren[0], param);
                if (!(outer != null && !isNaN(outer))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(outer < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                // slices
                param = 'slices';
                minVal = 3;
                reqType = 'integer';
                var slices = this.reader.getInteger(grandChildren[0], param);
                if (!(slices != null && !isNaN(slices))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(slices < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                // loops
                param = 'loops';
                minVal = 3;
                reqType = 'integer';
                var loops = this.reader.getInteger(grandChildren[0], param);
                if (!(loops != null && !isNaN(loops))){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This primitive will be ignored.");
                    continue;
                }
                if(loops < minVal){
                    this.onXMLMinorError("Unable to parse " + param + " of primitive with ID = " + primitiveId + ". This value must be at least " + minVal + " and of type " + reqType + ". This primitive will be ignored.");
                    continue;
                }

                var torus = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);
                this.primitives[primitiveId] = torus;
            }
            else {
                console.warn("To do: Parse other primitives.");
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var grandGrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("Unknown tag <" + children[i].nodeName + ">. Ignoring this tag.");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null){
                this.onXMLMinorError("No ID defined for component number" + i + ". This component will be ignored.");
                continue;
            }

            // Checks for repeated IDs.
            if (this.components[componentID] != null){
                this.onXMLMinorError("ID must be unique for each component (conflict: ID = " + componentID + "). The duplicate will be ignored.");
                continue;
            }

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            // References to other transformations, materials, textures and components
            // We will throw a major error an return an error if we come across any broken references
            // We will, however, assume simple transformations (translation of [0,0,0], scaling of [1,1,1], etc...), should the transformations tag of the component contain explicit transformations which are malformed
            // Additionally, we will ignore malformed tags in material, texture and component refs, and render the objects without these.
            var indices = {
                transformationIndex: nodeNames.indexOf("transformation"),
                materialsIndex: nodeNames.indexOf("materials"),
                textureIndex: nodeNames.indexOf("texture"),
                childrenIndex: nodeNames.indexOf("children")
            }

            // check if the component object has one of each required tags defined
            for (const index in indices) {
                // indexOf returns -1 if the object of the searchis not present
                if(indices[index] == -1){
                    return "Component " + componentID + " has no " + index.slice(0, index.length - 5) + ". Ignoring this component.";
                }
            }

            var component = { transformation: mat4.create(), materials: [], texture: {}, children: { primitiveRefs: [], componentRefs: [] } }

            // Transformations
            grandGrandChildren = grandChildren[indices.transformationIndex].children
            
            var transfMatrix = mat4.create();
            for (var j = 0; j < grandGrandChildren.length; j++) {
                var operation = grandGrandChildren[j];
                if (operation.nodeName === "transformationref") {
                    // Get id of the transformation.
                    var transformationRef = this.reader.getString(operation, 'id');
                    if (transformationRef == null){
                        this.onXMLMinorError("No ID defined for " + operation.nodeName + " in component " + componentID + ". The material will be ignored.");
                        continue;
                    }

                    // Checks that ID exists.
                    if (this.transformations[transformationRef] == null){
                        return operation.nodeName + " id in component " + componentID + " must refer to an already defined " + operation.nodeName + ".";
                    }

                    transfMatrix = this.transformations[transformationRef]

                    // If there is a transformationref, there can't be any other transformations
                    if (grandGrandChildren.length != 1) {
                        this.onXMLMinorError("There can only be one transformationref for transformations in component " + componentID + ". All other transformations in this component were ignored.");
                        break;
                    }
                }
                else if (operation.nodeName === "translate") {
                    var coordinates;
                    coordinates = this.parseCoordinates3D(operation, "translate transformation for ID " + componentID);
                    if (!Array.isArray(coordinates)){
                        this.onXMLMinorError(coordinates + " Assuming translation of [0,0,0]");
                        coordinates = vec3.create();
                    }
                    mat4.translate(transfMatrix, transfMatrix, coordinates);
                }
                else if (operation.nodeName === "scale") {
                    var coordinates;
                    coordinates = this.parseCoordinates3D(operation, "translate transformation for ID " + componentID);
                    if (!Array.isArray(coordinates)){
                        this.onXMLMinorError(coordinates + " Assuming scaling of [1,1,1].");
                        coordinates = vec3.fromValues(1,1,1);
                    }
                    mat4.scale(transfMatrix, transfMatrix, coordinates);
                }
                else if (operation.nodeName === "rotate"){
                        var axisProp = this.reader.getString(operation, 'axis');
                        var axis = axisProp == 'x' ? [1, 0, 0] : (axisProp == 'y' ? [0, 1, 0] : [0, 0, 1]);
                        var angle = this.reader.getFloat(operation, 'angle');
                        if (axisProp != 'x' && axisProp != 'y' && axisProp != 'z') {
                            this.onXMLMinorError("Rotation axis of operation number " + j + " of transformation " + transformationID + " is invalid. Assuming rotation of 0 around the x axis.");
                            angle = 0.0;
                        }
                        if(angle == null){
                            this.onXMLMinorError("no angle property defined for the rotation operation number " + j + ". Assuming rotation of 0 around the x axis");
                            axis = [1,0,0];
                            angle = 0.0;
                        }
                        mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, axis);
                }
                else {
                    this.onXMLMinorError("Operation " + operation.nodeName + " on transformation declaration for component " + componentID + " is invalid.");
                }
            }
            component.transformation = transfMatrix;

            // Materials
            grandGrandChildren = grandChildren[indices.materialsIndex].children
            for (var j = 0; j < grandGrandChildren.length; j++) {
                var material = grandGrandChildren[j];
                if (material.nodeName !== 'material') {
                    this.onXMLMinorError("Unknown tag <" + material.nodeName + "> of " + componentID + " is not valid. Ignoring this tag.");
                    continue;
                }

                var materialID = this.reader.getString(material, 'id');
                if (materialID == null) {
                    this.onXMLMinorError("No ID defined for material number" + i + " in component " + componentID + ". The material will be ignored.");
                    continue;
                }

                // Checks that ID exists.
                if (materialID != "inherit" && this.materials[materialID] == null) {
                    return "Material ID " + materialID + " of " + componentID + " not defined.";
                }

                component.materials.push(materialID);
            }

            // Texture
            var textureID = this.reader.getString(grandChildren[indices.textureIndex], 'id');
            if (textureID == null){
                this.onXMLMinorError("No ID defined for texture number " + i + " for component " + component + ". This texture will be ignored.");
                continue;
            }

            if (textureID != "none" && textureID != "inherit") {
                if (this.textures[textureID] == null){
                    return "Texture " + textureID + " used by " + componentID + " is not defined.";
                }
                
                var param = 'length_s';
                var length_s = this.reader.getFloat(grandChildren[indices.textureIndex], param);
                if (length_s == null) {
                    this.onXMLMinorError("Unable to parse " + param + " for texture with ID = " + textureID + " of component " + componentID + ". Assuming 1.");
                    length_s = 1
                }

                var param = 'length_t';
                var length_t = this.reader.getFloat(grandChildren[indices.textureIndex], param);
                if (length_t == null) {
                    this.onXMLMinorError("Unable to parse " + param + " for texture with ID = " + textureID + " of component " + componentID + ". Assuming 1.");
                    length_t = 1
                }
                component.texture.length_s = length_s;
                component.texture.length_t = length_t;
            }
            component.texture.id = textureID

            // Children
            grandGrandChildren = grandChildren[indices.childrenIndex].children
            for (var j = 0; j < grandGrandChildren.length; j++) {
                if (grandGrandChildren[j].nodeName == "primitiveref") {
                    var primitiveId = this.reader.getString(grandGrandChildren[j], 'id');
                    if (this.primitives[primitiveId] == null)
                        return "Primitive " + primitiveId + " of " + componentID + " not defined.";
                    component.children.primitiveRefs.push(primitiveId);
                }
                else if (grandGrandChildren[j].nodeName == "componentref") {
                    var grandGrandChildID = this.reader.getString(grandGrandChildren[j], 'id');
                    component.children.componentRefs.push(grandGrandChildID);
                }
                else {
                    this.onXMLMinorError("Unknown tag <" + grandGrandChildren[i].nodeName + ">. Ignoring this tag.");
                }
            }

            this.components[componentID] = component;
        }

        // Check that all component references are valid IDs
        for (const componentID in this.components) {
            var childRefs = this.components[componentID].children.componentRefs;
            var validComponentRefs = [];
            for (var i = 0; i < childRefs.length; i++) {
                if (this.components[childRefs[i]] == null) {
                    return "Component " + childRefs[i] + " referenced by " + componentID + " is undefined.";
                }
                validComponentRefs.push(childRefs[i]);
            }
            this.components[componentID].children.componentRefs = validComponentRefs;
        }

        // Check that the root component was defined
        if (this.components[this.idRoot] == null) {
            return "The root component " + this.idRoot + " is undefined";
        }
        this.log("Parsed components");
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;

        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Draw a component, recursively drawing its children.
     * @param currentNode the current node to draw
     * @param prevAppearenceId the material ID for the parent node
     * @param prevTexture the texture for the parent node
     */
    drawComponent(currentNode, prevAppearenceId, prevTexture) {
        // multiply the current scene transformation matrix by the current component matrix
        // access primitives via id
        let currentComponentMaterial = this.currentMaterial % currentNode.materials.length
        let materialID = (currentNode.materials[currentComponentMaterial] !== "inherit" ? currentNode.materials[currentComponentMaterial] : prevAppearenceId);
        let texture = (currentNode.texture.id !== "inherit" ? currentNode.texture : prevTexture)

        this.scene.multMatrix(currentNode.transformation);
        for (var i = 0; i < currentNode.children.componentRefs.length; i++) {
            // preserve current scene transformation matrix
            this.scene.pushMatrix();
            // recursively visit the next child component
            this.drawComponent(this.components[currentNode.children.componentRefs[i]], materialID, texture);
            // restore scene transformation matrix
            this.scene.popMatrix();
        }
        let currentAppearence = this.materials[materialID];

        if (texture.id !== "none")
            currentAppearence.setTexture(this.textures[texture.id]);
        else
            currentAppearence.setTexture(null);

        currentAppearence.apply();

        for (var i = 0; i < currentNode.children.primitiveRefs.length; i++) {
            // display the primitive with the transformations already applied
            if (texture.id !== "none")
                this.primitives[currentNode.children.primitiveRefs[i]].updateTexCoords(texture.length_s, texture.length_t);
            this.primitives[currentNode.children.primitiveRefs[i]].display();
        }
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // Initialize Model-View matrix as identity (no transformation
        this.scene.updateProjectionMatrix();
        this.scene.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.scene.applyViewMatrix();

        // preserve the scene current matrix
        this.scene.pushMatrix()

        this.drawComponent(this.components[this.idRoot], null);

        // restore the last preserved scene matrix
        this.scene.popMatrix()

        // this.scene.interface.handleInput();
    }
}