import * as THREE from 'three';
import { PlayerPhysics } from './PlayerPhysics.js';

export class Player {
    constructor(scene, world, game) {
        this.scene = scene;
        this.world = world;
        this.game = game;
        this.height = 1;
        this.width = 1;
        this.depth = 1;
        this.initGraphics();
        this.initPhysics();

        // Store the initial position and quaternion
        this.initPosition = new THREE.Vector3();
        this.initQuaternion = new THREE.Quaternion();
    }

    initGraphics() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshBasicMaterial({ color: 0x003366 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
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
        this.mesh.position.copy(this.initPosition);
        this.physics.body.position.copy(this.initPosition);
        this.mesh.quaternion.set(0, 0, 0, 1);
        this.physics.body.quaternion.set(0, 0, 0, 1);
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
