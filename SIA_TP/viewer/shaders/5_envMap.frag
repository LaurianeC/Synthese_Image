#version 410
#define M_PI 3.14159265358979323846

uniform sampler2D envMap;
uniform mat4 lightMatrix;
uniform bool transparent;
uniform float eta;

in vec4 vertColor;
in vec3 vertNormal;
in vec4 eyeVector;
in vec4 lightVector;

out vec4 fragColor;


void main( void )
{
    //normalisation
    vec4 vNormal = normalize(vec4(vertNormal,0.0));
    vec4 eVector = normalize(eyeVector);
    vec4 lVector = normalize(lightVector);

    //rayon reflechi
    vec4 refl = normalize(reflect(-eVector, vNormal));

    //rayon refracte
    float ratio = 1.0/eta;
    vec4 refr = normalize(refract(-eVector, vNormal, ratio));

    //coordonnées de texture
    vec2 reflTexCoords;
    reflTexCoords.x = 0.5 + atan(refl.x,refl.z)/(2*M_PI); 
    reflTexCoords.y = 1.0 - (acos(refl.y))/M_PI ;
    //float m = 2. * sqrt( pow( refl.z, 2. ) + pow( refl.y, 2. ) + pow( refl.x + 1., 2. ) );
    //reflTexCoords.x = refl.z / m + 0.5;
    //reflTexCoords.y = refl.y / m + 0.5;

    vec2 refrTexCoords;
    refrTexCoords.x = 0.5 + atan(refr.x,refr.z)/(2*M_PI); 
    refrTexCoords.y = 1.0 - (acos(refr.y))/M_PI ;
    
    //couleurs
    vec3 reflColor = texture(envMap,reflTexCoords).rgb;
    vec3 refrColor = texture(envMap,refrTexCoords).rgb;

    //Fresnel 
    vec4 vecH = normalize(eVector + lVector);  
    float Fo = pow((1.0 - eta),2)/pow((1.0+eta),2) ; 
    float Fresnel = Fo + (1.0 - Fo)*pow((1.0 - dot(vecH,eVector)),5) ;

    //fragColor = vec4(refrColor,1.0);
    fragColor = vec4((1.0-Fresnel)*refrColor,1.0)+vec4(Fresnel*reflColor,1.0);
}
