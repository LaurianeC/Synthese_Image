#version 410 
// Copyright (C) 2007 Dave Griffiths
// Licence: GPLv2 (see COPYING)
// Fluxus Shader Library
// ---------------------
// Gooch NPR Shading Model
// Orginally for technical drawing style 
// rendering, uses warm and cool colours
// to depict shading to keep detail in the
// shadowed areas


//Todo : passer les warm et cool colors, et coefficients en uniform pour pouvoir les modifiers depuis le gui

//En cours : pourquoi ça dépend pas de la position de la lumiere ?? 


//uniform vec3 WarmColour;
//uniform vec3 CoolColour;
//uniform vec3 SurfaceColour;
//uniform float OutlineWidth;

uniform float lightIntensity;
uniform bool blinnPhong;
uniform float shininess;
uniform float eta;

in vec3 vertNormal ;
in vec4 eyeVector ; 
in vec4 lightVector ;
in vec4 vertColor ; 


void main()
{     
  
    vec3 coolColor = vec3(0.0,0.0,0.8); 
    vec3 warmColor = vec3(0.8, 0.0, 0.0) ; 

    vec4 light4 = normalize(lightVector);
    vec4 eye4 = normalize(eyeVector);
    vec4 h4 = normalize(light4+eye4);

    vec3 light = light4.xyz ; 
    vec3 normal = normalize(vertNormal) ;
    vec3 eye = eye4.xyz ; 
    vec3 h = h4.xyz ; 
    

    vec3 specular = vertColor.xyz * pow(max(dot(eye, h), 0),4*shininess) * lightIntensity ;
    
    //Gestion de la diffuse color 

    vec3 diffuse = vertColor.xyz ;

    float coef_c = 1 ; 
    float coef_w = 1 ; 

    /*Gooch lighting*/
    float NL = dot(normal,light) ;
    vec3 cool = coolColor + coef_c * diffuse ; 
    vec3 warm = warmColor + coef_w * diffuse ; 
    vec3 color =  ((1-NL)/2)*cool + ((1+ NL) / 2)*warm + specular ; 


    /*Edges*/
    float NE = dot(normal, eye) ; 
    if (NE<0.2) {
	color = vec3(0, 0, 0) ; 
    }
    
    gl_FragColor = vec4(color,1.0) ;
}
