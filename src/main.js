import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Player } from './classes/Player';
import { Level } from './classes/Level';
import level1 from '../levels/1.json';

class Game {
    constructor() {
        this.init();
    }

    async init() {
        // Basic Three.js and Cannon.js setup...
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);

        // Player setup
        this.player = new Player(this.scene, this.world);

        this.currentLevel = new Level(this.scene, this.world);
        this.currentLevel.loadLevel(level1);

        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.world.step(1 / 60);
        this.player.update();
        this.renderer.render(this.scene, this.camera);
    }
}

new Game();
