import { Game } from './classes/Game.js'
import './styles/app.css';
let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Game();
});
