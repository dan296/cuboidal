import * as THREE from 'three';

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Create a material for the smaller cubes
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

const createRoundedCubeWithLetters = (size, radius, segments, letters) => {
  if (letters.length !== 6) {
    throw new Error('Each cube must have 6 letters, one for each face.');
  }

  // Helper function to create a rounded rectangle shape
  const createRoundedShape = () => {
    const shape = new THREE.Shape();
    const halfSize = size / 2;

    shape.moveTo(-halfSize + radius, -halfSize);
    shape.lineTo(halfSize - radius, -halfSize);
    shape.quadraticCurveTo(halfSize, -halfSize, halfSize, -halfSize + radius);
    shape.lineTo(halfSize, halfSize - radius);
    shape.quadraticCurveTo(halfSize, halfSize, halfSize - radius, halfSize);
    shape.lineTo(-halfSize + radius, halfSize);
    shape.quadraticCurveTo(-halfSize, halfSize, -halfSize, halfSize - radius);
    shape.lineTo(-halfSize, -halfSize + radius);
    shape.quadraticCurveTo(-halfSize, -halfSize, -halfSize + radius, -halfSize);

    return shape;
  };

  // Create textures for each face with the corresponding letter
  const createTextTexture = (text) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    // Draw the background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the text
    context.fillStyle = '#000000';
    context.font = '100px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
  };

  // Create materials for each face
  const materials = letters.map((letter) => {
    return new THREE.MeshBasicMaterial({
      map: createTextTexture(letter),
      side: THREE.DoubleSide, // To ensure the texture is visible from both sides
    });
  });

  // Create the geometry for a rounded box
  const roundedShape = createRoundedShape();
  const extrudeSettings = {
    depth: size,
    bevelEnabled: true,
    bevelSegments: segments,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius,
  };

  const geometry = new THREE.ExtrudeGeometry(roundedShape, extrudeSettings);

  // Center the geometry for proper alignment
  geometry.center();

  // Create the mesh with the rounded geometry and materials
  const roundedCube = new THREE.Mesh(geometry, materials);

  return roundedCube;
};


const letters = ['A', 'B', 'C', 'D', 'E', 'F']; // Letters for each face
const createCube = (size) => createRoundedCubeWithLetters(size, 0.1, 4, letters);

// Generate a wireframe of smaller cubes
const edgeCubes = 5; // Number of cubes per edge
const cubeSize = 0.5; // Size of each small cube
const spacing = 0.5; // Spacing between the cubes

// Calculate the positions for the wireframe
const offsets = [-1, 1]; // To position cubes on opposite ends of the larger cube
for (let x of offsets) {
  for (let y of offsets) {
    for (let i = 0; i < edgeCubes; i++) {
      const position = -1 + i * spacing; // Incremental positions for the edge cubes

      // Add cubes along the X edges
      const cubeX = createCube(cubeSize);
      cubeX.position.set(position, y, x);
      scene.add(cubeX);

      // Add cubes along the Y edges
      const cubeY = createCube(cubeSize);
      cubeY.position.set(x, position, y);
      scene.add(cubeY);

      // Add cubes along the Z edges
      const cubeZ = createCube(cubeSize);
      cubeZ.position.set(y, x, position);
      scene.add(cubeZ);
    }
  }
}

// Position the camera
camera.position.z = 5;

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Variables for drag rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

const toRadians = (angle) => angle * (Math.PI / 180);

// Add mouse event listeners
renderer.domElement.addEventListener('mousedown', (event) => {
  isDragging = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('mousemove', (event) => {
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

renderer.domElement.addEventListener('mouseup', () => {
  isDragging = false;
});

renderer.domElement.addEventListener('mouseleave', () => {
  isDragging = false;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

// Optional: Add a simple light
const light = new THREE.PointLight(0xffffff, 2, 100); // Increase intensity
light.position.set(10, 10, 10);
scene.add(light);
