import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JINGLE_DURATION = 5;

// Original hook (twice): C5-A4-G4-E4 | G4-C5  — an ascending happy motif.
// Fundamental frequencies only; simple sine plucks with exponential decay.
const NOTES = [
  [523.25, 0.22],
  [440.0, 0.22],
  [392.0, 0.22],
  [329.63, 0.22],
  [392.0, 0.3],
  [523.25, 0.42],
  [523.25, 0.22],
  [440.0, 0.22],
  [392.0, 0.22],
  [329.63, 0.22],
  [392.0, 0.3],
  [523.25, 0.5],
];

/**
 * Generates the original channel jingle with ffmpeg (sine synthesis only —
 * no samples, no melodic copies) and writes jingle.mp3.
 * @returns {string} path to jingle.mp3
 */
export function generateJingle(outDir = path.join(__dirname, "..", "assets", "audio")) {
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "jingle.mp3");

  const inputs = [];
  const noteLabels = [];
  for (let i = 0; i < NOTES.length; i++) {
    const [freq, dur] = NOTES[i];
    inputs.push(`-f lavfi -i "aevalsrc=0.4*sin(2*PI*${freq}*t)*exp(-3*t):d=${dur}:s=44100"`);
    noteLabels.push(`[${i}:a]`);
  }
  const bedIndex = NOTES.length;
  inputs.push(
    `-f lavfi -i "aevalsrc=0.05*sin(2*PI*261.63*t)+0.04*sin(2*PI*329.63*t)+0.04*sin(2*PI*392*t)+0.02*sin(2*PI*523.25*t):d=${JINGLE_DURATION}:s=44100"`
  );

  const concatExpr = `${noteLabels.join("")}concat=n=${NOTES.length}:v=0:a=1[m]`;
  const filter = concatExpr + `;[m][${bedIndex}:a]amix=inputs=2:duration=longest:dropout_transition=0[mix];[mix]atrim=0:${JINGLE_DURATION},afade=t=out:st=4.0:d=1.0,aformat=channel_layouts=stereo[aout]`;

  const cmd = [
    "ffmpeg -y",
    ...inputs,
    `-filter_complex "${filter}"`,
    `-map "[aout]" -c:a libmp3lame -b:a 192k`,
    `"${outPath}"`,
  ].join(" ");

  try {
    execSync(cmd, { stdio: "pipe", timeout: 120000 });
  } catch (err) {
    throw new Error(`[jingle] generation failed: ${err.stderr?.toString()?.slice(-500) || err.message}`);
  }

  const stat = fs.statSync(outPath);
  console.log(`    [jingle] Generated ${outPath} (${(stat.size / 1024).toFixed(1)}KB, ${JINGLE_DURATION}s)`);
  return outPath;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  generateJingle();
}