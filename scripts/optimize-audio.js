/**
 * Re-encode MP3 files at lower bitrates.
 * Run: node scripts/optimize-audio.js
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const SOUNDS_DIR = path.join(__dirname, '..', 'assets', 'sounds');

// [input, output, bitrate_kbps, channels(1=mono,2=stereo)]
const JOBS = [
  // ASMR: 56MB → target ~4MB at 32kbps mono
  ['asmr.mp3', 'asmr_opt.mp3', 32, 1],
  // Working files: slight reduction for less buffering
  ['bowl.mp3', 'bowl_opt.mp3', 96, 2],
  ['rain.mp3', 'rain_opt.mp3', 96, 2],
  ['forest.mp3', 'forest_opt.mp3', 96, 2],
  ['ocean.mp3', 'ocean_opt.mp3', 96, 2],
  ['gymnopedie.mp3', 'gymnopedie_opt.mp3', 96, 2],
];

console.log('Re-encoding MP3 files at lower bitrates...\n');

for (const [input, output, bitrate, channels] of JOBS) {
  const inPath = path.join(SOUNDS_DIR, input);
  const outPath = path.join(SOUNDS_DIR, output);

  if (!fs.existsSync(inPath)) {
    console.log(`  SKIP ${input} — not found`);
    continue;
  }

  const inSize = fs.statSync(inPath).size;
  const channelLabel = channels === 1 ? 'mono' : 'stereo';

  try {
    execSync(
      `"${ffmpegPath}" -y -i "${inPath}" -b:a ${bitrate}k -ac ${channels} -map_metadata -1 "${outPath}"`,
      { stdio: 'pipe', timeout: 300000 }
    );

    const outSize = fs.statSync(outPath).size;
    const ratio = ((1 - outSize / inSize) * 100).toFixed(1);

    console.log(`  ${input} → ${output}`);
    console.log(`    ${(inSize / 1024 / 1024).toFixed(1)} MB → ${(outSize / 1024 / 1024).toFixed(1)} MB (${bitrate}kbps ${channelLabel}, ${ratio}% smaller)`);
  } catch (e) {
    console.error(`  ERROR ${input}: ${e.message}`);
  }
}

console.log('\nNext: Replace original files with optimized versions, update imports.');
console.log('Done.\n');
