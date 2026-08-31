import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

function buildSrt(scenes, durations, outPath) {
  let t = 0;
  let srt = "";
  scenes.forEach((scene, i) => {
    const start = formatSrtTime(t);
    t += durations[i];
    const end = formatSrtTime(t);
    srt += `${i + 1}\n${start} --> ${end}\n${scene.text}\n\n`;
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

function runFfmpeg(cmd) {
  return new Promise((resolve, reject) => {
    cmd.on("end", resolve).on("error", (err) => reject(new Error(err.message || String(err))));
    cmd.run();
  });
}

export async function assembleVideo({ clipPaths, durations, scenes, narrationPath, workDir, musicPath }) {
  const srtRaw = path.resolve(workDir, "captions.srt");
  buildSrt(scenes, durations, srtRaw);
  const srtPath = srtRaw.replace(/\\/g, "/");

  const trimmedPaths = [];
  for (let i = 0; i < clipPaths.length; i++) {
    const inPath = clipPaths[i];
    const outPath = path.resolve(workDir, `scene_${i}.mp4`).replace(/\\/g, "/");
    await runFfmpeg(
      ffmpeg(inPath)
        .inputOptions(["-stream_loop", "-1"])
        .outputOptions([
          `-t ${durations[i]}`,
          "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
          "-an",
          "-c:v", "libx264",
          "-preset", "ultrafast",
        ])
        .output(outPath)
    );
    trimmedPaths.push(outPath);
  }

  // Write concat file
  const concatPath = path.resolve(workDir, "concat.txt").replace(/\\/g, "/");
  fs.writeFileSync(concatPath, trimmedPaths.map((p) => `file '${p}'`).join("\n"));

  // Concatenate all scenes
  const stitchedPath = path.resolve(workDir, "stitched.mp4").replace(/\\/g, "/");
  await runFfmpeg(
    ffmpeg()
      .input(concatPath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions(["-c", "copy"])
      .output(stitchedPath)
  );

  // Mix narration + optional music + captions
  const finalPath = path.resolve(workDir, "final.mp4").replace(/\\/g, "/");
  const totalDuration = durations.reduce((a, b) => a + b, 0);

  const cmd = ffmpeg(stitchedPath)
    .input(narrationPath)
    .outputOptions([
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-c:a", "aac",
      "-shortest",
    ]);

  if (musicPath && fs.existsSync(musicPath)) {
    cmd.input(musicPath);
    cmd.outputOptions([
      "-filter_complex",
      `[1:a]volume=1.0[narr];[2:a]aloop=loop=-1:size=2e+09,volume=0.18,atrim=0:${totalDuration}[music];[narr][music]amix=inputs=2:duration=first:dropout_transition=2[aout]`,
      "-map", "0:v",
      "-map", "[aout]",
    ]);
  }

  await runFfmpeg(cmd.output(finalPath));

  return finalPath;
}
