import { Platform } from './Platform';

export class Level {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.objects = [];
    this.firstPlatform = null;
    this.finalPlatform = null;
  }

  loadLevel(levelData) {
    this.clearLevel();

    levelData.platforms.forEach(p => {
      const platform = new Platform(this.scene, this.world, p, levelData.platformColor);
      this.objects.push(platform);
      if (p.isFinal) this.finalPlatform = platform;
      if (p.isFirst) this.firstPlatform = platform;
    });
  }

  clearLevel() {
    this.objects.forEach(obj => {
      if (obj.mesh) this.scene.remove(obj.mesh);
      if (obj.body) this.world.removeBody(obj.body);
    });
    this.objects = [];
  }
}
