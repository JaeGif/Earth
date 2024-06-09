uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;


varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{

    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // sun orientation
    vec3 uSunDirection = vec3(0.0, 0.0, 1.0);
    float sunOrientation = dot(uSunDirection, normal);

    // Day / Night
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;

    // mix day and night absed on sun orientation
    float dayMix = smoothstep(- 0.25, 0.5, sunOrientation); // spread out the shadow a bit
    color = mix(nightColor, dayColor, dayMix);
    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}