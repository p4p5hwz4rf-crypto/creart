const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '../../assets/images');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Premium dark palette
const BG = { r: 42, g: 54, b: 48 };          // 深墨绿 #2A3630
const RING_OUTER = { r: 140, g: 168, b: 148 }; // 鼠尾草 #8CA894
const RING_INNER = { r: 210, g: 196, b: 160 }; // 暖金 #D2C4A0
const GLOW = { r: 230, g: 220, b: 195 };       // 柔光 #E6DCC3

function fillColor(image, r, g, b) {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    this.bitmap.data[idx] = r;
    this.bitmap.data[idx + 1] = g;
    this.bitmap.data[idx + 2] = b;
    this.bitmap.data[idx + 3] = 255;
  });
}

function drawRing(image, cx, cy, innerR, outerR, r, g, b, maxAlpha = 255) {
  const outerSq = outerR * outerR;
  const innerSq = innerR * innerR;
  const width = outerR - innerR;

  for (let y = Math.max(0, Math.floor(cy - outerR)); y <= Math.min(image.bitmap.height - 1, Math.ceil(cy + outerR)); y++) {
    for (let x = Math.max(0, Math.floor(cx - outerR)); x <= Math.min(image.bitmap.width - 1, Math.ceil(cx + outerR)); x++) {
      const dx = x - cx;
      const dy = y - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq <= outerSq && distSq >= innerSq) {
        const dist = Math.sqrt(distSq);
        // Smooth fade at edges
        let alpha = 1;
        const edgeIn = dist - innerR;
        const edgeOut = outerR - dist;
        if (edgeIn < 1.5) alpha = edgeIn / 1.5;
        if (edgeOut < 1.5) alpha = Math.min(alpha, edgeOut / 1.5);
        alpha = Math.max(0, Math.min(1, alpha));

        const idx = image.getPixelIndex(x, y);
        const oldR = image.bitmap.data[idx];
        const oldG = image.bitmap.data[idx + 1];
        const oldB = image.bitmap.data[idx + 2];
        image.bitmap.data[idx] = Math.round(r * alpha + oldR * (1 - alpha));
        image.bitmap.data[idx + 1] = Math.round(g * alpha + oldG * (1 - alpha));
        image.bitmap.data[idx + 2] = Math.round(b * alpha + oldB * (1 - alpha));
        image.bitmap.data[idx + 3] = 255;
      }
    }
  }
}

function drawSoftGlow(image, cx, cy, radius, color) {
  for (let y = Math.max(0, Math.floor(cy - radius)); y <= Math.min(image.bitmap.height - 1, Math.ceil(cy + radius)); y++) {
    for (let x = Math.max(0, Math.floor(cx - radius)); x <= Math.min(image.bitmap.width - 1, Math.ceil(cx + radius)); x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        const alpha = (1 - dist / radius) * 0.25; // Subtle glow
        const idx = image.getPixelIndex(x, y);
        const oldR = image.bitmap.data[idx];
        const oldG = image.bitmap.data[idx + 1];
        const oldB = image.bitmap.data[idx + 2];
        image.bitmap.data[idx] = Math.round(color.r * alpha + oldR * (1 - alpha));
        image.bitmap.data[idx + 1] = Math.round(color.g * alpha + oldG * (1 - alpha));
        image.bitmap.data[idx + 2] = Math.round(color.b * alpha + oldB * (1 - alpha));
        image.bitmap.data[idx + 3] = 255;
      }
    }
  }
}

function drawDot(image, cx, cy, radius, r, g, b) {
  const rSq = radius * radius;
  for (let y = Math.max(0, Math.floor(cy - radius)); y <= Math.min(image.bitmap.height - 1, Math.ceil(cy + radius)); y++) {
    for (let x = Math.max(0, Math.floor(cx - radius)); x <= Math.min(image.bitmap.width - 1, Math.ceil(cx + radius)); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= rSq) {
        const idx = image.getPixelIndex(x, y);
        image.bitmap.data[idx] = r;
        image.bitmap.data[idx + 1] = g;
        image.bitmap.data[idx + 2] = b;
        image.bitmap.data[idx + 3] = 255;
      }
    }
  }
}

async function generateIcon(size, name, elements) {
  const img = new Jimp(size, size);
  fillColor(img, BG.r, BG.g, BG.b);

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 1024;

  // Subtle central glow
  drawSoftGlow(img, cx, cy, 350 * scale, GLOW);

  // Concentric rings — meditation ripple
  const rings = [
    { inner: 220, outer: 228, color: RING_OUTER },
    { inner: 248, outer: 254, color: RING_INNER },
    { inner: 280, outer: 285, color: RING_OUTER },
    { inner: 305, outer: 309, color: RING_INNER },
    { inner: 330, outer: 333, color: RING_OUTER },
  ];

  rings.forEach(ring => {
    drawRing(img, cx, cy,
      ring.inner * scale,
      ring.outer * scale,
      ring.color.r, ring.color.g, ring.color.b
    );
  });

  // Center dot — the calm core
  drawDot(img, cx, cy, 14 * scale, RING_INNER.r, RING_INNER.g, RING_INNER.b);

  await new Promise((resolve, reject) => {
    img.write(path.join(OUT, name), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log(`✓ ${name} (${size}x${size})`);
}

async function generate() {
  console.log('正在生成高级感应用图标...\n');

  // App icon 1024x1024
  await generateIcon(1024, 'icon.png');

  // Adaptive icon 1024x1024 (Android)
  await generateIcon(1024, 'adaptive-icon.png');

  // Splash screen — centered icon on light background
  const splash = new Jimp(1242, 2436);
  const splashBg = { r: 42, g: 54, b: 48 }; // Match icon background
  fillColor(splash, splashBg.r, splashBg.g, splashBg.b);

  const sx = 1242 / 2;
  const sy = 2436 / 2 - 80;
  const sScale = 800 / 1024;

  drawSoftGlow(splash, sx, sy, 300 * (800 / 1024), GLOW);

  const rings = [
    { inner: 220, outer: 228, color: RING_OUTER },
    { inner: 248, outer: 254, color: RING_INNER },
    { inner: 280, outer: 285, color: RING_OUTER },
    { inner: 305, outer: 309, color: RING_INNER },
    { inner: 330, outer: 333, color: RING_OUTER },
  ];
  rings.forEach(ring => {
    drawRing(splash, sx, sy,
      ring.inner * sScale, ring.outer * sScale,
      ring.color.r, ring.color.g, ring.color.b
    );
  });
  drawDot(splash, sx, sy, 14 * sScale, RING_INNER.r, RING_INNER.g, RING_INNER.b);

  await new Promise((resolve, reject) => {
    splash.write(path.join(OUT, 'splash.png'), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✓ splash.png (1242x2436)');

  // Favicon
  const fav = new Jimp(48, 48);
  fillColor(fav, BG.r, BG.g, BG.b);
  drawSoftGlow(fav, 24, 24, 16, GLOW);
  drawRing(fav, 24, 24, 10, 11, RING_OUTER.r, RING_OUTER.g, RING_OUTER.b);
  drawRing(fav, 24, 24, 12, 12.5, RING_INNER.r, RING_INNER.g, RING_INNER.b);
  drawDot(fav, 24, 24, 1.5, RING_INNER.r, RING_INNER.g, RING_INNER.b);
  await new Promise((resolve, reject) => {
    fav.write(path.join(OUT, 'favicon.png'), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✓ favicon.png (48x48)');

  console.log('\n图标生成完毕！');
}

generate().catch((err) => {
  console.error('生成失败:', err);
  process.exit(1);
});
