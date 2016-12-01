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

out vec4 fragColor;

void main( void )
{
    vec3 d = normalize(vert);  
    vec2 uvCoord ; 
    uvCoord.x = 0.5 + atan(d.x,d.z)/(2*M_PI); 
    uvCoord.y = 0.5 - (asin(d.y))/M_PI ; 

    //vec4 vertColor = texture2D(earthDay, uvCoord) ;
    vec4 vertColor = texture2D(earthDay, vec2(0.0,0.0));
    //vec4 vertColor = vec4(1,1,1,0);

    //Normal mapping 
    vec3 normalS = normalize( 2.0 * texture(earthNormals, uvCoord).rgb - 1.0 ) ;
    
    vec3 tangente;
    vec3 bitangente;
    vec3 c1 = cross(normalize(vertNormal), vec3(0.0, 0.0, 1.0)); 
    vec3 c2 = cross(normalize(vertNormal), vec3(0.0, 1.0, 0.0)); 
    if (length(c1) > length(c2)) {
       tangente = c1;     
    } else { 
       tangente = c2;
    }     
    tangente = -normalize(tangente); 
    bitangente = normalize(cross(normalize(vertNormal), tangente)); 
    //bitangente = normalize(tangente); 
    //tangente = normalize(cross(normalize(vertNormal), bitangente)); 
    
    //vec3 tangeant = normalize(vec3(-d.x, d.y, 0.0f)) ;
    //vec3 b = cross(normal, tangeant) ; 
   
    mat3 TBN = mat3(tangente, bitangente, normalize(vertNormal)) ; 

    // repere (T,B,N) -> repere objet
    //vec3 newNormal0 = TBN * normalS;
    //repere objet -> repere monde
    //vec4 newNormal = matrix * vec4(newNormal0,1.0); 

    // repere (T,B,N) -> repere monde
    vec3 newNormal = normalMatrix*TBN*normalS;

    //Phong
    vec4 normNormals = normalize(vec4(newNormal,0.0)) ;
    vec4 normLightVector = normalize(lightVector); 
    vec4 normEyeVector = normalize(eyeVector) ; 

    vec4 ambiant = 0.2 * vertColor * lightIntensity ;
    vec4 diffuse = 0.4 * vertColor * max(dot(normNormals,normLightVector), 0) * lightIntensity;
    vec4 specular;
    vec4 vecH = normalize(normEyeVector + normLightVector);  
    if (blinnPhong) {
       specular = 0.4 * vertColor * pow(max(dot(normNormals, vecH), 0),4*shininess) * lightIntensity ; 
    } else {
      vec4 refl = 2*(dot(normNormals,normLightVector))*normNormals-normLightVector;
      refl=normalize(refl);
      specular = 0.4 * vertColor * lightIntensity * pow(max(dot(refl,normEyeVector),0),shininess);
    }

    //Fresnel 
    float Fo = pow((1 - eta),2)/pow((1+eta),2) ; 
    float Fresnel = Fo + (1 - Fo)*pow((1 - dot(vecH,normEyeVector)),5) ; 

    fragColor = ambiant + diffuse + specular ;
    //fragColor = vec4(10*normalS,1.0);
    //fragColor = vertColor + newNormal;
}
