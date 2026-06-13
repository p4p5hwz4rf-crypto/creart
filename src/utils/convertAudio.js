/**
 * Converts large WAV files to MP3 to reduce bundle size.
 * Run with: node src/utils/convertAudio.js
 */
const fs = require('fs');
const path = require('path');
const lamejs = require('lamejs');

const SOUNDS_DIR = path.join(__dirname, '..', '..', 'assets', 'sounds');

// Files to convert (all WAVs except tiny ones that work fine as-is)
const FILES = [
  'asmr.wav',
  'meditation.wav',
  'rain.wav',
  'forest.wav',
  'ocean.wav',
  'bowl.wav',
  'gymnopedie.wav',
];

function readWav(filePath) {
  const buf = fs.readFileSync(filePath);

  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Not a valid WAV file: ' + filePath);
  }

  const audioFormat = buf.readUInt16LE(20);
  if (audioFormat !== 1) {
    throw new Error('Only PCM WAV files are supported (format ' + audioFormat + '): ' + filePath);
  }

  const channels = buf.readUInt16LE(22);
  const sampleRate = buf.readUInt32LE(24);
  const bitsPerSample = buf.readUInt16LE(34);

  // Find data chunk
  let offset = 36;
  while (offset < buf.length - 8) {
    const chunkId = buf.toString('ascii', offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    if (chunkId === 'data') {
      const samples = new Int16Array(
        buf.buffer.slice(buf.byteOffset + offset + 8, buf.byteOffset + offset + 8 + chunkSize)
      );
      return { samples, sampleRate, channels, bitsPerSample };
    }
    offset += 8 + chunkSize;
  }

  throw new Error('No data chunk found in: ' + filePath);
}

function convertToMp3(wavPath, mp3Path, bitrate = 128) {
  const { samples, sampleRate, channels } = readWav(wavPath);

  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
  const sampleBlockSize = 1152;

  const mp3Data = [];

  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const chunk = samples.subarray(i, i + sampleBlockSize);
    // Convert to 16-bit PCM ints
    const left = chunk;
    let right = null;
    if (channels === 2) {
      // Deinterleave: left and right channels
      const half = new Int16Array(chunk.length / 2);
      const leftSamples = new Int16Array(chunk.length / 2);
      const rightSamples = new Int16Array(chunk.length / 2);
      for (let j = 0; j < chunk.length / 2; j++) {
        leftSamples[j] = chunk[j * 2];
        rightSamples[j] = chunk[j * 2 + 1];
      }
      const encoded = mp3encoder.encodeBuffer(leftSamples, rightSamples);
      if (encoded.length > 0) mp3Data.push(encoded);
    } else {
      const encoded = mp3encoder.encodeBuffer(left);
      if (encoded.length > 0) mp3Data.push(encoded);
    }
  }

  const final = mp3encoder.flush();
  if (final.length > 0) mp3Data.push(final);

  const mp3Buffer = Buffer.concat(mp3Data);
  fs.writeFileSync(mp3Path, mp3Buffer);

  const wavSize = fs.statSync(wavPath).size;
  const mp3Size = mp3Buffer.length;
  const ratio = ((1 - mp3Size / wavSize) * 100).toFixed(1);

  console.log(`  ${path.basename(wavPath)} → ${path.basename(mp3Path)}`);
  console.log(`    ${(wavSize / 1024 / 1024).toFixed(1)} MB → ${(mp3Size / 1024 / 1024).toFixed(1)} MB (${ratio}% smaller)`);
}

console.log('Converting WAV files to MP3 (128 kbps)...\n');

for (const file of FILES) {
  const wavPath = path.join(SOUNDS_DIR, file);
  const mp3Path = path.join(SOUNDS_DIR, file.replace(/\.wav$/, '.mp3'));

  if (!fs.existsSync(wavPath)) {
    console.log(`  SKIP ${file} — file not found`);
    continue;
  }

  try {
    convertToMp3(wavPath, mp3Path);
  } catch (e) {
    console.error(`  ERROR ${file}: ${e.message}`);
  }
}

console.log('\nDone. You can now delete the .wav files to free space.');
console.log('Run: rm assets/sounds/*.wav  (keep bell.wav and white_noise.wav)');
