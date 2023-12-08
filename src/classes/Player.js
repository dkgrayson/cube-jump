import * as THREE from 'three';
import { PlayerPhysics } from './PlayerPhysics.js';

export class Player {
    constructor(scene, world, game) {
        this.scene = scene;
        this.world = world;
        this.game = game;
        this.initGraphics();
        this.initPhysics();
        this.height = 1;
        this.width = 1;
        this.depth = 1;
    }

    initGraphics() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshBasicMaterial({ color: 0x8D8DF9 });
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
