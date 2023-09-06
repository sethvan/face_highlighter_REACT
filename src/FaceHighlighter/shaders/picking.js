const pickingVertexShaderSrc = `#version 300 es                                                                  
                                                                              
layout (location = 0) in vec3 pos;
                                                                                                                    
uniform mat4 model;                                                           
uniform mat4 projection;    
uniform mat4 view; 

flat out uint myVertexID;
                                                                              
void main()                                                                   
{
    myVertexID = uint(gl_VertexID);
    gl_Position = projection * view * model * vec4( pos, 1.0 );                      
}

`;

const pickingFragmentShaderSrc = `#version 300 es

flat in uint myVertexID;
out uvec4 FragColor;

void main()
{
   FragColor = uvec4(myVertexID, 0, 0, 0);
}`;

export { pickingFragmentShaderSrc, pickingVertexShaderSrc };
