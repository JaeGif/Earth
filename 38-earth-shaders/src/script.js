import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

import earthVertexShader from './shaders/earth/vertex.glsl';
import earthFragmentShader from './shaders/earth/fragment.glsl';

import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl';
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl';

/**
 * Base
 */
// Debug

let gui;
if (window.location.hash === '#debug') gui = new GUI({ width: 340 });

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();
// milky way

const environmentMap = textureLoader.load('./milkyway/milkyway.png');
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
environmentMap.colorSpace = THREE.SRGBColorSpace;
scene.background = environmentMap;
scene.backgroundIntensity = 0.1;

/**
 * Earth
 */

const earthParameters = {};
earthParameters.atmosphereDayColor = '#00aaff';
earthParameters.atmosphereTwilightColor = '#ff6600';
if (gui) {
  gui.addColor(earthParameters, 'atmosphereDayColor').onChange(() => {
    earthMaterial.uniforms.uAtmosphereDayColor.value.set(
      earthParameters.atmosphereDayColor
    );
    atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(
      earthParameters.atmosphereDayColor
    );
  });

  gui.addColor(earthParameters, 'atmosphereTwilightColor').onChange(() => {
    earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(
      earthParameters.atmosphereTwilightColor
    );
    atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(
      earthParameters.atmosphereTwilightColor
    );
  });
}
const earthDayTexture = textureLoader.load('./earth/day.jpg');
const earthNightTexture = textureLoader.load('./earth/night.jpg');
const earthSpecularCloudsTexture = textureLoader.load(
  './earth/specularClouds.jpg'
);
const earthNormalTexture = textureLoader.load('./earth/earthNormal.png');

earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.colorSpace = THREE.SRGBColorSpace;

earthDayTexture.anisotropy = 8;
earthNightTexture.anisotropy = 8;
earthSpecularCloudsTexture.anisotropy = 8;

// anisotropy can have a performance impact
// 8 is decent, 4 covers all devices

// add ambient light cause physical material
const ambientLight = new THREE.AmbientLight('#fff', 1);

scene.add(ambientLight);
const earthGeometry = new THREE.SphereGeometry(2, 128, 128);
const earthMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,

  vertexShader: earthVertexShader,
  fragmentShader: earthFragmentShader,
  normalMap: earthNormalTexture,
  uniforms: {
    uDayTexture: new THREE.Uniform(earthDayTexture),
    uNightTexture: new THREE.Uniform(earthNightTexture),
    uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereTwilightColor)
    ),
  },
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);

scene.add(earth);
// atmosphere
const atmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  uniforms: {
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParameters.atmosphereTwilightColor)
    ),
  },
});
const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.set(1.04, 1.04, 1.04);

scene.add(atmosphere);

// Sun
const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();

// debug sun
const debugSun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial({ color: 'white' })
);
const sunLight = new THREE.DirectionalLight('#fff', 2);

scene.add(sunLight);
scene.add(debugSun);
const updateSun = () => {
  // sun direction
  sunDirection.setFromSpherical(sunSpherical);
  debugSun.position.copy(sunDirection).multiplyScalar(5);
  sunLight.position.copy(sunDirection).multiplyScalar(5);
  // uniforms
  earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
};
updateSun();
// tweaks
if (gui) {
  gui.add(sunSpherical, 'phi').min(0).max(Math.PI).onChange(updateSun);
  gui.add(sunSpherical, 'theta').min(-Math.PI).max(Math.PI).onChange(updateSun);
}
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight + 1,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight + 1;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 12;
camera.position.y = 5;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor('#000011');

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  earth.rotation.y = elapsedTime * 0.1;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
