#version 410

uniform float lightIntensity;
uniform sampler2D colorTexture;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;

in vec4 eyeVector;
in vec4 lightVector;
in vec3 vertNormal;
in vec2 textCoords;

out vec4 fragColor;

void main( void )
{

	vec4 normNormals = vec4(normalize(vertNormal),0.0) ;
    vec4 normLightVector = normalize(lightVector); 
    vec4 normEyeVector = normalize(eyeVector) ; 

    vec4 vertColor = texture2D(colorTexture, textCoords);
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


    fragColor = ambiant + diffuse + Fresnel*specular; 
}
