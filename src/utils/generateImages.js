const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '../../assets/images');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// 治愈系配色
const BG = { r: 247, g: 245, b: 240 };   // 暖米白 #F7F5F0
const C1 = { r: 126, g: 181, b: 166 };   // 蓝绿 #7EB5A6
const C2 = { r: 184, g: 169, b: 201 };   // 淡紫 #B8A9C9
const C3 = { r: 212, g: 163, b: 115 };   // 暖沙 #D4A373

function fillColor(image, r, g, b) {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    this.bitmap.data[idx] = r;
    this.bitmap.data[idx + 1] = g;
    this.bitmap.data[idx + 2] = b;
    this.bitmap.data[idx + 3] = 255;
  });
}

function drawCircle(image, cx, cy, radius, r, g, b) {
  const rSq = radius * radius;
  for (let y = Math.max(0, cy - radius); y <= Math.min(image.bitmap.height - 1, cy + radius); y++) {
    for (let x = Math.max(0, cx - radius); x <= Math.min(image.bitmap.width - 1, cx + radius); x++) {
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

function drawSoftCircle(image, cx, cy, radius, color) {
  for (let y = Math.max(0, cy - radius); y <= Math.min(image.bitmap.height - 1, cy + radius); y++) {
    for (let x = Math.max(0, cx - radius); x <= Math.min(image.bitmap.width - 1, cx + radius); x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        const alpha = 1 - dist / radius; // 中心不透明，边缘透明
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

function saveImage(image, filePath) {
  return new Promise((resolve, reject) => {
    image.write(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function generate() {
  console.log('正在生成治愈系图片资源...');

  // icon.png 1024x1024 — 同心圆 + 点缀
  const icon = new Jimp(1024, 1024);
  fillColor(icon, BG.r, BG.g, BG.b);
  drawSoftCircle(icon, 512, 512, 360, C1);
  drawSoftCircle(icon, 512, 512, 260, BG);
  drawSoftCircle(icon, 512, 512, 160, C2);
  drawCircle(icon, 320, 340, 55, C3.r, C3.g, C3.b);
  drawCircle(icon, 720, 380, 40, C3.r, C3.g, C3.b);
  drawCircle(icon, 360, 720, 35, C3.r, C3.g, C3.b);
  await saveImage(icon, path.join(OUT, 'icon.png'));
  console.log('✓ icon.png (1024x1024)');

  // splash.png 1242x2436 — 竖版，圆在上方
  const splash = new Jimp(1242, 2436);
  fillColor(splash, BG.r, BG.g, BG.b);
  drawSoftCircle(splash, 621, 950, 420, C1);
  drawSoftCircle(splash, 621, 950, 310, BG);
  drawSoftCircle(splash, 621, 950, 200, C2);
  drawCircle(splash, 380, 700, 70, C3.r, C3.g, C3.b);
  drawCircle(splash, 880, 780, 50, C3.r, C3.g, C3.b);
  drawCircle(splash, 420, 1180, 45, C3.r, C3.g, C3.b);
  await saveImage(splash, path.join(OUT, 'splash.png'));
  console.log('✓ splash.png (1242x2436)');

  // adaptive-icon.png 1024x1024 — 简洁版
  const adaptive = new Jimp(1024, 1024);
  fillColor(adaptive, BG.r, BG.g, BG.b);
  drawSoftCircle(adaptive, 512, 512, 360, C1);
  drawSoftCircle(adaptive, 512, 512, 260, BG);
  drawSoftCircle(adaptive, 512, 512, 160, C2);
  await saveImage(adaptive, path.join(OUT, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png (1024x1024)');

  // favicon.png 48x48
  const favicon = new Jimp(48, 48);
  fillColor(favicon, C1.r, C1.g, C1.b);
  await saveImage(favicon, path.join(OUT, 'favicon.png'));
  console.log('✓ favicon.png (48x48)');

  console.log('全部图片生成完毕！');
}

generate().catch((err) => {
  console.error('生成失败:', err);
  process.exit(1);
});
