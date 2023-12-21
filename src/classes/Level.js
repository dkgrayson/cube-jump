  import { Platform } from './Platform';

  export class Level {
    constructor(scene, world) {
      this.scene = scene;
      this.world = world;
      this.objects = [];
      this.firstPlatform = null;
      this.finalPlatform = null;
    }

    loadLevel(data, callback) {
      this.clearLevel();
      this.loadPlatforms(data.platforms, data.platformColor, callback);
    }

    loadPlatforms(platforms, color, callback) {
      platforms.forEach(p => {
        let platform = new Platform(this.scene, this.world, p, color);
        this.objects.push(platform);
        if (p.isFinal) this.finalPlatform = platform;
        if (p.isFirst) this.firstPlatform = platform;
      });
      if (callback) callback(this.firstPlatform);
    }

    clearLevel() {
      this.objects.forEach(obj => {
        if (obj.mesh) this.scene.remove(obj.mesh);
        if (obj.body) this.world.removeBody(obj.body);
      });
      this.objects = [];
    }

    update(deltaTime) {
      this.objects.forEach( o => { o.update(deltaTime); } );
    }
  }
