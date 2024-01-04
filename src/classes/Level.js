  import { Platform } from './Platform';

  export class Level {
    constructor() {
      this.objects = [];
      this.firstPlatform = null;
      this.finalPlatform = null;
    }

    loadLevel(data, callback) {
      data.platforms.forEach(p => {
        let platform = new Platform(p, data.platformColor);
        this.objects.push(platform);
        if (p.isFinal) this.finalPlatform = platform;
        if (p.isFirst) this.firstPlatform = platform;
      });
      if (callback) callback(this.firstPlatform);
    }

    update(deltaTime, playerPosition) {
      this.objects.forEach( o => { o.update(deltaTime, playerPosition); } );
    }
  }
