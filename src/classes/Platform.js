import * as THREE from 'three';
import * as CANNON from 'cannon';

export class Platform {
  constructor(scene, world, platform, color) {
    this.x = platform.x;
    this.y = platform.y;
    this.z = platform.z;
    this.width = platform.width;
    this.depth = platform.depth;
    this.isFinal = platform.isFinal;
    this.isFirst = platform.isFirst;
    this.scene = scene;
    this.world = world;
    this.color = new THREE.Color(parseInt(color, 16));

    this.initGraphics();
    this.initBody();
  }

  initGraphics() {
    let geometry = new THREE.BoxGeometry(this.width, 1, this.depth);
    let material = new THREE.MeshBasicMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(this.x, this.y, this.z);
    this.scene.add(this.mesh);
  }

  initBody() {
    let shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, 0.5, this.depth / 2));
    this.body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(this.x, this.y, this.z),
      shape: shape,
      collisionFilterGroup: 1
    });
    this.world.addBody(this.body);
  }
}
