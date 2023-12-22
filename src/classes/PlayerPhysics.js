import * as THREE from 'three';
import * as CANNON from 'cannon';

export class PlayerPhysics {
  constructor(world, player) {
    this.world = world;
    this.player = player;
    this.isJumping = false;
    this.maxJumpHeight = 15;
    this.startJumpHeight = 0;
    this.isOnGround = true;
    this.jumpSpeed = 10;
    this.jumpKeyHeldTime = 0;
    this.maxJumpHoldTime = 0.5;

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
  }

  initListeners() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this)
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

  handleGroundCollision() {
    this.isOnGround = true;
    this.isJumping = false;
  };

  isMobile() {
    return window.innerWidth <= 962;
  }

  onKeyDown(event) {
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

  onKeyUp(event) {
    switch (event.keyCode) {
      case 68: //d
        this.keys.right = false;
        break;
      case 83: //s
        this.keys.backward = false;
        break;
      case 65: //a
        this.keys.left = false;
        break;
      case 87: //w
        this.keys.forward = false;
        break;
      case 32: //space
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

    this.applyAcceleration(accelerationVec, maxSpeed);
  }

  applyAcceleration(accelerationVec, maxSpeed) {
    this.body.velocity.x += accelerationVec.x * this.deltaTime;
    this.body.velocity.z += accelerationVec.z * this.deltaTime;
    this.body.velocity.x = THREE.MathUtils.clamp(this.body.velocity.x, -maxSpeed, maxSpeed);
    this.body.velocity.z = THREE.MathUtils.clamp(this.body.velocity.z, -maxSpeed, maxSpeed);
  }

  decelerate(value, deceleration) {
    let dec = deceleration * this.deltaTime;
    return Math.abs(value) - dec > 0 ? value - Math.sign(value) * dec : 0;
  }

  updateVerticalMovement() {
    if (this.keys.jump) {
      if (this.isOnGround && !this.isJumping) {
        this.startJump();
      } else if (this.isJumping) {
        this.continueJump();
      }
    } else {
      if (this.isJumping) {
          this.endJump();
      }
    }
  }

  startJump() {
    this.isOnGround = false;
    this.isJumping = true;
    this.jumpKeyHeldTime = 0;
    this.body.velocity.y = Math.sqrt(2 * this.jumpSpeed * this.world.gravity.length());
  }

  continueJump() {
    if (this.jumpKeyHeldTime < this.maxJumpHoldTime) {
      let additionalJumpForce = (this.maxJumpHoldTime - this.jumpKeyHeldTime) / this.maxJumpHoldTime;
      this.body.velocity.y += additionalJumpForce * this.jumpSpeed * this.deltaTime;
      this.jumpKeyHeldTime += this.deltaTime;
    }
  }

  endJump() {
    this.isJumping = false;
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

  reset(platform) {
    this.resetKeys();
    this.resetMovement();
    this.isJumping = false;
    this.isOnGround = true;
    let position = new THREE.Vector3(platform.x, platform.y + this.player.verticalThreshold, platform.z);
    this.updatePosition(position, this.player.initQuaternion);
  }

  updatePosition(p, q) {
    this.body.position.copy(p);
    this.body.quaternion.copy(q);
  }

  update(deltaTime) {
    this.deltaTime = deltaTime;
    this.updateHorizontalMovement();
    this.updateVerticalMovement();
    this.player.updatePosition(this.body.position, this.body.quaternion);
  }
}
