#version 410
#define M_PI 3.14159265358979323846

uniform sampler2D envMap;
uniform mat4 lightMatrix;
uniform bool transparent;
uniform float eta;
uniform float shininess;

in vec4 vertColor;
in vec3 vertNormal;
in vec4 eyeVector;
in vec4 lightVector;

out vec4 fragColor;


float rand(vec2 co) {
	float a = 12.9898 ; 
	float b = 78.233 ; 
	float c = 43758.5453 ;
	float dt = dot(co.xy, vec2(a,b)) ; 
	float sn = mod(dt, M_PI); 
	return fract(sin(sn) * c) ;
}


void main( void )
{
    //normalisation
    vec4 vNormal = normalize(vec4(vertNormal,0.0));
    vec4 eVector = normalize(eyeVector);
    vec4 lVector = normalize(lightVector);


    //rayon refracte
    float ratio = 1.0/eta;
    vec4 refr = normalize(refract(-eVector, vNormal, ratio));


    //Matrice changement de repère
  
    vec3 tangente = normalize(vec3(vertNormal.z, 0.0f, -vertNormal.x));
    vec3 bitangente = cross(vertNormal, tangente);

    mat3 TBN = mat3(tangente, bitangente, vertNormal) ; 


    //Moyenne des rayons réflechis aléatoires autour du rayon "miroir" 

	vec3 reflColorMiror ;
    vec3 refl_miror = normalize(reflect(-eVector, vNormal).xyz);
    vec2 reflTexCoords;
    reflTexCoords.x = 0.5 + atan(refl_miror.x,refl_miror.z)/(2*M_PI); 
    //reflTexCoords.y = 1.0 - (acos(refl_miror.y))/M_PI ;
    reflTexCoords.y = (acos(refl_miror.y))/M_PI ;
    reflColorMiror = texture(envMap,reflTexCoords).rgb;

    vec3 meanReflColor = reflColorMiror ; 

    vec3 reflColor ;
    float numberNormals = 30 ;
    float poids ; 
    float sumPoids = 0 ; 
    int i = 0 ; 
    float a = 0.33 ; 
    float b = 0.44 ; 

    int glossiness = 1 ; 
    while(i < numberNormals) {
	float u1 = rand(vec2(3.33 + i*a, 2.6786)) ; 
	float u2 = rand(vec2(1.627, 0.2318+i*b)) ; 
	float phi = 2 * M_PI * u1 ; 
	float theta = acos(pow(u2, (shininess+1)/2)) ; 
	vec3 normalM = TBN * vec3(sin(phi)*cos(theta), cos(theta), sin(phi)*cos(phi)) ; 
	i++ ; 
	vec3 incidentReflc = normalize(reflect(eVector, normalize(vec4(normalM,1.0)))).xyz ; 
      	//coordonnées de texture
	reflTexCoords.x = 0.5 + atan(incidentReflc.x,incidentReflc.z)/(2*M_PI); 
        //reflTexCoords.y = 1.0 - (acos(incidentReflc.y))/M_PI ;
        reflTexCoords.y = (acos(incidentReflc.y))/M_PI ;
  	reflColor = texture(envMap,reflTexCoords).rgb;
	float poids = abs(dot(incidentReflc, refl_miror)) * glossiness  ;
	sumPoids += poids ; 
	meanReflColor = meanReflColor + poids*reflColor ;	
    }
    meanReflColor = meanReflColor / sumPoids ;
    
    vec2 refrTexCoords;
    refrTexCoords.x = 0.5 + atan(refr.x,refr.z)/(2*M_PI); 
    //refrTexCoords.y = 1.0 - (acos(refr.y))/M_PI ;
    refrTexCoords.y =(acos(refr.y))/M_PI ;
    vec3 refrColor = texture(envMap,refrTexCoords).rgb;

    //Fresnel 
    vec4 vecH = normalize(eVector + lVector);  
    float Fo = pow((1.0 - eta),2)/pow((1.0+eta),2) ; 
    float Fresnel = Fo + (1.0 - Fo)*pow((1.0 - dot(vecH,eVector)),5) ;

    //fragColor = vec4(refrColor,1.0);
    fragColor = vec4((1.0-Fresnel)*refrColor,1.0)+vec4(Fresnel*meanReflColor,1.0);
}
