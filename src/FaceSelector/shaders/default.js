const mainVertexShaderSrc = `#version 300 es                                                                  
                                                                              
layout (location = 0) in vec3 pos;  
layout (location = 1) in vec2 tex;  
layout (location = 2) in vec3 norm;  
                                                                              
out vec4 vCol;     
out vec2 TexCoord;  
out vec3 Normal;      
out vec3 FragPos;                                                     
                                                                              
uniform mat4 model;                                                           
uniform mat4 projection;    
uniform mat4 view;                                                  
                                                                              
void main()                                                                   
{                                                                             
    gl_Position = projection * view * model * vec4( pos, 1.0 );                      
    vCol = vec4(clamp(pos, 0.0f, 1.0f), 1.0f);     
    TexCoord = tex;

    // The transpose is necessary if you have non-uniform scaling
    Normal = mat3(transpose(inverse(model))) * norm;     

    FragPos = (model * vec4( pos, 1.0 )).xyz;
}
`;

const mainFragmentShaderSrc = `#version 300 es

precision mediump float;

in vec4 vCol;
in vec2 TexCoord;
in vec3 Normal;
in vec3 FragPos;

out vec4 colour;

struct Light
{
	vec3 colour;
	float ambientIntensity;
	float diffuseIntensity;
};

struct DirectionalLight 
{
	Light base;
	vec3 direction;
};

struct PointLight
{
	Light base;
	vec3 position;
	float constant;
	float linear;
	float exponent;
};

struct Material
{
	float specularIntensity;
	float shininess;
};


// Usually directional lights represent something like the sun
uniform DirectionalLight directionalLight;
uniform PointLight pointLight;

uniform sampler2D theTexture;
uniform Material material;

// Basically the same as the camera position
uniform vec3 eyePosition;


vec4 CalcLightByDirection(Light light, vec3 direction)
{
	vec4 ambientColour = vec4(light.colour, 1.0f) * light.ambientIntensity;
	

    // This somehow gets the angle at which norm is to the light, 90 degrees or more should not reflect 
    // and 0 degrees should most reflect. Uses dot product which normalized equals 1.0 at 0 degrees.
    // 0.0 at 90 degrees and negative at more than 90 degrees.
	float diffuseFactor = max(dot(normalize(Normal), normalize(direction)), 0.0f);
	vec4 diffuseColour = vec4(light.colour * light.diffuseIntensity * diffuseFactor, 1.0f);
	
	vec4 specularColour = vec4(0, 0, 0, 0);
	
	if(diffuseFactor > 0.0f)
	{
		vec3 fragToEye = normalize(eyePosition - FragPos);
        // reflect() https://docs.gl/sl4/reflect
		vec3 reflectedVertex = normalize(reflect(direction, normalize(Normal)));
		
		float specularFactor = dot(fragToEye, reflectedVertex);
		if(specularFactor > 0.0f)
		{
			specularFactor = pow(specularFactor, material.shininess);
			specularColour = vec4(light.colour * material.specularIntensity * specularFactor, 1.0f);
		}
	}

	return (ambientColour + diffuseColour + specularColour);
}

vec4 CalcDirectionalLight()
{
	return CalcLightByDirection(directionalLight.base, directionalLight.direction);
}

vec4 CalcPointLight() 
{
	vec3 direction = FragPos - pointLight.position;
	float distance = length(direction);
	direction = normalize(direction);
	
	vec4 colour = CalcLightByDirection(pointLight.base, direction);
	float attenuation = pointLight.exponent * distance * distance +
						pointLight.linear * distance +
						pointLight.constant;
		
	return (colour / attenuation);
}
                                                                              
void main()                                                                   
{
   vec4 finalColour = CalcDirectionalLight();
	finalColour += CalcPointLight();
		
	colour = texture(theTexture, TexCoord) * finalColour ;                                    
}
`;

export { mainFragmentShaderSrc, mainVertexShaderSrc };
