import * as THREE from 'three';

export class Camera {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cameraDistance = 10;
    this.camera.position.set(0, this.cameraDistance, 10);
    this.theta = Math.PI;
    this.phi = Math.PI / 3;
  }

  update(position) {
    this.camera.position.x = position.x + this.cameraDistance * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.position.y = position.y + this.cameraDistance * Math.cos(this.phi);
    this.camera.position.z = position.z + this.cameraDistance * Math.sin(this.phi) * Math.sin(this.theta);
    this.camera.lookAt(position);
  }
}
