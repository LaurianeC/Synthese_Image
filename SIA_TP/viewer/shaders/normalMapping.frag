#version 410
#define M_PI 3.14159265358979323846

uniform float lightIntensity;
uniform sampler2D earthDay;
uniform sampler2D earthNormals;
uniform mat3 normalMatrix;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;
uniform mat4 matrix;


in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;
in vec3 vert; 
in vec4 vertColor;


out vec4 fragColor;

void main( void )
{
    vec4 normLightVector = normalize(lightVector); 
    vec4 normEyeVector = normalize(eyeVector) ; 

    vec3 d = normalize(-vert.xyz);  
    vec2 uvCoord ; 
    uvCoord.x = 0.5 + atan(d.x,d.z)/(2.0*M_PI); 
    uvCoord.y = 0.5 + (asin(d.y))/M_PI ; 

    vec4 vColor = texture2D(earthDay, uvCoord);

    //Normal mapping 
    vec3 normalS = normalize( 2.0 * texture(earthNormals, uvCoord).rgb - 1.0 ) ;
    
    vec3 tangente = normalize(vec3(vertNormal.z, 0.0f, -vertNormal.x));
    vec3 bitangente = cross(vertNormal, tangente);

    mat3 TBN = mat3(tangente, bitangente, vertNormal) ; 

    vec3 newNormal = normalMatrix*TBN*normalS;

    vec4 normNormals = vec4(normalize(newNormal),0.0) ;
    //vec4 normNormals = vec4(normalize(vertNormal),0.0);
    //Phong
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

    fragColor = ambiant + diffuse +Fresnel*specular;
}
