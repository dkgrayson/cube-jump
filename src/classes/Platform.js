import * as THREE from 'three';
import * as CANNON from 'cannon';

export class Platform {
    constructor(scene, world, x, y, z, width, depth) {
        this.scene = scene;
        this.world = world;
        this.isGround = true;

        // Three.js setup
        const geometry = new THREE.BoxGeometry(width, 1, depth);
        const material = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        scene.add(this.mesh);

        // Cannon.js setup
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, 0.5, depth / 2));
        this.body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(x, y, z),
            shape: shape
        });
        world.addBody(this.body);
    }
}
