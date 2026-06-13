/**
 * Convert large WAV files to MP3 using ffmpeg-static.
 * Run: node scripts/convert-audio.js
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const SOUNDS_DIR = path.join(__dirname, '..', 'assets', 'sounds');

// Files to convert: [filename, bitrate_kbps]
const FILES = [
  ['asmr.wav', 128],
  ['meditation.wav', 128],
  ['rain.wav', 128],
  ['forest.wav', 128],
  ['ocean.wav', 128],
  ['bowl.wav', 128],
  ['gymnopedie.wav', 192], // music quality
];

console.log('Converting WAV files to MP3...\n');

let totalSaved = 0;

for (const [file, bitrate] of FILES) {
  const wavPath = path.join(SOUNDS_DIR, file);
  const mp3Path = path.join(SOUNDS_DIR, file.replace(/\.wav$/, '.mp3'));

  if (!fs.existsSync(wavPath)) {
    console.log(`  SKIP ${file} — not found`);
    continue;
  }

  const wavSize = fs.statSync(wavPath).size;

  try {
    execSync(
      `"${ffmpegPath}" -y -i "${wavPath}" -b:a ${bitrate}k -map_metadata -1 "${mp3Path}"`,
      { stdio: 'pipe', timeout: 300000 }
    );

    const mp3Size = fs.statSync(mp3Path).size;
    const ratio = ((1 - mp3Size / wavSize) * 100).toFixed(1);
    totalSaved += wavSize - mp3Size;

    console.log(`  ${file} → ${file.replace('.wav', '.mp3')}`);
    console.log(`    ${(wavSize / 1024 / 1024).toFixed(1)} MB → ${(mp3Size / 1024 / 1024).toFixed(1)} MB (${ratio}% smaller)`);
  } catch (e) {
    console.error(`  ERROR ${file}: ${e.message}`);
    if (e.stderr) console.error(e.stderr.toString());
  }
}

console.log(`\nTotal saved: ${(totalSaved / 1024 / 1024).toFixed(0)} MB`);
console.log('Done.\n');
console.log('Next: Update component imports from .wav to .mp3, then delete .wav files.');
