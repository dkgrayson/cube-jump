import * as THREE from 'three';
import * as CANNON from 'cannon';

export class PlayerPhysics {
    constructor(scene, world, player) {
        this.scene = scene;
        this.world = world;
        this.player = player;

        this.velocity = new THREE.Vector3();
        this.isJumping = false;
        this.maxJumpHeight = 7;
        this.startJumpHeight = 0;
        this.isOnGround = true;
        this.moveSpeed = 2;
        this.jumpSpeed = 20;

        this.keys = {
            left: false,
            right: false,
            forward: false,
            backward: false,
            jump: false
        };

        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 0, 0),
            shape: shape
        });
        world.addBody(this.body);


        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this)
        this.body.addEventListener('collide', this.handleCollision);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    handleCollision = (event) => {
        let collidedBody = event.contact.bi === this.body ? event.contact.bj : event.contact.bi;
        if (collidedBody.isGround) this.handleGroundCollision();
    }

    handleGroundCollision() {
        this.isOnGround = true;
    };


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
                if (this.isOnGround) {
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

    updateHorizontalMovement() {
        this.body.velocity.x = 0;
        this.body.velocity.z = 0;
        if (this.keys.right) this.body.velocity.x += this.moveSpeed;
        if (this.keys.left) this.body.velocity.x -= this.moveSpeed;
        if (this.keys.forward) this.body.velocity.z -= this.moveSpeed;
        if (this.keys.backward) this.body.velocity.z += this.moveSpeed;
    }

    updateVeriticalMovement() {
        if (this.keys.jump && this.isOnGround) {
            if (!this.isJumping) {
                this.startJumpHeight = this.player.mesh.position.y;
                this.isJumping = true;
            }
            if (this.player.mesh.position.y - this.startJumpHeight < this.maxJumpHeight) {
                this.body.applyForce(new CANNON.Vec3(0, this.jumpSpeed, 0), this.body.position);
            }
        } else if (this.isJumping) {
            this.isJumping = false;
        }
    }

    updateGameOver() {
        if (this.player.mesh.position.y < -20) {
            this.body.position.set(0, 0, 0);
            this.isJumping = false;
            this.player.handleGameOver();
        }
    }

    updatePosition() {
        this.player.mesh.position.copy(this.body.position);
        this.player.mesh.quaternion.copy(this.body.quaternion);
    }

    update() {
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.updateHorizontalMovement();
        this.updateVeriticalMovement();
        this.player.updatePosition(this.body.position, this.body.quaternion);
        this.updateGameOver();
    }
}
