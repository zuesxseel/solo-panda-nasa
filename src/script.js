import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { API_CONFIG, createEnhancedPrompt, callHuggingFaceAPI } from './api-config.js';

import bgTexture1 from '/images/1.jpg';
import bgTexture2 from '/images/2.jpg';
import bgTexture3 from '/images/3.jpg';
import bgTexture4 from '/images/4.jpg';
import sunTexture from '/images/sun.jpg';
import mercuryTexture from '/images/mercurymap.jpg';
import mercuryBump from '/images/mercurybump.jpg';
import venusTexture from '/images/venusmap.jpg';
import venusBump from '/images/venusmap.jpg';
import venusAtmosphere from '/images/venus_atmosphere.jpg';
import earthTexture from '/images/earth_daymap.jpg';
import earthNightTexture from '/images/earth_nightmap.jpg';
import earthAtmosphere from '/images/earth_atmosphere.jpg';
import earthMoonTexture from '/images/moonmap.jpg';
import earthMoonBump from '/images/moonbump.jpg';
import marsTexture from '/images/marsmap.jpg';
import marsBump from '/images/marsbump.jpg';
import jupiterTexture from '/images/jupiter.jpg';
import ioTexture from '/images/jupiterIo.jpg';
import europaTexture from '/images/jupiterEuropa.jpg';
import ganymedeTexture from '/images/jupiterGanymede.jpg';
import callistoTexture from '/images/jupiterCallisto.jpg';
import saturnTexture from '/images/saturnmap.jpg';
import satRingTexture from '/images/saturn_ring.png';
import uranusTexture from '/images/uranus.jpg';
import uraRingTexture from '/images/uranus_ring.png';
import neptuneTexture from '/images/neptune.jpg';
import plutoTexture from '/images/plutomap.jpg';

// ******  SETUP  ******
console.log("Create the scene");
const scene = new THREE.Scene();

console.log("Create a perspective projection camera");
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(-175, 115, 5);

console.log("Create the renderer");
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

console.log("Create an orbit control");
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.75;
controls.screenSpacePanning = false;

console.log("Set up texture loader");
const cubeTextureLoader = new THREE.CubeTextureLoader();
const loadTexture = new THREE.TextureLoader();

// ******  POSTPROCESSING setup ******
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// ******  OUTLINE PASS  ******
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190a05);
composer.addPass(outlinePass);

// ******  BLOOM PASS  ******
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
bloomPass.threshold = 1;
bloomPass.radius = 0.9;
composer.addPass(bloomPass);

// ****** AMBIENT LIGHT ******
console.log("Add the ambient light");
var lightAmbient = new THREE.AmbientLight(0x222222, 6); 
scene.add(lightAmbient);

// ******  Star background  ******
scene.background = cubeTextureLoader.load([

  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2
]);

// ******  CONTROLS  ******
const gui = new dat.GUI({ autoPlace: false });
const customContainer = document.getElementById('gui-container');
customContainer.appendChild(gui.domElement);

// ****** SETTINGS FOR INTERACTIVE CONTROLS  ******
const settings = {
  accelerationOrbit: 1,
  acceleration: 1,
  sunIntensity: 1.9
};

gui.add(settings, 'accelerationOrbit', 0, 10).onChange(value => {
});
gui.add(settings, 'acceleration', 0, 10).onChange(value => {
});
gui.add(settings, 'sunIntensity', 1, 10).onChange(value => {
  sunMat.emissiveIntensity = value;
});

// mouse movement
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

// ******  SELECT PLANET  ******
let selectedPlanet = null;
let isMovingTowardsPlanet = false;
let targetCameraPosition = new THREE.Vector3();
let offset;

function onDocumentMouseDown(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    selectedPlanet = identifyPlanet(clickedObject);
    if (selectedPlanet) {
      closeInfoNoZoomOut();
      
      settings.accelerationOrbit = 0; // Stop orbital movement

      // Update camera to look at the selected planet
      const planetPosition = new THREE.Vector3();
      selectedPlanet.planet.getWorldPosition(planetPosition);
      controls.target.copy(planetPosition);
      camera.lookAt(planetPosition); // Orient the camera towards the planet

      targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
      isMovingTowardsPlanet = true;
    }
  }
}

function identifyPlanet(clickedObject) {
  // Logic to identify which planet was clicked based on the clicked object, different offset for camera distance
        if (clickedObject.material === mercury.planet.material) {
          offset = 10;
          return mercury;
        } else if (clickedObject.material === venus.Atmosphere.material) {
          offset = 25;
          return venus;
        } else if (clickedObject.material === earth.Atmosphere.material) {
          offset = 25;
          return earth;
        } else if (clickedObject.material === mars.planet.material) {
          offset = 15;
          return mars;
        } else if (clickedObject.material === jupiter.planet.material) {
          offset = 50;
          return jupiter;
        } else if (clickedObject.material === saturn.planet.material) {
          offset = 50;
          return saturn;
        } else if (clickedObject.material === uranus.planet.material) {
          offset = 25;
          return uranus;
        } else if (clickedObject.material === neptune.planet.material) {
          offset = 20;
          return neptune;
        } else if (clickedObject.material === pluto.planet.material) {
          offset = 10;
          return pluto;
        } 

  return null;
}

// ******  SHOW PLANET INFO AFTER SELECTION  ******
function showPlanetInfo(planet) {
  var info = document.getElementById('planetInfo');
  var name = document.getElementById('planetName');
  var details = document.getElementById('planetDetails');

  name.innerText = planet;
  details.innerText = `Radius: ${planetData[planet].radius}\nTilt: ${planetData[planet].tilt}\nRotation: ${planetData[planet].rotation}\nOrbit: ${planetData[planet].orbit}\nDistance: ${planetData[planet].distance}\nMoons: ${planetData[planet].moons}\nInfo: ${planetData[planet].info}`;

  info.style.display = 'block';
}
let isZoomingOut = false;
let zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);
// close 'x' button function
function closeInfo() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
  isZoomingOut = true;
  controls.target.set(0, 0, 0);
}
window.closeInfo = closeInfo;
// close info when clicking another planet
function closeInfoNoZoomOut() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
}
// ******  SUN  ******
let sunMat;

const sunSize = 697/40; // 40 times smaller scale than earth
const sunGeom = new THREE.SphereGeometry(sunSize, 32, 20);
sunMat = new THREE.MeshStandardMaterial({
  emissive: 0xFFF88F,
  emissiveMap: loadTexture.load(sunTexture),
  emissiveIntensity: settings.sunIntensity
});
const sun = new THREE.Mesh(sunGeom, sunMat);
scene.add(sun);

//point light in the sun
const pointLight = new THREE.PointLight(0xFDFFD3 , 1200, 400, 1.4);
scene.add(pointLight);


// ******  PLANET CREATION FUNCTION  ******
function createPlanet(planetName, size, position, tilt, texture, bump, ring, atmosphere, moons){

  let material;
  if (texture instanceof THREE.Material){
    material = texture;
  } 
  else if(bump){
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture),
    bumpMap: loadTexture.load(bump),
    bumpScale: 0.7
    });
  }
  else {
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture)
    });
  } 

  const name = planetName;
  const geometry = new THREE.SphereGeometry(size, 32, 20);
  const planet = new THREE.Mesh(geometry, material);
  const planet3d = new THREE.Object3D;
  const planetSystem = new THREE.Group();
  planetSystem.add(planet);
  let Atmosphere;
  let Ring;
  planet.position.x = position;
  planet.rotation.z = tilt * Math.PI / 180;

  // add orbit path
  const orbitPath = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    position, position, // xRadius, yRadius
    0, 2 * Math.PI,   // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
);

  const pathPoints = orbitPath.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.03 });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  planetSystem.add(orbit);

  //add ring
  if(ring)
  {
    const RingGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius,30);
    const RingMat = new THREE.MeshStandardMaterial({
      map: loadTexture.load(ring.texture),
      side: THREE.DoubleSide
    });
    Ring = new THREE.Mesh(RingGeo, RingMat);
    planetSystem.add(Ring);
    Ring.position.x = position;
    Ring.rotation.x = -0.5 *Math.PI;
    Ring.rotation.y = -tilt * Math.PI / 180;
  }
  
  //add atmosphere
  if(atmosphere){
    const atmosphereGeom = new THREE.SphereGeometry(size+0.1, 32, 20);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      map:loadTexture.load(atmosphere),
      transparent: true,
      opacity: 0.4,
      depthTest: true,
      depthWrite: false
    })
    Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial)
    
    Atmosphere.rotation.z = 0.41;
    planet.add(Atmosphere);
  }

  //add moons
  if(moons){
    moons.forEach(moon => {
      let moonMaterial;
      
      if(moon.bump){
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture),
          bumpMap: loadTexture.load(moon.bump),
          bumpScale: 0.5
        });
      } else{
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture)
        });
      }
      const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      const moonOrbitDistance = size * 1.5;
      moonMesh.position.set(moonOrbitDistance, 0, 0);
      planetSystem.add(moonMesh);
      moon.mesh = moonMesh;
    });
  }
  //add planet system to planet3d object and to the scene
  planet3d.add(planetSystem);
  scene.add(planet3d);
  return {name, planet, planet3d, Atmosphere, moons, planetSystem, Ring};
}


// ******  LOADING OBJECTS METHOD  ******
function loadObject(path, position, scale, callback) {
  const loader = new GLTFLoader();

  loader.load(path, function (gltf) {
      const obj = gltf.scene;
      obj.position.set(position, 0, 0);
      obj.scale.set(scale, scale, scale);
      scene.add(obj);
      if (callback) {
        callback(obj);
      }
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}

// ******  ASTEROIDS  ******
const asteroids = [];
function loadAsteroids(path, numberOfAsteroids, minOrbitRadius, maxOrbitRadius) {
  const loader = new GLTFLoader();
  loader.load(path, function (gltf) {
      gltf.scene.traverse(function (child) {
          if (child.isMesh) {
              for (let i = 0; i < numberOfAsteroids / 12; i++) { // Divide by 12 because there are 12 asteroids in the pack
                  const asteroid = child.clone();
                  const orbitRadius = THREE.MathUtils.randFloat(minOrbitRadius, maxOrbitRadius);
                  const angle = Math.random() * Math.PI * 2;
                  const x = orbitRadius * Math.cos(angle);
                  const y = 0;
                  const z = orbitRadius * Math.sin(angle);
                  child.receiveShadow = true;
                  asteroid.position.set(x, y, z);
                  asteroid.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
                  scene.add(asteroid);
                  asteroids.push(asteroid);
              }
          }
      });
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}


// Earth day/night effect shader material
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { type: "t", value: loadTexture.load(earthTexture) },
    nightTexture: { type: "t", value: loadTexture.load(earthNightTexture) },
    sunPosition: { type: "v3", value: sun.position }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    uniform vec3 sunPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
      vSunDirection = normalize(sunPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;

    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    void main() {
      float intensity = max(dot(vNormal, vSunDirection), 0.0);
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv)* 0.2;
      gl_FragColor = mix(nightColor, dayColor, intensity);
    }
  `
});


// ******  MOONS  ******
// Earth
const earthMoon = [{
  size: 1.6,
  texture: earthMoonTexture,
  bump: earthMoonBump,
  orbitSpeed: 0.001 * settings.accelerationOrbit,
  orbitRadius: 10
}]

// Mars' moons with path to 3D models (phobos & deimos)
const marsMoons = [
  {
    modelPath: '/images/mars/phobos.glb',
    scale: 0.1,
    orbitRadius: 5,
    orbitSpeed: 0.002 * settings.accelerationOrbit,
    position: 100,
    mesh: null
  },
  {
    modelPath: '/images/mars/deimos.glb',
    scale: 0.1,
    orbitRadius: 9,
    orbitSpeed: 0.0005 * settings.accelerationOrbit,
    position: 120,
    mesh: null
  }
];

// Jupiter
const jupiterMoons = [
  {
    size: 1.6,
    texture: ioTexture,
    orbitRadius: 20,
    orbitSpeed: 0.0005 * settings.accelerationOrbit
  },
  {
    size: 1.4,
    texture: europaTexture,
    orbitRadius: 24,
    orbitSpeed: 0.00025 * settings.accelerationOrbit
  },
  {
    size: 2,
    texture: ganymedeTexture,
    orbitRadius: 28,
    orbitSpeed: 0.000125 * settings.accelerationOrbit
  },
  {
    size: 1.7,
    texture: callistoTexture,
    orbitRadius: 32,
    orbitSpeed: 0.00006 * settings.accelerationOrbit
  }
];

// ******  PLANET CREATIONS  ******
const mercury = new createPlanet('Mercury', 2.4, 40, 0, mercuryTexture, mercuryBump);
const venus = new createPlanet('Venus', 6.1, 65, 3, venusTexture, venusBump, null, venusAtmosphere);
const earth = new createPlanet('Earth', 6.4, 90, 23, earthMaterial, null, null, earthAtmosphere, earthMoon);
const mars = new createPlanet('Mars', 3.4, 115, 25, marsTexture, marsBump)
// Load Mars moons
marsMoons.forEach(moon => {
  loadObject(moon.modelPath, moon.position, moon.scale, function(loadedModel) {
    moon.mesh = loadedModel;
    mars.planetSystem.add(moon.mesh);
    moon.mesh.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
});

const jupiter = new createPlanet('Jupiter', 69/4, 200, 3, jupiterTexture, null, null, null, jupiterMoons);
const saturn = new createPlanet('Saturn', 58/4, 270, 26, saturnTexture, null, {
  innerRadius: 18, 
  outerRadius: 29, 
  texture: satRingTexture
});
const uranus = new createPlanet('Uranus', 25/4, 320, 82, uranusTexture, null, {
  innerRadius: 6, 
  outerRadius: 8, 
  texture: uraRingTexture
});
const neptune = new createPlanet('Neptune', 24/4, 340, 28, neptuneTexture);
const pluto = new createPlanet('Pluto', 1, 350, 57, plutoTexture)

  // ******  PLANETS DATA  ******
  const planetData = {
    'Mercury': {
        radius: '2,439.7 km',
        tilt: '0.034°',
        rotation: '58.6 Earth days',
        orbit: '88 Earth days',
        distance: '57.9 million km',
        moons: '0',
        info: 'The smallest planet in our solar system and nearest to the Sun.'
    },
    'Venus': {
        radius: '6,051.8 km',
        tilt: '177.4°',
        rotation: '243 Earth days',
        orbit: '225 Earth days',
        distance: '108.2 million km',
        moons: '0',
        info: 'Second planet from the Sun, known for its extreme temperatures and thick atmosphere.'
    },
    'Earth': {
        radius: '6,371 km',
        tilt: '23.5°',
        rotation: '24 hours',
        orbit: '365 days',
        distance: '150 million km',
        moons: '1 (Moon)',
        info: 'Third planet from the Sun and the only known planet to harbor life.'
    },
    'Mars': {
        radius: '3,389.5 km',
        tilt: '25.19°',
        rotation: '1.03 Earth days',
        orbit: '687 Earth days',
        distance: '227.9 million km',
        moons: '2 (Phobos and Deimos)',
        info: 'Known as the Red Planet, famous for its reddish appearance and potential for human colonization.'
    },
    'Jupiter': {
        radius: '69,911 km',
        tilt: '3.13°',
        rotation: '9.9 hours',
        orbit: '12 Earth years',
        distance: '778.5 million km',
        moons: '95 known moons (Ganymede, Callisto, Europa, Io are the 4 largest)',
        info: 'The largest planet in our solar system, known for its Great Red Spot.'
    },
    'Saturn': {
        radius: '58,232 km',
        tilt: '26.73°',
        rotation: '10.7 hours',
        orbit: '29.5 Earth years',
        distance: '1.4 billion km',
        moons: '146 known moons',
        info: 'Distinguished by its extensive ring system, the second-largest planet in our solar system.'
    },
    'Uranus': {
        radius: '25,362 km',
        tilt: '97.77°',
        rotation: '17.2 hours',
        orbit: '84 Earth years',
        distance: '2.9 billion km',
        moons: '27 known moons',
        info: 'Known for its unique sideways rotation and pale blue color.'
    },
    'Neptune': {
        radius: '24,622 km',
        tilt: '28.32°',
        rotation: '16.1 hours',
        orbit: '165 Earth years',
        distance: '4.5 billion km',
        moons: '14 known moons',
        info: 'The most distant planet from the Sun in our solar system, known for its deep blue color.'
    },
    'Pluto': {
        radius: '1,188.3 km',
        tilt: '122.53°',
        rotation: '6.4 Earth days',
        orbit: '248 Earth years',
        distance: '5.9 billion km',
        moons: '5 (Charon, Styx, Nix, Kerberos, Hydra)',
        info: 'Originally classified as the ninth planet, Pluto is now considered a dwarf planet.'
    }
};


// Array of planets and atmospheres for raycasting
const raycastTargets = [
  mercury.planet, venus.planet, venus.Atmosphere, earth.planet, earth.Atmosphere, 
  mars.planet, jupiter.planet, saturn.planet, uranus.planet, neptune.planet, pluto.planet
];

// ******  SHADOWS  ******
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;

//properties for the point light
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 20;

//casting and receiving shadows
earth.planet.castShadow = true;
earth.planet.receiveShadow = true;
earth.Atmosphere.castShadow = true;
earth.Atmosphere.receiveShadow = true;
earth.moons.forEach(moon => {
moon.mesh.castShadow = true;
moon.mesh.receiveShadow = true;
});
mercury.planet.castShadow = true;
mercury.planet.receiveShadow = true;
venus.planet.castShadow = true;
venus.planet.receiveShadow = true;
venus.Atmosphere.receiveShadow = true;
mars.planet.castShadow = true;
mars.planet.receiveShadow = true;
jupiter.planet.castShadow = true;
jupiter.planet.receiveShadow = true;
jupiter.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
  });
saturn.planet.castShadow = true;
saturn.planet.receiveShadow = true;
saturn.Ring.receiveShadow = true;
uranus.planet.receiveShadow = true;
neptune.planet.receiveShadow = true;
pluto.planet.receiveShadow = true;




function animate(){

  //rotating planets around the sun and itself
  sun.rotateY(0.001 * settings.acceleration);
  mercury.planet.rotateY(0.001 * settings.acceleration);
  mercury.planet3d.rotateY(0.004 * settings.accelerationOrbit);
  venus.planet.rotateY(0.0005 * settings.acceleration)
  venus.Atmosphere.rotateY(0.0005 * settings.acceleration);
  venus.planet3d.rotateY(0.0006 * settings.accelerationOrbit);
  earth.planet.rotateY(0.005 * settings.acceleration);
  earth.Atmosphere.rotateY(0.001 * settings.acceleration);
  earth.planet3d.rotateY(0.001 * settings.accelerationOrbit);
  mars.planet.rotateY(0.01 * settings.acceleration);
  mars.planet3d.rotateY(0.0007 * settings.accelerationOrbit);
  jupiter.planet.rotateY(0.005 * settings.acceleration);
  jupiter.planet3d.rotateY(0.0003 * settings.accelerationOrbit);
  saturn.planet.rotateY(0.01 * settings.acceleration);
  saturn.planet3d.rotateY(0.0002 * settings.accelerationOrbit);
  uranus.planet.rotateY(0.005 * settings.acceleration);
  uranus.planet3d.rotateY(0.0001 * settings.accelerationOrbit);
  neptune.planet.rotateY(0.005 * settings.acceleration);
  neptune.planet3d.rotateY(0.00008 * settings.accelerationOrbit);
  pluto.planet.rotateY(0.001 * settings.acceleration)
  pluto.planet3d.rotateY(0.00006 * settings.accelerationOrbit)

// Animate Earth's moon
if (earth.moons) {
  earth.moons.forEach(moon => {
    const time = performance.now();
    const tiltAngle = 5 * Math.PI / 180;

    const moonX = earth.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.sin(tiltAngle);
    const moonZ = earth.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.cos(tiltAngle);

    moon.mesh.position.set(moonX, moonY, moonZ);
    moon.mesh.rotateY(0.01);
  });
}
// Animate Mars' moons
if (marsMoons){
marsMoons.forEach(moon => {
  if (moon.mesh) {
    const time = performance.now();

    const moonX = mars.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
    const moonZ = mars.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

    moon.mesh.position.set(moonX, moonY, moonZ);
    moon.mesh.rotateY(0.001);
  }
});
}

// Animate Jupiter's moons
if (jupiter.moons) {
  jupiter.moons.forEach(moon => {
    const time = performance.now();
    const moonX = jupiter.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
    const moonZ = jupiter.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

    moon.mesh.position.set(moonX, moonY, moonZ);
    moon.mesh.rotateY(0.01);
  });
}

// Rotate asteroids
asteroids.forEach(asteroid => {
  asteroid.rotation.y += 0.0001;
  asteroid.position.x = asteroid.position.x * Math.cos(0.0001 * settings.accelerationOrbit) + asteroid.position.z * Math.sin(0.0001 * settings.accelerationOrbit);
  asteroid.position.z = asteroid.position.z * Math.cos(0.0001 * settings.accelerationOrbit) - asteroid.position.x * Math.sin(0.0001 * settings.accelerationOrbit);
});

// Animate custom planets (if any exist)
if (window.customPlanets) {
  window.customPlanets.forEach(customPlanet => {
    if (customPlanet && customPlanet.planet) {
      customPlanet.planet.rotateY(0.005 * settings.acceleration);
      customPlanet.planet3d.rotateY(0.0001 * settings.accelerationOrbit);
    }
  });
}

// ****** OUTLINES ON PLANETS ******
raycaster.setFromCamera(mouse, camera);

// Check for intersections
var intersects = raycaster.intersectObjects(raycastTargets);

// Reset all outlines
outlinePass.selectedObjects = [];

if (intersects.length > 0) {
  const intersectedObject = intersects[0].object;

  // If the intersected object is an atmosphere, find the corresponding planet
  if (intersectedObject === earth.Atmosphere) {
    outlinePass.selectedObjects = [earth.planet];
  } else if (intersectedObject === venus.Atmosphere) {
    outlinePass.selectedObjects = [venus.planet];
  } else {
    // For other planets, outline the intersected object itself
    outlinePass.selectedObjects = [intersectedObject];
  }
}
// ******  ZOOM IN/OUT  ******
if (isMovingTowardsPlanet) {
  // Smoothly move the camera towards the target position
  camera.position.lerp(targetCameraPosition, 0.03);

  // Check if the camera is close to the target position
  if (camera.position.distanceTo(targetCameraPosition) < 1) {
      isMovingTowardsPlanet = false;
      showPlanetInfo(selectedPlanet.name);

  }
} else if (isZoomingOut) {
  camera.position.lerp(zoomOutTargetPosition, 0.05);

  if (camera.position.distanceTo(zoomOutTargetPosition) < 1) {
      isZoomingOut = false;
  }
}

  controls.update();
  requestAnimationFrame(animate);
  composer.render();
}
loadAsteroids('/asteroids/asteroidPack.glb', 1000, 130, 160);
loadAsteroids('/asteroids/asteroidPack.glb', 3000, 352, 370);
animate();

// ******  CHATBOT FUNCTIONALITY  ******
class SolarSystemChatbot {
  constructor() {
    console.log('Chatbot constructor called');
    
    // Get elements with debugging
    this.container = document.getElementById('chatbot-container');
    this.toggle = document.getElementById('chatbot-toggle');
    this.content = document.getElementById('chatbot-content');
    this.messages = document.getElementById('chatbot-messages');
    this.input = document.getElementById('chatbot-input');
    this.sendButton = document.getElementById('chatbot-send');
    
    // Debug element selection
    console.log('Container found:', !!this.container);
    console.log('Toggle found:', !!this.toggle);
    console.log('Content found:', !!this.content);
    console.log('Messages found:', !!this.messages);
    console.log('Input found:', !!this.input);
    console.log('Send button found:', !!this.sendButton);
    
    // Check if all required elements exist
    if (!this.container || !this.toggle || !this.content || !this.messages || !this.input || !this.sendButton) {
      console.error('Missing required elements for chatbot');
      return;
    }
    
    this.isCollapsed = false;
    this.conversationHistory = [];
    
    this.initializeEventListeners();
    this.addWelcomeMessage();
    
    console.log('Chatbot initialized successfully');
  }
  
  initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Toggle chatbot
    if (this.toggle) {
      this.toggle.addEventListener('click', () => {
        console.log('Toggle clicked');
        this.toggleChatbot();
      });
    }
    
    // Send message
    if (this.sendButton) {
      this.sendButton.addEventListener('click', () => {
        console.log('Send button clicked');
        this.sendMessage();
      });
    }
    
    if (this.input) {
      // Make input clickable and focusable
      this.input.style.pointerEvents = 'auto';
      this.input.style.cursor = 'text';
      
      this.input.addEventListener('keypress', (e) => {
        console.log('Key pressed in input:', e.key);
        if (e.key === 'Enter') {
          console.log('Enter key pressed, sending message');
          this.sendMessage();
        }
      });
      
      // Also add focus event for debugging
      this.input.addEventListener('focus', () => {
        console.log('Input focused');
      });
      
      this.input.addEventListener('blur', () => {
        console.log('Input blurred');
      });
      
      // Add click to focus
      this.input.addEventListener('click', () => {
        console.log('Input clicked, focusing');
        this.input.focus();
      });
      
      // Test if input is working
      console.log('Input element properties:', {
        disabled: this.input.disabled,
        readOnly: this.input.readOnly,
        style: this.input.style.display,
        value: this.input.value
      });
    }
    
    // Header click to toggle
    const header = document.querySelector('.chatbot-header');
    if (header) {
      header.addEventListener('click', () => {
        console.log('Header clicked');
        this.toggleChatbot();
      });
    }
    
    console.log('Event listeners initialized');
  }
  
  toggleChatbot() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
    this.toggle.textContent = this.isCollapsed ? '+' : '−';
  }
  
  addWelcomeMessage() {
    const welcomeMessage = "Hello! I'm your Solar System Assistant. Ask me about planets, space facts, or anything related to our solar system! 🌌";
    this.addMessage(welcomeMessage, 'bot');
  }
  
  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    messageDiv.textContent = text;
    
    this.messages.appendChild(messageDiv);
    this.messages.scrollTop = this.messages.scrollHeight;
    
    // Store in conversation history
    this.conversationHistory.push({ text, sender, timestamp: Date.now() });
  }
  
  async sendMessage() {
    console.log('sendMessage called');
    
    if (!this.input) {
      console.error('Input element not found');
      return;
    }
    
    const message = this.input.value.trim();
    console.log('Message to send:', message);
    
    if (!message) {
      console.log('Empty message, not sending');
      return;
    }
    
    // Add user message
    this.addMessage(message, 'user');
    this.input.value = '';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Generate bot response
    const response = await this.generateResponse(message);
    
    // Remove typing indicator and add response
    this.hideTypingIndicator();
    this.addMessage(response, 'bot');
    
    console.log('Message sent successfully');
  }
  
  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot typing-indicator';
    typingDiv.innerHTML = '<span>🤖 Assistant is typing...</span>';
    typingDiv.id = 'typing-indicator';
    this.messages.appendChild(typingDiv);
    this.messages.scrollTop = this.messages.scrollHeight;
  }
  
  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  async generateResponse(userMessage) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const message = userMessage.toLowerCase();
    
    // Planet-specific responses
    if (message.includes('mercury')) {
      return "Mercury is the smallest planet in our solar system and closest to the Sun! It has extreme temperature variations and no atmosphere. Click on Mercury in the 3D view to learn more! 🪐";
    }
    
    if (message.includes('venus')) {
      return "Venus is often called Earth's twin due to similar size, but it has a thick, toxic atmosphere and is the hottest planet in our solar system! 🌟";
    }
    
    if (message.includes('earth')) {
      return "Earth is our home planet - the only known planet with life! It has liquid water, a protective atmosphere, and the perfect distance from the Sun. 🌍";
    }
    
    if (message.includes('mars')) {
      return "Mars is known as the Red Planet due to iron oxide on its surface. It has two small moons (Phobos and Deimos) and is a target for future human exploration! 🔴";
    }
    
    if (message.includes('jupiter')) {
      return "Jupiter is the largest planet in our solar system! It's a gas giant with a Great Red Spot storm and over 95 known moons, including the four largest: Io, Europa, Ganymede, and Callisto! 🪐";
    }
    
    if (message.includes('saturn')) {
      return "Saturn is famous for its beautiful ring system! It's a gas giant with 146 known moons and is less dense than water - it would float! 💍";
    }
    
    if (message.includes('uranus')) {
      return "Uranus is unique because it rotates on its side! It's an ice giant with a pale blue color and faint rings. It takes 84 Earth years to orbit the Sun! 🔵";
    }
    
    if (message.includes('neptune')) {
      return "Neptune is the most distant planet from the Sun and has the strongest winds in the solar system - up to 1,200 mph! It's a deep blue ice giant. 💙";
    }
    
    if (message.includes('pluto')) {
      return "Pluto is now classified as a dwarf planet, but it's still fascinating! It has a heart-shaped glacier and takes 248 Earth years to orbit the Sun. ❤️";
    }
    
    // General space questions
    if (message.includes('sun') || message.includes('star')) {
      return "The Sun is our star - a massive ball of hot plasma that provides energy for life on Earth! It's about 4.6 billion years old and will continue shining for billions more years. ☀️";
    }
    
    if (message.includes('moon')) {
      return "The Moon is Earth's only natural satellite! It affects our tides and has been visited by humans. Mars has two small moons: Phobos and Deimos. 🌙";
    }
    
    if (message.includes('asteroid')) {
      return "Asteroids are rocky objects that orbit the Sun, mostly found in the asteroid belt between Mars and Jupiter. You can see them in the 3D view! 🪨";
    }
    
    if (message.includes('orbit') || message.includes('revolve')) {
      return "All planets orbit the Sun in elliptical paths! The closer planets orbit faster - Mercury takes 88 days while Neptune takes 165 years! You can see the orbital paths in the 3D view. 🌀";
    }
    
    if (message.includes('rotation') || message.includes('spin')) {
      return "Planets rotate on their axes while orbiting the Sun! Earth takes 24 hours to rotate, while Jupiter rotates in just 10 hours! You can see the rotation in the 3D view. 🌪️";
    }
    
    if (message.includes('atmosphere')) {
      return "Atmospheres are layers of gases around planets. Earth has a protective atmosphere with oxygen, while Venus has a thick, toxic atmosphere. You can see atmospheric effects in the 3D view! 🌫️";
    }
    
    if (message.includes('temperature') || message.includes('hot') || message.includes('cold')) {
      return "Planet temperatures vary greatly! Mercury has extreme temperature swings, Venus is the hottest due to greenhouse effect, while Neptune is very cold at -200°C! 🌡️";
    }
    
    if (message.includes('size') || message.includes('big') || message.includes('small')) {
      return "Planets vary greatly in size! Jupiter is 11 times wider than Earth, while Mercury is only 38% of Earth's size. You can see the size differences in the 3D view! 📏";
    }
    
    if (message.includes('distance') || message.includes('far') || message.includes('close')) {
      return "Planets are at different distances from the Sun! Mercury is closest at 58 million km, while Neptune is 4.5 billion km away. The distances in the 3D view are scaled down for visibility! 📏";
    }
    
    if (message.includes('life') || message.includes('living')) {
      return "So far, Earth is the only planet known to have life! Scientists are searching for signs of life on Mars and moons like Europa, which might have liquid water under its icy surface. 🧬";
    }
    
    if (message.includes('explore') || message.includes('mission') || message.includes('spacecraft')) {
      return "We've sent many spacecraft to explore our solar system! From the Mars rovers to the Voyager missions that are now in interstellar space. The 3D view shows our current understanding! 🚀";
    }
    
    if (message.includes('help') || message.includes('what can you do')) {
      return "I can help you learn about planets, space facts, and the solar system! Try asking about specific planets, ask about orbits, atmospheres, or just explore the 3D solar system by clicking on planets! 🪐✨";
    }
    
    // Test responses for debugging
    if (message.includes('test') || message.includes('hello') || message.includes('hi')) {
      return "Hello! The chatbot is working perfectly! 🎉 You can ask me about any planet or space topic!";
    }
    
    if (message.includes('debug') || message.includes('status')) {
      return "Chatbot Status: ✅ Working! I can answer questions about planets, space, and the solar system. Try asking about Mercury, Earth, or Jupiter!";
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting question about space! Try asking about specific planets or space phenomena. I'm here to help! 🌌",
      "I love talking about space! Ask me about planets, moons, orbits, or anything related to our solar system! 🚀",
      "The solar system is fascinating! Click on planets in the 3D view to learn more, or ask me specific questions! 🌟",
      "There's so much to explore in our solar system! What would you like to know about? 🪐",
      "I'm here to help you learn about space! Try asking about planets, their properties, or how they move! 🌌"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
}

// Initialize chatbot when the page loads
let chatbot;

function initializeChatbot() {
  if (!chatbot && document.getElementById('chatbot-container')) {
    console.log('Initializing Solar System Chatbot...');
    try {
      chatbot = new SolarSystemChatbot();
      console.log('Chatbot initialized successfully!');
    } catch (error) {
      console.error('Error initializing chatbot:', error);
    }
  } else if (!document.getElementById('chatbot-container')) {
    console.log('Chatbot container not found, retrying...');
  }
}

// Try multiple initialization methods
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeChatbot, 100);
  });
} else {
  // DOM is already loaded
  setTimeout(initializeChatbot, 100);
}

// Also try after a longer delay as fallback
setTimeout(initializeChatbot, 1000);

// Global function to test chatbot manually
window.testChatbot = function() {
  if (chatbot) {
    console.log('Chatbot is available:', chatbot);
    chatbot.addMessage('Test message from console', 'user');
    chatbot.addMessage('This is a test response!', 'bot');
  } else {
    console.log('Chatbot not initialized yet. Trying to initialize...');
    initializeChatbot();
  }
};

// Global function to test input directly
window.testInput = function() {
  if (chatbot && chatbot.input) {
    console.log('Testing input element...');
    chatbot.input.focus();
    chatbot.input.value = 'Test message';
    console.log('Input value set to:', chatbot.input.value);
    chatbot.sendMessage();
  } else {
    console.log('Chatbot or input not available');
  }
};

// Global function to check chatbot status
window.checkChatbot = function() {
  console.log('Chatbot status check:');
  console.log('- Chatbot object:', !!chatbot);
  console.log('- Container:', !!document.getElementById('chatbot-container'));
  console.log('- Input:', !!document.getElementById('chatbot-input'));
  console.log('- Send button:', !!document.getElementById('chatbot-send'));
  console.log('- Messages:', !!document.getElementById('chatbot-messages'));
  
  if (chatbot) {
    console.log('- Input element:', chatbot.input);
    console.log('- Input disabled:', chatbot.input?.disabled);
    console.log('- Input readOnly:', chatbot.input?.readOnly);
  }
};

// ******  PLANET GENERATOR FUNCTIONALITY  ******
class PlanetGenerator {
  constructor() {
    this.container = document.getElementById('planet-generator');
    this.toggle = document.getElementById('generator-toggle');
    this.content = document.getElementById('generator-content');
    this.form = document.querySelector('.generator-form');
    this.status = document.getElementById('generation-status');
    this.preview = document.getElementById('planet-preview');
    
    this.isCollapsed = false;
    this.currentPlanet = null;
    this.generatedTextures = {};
    
    this.initializeEventListeners();
  }
  
  initializeEventListeners() {
    // Toggle generator
    this.toggle.addEventListener('click', () => this.toggleGenerator());
    
    // Header click to toggle
    document.querySelector('.generator-header').addEventListener('click', () => this.toggleGenerator());
    
    // Size slider
    const sizeSlider = document.getElementById('planet-size');
    const sizeValue = document.getElementById('size-value');
    sizeSlider.addEventListener('input', (e) => {
      sizeValue.textContent = e.target.value;
    });
    
    // Generate planet button
    document.getElementById('generate-planet').addEventListener('click', () => this.generatePlanet());
    
    // Regenerate button
    document.getElementById('regenerate-planet').addEventListener('click', () => this.generatePlanet());
    
    // Add to solar system button
    document.getElementById('add-to-solar-system').addEventListener('click', () => this.addToSolarSystem());
  }
  
  toggleGenerator() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
    this.toggle.textContent = this.isCollapsed ? '+' : '−';
  }
  
  async generatePlanet() {
    const description = document.getElementById('planet-description').value.trim();
    const planetType = document.getElementById('planet-type').value;
    const size = parseInt(document.getElementById('planet-size').value);
    const includeAtmosphere = document.getElementById('atmosphere').checked;
    const includeBumpMap = document.getElementById('bump-map').checked;
    
    if (!description) {
      alert('Please enter a planet description!');
      return;
    }
    
    // Show loading state
    this.showLoading();
    
    try {
      // Generate enhanced prompt
      const enhancedPrompt = this.createEnhancedPrompt(description, planetType);
      
      // Generate textures
      const textures = await this.generateTextures(enhancedPrompt, {
        includeAtmosphere,
        includeBumpMap
      });
      
      // Store generated textures
      this.generatedTextures = textures;
      
      // Show preview
      this.showPreview(textures);
      
    } catch (error) {
      console.error('Error generating planet:', error);
      alert('Error generating planet. Please try again.');
      this.hideLoading();
    }
  }
  
  createEnhancedPrompt(description, planetType) {
    return createEnhancedPrompt(description, planetType, 'surface');
  }
  
  async generateTextures(prompt, options) {
    const textures = {};
    
    // Generate main surface texture
    console.log('Generating surface texture...');
    textures.surface = await callHuggingFaceAPI(prompt);
    
    // Generate bump map if requested
    if (options.includeBumpMap) {
      console.log('Generating bump map...');
      const description = document.getElementById('planet-description').value.trim();
      const planetType = document.getElementById('planet-type').value;
      const bumpPrompt = createEnhancedPrompt(description, planetType, 'bump');
      textures.bump = await callHuggingFaceAPI(bumpPrompt);
    }
    
    // Generate atmosphere if requested
    if (options.includeAtmosphere) {
      console.log('Generating atmosphere...');
      const description = document.getElementById('planet-description').value.trim();
      const planetType = document.getElementById('planet-type').value;
      const atmospherePrompt = createEnhancedPrompt(description, planetType, 'atmosphere');
      textures.atmosphere = await callHuggingFaceAPI(atmospherePrompt);
    }
    
    return textures;
  }
  
  
  showLoading() {
    this.form.style.display = 'none';
    this.preview.style.display = 'none';
    this.status.style.display = 'block';
  }
  
  hideLoading() {
    this.status.style.display = 'none';
    this.form.style.display = 'flex';
  }
  
  showPreview(textures) {
    this.hideLoading();
    
    // Show surface texture
    document.getElementById('surface-preview').src = textures.surface;
    
    // Show bump map if available
    if (textures.bump) {
      document.getElementById('bump-preview').src = textures.bump;
      document.getElementById('bump-preview-container').style.display = 'block';
    } else {
      document.getElementById('bump-preview-container').style.display = 'none';
    }
    
    // Show atmosphere if available
    if (textures.atmosphere) {
      document.getElementById('atmosphere-preview').src = textures.atmosphere;
      document.getElementById('atmosphere-preview-container').style.display = 'block';
    } else {
      document.getElementById('atmosphere-preview-container').style.display = 'none';
    }
    
    this.preview.style.display = 'block';
  }
  
  addToSolarSystem() {
    if (!this.generatedTextures.surface) {
      alert('No planet generated yet!');
      return;
    }
    
    const description = document.getElementById('planet-description').value.trim();
    const size = parseInt(document.getElementById('planet-size').value);
    
    // Create custom planet
    const customPlanet = this.createCustomPlanet(description, size, this.generatedTextures);
    
    // Add to scene
    scene.add(customPlanet.planet3d);
    
    // Add to raycast targets for interaction
    raycastTargets.push(customPlanet.planet);
    
    // Track custom planets for animation
    if (!window.customPlanets) {
      window.customPlanets = [];
    }
    window.customPlanets.push(customPlanet);
    
    // Show success message
    alert('Custom planet added to solar system! Click on it to interact.');
    
    console.log('Custom planet added:', customPlanet);
  }
  
  createCustomPlanet(name, size, textures) {
    // Create material with generated texture
    const material = new THREE.MeshPhongMaterial({
      map: loadTexture.load(textures.surface),
      bumpMap: textures.bump ? loadTexture.load(textures.bump) : null,
      bumpScale: 0.7
    });
    
    // Create planet geometry and mesh
    const geometry = new THREE.SphereGeometry(size, 32, 20);
    const planet = new THREE.Mesh(geometry, material);
    
    // Create planet system
    const planet3d = new THREE.Object3D();
    const planetSystem = new THREE.Group();
    planetSystem.add(planet);
    
    // Position planet outside the solar system
    planet.position.x = 400; // Far from other planets
    planet.position.y = Math.random() * 20 - 10; // Random height
    planet.position.z = Math.random() * 20 - 10; // Random depth
    
    // Add atmosphere if available
    let atmosphere = null;
    if (textures.atmosphere) {
      const atmosphereGeom = new THREE.SphereGeometry(size + 0.1, 32, 20);
      const atmosphereMaterial = new THREE.MeshPhongMaterial({
        map: loadTexture.load(textures.atmosphere),
        transparent: true,
        opacity: 0.4,
        depthTest: true,
        depthWrite: false
      });
      atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial);
      planet.add(atmosphere);
    }
    
    // Add orbit path
    const orbitPath = new THREE.EllipseCurve(
      0, 0,
      400, 400,
      0, 2 * Math.PI,
      false,
      0
    );
    
    const pathPoints = orbitPath.getPoints(100);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ 
      color: 0xFFD700, 
      transparent: true, 
      opacity: 0.1 
    });
    const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    planetSystem.add(orbit);
    
    // Add to planet system
    planet3d.add(planetSystem);
    
    // Enable shadows
    planet.castShadow = true;
    planet.receiveShadow = true;
    if (atmosphere) {
      atmosphere.castShadow = true;
      atmosphere.receiveShadow = true;
    }
    
    return {
      name: name || 'Custom Planet',
      planet,
      planet3d,
      atmosphere,
      planetSystem
    };
  }
}

// ******  EXOPLANET DATA TABLE FUNCTIONALITY  ******
class ExoplanetDataTable {
  constructor() {
    this.container = document.getElementById('exoplanet-data');
    this.toggle = document.getElementById('data-toggle');
    this.content = document.getElementById('data-content');
    this.searchInput = document.getElementById('data-search');
    this.loadButton = document.getElementById('load-data');
    this.tableBody = document.getElementById('exoplanet-tbody');
    
    this.isCollapsed = false;
    this.exoplanetData = [];
    this.filteredData = [];
    
    this.initializeEventListeners();
  }
  
  initializeEventListeners() {
    // Toggle data table
    this.toggle.addEventListener('click', () => this.toggleDataTable());
    
    // Header click to toggle
    document.querySelector('.data-header').addEventListener('click', () => this.toggleDataTable());
    
    // Load data button
    this.loadButton.addEventListener('click', () => this.loadExoplanetData());
    
    
    // Search functionality
    this.searchInput.addEventListener('input', (e) => this.filterData(e.target.value));
  }
  
  toggleDataTable() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
    this.toggle.textContent = this.isCollapsed ? '+' : '−';
  }
  
  async loadExoplanetData() {
    try {
      this.loadButton.textContent = '⏳ Loading...';
      this.loadButton.disabled = true;
      
      console.log('Loading exoplanet data...');
      
      // Load CSV data
      const response = await fetch('/data/cumulative_2025.10.04_03.20.55.csv');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('CSV data loaded, length:', csvText.length);
      
      // Parse CSV data
      this.exoplanetData = this.parseCSV(csvText);
      console.log('Parsed exoplanet data:', this.exoplanetData.length, 'rows');
      
      this.filteredData = [...this.exoplanetData];
      
      // Display first 5 rows
      this.displayData();
      
      this.loadButton.textContent = '✅ Loaded';
      setTimeout(() => {
        this.loadButton.textContent = '📊 Load Data';
        this.loadButton.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Error loading exoplanet data:', error);
      this.loadButton.textContent = 'Error';
      alert(`Failed to load data: ${error.message}`);
      setTimeout(() => {
        this.loadButton.textContent = 'Load Data';
        this.loadButton.disabled = false;
      }, 2000);
    }
  }
  
  
  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const data = [];
    
    // Find the header line (first line that doesn't start with #)
    let headerLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('#') && lines[i].trim()) {
        headerLine = i;
        break;
      }
    }
    
    if (headerLine === -1) return [];
    
    const headers = lines[headerLine].split(',').map(h => h.trim());
    
    // Parse data rows
    for (let i = headerLine + 1; i < Math.min(headerLine + 6, lines.length); i++) {
      if (lines[i].trim()) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }
      }
    }
    
    return data;
  }
  
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }
  
  displayData() {
    this.tableBody.innerHTML = '';
    
    if (this.filteredData.length === 0) {
      this.tableBody.innerHTML = '<tr><td colspan="6" class="no-data">No data found</td></tr>';
      return;
    }
    
    this.filteredData.forEach((planet, index) => {
      const row = document.createElement('tr');
      
      // Extract key data
      const name = planet.kepler_name || planet.kepoi_name || `Planet ${index + 1}`;
      const radius = planet.koi_prad || 'N/A';
      const temperature = planet.koi_teq || 'N/A';
      const period = planet.koi_period || 'N/A';
      const stellarTemp = parseFloat(planet.koi_steff) || 0;
      
      // Determine star type for display
      let starType = 'N/A';
      if (stellarTemp > 0) {
        if (stellarTemp > 10000) starType = 'Blue Supergiant';
        else if (stellarTemp > 7500) starType = 'Blue Star';
        else if (stellarTemp > 6000) starType = 'White Star';
        else if (stellarTemp > 5000) starType = 'Yellow Star';
        else if (stellarTemp > 4000) starType = 'Orange Star';
        else starType = 'Red Star';
        starType += ` (${stellarTemp}K)`;
      }
      
      row.innerHTML = `
        <td title="${name}">${name.length > 15 ? name.substring(0, 15) + '...' : name}</td>
        <td>${radius}</td>
        <td>${temperature}</td>
        <td>${period}</td>
        <td title="${starType}">${starType.length > 20 ? starType.substring(0, 20) + '...' : starType}</td>
        <td>
          <button class="copy-btn" onclick="exoplanetTable.copyPlanetData(${index})">📋 Copy</button>
          <button class="generate-btn-small" onclick="exoplanetTable.generateFromPlanet(${index})">🌌 Generate</button>
        </td>
      `;
      
      this.tableBody.appendChild(row);
    });
  }
  
  filterData(searchTerm) {
    if (!searchTerm.trim()) {
      this.filteredData = [...this.exoplanetData];
    } else {
      this.filteredData = this.exoplanetData.filter(planet => {
        const name = (planet.kepler_name || planet.kepoi_name || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase());
      });
    }
    this.displayData();
  }
  
  copyPlanetData(index) {
    const planet = this.filteredData[index];
    if (!planet) return;
    
    // Create a formatted description for planet generation
    const name = planet.kepler_name || planet.kepoi_name || 'Unknown Planet';
    const radius = planet.koi_prad || 'unknown';
    const temperature = planet.koi_teq || 'unknown';
    const period = planet.koi_period || 'unknown';
    const stellarTemp = planet.koi_steff || 'unknown';
    
    const description = `${name}: Radius ${radius} Earth radii, Temperature ${temperature}K, Orbital Period ${period} days, Stellar Temperature ${stellarTemp}K`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(description).then(() => {
      // Show success feedback
      const button = event.target;
      const originalText = button.textContent;
      button.textContent = '✅ Copied!';
      button.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard');
    });
  }
  
  generateFromPlanet(index) {
    const planet = this.filteredData[index];
    if (!planet) return;
    
    // Extract all available data
    const name = planet.kepler_name || planet.kepoi_name || 'Unknown Planet';
    const radius = parseFloat(planet.koi_prad) || 1;
    const temperature = parseFloat(planet.koi_teq) || 300;
    const stellarTemp = parseFloat(planet.koi_steff) || 5000;
    const stellarRadius = parseFloat(planet.koi_srad) || 1;
    const period = parseFloat(planet.koi_period) || 365;
    const insolation = parseFloat(planet.koi_insol) || 1;
    
    // Calculate orbital distance using Kepler's laws (approximate)
    const orbitalDistance = this.calculateOrbitalDistance(period, stellarRadius);
    
    // Determine planet type based on comprehensive data
    const planetAnalysis = this.analyzePlanetType(radius, temperature, insolation, stellarTemp);
    
    // Create detailed description
    let description = `${planetAnalysis.type} exoplanet with radius ${radius} Earth radii`;
    
    // Add temperature and distance characteristics
    description += this.getTemperatureDescription(temperature, orbitalDistance);
    
    // Add stellar characteristics
    description += this.getStellarDescription(stellarTemp, stellarRadius);
    
    // Add orbital characteristics
    description += this.getOrbitalDescription(period, orbitalDistance);
    
    // Fill the planet generator form
    if (planetGenerator) {
      document.getElementById('planet-description').value = description;
      document.getElementById('planet-type').value = planetAnalysis.planetType;
      document.getElementById('planet-size').value = Math.min(10, Math.max(1, Math.round(radius)));
      document.getElementById('size-value').textContent = Math.min(10, Math.max(1, Math.round(radius)));
      
      // Show detailed analysis
      const analysisText = `
Planet Analysis:
• Type: ${planetAnalysis.type}
• Size: ${radius} Earth radii (${planetAnalysis.sizeCategory})
• Temperature: ${temperature}K (${planetAnalysis.tempCategory})
• Distance: ~${orbitalDistance.toFixed(2)} AU
• Star: ${stellarTemp}K (${planetAnalysis.starType})
• Period: ${period} days
      `.trim();
      
      alert(`Planet data loaded!\n\n${analysisText}`);
    } else {
      alert('Planet generator not available. Please try again.');
    }
  }
  
  calculateOrbitalDistance(period, stellarRadius) {
    // Approximate calculation using Kepler's third law
    // a^3 = P^2 * M (in AU and years)
    // For simplicity, assuming solar mass star
    const periodYears = period / 365.25;
    const distance = Math.pow(periodYears * periodYears, 1/3);
    return distance;
  }
  
  analyzePlanetType(radius, temperature, insolation, stellarTemp) {
    let type, planetType, sizeCategory, tempCategory, starType;
    
    // Determine planet type based on radius
    if (radius > 6) {
      type = 'Gas giant';
      planetType = 'gas-giant';
      sizeCategory = 'Very large';
    } else if (radius > 4) {
      type = 'Large gas giant';
      planetType = 'gas-giant';
      sizeCategory = 'Large';
    } else if (radius > 2.5) {
      type = 'Super-Earth';
      planetType = 'rocky';
      sizeCategory = 'Large rocky';
    } else if (radius > 1.5) {
      type = 'Large rocky planet';
      planetType = 'rocky';
      sizeCategory = 'Medium rocky';
    } else if (radius > 0.8) {
      type = 'Earth-sized rocky planet';
      planetType = 'rocky';
      sizeCategory = 'Earth-sized';
    } else {
      type = 'Small rocky planet';
      planetType = 'rocky';
      sizeCategory = 'Small rocky';
    }
    
    // Determine temperature category
    if (temperature > 1000) {
      tempCategory = 'Extremely hot (molten/lava world)';
    } else if (temperature > 500) {
      tempCategory = 'Hot (scorched surface)';
    } else if (temperature > 300) {
      tempCategory = 'Warm (potentially habitable)';
    } else if (temperature > 200) {
      tempCategory = 'Cool (icy surface)';
    } else {
      tempCategory = 'Very cold (frozen world)';
    }
    
    // Determine star type
    if (stellarTemp > 10000) {
      starType = 'Blue supergiant';
    } else if (stellarTemp > 7500) {
      starType = 'Blue star';
    } else if (stellarTemp > 6000) {
      starType = 'White star';
    } else if (stellarTemp > 5000) {
      starType = 'Yellow star (Sun-like)';
    } else if (stellarTemp > 4000) {
      starType = 'Orange star';
    } else {
      starType = 'Red star';
    }
    
    return { type, planetType, sizeCategory, tempCategory, starType };
  }
  
  getTemperatureDescription(temperature, orbitalDistance) {
    if (temperature > 1000) {
      return `, extremely hot molten surface at ${temperature}K (close to star at ~${orbitalDistance.toFixed(2)} AU)`;
    } else if (temperature > 500) {
      return `, hot scorched surface at ${temperature}K (close to star at ~${orbitalDistance.toFixed(2)} AU)`;
    } else if (temperature > 300) {
      return `, warm potentially habitable surface at ${temperature}K (moderate distance ~${orbitalDistance.toFixed(2)} AU)`;
    } else if (temperature > 200) {
      return `, cool icy surface at ${temperature}K (far from star at ~${orbitalDistance.toFixed(2)} AU)`;
    } else {
      return `, very cold frozen surface at ${temperature}K (very far from star at ~${orbitalDistance.toFixed(2)} AU)`;
    }
  }
  
  getStellarDescription(stellarTemp, stellarRadius) {
    let starDesc = '';
    
    if (stellarTemp > 10000) {
      starDesc = `, orbiting a massive blue supergiant star (${stellarTemp}K, ${stellarRadius} solar radii)`;
    } else if (stellarTemp > 7500) {
      starDesc = `, orbiting a hot blue star (${stellarTemp}K, ${stellarRadius} solar radii)`;
    } else if (stellarTemp > 6000) {
      starDesc = `, orbiting a white star (${stellarTemp}K, ${stellarRadius} solar radii)`;
    } else if (stellarTemp > 5000) {
      starDesc = `, orbiting a sun-like yellow star (${stellarTemp}K, ${stellarRadius} solar radii)`;
    } else if (stellarTemp > 4000) {
      starDesc = `, orbiting an orange star (${stellarTemp}K, ${stellarRadius} solar radii)`;
    } else {
      starDesc = `, orbiting a cool red star (${stellarTemp}K, ${stellarRadius} solar radii)`;
    }
    
    return starDesc;
  }
  
  getOrbitalDescription(period, orbitalDistance) {
    if (period < 10) {
      return `, with a very short ${period.toFixed(1)}-day orbit`;
    } else if (period < 100) {
      return `, with a short ${period.toFixed(1)}-day orbit`;
    } else if (period < 1000) {
      return `, with a moderate ${period.toFixed(1)}-day orbit`;
    } else {
      return `, with a long ${period.toFixed(1)}-day orbit`;
    }
  }
}

// Initialize exoplanet data table when the page loads
let exoplanetTable;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (document.getElementById('exoplanet-data')) {
      exoplanetTable = new ExoplanetDataTable();
      console.log('Exoplanet Data Table initialized');
    }
  }, 200);
});

// Initialize planet generator when the page loads
let planetGenerator;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (document.getElementById('planet-generator')) {
      planetGenerator = new PlanetGenerator();
      console.log('Planet Generator initialized');
    }
  }, 200);
});

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  composer.setSize(window.innerWidth,window.innerHeight);
});
