/**
 * 音频生成脚本
 * 用法: node src/utils/generateSounds.js
 * 生成 bell.wav / bowl.wav / white_noise.wav / rain.wav
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '../../assets/sounds');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function writeWav(filename, samples, sampleRate = 44100, bits = 16, channels = 1) {
  const byteRate = (sampleRate * channels * bits) / 8;
  const blockAlign = (channels * bits) / 8;
  const dataSize = samples.length * (bits / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bits, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  if (bits === 16) {
    for (let i = 0; i < samples.length; i++) {
      const val = Math.max(-1, Math.min(1, samples[i]));
      buffer.writeInt16LE(Math.floor(val * 32767), offset);
      offset += 2;
    }
  } else {
    for (let i = 0; i < samples.length; i++) {
      const val = Math.max(-1, Math.min(1, samples[i]));
      buffer.writeUInt8(Math.floor((val + 1) * 127.5), offset);
      offset += 1;
    }
  }
  fs.writeFileSync(path.join(OUT, filename), buffer);
  console.log(`生成: ${filename} (${(samples.length / sampleRate).toFixed(2)}s)`);
}

function genBell(duration = 1.5, sr = 44100) {
  const len = Math.floor(duration * sr);
  const samples = new Float32Array(len);
  const f0 = 880; // A5
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 3.5);
    samples[i] = env * (Math.sin(2 * Math.PI * f0 * t) * 0.5 + Math.sin(2 * Math.PI * f0 * 1.5 * t) * 0.3);
  }
  writeWav('bell.wav', samples, sr);
}

function genBowl(duration = 8, sr = 44100) {
  const len = Math.floor(duration * sr);
  const samples = new Float32Array(len);
  const f0 = 180;
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 0.6);
    const freq = f0 + Math.sin(2 * Math.PI * 2 * t) * 3;
    samples[i] = env * Math.sin(2 * Math.PI * freq * t) * 0.9;
  }
  writeWav('bowl.wav', samples, sr);
}

function genWhiteNoise(duration = 5, sr = 44100) {
  const len = Math.floor(duration * sr);
  const samples = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let v = (Math.random() * 2 - 1) * 0.15;
    // 简单低通让白噪音不那么刺耳
    if (i > 0) v = v * 0.3 + samples[i - 1] * 0.7;
    samples[i] = v;
  }
  writeWav('white_noise.wav', samples, sr);
}

function genRain(duration = 5, sr = 44100) {
  const len = Math.floor(duration * sr);
  const samples = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let v = (Math.random() * 2 - 1) * 0.25;
    if (i > 0) v = v * 0.1 + samples[i - 1] * 0.9;
    samples[i] = v;
  }
  writeWav('rain.wav', samples, sr);
}

console.log('正在生成音频资源...');
genBell();
genBowl();
genWhiteNoise();
genRain();
console.log('全部完成！');
