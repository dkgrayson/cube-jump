export class Joystick {
  constructor(callback) {
    this.joystickContainer = document.getElementById('joystick-container');
    this.joystick = document.getElementById('joystick');
    this.startPosition = { x: 0, y: 0 };
    this.currentPosition = { x: 0, y: 0 };
    this.isTouching = false;
    this.onMove = callback;

    this.joystickContainer.addEventListener('touchstart', this.handleStart.bind(this), false);
    this.joystickContainer.addEventListener('touchmove', this.handleMove.bind(this), false);
    this.joystickContainer.addEventListener('touchend', this.handleEnd.bind(this), false);
  }

  handleStart(event) {
    this.isTouching = true;
    this.startPosition = {
      x: event.touches[0].clientX - this.joystickContainer.offsetLeft,
      y: event.touches[0].clientY - this.joystickContainer.offsetTop
    };
    this.joystick.style.transition = '0s';
  }

  handleMove(event) {
    if (!this.isTouching) return;
    this.currentPosition = {
      x: event.touches[0].clientX - this.joystickContainer.offsetLeft,
      y: event.touches[0].clientY - this.joystickContainer.offsetTop
    };

    const dx = this.currentPosition.x - this.startPosition.x;
    const dy = this.currentPosition.y - this.startPosition.y;
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 50);
    const angle = Math.atan2(dy, dx);

    this.joystick.style.transform = `translate(${distance * Math.cos(angle)}px, ${distance * Math.sin(angle)}px)`;

    if (this.onMove) this.onMove(dx, dy);
  }

  handleEnd() {
    this.isTouching = false;
    this.joystick.style.transition = '0.2s';
    this.joystick.style.transform = 'translate(0px, 0px)';
    if (this.onMove) this.onMove(0, 0);
  }
}
