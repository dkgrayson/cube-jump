import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Player } from './classes/Player';
import { Level } from './classes/Level';
import { Camera } from './classes/Camera';
import level1 from '../levels/1.json';

class Game {
    constructor() {
        this.init();
    }

    init() {
        this.initScene();
        this.initCamera();
        this.initRedender();
        this.loadLevel(level1);
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.player = new Player(this.scene, this.world);
    }

    initCamera() {
        this.cameraController = new Camera();
    }

    initRedender() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.innerHTML = '';
        document.body.appendChild(this.renderer.domElement);
    }

    loadLevel(level) {
        this.currentLevel = new Level(this.scene, this.world);
        this.currentLevel.loadLevel(level);
        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.world.step(1 / 60);
        this.player.update();
        this.cameraController.update(this.player);
        this.renderer.render(this.scene, this.cameraController.camera);
    }
}

new Game();
