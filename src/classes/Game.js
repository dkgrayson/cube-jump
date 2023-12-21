import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Player } from './Player';
import { Level } from './Level';
import { Camera } from './Camera';
import { Joystick } from './Joystick';
import { PlayerPhysics } from './PlayerPhysics';
import { Light } from './Light';
import { getTime } from './Helpers';
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
import level16 from '../../levels/16.json';

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
      level15,
      level16
    ]; //TODO: Move everything for levels to level class
    this.currentLevelIndex = 0;
    this.gameState = 'starting';
    this.loadingLevel = false;
    this.lastTime = performance.now();
    this.timer = 0;
    this.timerInterval = null;
    this.deaths = 0;
    this.waitForStart();
  }

  initGame() {
    this.initScene();
    this.initWorld();
    this.initRendender();
    this.initCamera();
    this.initJoystick();
    this.loadLevel(this.currentLevelIndex);
    this.initPlayer();
    this.initPlayerPhysics();
    this.initLights();
    this.initListeners();
    this.startTimer();
    this.animate();
  }

  initJoystick() {
    this.joystick = new Joystick(this.handleJoystickMove.bind(this));
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog( 0xcccccc, 10, 50 );
    this.scene.background = new THREE.Color(0xF98D8D);
  }

  initWorld() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
  }

  initPlayer() {
    this.player = new Player(this.scene, this.world, this, this.currentLevel.firstPlatform);
    this.scene.add(this.player.mesh);
  }

  initPlayerPhysics() {
    this.playerPhysics = new PlayerPhysics(this.world, this.player);
  }

  initCamera() {
    let canvas = this.renderer.domElement;
    this.cameraController = new Camera(canvas);
  }

  initRendender() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
  }

  initLights() {
    this.lights = new Light(this.player.mesh);
    this.scene.add(this.lights.directionalLight);
  }

  initListeners() {
    this.playerPhysics.body.addEventListener('collide', this.handleCollision);
  }

  handleCollision = (event) => {
    let collidedBody = event.contact.bi === this.playerPhysics.body ? event.contact.bj : event.contact.bi;
    if (collidedBody.type === 2 || collidedBody.type === 4) this.playerPhysics.handleGroundCollision();
    if (collidedBody.type === 4) this.handleLevelCompletion();
  }

  waitForStart() {
    document.getElementById('start').addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('intro').style.display = 'none';
      this.initGame();
    });
  }

  startTimer() {
    this.gameState = 'playing';
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

  updateDeathsDisplay() {
    document.querySelector('.deaths').innerText = `Deaths: ${this.deaths}`;
  }

  loadLevel(levelIndex) {
    if (this.loadingLevel) return;
    this.loadingLevel = true;

    if (levelIndex >= this.levels.length) {
      this.gameState = 'win';
      this.stopTimer();
      this.loadOutro();
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
    this.loadingLevel = false;
  }

  loadOutro() {
    let time = document.getElementById('stats-time');
    let deaths = document.getElementById('stats-deaths');
    let [minutes, seconds] = this.getTime(this.timer);
    time.innerText = `Total Time: ${minutes}:${seconds}`;
    deaths.innerText = `Total Deaths: ${this.deaths}`
    document.getElementById('outro').classList.add('active');
  }

  loadTitle(name, number) {
    let titleContainer = document.querySelector('.level');
    let titleText = `Level ${number}: ${name}`;
    titleContainer.innerHTML = titleText;
  }

  handleGameOver() {
    if (this.gameState !== 'playing') return;
    this.gameState = 'gameOver';
    this.deaths++;
    this.updateDeathsDisplay();
    this.loadLevel(this.currentLevelIndex);
    this.player.reset(this.currentLevel.firstPlatform);
    this.playerPhysics.reset();
    this.gameState = 'playing';
  }

  handleJoystickMove(dx, dy) {
    this.playerPhysics.applyJoystickInput(dx, dy);
  }

  handleLevelCompletion() {
    this.currentLevelIndex++;
    this.loadLevel(this.currentLevelIndex);
    this.player.reset(this.currentLevel.firstPlatform);
    this.playerPhysics.reset();
  }

  checkGameOver() {
    return this.player.mesh.position.y < this.currentLevel.firstPlatform.y - 20;
  }

  animate = () => {
    if (this.gameState !== 'playing') return;
    if (this.checkGameOver()) this.handleGameOver();

    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.world.step(deltaTime);
    this.playerPhysics.update(deltaTime);
    this.lights.update(this.player.mesh.position);
    this.cameraController.update(this.player);
    if (this.currentLevel && this.currentLevel.objects && this.currentLevel.objects.length > 0) {
      this.currentLevel.objects.forEach( o => { o.update(deltaTime); } );
    }
    this.renderer.render(this.scene, this.cameraController.camera);
    requestAnimationFrame(this.animate);
  }
}
