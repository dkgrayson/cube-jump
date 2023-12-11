import * as THREE from 'three';
import * as CANNON from 'cannon';

export class PlayerPhysics {
  constructor(scene, world, player) {
    this.scene = scene;
    this.world = world;
    this.player = player;

    this.velocity = new THREE.Vector3();
    this.isJumping = false;
    this.maxJumpHeight = 13.5;
    this.startJumpHeight = 0;
    this.isOnGround = true;
    this.jumpSpeed = 20;
    this.acceleration = 10;
    this.deceleration = 2;
    this.maxSpeed = 4;

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
        position: this.player.initPosition,
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
      if (collidedBody.collisionFilterGroup === 1) this.handleGroundCollision();
  }

  handleGroundCollision() {
      this.isOnGround = true;
      this.isJumping = false;
  };

  onKeyDown = (event) => {
      switch (event.keyCode) {
          case 68: //d
              this.keys.right = true;
              break;
          case 83: //s
              this.keys.backward = true;
              break;
          case 65: //a
              this.keys.left = true;
              break;
          case 87: //w
              this.keys.forward = true;
              break;
          case 32: //space
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
    this.accelerate()

    if (!this.keys.left && !this.keys.right) {
      this.body.velocity.z = this.decelerate(this.body.velocity.z, this.deceleration);
    }
    if (!this.keys.forward && !this.keys.backward) {
      this.body.velocity.x = this.decelerate(this.body.velocity.x, this.deceleration);
    }
  }

  accelerate() {
    let accelerationVec = new THREE.Vector3();

    if (this.keys.right) accelerationVec.z += this.acceleration;
    if (this.keys.left) accelerationVec.z -= this.acceleration;
    if (this.keys.backward) accelerationVec.x -= this.acceleration;
    if (this.keys.forward) accelerationVec.x += this.acceleration;

    this.body.velocity.x += accelerationVec.x * this.world.fixedTimeStep;
    this.body.velocity.z += accelerationVec.z * this.world.fixedTimeStep;
    this.body.velocity.x = THREE.MathUtils.clamp(this.body.velocity.x, -this.maxSpeed, this.maxSpeed);
    this.body.velocity.z = THREE.MathUtils.clamp(this.body.velocity.z, -this.maxSpeed, this.maxSpeed);
  }

  decelerate(value, deceleration) {
      if (value !== 0) {
        const dec = deceleration * this.world.fixedTimeStep;
        return Math.abs(value) - dec > 0 ? value - Math.sign(value) * dec : 0;
      }
      return value;
  }

  updateVeriticalMovement() {
      if (this.keys.jump && this.isOnGround && !this.isJumping) {
        this.startJumpHeight = this.player.mesh.position.y;
        this.isOnGround = false;
        this.isJumping = true;
      }

      let jumpDistance = this.player.mesh.position.y - this.startJumpHeight

      if (this.keys.jump && this.isJumping && jumpDistance < this.maxJumpHeight) {
        this.body.applyForce(new CANNON.Vec3(0, this.jumpSpeed, 0), this.body.position);
      }

      if (jumpDistance >= this.maxJumpHeight) {
        this.isJumping = false;
      }
  }

  resetMovement() {
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.force.set(0, 0, 0);
    this.body.torque.set(0, 0, 0);
  }

  reset() {
      this.isJumping = false;
      this.updatePosition(this.player.initPosition, this.player.initQuaternion);
      this.resetMovement();
  }

  updatePosition(p, q) {
      this.body.position.copy(p);
      this.body.quaternion.copy(q);
  }

  handleGameOver() {
      this.reset();
  }

  handleLevelCompletion() {
    this.reset();
  }

  update() {
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.updateHorizontalMovement();
      this.updateVeriticalMovement();
      this.player.updatePosition(this.body.position, this.body.quaternion);
  }
}
