#version 410
#define M_PI 3.14159265358979323846

uniform float lightIntensity;
uniform sampler2D earthDay;
//uniform sampler2D earthNormals;
uniform mat3x3 normalMatrix;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;

in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;

in vec3 vert; 

out vec4 fragColor;

void main( void )
{
    // Here begins the real work.
    vec3 d = normalize(vert);  
    vec2 uvCoord ; 
    uvCoord.x = 0.5 + atan(d.x,d.z)/(2*M_PI); 
    uvCoord.y = 0.5 - (asin(d.y))/M_PI ; 

    //vec4 vertColor = texture2D(earthDay, uvCoord) ;
    vec4 vertColor = normalize(vec4(1,1,1,1)) ; 
    //Normal mapping 
    vec3 normal = 2*vertNormal - 1 ; 
    vec3 n = vec3(normal.x+1 , normal.y, normal.z ) ; 

    float scalaire = dot(normal, n); 
    vec3 tangeant = n - scalaire*normal ;
    vec3 b = cross(normal, tangeant) ; 
    mat3x3 TBN = mat3x3(tangeant, b, normal) ; 

    vec3 newNormal = normalMatrix * TBN * normal ; 

    //Phong
    vec4 normNormals = vec4(normalize(vertNormal),1.0) ;
    vec4 normLightVector = normalize(lightVector) ; 
    vec4 normEyeVector = normalize(eyeVector) ; 

    // Here begins the real work.
    vec4 ambiant = 0.2 * vertColor * lightIntensity ;
    vec4 diffuse = 0.4 * vertColor * max(dot(normNormals,normLightVector), 0) * lightIntensity;
    vec4 vecH = normalize(normEyeVector + normLightVector);  
    vec4 specular = 0.4 * vertColor * pow(max(dot(normNormals, vecH), 0),4*shininess) * lightIntensity ; 

    //Fresnel 
    float Fo = pow((1 - eta),2)/pow((1+eta),2) ; 
    float Fresnel = Fo + (1 - Fo)*pow((1 - dot(vecH,normEyeVector)),5) ; 

   
    fragColor = ambiant + diffuse + specular ;
}
