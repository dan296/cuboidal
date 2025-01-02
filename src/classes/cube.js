import * as THREE from "three";
export default class Cube extends THREE.Mesh {
  constructor(letters = []) {
    super();

    // Limit letters to max 4 and ensure array contains strings
    this.letters = letters.slice(0, 4).map((letter) => letter.toString());
    this.cubeSize = 0.5;
    // Geometry and material
    this.geometry = new THREE.BoxGeometry(
      this.cubeSize,
      this.cubeSize,
      this.cubeSize
    );
    // Add edges to the cube
    /*const edges = new THREE.EdgesGeometry(this.geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);

    // Add the edges to the scene or the cube object
    this.add(lineSegments);
    */
    // top, bottom, left, right, front, back
    // Create canvas-based textures for each face
    this.textures = [];
    for (let i = 0; i < 6; i++) {
      const canvas = document.createElement("canvas");
      // Increase resolution for higher quality
      const resolution = 256; // Higher resolution for sharper text
      canvas.width = resolution;
      canvas.height = resolution;
      const ctx = canvas.getContext("2d");

      // Fill background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw letter if it exists for the face (letters[0-3] map to faces 0-3)
      if (i < this.letters.length) {
        ctx.fillStyle = "black";
        ctx.font = `${resolution / 2}px Arial`;
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
          color: new THREE.Color("white").convertSRGBToLinear(),
        })
    );

    this.cubeActive = false;
  }

  render() {
    this.rotation.x = this.rotation.y += 0.01;
  }

  onResize(width, height, aspect) {
    //this.cubeSize = width / 5; // 1/5 of the full width
    //this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.5 : 1));
  }

  onPointerOver(e) {
    this.material.forEach((mat) => {
      mat.color.set("hotpink");
      mat.color.convertSRGBToLinear();
    });
  }

  onPointerOut(e) {
    this.material.forEach((mat) => {
      mat.color.set("white");
      mat.color.convertSRGBToLinear();
    });
  }

  onClick(e) {
    //this.cubeActive = !this.cubeActive;
    //this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.5 : 1));
    this.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    this.textures.forEach((texture) => {
      this.rotateFace(texture);
    });
  }

  // Rotate a specific face of the cube
  rotateFace(texture, angle = (-1 * Math.PI) / 2) {
    // Update the rotation of the texture
    texture.rotation += angle; // Increment rotation angle

    // Trigger texture update
    texture.needsUpdate = true;
  }
}
