import * as THREE from 'three';

export class Camera {
  constructor(canvas) {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 10);
    this.canvas = canvas;
    this.sensitivity = 0.005;
    this.cameraDistance = 10;
    this.theta = Math.PI;
    this.phi = Math.PI / 3;
    this.isMouseDown = false;

    this.mouse = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
    };

    this.initPointerLock();
    this.initListeners();
  }

  onMouseMove(event) {
    if (!this.isMouseDown) return;

    this.mouse.dx = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    this.mouse.dy = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    this.theta -= this.mouse.dx * this.sensitivity;
    this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi - this.mouse.dy * this.sensitivity));
  }

  initPointerLock() {
    this.canvas.addEventListener('click', () => {
      this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
      if (this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
  }

  onPointerLockChange() {
    if (document.pointerLockElement === this.canvas) {
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
    } else {
      document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    }
  }

  initListeners() {
    this.canvas.addEventListener('mousedown', () => { this.isMouseDown = true; });
    this.canvas.addEventListener('mouseup', () => { this.isMouseDown = false; });
    this.canvas.addEventListener('mouseout', () => { this.isMouseDown = false; });
  }

  update(player) {
    this.camera.position.x = player.mesh.position.x + this.cameraDistance * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.position.y = player.mesh.position.y + this.cameraDistance * Math.cos(this.phi);
    this.camera.position.z = player.mesh.position.z + this.cameraDistance * Math.sin(this.phi) * Math.sin(this.theta);
    this.camera.lookAt(player.mesh.position);
  }
}
