#ifdef GL_ES
precision highp float;
#endif

struct lightProperties {
    vec4 position;                  
    vec4 ambient;                   
    vec4 diffuse;                   
    vec4 specular;                  
    vec4 half_vector;
    vec3 spot_direction;            
    float spot_exponent;            
    float spot_cutoff;              
    float constant_attenuation;     
    float linear_attenuation;       
    float quadratic_attenuation;    
    bool enabled;                   
};

#define NUMBER_OF_LIGHTS 8
uniform lightProperties uLight[NUMBER_OF_LIGHTS];

varying vec2 vTextureCoord; // vertex coord from fragment shader

uniform sampler2D uSampler;
uniform sampler2D uSampler1;
uniform float shaderTimeFactor;
uniform vec3 highlightColor;
uniform bool hasTexture;
uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec4 specularColor;

void main() {
    // get standard color (if the object has a texture, matColor is (0,0,0,0))
    vec4 fragcolor = diffuseColor;
    if(hasTexture){
        fragcolor = texture2D(uSampler1, vTextureCoord);
    }

    float absTimeFactor = abs(sin(shaderTimeFactor));
    float interpX = mix(fragcolor.x, highlightColor.x, absTimeFactor);
    float interpY = mix(fragcolor.y, highlightColor.y, absTimeFactor);
    float interpZ = mix(fragcolor.z, highlightColor.z, absTimeFactor);

    vec3 finalColor = vec3(interpX, interpY, interpZ);

    gl_FragColor = vec4(finalColor, 1);
}