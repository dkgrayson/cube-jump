import * as THREE from 'three';
import * as CANNON from 'cannon';

export class Enemy {
  constructor(spawnPlatform) {
    this.geometry = new THREE.SphereGeometry(.5, 16, 16);
    this.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.active = false;
    this.speed = 4;
    this.spawnPosition = new THREE.Vector3(spawnPlatform.x, spawnPlatform.y + 2, spawnPlatform.z);
    this.mesh.position.copy(this.spawnPosition);

    this.initPhysicsBody();
  }

  initPhysicsBody() {
    let shape = new CANNON.Sphere(1);
    this.body = new CANNON.Body({
      mass: 5,
      position: this.spawnPosition,
      shape: shape,
      type: 4
    });
  }

  reset() {
    this.mesh.position.copy(this.spawnPosition);
    this.body.position.copy(this.spawnPosition);
    this.active = false;
  }

  update(deltaTime, playerPosition) {
    if (this.active) {
      let direction = new THREE.Vector3().subVectors(playerPosition, this.mesh.position).normalize();
      this.body.velocity.set(direction.x * this.speed, direction.y * this.speed, direction.z * this.speed);
      this.mesh.position.copy(this.body.position);
    }
  }
}
