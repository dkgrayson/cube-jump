import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Enemy } from './Enemy';

export class Platform {
  constructor(platform, color) {
    this.x = platform.x;
    this.y = platform.y;
    this.z = platform.z;
    this.width = platform.width;
    this.depth = platform.depth;
    this.height = platform.height || 1;
    this.isFinal = platform.isFinal;
    this.isFirst = platform.isFirst;
    this.moveRange = platform.moveRange;
    this.moveSpeed = platform.moveSpeed;
    this.moveAxis = platform.moveAxis;
    this.initialX = this.x;
    this.initialY = this.y;
    this.initialZ = this.z;
    this.hasEnemy = platform.hasEnemy;
    this.enemy = this.hasEnemy? this.initEnemy() : null;
    this.currentTime = 0;
    this.color = new THREE.Color(parseInt(color, 16));
    if (this.isFinal) {
      this.collisionType = 2;
    }
    else if (this.hasEnemy) {
      this.collisionType = 3;
    }
    else {
      this.collisionType = 1;
    };

    this.initGraphics();
    this.initBody();
  }

  initGraphics() {
    let geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    let material =
      this.isFinal ?
        new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0xFFFFFF, reflectivity: 1, shininess: 1})
        : new THREE.MeshPhongMaterial({ color: this.color, shininess: .5 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(this.x, this.y, this.z);
  }

  initBody() {
    let shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2));
    this.body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(this.x, this.y, this.z),
      shape: shape,
      collisionFilterGroup: 1,
      type: this.collisionType
    });
  }

  initEnemy() {
    return new Enemy(this);
  }

  update(deltaTime, playerPosition) {
    this.currentTime += deltaTime;
    if (this.enemy && playerPosition) { this.enemy.update(deltaTime, playerPosition) };
    if (this.moveRange > 0 && this.moveSpeed > 0 && this.moveAxis) {
      let moveOffset = Math.sin(this.currentTime * this.moveSpeed) * this.moveRange;

      switch (this.moveAxis) {
        case 'x':
          this.x = this.initialX + moveOffset;
          this.mesh.position.x = this.x;
          this.body.position.x = this.x;
          break;
        case 'y':
          this.y = this.initialY + moveOffset;
          this.mesh.position.y = this.y;
          this.body.position.y = this.y;
          break;
        case 'z':
          this.z = this.initialZ + moveOffset;
          this.mesh.position.z = this.z;
          this.body.position.z = this.z;
          break;
        default:
          break;
      }
    }
  }
}
