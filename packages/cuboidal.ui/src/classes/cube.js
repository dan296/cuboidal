import * as THREE from "three";
const resolution = 256;
export default class Cube extends THREE.Mesh {
  constructor(x, y, z, letters = [], fontDivider = 2, disabled = false, color = "black") {
    super();
    this.disabled = disabled;
    this.color = color;
    this.letters = letters;
    this.cubeSize = 0.5;
    // Geometry and material
    this.geometry = new THREE.BoxGeometry(
      this.cubeSize,
      this.cubeSize,
      this.cubeSize
    );
    this.fontDivider = fontDivider;
    // top, bottom, left, right, front, back
    // Create canvas-based textures for each face
    this.setTextures();

    this.cubeActive = false;
    this.initialPosition = new THREE.Vector3(x, y, z);
    this.is_vertex = this.isVertex();
    this.lastStaticPosition = new THREE.Vector3(x, y, z);
    this.initialRotation = new THREE.Euler(0, 0, 0);
    this.position.set(x, y, z);
    this.checkPosition();
  }

  setTextures(color = this.color) {
    this.textures = [];
    for (let i = 0; i < 6; i++) {
      const canvas = document.createElement("canvas");
      // Increase resolution for higher quality
      canvas.width = resolution;
      canvas.height = resolution;
      const ctx = canvas.getContext("2d");

      // Fill background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw border
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Draw letter if it exists for the face (letters[0-3] map to faces 0-3)
      if (i < this.letters.length) {
        ctx.fillStyle = "white";
        ctx.font = `bold ${resolution / this.fontDivider}px 'Arial'`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.letters[i], canvas.width / 2, canvas.height / 2);
      }

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      // Ensure the center of rotation is set correctly (middle of the texture)
      texture.center.set(0.5, 0.5);
      texture.needsUpdate = true;
      this.textures.push(texture);
    }

    // Apply materials to cube faces
    this.material = this.textures.map(
      (texture) =>
        new THREE.MeshStandardMaterial({
          map: texture,
          //color: new THREE.Color(this.color).convertSRGBToLinear(),
        })
    );
  }

  render() {
    this.rotation.x = this.rotation.y += 0.01;
  }

  onResize(width, height, aspect) {
  }

  onPointerOver(e) {
    console.log("Im over");
    this.updateColor("#0a0a1b");// #000111
  }

  onPointerOut(e) {
    this.resetColor();
  }

  updateColor(color = this.color) {
    if (!this.disabled) {
      this.setTextures(color);
    }
  }

  resetColor() {
    this.updateColor();
  }

  onClick(e) {
    this.rotate();
  }

  onDoubleClick(e) {
    this.rotate();
  }

  rotate(axis, angle = Math.PI / 2) {
    if (!this.disabled) {
      this.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
      this.textures.forEach((texture) => {
        this.rotateFace(texture);
      });
    }
  }

  // Rotate a specific face of the cube
  rotateFace(texture, angle = (-1 * Math.PI) / 2) {
    // Update the rotation of the texture
    texture.rotation += angle; // Increment rotation angle

    // Trigger texture update
    texture.needsUpdate = true;
  }

  isVertex() {
    return Math.abs(this.initialPosition.x) == 1 && Math.abs(this.initialPosition.y) == 1 && Math.abs(this.initialPosition.z) == 1;
  }

  checkPartial() {
    if (this.is_vertex) {
      return this.checkVertexPartial();
    } else {
      return this.checkNonVertexPartial();
    }
  }

  checkVertexPartial() {
    const xEqual = this.position.x === this.initialPosition.x;
    const yEqual = this.position.y === this.initialPosition.y;
    const zEqual = this.position.z === this.initialPosition.z;

    return (xEqual && yEqual) || (xEqual && zEqual) || (yEqual && zEqual);
  }

  checkNonVertexPartial() {
    const coordToCheck = this.getCoordToCheck();
    if (coordToCheck == "x") return this.position.x !== this.initialPosition.x && this.position.y == this.initialPosition.y && this.position.z == this.initialPosition.z;
    if (coordToCheck == "y") return this.position.y !== this.initialPosition.y && this.position.x == this.initialPosition.x && this.position.z == this.initialPosition.z;
    if (coordToCheck == "z") return this.position.z !== this.initialPosition.z && this.position.x == this.initialPosition.x && this.position.y == this.initialPosition.y;
    return false;
  }

  getCoordToCheck() {
    if (Math.abs(this.initialPosition.x) !== 1) {
      return "x";
    } else if (Math.abs(this.initialPosition.y) !== 1) {
      return "y";
    } else {
      return "z";
    }
  }

  // Check the cube's position
  checkPosition() {
    if (this.disabled) return;
    let res = this.position.equals(this.initialPosition);

    if (res) {
      this.color = "#021600";//"#008000"; // Green
    } else if (this.checkPartial()) {
      this.color = "#2d2d00"; // Yellow
    } else {
      this.color = "#050505";
    }
    this.updateColor();
    return res;
  }

  // Swapping cubes
  swap(cube) {
    if ((this.disabled || cube.disabled) || ((this.is_vertex && !cube.is_vertex) || (!this.is_vertex && cube.is_vertex))) {
      this.resetPosition();
      return;
    }
    // || ((this.is_vertex && !cube.is_vertex) || (!this.is_vertex && cube.is_vertex))
    const tempPos = cube.position.clone();
    cube.position.copy(this.lastStaticPosition);
    cube.lastStaticPosition.copy(this.lastStaticPosition);
    this.position.copy(tempPos);
    this.lastStaticPosition.copy(tempPos);
    this.disabled = this.checkPosition();
    cube.disabled = cube.checkPosition();
  }

  resetPosition() {
    this.position.copy(this.lastStaticPosition);
    this.disabled = this.checkPosition();
  }

}