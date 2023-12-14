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
    this.initPosition = new THREE.Vector3(0, 1, 0);
    this.initQuaternion = new THREE.Quaternion()
    this.initGraphics();
    this.initPhysics();
  }

  initGraphics() {
    let geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

    let materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
      new THREE.MeshBasicMaterial({ color: 0x0000ff }),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
      new THREE.MeshBasicMaterial({ color: 0xffff00 }),
      new THREE.MeshBasicMaterial({ color: 0xff00ff }),
      new THREE.MeshBasicMaterial({ color: 0x00ffff })
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
    this.physics.handleLevelCompletion();
    this.reset();
  }

  handleGameOver() {
    this.reset();
    this.physics.handleGameOver();
    this.game.handleGameOver();
  }

  reset() {
    let platformPosition = this.game.currentLevel.firstPlatform.mesh.position;
    this.mesh.position.copy(platformPosition.x, platformPosition.y + this.height, platformPosition.z);
    this.physics.body.position.set(platformPosition.x, platformPosition.y + this.height, platformPosition.z);
  }

  updatePosition(p, q) {
    this.mesh.position.copy(p);
    this.mesh.quaternion.copy(q);
  }

  update() {
    this.physics.update();
    if (this.checkGameOver()) this.handleGameOver();
    if (this.checkLevelCompletion()) this.handleLevelCompletion();
  }
}
