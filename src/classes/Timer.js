export class Timer {
  constructor() {
    this.time = 0;
    this.interval = null;
  }

  start() {
    this.updateTimerDisplay();
    this.interval = setInterval(() => {
      this.time++;
      this.updateTimerDisplay();
    }, 1000);
  }

  stop() {
    clearInterval(this.interval);
  }

  reset() {
    this.stop();
    this.time = 0;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.time / 60).toString().padStart(2, '0');
    const seconds = (this.time % 60).toString().padStart(2, '0');
    document.querySelector('.timer').innerText = `Time: ${minutes}:${seconds}`;
  }
}
