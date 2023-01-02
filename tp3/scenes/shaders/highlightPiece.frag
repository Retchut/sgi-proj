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

uniform sampler2D uSampler2;

#define NUMBER_OF_LIGHTS 8
uniform lightProperties uLight[NUMBER_OF_LIGHTS];

void main() {


    // vec4 distMapColor = texture2D(uSampler2, vTextureCoord + (shaderTimeFactor * 0.00001));
    // vec2 offset = ( vec2(distMapColor.r, distMapColor.g) - 0.5 ) * 0.3;
    // vec2 modified = vTextureCoord + offset;
    // if(modified.x > 0.999 || modified.x <= 0.001 || modified.y > 0.999 || modified.y <= 0.001)
    //     gl_FragColor = texture2D(uSampler, vTextureCoord);
    // else
    //     gl_FragColor = texture2D(uSampler, modified);


    vec4 distMapColor = texture2D(uSampler2, vTextureCoord + (shaderTimeFactor * 0.00001));

    vec4 fragcolor = vec4(0.5, 0.2, 0.8, 1);
    float absTimeFactor = abs(sin(shaderTimeFactor));
    float interpX = mix(distMapColor.x, fragcolor.x, absTimeFactor);
    float interpY = mix(distMapColor.y, fragcolor.y, absTimeFactor);
    float interpZ = mix(distMapColor.z, fragcolor.z, absTimeFactor);

    if(interpX < 0.3)
        interpX = 0.3;
    if(interpY < 0.3)
        interpY = 0.3;
    if(interpZ < 0.3)
        interpZ = 0.3;
    
    vec3 finalColor = vec3(interpX, interpY, interpZ);

    gl_FragColor = vec4(finalColor, 1);

    // vec3 highlightColor = vec3(0.5, 0.5, 0.5);
    // if(fragcolor.x < 0.5){
    //     highlightColor.x = highlightColor.x + 0.2;
    //     highlightColor.y = highlightColor.y + 0.2;
    //     highlightColor.z = highlightColor.z + 0.2;
    // }
    // else{
    //     highlightColor.x = highlightColor.x - 0.2;
    //     highlightColor.y = highlightColor.y - 0.2;
    //     highlightColor.z = highlightColor.z - 0.2;
    // }

    // float absTimeFactor = abs(sin(shaderTimeFactor));
    // float interpX = mix(fragcolor.x, highlightColor.x, absTimeFactor);
    // float interpY = mix(fragcolor.y, highlightColor.y, absTimeFactor);
    // float interpZ = mix(fragcolor.z, highlightColor.z, absTimeFactor);

    // if(interpX < 0.3)
    //     interpX = 0.3;
    // if(interpY < 0.3)
    //     interpY = 0.3;
    // if(interpZ < 0.3)
    //     interpZ = 0.3;

    // vec3 finalColor = vec3(interpX, interpY, interpZ);

    // gl_FragColor = vec4(finalColor, 1);
}