#version 410

uniform float lightIntensity;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;
uniform sampler2D shadowMap;
uniform int nSamples_softShadow; 
uniform float bias;

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

    //PCF
    int x,y;
    //float pas = 0.0005;
    float pas  = 1.0/512.0;
    for (y=-nSamples_softShadow; y <=nSamples_softShadow; y++) {
    	for (x=-nSamples_softShadow; x <=nSamples_softShadow; x++) {
	    if (texture(shadowMap,light.xy + vec2(x*pas,y*pas)).z < light.z-bias) {
	       fragColor += ambiant;
    	    } else {
	       fragColor += ambiant + diffuse + Fresnel*specular; 
    	    }
	}
    }
    	 
    fragColor /= pow(2*nSamples_softShadow+1,2);

   
}
