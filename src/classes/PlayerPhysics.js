import * as THREE from 'three';
import * as CANNON from 'cannon';

export class PlayerPhysics {
  constructor(scene, world, player) {
    this.scene = scene;
    this.world = world;
    this.player = player;

    this.velocity = new THREE.Vector3();
    this.isJumping = false;
    this.maxJumpHeight = 15;
    this.startJumpHeight = 0;
    this.isOnGround = true;
    this.jumpSpeed = 10;

    this.acceleration = 20;
    this.deceleration = 5;
    this.maxSpeed = 10;
    this.deltaTime = 0;

    this.keys = {
      left: false,
      right: false,
      forward: false,
      backward: false,
      jump: false
    };

    this.initBody();
    this.initListeners();
    this.initMobile();
  }

  initBody() {
    let shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    this.body = new CANNON.Body({
      mass: 100,
      position: this.player.initPosition,
      shape: shape
    });
    this.world.addBody(this.body);
  }

  initListeners() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this)
    this.body.addEventListener('collide', this.handleCollision);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  initMobile() {
    let jumpButton = document.getElementById('jump-button');
    if (!jumpButton) return;

    jumpButton.addEventListener('touchstart', () => {
      this.keys.jump = true;
    });
    jumpButton.addEventListener('touchend', () => {
      this.keys.jump = false;
    });
  }

  resetKeys() {
    this.keys = {
      left: false,
      right: false,
      forward: false,
      backward: false,
      jump: false
    };
  }

  handleCollision = (event) => {
    let collidedBody = event.contact.bi === this.body ? event.contact.bj : event.contact.bi;
    if (collidedBody.collisionFilterGroup === 1) this.handleGroundCollision();
  }

  handleGroundCollision() {
    this.isOnGround = true;
    this.isJumping = false;
  };

  isMobile() {
    return window.innerWidth <= 962;
  }

  onKeyDown (event) {
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

  onKeyUp (event) {
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
    this.accelerate(this.acceleration, this.maxSpeed);

    if (!this.keys.left && !this.keys.right) {
      this.body.velocity.z = this.decelerate(this.body.velocity.z, this.deceleration);
    }
    if (!this.keys.forward && !this.keys.backward) {
      this.body.velocity.x = this.decelerate(this.body.velocity.x, this.deceleration);
    }
  }

  accelerate(acceleration, maxSpeed) {
    let accelerationVec = new THREE.Vector3();

    if (this.keys.right) accelerationVec.z += acceleration;
    if (this.keys.left) accelerationVec.z -= acceleration;
    if (this.keys.backward) accelerationVec.x -= acceleration;
    if (this.keys.forward) accelerationVec.x += acceleration;

    this.body.velocity.x += accelerationVec.x * this.deltaTime;
    this.body.velocity.z += accelerationVec.z * this.deltaTime;
    this.body.velocity.x = THREE.MathUtils.clamp(this.body.velocity.x, -maxSpeed, maxSpeed);
    this.body.velocity.z = THREE.MathUtils.clamp(this.body.velocity.z, -maxSpeed, maxSpeed);
  }

  decelerate(value, deceleration) {
    if (value !== 0) {
      let dec = deceleration * this.deltaTime;
      return Math.abs(value) - dec > 0 ? value - Math.sign(value) * dec : 0;
    }
    return value;
  }

  updateVerticalMovement() {
    if (this.keys.jump && this.isOnGround && !this.isJumping) {
      this.isOnGround = false;
      this.isJumping = true;
      this.body.velocity.y = Math.sqrt(2 * this.jumpSpeed * this.world.gravity.length());
    }

    if (this.isJumping) {
      if (this.player.mesh.position.y - this.startJumpHeight >= this.maxJumpHeight) {
        this.isJumping = false;
      }
    }
  }

  applyJoystickInput(dx, dy) {
    this.keys.right = dx > 0;
    this.keys.left = dx < 0;
    this.keys.backward = dy > 0;
    this.keys.forward = dy < 0;
    this.accelerate(this.acceleration, this.maxSpeed);
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

  update(deltaTime) {
    this.deltaTime = deltaTime;
    this.velocity.x = 0;
    this.velocity.z = 0;
    this.updateHorizontalMovement();
    this.updateVerticalMovement();
    this.player.updatePosition(this.body.position, this.body.quaternion);
  }
}
