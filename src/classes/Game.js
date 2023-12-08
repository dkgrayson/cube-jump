import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Player } from './Player';
import { Level } from './Level';
import { Camera } from './Camera';
import level1 from '../../levels/1.json';
import level2 from '../../levels/2.json';

export class Game {
  constructor() {
    this.levels = [level1, level2; //TODO: Move everything for levels to level class
    this.currentLevelIndex = 0;
    this.gameState = 'playing';
    this.init();
  }

  init() {
    this.initScene();
    this.initRedender();
    this.initCamera();
    this.loadLevel(this.currentLevelIndex);
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF98D8D);
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.player = new Player(this.scene, this.world, this, this.level);
  }

  initCamera() {
    const canvas = this.renderer.domElement;
    this.cameraController = new Camera(canvas);
  }

  initRedender() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.innerHTML = '';
    document.body.appendChild(this.renderer.domElement);
  }

  loadLevel(levelIndex) {
    this.gameState = 'playing';

    if (levelIndex >= this.levels.length) {
        this.gameState = 'win';
        alert("You win!");
        return;
    }

    if (this.currentLevel) this.currentLevel.clearLevel();

    this.currentLevel = new Level(this.scene, this.world);
    this.currentLevel.loadLevel(this.levels[levelIndex]);

    if (this.currentLevel.firstPlatform) this.resetPlayerPosition();
    if (this.player && this.player.physics) this.player.physics.resetMovement();
  }

  resetPlayerPosition() {
    const platform = this.currentLevel.firstPlatform;
    const platformPosition = platform.mesh.position;
    const playerHeight = 1; // Assuming the player's height is 1 unit

    // Place the player on top of the platform
    this.player.mesh.position.set(platformPosition.x, platformPosition.y + playerHeight, platformPosition.z);
    this.player.physics.body.position.set(platformPosition.x, platformPosition.y + playerHeight, platformPosition.z);
  }

  handleGameOver() {
    if (this.gameState !== 'playing') return;

    this.gameState = 'gameOver';
    alert('You died');
    this.currentLevelIndex = 0;
    this.loadLevel(0);
  }

  checkLevelCompletion() {
    if (this.gameState !== 'playing') return;
    if (this.currentLevel.finalPlatform) {
      const playerPos = this.player.mesh.position;
      const platformPos = this.currentLevel.finalPlatform.mesh.position;
      const distance = playerPos.distanceTo(platformPos);
      const completionThreshold = 5;

      if (distance <= completionThreshold) {
        this.currentLevelIndex++;
        this.loadLevel(this.currentLevelIndex);
      }
    }
  }

  animate = () => {
    if (this.gameState !== 'playing') return;
    requestAnimationFrame(this.animate);
    this.world.step(1 / 60);
    this.player.update();
    this.cameraController.update(this.player);
    this.checkLevelCompletion();
    this.renderer.render(this.scene, this.cameraController.camera);
  }
}
