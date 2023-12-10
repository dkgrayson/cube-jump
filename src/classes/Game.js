import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Player } from './Player';
import { Level } from './Level';
import { Camera } from './Camera';
import level1 from '../../levels/1.json';
import level2 from '../../levels/2.json';
import level3 from '../../levels/3.json';
import level4 from '../../levels/4.json';
import level5 from '../../levels/5.json';
import level6 from '../../levels/6.json';
import level7 from '../../levels/7.json';
import level8 from '../../levels/8.json';
import level9 from '../../levels/9.json';
import level10 from '../../levels/10.json';

export class Game {
  constructor() {
    this.levels = [
      level1,
      level2,
      level3,
      level4,
      level5,
      level6,
      level7,
      level8,
      level9,
      level10
    ]; //TODO: Move everything for levels to level class
    this.currentLevelIndex = 0;
    this.gameState = 'starting';
    this.loadingLevel = false;
    this.fixedTimeStep = 1 / 60;
    this.init();
  }

  init() {
    this.initScene();
    this.initRendender();
    this.initCamera();
    this.initLights();
    this.loadLevel(this.currentLevelIndex);
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF98D8D);
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.fixedTimeStep = this.fixedTimeStep;
    this.player = new Player(this.scene, this.world, this);
  }

  initCamera() {
    const canvas = this.renderer.domElement;
    this.cameraController = new Camera(canvas);
  }

  initRendender() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.innerHTML = '';
    document.body.appendChild(this.renderer.domElement);
  }

  initLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  loadLevel(levelIndex) {
    if (this.loadingLevel) return;
    this.loadingLevel = true;

    if (levelIndex >= this.levels.length) {
        this.gameState = 'win';
        alert('You win!');
        return;
    }

    if (this.currentLevel) this.currentLevel.clearLevel();

    this.levelData = this.levels[levelIndex];
    this.currentLevel = new Level(this.scene, this.world);
    this.currentLevel.loadLevel(this.levelData);

    if (this.levelData.background) {
        const bgColor = parseInt(this.levelData.background, 16);
        this.scene.background = new THREE.Color(bgColor);
    }
    let firstPlatform = this.currentLevel.firstPlatform;
    // if (firstPlatform) this.resetPlayerPosition(firstPlatform);
    if (this.player && this.player.physics) this.player.physics.resetMovement();
    this.gameState = 'playing';
    this.loadingLevel = false;
  }

  resetPlayerPosition(firstPlatform) { // TODO: Move player controls to player
    let platformPosition = firstPlatform.mesh.position;
    let playerHeight = this.player.height;

    this.player.mesh.position.copy(platformPosition.x, platformPosition.y + playerHeight, platformPosition.z);
    this.player.physics.body.position.set(platformPosition.x, platformPosition.y + playerHeight, platformPosition.z);
  }

  handleGameOver() {
    if (this.gameState !== 'playing') return;

    this.gameState = 'gameOver';
    console.log('DEAD AGAIN');
    this.loadLevel(this.currentLevelIndex);
  }

  checkLevelCompletion() {
    if (this.gameState !== 'playing') return;

    if (this.currentLevel.finalPlatform) {
        const playerPos = this.player.mesh.position;
        const platformPos = this.currentLevel.finalPlatform.mesh.position;
        const horizontalDistance = new THREE.Vector2(playerPos.x, playerPos.z).distanceTo(new THREE.Vector2(platformPos.x, platformPos.z));
        const verticalDistance = Math.abs(playerPos.y - platformPos.y);

        // Define thresholds for completion
        const horizontalThreshold = 5; // Horizontal distance threshold
        const verticalThreshold = 1; // Vertical distance threshold (e.g., the height of the player)

        if (horizontalDistance <= horizontalThreshold && verticalDistance <= verticalThreshold) {
            this.currentLevelIndex++;
            this.loadLevel(this.currentLevelIndex);
        }
    }
  }

  animate = () => {
    if (this.gameState !== 'playing') return;
    this.world.step(this.fixedTimeStep);
    this.player.update();
    this.cameraController.update(this.player);
    this.checkLevelCompletion();
    this.renderer.render(this.scene, this.cameraController.camera);
    requestAnimationFrame(this.animate);
  }
}
