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
    this.horizontalThreshold = 5;
    this.verticalThreshold = this.height;
    this.initPosition = new THREE.Vector3(0, 2, 0);
    this.initQuaternion = new THREE.Quaternion()
    this.initGraphics();
    this.initPhysics();
  }

  initGraphics() {
    let geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

    let materials = [
      new THREE.MeshStandardMaterial({ color: 0xff0000 }),
      new THREE.MeshStandardMaterial({ color: 0x0000ff }),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
      new THREE.MeshStandardMaterial({ color: 0xffff00 }),
      new THREE.MeshStandardMaterial({ color: 0xff00ff }),
      new THREE.MeshStandardMaterial({ color: 0x00ffff })
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

  calculateDistance(start, end) {
    return [
      new THREE.Vector2(
        start.x,
        start.z
      ).distanceTo(
        new THREE.Vector2(
          end.x,
          end.z
        )
      ),
      Math.abs(start.y - end.y)
    ];
  }

  checkLevelCompletion() {
    let currentLevel = this.game.currentLevel;

    if (!currentLevel.finalPlatform) return;

    let [horizontalDistance, verticalDistance] = this.calculateDistance(
      this.mesh.position,
      currentLevel.finalPlatform.mesh.position
    );

    return (horizontalDistance <= this.horizontalThreshold && verticalDistance <= this.verticalThreshold);
  }

  handleLevelCompletion() {
    this.game.handleLevelCompletion();
    this.reset();
  }

  handleGameOver() {
    this.game.handleGameOver();
    this.physics.handleGameOver();
    this.reset();
  }

  reset() {
    let platformPosition = this.game.currentLevel.firstPlatform.mesh.position;
    let startingHeight = this.height / 2 + this.game.currentLevel.firstPlatform.height / 2;
    this.mesh.position.set(platformPosition.x, platformPosition.y + startingHeight, platformPosition.z);
    this.physics.body.position.set(platformPosition.x, platformPosition.y + startingHeight, platformPosition.z);
  }

  updatePosition(p, q) {
    this.mesh.position.copy(p);
    this.mesh.quaternion.copy(q);
  }

  update(deltaTime) {
    this.physics.update(deltaTime);
    if (this.checkGameOver()) this.handleGameOver();
  }
}
