import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 15;

const PALETTES = [
  { bg: "#FF6B6B", accent: "#FFF8DC", shape: "#FFFFFF", text: "#333333" },
  { bg: "#4ECDC4", accent: "#E0FFFF", shape: "#FFFFFF", text: "#1a1a2e" },
  { bg: "#45B7D1", accent: "#F0F8FF", shape: "#FFFFFF", text: "#16213e" },
  { bg: "#FFA07A", accent: "#FFF5EE", shape: "#FFFFFF", text: "#2d132c" },
  { bg: "#98D8C8", accent: "#F0FFF0", shape: "#FFFFFF", text: "#1a1a2e" },
  { bg: "#F7DC6F", accent: "#FFFACD", shape: "#FFFFFF", text: "#2c3e50" },
  { bg: "#BB8FCE", accent: "#F5F0FF", shape: "#FFFFFF", text: "#1a1a2e" },
  { bg: "#85C1E9", accent: "#EBF5FB", shape: "#FFFFFF", text: "#1a1a2e" },
  { bg: "#F1948A", accent: "#FFF0F5", shape: "#FFFFFF", text: "#2c1810" },
  { bg: "#82E0AA", accent: "#F0FFF0", shape: "#FFFFFF", text: "#1a3c34" },
];

const CHARACTER_FEATURES = [
  { shape: "circle", eyes: "round", mouth: "smile" },
  { shape: "circle", eyes: "round", mouth: "open" },
  { shape: "square", eyes: "dots", mouth: "smile" },
  { shape: "circle", eyes: "wink", mouth: "smile" },
  { shape: "circle", eyes: "round", mouth: "surprised" },
];

function generateSceneHTML({ scene, duration, palette, features, sceneIndex }) {
  const bgColor = palette.bg;
  const accentColor = palette.accent;
  const shapeColor = palette.shape;
  const textColor = palette.text;
  const totalFrames = Math.ceil(duration * FPS);

  const shapes = [];
  for (let j = 0; j < 8; j++) {
    const x = 10 + Math.random() * 80;
    const y = 5 + Math.random() * 85;
    const size = 3 + Math.random() * 8;
    const dur = 3 + Math.random() * 4;
    const delay = j * 0.4;
    const opacity = 0.15 + Math.random() * 0.25;
    shapes.push(`<div class="floating-shape" style="
      left:${x}%; top:${y}%;
      width:${size}vw; height:${size}vw;
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      opacity:${opacity};
      background:${accentColor};
      border-radius:${j % 2 === 0 ? "50%" : "20%"};
    "></div>`);
  }

  const characterX = 50;
  const characterY = 35;
  const charSize = 25;
  const eyeOffsetX = features.eyes === "wink" ? 3 : 2.5;
  const eyeSize = features.eyes === "dots" ? 1.2 : 1.8;

  const bounceClass = scene.animationType || "bounce";

  const lyricText = scene.text.length > 60 ? scene.text.substring(0, 60) + "..." : scene.text;

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: ${bgColor};
    overflow: hidden;
    font-family: 'Arial Rounded MT Bold', 'Nunito', Arial, sans-serif;
    position: relative;
  }

  .floating-shape {
    position: absolute;
    border-radius: 50%;
    animation: float ease-in-out infinite alternate;
  }

  @keyframes float {
    0% { transform: translateY(0) translateX(0) rotate(0deg); }
    100% { transform: translateY(-30px) translateX(15px) rotate(10deg); }
  }

  .character {
    position: absolute;
    left: ${characterX}%;
    top: ${characterY}%;
    transform: translate(-50%, -50%);
    animation: ${bounceClass} 1.5s ease-in-out infinite;
    z-index: 10;
  }

  @keyframes bounce {
    0%, 100% { transform: translate(-50%, -50%) translateY(0); }
    50% { transform: translate(-50%, -50%) translateY(-40px); }
  }

  @keyframes float-char {
    0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(-3deg); }
    50% { transform: translate(-50%, -50%) translateY(-25px) rotate(3deg); }
  }

  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes zoom {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.2); }
  }

  @keyframes wave {
    0%, 100% { transform: translate(-50%, -50%) translateX(0); }
    25% { transform: translate(-50%, -50%) translateX(30px); }
    75% { transform: translate(-50%, -50%) translateX(-30px); }
  }

  @keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.85; }
  }

  @keyframes slide {
    0% { transform: translate(-100%, -50%); }
    100% { transform: translate(-50%, -50%); }
  }

  @keyframes twinkle {
    0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
    25% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); opacity: 0.7; }
    75% { transform: translate(-50%, -50%) scale(0.95) rotate(-5deg); opacity: 0.9; }
  }

  .body-circle {
    width: ${charSize}vw;
    height: ${charSize}vw;
    background: ${shapeColor};
    border-radius: 50%;
    position: relative;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  }

  .eye {
    position: absolute;
    background: ${textColor};
    border-radius: 50%;
    top: 30%;
  }
  .eye.left { left: ${50 - eyeOffsetX}%; transform: translateX(-100%); }
  .eye.right { left: ${50 + eyeOffsetX}%; }

  .eye-dot {
    width: ${eyeSize}vw;
    height: ${eyeSize}vw;
  }
  .eye-round {
    width: ${eyeSize * 1.2}vw;
    height: ${eyeSize * 1.4}vw;
  }
  .eye-wink {
    width: ${eyeSize * 1.5}vw;
    height: ${eyeSize * 0.4}vw;
    border-radius: ${eyeSize}vw ${eyeSize}vw 0 0;
  }

  .eye-shine {
    position: absolute;
    background: white;
    border-radius: 50%;
    width: ${eyeSize * 0.4}vw;
    height: ${eyeSize * 0.4}vw;
    top: 15%;
    right: 10%;
  }

  .mouth {
    position: absolute;
    left: 50%;
    top: 60%;
    transform: translateX(-50%);
  }
  .mouth-smile {
    width: ${charSize * 0.4}vw;
    height: ${charSize * 0.2}vw;
    border: 3px solid ${textColor};
    border-top: none;
    border-radius: 0 0 ${charSize}vw ${charSize}vw;
  }
  .mouth-open {
    width: ${charSize * 0.25}vw;
    height: ${charSize * 0.25}vw;
    background: ${textColor};
    border-radius: 50%;
  }
  .mouth-surprised {
    width: ${charSize * 0.2}vw;
    height: ${charSize * 0.2}vw;
    border: 3px solid ${textColor};
    border-radius: 50%;
  }

  .cheek {
    position: absolute;
    width: ${charSize * 0.2}vw;
    height: ${charSize * 0.15}vw;
    background: #FFB6C1;
    border-radius: 50%;
    top: 50%;
    opacity: 0.6;
  }
  .cheek.left { left: 12%; }
  .cheek.right { right: 12%; }

  .lyrics {
    position: absolute;
    bottom: 8%;
    left: 8%;
    right: 8%;
    text-align: center;
    color: white;
    font-size: 3.5vw;
    font-weight: bold;
    line-height: 1.6;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.4), 0 0 20px rgba(0,0,0,0.2);
    z-index: 20;
    padding: 20px;
    background: rgba(0,0,0,0.15);
    border-radius: 20px;
    backdrop-filter: blur(4px);
    animation: fadeInUp 0.8s ease-out;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .scene-label {
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    color: ${textColor};
    font-size: 3vw;
    font-weight: bold;
    opacity: 0.3;
    z-index: 5;
  }

  .ground {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 25%;
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.08));
    z-index: 1;
  }

  .stars {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30%;
    z-index: 2;
  }
  .star {
    position: absolute;
    color: ${accentColor};
    font-size: 2vw;
    animation: twinkle-star ease-in-out infinite;
    opacity: 0.4;
  }
  @keyframes twinkle-star {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
</style>
</head>
<body>
  ${shapes.join("\n  ")}

  <div class="ground"></div>

  <div class="character">
    <div class="body-circle">
      <div class="eye left eye-${features.eyes}">
        <div class="eye-shine"></div>
      </div>
      <div class="eye right eye-${features.eyes}">
        <div class="eye-shine"></div>
      </div>
      <div class="cheek left"></div>
      <div class="cheek right"></div>
      <div class="mouth mouth-${features.mouth}"></div>
    </div>
  </div>

  <div class="lyrics">${lyricText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>

  <script>
    // Generate random stars
    const starsContainer = document.querySelector('.stars');
    for (let i = 0; i < 15; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.textContent = ['\\u2B50', '\\u2728', '\\u2606', '\\u2605'][Math.floor(Math.random() * 4)];
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDuration = (2 + Math.random() * 3) + 's';
      star.style.animationDelay = Math.random() * 2 + 's';
      starsContainer.appendChild(star);
    }
  </script>
</body>
</html>`;
}

/**
 * Renders animated scenes using Puppeteer + HTML/CSS.
 * Each scene gets an original character with animated motion, floating shapes, and lyrics overlay.
 *
 * @param {{ scenes: {text: string, visualKeyword: string, animationType: string}[], durations: number[], workDir: string }} opts
 * @returns {Promise<string[]>} paths to rendered scene videos
 */
export async function renderScenes({ scenes, durations, workDir }) {
  console.log("    [anim] Launching headless browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const scenePaths = [];

  try {
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const duration = durations[i];
      const outPath = path.resolve(workDir, `anim_${i}.mp4`).replace(/\\/g, "/");
      const framesDir = path.resolve(workDir, `frames_${i}`).replace(/\\/g, "/");
      fs.mkdirSync(framesDir, { recursive: true });

      const palette = PALETTES[i % PALETTES.length];
      const features = CHARACTER_FEATURES[i % CHARACTER_FEATURES.length];
      const totalFrames = Math.ceil(duration * FPS);

      console.log(`    [anim] Scene ${i}: ${duration.toFixed(1)}s, ${totalFrames} frames (${scene.visualKeyword})`);

      const html = generateSceneHTML({
        scene,
        duration,
        palette,
        features,
        sceneIndex: i,
      });

      const htmlPath = path.resolve(workDir, `scene_${i}.html`).replace(/\\/g, "/");
      fs.writeFileSync(htmlPath, html);

      const page = await browser.newPage();
      await page.setViewport({ width: WIDTH, height: HEIGHT });

      await page.setContent(html, { waitUntil: "domcontentloaded" });
      await new Promise((r) => setTimeout(r, 500));

      const frameInterval = 1000 / FPS;
      for (let f = 0; f < totalFrames; f++) {
        const frameTime = f * frameInterval;
        await page.evaluate((ms) => {
          document.querySelectorAll("*").forEach((el) => {
            const style = getComputedStyle(el);
            if (style.animationDuration) {
              el.style.animationPlayState = "running";
            }
          });
        }, frameTime);

        const framePath = path.resolve(framesDir, `frame_${String(f).padStart(5, "0")}.png`);
        await page.screenshot({ path: framePath, type: "png" });
      }

      await page.close();

      console.log(`    [anim] Scene ${i}: Captured ${totalFrames} frames, encoding to video...`);

      const cmd = [
        "ffmpeg -y",
        `-framerate ${FPS}`,
        `-i "${framesDir}/frame_%05d.png"`,
        `-c:v libx264 -preset fast -pix_fmt yuv420p -movflags +faststart`,
        `-t ${duration}`,
        `"${outPath}"`,
      ].join(" ");

      try {
        execSync(cmd, { stdio: "pipe" });
      } catch (err) {
        throw new Error(`ffmpeg encode scene ${i} failed: ${err.stderr?.toString()?.slice(-500) || err.message}`);
      }

      const stat = fs.statSync(outPath.replace(/\//g, "\\"));
      console.log(`    [anim] Scene ${i}: Done (${(stat.size / 1024).toFixed(0)}KB)`);

      scenePaths.push(outPath);

      try {
        fs.rmSync(framesDir, { recursive: true, force: true });
        fs.rmSync(htmlPath, { force: true });
      } catch (_) {}
    }
  } finally {
    await browser.close();
  }

  return scenePaths;
}
