import * as THREE from "three";
import settings from "./settings";
import Cube from "./classes/cube";

// state
let width = 0
let height = 0
let intersects = []
let hovered = {}

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
renderer.setPixelRatio(Math.min(Math.max(1, window.devicePixelRatio), 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.outputEncoding = THREE.sRGBEncoding
document.getElementById('root').appendChild(renderer.domElement)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const ambientLight = new THREE.AmbientLight()
const pointLight = new THREE.PointLight()
pointLight.position.set(10, 10, 10)
scene.add(ambientLight)
scene.add(pointLight)

// Generate a wireframe of smaller cubes
const edgeCubes = 5; // Number of cubes per edge
const spacing = 0.5; // Spacing between the cubes
const letters = ["A", "B", "C", "D"]; // Letters for each face

// Calculate the positions for the wireframe
const offsets = [-1, 1]; // To position cubes on opposite ends of the larger cube
for (let x of offsets) {
  for (let y of offsets) {
    for (let i = 0; i < edgeCubes; i++) {
      const position = -1 + i * spacing; // Incremental positions for the edge cubes

      // Add cubes along the X edges
      const cubeX = new Cube(letters);
      cubeX.position.set(position, y, x);
      scene.add(cubeX);

      // Add cubes along the Y edges
      const cubeY = new Cube(letters);
      cubeY.position.set(x, position, y);
      scene.add(cubeY);

      // Add cubes along the Z edges
      const cubeZ = new Cube(letters);
      cubeZ.position.set(y, x, position);
      scene.add(cubeZ);
    }
  }
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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
window.addEventListener('pointermove', (e) => {
  mouse.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1)
  raycaster.setFromCamera(mouse, camera)
  intersects = raycaster.intersectObjects(scene.children, true)

  // If a previously hovered item is not among the hits we must call onPointerOut
  Object.keys(hovered).forEach((key) => {
    const hit = intersects.find((hit) => hit.object.uuid === key)
    if (hit === undefined) {
      const hoveredItem = hovered[key]
      if (hoveredItem.object.onPointerOver) hoveredItem.object.onPointerOut(hoveredItem)
      delete hovered[key]
    }
  })

  intersects.forEach((hit) => {
    // If a hit has not been flagged as hovered we must call onPointerOver
    if (!hovered[hit.object.uuid]) {
      hovered[hit.object.uuid] = hit
      if (hit.object.onPointerOver) hit.object.onPointerOver(hit)
    }
    // Call onPointerMove
    if (hit.object.onPointerMove) hit.object.onPointerMove(hit)
  })
})

window.addEventListener('click', (e) => {
  intersects.forEach((hit) => {
    // Call onClick
    if (hit.object.onClick) hit.object.onClick(hit)
  })
})

// Animation loop
function animate(t) {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

