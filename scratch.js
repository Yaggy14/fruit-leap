
const sampleRate = 44100;
const bpm = 120;
const beatLen = 60 / bpm;
const duration = beatLen * 16; // 4 bars
const length = Math.floor(sampleRate * duration);
console.log('Buffer length:', length);

console.time('gen');
const data = new Float32Array(length);
for(let i=0; i<length; i++) {
    let t = i / sampleRate;
    // basic sine
    data[i] = Math.sin(t * Math.PI * 2 * 440) * 0.1;
}
console.timeEnd('gen');

