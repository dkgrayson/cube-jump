import * as THREE from 'three';

export class Player {
  constructor(scene, world, game, firstPlatform) {
    this.scene = scene;
    this.world = world;
    this.game = game;
    this.height = 1;
    this.width = 1;
    this.depth = 1;
    this.verticalThreshold = this.height + 3;
    this.initPosition = new THREE.Vector3(firstPlatform.x, firstPlatform.y + this.verticalThreshold, firstPlatform.z);
    this.initQuaternion = new THREE.Quaternion()
    this.initGraphics();
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
    this.initQuaternion.copy(this.mesh.quaternion);
  }

  reset(platform) {
    this.initPosition.copy(new THREE.Vector3(platform.x, platform.y + this.verticalThreshold + 1, platform.z));
    this.updatePosition(this.initPosition, this.initQuaternion);
  }

  updatePosition(p, q) {
    this.mesh.position.copy(p);
    this.mesh.quaternion.copy(q);
  }
}
