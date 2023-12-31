import * as THREE from 'three';

export class Light {
  constructor(target) {
    this.offset = new THREE.Vector3(-5, 50, 0)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.copy(this.offset);
    this.directionalLight.castShadow = true;
    this.directionalLight.target = target;
  }

  update(position) {
    this.directionalLight.position.copy(position.clone().add(this.offset));
    this.directionalLight.target.position.copy(position);
    this.directionalLight.target.updateMatrixWorld();
  }
}
