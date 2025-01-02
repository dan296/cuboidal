import * as THREE from "three";
import settings from "./settings";
import Cube from "./classes/cube";

// state
let width = 0;
let height = 0;
let intersects = [];
let hovered = {};

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);
// Position the camera
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(Math.max(1, window.devicePixelRatio), 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById("root").appendChild(renderer.domElement);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(10, 10, 10);
scene.add(ambientLight);
scene.add(pointLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 10.0);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Generate a wireframe of smaller cubes
const edgeCubes = 5; // Number of cubes per edge
const spacing = 0.5; // Spacing between the cubes
const letters = ["A", "B", "C", "D"]; // Letters for each face

// Calculate the positions for the wireframe
const offsets = [-1, 1]; // To position cubes on opposite ends of the larger cube
const positions = new Set(); // Use Set to store unique positions

// Helper function to create a unique string for the position
function positionKey(x, y, z) {
  return `${x},${y},${z}`; // Create a string key like "1,-1,1"
}
function addCube(x, y, z) {
  const key = positionKey(x, y, z);
  if (positions.has(key)) return; // Skip if the position already exists
  const cube = new Cube(letters);
  cube.position.set(x, y, z);
  scene.add(cube);
  positions.add(key); // Store the unique key in the Set
}

for (let x of offsets) {
  for (let y of offsets) {
    for (let i = 0; i < edgeCubes; i++) {
      const position = -1 + i * spacing; // Incremental positions for the edge cubes
      
      // Add cubes along the X edges
      addCube(position, y, x);
      addCube(x, position, y);
      addCube(y, x, position);

    }
  }
}

console.log(positions);

// responsive
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  const target = new THREE.Vector3(0, 0, 0);
  const distance = camera.position.distanceTo(target);
  const fov = (camera.fov * Math.PI) / 180;
  const viewportHeight = 2 * Math.tan(fov / 2) * distance;
  const viewportWidth = viewportHeight * (width / height);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  scene.traverse((obj) => {
    if (obj.onResize)
      obj.onResize(viewportWidth, viewportHeight, camera.aspect);
  });
}

window.addEventListener("resize", resize);
resize();

// Variables for drag rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

const toRadians = (angle) => angle * (Math.PI / 180);

// Add mouse event listeners
renderer.domElement.addEventListener("mousedown", (event) => {
  isDragging = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };

    // Rotate the entire scene based on mouse movement
    scene.rotation.y += toRadians(deltaMove.x) * 0.5;
    scene.rotation.x += toRadians(deltaMove.y) * 0.5;

    previousMousePosition = { x: event.clientX, y: event.clientY };
  }
});

renderer.domElement.addEventListener("mouseup", () => {
  isDragging = false;
});

renderer.domElement.addEventListener("mouseleave", () => {
  isDragging = false;
});

// events
window.addEventListener("pointermove", (e) => {
  mouse.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObjects(scene.children, true);
  const hit = intersects[0];
  // If a previously hovered item is not among the hits we must call onPointerOut
  Object.keys(hovered).forEach((key) => {
    const thit = intersects.find((rhit) => rhit.object.uuid === key);
    if (thit !== hit || hit === undefined) {
      const hoveredItem = hovered[key];
      if (hoveredItem.object.onPointerOver)
        hoveredItem.object.onPointerOut(hoveredItem);
      delete hovered[key];
    }
  });

  if (hit && hit.object) {
    // If a hit has not been flagged as hovered we must call onPointerOver
    if (!hovered[hit.object.uuid]) {
      hovered[hit.object.uuid] = hit;
      if (hit.object.onPointerOver) hit.object.onPointerOver(hit);
    }
    // Call onPointerMove
    if (hit.object.onPointerMove) hit.object.onPointerMove(hit);
  }
});

window.addEventListener("click", (e) => {
  const hit = intersects[0];
  if (hit && hit.object && typeof hit.object.onClick === "function") {
    hit.object.onClick(hit);
  }
  console.log(scene.children);
});

// Animation loop
function animate(t) {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
