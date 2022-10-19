import { CGFappearance, CGFtexture, CGFXMLreader } from '../lib/CGF.js';
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
        this.onXMLMinorError("To do: Parse views and create cameras.");

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
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

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
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

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

        this.log("Parsed lights");
        return null;
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
            if (textureID == null)
                return "no ID defined for texture number " + i;
            if (textureFile == null)
                return "no file defined for texture number " + i;
            this.onXMLMinorError("Check if file exists (code below this error)");
            // var testFile = new File([], textureFile);
            // if(!testFile.exists){
            //     return "file " + textureFile + " does not exist";
            // }
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
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material number" + i;

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            var grandChildren = children[i].children;

            var material = new CGFappearance(this.scene);

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
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation number " + i;

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            var composition = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < composition.length; j++) {
                var operation = composition[j];
                switch (operation.nodeName) {
                    case "translate":
                        var coordinates;
                        coordinates = this.parseCoordinates3D(operation, "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;
                        mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case "scale":
                        var coordinates;
                        coordinates = this.parseCoordinates3D(operation, "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;
                        mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case "rotate":
                        var axisProp = this.reader.getString(operation, 'axis');
                        if (axisProp != 'x' && axisProp != 'y' && axisProp != 'z') {
                            this.onXMLMinorError("Rotation axis of operation number " + j + " of transformation " + transformationID + " is invalid.");
                        }
                        var axis = axisProp == 'x' ? [1, 0, 0] : (axisProp == 'y' ? [0, 1, 0] : [0, 0, 1]);
                        var angle = this.reader.getFloat(operation, 'angle');
                        mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, axis);
                        break;
                    default:
                        this.onXMLMinorError("Operation " + operation.nodeName + " on initial transformation declaration of transformation " + transformationID + " is not valid.");
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
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for primitive number " + i;

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

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
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);
                this.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'triangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // z1
                var z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // x1
                var z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;

                // x3
                var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                // x1
                var z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                var triangle = new MyTriangle(this.scene, primitiveId, x1, y1, z1, x2, y2, z2, x3, y3, z3);
                this.primitives[primitiveId] = triangle;
            }
            else if (primitiveType == 'cylinder') {
                var base = this.reader.getFloat(grandChildren[0], 'base');
                var top = this.reader.getFloat(grandChildren[0], 'top');
                var height = this.reader.getFloat(grandChildren[0], 'height');

                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (slices < 3 || isNaN(slices))
                    return "Cylinder slices are invalid for cylinder with ID = " + primitiveId;

                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');

                var cylinder = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);
                this.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'sphere') {
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius for ID = " + primitiveId;

                // slices
                var slices = this.reader.getInteger(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getInteger(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks for ID = " + primitiveId;

                var sphere = new MySphere(this.scene, primitiveId, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            }
            else if (primitiveType == 'torus') {
                // inner
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner)))
                    return "unable to parse inner radius for ID = " + primitiveId;

                // outer
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer)))
                    return "unable to parse outer radius for ID = " + primitiveId;

                // slices
                var slices = this.reader.getInteger(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices for ID = " + primitiveId;

                // loops
                var loops = this.reader.getInteger(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops)))
                    return "unable to parse stacks for ID = " + primitiveId;

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
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            // set component id

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");

            var component = { transformation: mat4.create(), materials: [], texture: {}, children: { primitiveRefs: [], componentRefs: [] } }

            // Transformations
            grandGrandChildren = grandChildren[transformationIndex].children
            var transfMatrix = mat4.create();
            for (var j = 0; j < grandGrandChildren.length; j++) {
                var operation = grandGrandChildren[j];
                switch (operation.nodeName) {
                    case "transformationref":
                        // If there is a transformationref, there can't be any other transformations
                        if (grandGrandChildren.length != 1)
                            return "there can only be one transformationref for transformations in component " + componentID
                        // Get id of the transformation.
                        var transformationRef = this.reader.getString(operation, 'id');
                        if (transformationRef == null)
                            return "no ID defined for transformationRef in component " + componentID;

                        // Checks that ID exists.
                        if (this.transformations[transformationRef] == null)
                            return "transformationRef id in component " + componentId + " must be an existing transformation ID";

                        transfMatrix = this.transformations[transformationRef]
                        break;
                    case "translate":
                        var coordinates;
                        coordinates = this.parseCoordinates3D(operation, "translate transformation for ID " + componentID);
                        if (!Array.isArray(coordinates))
                            return coordinates;
                        mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case "scale":
                        var coordinates;
                        coordinates = this.parseCoordinates3D(operation, "translate transformation for ID " + componentID);
                        if (!Array.isArray(coordinates))
                            return coordinates;
                        mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case "rotate":
                        var axisProp = this.reader.getString(operation, 'axis');
                        if (axisProp != 'x' && axisProp != 'y' && axisProp != 'z') {
                            this.onXMLMinorError("Rotation axis of operation number " + j + " of transformation " + componentID + " is invalid.");
                        }
                        var axis = axisProp == 'x' ? [1, 0, 0] : (axisProp == 'y' ? [0, 1, 0] : [0, 0, 1]);
                        var angle = this.reader.getFloat(operation, 'angle');
                        mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, axis);
                        break;
                    default:
                        this.onXMLMinorError("Operation " + operation.nodeName + " on transformation declaration for component " + componentID + " is invalid.");
                }
            }
            component.transformation = transfMatrix;

            // Materials
            grandGrandChildren = grandChildren[materialsIndex].children
            for (var j = 0; j < grandGrandChildren.length; j++) {
                var material = grandGrandChildren[j];
                if (material.nodeName !== 'material') {
                    this.onXMLMinorError("Material " + material.nodeName + " of " + componentID + " is not valid.");
                    continue;
                }
                var materialID = this.reader.getString(material, 'id');
                if (materialID == null)
                    return "no ID defined for material in component " + componentID;
                if (materialID != "inherit" && this.materials[materialID] == null)
                    return "Material " + materialID + " of " + componentID + " not defined.";
                component.materials.push(materialID);
            }

            // Texture
            var textureID = this.reader.getString(grandChildren[textureIndex], 'id');
            if (textureID == null)
                return "Missing texture id for component " + component;
            if (textureID != "none" && textureID != "inherit") {
                if (this.textures[textureID] == null)
                    return "Texture " + textureID + " of " + componentID + " not defined.";
                var length_s = this.reader.getFloat(grandChildren[textureIndex], 'length_s');
                if (length_s == null) {
                    this.onXMLMinorError("Missing length_s for texture " + textureID + " in component " + componentID);
                    length_s = 1
                }
                var length_t = this.reader.getFloat(grandChildren[textureIndex], 'length_t');
                if (length_t == null) {
                    this.onXMLMinorError("Missing length_t for texture " + textureID + " in component " + componentID);
                    length_t = 1
                }
                component.texture.length_s = length_s;
                component.texture.length_t = length_t;
            }
            component.texture.id = textureID

            // Children
            grandGrandChildren = grandChildren[childrenIndex].children
            for (var j = 0; j < grandGrandChildren.length; j++) {
                if (grandGrandChildren[j].nodeName == "primitiveref") {
                    var primitiveId = this.reader.getString(grandGrandChildren[j], 'id');
                    if (this.primitives[primitiveId] == null)
                        return "Primitive " + primitiveId + " of " + componentID + " not defined.";
                    component.children.primitiveRefs.push(primitiveId);
                }
                else if (grandGrandChildren[j].nodeName == "componentref") {
                    var componentId = this.reader.getString(grandGrandChildren[j], 'id');
                    component.children.componentRefs.push(componentId);
                }
                else {
                    this.onXMLMinorError("unknown tag <" + grandGrandChildren[i].nodeName + ">");
                }
            }

            this.components[componentID] = component;
        }

        for (const componentID in this.components) {
            var childRefs = this.components[componentID].children.componentRefs;
            var validComponentRefs = [];
            for (var i = 0; i < childRefs.length; i++) {
                if (this.components[childRefs[i]] == null) {
                    this.onXMLMinorError("Component " + childRefs[i] + " referenced by " + componentID + " is undefined.");
                    continue;
                }
                validComponentRefs.push(childRefs[i]);
            }
            this.components[componentID].children.componentRefs = validComponentRefs;
        }
        console.log(this.components)
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

        currentAppearence.apply();

        // console.log(texture.id)
        // console.log(currentAppearence)

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

        //To do: Create display loop for transversing the scene graph

        //To test the parsing/creation of the primitives, call the display function directly

        // for (const primitiveID in this.primitives) {
        //     this.primitives[primitiveID].display()
        // }
    }
}