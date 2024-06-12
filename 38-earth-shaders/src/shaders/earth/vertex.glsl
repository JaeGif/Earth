
varying vec2 vUv;
varying vec3 vNormalVertex;
varying vec3 vPosition;


void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    csm_Position = position * vec3(1.0);
    // Model normal
    vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;


    // Varyings
    vUv = uv;
    vNormalVertex = modelNormal;
    vPosition = modelPosition.xyz;
}