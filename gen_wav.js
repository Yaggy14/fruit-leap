
const fs = require('fs');

function writeWav(filename, generateSamples, durationSecs) {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * durationSecs);
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);

    const buffer = Buffer.alloc(44 + numSamples * 2);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);

    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); 
    buffer.writeUInt16LE(1, 20); 
    buffer.writeUInt16LE(numChannels, 22); 
    buffer.writeUInt32LE(sampleRate, 24); 
    buffer.writeUInt32LE(byteRate, 28); 
    buffer.writeUInt16LE(blockAlign, 32); 
    buffer.writeUInt16LE(bitsPerSample, 34); 

    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    for (let i = 0; i < numSamples; i++) {
        let t = i / sampleRate;
        let sample = generateSamples(t);
        sample = Math.max(-1, Math.min(1, sample));
        let val = sample < 0 ? sample * 32768 : sample * 32767;
        buffer.writeInt16LE(Math.round(val), 44 + i * 2);
    }

    fs.writeFileSync(filename, buffer);
}

function getTriangle(t, freq) {
    return 2 * Math.abs(2 * (t * freq - Math.floor(t * freq + 0.5))) - 1;
}

function getSine(t, freq) {
    return Math.sin(t * Math.PI * 2 * freq);
}

// CALM MENU THEME: 8 seconds loop. Dreamy, ambient, very slow.
function calmMenuTune(t) {
    // A long chord progression (Cmaj7 -> Amin7)
    // Cmaj7: C(261.6), E(329.6), G(392.0), B(493.9)
    // Amin7: A(220.0), C(261.6), E(329.6), G(392.0)
    const isSecondHalf = t >= 4.0;
    
    // Gentle pulsing bass (Sine wave)
    const bassFreq = isSecondHalf ? 110.0 : 130.81; // A2 / C3
    const bass = getSine(t, bassFreq) * 0.2;
    
    // Slow twinkling melody (Triangle)
    const arpNotes = isSecondHalf 
        ? [329.63, 392.00, 261.63, 220.00] // E G C A
        : [329.63, 392.00, 493.88, 261.63]; // E G B C
    const beat = Math.floor(t * 2) % 4; // 1 note every 0.5s
    const mFreq = arpNotes[beat];
    
    // Soft Envelope for melody
    const timeInBeat = (t * 2) % 1;
    const env = Math.exp(-timeInBeat * 3); // Soft decay
    const melody = getTriangle(t, mFreq) * env * 0.15;
    
    // Chorus pad
    const padFreq = isSecondHalf ? 220.0 : 261.63;
    const pad = getSine(t, padFreq) * 0.05 + getSine(t, padFreq*1.01) * 0.05;

    return (bass + melody + pad) * 0.8;
}

// RELAXED GAME THEME: 8 seconds loop. Gentle, bouncy platformer vibe.
function calmGameTune(t) {
    // 90 BPM -> 1 beat = 0.666s. 1 bar = 2.666s
    // Simple F -> C progression
    const bar = Math.floor(t / (8/3)); // 3 bars in 8 seconds? Let's use 100 BPM for easier math: 1 beat = 0.6s
    // Let's just use time modulo. Loop is 8 seconds.
    // 4 sections of 2 seconds.
    const section = Math.floor(t / 2);
    
    // Bass notes: F, C, G, C
    const bassNotes = [174.61, 130.81, 196.00, 130.81];
    const bFreq = bassNotes[section];
    
    // Bouncy bass envelope (plucked)
    const bassTime = (t * 2) % 1; // 2 notes per second
    const bEnv = Math.exp(-bassTime * 5);
    const bass = getTriangle(t, bFreq) * bEnv * 0.25;

    // Melody: Soft, playful and sparse
    const melodyNotes = [
        [349.23, 0, 440.00, 349.23], // F A F
        [329.63, 0, 392.00, 329.63], // E G E
        [392.00, 493.88, 392.00, 0], // G B G
        [523.25, 0, 392.00, 0]       // C G
    ];
    const mBeat = Math.floor(t * 4) % 4; // 4 notes per 2s section
    const mFreq = melodyNotes[section][mBeat];
    
    let melody = 0;
    if (mFreq > 0) {
        const mTime = (t * 4) % 1;
        const mEnv = Math.exp(-mTime * 4);
        melody = getSine(t, mFreq) * mEnv * 0.3;
    }

    return (bass + melody) * 0.8;
}

writeWav('audio/menu.wav', calmMenuTune, 8); 
writeWav('audio/game.wav', calmGameTune, 8); 
console.log('Calm WAV files generated in audio/');

