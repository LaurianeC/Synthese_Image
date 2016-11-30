#version 410

uniform mat4 matrix;
uniform mat4 perspective;
uniform mat3 normalMatrix;
uniform bool noColor;
uniform vec3 lightPosition;

in vec3 vertex;
in vec3 normal;
in vec3 color;

out vec4 eyeVector;
out vec4 lightVector;
out vec3 vertNormal;
out vec3 vert;

void main( void )
{
    
    vert = vertex;

    vec4 vertPosition = matrix * vec4(vertex, 1.0) ;
    vec4 eyePosition = vec4(0.0, 0.0, 0.0, 1.0);

    // For illumination:
    eyeVector = normalize(eyePosition - vertPosition)  ;
    lightVector = normalize(matrix*vec4(lightPosition, 1.0)-vertPosition);

    vertNormal = normalize(normalMatrix*normal);
    gl_Position = perspective * matrix * vec4(vertex, 1.0);
}
