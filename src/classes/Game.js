import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Player } from './Player';
import { Level } from './Level';
import { Camera } from './Camera';
import { Joystick } from './Joystick';
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
import level11 from '../../levels/11.json';
import level12 from '../../levels/12.json';
import level13 from '../../levels/13.json';
import level14 from '../../levels/14.json';
import level15 from '../../levels/15.json';

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
      level10,
      level11,
      level12,
      level13,
      level14,
      level15
    ]; //TODO: Move everything for levels to level class
    this.currentLevelIndex = 0;
    this.gameState = 'starting';
    this.loadingLevel = false;
    this.fixedTimeStep = 1 / 60;
    this.timer = 0;
    this.timerInterval = null;
    this.init();
  }

  init() {
    this.initScene();
    this.initRendender();
    this.initCamera();
    this.initLights();
    this.initJoystick();
    this.loadLevel(this.currentLevelIndex);
    this.startTimer();
    this.animate();
  }

  initJoystick() {
    this.joystick = new Joystick(this.handleJoystickMove.bind(this));
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
    let canvas = this.renderer.domElement;
    this.cameraController = new Camera(canvas);
  }

  initRendender() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
  }

  initLights() {
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  startTimer() {
    this.timer = 0;
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.updateTimerDisplay();
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.stopTimer();
    this.timer = 0;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
    const seconds = (this.timer % 60).toString().padStart(2, '0');
    document.querySelector('.timer').innerText = `Time: ${minutes}:${seconds}`;
  }

  loadLevel(levelIndex) {
    if (this.loadingLevel) return;
    this.loadingLevel = true;

    if (levelIndex >= this.levels.length) {
      this.gameState = 'win';
      this.stopTimer();
      alert('You win!');
      return;
    }

    if (this.currentLevel) this.currentLevel.clearLevel();

    this.levelData = this.levels[levelIndex];
    this.currentLevel = new Level(this.scene, this.world);
    this.currentLevel.loadLevel(this.levelData, levelIndex);

    if (this.levelData.background) {
      let bgColor = parseInt(this.levelData.background, 16);
      this.scene.background = new THREE.Color(bgColor);
    }
    this.loadTitle(this.levelData.name, levelIndex + 1);
    this.gameState = 'playing';
    this.loadingLevel = false;
  }

  loadTitle(name, number) {
    let titleContainer = document.querySelector('.level');
    console.log(titleContainer);
    let titleText = `Level ${number}: ${name}`;
    titleContainer.innerHTML = titleText;
  }

  handleGameOver() {
    if (this.gameState !== 'playing') return;

    this.gameState = 'gameOver';
    console.log('DEAD AGAIN');
    this.loadLevel(this.currentLevelIndex);
  }

  handleJoystickMove(dx, dy) {
    this.player.physics.applyJoystickInput(dx, dy);
  }

  calculateDistance(start, end) {
    return [new THREE.Vector2(
      start.x,
      start.z
    ).distanceTo(
      new THREE.Vector2(
        end.x,
        end.z
      )
    ),
    Math.abs(start.y - end.y)];
  }

  incrementLevel() {
    this.currentLevelIndex++;
    this.loadLevel(this.currentLevelIndex);
  }

  handleLevelCompletion() {
    this.incrementLevel();
  }

  animate = () => {
    if (this.gameState !== 'playing') return;
    this.world.step(this.fixedTimeStep);
    this.player.update();
    this.cameraController.update(this.player);
    this.renderer.render(this.scene, this.cameraController.camera);
    requestAnimationFrame(this.animate);
  }
}
