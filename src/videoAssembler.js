import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function buildSrt(scenes, durations, outPath, offsetSec = 0) {
  let t = offsetSec;
  let srt = "";
  scenes.forEach((scene, i) => {
    const start = formatSrtTime(t);
    t += durations[i];
    const end = formatSrtTime(t);
    const text = scene.text.replace(/\n/g, " ").substring(0, 80);
    srt += `${i + 1}\n${start} --> ${end}\n${text}\n\n`;
  });
  fs.writeFileSync(outPath, srt);
  return outPath;
}

function formatSrtTime(seconds) {
  const ms = Math.floor((seconds % 1) * 1000);
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (n, len = 2) => String(n).padStart(len, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

function validateFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[videoAssembler] MISSING ${label}: ${filePath}`);
  }
  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    throw new Error(`[videoAssembler] EMPTY ${label}: ${filePath} (${stat.size} bytes)`);
  }
  console.log(`    [validate] ${label}: ${(stat.size / 1024).toFixed(1)}KB - OK`);
  return stat.size;
}

function probeDuration(filePath) {
  const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
  const out = execSync(cmd, { stdio: "pipe" }).toString().trim();
  const sec = parseFloat(out);
  if (!Number.isFinite(sec)) throw new Error(`[videoAssembler] Cannot probe duration: ${filePath}`);
  return sec;
}

function runFfmpegCmd(cmdStr, label) {
  console.log(`    [ffmpeg] ${label}: ${cmdStr.substring(0, 140)}...`);
  try {
    const output = execSync(cmdStr, { stdio: "pipe", timeout: 300000 });
    console.log(`    [ffmpeg] ${label}: Success`);
    return output;
  } catch (err) {
    const stderr = err.stderr?.toString() || "";
    const lastLines = stderr.split("\n").slice(-20).join("\n");
    throw new Error(`[videoAssembler] ${label} FAILED:\n${lastLines}`);
  }
}

/**
 * Assembles intro + animated scenes + outro, mixes narration + music + jingle.
 * Full validation and logging at every step.
 */
export async function assembleVideo({
  clipPaths,
  durations,
  scenes,
  narrationPath,
  workDir,
  musicPath,
  introPath,
  outroPath,
  jinglePath,
}) {
  console.log("\n    [assemble] === Starting video assembly ===");

  console.log("    [assemble] Validating inputs:");
  console.log(`    [assemble]   Scenes: ${clipPaths.length}`);
  console.log(`    [assemble]   Durations: ${durations.map((d) => d.toFixed(1) + "s").join(", ")}`);
  console.log(`    [assemble]   Intro: ${introPath ? "yes" : "no"}, Outro: ${outroPath ? "yes" : "no"}, Jingle: ${jinglePath ? "yes" : "no"}`);

  const introSec = introPath ? probeDuration(introPath) : 0;
  const outroSec = outroPath ? probeDuration(outroPath) : 0;
  const scenesSec = durations.reduce((a, b) => a + b, 0);
  const total = introSec + scenesSec + outroSec;
  console.log(`    [assemble]   Total: ${total.toFixed(1)}s (intro ${introSec.toFixed(1)} + scenes ${scenesSec.toFixed(1)} + outro ${outroSec.toFixed(1)})`);

  for (let i = 0; i < clipPaths.length; i++) {
    validateFile(clipPaths[i], `scene_${i}`);
  }
  validateFile(narrationPath, "narration");

  if (musicPath && fs.existsSync(musicPath)) {
    validateFile(musicPath, "music");
  } else {
    console.log("    [validate] music: Not provided (skipping music mix)");
    musicPath = null;
  }
  if (jinglePath && !fs.existsSync(jinglePath)) {
    console.log("    [validate] jingle: not found, skipping jingle mix");
    jinglePath = null;
  }

  const srtPath = path.resolve(workDir, "captions.srt").replace(/\\/g, "/");
  buildSrt(scenes, durations, srtPath, introSec);
  console.log(`    [assemble] SRT captions (offset ${introSec}s): ${srtPath}`);

  const concatPath = path.resolve(workDir, "concat.txt").replace(/\\/g, "/");
  const parts = [];
  if (introPath) parts.push(introPath);
  parts.push(...clipPaths);
  if (outroPath) parts.push(outroPath);
  fs.writeFileSync(concatPath, parts.map((p) => `file '${p}'`).join("\n"));

  const stitchedPath = path.resolve(workDir, "stitched.mp4").replace(/\\/g, "/");
  runFfmpegCmd(
    `ffmpeg -y -f concat -safe 0 -i "${concatPath}" -c copy "${stitchedPath}"`,
    "concat intro+scenes+outro"
  );
  validateFile(stitchedPath, "stitched");

  const finalPath = path.resolve(workDir, "final.mp4").replace(/\\/g, "/");
  const introMs = Math.round(introSec * 1000);
  const outroStartMs = Math.round((total - outroSec) * 1000);

  const filters = [];
  const inputs = [`-i "${stitchedPath}"`, `-i "${narrationPath}"`];
  const inputIdx = { video: 0, narr: 1 };
  let nextIdx = 2;

  filters.push(`[${inputIdx.narr}:a]volume=1.2,adelay=all=1:delays=${introMs}[narr]`);

  if (musicPath) {
    inputs.push(`-i "${musicPath}"`);
    const idx = nextIdx++;
    filters.push(
      `[${idx}:a]volume=0.2,afade=t=in:d=1.5,afade=t=out:st=${(total - 1).toFixed(2)}:d=1,atrim=0:${total.toFixed(2)}[music]`
    );
  }

  if (jinglePath) {
    inputs.push(`-i "${jinglePath}"`);
    const idx = nextIdx++;
    filters.push(
      `[${idx}:a]asplit=2[ja][jb];[ja]volume=0.9,adelay=all=1:delays=0[jin];[jb]volume=0.9,adelay=all=1:delays=${outroStartMs}[jout];[jin][jout]amix=inputs=2:duration=longest:dropout_transition=0[jmix]`
    );
  }

  const refs = ["[narr]"];
  if (musicPath) refs.push("[music]");
  if (jinglePath) refs.push("[jmix]");
  if (refs.length === 1) {
    filters.push(`[narr]atrim=0:${total.toFixed(2)}[aout]`);
  } else {
    filters.push(`${refs.join("")}amix=inputs=${refs.length}:duration=longest:dropout_transition=0[aout]`);
  }

  const filterComplex = filters.join(";");
  const cmd = [
    "ffmpeg -y",
    ...inputs,
    `-filter_complex "${filterComplex}"`,
    `-map "0:v" -map "[aout]"`,
    `-c:v copy -c:a aac -b:a 192k`,
    `-t ${total.toFixed(2)}`,
    `-movflags +faststart`,
    `"${finalPath}"`,
  ].join(" ");

  runFfmpegCmd(cmd, "mix narration + music + jingle");

  validateFile(finalPath, "final video");

  const finalStat = fs.statSync(finalPath.replace(/\//g, "\\"));
  console.log(`    [assemble] === Final video: ${(finalStat.size / 1024 / 1024).toFixed(1)}MB ===`);

  return finalPath;
}