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
    this.currentLevelDisplay = 1;
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
    this.player = new Player(this.currentLevel.firstPlatform);
    this.scene.add(this.player.mesh);
  }

  initPlayerPhysics() {
    this.playerPhysics = new PlayerPhysics(this.world.gravity, this.player);
    this.world.addBody(this.playerPhysics.body);
  }

  initCamera() {
    this.cameraController = new Camera();
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
    this.gameState = GAME_STATES.PLAYING;
    this.timer.start();
    document.body.appendChild(this.renderer.domElement);
    this.animate();
  }

  handleCollision = (event) => {
    if (!this.gameState === GAME_STATES.PLAYING) return;
    let that = this;
    setTimeout(function() {
      let collidedBody = event.contact.bi === that.playerPhysics.body ? event.contact.bj : event.contact.bi;
      if (collidedBody.type === 1) return that.playerPhysics.handleGroundCollision();
      if (collidedBody.type === 2) return that.handleLevelCompletion();
    }, 0);
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

    if (this.currentLevel) {
      this.currentLevel.objects.forEach(p => {
        this.world.remove(p.body);
        this.scene.remove(p.mesh);
      });
      this.currentlevel = [];
      this.world.clearForces();
      this.initLevel(callback);
    }
    else {
      this.initLevel(callback);
    }
  }

  initLevel(callback) {
    let levelData = this.levels[this.currentLevelIndex];
    this.currentLevel = new Level();
    this.currentLevel.loadLevel(levelData, (firstPlatform) => {
      this.currentLevel.objects.forEach(p => {
        this.scene.add(p.mesh);
        this.world.add(p.body);
      });
      this.loadBackground(levelData);
      this.loadTitle(levelData.name, this.currentLevelDisplay);
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
    const minutes = Math.floor(this.timer.time / 60).toString().padStart(2, '0');
    const seconds = (this.timer.time % 60).toString().padStart(2, '0');
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
    this.resetPlayer(this.currentLevel.firstPlatform.mesh.position);
    this.gameState = GAME_STATES.PLAYING;
    this.world.clearForces();
  }

  handleLevelCompletion() {
    if (!this.gameState === GAME_STATES.PLAYING) return;
    this.gameState = GAME_STATES.LEVEL_COMPLETE;
    this.currentLevelIndex++;
    this.currentLevelDisplay++;
    this.player.reset(this.currentLevel.finalPlatform.mesh.position);
    if (this.checkGameCompletion()) {
      this.handleGameCompletion();
    } else {
      this.world.remove(this.playerPhysics.body);
      this.scene.remove(this.player.mesh);
      this.loadLevel((firstPlatformPosition) => {
        this.resetPlayer(firstPlatformPosition);
        this.updateDeltaTime();
        this.renderer.render(this.scene, this.cameraController.camera);
        this.world.addBody(this.playerPhysics.body);
        this.world.step(this.deltaTime);
        this.scene.add(this.player.mesh);
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
    this.deltaTime = Math.min((now - this.lastTime) / 1000, 0.01);
    this.lastTime = now;
  }

  animate = () => {
    if (this.gameState !== GAME_STATES.PLAYING) return;
    if (this.checkGameOver()) this.handleGameOver();
    this.updateDeltaTime();
    this.currentLevel.update(this.deltaTime);
    this.playerPhysics.update(this.deltaTime);
    this.lights.update(this.player.mesh.position);
    this.cameraController.update(this.player.mesh.position);
    this.world.step(this.deltaTime);
    this.renderer.render(this.scene, this.cameraController.camera);
    requestAnimationFrame(this.animate);
  }
}
