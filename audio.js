// Retro Sound Synthesizer using Web Audio API
class AudioManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.volume = 0.8; // Default 80% Volume Level
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
    }

    playJump() {
        if (this.muted || this.volume <= 0) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(175, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.13);

        const v = 0.18 * this.volume;
        gain.gain.setValueAtTime(v, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.13);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.13);
    }

    playCoin() {
        if (this.muted || this.volume <= 0) return;
        this.init();
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
        osc1.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.07); // E6

        osc2.frequency.setValueAtTime(1975.53, this.ctx.currentTime); // B6
        osc2.frequency.setValueAtTime(2637.02, this.ctx.currentTime + 0.07); // E7

        const v = 0.22 * this.volume;
        gain.gain.setValueAtTime(v, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 0.22);
        osc2.stop(this.ctx.currentTime + 0.22);
    }

    playStar() {
        if (this.muted || this.volume <= 0) return;
        this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

            const v = 0.2 * this.volume;
            gain.gain.setValueAtTime(v, this.ctx.currentTime + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.05 + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.05);
            osc.stop(this.ctx.currentTime + idx * 0.05 + 0.12);
        });
    }

    playHurt() {
        if (this.muted || this.volume <= 0) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.25);

        const v = 0.35 * this.volume;
        gain.gain.setValueAtTime(v, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playWin() {
        if (this.muted || this.volume <= 0) return;
        this.init();
        const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // Fanfare
        arpeggio.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

            const v = 0.25 * this.volume;
            gain.gain.setValueAtTime(v, this.ctx.currentTime + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.08);
            osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
        });
    }

    playGameOver() {
        if (this.muted) return;
        this.init();
        const notes = [300, 260, 220, 150];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);

            gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.15);
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.15 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.15);
            osc.stop(this.ctx.currentTime + idx * 0.15 + 0.2);
        });
    }
}

const audio = new AudioManager();
