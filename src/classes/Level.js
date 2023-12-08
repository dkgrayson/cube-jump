import { Platform } from './Platform';

export class Level {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
    }

    loadLevel(levelData) {
        levelData.platforms.forEach(p => {
            new Platform(this.scene, this.world, p.x, p.y, p.z, p.width, p.depth);
        });
        // Add logic for other elements like enemies, collectibles, etc.
    }
}
