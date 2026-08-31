import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const COLORS = [
  "0xFF6B6B", "0x4ECDC4", "0x45B7D1", "0xFFA07A", "0x98D8C8",
  "0xF7DC6F", "0xBB8FCE", "0x85C1E9", "0xF1948A", "0x82E0AA",
  "0xF8C471", "0xAED6F1", "0xD7BDE2", "0xA3E4D7", "0xFAD7A0",
];

const SHAPES = ["circle", "square", "triangle", "diamond", "star"];

const ACCENT_COLORS = [
  "0xFFFFFF", "0xFFF8DC", "0xFFFACD", "0xFFE4E1", "0xE0FFFF",
  "0xF0FFF0", "0xFFF0F5", "0xF5F5DC", "0xFFEFD5", "0xE6E6FA",
];

function hexToRgb(hex) {
  const h = hex.replace("0x", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "black" : "white";
}

function escapeFfmpegText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\u2019")
    .replace(/:/g, "\u2014")
    .replace(/%/g, "%%");
}

function buildAnimatedFilter(bgColor, accentColor, textColor, duration, fps, sceneIndex) {
  const w = 1080;
  const h = 1920;
  const shapeType = SHAPES[sceneIndex % SHAPES.length];

  let drawShapes = "";

  for (let j = 0; j < 5; j++) {
    const startX = Math.floor(100 + Math.random() * (w - 200));
    const startY = Math.floor(100 + Math.random() * (h - 400));
    const size = 60 + Math.floor(Math.random() * 80);
    const speed = 0.5 + Math.random() * 1.5;
    const delay = j * 0.3;

    const xExpr = `${startX}+sin((t-${delay})*${speed})*80`;
    const yExpr = `${startY}+cos((t-${delay})*${speed * 0.7})*60`;

    if (shapeType === "circle" || j % 3 === 0) {
      drawShapes += `,drawbox=x=${xExpr}:y=${yExpr}:w=${size}:h=${size}:color=${accentColor}@0.4:t=fill`;
    } else if (shapeType === "square" || j % 3 === 1) {
      drawShapes += `,drawbox=x=${xExpr}:y=${yExpr}:w=${size}:h=${size}:color=${accentColor}@0.3:t=fill`;
    } else {
      drawShapes += `,drawbox=x=${xExpr}:y=${yExpr}:w=${size * 0.8}:h=${size * 0.8}:color=${accentColor}@0.25:t=fill`;
    }
  }

  const centerCircleSize = 120 + Math.floor(Math.abs(Math.sin(sceneIndex * 1.5)) * 100);
  drawShapes += `,drawbox=x=(w-${centerCircleSize})/2:y=(h-${centerCircleSize})/2:w=${centerCircleSize}:h=${centerCircleSize}:color=${accentColor}@0.5:t=fill`;
  drawShapes += `,drawbox=x=(w-${centerCircleSize + 40})/2:y=(h-${centerCircleSize + 40})/2:w=${centerCircleSize + 40}:h=${centerCircleSize + 40}:color=${accentColor}@0.2:t=fill`;

  const filter = `color=c=${bgColor}:s=${w}x${h}:d=${duration}:r=${fps}${drawShapes}`;
  return filter;
}

/**
 * Renders animated scenes using ffmpeg.
 * Each scene gets a colorful background with floating shapes and motion.
 *
 * @param {{ scenes: {text: string, visualKeyword: string, animationType: string}[], durations: number[], workDir: string }} opts
 * @returns {Promise<string[]>} paths to rendered scene videos
 */
export async function renderScenes({ scenes, durations, workDir }) {
  const scenePaths = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const duration = durations[i];
    const outPath = path.resolve(workDir, `anim_${i}.mp4`).replace(/\\/g, "/");
    const bgColor = COLORS[i % COLORS.length];
    const accentColor = ACCENT_COLORS[i % ACCENT_COLORS.length];
    const fps = 30;

    const filter = buildAnimatedFilter(bgColor, accentColor, "white", duration, fps, i);

    const cmd = [
      "ffmpeg -y",
      `-f lavfi -i "${filter}"`,
      `-t ${duration}`,
      `-c:v libx264 -preset ultrafast -pix_fmt yuv420p -movflags +faststart`,
      `"${outPath}"`,
    ].join(" ");

    try {
      execSync(cmd, { stdio: "pipe" });
      console.log(`    Scene ${i}: ${duration.toFixed(1)}s (${scene.visualKeyword})`);
    } catch (err) {
      throw new Error(`ffmpeg scene ${i} failed: ${err.stderr?.toString()?.slice(-500) || err.message}`);
    }

    scenePaths.push(outPath);
  }

  return scenePaths;
}
