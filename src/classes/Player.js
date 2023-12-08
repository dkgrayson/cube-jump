import * as THREE from 'three';
import * as CANNON from 'cannon';

export class Player {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;

        // Three.js setup
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);

        // Cannon.js setup
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 0, 0),
            shape: shape
        });
        world.addBody(this.body);

        this.moveSpeed = 1;
        this.jumpSpeed = 20;
        this.velocity = new THREE.Vector3();
        this.isJumping = false;
        this.maxJumpHeight = 50; // Maximum height the player can reach
        this.startJumpHeight = 0; // Height at which the last jump started

        this.keys = {
            left: false,
            right: false,
            forward: false,
            backward: false,
            jump: false
        };

        // Bind event handlers
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);

        // Add event listeners
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        this.body.addEventListener('collide', this.handleCollision);
    }

    onKeyDown = (event) => {
        switch (event.keyCode) {
            case 68: //d right
                this.keys.right = true;
                break;
            case 83: //s backwards
                this.keys.backward = true;
                break;
            case 65: //a left
                this.keys.left = true;
                break;
            case 87: //w forwards
                this.keys.forward = true;
                break;
            case 32: //space jump
                this.keys.jump = true;
                break;
        }
    }

    onKeyUp = (event) => {
        switch (event.keyCode) {
            case 68:
                this.keys.right = false;
                break;
            case 83:
                this.keys.backward = false;
                break;
            case 65:
                this.keys.left = false;
                break;
            case 87:
                this.keys.forward = false;
                break;
            case 32:
                this.keys.jump = false;
                break;
        }
    }

     handleCollision = (event) => {
        // Reset isJumping when colliding with the ground
        this.isJumping = false;
    }

    update() {
        // Handle horizontal movement
        this.velocity.x = 0;
        this.velocity.z = 0;
        if (this.keys.right) this.velocity.x += this.moveSpeed;
        if (this.keys.left) this.velocity.x -= this.moveSpeed;
        if (this.keys.forward) this.velocity.z -= this.moveSpeed;
        if (this.keys.backward) this.velocity.z += this.moveSpeed;

        this.body.velocity.x = this.velocity.x;
        this.body.velocity.z = this.velocity.z

        // Handle jumping
        if (this.keys.jump) {
            if (!this.isJumping) {
                // Start jump if not already jumping
                this.startJumpHeight = this.mesh.position.y;
                this.isJumping = true;
            }
            // Continue applying upward force as long as space is held and max height not reached
            if (this.mesh.position.y - this.startJumpHeight < this.maxJumpHeight) {
                this.body.applyForce(new CANNON.Vec3(0, this.jumpSpeed, 0), this.body.position);
            }
        } else if (this.isJumping) {
            // Stop upward movement when space is released
            if (this.body.velocity.y > 0) {
                this.body.velocity.y = 0;
            }
            this.isJumping = false;
        }

        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

}
