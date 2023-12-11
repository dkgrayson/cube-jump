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
        this.color = 0x003366;
        this.initPosition = new THREE.Vector3(0, 0, 0);
        this.initQuaternion = new THREE.Quaternion()
        this.initGraphics();
        this.initPhysics();
    }

    initGraphics() {
        let geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

        let materials = [
            new THREE.MeshBasicMaterial({ color: 0xff0000 }),
            new THREE.MeshBasicMaterial({ color: 0x0000ff }),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
            new THREE.MeshBasicMaterial({ color: 0xffff00 }),
            new THREE.MeshBasicMaterial({ color: 0xff00ff }),
            new THREE.MeshBasicMaterial({ color: 0x00ffff })
        ];

        this.mesh = new THREE.Mesh(geometry, materials);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
    }

    initPhysics() {
        this.physics = new PlayerPhysics(this.scene, this.world, this);
    }

    checkGameOver() {
        return this.mesh.position.y < -20;
    }

    handleGameOver() {
        this.reset();
        this.physics.handleGameOver();
        this.game.handleGameOver();
    }

    reset() {
        this.updatePosition(this.initPosition, this.initQuaternion)
    }

    updatePosition(p, q) {
        this.mesh.position.copy(p);
        this.mesh.quaternion.copy(q);
    }

    update() {
        this.physics.update();
        if (this.checkGameOver()) this.handleGameOver();
    }
}
