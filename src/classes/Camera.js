import * as THREE from 'three';

export class Camera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    update(player) {
        this.camera.position.x = player.mesh.position.x;
        this.camera.position.y = player.mesh.position.y + 5;
        this.camera.position.z = player.mesh.position.z + 10;
        this.camera.lookAt(player.mesh.position);
    }
}
