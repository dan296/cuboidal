import * as THREE from "three";
import settings from "./settings";
import Cube from "./classes/cube";
import getWordsForCube from "./words";
import { DragControls } from "three/examples/jsm/Addons.js";

// Add event listener to close the #instructions div
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("instructions").style.display = "none";
});

// Add event listener to close the #instructions div
document.querySelector("#instructions-open").addEventListener("click", () => {
  document.getElementById("instructions").style.display = "block";
});

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
const ambientLight = new THREE.AmbientLight(0xffffff, 10);
const pointLight = new THREE.PointLight(0xffffff, 10);
pointLight.position.set(10, 10, 10);
pointLight.castShadow = false; // Ensure no shadows are cast
scene.add(ambientLight);
scene.add(pointLight);
// Rotate the scene for an isometric view
scene.rotation.x = Math.PI / 4; // 45 degrees
scene.rotation.y =  -Math.PI / 4;//Math.atan(Math.sqrt(2)); // Approximately 35.264 degrees
// Generate a wireframe of smaller cubes
const edgeCubes = 5; // Number of cubes per edge
const spacing = 0.5; // Spacing between the cubes

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
  let letters = getLettersForCube(x, y, z);
  
  //letters = [`x:${x}`, `y:${y}`, `z:${z}`];
  letters = [
    letters["right"] ? letters["right"] : "",
    letters["left"] ? letters["left"] : "",
    letters["top"] ? letters["top"] : "",
    letters["bottom"] ? letters["bottom"] : "",
    letters["front"] ? letters["front"] : "",
    letters["back"] ? letters["back"] : ""
  ];

  letters = letters.map(l => l.toUpperCase());

  // right, left, top, bottom, front, back
  const cube = new Cube(x, y, z, letters);
  scene.add(cube);
  positions.add(key); // Store the unique key in the Set
}

const words = getWordsForCube();

function getLettersForCube(x, y, z) {
  // check position of cube
  // If cube is on vertex, return 3 letters -> should either be the end or beginning of 3 five letter words
  // Otherwise return 4 letters -> should be the middle of 2 five letter words and a letter from 2 3 letter words
  // check if at least 2 of the coordinates are -1 or 1
  const key = `${x},${y},${z}`;
  return words[key];

}
let numberOfSwaps = 0;
function shuffleCubes() {
  let cubes = scene.children.filter(cube => cube instanceof Cube && !cube.disabled);
  let vertexCubes = cubes.filter(cube => cube.is_vertex);
  let edgeCubes = cubes.filter(cube => !cube.is_vertex);
  for (let i = edgeCubes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    edgeCubes[i].swap(edgeCubes[j]);
    numberOfSwaps++;
  }
  for (let i = vertexCubes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    vertexCubes[i].swap(vertexCubes[j]);
    numberOfSwaps++;
  }
  console.log(`Number of swaps: ${numberOfSwaps}`);
}

for (let x of offsets) {
  for (let y of offsets) {
    for (let i = 0; i < edgeCubes; i++) {
      const position = -1 + i * spacing; // Incremental positions for the edge cubes
      // Add cubes along the X, Y, and Z edges
      addCube(position, y, x);
      addCube(x, position, y);
      addCube(y, x, position);
    }
  }
}

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
let selectedCube = null; // The cube currently being dragged
let isCubeDragging = false; // Dragging state

renderer.domElement.addEventListener("mouseleave", () => {
  isDragging = false;
});

// events
window.addEventListener("pointermove", (e) => {
  mouse.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  // Filter out null children
  intersects = raycaster.intersectObjects(scene.children, true);
  const hits = [intersects[0]];
  if (isCubeDragging) {
    // get first 2 hits
    if (intersects.length > 1) {
      if (hits.length === 2) hits.pop();
      hits.push(intersects[1]);
    }
    const selectedCubeIndex = hits.findIndex(hit => hit != null && hit.object.uuid === selectedCube.uuid);
    if (selectedCubeIndex === -1) {
      hits.pop();
      hits.push({ object: selectedCube });
    }
  }

  // Get the keys of the hits array
  let hitKeys = [];
  if (hits.length > 0) hitKeys = hits.filter(hit => hit != null).map(hit => hit.object.uuid);
  // If a previously hovered item is not among the hits we must call onPointerOut
  Object.keys(hovered).forEach((key) => {
    if (!hitKeys.includes(key)) {
      const hoveredItem = hovered[key];
      if (hoveredItem.object.onPointerOut) {
        hoveredItem.object.onPointerOut(hoveredItem);
      }
      delete hovered[key];
    }
  });

  if (Object.keys(hovered).length > 2) console.log(hitKeys);

  for (let hit of hits) {
    if (hit && hit.object) {
      // If a hit has not been flagged as hovered we must call onPointerOver
      if (!hovered[hit.object.uuid]) {
        hovered[hit.object.uuid] = hit;
        if (hit.object.onPointerOver) hit.object.onPointerOver(hit);
      }
    }
  }

});

// Function to update the mouse position
function onMouseMove(event) {
  mouse.set((event.clientX / width) * 2 - 1, -(event.clientY / height) * 2 + 1);
  if (selectedCube) {
    isCubeDragging = true;
  } else if (isDragging) {
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };

    // Rotate the entire scene based on mouse movement
    scene.rotation.y += toRadians(deltaMove.x) * 0.5;
    scene.rotation.x += toRadians(deltaMove.y) * 0.5;

    previousMousePosition = { x: event.clientX, y: event.clientY };
  }
  // Move the mesh to the world position
  orientationCube.position.copy(worldPosition);
}

// Function to handle mouse down (start dragging)
function onMouseDown(event) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children); // Detect cubes in the scene
  if (intersects.length > 0) {
    selectedCube = intersects[0].object;
    if (selectedCube.disabled){
      selectedCube = null;
      return; // Skip if the cube is disabled
    }
    selectedCube.lastStaticPosition = selectedCube.position.clone();
  } else {
    isDragging = true;
    isCubeDragging = false;
  }
  previousMousePosition = { x: event.clientX, y: event.clientY };
}

// Function to handle mouse up (end dragging)
function onMouseUp(event) {
  if (selectedCube) {
    if (isCubeDragging) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children).filter(intersect => intersect.object !== selectedCube);

      if (
        intersects.length > 0 &&
        intersects[0].object !== selectedCube &&
        intersects[0].object.type === "Mesh" &&
        !intersects[0].object.disabled
      ) {
        const hoverCube = intersects[0].object;
        // Swap positions
        selectedCube.swap(hoverCube);
      } else {
        selectedCube.resetPosition();
      }
    } else {
      if (
        previousMousePosition.x != event.clientX ||
        previousMousePosition.y != event.clientY
      )
        return;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      const hit = intersects[0];
      if (hit && hit.object && typeof hit.object.onClick === "function") {
        hit.object.onClick(hit);
      }
    }
  }

  // Reset state
  isCubeDragging = false;
  selectedCube = null;
  isDragging = false;
}

// Add event listeners for mouse events
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mouseup", onMouseUp);

const orientationCube = new Cube(0, 0, 0,
  ["RIGHT", "LEFT", "TOP", "BOTTOM", "FRONT", "BACK"],
  5,
  true
);
scene.add(orientationCube);
// Update the mesh position in world space
const worldPosition = new THREE.Vector3(0, 0, 0); // Set the fixed world position

// Helper function to detect clicks on the cube faces
function onMouseClick(event) {
  // Convert mouse coordinates to normalized device coordinates (-1 to 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  if (
    previousMousePosition.x == event.clientX ||
    previousMousePosition.y == event.clientY
  )
    return;
  previousMousePosition = { x: event.clientX, y: event.clientY };

  raycaster.setFromCamera(mouse, camera);

  // Raycast to detect intersection with cube
  const intersects = raycaster.intersectObject(orientationCube);

  if (intersects.length > 0) {
    const face = intersects[0].face;
    console.log(face.normal);
    // Rotate the scene based on the clicked face
    switch (face.normal.x) {
      case 1: // Right face clicked
        scene.rotation.set(0, -Math.PI / 2, 0);
        break;
      case -1: // Left face clicked
        scene.rotation.set(0, Math.PI / 2, 0);
        break;
    }
    switch (face.normal.y) {
      case 1: // Top face clicked
        scene.rotation.set(Math.PI / 2, 0, 0);
        break;
      case -1: // Bottom face clicked
        scene.rotation.set(-Math.PI / 2, 0, 0);
        break;
    }
    switch (face.normal.z) {
      case 1: // Front face clicked
        scene.rotation.set(0, 0, 0);
        break;
      case -1: // Back face clicked
        scene.rotation.set(0, Math.PI, 0);
        break;
    }
  }
  // Move the mesh to the world position
  orientationCube.position.copy(worldPosition);
}

// Add the click event listener
window.addEventListener("click", onMouseClick, false);

// Animation loop
function animate(t) {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

//shuffleCubes();
const dControls = new DragControls(scene.children, camera, renderer.domElement);