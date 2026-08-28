// Soft, Warm & Pleasant Audio Manager using Web Audio API + Thematic Procedural Soundtrack Engine

class AudioManager {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('game_muted') === 'true';
        this.globalVolume = 0.45; // Gentle baseline volume
        this.musicVolume = 0.40;
        this.currentBGM = null;
        this.synthBgmInterval = null;
        this.synthBgmStartTime = 0;
        this.synthBgmTrack = null;
        this.bgmGainNode = null;
    }

    setMusicVolume(vol) {
        this.musicVolume = vol;
        if (this.bgmGainNode && this.ctx) {
            this.bgmGainNode.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * this.globalVolume, this.ctx.currentTime);
        }
        const menuAudio = document.getElementById('bgm-menu');
        const gameAudio = document.getElementById('bgm-game');
        if (menuAudio) menuAudio.volume = 0.35 * this.globalVolume * this.musicVolume;
        if (gameAudio) gameAudio.volume = 0.35 * this.globalVolume * this.musicVolume;
    }

    setMuted(mute) {
        this.muted = mute;
        localStorage.setItem('game_muted', mute ? 'true' : 'false');
        if (this.bgmGainNode && this.ctx) {
            this.bgmGainNode.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * this.globalVolume, this.ctx.currentTime);
        }
        const menuAudio = document.getElementById('bgm-menu');
        const gameAudio = document.getElementById('bgm-game');

        if (mute) {
            if (menuAudio) menuAudio.pause();
            if (gameAudio) gameAudio.pause();
            this.stopSynthBGM();
        } else {
            if (this.currentBGM) this.playBGM(this.currentBGM);
        }
    }

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.masterBgmGain = this.ctx.createGain();
            this.masterBgmGain.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * this.globalVolume, this.ctx.currentTime);
            this.masterBgmGain.connect(this.ctx.destination);
            this.currentSessionGain = null;
            this.trackSessionId = 0;
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    pauseBGM() {
        if (this.masterBgmGain && this.ctx) {
            this.masterBgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        const menuAudio = document.getElementById('bgm-menu');
        const gameAudio = document.getElementById('bgm-game');
        if (menuAudio) menuAudio.pause();
        if (gameAudio) gameAudio.pause();
    }

    resumeBGM() {
        if (this.muted) return;
        if (this.masterBgmGain && this.ctx) {
            this.masterBgmGain.gain.setValueAtTime(this.musicVolume * this.globalVolume, this.ctx.currentTime);
        }
        if (this.currentBGM === 'menu') {
            const menuAudio = document.getElementById('bgm-menu');
            if (menuAudio && menuAudio.paused) menuAudio.play().catch(() => {});
        }
    }

    // Smooth tape-stop / volume fade-out when player dies
    fadeBGMOut(dur = 0.40) {
        if (this.currentSessionGain && this.ctx) {
            const now = this.ctx.currentTime;
            const cur = this.currentSessionGain;
            cur.gain.setValueAtTime(cur.gain.value, now);
            cur.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        }
        const menuAudio = document.getElementById('bgm-menu');
        const gameAudio = document.getElementById('bgm-game');
        if (menuAudio) menuAudio.pause();
        if (gameAudio) gameAudio.pause();

        if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
        this.fadeTimeout = setTimeout(() => {
            this.stopSynthBGM();
            this.fadeTimeout = null;
        }, dur * 1000);
    }

    // Completely isolates and immediately stops all scheduled notes of the previous song
    stopSynthBGM() {
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }
        if (this.synthBgmInterval) {
            clearInterval(this.synthBgmInterval);
            this.synthBgmInterval = null;
        }
        this.trackSessionId = (this.trackSessionId || 0) + 1;
        if (this.currentSessionGain && this.ctx) {
            const oldGain = this.currentSessionGain;
            const now = this.ctx.currentTime;
            try {
                oldGain.gain.setValueAtTime(oldGain.gain.value, now);
                oldGain.gain.linearRampToValueAtTime(0.0001, now + 0.03);
                setTimeout(() => {
                    try { oldGain.disconnect(); } catch(e) {}
                }, 50);
            } catch(e) {
                try { oldGain.disconnect(); } catch(err) {}
            }
            this.currentSessionGain = null;
        }
        this.synthBgmTrack = null;
        this.currentBGM = null;
    }

    playBGM(trackName) {
        this.playThematicBGM(trackName);
    }

    // Dynamic Thematic BGM Switcher with Zero Track Bleed / Instant Clean Crossfade
    playThematicBGM(trackName) {
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }

        const menuAudio = document.getElementById('bgm-menu');
        const gameAudio = document.getElementById('bgm-game');

        if (!trackName) {
            if (menuAudio) menuAudio.pause();
            if (gameAudio) gameAudio.pause();
            this.stopSynthBGM();
            this.currentBGM = null;
            return;
        }

        if (this.currentBGM === trackName && (this.synthBgmInterval || (trackName === 'menu' && menuAudio && !menuAudio.paused))) {
            return;
        }

        this.init();
        // Immediately silence and disconnect previous track before starting new track
        this.stopSynthBGM();
        this.currentBGM = trackName;

        if (trackName === 'menu') {
            if (gameAudio) gameAudio.pause();
            if (menuAudio && !this.muted) {
                menuAudio.currentTime = 0;
                menuAudio.volume = 0.35 * this.globalVolume * this.musicVolume;
                menuAudio.play().catch(() => {});
            }
            return;
        }

        // Stop standard HTML audio when entering procedural atmospheric worlds
        if (menuAudio) menuAudio.pause();
        if (gameAudio) gameAudio.pause();
        this.startProceduralOST(trackName);
    }

    // =========================================================================
    // MULTI-SECTION PROCEDURAL SOUNDTRACK SEQUENCER (Session-Isolated)
    // =========================================================================
    startProceduralOST(trackName) {
        this.stopSynthBGM();
        if (this.muted) return;
        this.init();

        // Always ensure Master BGM Gain is unmuted and set to current volume
        if (this.masterBgmGain && this.ctx) {
            this.masterBgmGain.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * this.globalVolume, this.ctx.currentTime);
        }

        this.trackSessionId = (this.trackSessionId || 0) + 1;
        const thisSessionId = this.trackSessionId;

        // Create dedicated isolated GainNode for this specific song session
        this.currentSessionGain = this.ctx.createGain();
        this.currentSessionGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.currentSessionGain.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + 0.05); // Smooth 50ms entrance
        this.currentSessionGain.connect(this.masterBgmGain);

        this.synthBgmTrack = trackName;
        
        let bpm = 115;
        if (trackName === 'boss') bpm = 144;
        else if (trackName.startsWith('world2_inferno')) bpm = 136;
        else if (trackName.startsWith('world2')) bpm = 130;
        else if (trackName.startsWith('world3_amethyst')) bpm = 118;
        else if (trackName.startsWith('world3')) bpm = 122;
        else if (trackName.startsWith('world4_neon')) bpm = 132;
        else if (trackName.startsWith('world4')) bpm = 126;
        else if (trackName.startsWith('world5_supernova')) bpm = 120;
        else if (trackName.startsWith('world5')) bpm = 114;
        else if (trackName.startsWith('world1_twilight')) bpm = 108;
        else if (trackName.startsWith('world1_castle')) bpm = 120;

        const beatSec = 60 / bpm;
        const stepSec = beatSec / 4; // 16th note resolution
        const totalBars = (trackName === 'boss') ? 48 : 64; // Rich 48 to 64 measures loop
        const totalSteps = totalBars * 16;

        let lastScheduledStep = -1;
        this.synthBgmStartTime = this.ctx.currentTime;

        const scheduleUpcomingNotes = () => {
            if (!this.ctx || this.muted || this.trackSessionId !== thisSessionId || !this.currentSessionGain) return;
            const now = this.ctx.currentTime;
            const elapsed = now - this.synthBgmStartTime;
            const currentGlobalStep = Math.floor(elapsed / stepSec);

            // Tight lookahead of 0.4 seconds to eliminate track overlap / latency
            const lookAheadSteps = Math.ceil(0.40 / stepSec);
            for (let step = lastScheduledStep + 1; step <= currentGlobalStep + lookAheadSteps; step++) {
                if (this.trackSessionId !== thisSessionId) break;
                const stepTime = this.synthBgmStartTime + (step * stepSec);
                const loopStep = step % totalSteps;
                this.renderTrackStep(trackName, loopStep, stepTime, stepSec, this.currentSessionGain);
            }
            lastScheduledStep = currentGlobalStep + lookAheadSteps;
        };

        scheduleUpcomingNotes();
        this.synthBgmInterval = setInterval(scheduleUpcomingNotes, 120);
    }

    renderTrackStep(trackName, step, time, stepSec, sessionGain) {
        const bar = Math.floor(step / 16);
        const beat = Math.floor((step % 16) / 4);
        const sub = step % 4;
        const section = Math.floor(bar / 16);

        if (trackName === 'boss') {
            if (sub === 0 || (section === 2 && beat === 2 && sub === 2)) {
                this.synthDrumKick(time, 140, 38, 0.28, 0.45, sessionGain);
            }
            if (((beat === 1 || beat === 3) && sub === 0) || (bar % 8 === 7 && beat === 3 && sub >= 2)) {
                this.synthDrumSnare(time, 0.22, 0.35, sessionGain);
            }
            if (sub === 0 || sub === 2) {
                this.synthDrumHiHat(time, sub === 0 ? 0.08 : 0.04, sessionGain);
            }
            const bossRoots = [73.42, 73.42, 87.31, 98.00, 73.42, 73.42, 116.54, 110.00, 65.41, 73.42, 87.31, 98.00, 110.00, 116.54, 130.81, 73.42];
            const currentRoot = bossRoots[bar % bossRoots.length];
            if (sub === 0 || sub === 2 || (sub === 3 && beat === 3)) {
                this.synthBassNote(time, currentRoot * (sub === 2 ? 1.5 : 1), stepSec * 1.6, 'sawtooth', 0.22, sessionGain);
            }
            if ((beat === 0 && sub === 0) || (beat === 2 && sub === 2)) {
                const tensionChord = (section === 1) 
                    ? [currentRoot * 2, currentRoot * 2.4, currentRoot * 2.83, currentRoot * 3.56]
                    : [currentRoot * 2, currentRoot * 2.4, currentRoot * 3];
                this.synthChord(time, tensionChord, stepSec * 2.5, 'triangle', 0.16, sessionGain);
            }
        } else if (trackName.startsWith('world2')) {
            // === WORLD 2: MAGMA CAVERNS / INFERNO (Extended 64-Bar Volcanic Suite) ===
            const isInferno = trackName.includes('inferno');
            if (sub === 0 || (section >= 1 && beat === 2 && sub === 2)) this.synthDrumKick(time, 125, 35, 0.24, 0.38, sessionGain);
            if ((beat === 1 || beat === 3) && sub === 0) this.synthDrumSnare(time, 0.18, 0.30, sessionGain);
            if (sub === 2 || (isInferno && sub === 1)) this.synthDrumHiHat(time, 0.05, sessionGain);
            
            // Extended 16-Bar Heavy Harmonic Roots
            const magmaRoots = [
                65.41, 65.41, 77.78, 87.31, 65.41, 65.41, 98.00, 87.31,
                58.27, 65.41, 77.78, 87.31, 98.00, 87.31, 77.78, 65.41
            ];
            const root = magmaRoots[bar % magmaRoots.length];
            if (sub === 0 || sub === 3 || (section >= 1 && sub === 1)) {
                this.synthBassNote(time, root, stepSec * 2.2, 'sawtooth', 0.19, sessionGain);
            }
            if (beat === 0 && sub === 0) {
                this.synthPad(time, [root * 2, root * 2.38, root * 2.83, root * 3.36], stepSec * 12, 0.13, sessionGain);
            }
            // Long Evolving Lava Melody Lead (32 Notes)
            const lavaMelody = [
                261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 466.16, 392.00,
                349.23, 392.00, 466.16, 523.25, 622.25, 523.25, 466.16, 392.00,
                311.13, 349.23, 392.00, 466.16, 523.25, 622.25, 698.46, 622.25,
                523.25, 466.16, 392.00, 349.23, 311.13, 293.66, 261.63, 311.13
            ];
            if ((section === 1 || section === 3 || isInferno) && (sub === 0 || sub === 2)) {
                const note = lavaMelody[(bar * 2 + beat) % lavaMelody.length];
                this.synthArpNote(time, note, stepSec * 1.5, 0.10, sessionGain);
            }
        } else if (trackName.startsWith('world3')) {
            // === WORLD 3: SPECTRAL VOID / AMETHYST HOLLOW (Extended 64-Bar Nocturne) ===
            const isAmethyst = trackName.includes('amethyst') || trackName.includes('sanctum');
            if (sub === 0 || (section === 1 && beat === 2 && sub === 2)) this.synthDrumKick(time, 118, 42, 0.22, 0.35, sessionGain);
            if (beat === 2 && sub === 0) this.synthDrumSnare(time, 0.16, 0.25, sessionGain);
            if (sub === 1 || sub === 3) this.synthDrumHiHat(time, 0.04, sessionGain);

            // Extended 16-Bar Spectral Progression
            const spectralRoots = isAmethyst
                ? [110.00, 110.00, 130.81, 146.83, 110.00, 164.81, 146.83, 130.81, 110.00, 130.81, 146.83, 164.81, 196.00, 164.81, 146.83, 110.00]
                : [87.31, 87.31, 103.83, 116.54, 98.00, 87.31, 130.81, 116.54, 87.31, 103.83, 116.54, 130.81, 146.83, 130.81, 116.54, 87.31];
            const cBass = spectralRoots[bar % spectralRoots.length];

            if (sub === 0 || sub === 2) {
                this.synthBassNote(time, cBass, stepSec * 1.5, 'square', 0.15, sessionGain);
            }
            if (beat === 0 && sub === 0) {
                const padChord = isAmethyst
                    ? [cBass * 2, cBass * 2.38, cBass * 2.83, cBass * 3.56]
                    : [cBass * 2, cBass * 2.4, cBass * 3, cBass * 3.56];
                this.synthPad(time, padChord, stepSec * 16, 0.12, sessionGain);
            }

            // Extended 32-Note Ethereal Melody Solo
            const spectralMelody = isAmethyst
                ? [220.00, 261.63, 329.63, 392.00, 440.00, 523.25, 659.25, 523.25, 440.00, 392.00, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99, 659.25, 523.25, 440.00, 392.00, 329.63, 261.63, 220.00, 261.63, 329.63, 392.00, 440.00, 329.63, 261.63, 220.00, 196.00, 220.00]
                : [174.61, 207.65, 261.63, 311.13, 349.23, 415.30, 523.25, 415.30, 349.23, 311.13, 261.63, 311.13, 349.23, 415.30, 523.25, 622.25, 523.25, 415.30, 349.23, 311.13, 261.63, 207.65, 174.61, 207.65, 261.63, 311.13, 349.23, 261.63, 207.65, 174.61, 155.56, 174.61];
            
            const arpNote = spectralMelody[(bar * 2 + beat * 2 + (sub % 2)) % spectralMelody.length];
            this.synthArpNote(time, arpNote, stepSec * 1.3, 0.11, sessionGain);

        } else if (trackName.startsWith('world4')) {
            // === WORLD 4: CYBER METROPOLIS / NEON GRID (Rich 64-Bar Synthwave Masterpiece) ===
            const isNeon = trackName.includes('neon') || trackName.includes('matrix');
            if (sub === 0 || (isNeon && beat === 2 && sub === 0)) this.synthDrumKick(time, 120, 36, 0.28, 0.36, sessionGain);
            if (beat === 2 && sub === 0) this.synthDrumSnare(time, 0.18, 0.26, sessionGain);
            if (sub === 1 || sub === 3) this.synthDrumHiHat(time, 0.045, sessionGain);

            // Extended 16-Bar Synthwave Chord Progression: Am -> F -> C -> G -> Dm -> Em -> F -> G (and second half modulation)
            const cyberRoots = [
                110.00, 87.31, 130.81, 98.00, 73.42, 82.41, 87.31, 98.00,
                110.00, 130.81, 146.83, 164.81, 87.31, 98.00, 110.00, 98.00
            ];
            const rRoot = cyberRoots[bar % cyberRoots.length];

            // 16th-Note Pumping Synthwave Rolling Bassline
            if (sub === 0 || sub === 1 || sub === 2 || sub === 3) {
                const bassOct = (sub === 1 || sub === 3) ? 1.5 : 1;
                this.synthBassNote(time, rRoot * bassOct * 0.5, stepSec * 0.9, 'sawtooth', 0.18, sessionGain);
            }

            // Lush Cyber Pad Chords
            if (beat === 0 && sub === 0) {
                const cyberPad = [rRoot, rRoot * 1.25, rRoot * 1.5, rRoot * 2];
                this.synthPad(time, cyberPad, stepSec * 14, 0.11, sessionGain);
            }

            // Extended 32-Note Evolving Synth Lead (Catchy 80s Cyber Solo!)
            const cyberLead = [
                329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63, 293.66,
                329.63, 440.00, 523.25, 659.25, 587.33, 523.25, 440.00, 392.00,
                440.00, 523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440.00,
                587.33, 523.25, 440.00, 392.00, 329.63, 293.66, 261.63, 293.66
            ];
            const noteIdx = (bar * 2 + beat + (section >= 2 ? 8 : 0)) % cyberLead.length;
            const leadNote = cyberLead[noteIdx];
            if (sub === 0 || sub === 2 || (section === 2 && sub === 3)) {
                this.synthArpNote(time, leadNote * (section >= 2 ? 1.5 : 1), stepSec * 1.2, 0.12, sessionGain);
            }

        } else if (trackName.startsWith('world5')) {
            // === WORLD 5: COSMIC GALAXY / SUPERNOVA (Extended 64-Bar Space Symphony) ===
            const isSupernova = trackName.includes('supernova') || trackName.includes('throne');
            if (beat === 0 && sub === 0) this.synthDrumKick(time, 95, 30, 0.35, 0.28, sessionGain);
            if (sub === 2 || (isSupernova && sub === 0)) this.synthDrumHiHat(time, 0.035, sessionGain);

            const spaceChords = [
                [164.81, 196.00, 246.94, 329.63],
                [130.81, 164.81, 196.00, 246.94],
                [146.83, 174.61, 220.00, 261.63],
                [123.47, 155.56, 185.00, 246.94],
                [164.81, 220.00, 261.63, 329.63],
                [196.00, 246.94, 293.66, 392.00],
                [220.00, 261.63, 329.63, 440.00],
                [174.61, 220.00, 261.63, 349.23],
                [164.81, 196.00, 246.94, 329.63],
                [130.81, 164.81, 196.00, 246.94],
                [146.83, 174.61, 220.00, 261.63],
                [196.00, 246.94, 293.66, 392.00]
            ];
            const chord = spaceChords[bar % spaceChords.length];

            if (beat === 0 && sub === 0) {
                this.synthPad(time, chord, stepSec * 16, 0.14, sessionGain);
            }

            // Extended 32-Note Cosmic Glockenspiel Melody
            const cosmicMelody = [
                329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 987.77, 783.99,
                659.25, 587.33, 493.88, 587.33, 659.25, 783.99, 987.77, 1174.66,
                987.77, 783.99, 659.25, 587.33, 493.88, 392.00, 329.63, 392.00,
                493.88, 587.33, 659.25, 783.99, 659.25, 493.88, 392.00, 329.63
            ];
            const star = cosmicMelody[(bar * 2 + beat) % cosmicMelody.length];
            if (sub === 0 || sub === 2) {
                this.synthArpNote(time, star, stepSec * 1.6, 0.09, sessionGain);
            }
        } else {
            // === WORLD 1: EMERALD MEADOW / TWILIGHT / CASTLE (Extended 64-Bar Suite) ===
            const isTwilight = trackName.includes('twilight');
            const isCastle = trackName.includes('castle');

            if (sub === 0 || (section >= 1 && beat === 2 && sub === 2)) this.synthDrumKick(time, 110, 40, 0.18, 0.28, sessionGain);
            if (beat === 2 && sub === 0) this.synthDrumSnare(time, 0.12, 0.20, sessionGain);
            if (sub === 0 || sub === 2) this.synthDrumHiHat(time, 0.03, sessionGain);

            const mRoots = isTwilight
                ? [98.00, 130.81, 146.83, 98.00, 110.00, 130.81, 146.83, 196.00, 98.00, 110.00, 130.81, 146.83, 164.81, 146.83, 130.81, 98.00]
                : [130.81, 174.61, 196.00, 130.81, 146.83, 174.61, 196.00, 261.63, 130.81, 146.83, 174.61, 196.00, 220.00, 196.00, 174.61, 130.81];
            const mRoot = mRoots[bar % mRoots.length];

            if (sub === 0 && (beat === 0 || beat === 2)) {
                this.synthBassNote(time, mRoot, stepSec * 2.5, 'triangle', 0.16, sessionGain);
            }
            if (section >= 1 && beat === 0 && sub === 0) {
                this.synthPad(time, [mRoot * 2, mRoot * 2.5, mRoot * 3, mRoot * 4], stepSec * 16, 0.08, sessionGain);
            }

            // Extended 32-Note Joyful Meadow Melody
            const meadowTheme = [
                261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00,
                329.63, 392.00, 523.25, 659.25, 587.33, 523.25, 440.00, 392.00,
                523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.00,
                392.00, 329.63, 293.66, 261.63, 293.66, 329.63, 392.00, 261.63
            ];
            const note = meadowTheme[(bar * 2 + beat) % meadowTheme.length];
            if (sub === 0 || sub === 2) {
                this.synthArpNote(time, note, stepSec * 1.3, 0.09, sessionGain);
            }
        }
    }

    // Synthesis Helpers
    synthDrumKick(time, startFreq, endFreq, dur, vol, targetGain = null) {
        if (!this.ctx) return;
        const dest = targetGain || this.currentSessionGain || this.masterBgmGain;
        if (!dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + dur);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + dur);
    }

    synthDrumSnare(time, dur, vol, targetGain = null) {
        if (!this.ctx) return;
        const dest = targetGain || this.currentSessionGain || this.masterBgmGain;
        if (!dest) return;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(850, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(time);
        noise.stop(time + dur);
    }

    synthDrumHiHat(time, vol, targetGain = null) {
        if (!this.ctx) return;
        const dest = targetGain || this.currentSessionGain || this.masterBgmGain;
        if (!dest) return;
        const dur = 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(7500, time);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + dur);
    }

    synthBassNote(time, freq, dur, type, vol, targetGain = null) {
        if (!this.ctx) return;
        const dest = targetGain || this.currentSessionGain || this.masterBgmGain;
        if (!dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, time);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + dur);
    }

    synthArpNote(time, freq, dur, vol, targetGain = null) {
        if (!this.ctx) return;
        const dest = targetGain || this.currentSessionGain || this.masterBgmGain;
        if (!dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + dur);
    }

    synthChord(time, freqs, dur, type, vol, targetGain = null) {
        if (!this.ctx) return;
        const dest = targetGain || this.currentSessionGain || this.masterBgmGain;
        if (!dest) return;
        freqs.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(f, time);
            gain.gain.setValueAtTime(vol / freqs.length, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            osc.connect(gain);
            gain.connect(dest);
            osc.start(time);
            osc.stop(time + dur);
        });
    }

    synthPad(time, freqs, dur, vol, targetGain = null) {
        if (!this.ctx) return;
        const dest = targetGain || this.currentSessionGain || this.masterBgmGain;
        if (!dest) return;
        freqs.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, time);
            gain.gain.setValueAtTime(0.001, time);
            gain.gain.linearRampToValueAtTime(vol / freqs.length, time + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            osc.connect(gain);
            gain.connect(dest);
            osc.start(time);
            osc.stop(time + dur);
        });
    }

    // =========================================================================
    // UNIQUE BOSS AUDIO SFX (Awakening, Ground Pound Impact, Custom Attacks)
    // =========================================================================

    // Unique Awakening Roar / Sound tailored per Boss Personality
    playBossAwaken(bossType = 5) {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        if (bossType === 5) {
            // Slime King: Deep wobble + squelch roar
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.linearRampToValueAtTime(140, now + 0.25);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.65);
            gain.gain.setValueAtTime(0.35 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.65);
        } else if (bossType === 10) {
            // Magma Golem: Sizzling fiery roar + volcanic rumble
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(65, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.8);
            gain.gain.setValueAtTime(0.40 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.8);
        } else if (bossType === 15) {
            // Phantom Spore: Ethereal spooky chime sweep
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.75);
            gain.gain.setValueAtTime(0.32 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.75);
        } else if (bossType === 20) {
            // Cyber Mecha: Electric turbine charge + robotic klaxon
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.linearRampToValueAtTime(650, now + 0.4);
            gain.gain.setValueAtTime(0.28 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.7);
        } else {
            // Cosmic Overlord: Dimensional void resonance & thunder
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(45, now);
            osc.frequency.linearRampToValueAtTime(380, now + 0.4);
            osc.frequency.exponentialRampToValueAtTime(25, now + 1.0);
            gain.gain.setValueAtTime(0.45 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 1.0);
        }
    }

    // Heavy Impact Earthquake Thud when a jumping boss slams into the ground
    playBossLand(bossType = 5) {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        // Sub-bass heavy seismic impact drop (120Hz -> 28Hz)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.28);
        gain.gain.setValueAtTime(0.50 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);

        // Ground debris crackle noise burst
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35 * this.globalVolume, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.15);
    }

    // Unique Attack SFX per Boss Type
    playBossAttack(bossType = 5) {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        if (bossType === 10) {
            // Magma Rush Whoosh
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
            gain.gain.setValueAtTime(0.30 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (bossType === 20) {
            // Mecha Hover Rocket Thruster
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.linearRampToValueAtTime(420, now + 0.35);
            gain.gain.setValueAtTime(0.22 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } else {
            this.playBossJump();
        }
    }

    playBossRoar() {
        this.playBossAwaken(5);
    }

    playBossHit() {
        this.playBossLand(5);
    }

    playBossJump() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.16);

        gain.gain.setValueAtTime(0.25 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    // =========================================================================
    // ENEMY-SPECIFIC STOMP & DAMAGE SOUND EFFECTS (Per World Theme 🍄, 🦀, 👻, 🤖, 👾)
    // =========================================================================
    playEnemyStompSFX(worldType = 1) {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const wType = Number(worldType) || 1;

        if (wType === 1) {
            // 🍄 World 1 (Shroomie): Rubbery fungal squish-pop & cheerful chime
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(240, now);
            osc.frequency.exponentialRampToValueAtTime(620, now + 0.15);
            gain.gain.setValueAtTime(0.38 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now); osc.stop(now + 0.15);

            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(440, now + 0.04);
            osc2.frequency.exponentialRampToValueAtTime(880, now + 0.16);
            gain2.gain.setValueAtTime(0.24 * this.globalVolume, now + 0.04);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            osc2.connect(gain2); gain2.connect(this.ctx.destination);
            osc2.start(now + 0.04); osc2.stop(now + 0.16);

        } else if (wType === 2) {
            // 🦀 World 2 (Magma Crab): Heavy rock carapace crunch & steam hiss
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
            gain.gain.setValueAtTime(0.35 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now); osc.stop(now + 0.14);

            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(780, now + 0.02);
            osc2.frequency.exponentialRampToValueAtTime(110, now + 0.18);
            gain2.gain.setValueAtTime(0.26 * this.globalVolume, now + 0.02);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc2.connect(gain2); gain2.connect(this.ctx.destination);
            osc2.start(now + 0.02); osc2.stop(now + 0.18);

        } else if (wType === 3) {
            // 👻 World 3 (Spectral Phantom): Ethereal spirit vapor dispel arpeggio
            [523.25, 659.25, 880.00].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.04);
                gain.gain.setValueAtTime(0.26 * this.globalVolume, now + idx * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.04); osc.stop(now + idx * 0.04 + 0.18);
            });

        } else if (wType === 4) {
            // 🤖 World 4 (Cyber Drone): Crisp metallic arcade clang & electric spark
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1050, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
            gain.gain.setValueAtTime(0.36 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now); osc.stop(now + 0.12);

            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(220, now + 0.02);
            osc2.frequency.exponentialRampToValueAtTime(60, now + 0.16);
            gain2.gain.setValueAtTime(0.30 * this.globalVolume, now + 0.02);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            osc2.connect(gain2); gain2.connect(this.ctx.destination);
            osc2.start(now + 0.02); osc2.stop(now + 0.16);

        } else {
            // 👾 World 5 (Astral Crystal): Resonant celestial crystal shatter & glockenspiel
            [1174.66, 1760.00].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.03);
                gain.gain.setValueAtTime(0.28 * this.globalVolume, now + idx * 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.25);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.03); osc.stop(now + idx * 0.03 + 0.25);
            });
        }
    }

    playStomp(worldType = 1) {
        this.playEnemyStompSFX(worldType);
    }

    // =========================================================================
    // ENEMY-SPECIFIC PLAYER DEATH / DAMAGE SFX (When Player Burns/Dies to Enemy)
    // =========================================================================
    playEnemyDeathSFX(worldType = 1) {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const wType = Number(worldType) || 1;

        if (wType === 1) {
            // 🍄 World 1 (Shroomie): Spore cloud choke & muffled fungal thud
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.24);
            gain.gain.setValueAtTime(0.35 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now); osc.stop(now + 0.24);

        } else if (wType === 2) {
            // 🦀 World 2 (Magma Crab): Sizzling lava burn & flame crackle
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.26);
            gain.gain.setValueAtTime(0.38 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now); osc.stop(now + 0.26);

        } else if (wType === 3) {
            // 👻 World 3 (Spectral Phantom): Eerie supernatural ghost screech & chill
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(740, now);
            osc.frequency.linearRampToValueAtTime(820, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.32);
            gain.gain.setValueAtTime(0.32 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now); osc.stop(now + 0.32);

        } else if (wType === 4) {
            // 🤖 World 4 (Cyber Drone): High-voltage laser zap & glitch short-circuit
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1250, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);
            gain.gain.setValueAtTime(0.36 * this.globalVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(now); osc.stop(now + 0.22);

        } else {
            // 👾 World 5 (Astral Crystal): Cosmic space distortion & celestial dissonance
            [880.00, 825.00].forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);
                gain.gain.setValueAtTime(0.30 * this.globalVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain); gain.connect(this.ctx.destination);
                osc.start(now); osc.stop(now + 0.35);
            });
        }
    }

    // Cartoon Spring Bouncy Pad "BOING!" twang sound effect
    playBoing() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        // Primary Spring Twang with Frequency Modulation Vibrato
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.22);

        gain.gain.setValueAtTime(0.35 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);

        // Metallic harmonic overtones for the cartoon spring
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(380, now);
        osc2.frequency.exponentialRampToValueAtTime(940, now + 0.20);
        gain2.gain.setValueAtTime(0.18 * this.globalVolume, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.22);
    }

    // Crisp, Punchy Arcade Boss Damage Hit Sound Effect
    playBossDamage() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        // Snappy Comic Slap & Punch attack transient (550Hz -> 130Hz)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(550, now);
        osc1.frequency.exponentialRampToValueAtTime(130, now + 0.09);

        gain1.gain.setValueAtTime(0.40 * this.globalVolume, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.09);

        // Warm Hollow Boss Body Bonk (320Hz -> 75Hz)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(320, now + 0.02);
        osc2.frequency.exponentialRampToValueAtTime(75, now + 0.18);

        gain2.gain.setValueAtTime(0.35 * this.globalVolume, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.02);
        osc2.stop(now + 0.18);

        // Sparkle Harmonic Reward Chime (650Hz -> 1050Hz)
        const osc3 = this.ctx.createOscillator();
        const gain3 = this.ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(650, now + 0.04);
        osc3.frequency.exponentialRampToValueAtTime(1050, now + 0.16);

        gain3.gain.setValueAtTime(0.24 * this.globalVolume, now + 0.04);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc3.connect(gain3);
        gain3.connect(this.ctx.destination);
        osc3.start(now + 0.04);
        osc3.stop(now + 0.16);
    }

    // Standard Gameplay SFX
    playJump() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

        gain.gain.setValueAtTime(0.20 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playCoin() {
        this.playFruitCombo(1);
    }

    playFruitCombo(combo = 1) {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;

        // Ascending pentatonic / major scale from C5 (523Hz) to C6 (1046Hz)
        const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51];
        const noteIdx = Math.min(scale.length - 1, Math.max(0, (combo - 1) % scale.length));
        const rootFreq = scale[noteIdx];
        const fifthFreq = rootFreq * 1.5;

        const notes = [
            { freq: rootFreq, time: 0, dur: 0.14, vol: 0.18 + Math.min(0.08, combo * 0.01) },
            { freq: fifthFreq, time: 0.035, dur: 0.16, vol: 0.20 + Math.min(0.08, combo * 0.01) }
        ];

        // Extra sparkling chime octave on high combos (5+)
        if (combo >= 5) {
            notes.push({ freq: rootFreq * 2, time: 0.07, dur: 0.22, vol: 0.22 });
        }

        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = combo >= 5 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(n.freq, now + n.time);
            gain.gain.setValueAtTime(n.vol * this.globalVolume, now + n.time);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + n.time);
            osc.stop(now + n.time + n.dur);
        });
    }

    playCrumble() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);

        gain.gain.setValueAtTime(0.20 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    playIceSlide() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.10);

        gain.gain.setValueAtTime(0.08 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.10);
    }

    playFanfare() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const fanfareNotes = [
            { freq: 523.25, time: 0.00, dur: 0.12, vol: 0.20 }, // C5
            { freq: 659.25, time: 0.09, dur: 0.12, vol: 0.22 }, // E5
            { freq: 783.99, time: 0.18, dur: 0.15, vol: 0.24 }, // G5
            { freq: 1046.50, time: 0.28, dur: 0.40, vol: 0.30 }, // C6
            { freq: 1318.51, time: 0.35, dur: 0.45, vol: 0.28 }  // E6
        ];

        fanfareNotes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.freq, now + n.time);
            gain.gain.setValueAtTime(n.vol * this.globalVolume, now + n.time);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + n.time);
            osc.stop(now + n.time + n.dur);
        });
    }

    playStar() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [
            { freq: 523.25, time: 0, dur: 0.18, vol: 0.20 },
            { freq: 659.25, time: 0.06, dur: 0.18, vol: 0.22 },
            { freq: 783.99, time: 0.12, dur: 0.25, vol: 0.24 },
            { freq: 1046.50, time: 0.18, dur: 0.35, vol: 0.26 }
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

    playHurt() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.16);

        gain.gain.setValueAtTime(0.24 * this.globalVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    playWin() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [
            { freq: 392.00, time: 0.00, dur: 0.15, vol: 0.20 },
            { freq: 523.25, time: 0.08, dur: 0.15, vol: 0.22 },
            { freq: 659.25, time: 0.16, dur: 0.18, vol: 0.24 },
            { freq: 783.99, time: 0.24, dur: 0.35, vol: 0.28 }
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

    playPortal() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(320, now);
        osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.24);
        gain1.gain.setValueAtTime(0.24 * this.globalVolume, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.24);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(640, now + 0.04);
        osc2.frequency.exponentialRampToValueAtTime(1480, now + 0.30);
        gain2.gain.setValueAtTime(0.18 * this.globalVolume, now + 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.04);
        osc2.stop(now + 0.30);
    }

    playSplashIntro() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [
            { freq: 261.63, time: 0.00, dur: 0.65, vol: 0.22 },
            { freq: 392.00, time: 0.08, dur: 0.60, vol: 0.24 },
            { freq: 523.25, time: 0.16, dur: 0.55, vol: 0.25 },
            { freq: 659.25, time: 0.24, dur: 0.50, vol: 0.22 },
            { freq: 987.77, time: 0.32, dur: 0.70, vol: 0.26 },
            { freq: 1046.50, time: 0.40, dur: 0.80, vol: 0.28 }
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

    playSplashTap() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [
            { freq: 523.25, time: 0.00, dur: 0.18, vol: 0.25 },
            { freq: 783.99, time: 0.06, dur: 0.22, vol: 0.28 },
            { freq: 1046.50, time: 0.12, dur: 0.35, vol: 0.32 }
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
}

const audio = new AudioManager();
