import * as THREE from 'three';
import { PlayerPhysics } from './PlayerPhysics.js';

export class Player {
    constructor(scene, world, game) {
        this.scene = scene;
        this.world = world;
        this.game = game;
        this.initGraphics();
        this.initPhysics();
    }

    initGraphics() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    initPhysics() {
        this.physics = new PlayerPhysics(this.scene, this.world, this);
    }

    handleGameOver() {
        this.resetPosition();
        this.game.handleGameOver();
    }

    resetPosition() {
        this.mesh.position.copy(this.physics.body.position);
    }

    update() {
        this.physics.update();
    }

    updatePosition(p, q) {
        this.mesh.position.copy(p);
        this.physics.body.position.copy(p);
        this.mesh.quaternion.copy(q);
    }
}
