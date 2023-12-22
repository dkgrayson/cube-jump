import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Player } from './Player';
import { Level } from './Level';
import { Camera } from './Camera';
import { Joystick } from './Joystick';
import { PlayerPhysics } from './PlayerPhysics';
import { Light } from './Light';
import { Timer } from './Timer';
import { getTime } from './Helpers';

const GAME_STATES = {
  STARTING: 'starting',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver',
  LEVEL_COMPLETE: 'levelComplete',
  WIN: 'win'
};


export class Game {
  constructor(levels) {
    this.levels = levels;
    this.currentLevelIndex = 0;
    this.gameState = GAME_STATES.STARTING;
    this.loadingLevel = false;
    this.lastTime = performance.now();
    this.deltaTime = 0;
    this.deaths = 0;
    this.waitForStart();
  }

  initGame() {
    this.initScene();
    this.initWorld();
    this.initRendender();
    this.initCamera();
    this.initJoystick();
    this.loadLevel();
    this.initPlayer();
    this.initPlayerPhysics();
    this.initLights();
    this.initTimer();
    this.initListeners();
    this.startGame();
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
    this.playerPhysics.body.sleep();
    this.world.addBody(this.playerPhysics.body);
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
  }

  initLights() {
    this.lights = new Light(this.player.mesh);
    this.scene.add(this.lights.directionalLight);
  }

  initListeners() {
    this.playerPhysics.body.addEventListener('collide', this.handleCollision);
  }

  initTimer() {
    this.timer = new Timer();
  }

  startGame() {
    this.playerPhysics.body.wakeUp();
    this.gameState = GAME_STATES.PLAYING;
    this.timer.start();
    document.body.appendChild(this.renderer.domElement);
    this.animate();
  }

  handleCollision = (event) => {
    if (!this.gameState === GAME_STATES.PLAYING) return;
    let collidedBody = event.contact.bi === this.playerPhysics.body ? event.contact.bj : event.contact.bi;
    if (collidedBody.type === 2) this.playerPhysics.handleGroundCollision();
    if (collidedBody.type === 4) this.handleLevelCompletion();
  }

  waitForStart() {
    document.getElementById('start').addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('intro').style.display = 'none';
      this.initGame();
    });
  }

  loadLevel(callback) {
    if (this.loadingLevel) return;
    this.loadingLevel = true;

    if (this.currentLevel) this.currentLevel.clearLevel();

    let levelData = this.levels[this.currentLevelIndex];
    this.currentLevel = new Level(this.scene, this.world);
    this.currentLevel.loadLevel(levelData, (firstPlatform) => {
      this.loadBackground(levelData);
      this.loadTitle(levelData.name, this.currentLevelIndex + 1);
      this.loadingLevel = false;
      if (callback) callback(firstPlatform);
    });
  }

  loadBackground(data) {
    if (!data.background) return;
    let bgColor = parseInt(data.background, 16);
    this.scene.background = new THREE.Color(bgColor);
  }

  loadOutro() {
    let time = document.getElementById('stats-time');
    let deaths = document.getElementById('stats-deaths');
    let [minutes, seconds] = getTime(this.timer.time);
    time.innerText = `Total Time: ${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    deaths.innerText = `Total Deaths: ${this.deaths}`
    document.getElementById('outro').classList.add('active');
  }

  loadTitle(name, number) {
    let titleContainer = document.querySelector('.level');
    let titleText = `Level ${number}: ${name}`;
    titleContainer.innerHTML = titleText;
  }

  handleJoystickMove(dx, dy) {
    if (!this.gameState === GAME_STATES.PLAYING) return;
    this.playerPhysics.applyJoystickInput(dx, dy);
  }

  handleGameOver() {
    if (!this.gameState === GAME_STATES.PLAYING) return;
    this.gameState = GAME_STATES.GAME_OVER;
    this.deaths++;
    this.updateDeathsDisplay();
    this.loadLevel((firstPlatformPosition) => {
        this.resetPlayer(firstPlatformPosition);
        this.gameState = GAME_STATES.PLAYING;
      });
  }

  handleLevelCompletion() {
    if (!this.gameState === GAME_STATES.PLAYING) return;
    this.gameState = GAME_STATES.LEVEL_COMPLETE;
    this.currentLevelIndex++;
    if (this.checkGameCompletion()) {
      this.handleGameCompletion();
    } else {
      this.loadLevel((firstPlatformPosition) => {
        this.resetPlayer(firstPlatformPosition);
        this.gameState = GAME_STATES.PLAYING;
      });
    }
  }

  resetPlayer(platform) {
    this.player.reset(platform);
    this.playerPhysics.reset(platform);
  }

  handleGameCompletion() {
    if (!this.gameState === GAME_STATES.PLAYING) return;
    this.gameState = GAME_STATES.WIN;
    this.timer.stop();
    this.loadOutro();
  }

  checkGameOver() {
    return this.player.mesh.position.y < this.currentLevel.firstPlatform.y - 20;
  }

  checkGameCompletion() {
    return this.currentLevelIndex >= this.levels.length;
  }

  updateDeathsDisplay() {
    document.querySelector('.deaths').innerText = `Deaths: ${this.deaths}`;
  }

  updateDeltaTime() {
    const now = performance.now();
    this.deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
  }

  animate = () => {
    if (this.gameState !== GAME_STATES.PLAYING) return;
    if (this.checkGameOver()) this.handleGameOver();
    this.updateDeltaTime();
    this.playerPhysics.update(this.deltaTime);
    this.lights.update(this.player.mesh.position);
    this.cameraController.update(this.player);
    this.currentLevel.update(this.deltaTime);
    this.world.step(this.deltaTime);
    this.renderer.render(this.scene, this.cameraController.camera);
    requestAnimationFrame(this.animate);
  }
}
