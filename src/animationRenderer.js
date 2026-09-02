import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  characterMarkup,
  characterCss,
  castCss,
  pickCharacterForScene,
  getCharacterPalette,
  MASCOT_BY_ID,
  ALLOWED_MASCOT_IDS,
} from "./characterAssets.js";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 15;
const INTRO_DURATION = 5;
const OUTRO_DURATION = 5;

const HOST_IDS = ["sunny", "cloudie", "stella", "lunie", "roy"];

function baseCss() {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
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
    left: 50%;
    top: 35%;
    transform: translate(-50%, -50%);
    z-index: 10;
  }
  @keyframes bob {
    0%, 100% { transform: translate(-50%, -50%) translateY(0); }
    50% { transform: translate(-50%, -50%) translateY(-40px); }
  }
  @keyframes float-slow {
    0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(-3deg); }
    50% { transform: translate(-50%, -50%) translateY(-22px) rotate(3deg); }
  }
  @keyframes twinkle {
    0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
    25% { transform: translate(-50%, -50%) scale(1.08) rotate(6deg); }
    75% { transform: translate(-50%, -50%) scale(0.96) rotate(-6deg); }
  }
  @keyframes wave {
    0%, 100% { transform: translate(-50%, -50%) translateX(0); }
    25% { transform: translate(-50%, -50%) translateX(26px); }
    75% { transform: translate(-50%, -50%) translateX(-26px); }
  }

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
    color: white;
    font-size: 3vw;
    font-weight: bold;
    opacity: 0.4;
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
  .star {
    position: absolute;
    animation: twinkle-star ease-in-out infinite;
    opacity: 0.5;
  }
  @keyframes twinkle-star {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }

  .brand-title {
    position: absolute;
    top: 12%;
    left: 6%;
    right: 6%;
    text-align: center;
    font-size: 6vw;
    font-weight: 900;
    color: white;
    text-shadow: 3px 3px 0 rgba(0,0,0,0.18), 0 0 30px rgba(0,0,0,0.2);
    z-index: 25;
  }
  .brand-sub {
    position: absolute;
    top: 26%;
    left: 16%;
    right: 16%;
    text-align: center;
    font-size: 3.2vw;
    font-weight: bold;
    color: #333333;
    z-index: 25;
    background: rgba(255,255,255,0.6);
    border-radius: 999px;
    padding: 10px 0;
  }
  .brand-note {
    position: absolute;
    bottom: 10%;
    left: 10%;
    right: 10%;
    text-align: center;
    font-size: 2.8vw;
    color: white;
    text-shadow: 1px 1px 6px rgba(0,0,0,0.35);
    z-index: 25;
  }`;
}

function starMarkup(count, color) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const x = (i * 37 + 13) % 100;
    const y = (i * 53 + 7) % 90;
    const g = ["\u2606", "\u2605", "\u2726", "\u00B7"][i % 4];
    const dur = 2 + (i % 3);
    const delay = (i % 5) * 0.6;
    stars.push(
      `<div class="star" style="left:${x}%;top:${y}%;font-size:${1.6 + (i % 3)}vw;color:${color};animation-duration:${dur}s;animation-delay:${delay}s;">${g}</div>`
    );
  }
  return stars.join("\n  ");
}

function hostPositions() {
  return [
    { left: 16, top: 46 },
    { left: 34, top: 38 },
    { left: 51, top: 46 },
    { left: 68, top: 38 },
    { left: 84, top: 46 },
  ];
}

function buildSceneBody({ scene, char, chrMarkup }) {
  return `
<body style="background: linear-gradient(to bottom, ${char.palette.bg1}, ${char.palette.bg2});">
  <div class="ground"></div>
  ${starMarkup(12, char.palette.accent)}
  <div class="scene-label">${char.name} says hello</div>
  <div class="character" style="animation: ${char.animation} 1.5s ease-in-out infinite;">
    ${chrMarkup}
  </div>
  <div class="lyrics">${(scene.text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
</body>`;
}

function buildIntroBody({ channelName, chrMarkupById }) {
  const hosts = hostPositions()
    .map(
      (pos, i) => `
    <div class="character" style="left:${pos.left}%;top:${pos.top}%;animation: ${
      MASCOT_BY_ID[HOST_IDS[i]].animation
    } 1.6s ease-in-out ${i * 0.15}s infinite;">${chrMarkupById[HOST_IDS[i]]}</div>`
    )
    .join("");
  return `
<body style="background: linear-gradient(to bottom, #A4D8FF, #DFF4FF 60%, #FFFFFF);">
  ${starMarkup(14, "#FFD93D")}
  <div class="brand-title">${channelName}</div>
  <div class="brand-sub">Baby Rhymes &amp; Songs</div>
  ${hosts}
  <div class="brand-note">A brand new rhyme every day!</div>
</body>`;
}

function buildOutroBody({ channelName, chrMarkupById }) {
  const hosts = hostPositions()
    .map(
      (pos, i) => `
    <div class="character" style="left:${pos.left}%;top:${pos.top}%;animation: ${
      MASCOT_BY_ID[HOST_IDS[i]].id === "lunie" ? "float-slow" : "bob"
    } 2.2s ease-in-out ${i * 0.2}s infinite;">${chrMarkupById[HOST_IDS[i]]}</div>`
    )
    .join("");
  return `
<body style="background: linear-gradient(to bottom, #22245A, #3A3E92 60%, #5257B8);">
  ${starMarkup(20, "#FFF3C4")}
  <div class="brand-title">Thanks for watching!</div>
  <div class="brand-sub">New rhyming fun every day</div>
  ${hosts}
  <div class="brand-note">${channelName} &middot; Sweet dreams &amp; happy songs</div>
</body>`;
}

/**
 * Renders one HTML page as an mp4 (Puppeteer screenshots -> ffmpeg).
 * @returns {Promise<string>} absolute mp4 path
 */
async function renderHtmlVideo({ workDir, tag, html, duration, browser }) {
  const outPath = path.resolve(workDir, `${tag}.mp4`).replace(/\\/g, "/");
  const framesDir = path.resolve(workDir, `${tag}_frames`).replace(/\\/g, "/");
  const htmlPath = path.resolve(workDir, `${tag}.html`).replace(/\\/g, "/");
  fs.mkdirSync(framesDir, { recursive: true });

  fs.writeFileSync(htmlPath, html);
  const totalFrames = Math.ceil(duration * FPS);

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 400));

  const frameInterval = 1000 / FPS;
  for (let f = 0; f < totalFrames; f++) {
    const framePath = path.resolve(framesDir, `frame_${String(f).padStart(5, "0")}.png`);
    await page.screenshot({ path: framePath, type: "png" });
  }
  await page.close();

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
    throw new Error(`ffmpeg encode ${tag} failed: ${err.stderr?.toString()?.slice(-500) || err.message}`);
  }

  try {
    fs.rmSync(framesDir, { recursive: true, force: true });
    fs.rmSync(htmlPath, { force: true });
  } catch (_) {}
  return outPath;
}

function persistManifest(workDir, fileName, kind, entries) {
  fs.writeFileSync(
    path.resolve(workDir, fileName),
    JSON.stringify(
      {
        kind,
        characters: ALLOWED_MASCOT_IDS.slice(),
        entries,
      },
      null,
      2
    ),
    "utf-8"
  );
}

/**
 * Renders animated scenes using Puppeteer + HTML/CSS.
 * Every scene MUST use an approved Sky Friend (never a random design) and is
 * recorded in mascots-used.json for the copyright gate.
 *
 * @param {{ scenes: {text: string, visualKeyword: string, animationType: string}[], durations: number[], workDir: string }} opts
 * @returns {Promise<string[]>} paths to rendered scene videos
 */
export async function renderScenes({ scenes, durations, workDir }) {
  console.log("    [anim] Launching headless browser...");
  const styleBlock = `<style>${baseCss()}</style>`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const scenePaths = [];
  const usedEntries = [];

  try {
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const duration = durations[i];
      const char = pickCharacterForScene(scene, i);
      usedEntries.push({ scene: i, characterId: char.id, name: char.name });

      const charCssBlock = characterCss(char);
      const chrMarkup = characterMarkup(char, 25);
      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">${styleBlock}<style>${charCssBlock}</style></head>
${buildSceneBody({ scene, char, chrMarkup })}</html>`;

      console.log(
        `    [anim] Scene ${i}: ${duration.toFixed(1)}s (${scene.visualKeyword || "?"}) — host: ${char.name}`
      );
      const p = await renderHtmlVideo({ workDir, tag: `anim_${i}`, html, duration, browser });
      const stat = fs.statSync(p.replace(/\//g, "\\"));
      console.log(`    [anim] Scene ${i}: Done (${(stat.size / 1024).toFixed(0)}KB)`);
      scenePaths.push(p);
    }
  } finally {
    await browser.close();
  }

  persistManifest(workDir, "mascots-used.json", "scenes", usedEntries);
  console.log(`    [anim] Mascot manifest saved (${usedEntries.length} scenes, approved cast only)`);
  return scenePaths;
}

/**
 * Renders the brand intro and outro frames (full Sky Friends cast).
 * @param {{ workDir: string, channelName: string }} opts
 * @returns {Promise<{ introPath: string, outroPath: string }>}
 */
export async function renderIntroOutro({ workDir, channelName }) {
  const safeName = (channelName || "Cubicle Confessions").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const styleBlock = `<style>${baseCss()}${castCss()}</style>`;

  const chrMarkupById = {};
  for (const id of HOST_IDS) {
    chrMarkupById[id] = characterMarkup(MASCOT_BY_ID[id], 12);
  }

  const introHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">${styleBlock}</head>
${buildIntroBody({ channelName: safeName, chrMarkupById })}</html>`;

  const outroHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">${styleBlock}</head>
${buildOutroBody({ channelName: safeName, chrMarkupById })}</html>`;

  console.log(`    [anim] Rendering intro (${INTRO_DURATION}s)…`);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });
  let introPath;
  let outroPath;
  try {
    introPath = await renderHtmlVideo({ workDir, tag: "intro", html: introHtml, duration: INTRO_DURATION, browser });
    console.log(`    [anim] Rendering outro (${OUTRO_DURATION}s)…`);
    outroPath = await renderHtmlVideo({ workDir, tag: "outro", html: outroHtml, duration: OUTRO_DURATION, browser });
  } finally {
    await browser.close();
  }

  persistManifest(workDir, "brand-mascots.json", "brand", HOST_IDS.map((id) => ({ name: MASCOT_BY_ID[id].name, characterId: id })));

  return { introPath, outroPath, introDuration: INTRO_DURATION, outroDuration: OUTRO_DURATION };
}