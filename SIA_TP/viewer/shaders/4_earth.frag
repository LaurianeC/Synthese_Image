#version 410
#define M_PI 3.14159265358979323846

uniform float lightIntensity;
uniform sampler2D earthDay;
uniform mat3x3 normalMatrix;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;


in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;
in vec3 vert; 
in vec4 vertColor;

out vec4 fragColor;

void main( void )
{
    // Here begins the real work.
    vec3 d = normalize(vert);  
    vec2 uvCoord ; 
    uvCoord.x = 0.5 + atan(d.x,d.z)/(2*M_PI); 
    uvCoord.y = 0.5 - (asin(d.y))/M_PI ; 


    vec4 vColor = texture2D(earthDay, uvCoord) ; 
    //vec4 vColor = vec4(1,1,1,0);

    //Phong
    vec4 normNormals = normalize(vec4(vertNormal,0.0)) ;
    vec4 normLightVector = normalize(lightVector); 
    vec4 normEyeVector = normalize(eyeVector) ; 

    vec4 ambiant = 0.2 * vColor * lightIntensity ;
    vec4 diffuse = 0.4 * vColor * max(dot(normNormals,normLightVector), 0) * lightIntensity;
    vec4 specular;
    vec4 vecH = normalize(normEyeVector + normLightVector);  
    if (blinnPhong) {
       specular = 0.4 * vColor * pow(max(dot(normNormals, vecH), 0),4*shininess) * lightIntensity ; 
    } else {
      vec4 refl = 2*(dot(normNormals,normLightVector))*normNormals-normLightVector;
      refl=normalize(refl);
      specular = 0.4 * vColor * lightIntensity * pow(max(dot(refl,normEyeVector),0),shininess);
    }

    //Fresnel 
    float Fo = pow((1 - eta),2)/pow((1+eta),2) ; 
    float Fresnel = Fo + (1 - Fo)*pow((1 - dot(vecH,normEyeVector)),5) ;
    

   fragColor = ambiant + diffuse + Fresnel*specular;
   
}
