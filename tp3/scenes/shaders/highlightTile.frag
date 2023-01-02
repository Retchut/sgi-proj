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

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float shaderTimeFactor;
uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec4 specularColor;

#define NUMBER_OF_LIGHTS 8
uniform lightProperties uLight[NUMBER_OF_LIGHTS];

void main() {
    vec4 fragcolor = diffuseColor;

    vec3 highlightColor = vec3(0.6, 0.2, 0.5);

    float absTimeFactor = abs(sin(shaderTimeFactor));
    float interpX = mix(fragcolor.x, highlightColor.x, absTimeFactor);
    float interpY = mix(fragcolor.y, highlightColor.y, absTimeFactor);
    float interpZ = mix(fragcolor.z, highlightColor.z, absTimeFactor);

    if(interpX < 0.3)
        interpX = 0.3;
    if(interpY < 0.15)
        interpY = 0.15;
    if(interpZ < 0.3)
        interpZ = 0.3;

    vec3 finalColor = vec3(interpX, interpY, interpZ);

    gl_FragColor = vec4(finalColor, 1);
}