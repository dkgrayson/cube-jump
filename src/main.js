import { Game } from './classes/Game.js'
import './styles/app.css';
import level1 from './levels/1.json';
import level2 from './levels/2.json';
import level3 from './levels/3.json';
import level4 from './levels/4.json';
import level5 from './levels/5.json';
import level6 from './levels/6.json';
import level7 from './levels/7.json';
import level8 from './levels/8.json';
import level9 from './levels/9.json';
import level10 from './levels/10.json';
import level11 from './levels/11.json';
import level12 from './levels/12.json';
import level13 from './levels/13.json';
import level14 from './levels/14.json';
import level15 from './levels/15.json';
import level16 from './levels/16.json';
let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  let levels = [
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
    ];
  _APP = new Game(levels);
});
