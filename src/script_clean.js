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
import demoBumpMap from '/images/demo 2.png';

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
        } else if (clickedObject.material === demoPlanet.planet.material) {
          offset = 30;
          return demoPlanet;
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

// ******  DEMO PLANET SCENE (SEPARATE FROM SOLAR SYSTEM)  ******
let demoScene, demoCamera, demoRenderer, demoPlanet, demoControls;
let isInDemoMode = false;

function createDemoScene() {
  // Create a separate scene for the demo planet
  demoScene = new THREE.Scene();
  
  // Create a separate camera for demo scene
  demoCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  demoCamera.position.set(0, 0, 15);
  
  // Create a separate renderer for demo scene
  demoRenderer = new THREE.WebGLRenderer({ alpha: true });
  demoRenderer.setSize(window.innerWidth, window.innerHeight);
  demoRenderer.setClearColor(0x000000, 0); // Transparent background
  demoRenderer.domElement.style.position = 'fixed';
  demoRenderer.domElement.style.top = '0';
  demoRenderer.domElement.style.left = '0';
  demoRenderer.domElement.style.zIndex = '1000';
  demoRenderer.domElement.style.display = 'none'; // Hidden by default
  document.body.appendChild(demoRenderer.domElement);
  
  // Create orbit controls for demo scene
  demoControls = new OrbitControls(demoCamera, demoRenderer.domElement);
  demoControls.enableDamping = true;
  demoControls.dampingFactor = 0.05;
  
  // Add lighting to demo scene (independent of sun)
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // Soft ambient light
  demoScene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  demoScene.add(directionalLight);
  
  // Create the demo planet
  const demoMaterial = new THREE.MeshPhongMaterial({
    map: loadTexture.load(demoBumpMap), // Use demo 2.png as the main texture
    bumpMap: loadTexture.load(demoBumpMap), // Also use as bump map for extra detail
    bumpScale: 0.8 // Stronger bump effect
  });
  
  const demoGeometry = new THREE.SphereGeometry(5, 64, 32); // Higher resolution
  demoPlanet = new THREE.Mesh(demoGeometry, demoMaterial);
  demoPlanet.position.set(0, 0, 0);
  demoPlanet.castShadow = true;
  demoPlanet.receiveShadow = true;
  
  demoScene.add(demoPlanet);
  
  // Add a subtle background
  const backgroundGeometry = new THREE.SphereGeometry(50, 32, 16);
  const backgroundMaterial = new THREE.MeshBasicMaterial({
    color: 0x000011,
    side: THREE.BackSide
  });
  const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
  demoScene.add(background);
  
  // Add some stars
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1
  });
  
  const starsVertices = [];
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    starsVertices.push(x, y, z);
  }
  
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  demoScene.add(stars);
}

function showDemoPlanet() {
  if (!demoScene) {
    createDemoScene();
  }
  
  isInDemoMode = true;
  demoRenderer.domElement.style.display = 'block';
  
  // Hide the main solar system
  document.body.style.overflow = 'hidden';
  
  // Get the planet description from the form
  const description = document.getElementById('planet-description').value.trim() || 'Custom Planet';
  
  // Add close button with planet info
  const closeButton = document.createElement('button');
  closeButton.innerHTML = `✕ Close ${description}`;
  closeButton.style.position = 'fixed';
  closeButton.style.top = '20px';
  closeButton.style.right = '20px';
  closeButton.style.zIndex = '1001';
  closeButton.style.padding = '10px 20px';
  closeButton.style.backgroundColor = '#ff6b35';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '5px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '16px';
  closeButton.style.fontWeight = 'bold';
  
  closeButton.onclick = () => {
    hideDemoPlanet();
    document.body.removeChild(closeButton);
  };
  
  document.body.appendChild(closeButton);
  
  // Add planet info display
  const infoDisplay = document.createElement('div');
  infoDisplay.innerHTML = `
    <div style="position: fixed; top: 20px; left: 20px; z-index: 1001; background: rgba(0,0,0,0.8); color: white; padding: 15px; border-radius: 10px; max-width: 300px;">
      <h3 style="margin: 0 0 10px 0; color: #87CEEB;">Generated Planet</h3>
      <p style="margin: 0; font-size: 14px;"><strong>Description:</strong> ${description}</p>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">Use mouse to orbit around the planet</p>
    </div>
  `;
  document.body.appendChild(infoDisplay);
  
  // Store references for cleanup
  closeButton.infoDisplay = infoDisplay;
  
  // Start demo animation
  animateDemo();
}

function hideDemoPlanet() {
  isInDemoMode = false;
  demoRenderer.domElement.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  // Clean up any remaining UI elements
  const closeButton = document.querySelector('button[style*="position: fixed"]');
  if (closeButton && closeButton.infoDisplay) {
    document.body.removeChild(closeButton.infoDisplay);
  }
  
  // Show the planet preview instead of going back to form
  if (planetGenerator) {
    planetGenerator.showPlanetPreview();
  }
}

function animateDemo() {
  if (!isInDemoMode) return;
  
  // Rotate the demo planet
  if (demoPlanet) {
    demoPlanet.rotateY(0.01);
  }
  
  demoControls.update();
  demoRenderer.render(demoScene, demoCamera);
  
  requestAnimationFrame(animateDemo);
}

// Add to raycast targets
const raycastTargets = [
  mercury.planet, venus.planet, venus.Atmosphere, earth.planet, earth.Atmosphere, 
  mars.planet, jupiter.planet, saturn.planet, uranus.planet, neptune.planet, pluto.planet
];

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
  },
};

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

// Load asteroids and start animation
loadAsteroids('/asteroids/asteroidPack.glb', 1000, 130, 160);
loadAsteroids('/asteroids/asteroidPack.glb', 3000, 352, 370);
animate();

// Event listeners
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  composer.setSize(window.innerWidth,window.innerHeight);
  
  // Also resize demo renderer if it exists
  if (demoRenderer) {
    demoRenderer.setSize(window.innerWidth, window.innerHeight);
    demoCamera.aspect = window.innerWidth / window.innerHeight;
    demoCamera.updateProjectionMatrix();
  }
});

// ******  AI PLANET GENERATOR FUNCTIONALITY  ******
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
    console.log('Initializing PlanetGenerator event listeners...');
    
    // Toggle generator
    if (this.toggle) {
      this.toggle.addEventListener('click', () => this.toggleGenerator());
      console.log('Toggle button event listener added');
    }
    
    // Header click to toggle
    const header = document.querySelector('.generator-header');
    if (header) {
      header.addEventListener('click', () => this.toggleGenerator());
      console.log('Header click event listener added');
    }
    
    // Size slider
    const sizeSlider = document.getElementById('planet-size');
    const sizeValue = document.getElementById('size-value');
    if (sizeSlider && sizeValue) {
      sizeSlider.addEventListener('input', (e) => {
        sizeValue.textContent = e.target.value;
        console.log('Size slider changed to:', e.target.value);
      });
      console.log('Size slider event listener added');
    } else {
      console.error('Size slider or size value not found');
    }
    
    // Generate planet button
    const generateBtn = document.getElementById('generate-planet');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generatePlanet());
      console.log('Generate button event listener added');
    } else {
      console.error('Generate button not found');
    }
    
    // Regenerate button
    const regenerateBtn = document.getElementById('regenerate-planet');
    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => this.generatePlanet());
      console.log('Regenerate button event listener added');
    }
    
    // Add to solar system button
    const addBtn = document.getElementById('add-to-solar-system');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addToSolarSystem());
      console.log('Add to solar system button event listener added');
    }
    
    
    // Test form inputs
    this.testFormInputs();
  }
  
  testFormInputs() {
    console.log('Testing form inputs...');
    
    const textarea = document.getElementById('planet-description');
    const select = document.getElementById('planet-type');
    const range = document.getElementById('planet-size');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    console.log('Form elements found:', {
      textarea: !!textarea,
      select: !!select,
      range: !!range,
      checkboxes: checkboxes.length
    });
    
    if (textarea) {
      textarea.addEventListener('focus', () => console.log('Textarea focused'));
      textarea.addEventListener('input', (e) => console.log('Textarea input:', e.target.value));
      textarea.addEventListener('keydown', (e) => console.log('Textarea keydown:', e.key));
    }
    
    if (select) {
      select.addEventListener('change', (e) => console.log('Select changed to:', e.target.value));
    }
    
    if (range) {
      range.addEventListener('input', (e) => console.log('Range changed to:', e.target.value));
    }
    
    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('change', (e) => console.log(`Checkbox ${index} changed to:`, e.target.checked));
    });
  }
  
  toggleGenerator() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
    this.toggle.textContent = this.isCollapsed ? '+' : '−';
  }
  
  async generatePlanet() {
    console.log('Generate planet called');
    
    // Reset to form view when starting new generation
    this.resetToForm();
    
    const descriptionField = document.getElementById('planet-description');
    const typeField = document.getElementById('planet-type');
    const sizeField = document.getElementById('planet-size');
    const atmosphereField = document.getElementById('atmosphere');
    const bumpMapField = document.getElementById('bump-map');
    
    console.log('Form fields:', {
      descriptionField: !!descriptionField,
      typeField: !!typeField,
      sizeField: !!sizeField,
      atmosphereField: !!atmosphereField,
      bumpMapField: !!bumpMapField
    });
    
    if (!descriptionField || !typeField || !sizeField) {
      alert('Form not properly loaded. Please refresh the page.');
      return;
    }
    
    const description = descriptionField.value.trim();
    const planetType = typeField.value;
    const size = parseInt(sizeField.value);
    const includeAtmosphere = atmosphereField ? atmosphereField.checked : false;
    const includeBumpMap = bumpMapField ? bumpMapField.checked : false;
    
    console.log('Form values:', {
      description,
      planetType,
      size,
      includeAtmosphere,
      includeBumpMap
    });
    
    if (!description) {
      alert('Please enter a planet description!');
      return;
    }
    
    // Show loading state
    this.showLoading();
    
    try {
      // Simulate AI generation process with loading
      await this.simulateAIGeneration();
      
      // Show the demo planet after "generation"
      showDemoPlanet();
      
    } catch (error) {
      console.error('Error generating planet:', error);
      alert('Error generating planet. Please try again.');
      this.hideLoading();
    }
  }
  
  resetToForm() {
    console.log('Resetting to form view');
    
    // Hide preview and status
    if (this.preview) this.preview.style.display = 'none';
    if (this.status) this.status.style.display = 'none';
    
    // Show form
    if (this.form) this.form.style.display = 'flex';
    
    // Remove any existing planet details
    const detailsDiv = this.preview?.querySelector('.planet-details');
    if (detailsDiv) {
      detailsDiv.remove();
    }
  }
  
  async simulateAIGeneration() {
    // Simulate realistic AI generation time
    const steps = [
      'Analyzing planet description...',
      'Generating surface texture...',
      'Creating bump map...',
      'Rendering atmosphere...',
      'Finalizing planet model...',
      'Complete!'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      this.updateLoadingStatus(steps[i], (i + 1) / steps.length);
    }
  }
  
  showLoading() {
    this.form.style.display = 'none';
    this.preview.style.display = 'none';
    this.status.style.display = 'block';
    this.updateLoadingStatus('Starting generation...', 0);
  }
  
  hideLoading() {
    this.status.style.display = 'none';
    this.form.style.display = 'flex';
  }
  
  updateLoadingStatus(message, progress) {
    const statusElement = document.getElementById('generation-status');
    if (statusElement) {
      statusElement.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 18px; margin-bottom: 20px; color: #87CEEB;">${message}</div>
          <div style="width: 100%; height: 20px; background: #333; border-radius: 10px; overflow: hidden; margin-bottom: 10px;">
            <div style="width: ${progress * 100}%; height: 100%; background: linear-gradient(90deg, #ff6b35, #ff8e53); transition: width 0.3s ease;"></div>
          </div>
          <div style="font-size: 14px; color: #888;">${Math.round(progress * 100)}% Complete</div>
        </div>
      `;
    }
  }
  
  addToSolarSystem() {
    alert('Planet generated! The demo planet is now displayed in the separate viewer.');
  }
  
  showPlanetPreview() {
    console.log('Showing planet preview after demo planet close');
    
    // Hide the form and status
    if (this.form) this.form.style.display = 'none';
    if (this.status) this.status.style.display = 'none';
    
    // Show the preview
    if (this.preview) {
      this.preview.style.display = 'block';
      
      // Update preview content with generated planet info
      const description = document.getElementById('planet-description').value;
      const planetType = document.getElementById('planet-type').value;
      const size = document.getElementById('planet-size').value;
      
      // Update preview text
      const previewTitle = this.preview.querySelector('h4');
      if (previewTitle) {
        previewTitle.textContent = 'Generated Planet Preview:';
      }
      
      // Add planet details
      const detailsDiv = this.preview.querySelector('.planet-details');
      if (!detailsDiv) {
        const newDetailsDiv = document.createElement('div');
        newDetailsDiv.className = 'planet-details';
        newDetailsDiv.style.cssText = `
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 10px;
          margin: 10px 0;
          color: #ffffff;
        `;
        newDetailsDiv.innerHTML = `
          <h5 style="color: #87CEEB; margin: 0 0 10px 0;">Planet Details:</h5>
          <p style="margin: 5px 0;"><strong>Description:</strong> ${description}</p>
          <p style="margin: 5px 0;"><strong>Type:</strong> ${planetType}</p>
          <p style="margin: 5px 0;"><strong>Size:</strong> ${size}/10</p>
          <p style="margin: 5px 0; color: #888; font-size: 12px;">✅ Planet successfully generated and displayed!</p>
        `;
        this.preview.appendChild(newDetailsDiv);
      }
      
      console.log('✅ Planet preview shown');
    }
  }
  
}

// ******  EXOSLEUTH AI DASHBOARD FUNCTIONALITY  ******
class ExoSleuthDashboard {
  constructor() {
    this.container = document.getElementById('exosleuth-dashboard');
    this.toggle = document.getElementById('data-toggle');
    this.content = document.getElementById('data-content');
    this.searchInput = document.getElementById('data-search');
    this.loadButton = document.getElementById('load-data');
    this.tableBody = document.getElementById('exosleuth-tbody');
    this.insightsPanel = document.getElementById('ai-insights-panel');
    this.insightsText = document.getElementById('insights-text');
    this.closeInsights = document.getElementById('close-insights');
    this.loadNasaModel = document.getElementById('load-nasa-model');
    this.simulateAiPlanet = document.getElementById('simulate-ai-planet');
    
    // Tab elements
    this.confirmedCandidateTab = document.getElementById('confirmed-candidate-tab');
    this.aiInferredTab = document.getElementById('ai-inferred-tab');
    this.confirmedCandidateContent = document.getElementById('confirmed-candidate-content');
    this.aiInferredContent = document.getElementById('ai-inferred-content');
    this.generateAiWorldsBtn = document.getElementById('generate-ai-worlds');
    this.aiWorldsTableBody = document.getElementById('ai-worlds-tbody');
    
    this.isCollapsed = false;
    this.exoplanetData = [];
    this.filteredData = [];
    this.selectedPlanet = null;
    this.aiInferredWorlds = [];
    
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
    
    // Tab switching
    this.confirmedCandidateTab.addEventListener('click', () => this.switchTab('confirmed'));
    this.aiInferredTab.addEventListener('click', () => this.switchTab('ai'));
    
    // Generate AI worlds button
    this.generateAiWorldsBtn.addEventListener('click', () => this.generateAIInferredWorlds());
    
    // AI Insights panel
    this.closeInsights.addEventListener('click', () => this.hideInsights());
    this.loadNasaModel.addEventListener('click', () => this.loadNasaModelAction());
    this.simulateAiPlanet.addEventListener('click', () => this.simulateAiPlanetAction());
  }
  
  // Tab switching functionality
  switchTab(tab) {
    if (tab === 'confirmed') {
      this.confirmedCandidateTab.classList.add('active');
      this.aiInferredTab.classList.remove('active');
      this.confirmedCandidateContent.classList.add('active');
      this.aiInferredContent.classList.remove('active');
    } else if (tab === 'ai') {
      this.confirmedCandidateTab.classList.remove('active');
      this.aiInferredTab.classList.add('active');
      this.confirmedCandidateContent.classList.remove('active');
      this.aiInferredContent.classList.add('active');
      
      // Auto-generate AI worlds when switching to AI tab
      if (this.aiInferredWorlds.length === 0) {
        this.generateAIInferredWorlds();
      }
    }
  }
  
  // Enhanced exoplanet data with multiple mission sources
  getExoplanetData() {
    return [
      {
        name: "Kepler-22b",
        catalog_id: "K00752.01",
        mission: "Kepler",
        disposition: "CONFIRMED",
        confidence: 0.98,
        period: 289.86,
        discovery_year: 2011,
        radius: 2.4,
        temperature: 262
      },
      {
        name: "TOI-715b",
        catalog_id: "TOI-715.01",
        mission: "TESS",
        disposition: "CANDIDATE",
        confidence: 0.75,
        period: 19.3,
        discovery_year: 2023,
        radius: 1.55,
        temperature: 234
      },
      {
        name: "Kepler-10b",
        catalog_id: "K00010.01",
        mission: "Kepler",
        disposition: "CONFIRMED",
        confidence: 0.99,
        period: 0.84,
        discovery_year: 2011,
        radius: 1.47,
        temperature: 2163
      },
      {
        name: "EPIC-201912552b",
        catalog_id: "EPIC-201912552.01",
        mission: "K2",
        disposition: "FALSE POSITIVE",
        confidence: 0.22,
        period: 45.20,
        discovery_year: 2018,
        radius: 0.8,
        temperature: 890
      },
      {
        name: "Kepler-452b",
        catalog_id: "K04252.01",
        mission: "Kepler",
        disposition: "CANDIDATE",
        confidence: 0.83,
        period: 385.01,
        discovery_year: 2015,
        radius: 1.63,
        temperature: 265
      },
      {
        name: "TOI-700d",
        catalog_id: "TOI-700.04",
        mission: "TESS",
        disposition: "CONFIRMED",
        confidence: 0.95,
        period: 37.4,
        discovery_year: 2020,
        radius: 1.19,
        temperature: 268
      }
    ];
  }
  
  // Mock AI classification simulation
  getMockAIClassification(planet) {
    const outcomes = ["CONFIRMED", "CANDIDATE", "FALSE POSITIVE"];
    const prediction = planet.disposition;
    const probs = {
      CONFIRMED: (planet.koi_score * 100).toFixed(1) + "%",
      CANDIDATE: (100 - planet.koi_score * 100 - Math.random() * 10).toFixed(1) + "%",
      "FALSE POSITIVE": (Math.random() * 10).toFixed(1) + "%"
    };
    return { prediction, probabilities: probs };
  }
  
  toggleDataTable() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
    this.toggle.textContent = this.isCollapsed ? '+' : '−';
  }
  
  loadExoplanetData() {
    try {
      this.loadButton.textContent = '⏳ Analyzing...';
      this.loadButton.disabled = true;
      
      console.log('Loading ExoSleuth AI classification data...');
      
      // Load hardcoded exoplanet data
      this.exoplanetData = this.getExoplanetData();
      console.log('Exoplanet data loaded:', this.exoplanetData.length, 'samples');
      
      this.filteredData = [...this.exoplanetData];
      
      // Display data immediately
      this.displayData();
      
      this.loadButton.textContent = '✅ Analyzed';
      setTimeout(() => {
        this.loadButton.textContent = 'Load Exoplanet Database';
        this.loadButton.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Error loading exoplanet data:', error);
      this.loadButton.textContent = 'Error';
      alert(`Failed to load exoplanet data: ${error.message}`);
      setTimeout(() => {
        this.loadButton.textContent = 'Load Exoplanet Database';
        this.loadButton.disabled = false;
      }, 2000);
    }
  }
  
  
  displayData() {
    this.tableBody.innerHTML = '';
    
    if (this.filteredData.length === 0) {
      this.tableBody.innerHTML = '<tr><td colspan="7" class="no-data">No exoplanet data found</td></tr>';
      return;
    }
    
    this.filteredData.forEach((planet, index) => {
      const row = document.createElement('tr');
      
      // Get AI classification
      const aiClassification = this.getMockAIClassification(planet);
      
      // Add CSS class for color coding
      const dispositionClass = planet.disposition.toLowerCase().replace(' ', '-');
      row.classList.add(dispositionClass);
      
      // Create confidence gauge
      const confidencePercent = (planet.confidence * 100).toFixed(0);
      const confidenceGauge = `
        <div class="confidence-gauge">
          <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
        </div>
      `;
      
      // Create AI classification display with emoji and percentage
      let aiDisplay = '';
      let aiClass = '';
      if (planet.disposition === 'CONFIRMED') {
        aiDisplay = `🟩 CONFIRMED (${confidencePercent}%)`;
        aiClass = 'confirmed';
      } else if (planet.disposition === 'CANDIDATE') {
        aiDisplay = `🟨 CANDIDATE (${confidencePercent}%)`;
        aiClass = 'candidate';
      } else {
        aiDisplay = `🟥 FALSE POSITIVE (${confidencePercent}%)`;
        aiClass = 'false-positive';
      }
      
      // Create action buttons
      let actions = '';
      if (planet.disposition === 'CONFIRMED' || planet.disposition === 'CANDIDATE') {
        actions = `<button class="visualization-btn nasa-model-btn" onclick="window.simulateSimilarWorld(${index})">Simulate Similar World</button>`;
      } else {
        actions = '<span class="discard-text">No simulation available</span>';
      }
      
      // Create tooltip with probabilities
      const tooltip = `AI Probabilities:\nCONFIRMED: ${aiClassification.probabilities.CONFIRMED}\nCANDIDATE: ${aiClassification.probabilities.CANDIDATE}\nFALSE POSITIVE: ${aiClassification.probabilities['FALSE POSITIVE']}`;
      
      row.innerHTML = `
        <td title="${planet.name}">${planet.name}</td>
        <td title="${planet.mission}">${planet.catalog_id}</td>
        <td title="Confidence: ${confidencePercent}%">${confidencePercent}%${confidenceGauge}</td>
        <td>${planet.period}</td>
        <td>${planet.disposition}</td>
        <td class="ai-classification ${aiClass}" title="${tooltip}">${aiDisplay}</td>
        <td>${actions}</td>
      `;
      
      // Add click handler for row selection
      row.addEventListener('click', (e) => {
        if (!e.target.classList.contains('visualization-btn')) {
          this.selectPlanet(index);
        }
      });
      
      this.tableBody.appendChild(row);
    });
  }
  
  filterData(searchTerm) {
    if (!searchTerm.trim()) {
      this.filteredData = [...this.exoplanetData];
    } else {
      this.filteredData = this.exoplanetData.filter(planet => {
        const name = planet.name.toLowerCase();
        const catalogId = planet.catalog_id.toLowerCase();
        const mission = planet.mission.toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || 
               catalogId.includes(searchTerm.toLowerCase()) ||
               mission.includes(searchTerm.toLowerCase());
      });
    }
    this.displayData();
  }
  
  // Select planet and show insights
  selectPlanet(index) {
    this.selectedPlanet = this.filteredData[index];
    this.showInsights(index);
  }
  
  // Show AI Insights panel
  showInsights(index) {
    const planet = this.filteredData[index];
    this.selectedPlanet = planet;
    
    // Update insights text based on disposition
    let insightsText = '';
    let showNasaBtn = false;
    let showSimulateBtn = false;
    
    if (planet.disposition === 'CONFIRMED') {
      insightsText = `This planet has been validated by NASA data. Click 'Load NASA Model' to view the official 3D texture.`;
      showNasaBtn = true;
    } else if (planet.disposition === 'CANDIDATE') {
      insightsText = `AI confidence is moderate. Click 'Simulate AI Planet' to visualize what it might look like based on similar discoveries.`;
      showSimulateBtn = true;
    } else {
      insightsText = `Signal likely caused by noise or binary star. Visualization not available.`;
    }
    
    this.insightsText.innerHTML = `
      <h5>${planet.name} (${planet.catalog_id})</h5>
      <p><strong>Mission:</strong> ${planet.mission}</p>
      <p><strong>Discovery Year:</strong> ${planet.discovery_year}</p>
      <p><strong>Radius:</strong> ${planet.radius} Earth radii</p>
      <p><strong>Temperature:</strong> ${planet.temperature}K</p>
      <p><strong>Period:</strong> ${planet.period} days</p>
      <hr>
      <p>${insightsText}</p>
    `;
    
    // Show/hide buttons
    this.loadNasaModel.style.display = showNasaBtn ? 'block' : 'none';
    this.simulateAiPlanet.style.display = showSimulateBtn ? 'block' : 'none';
    
    // Show panel
    this.insightsPanel.style.display = 'block';
  }
  
  // Hide AI Insights panel
  hideInsights() {
    this.insightsPanel.style.display = 'none';
    this.selectedPlanet = null;
  }
  
  // Load NASA Model action
  loadNasaModelAction() {
    if (!this.selectedPlanet) return;
    
    const planet = this.selectedPlanet;
    const description = `NASA validated exoplanet ${planet.name}: ${planet.disposition} with ${(planet.confidence * 100).toFixed(0)}% confidence, discovered in ${planet.discovery_year} by ${planet.mission} mission. Radius ${planet.radius} Earth radii, temperature ${planet.temperature}K, orbital period ${planet.period} days.`;
    
    // Fill the AI Planet Generator form
    this.fillPlanetGenerator(description, 'rocky', Math.round(planet.radius * 2));
    
    this.hideInsights();
  }
  
  // Simulate AI Planet action
  simulateAiPlanetAction() {
    if (!this.selectedPlanet) return;
    
    const planet = this.selectedPlanet;
    const description = `AI-simulated exoplanet ${planet.name}: ${planet.disposition} candidate with ${(planet.confidence * 100).toFixed(0)}% confidence. Based on ${planet.mission} data from ${planet.discovery_year}. Estimated radius ${planet.radius} Earth radii, temperature ${planet.temperature}K, period ${planet.period} days.`;
    
    // Fill the AI Planet Generator form
    this.fillPlanetGenerator(description, 'gas-giant', Math.round(planet.radius * 3));
    
    this.hideInsights();
  }
  
  // Fill planet generator form
  fillPlanetGenerator(description, type, size) {
    const descriptionField = document.getElementById('planet-description');
    const typeField = document.getElementById('planet-type');
    const sizeField = document.getElementById('planet-size');
    const sizeValue = document.getElementById('size-value');
    
    console.log('Filling planet generator:', { descriptionField, typeField, sizeField, sizeValue });
    
    if (descriptionField) {
      descriptionField.value = description;
      descriptionField.focus();
      console.log('Description field filled with:', description);
    } else {
      console.error('Description field not found!');
    }
    
    if (typeField) {
      typeField.value = type;
      console.log('Type field set to:', type);
    }
    
    if (sizeField && sizeValue) {
      const finalSize = Math.min(10, Math.max(1, size));
      sizeField.value = finalSize;
      sizeValue.textContent = finalSize;
      console.log('Size set to:', finalSize);
    }
  }
  
  // Reset AI Hypothesis Simulator to normal state
  resetHypothesisSimulator() {
    const descriptionField = document.getElementById('planet-description');
    const typeField = document.getElementById('planet-type');
    const sizeField = document.getElementById('planet-size');
    const sizeValue = document.getElementById('size-value');
    
    if (descriptionField) {
      descriptionField.value = '';
      descriptionField.placeholder = 'Describe your hypothesis... (e.g., \'If a twin of Kepler-22b formed slightly closer to its star...\')';
    }
    
    if (typeField) {
      typeField.value = 'rocky';
    }
    
    if (sizeField && sizeValue) {
      sizeField.value = 5;
      sizeValue.textContent = '5';
    }
    
    // Reset any visual highlights
    if (descriptionField) {
      descriptionField.style.border = '3px solid #00ff00';
      descriptionField.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.8)';
    }
  }
  
  // Generate AI-Inferred Worlds
  generateAIInferredWorlds() {
    try {
      this.generateAiWorldsBtn.textContent = '⏳ Generating...';
      this.generateAiWorldsBtn.disabled = true;
      
      console.log('Generating AI-inferred worlds...');
      
      // Generate 5 AI-inferred planets
      this.aiInferredWorlds = this.createAIInferredWorlds();
      console.log('AI worlds generated:', this.aiInferredWorlds.length, 'planets');
      
      // Display the worlds
      this.displayAIInferredWorlds();
      
      // Generate 3D planets in the scene
      this.generate3DAIWorlds();
      
      this.generateAiWorldsBtn.textContent = '✅ Generated';
      setTimeout(() => {
        this.generateAiWorldsBtn.textContent = 'Generate AI-Inferred Worlds';
        this.generateAiWorldsBtn.disabled = false;
      }, 2000);
      
    } catch (error) {
      console.error('Error generating AI worlds:', error);
      this.generateAiWorldsBtn.textContent = 'Error';
      alert(`Failed to generate AI worlds: ${error.message}`);
      setTimeout(() => {
        this.generateAiWorldsBtn.textContent = 'Generate AI-Inferred Worlds';
        this.generateAiWorldsBtn.disabled = false;
      }, 2000);
    }
  }
  
  // Create AI-inferred worlds data
  createAIInferredWorlds() {
    const planetTypes = ['Rocky', 'Gas Giant', 'Ice World', 'Ocean World'];
    const sourcePatterns = ['Similar to Kepler-22b', 'Based on TOI-715 pattern', 'Kepler-10b variant', 'TOI-700d family', 'Kepler-452b evolution'];
    const worlds = [];
    
    for (let i = 0; i < 5; i++) {
      const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
      const confidence = 0.7 + Math.random() * 0.25; // 0.7-0.95
      const period = 1 + Math.random() * 500; // 1-500 days
      const radius = 0.5 + Math.random() * 4; // 0.5-4.5 Earth radii
      const sourcePattern = sourcePatterns[i];
      
      // Generate realistic names based on source patterns
      let name = '';
      if (sourcePattern.includes('Kepler-22b')) {
        name = 'Kepler-22c (Predicted)';
      } else if (sourcePattern.includes('TOI-715')) {
        name = 'TOI-715-b2';
      } else if (sourcePattern.includes('Kepler-10b')) {
        name = 'Kepler-10c (Predicted)';
      } else if (sourcePattern.includes('TOI-700d')) {
        name = 'TOI-700e';
      } else {
        name = 'ExoSleuth Sim-0' + (i + 1);
      }
      
      const world = {
        name: name,
        type: type,
        confidence: confidence,
        period: period,
        radius: radius,
        sourcePattern: sourcePattern,
        description: this.generateAIDescription(type, confidence, period, radius)
      };
      
      worlds.push(world);
    }
    
    return worlds;
  }
  
  // Generate AI description for inferred world
  generateAIDescription(type, confidence, period, radius) {
    const confidenceText = confidence > 0.9 ? 'high' : confidence > 0.8 ? 'moderate' : 'low';
    const periodText = period < 10 ? 'ultra-short' : period < 50 ? 'short' : period < 200 ? 'moderate' : 'long';
    const radiusText = radius < 1 ? 'small' : radius < 2 ? 'Earth-sized' : radius < 4 ? 'large' : 'giant';
    
    // Create more varied and detailed descriptions
    const rockyDescriptions = [
      `Rocky terrestrial world with ${confidenceText} habitability potential. ${periodText} orbital period suggests ${period < 50 ? 'close-in' : 'distant'} formation. Surface likely features ${radius < 1.5 ? 'dense, metallic core' : 'extensive mountain ranges'} with ${period < 100 ? 'thin, nitrogen-rich' : 'thick, carbon dioxide'} atmosphere.`,
      `Earth-analog candidate with ${confidenceText} confidence. ${periodText} period indicates ${period < 30 ? 'tidal locking possible' : 'stable rotation'}. Geological activity expected with ${radius < 1.2 ? 'volcanic hotspots' : 'tectonic plate movement'}. Atmospheric composition likely ${period < 50 ? 'oxygen-rich' : 'methane-dominated'}.`,
      `Terrestrial exoplanet showing ${confidenceText} biosignature potential. ${periodText} orbital dynamics suggest ${period < 20 ? 'extreme temperature variations' : 'moderate climate zones'}. Surface composition indicates ${radius < 1.3 ? 'iron-rich mantle' : 'silicate-dominated crust'} with possible ${period < 100 ? 'liquid water reservoirs' : 'ice cap formations'}.`
    ];
    
    const gasGiantDescriptions = [
      `Massive gas giant with ${confidenceText} atmospheric complexity. ${periodText} period creates ${period < 50 ? 'intense tidal heating' : 'stable atmospheric circulation'}. ${radiusText} size suggests ${radius > 3 ? 'brown dwarf transition zone' : 'Jupiter-like structure'} with ${period < 100 ? 'fast-rotating bands' : 'slow atmospheric mixing'}.`,
      `Jovian-class planet exhibiting ${confidenceText} weather system diversity. ${periodText} orbital mechanics indicate ${period < 30 ? 'hot Jupiter characteristics' : 'cold gas giant formation'}. Atmospheric layers show ${radius > 2.5 ? 'metallic hydrogen core' : 'molecular hydrogen envelope'} with ${period < 200 ? 'equatorial storm systems' : 'polar vortex formations'}.`,
      `Gas giant with ${confidenceText} atmospheric modeling confidence. ${periodText} period suggests ${period < 40 ? 'inflated atmosphere' : 'compact structure'}. Internal heat sources likely ${radius > 3 ? 'gravitational compression' : 'radioactive decay'} creating ${period < 150 ? 'convective zones' : 'stratified layers'} in atmospheric circulation.`
    ];
    
    const iceWorldDescriptions = [
      `Frozen world with ${confidenceText} subsurface ocean potential. ${periodText} period indicates ${period > 200 ? 'outer system formation' : 'migrated inward'}. Surface features suggest ${radius < 1.5 ? 'ice-covered rocky core' : 'thick ice shell'} with possible ${period < 300 ? 'cryovolcanic activity' : 'geological dormancy'}.`,
      `Ice-dominated exoplanet showing ${confidenceText} habitability indicators. ${periodText} orbital dynamics create ${period > 150 ? 'extreme seasonal variations' : 'stable temperature zones'}. Subsurface composition likely ${radius < 1.2 ? 'ammonia-water mixture' : 'methane clathrates'} with ${period < 400 ? 'tidal heating effects' : 'minimal internal activity'}.`,
      `Cryogenic world with ${confidenceText} geological activity potential. ${periodText} period suggests ${period > 250 ? 'Kuiper Belt origin' : 'inward migration'}. Surface structure indicates ${radius < 1.3 ? 'thin ice crust' : 'thick frozen mantle'} overlying ${period < 350 ? 'liquid water ocean' : 'solid core'} with possible ${period < 500 ? 'hydrothermal vents' : 'geological stability'}.`
    ];
    
    const oceanWorldDescriptions = [
      `Water-rich world with ${confidenceText} global ocean coverage. ${periodText} period indicates ${period < 100 ? 'tidal heating effects' : 'stable hydrosphere'}. Ocean composition likely ${radius < 1.5 ? 'salty, Earth-like' : 'ammonia-rich, exotic'} with ${period < 200 ? 'active circulation' : 'stratified layers'}.`,
      `Aquatic exoplanet showing ${confidenceText} biosignature potential. ${periodText} orbital mechanics create ${period < 50 ? 'extreme tidal forces' : 'moderate gravitational effects'}. Hydrosphere structure suggests ${radius < 1.3 ? 'shallow seas' : 'deep ocean basins'} with possible ${period < 150 ? 'surface wave activity' : 'subsurface currents'}.`,
      `Ocean-dominated world with ${confidenceText} habitability indicators. ${periodText} period indicates ${period < 80 ? 'close-in formation' : 'distant migration'}. Water composition likely ${radius < 1.4 ? 'H2O-dominated' : 'exotic solvent mixture'} with ${period < 300 ? 'active geological cycling' : 'stable hydrosphere'} and potential ${period < 250 ? 'atmospheric water vapor' : 'ice cap formation'}.`
    ];
    
    let description = '';
    const descriptions = {
      'Rocky': rockyDescriptions,
      'Gas Giant': gasGiantDescriptions,
      'Ice World': iceWorldDescriptions,
      'Ocean World': oceanWorldDescriptions
    };
    
    const typeDescriptions = descriptions[type] || rockyDescriptions;
    const randomIndex = Math.floor(Math.random() * typeDescriptions.length);
    description = typeDescriptions[randomIndex];
    
    return description;
  }
  
  // Display AI-inferred worlds in table
  displayAIInferredWorlds() {
    this.aiWorldsTableBody.innerHTML = '';
    
    this.aiInferredWorlds.forEach((world, index) => {
      const row = document.createElement('tr');
      
      const confidencePercent = (world.confidence * 100).toFixed(0);
      const confidenceGauge = `
        <div class="confidence-gauge">
          <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
        </div>
      `;
      
      row.innerHTML = `
        <td title="${world.name}">${world.name}</td>
        <td><span class="predicted-type ${world.type.toLowerCase().replace(' ', '-')}">${world.type}</span></td>
        <td title="Confidence: ${confidencePercent}%">${confidencePercent}%${confidenceGauge}</td>
        <td title="${world.sourcePattern}">${world.sourcePattern}</td>
        <td class="ai-description" title="${world.description}">${world.description}</td>
        <td><button class="visualization-btn nasa-model-btn" onclick="window.copyToHypothesisSimulator(${index})">Copy to Hypothesis Simulator</button></td>
      `;
      
      this.aiWorldsTableBody.appendChild(row);
    });
  }
  
  // Generate 3D AI worlds in the scene
  generate3DAIWorlds() {
    // Clear existing AI worlds
    this.clearAIWorlds();
    
    // Generate new 3D planets
    this.aiInferredWorlds.forEach((world, index) => {
      this.create3DAIWorld(world, index);
    });
  }
  
  // Clear existing AI worlds from scene
  clearAIWorlds() {
    // This would clear any existing AI-generated planets from the 3D scene
    // For now, we'll just log it
    console.log('Clearing existing AI worlds from 3D scene');
  }
  
  // Create individual 3D AI world
  create3DAIWorld(world, index) {
    // This would create a 3D planet with blue glow to indicate AI prediction
    // For now, we'll just log the world data
    console.log(`Creating 3D AI world: ${world.name}`, world);
    
    // In a full implementation, this would:
    // 1. Create a sphere geometry
    // 2. Apply appropriate material based on type
    // 3. Add blue glow effect
    // 4. Position in 3D space
    // 5. Add to scene
  }
  
  // Simulate similar world based on existing planet
  simulateSimilarWorld(index) {
    const planet = this.filteredData[index];
    if (!planet) return;
    
    console.log(`Simulating similar world for ${planet.name}`);
    
    // Create a similar but slightly different world
    const similarWorld = {
      name: `${planet.name} Twin (Predicted)`,
      type: this.getSimilarPlanetType(planet),
      confidence: 0.75 + Math.random() * 0.2, // 0.75-0.95
      period: planet.period * (0.8 + Math.random() * 0.4), // ±20% variation
      radius: planet.radius * (0.9 + Math.random() * 0.2), // ±10% variation
      sourcePattern: `Similar to ${planet.name}`,
      description: `AI inferred a sister planet to ${planet.name} with similar orbital characteristics but slight variations in size and period.`
    };
    
    // Add to AI-inferred worlds
    this.aiInferredWorlds.push(similarWorld);
    
    // Switch to AI tab and refresh display
    this.switchTab('ai');
    this.displayAIInferredWorlds();
  }
  
  // Get similar planet type based on existing planet
  getSimilarPlanetType(planet) {
    const types = ['Rocky', 'Gas Giant', 'Ice World', 'Ocean World'];
    if (planet.radius < 1.5) return 'Rocky';
    if (planet.radius > 3) return 'Gas Giant';
    if (planet.period > 200) return 'Ice World';
    return types[Math.floor(Math.random() * types.length)];
  }
  
  // Copy AI world description to Hypothesis Simulator
  copyToHypothesisSimulator(index) {
    const world = this.aiInferredWorlds[index];
    if (!world) return;
    
    console.log(`Copying ${world.name} to Hypothesis Simulator`);
    
    // Create detailed hypothesis context
    const hypothesisContext = `If a planet similar to ${world.sourcePattern} formed with slightly different orbital parameters, it might exhibit characteristics like ${world.name}. ${world.description} This hypothesis is based on ${world.sourcePattern} data with ${(world.confidence * 100).toFixed(0)}% AI confidence.`;
    
    // Ensure the planet generator panel is visible and expanded first
    const planetGenerator = document.getElementById('planet-generator');
    const generatorContent = document.getElementById('generator-content');
    const generatorToggle = document.getElementById('generator-toggle');
    
    if (planetGenerator && generatorContent && generatorToggle) {
      // Make sure the panel is not collapsed
      planetGenerator.classList.remove('collapsed');
      generatorContent.style.display = 'block';
      generatorToggle.textContent = '−';
    }
    
    // Wait a moment for the panel to expand, then fill the form
    setTimeout(() => {
      // Fill the AI Hypothesis Simulator
      this.fillPlanetGenerator(hypothesisContext, world.type.toLowerCase().replace(' ', '-'), Math.round(world.radius * 2));
      
      // Scroll to the planet generator panel
      if (planetGenerator) {
        planetGenerator.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Highlight the textarea briefly
      const textarea = document.getElementById('planet-description');
      if (textarea) {
        textarea.focus();
        textarea.style.border = '3px solid #ff0000';
        textarea.style.boxShadow = '0 0 25px rgba(255, 0, 0, 1)';
        
        // Reset highlight after 3 seconds
        setTimeout(() => {
          textarea.style.border = '3px solid #00ff00';
          textarea.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.8)';
        }, 3000);
      }
    }, 100);
    
    // Copy to clipboard silently
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hypothesisContext).catch(() => {
        // Silent fail
      });
    }
  }
  
  copyPlanetData(index) {
    console.log('Copy KOI data called with index:', index);
    const planet = this.filteredData[index];
    if (!planet) {
      console.log('No KOI planet found at index:', index);
      return;
    }
    
    // Create a formatted description for planet generation
    const aiClassification = this.getMockAIClassification(planet);
    const description = `${planet.name} (${planet.koi_id}): ${planet.disposition} with ${(planet.koi_score * 100).toFixed(0)}% confidence, Period ${planet.koi_period} days, AI Classification: ${aiClassification.prediction}`;
    
    console.log('Copying KOI description:', description);
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(description).then(() => {
        console.log('Successfully copied to clipboard');
        alert('✅ Copied KOI data: ' + description);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        prompt('Copy this text:', description);
      });
    } else {
      console.log('Clipboard API not supported, using fallback');
      prompt('Copy this text:', description);
    }
  }
  
  generateFromPlanet(index) {
    console.log('Generate from KOI planet called with index:', index);
    const planet = this.filteredData[index];
    if (!planet) {
      console.log('No KOI planet found at index:', index);
      return;
    }
    
    // Get AI classification
    const aiClassification = this.getMockAIClassification(planet);
    
    // Create detailed description based on KOI data
    let description = `${planet.name} (${planet.koi_id}) - ${planet.disposition} exoplanet`;
    
    // Add confidence level
    const confidence = (planet.koi_score * 100).toFixed(0);
    description += ` with ${confidence}% AI confidence`;
    
    // Add period information
    if (planet.koi_period < 1) {
      description += `, ultra-short period of ${planet.koi_period} days`;
    } else if (planet.koi_period < 10) {
      description += `, short period of ${planet.koi_period} days`;
    } else if (planet.koi_period < 100) {
      description += `, moderate period of ${planet.koi_period} days`;
    } else {
      description += `, long period of ${planet.koi_period} days`;
    }
    
    // Add AI classification context
    if (planet.disposition === 'CONFIRMED') {
      description += `, confirmed by AI as a real exoplanet`;
    } else if (planet.disposition === 'CANDIDATE') {
      description += `, classified as a strong candidate by AI`;
    } else {
      description += `, identified as a false positive by AI`;
    }
    
    console.log('Generated KOI description:', description);
    
    // Fill the planet generator form
    const descriptionField = document.getElementById('planet-description');
    const typeField = document.getElementById('planet-type');
    const sizeField = document.getElementById('planet-size');
    const sizeValue = document.getElementById('size-value');
    
    if (descriptionField && typeField && sizeField && sizeValue) {
      descriptionField.value = description;
      
      // Determine planet type based on KOI score and period
      if (planet.koi_score > 0.8) {
        typeField.value = planet.koi_period < 10 ? 'volcanic' : 'rocky';
      } else if (planet.koi_score > 0.5) {
        typeField.value = 'gas-giant';
      } else {
        typeField.value = 'ice-world';
      }
      
      // Set size based on KOI score
      const size = Math.min(10, Math.max(1, Math.round(planet.koi_score * 8 + 2)));
      sizeField.value = size;
      sizeValue.textContent = size;
      
      console.log('KOI form filled successfully');
      alert(`KOI data loaded! Generated description: "${description}"`);
    } else {
      console.error('Form fields not found');
      alert('Planet generator form not available. Please try again.');
    }
  }
}

// Initialize both planet generator and ExoSleuth AI dashboard when the page loads
let planetGenerator, exosleuthDashboard;

// Simple direct initialization - no complex timing
function initializeApp() {
  console.log('=== INITIALIZING APPLICATION ===');
  
  // Check if all required elements exist
  const planetGeneratorEl = document.getElementById('planet-generator');
  const exosleuthDashboardEl = document.getElementById('exosleuth-dashboard');
  const textarea = document.getElementById('planet-description');
  const generateBtn = document.getElementById('generate-planet');
  
  console.log('Required elements found:', {
    planetGeneratorEl: !!planetGeneratorEl,
    exosleuthDashboardEl: !!exosleuthDashboardEl,
    textarea: !!textarea,
    generateBtn: !!generateBtn
  });
  
  // Initialize Planet Generator
  if (planetGeneratorEl) {
    try {
      planetGenerator = new PlanetGenerator();
      console.log('✅ Planet Generator initialized successfully');
    } catch (error) {
      console.error('❌ Planet Generator initialization failed:', error);
    }
  } else {
    console.error('❌ Planet Generator container not found');
  }
  
  // Initialize ExoSleuth AI Dashboard
  if (exosleuthDashboardEl) {
    try {
      exosleuthDashboard = new ExoSleuthDashboard();
      console.log('✅ ExoSleuth AI Dashboard initialized successfully');
      
      // Reset hypothesis simulator to normal state
      if (exosleuthDashboard.resetHypothesisSimulator) {
        exosleuthDashboard.resetHypothesisSimulator();
      }
    } catch (error) {
      console.error('❌ ExoSleuth AI Dashboard initialization failed:', error);
    }
  } else {
    console.error('❌ ExoSleuth AI Dashboard container not found');
  }
  
  // Direct form testing
  if (textarea) {
    console.log('✅ Textarea found, adding direct event listeners');
    textarea.addEventListener('input', (e) => {
      console.log('📝 Textarea input:', e.target.value);
    });
    textarea.addEventListener('focus', () => {
      console.log('🎯 Textarea focused');
    });
    textarea.addEventListener('keydown', (e) => {
      console.log('⌨️ Key pressed:', e.key);
    });
  } else {
    console.error('❌ Textarea not found');
  }
  
  // Force enable the textarea
  if (textarea) {
    textarea.disabled = false;
    textarea.readOnly = false;
    textarea.style.pointerEvents = 'auto';
    textarea.style.userSelect = 'text';
    textarea.style.zIndex = '1000';
    textarea.style.position = 'relative';
    textarea.tabIndex = 0;
    
    console.log('🔧 Forced textarea properties:', {
      disabled: textarea.disabled,
      readOnly: textarea.readOnly,
      pointerEvents: textarea.style.pointerEvents,
      userSelect: textarea.style.userSelect,
      zIndex: textarea.style.zIndex
    });
  }
  
  console.log('=== INITIALIZATION COMPLETE ===');
}

// Multiple initialization attempts
document.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('load', initializeApp);

// Also try after a delay
setTimeout(initializeApp, 1000);
setTimeout(initializeApp, 2000);

// Force textarea to be selectable and work
window.makeTextareaWork = function() {
  console.log('=== MAKING TEXTAREA WORK ===');
  
  const textarea = document.getElementById('planet-description');
  if (!textarea) {
    console.error('Textarea not found');
    return;
  }
  
  // Remove ALL possible blocking attributes
  textarea.removeAttribute('disabled');
  textarea.removeAttribute('readonly');
  textarea.removeAttribute('readOnly');
  textarea.removeAttribute('tabindex');
  
  // Force enable all properties
  textarea.disabled = false;
  textarea.readOnly = false;
  textarea.tabIndex = 0;
  
  // Force styling
  textarea.style.pointerEvents = 'auto';
  textarea.style.userSelect = 'text';
  textarea.style.cursor = 'text';
  textarea.style.zIndex = '999999';
  textarea.style.position = 'relative';
  textarea.style.display = 'block';
  textarea.style.visibility = 'visible';
  textarea.style.opacity = '1';
  
  // Remove any event listeners that might block
  textarea.onmousedown = null;
  textarea.onmouseup = null;
  textarea.onclick = null;
  textarea.onkeydown = null;
  textarea.onkeyup = null;
  
  // Add new event listeners
  textarea.addEventListener('mousedown', function(e) {
    e.stopPropagation();
    console.log('MOUSE DOWN on textarea');
    this.focus();
  });
  
  textarea.addEventListener('click', function(e) {
    e.stopPropagation();
    console.log('CLICKED textarea');
    this.focus();
    this.select();
  });
  
  textarea.addEventListener('keydown', function(e) {
    e.stopPropagation();
    console.log('KEY DOWN in textarea:', e.key);
  });
  
  textarea.addEventListener('input', function(e) {
    console.log('INPUT in textarea:', e.target.value);
  });
  
  // Force focus and select
  setTimeout(() => {
    textarea.focus();
    textarea.click();
    textarea.select();
    console.log('✅ Textarea forced to focus and select');
  }, 100);
  
  console.log('✅ Textarea should be selectable now!');
};

// Global utility functions
window.forceInit = function() {
  console.log('=== FORCING INITIALIZATION ===');
  initializeApp();
};

window.fixTextarea = function() {
  console.log('=== FIXING TEXTAREA ===');
  let textarea = document.getElementById('planet-description');
  
  if (textarea) {
    // Store the current value
    const currentValue = textarea.value;
    
    // Create a completely new textarea
    const newTextarea = document.createElement('textarea');
    newTextarea.id = 'planet-description';
    newTextarea.placeholder = 'Describe your planet... (e.g., \'volcanic world with glowing lava rivers and dark craters\')';
    newTextarea.value = currentValue;
    newTextarea.className = textarea.className;
    
    // Set all the necessary attributes
    newTextarea.style.cssText = `
      width: 100%;
      min-height: 80px;
      padding: 10px;
      border: 2px solid #FFD700;
      border-radius: 8px;
      background: #2a2a2a;
      color: #ffffff;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      z-index: 99999;
      position: relative;
      pointer-events: auto;
      user-select: text;
      outline: none;
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    `;
    
    // Replace the old textarea with the new one
    textarea.parentNode.replaceChild(newTextarea, textarea);
    textarea = newTextarea;
    
    // Add event listeners
    textarea.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Textarea clicked');
    });
    
    textarea.addEventListener('keydown', (e) => {
      e.stopPropagation();
      console.log('Key pressed in textarea:', e.key);
    });
    
    textarea.addEventListener('input', (e) => {
      console.log('Textarea input:', e.target.value);
    });
    
    textarea.addEventListener('focus', () => {
      console.log('Textarea focused');
    });
    
    // Focus and select
    setTimeout(() => {
      textarea.focus();
      textarea.select();
      console.log('✅ Textarea replaced and focused');
    }, 100);
    
    console.log('✅ Textarea completely replaced');
  } else {
    console.error('❌ Textarea not found');
  }
};


// Global functions for copy and generate buttons
window.copyPlanetData = function(index) {
  console.log('Global copyPlanetData called with index:', index);
  if (exosleuthDashboard) {
    exosleuthDashboard.copyPlanetData(index);
  } else {
    console.error('ExoSleuth AI Dashboard not initialized');
  }
};

window.generateFromPlanet = function(index) {
  console.log('Global generateFromPlanet called with index:', index);
  if (exosleuthDashboard) {
    exosleuthDashboard.generateFromPlanet(index);
  } else {
    console.error('ExoSleuth AI Dashboard not initialized');
  }
};

window.copyToHypothesisSimulator = function(index) {
  console.log('Global copyToHypothesisSimulator called with index:', index);
  if (exosleuthDashboard) {
    exosleuthDashboard.copyToHypothesisSimulator(index);
  } else {
    console.error('ExoSleuth AI Dashboard not initialized');
  }
};

window.simulateSimilarWorld = function(index) {
  console.log('Global simulateSimilarWorld called with index:', index);
  if (exosleuthDashboard) {
    exosleuthDashboard.simulateSimilarWorld(index);
  } else {
    console.error('ExoSleuth AI Dashboard not initialized');
  }
};
