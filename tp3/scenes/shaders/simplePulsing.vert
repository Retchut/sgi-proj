attribute vec3 aVertexPosition; // 3d position of current vertex
attribute vec3 aVertexNormal;   // position of current normal
attribute vec2 aTextureCoord;   // vertex coordinate in texture

uniform mat4 uMVMatrix; // model-view matrix (object/camera transformation)
uniform mat4 uPMatrix;  // projection matrix (clipping)

varying vec2 vTextureCoord; // output position coordinate for current vertex on the texture
// uniform sampler2D uSampler1; // texture passed by scene
// uniform sampler2D uSampler2; // texture passed by us

uniform float shaderScaleFactor; // additional variables passed in setUniformValues input object
uniform float shaderTimeFactor;

void main() {
    float absTimeFactor = abs(sin(shaderTimeFactor));
    vec3 offset = aVertexNormal * (shaderScaleFactor - 1.0) * absTimeFactor;
	
	vTextureCoord = aTextureCoord;

	// gl_Position = uPMatrix * uMVMatrix* vec4(aVertexPosition, 1.0);
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
}
