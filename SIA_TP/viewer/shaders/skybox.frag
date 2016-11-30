#version 410
#define M_PI 3.14159265358979323846


uniform sampler2D skybox;

uniform float lightIntensity;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;

in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;
in vec3 vert ; 

out vec4 fragColor;

void main( void )
{

    vec3 d = normalize(vert);  
    vec2 uvCoord ; 
    uvCoord.x = 0.5 + atan(d.x,d.z)/(2*M_PI); 
    uvCoord.y = 0.5 - (asin(d.y))/M_PI ; 

    vec4 vertColor = texture2D(skybox, uvCoord);

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


    fragColor = vertColor ;
}
