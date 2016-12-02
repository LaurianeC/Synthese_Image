#version 410

uniform float lightIntensity;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;
uniform sampler2D shadowMap;
uniform float bias;
uniform float lightSize;

in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;
in vec4 vertColor;
in vec4 lightSpace ;

out vec4 fragColor;

void main( void )
{

    vec4 normNormals = vec4(normalize(vertNormal),0.0) ;
    vec4 normLightVector = normalize(lightVector) ; 
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

    //Shadow coordinates
    vec4 light = ((lightSpace / lightSpace.w)*0.5 ) +0.5  ; 
    light.y = (1 - light.y) ; 

    //Bias
    //float bias = max(0.05 * (1.0 - dot(normNormals,normLightVector)), 0.005);  
    //float lightSize = 0.01;
    //Calcul de zavg
    int n = 3;
    float zavg = 0;
    float pas  = 1.0/512.0;
    for (int y=-n; y <=n; y++) {
    	for (int x=-n; x <=n; x++) {
	    zavg += texture(shadowMap,light.xy + vec2(x*pas,y*pas)).z;
	}
    }
    zavg /= pow(2*n+1,2);

    //Calcul de la taille de la penombre
    float penumbraSize = lightSize * (light.z - zavg)/zavg;

    //PCF
    int x,y;
    pas  = 1.0/512.0;
    int nSamples = int(penumbraSize / pas + 1);
    nSamples = (nSamples - 1)/2;
    for (y=-nSamples; y <=nSamples; y++) {
    	for (x=-nSamples; x <=nSamples; x++) {
	    if (texture(shadowMap,light.xy + vec2(x*pas,y*pas)).z < light.z-bias) {
	       fragColor += ambiant;
    	    } else {
	       fragColor += ambiant + diffuse + Fresnel*specular; 
    	    }
	}
    }
    	 
    fragColor /= pow(2*nSamples+1,2);

   
}
