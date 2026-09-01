import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function buildSrt(scenes, durations, outPath) {
  let t = 0;
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

function runFfmpegCmd(cmdStr, label) {
  console.log(`    [ffmpeg] ${label}: ${cmdStr.substring(0, 120)}...`);
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
 * Assembles animated scenes + narration + music into final video.
 * Full validation and logging at every step.
 */
export async function assembleVideo({ clipPaths, durations, scenes, narrationPath, workDir, musicPath }) {
  console.log("\n    [assemble] === Starting video assembly ===");

  console.log("    [assemble] Validating inputs:");
  console.log(`    [assemble]   Scenes: ${clipPaths.length}`);
  console.log(`    [assemble]   Durations: ${durations.map((d) => d.toFixed(1) + "s").join(", ")}`);
  console.log(`    [assemble]   Total: ${durations.reduce((a, b) => a + b, 0).toFixed(1)}s`);

  for (let i = 0; i < clipPaths.length; i++) {
    validateFile(clipPaths[i], `scene_${i}`);
  }
  const narrationSize = validateFile(narrationPath, "narration");

  if (musicPath && fs.existsSync(musicPath)) {
    validateFile(musicPath, "music");
  } else {
    console.log("    [validate] music: Not provided (skipping music mix)");
    musicPath = null;
  }

  const srtPath = path.resolve(workDir, "captions.srt").replace(/\\/g, "/");
  buildSrt(scenes, durations, srtPath);
  console.log(`    [assemble] SRT captions: ${srtPath}`);

  const concatPath = path.resolve(workDir, "concat.txt").replace(/\\/g, "/");
  const concatLines = clipPaths.map((p) => `file '${p}'`).join("\n");
  fs.writeFileSync(concatPath, concatLines);

  const stitchedPath = path.resolve(workDir, "stitched.mp4").replace(/\\/g, "/");
  runFfmpegCmd(
    `ffmpeg -y -f concat -safe 0 -i "${concatPath}" -c copy "${stitchedPath}"`,
    "concat scenes"
  );
  validateFile(stitchedPath, "stitched");

  const finalPath = path.resolve(workDir, "final.mp4").replace(/\\/g, "/");
  const totalDuration = durations.reduce((a, b) => a + b, 0);

  if (musicPath) {
    const cmd = [
      "ffmpeg -y",
      `-i "${stitchedPath}"`,
      `-i "${narrationPath}"`,
      `-i "${musicPath}"`,
      `-filter_complex`,
      `"[1:a]volume=1.2[narr];[2:a]aloop=loop=-1:size=2e+09,volume=0.2,afade=t=in:d=2,afade=t=out:st=${totalDuration - 2}:d=2,atrim=0:${totalDuration}[music];[narr][music]amix=inputs=2:duration=first:dropout_transition=3[aout]"`,
      `-map "0:v" -map "[aout]"`,
      `-c:v copy -c:a aac -b:a 192k`,
      `-t ${totalDuration}`,
      `-movflags +faststart`,
      `"${finalPath}"`,
    ].join(" ");

    runFfmpegCmd(cmd, "mix narration + music");
  } else {
    const cmd = [
      "ffmpeg -y",
      `-i "${stitchedPath}"`,
      `-i "${narrationPath}"`,
      `-map "0:v" -map "1:a"`,
      `-c:v copy -c:a aac -b:a 192k`,
      `-shortest`,
      `-movflags +faststart`,
      `"${finalPath}"`,
    ].join(" ");

    runFfmpegCmd(cmd, "mix narration only");
  }

  validateFile(finalPath, "final video");

  const finalStat = fs.statSync(finalPath.replace(/\//g, "\\"));
  console.log(`    [assemble] === Final video: ${(finalStat.size / 1024 / 1024).toFixed(1)}MB ===`);

  return finalPath;
}
