// Soft, Warm & Pleasant Audio Manager using Web Audio API

class AudioManager {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('game_muted') === 'true';
        this.globalVolume = 0.45; // Gentle baseline volume
        this.currentBGM = null;
    }

    setMuted(mute) {
        this.muted = mute;
        localStorage.setItem('game_muted', mute ? 'true' : 'false');
        const menuAudio = document.getElementById('bgm-menu');
        const gameAudio = document.getElementById('bgm-game');

        if (mute) {
            if (menuAudio) menuAudio.pause();
            if (gameAudio) gameAudio.pause();
        } else {
            if (this.currentBGM) this.playBGM(this.currentBGM);
        }
    }

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }

    playBGM(trackName) {
        const menuAudio = document.getElementById('bgm-menu');
        const gameAudio = document.getElementById('bgm-game');
        if (!menuAudio || !gameAudio) return;

        menuAudio.volume = 0.35 * this.globalVolume;
        gameAudio.volume = 0.35 * this.globalVolume;

        if (trackName === 'menu') {
            if (this.currentBGM !== 'menu' || menuAudio.paused) {
                gameAudio.pause();
                if (!this.muted) menuAudio.play().catch(() => {});
                this.currentBGM = 'menu';
            }
        } else if (trackName === 'game') {
            if (this.currentBGM !== 'game' || gameAudio.paused) {
                menuAudio.pause();
                if (!this.muted) gameAudio.play().catch(() => {});
                this.currentBGM = 'game';
            }
        } else {
            menuAudio.pause();
            gameAudio.pause();
            this.currentBGM = null;
        }
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    // Warm, bouncy jump sound (Soft sine wave pitch-glide)
    playJump() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine'; // Soft, warm sine wave instead of harsh square
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

        gain.gain.setValueAtTime(0.20 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Soft, sweet marimba/chime collect sound (No harsh high-pitched dings!)
    playCoin() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        // Gentle two-tone chord (E5 -> A5) - warm and comforting
        const notes = [
            { freq: 659.25, time: 0, dur: 0.15, vol: 0.18 }, // E5
            { freq: 880.00, time: 0.04, dur: 0.18, vol: 0.20 } // A5
        ];

        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.freq, now + n.time);

            gain.gain.setValueAtTime(n.vol * this.globalVolume, now + n.time);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + n.time);
            osc.stop(now + n.time + n.dur);
        });
    }

    // Soft magical harp arpeggio for star key / powerups
    playStar() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.045;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.16 * this.globalVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.16);
        });
    }

    // Soft thud / pop for taking damage (Not harsh sawtooth buzz)
    playHurt() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle'; // Softer than sawtooth
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.20);

        gain.gain.setValueAtTime(0.25 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.20);
    }

    // Gentle celebration chime for winning level
    playWin() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.07;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.20 * this.globalVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    // Soft game over melody
    playGameOver() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [392.00, 349.23, 329.63, 261.63]; // G4, F4, E4, C4
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.12;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.18 * this.globalVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.25);
        });
    }

    // Deep boss rumble
    playBossRoar() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);

        gain.gain.setValueAtTime(0.30 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
    }

    playBossHit() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);

        gain.gain.setValueAtTime(0.35 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    playBossJump() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);

        gain.gain.setValueAtTime(0.22 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }
}

const audio = new AudioManager();
