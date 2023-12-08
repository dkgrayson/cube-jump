import * as THREE from 'three';

export class Camera {
    constructor(canvas) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.canvas = canvas;
        this.sensitivity = 0.005;

        this.mouse = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
        };

        this.initPointerLock();
        this.isMouseDown = false;

        canvas.addEventListener('mousedown', () => { this.isMouseDown = true; });
        canvas.addEventListener('mouseup', () => { this.isMouseDown = false; });
        canvas.addEventListener('mouseout', () => { this.isMouseDown = false; });
    }

    onMouseMove(event) {
        if (!this.isMouseDown) return;

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.mouse.dx += movementX;
        this.mouse.dy += movementY;
        this.updateCameraOrientation();
    }

    updateCameraOrientation() {
        this.camera.rotation.y -= this.mouse.dx * this.sensitivity;
        this.camera.rotation.x -= this.mouse.dy * this.sensitivity;
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));

        this.mouse.dx = 0;
        this.mouse.dy = 0;

        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        this.camera.lookAt(direction.add(this.camera.position));
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

    update(player) {
        this.camera.position.x = player.mesh.position.x;
        this.camera.position.y = player.mesh.position.y + 5;
        this.camera.position.z = player.mesh.position.z + 10;

        if (!this.isMouseDown) this.camera.lookAt(player.mesh.position);
    }
}
