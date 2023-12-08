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

        this.moveSpeed = 2;
        this.jumpSpeed = 20;
        this.velocity = new THREE.Vector3();
        this.isJumping = false;
        this.maxJumpHeight = 7;
        this.startJumpHeight = 0;
        this.isOnGround = true;

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

    resetPosition() {
        this.body.position.set(0, 0, 0);
        this.mesh.position.copy(this.body.position);
        this.isJumping = false;
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
                if (this.isOnGround)  {
                    this.keys.jump = true;
                }
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
        // Check if the collision is with the ground or a platform
        let collidedBody = event.contact.bi === this.body ? event.contact.bj : event.contact.bi;
        if (collidedBody.isGround) {
            this.isOnGround = true;
        }
    }

    update(isGameOver) {
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
        if (this.keys.jump && this.isOnGround) {
            if (!this.isJumping) {
                this.startJumpHeight = this.mesh.position.y;
                this.isJumping = true;
            }
            if (this.mesh.position.y - this.startJumpHeight < this.maxJumpHeight) {
                this.body.applyForce(new CANNON.Vec3(0, this.jumpSpeed, 0), this.body.position);
            }
        } else if (this.isJumping) {
            this.isJumping = false;
        }

        if (this.mesh.position.y < -20) { // Adjust the threshold as needed
            isGameOver = true; // Set the game over state
            this.resetPosition(); // Reset the player's position
        }

        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

}
