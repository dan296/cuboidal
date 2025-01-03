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
});

let selectedCube = null; // The cube currently being dragged
let hoverCube = null; // The cube currently being hovered
let isCubeDragging = false; // Dragging state
let lastCubePosition = null; // Last position of the cube
let dragPlane = new THREE.Plane(); // Drag plane
let dragPlaneIntersectPoint = new THREE.Vector3(); // Point on the plane
// Function to update the mouse position
function onMouseMove(event) {
  mouse.set((event.clientX / width) * 2 - 1, -(event.clientY / height) * 2 + 1);
  if (isCubeDragging && selectedCube) {
    // Update raycaster to project the mouse onto 3D space
    raycaster.setFromCamera(mouse, camera);
    const intersected = raycaster.ray.intersectPlane(
      dragPlane,
      dragPlaneIntersectPoint
    ); // Update the cube's position
    if (intersected) {
      selectedCube.position.copy(dragPlaneIntersectPoint); // Move the cube to the intersection point
    }
    /*const intersects = raycaster.intersectObject(dragPlane); // Assuming you have a reference plane
    if (intersects.length > 0) {
      selectedCube.position.copy(mouse.position);
    }*/
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
    if (selectedCube.disabled) return; // Skip if the cube is disabled
    isCubeDragging = true;
    lastCubePosition = selectedCube.position.clone();

    // Create a drag plane
    const planeNormal = new THREE.Vector3(0, 0, 1); // Default plane normal
    planeNormal.applyEuler(scene.rotation); // Apply scene's rotation to plane normal
    dragPlane.setFromNormalAndCoplanarPoint(planeNormal, selectedCube.position);

    const planeHelper = new THREE.PlaneHelper(dragPlane, 2, 0xff0000); // Visualize the plane (optional)
    scene.add(planeHelper);
    /*
    // Create a mesh to represent the drag plane (for intersection calculations)
    const dragPlaneGeometry = new THREE.PlaneGeometry(100, 100);
    const dragPlaneMaterial = new THREE.MeshBasicMaterial({ visible: false });
    dragPlane = new THREE.Mesh(dragPlaneGeometry, dragPlaneMaterial);
    dragPlane.lookAt(camera.position);
    dragPlane.position.copy(selectedCube.position);
    scene.add(dragPlane);
    //scene.remove(planeHelper); // Remove the visual plane helper
 */
  } else {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
    isCubeDragging = false;
  }
}

// Function to handle mouse up (end dragging)
function onMouseUp(event) {
  if (isCubeDragging && selectedCube) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0 && intersects[0].object !== selectedCube) {
      hoverCube = intersects[0].object;

      // Swap positions
      const tempPosition = selectedCube.position.clone();
      selectedCube.position.copy(hoverCube.position);
      hoverCube.position.copy(tempPosition);
    }
  }

  // Reset state
  isCubeDragging = false;
  selectedCube = null;
  hoverCube = null;
  isDragging = false;
}

// Add event listeners for mouse events
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mouseup", onMouseUp);

const orientationCube = new Cube(["RIGHT", "LEFT", "TOP", "BOTTOM", "FRONT", "BACK"], 5, true);
scene.add(orientationCube);
// Update the mesh position in world space
const worldPosition = new THREE.Vector3(0, 0, 0); // Set the fixed world position


// Helper function to detect clicks on the cube faces
function onMouseClick(event) {
  
  // Convert mouse coordinates to normalized device coordinates (-1 to 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  if(previousMousePosition.x == event.clientX || previousMousePosition.y == event.clientY) return;
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
        scene.rotation.set(0, -Math.PI/2, 0);
        break;
      case -1: // Left face clicked
        scene.rotation.set(0, Math.PI/2, 0);
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
window.addEventListener('click', onMouseClick, false);

// Animation loop
function animate(t) {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
