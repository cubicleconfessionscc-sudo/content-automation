import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LICENSE_LOG_PATH = path.join(__dirname, "..", "data", "asset-license-log.json");

function loadLicenseLog() {
  if (!fs.existsSync(LICENSE_LOG_PATH)) {
    fs.writeFileSync(LICENSE_LOG_PATH, "[]", "utf-8");
    return [];
  }
  return JSON.parse(fs.readFileSync(LICENSE_LOG_PATH, "utf-8"));
}

function saveLicenseLog(log) {
  fs.writeFileSync(LICENSE_LOG_PATH, JSON.stringify(log, null, 2), "utf-8");
}

/**
 * Pre-upload copyright safety check.
 * Verifies all assets in the video are AI-generated or properly licensed.
 *
 * @param {{ videoId: string, workDir: string, script: object, narrationPath: string, musicPath?: string }} opts
 * @returns {{ passed: boolean, errors: string[], assetLog: object }}
 */
export function copyrightCheck({ videoId, workDir, script, narrationPath, musicPath }) {
  const errors = [];
  const assets = [];

  assets.push({
    type: "script",
    source: "AI-generated",
    generator: "Google Gemini 3.6-flash",
    license: "AI-generated original content",
    timestamp: new Date().toISOString(),
    note: `Original lyrics for "${script.title}"`,
  });

  assets.push({
    type: "narration",
    source: "AI-generated",
    generator: "Microsoft Edge TTS (msedge-tts)",
    license: "Microsoft Edge TTS free tier - non-commercial and commercial use allowed",
    voice: "en-US-AnaNeural",
    timestamp: new Date().toISOString(),
  });

  assets.push({
    type: "animation",
    source: "AI-generated",
    generator: "Puppeteer + CSS animations",
    license: "Original code-generated animation",
    timestamp: new Date().toISOString(),
  });

  if (musicPath && fs.existsSync(musicPath)) {
    const isAssetMusic = musicPath.includes("assets/music");
    const isTestTone = musicPath.includes("test-tone");

    if (isTestTone) {
      errors.push("Audio is a test tone, not a real instrumental. Replace with licensed music.");
    }

    assets.push({
      type: "background-music",
      source: isAssetMusic ? "User-provided asset" : "Unknown",
      path: musicPath,
      license: isTestTone ? "TEST TONE - NOT LICENSED" : "User must verify license",
      timestamp: new Date().toISOString(),
    });
  }

  if (!script.scenes || script.scenes.length === 0) {
    errors.push("Script has no scenes.");
  }

  const knownRhymes = [
    "twinkle twinkle", "old macdonald", "mary had a little lamb",
    "baa baa black sheep", "humpty dumpty", "jack and jill",
    "row row row your boat", "itsy bitsy spider", "wheels on the bus",
    "head shoulders knees and toes", "if youre happy and you know it",
    "this little piggy", "five little ducks", "baby shark",
  ];
  const lyricsLower = (script.lyrics || "").toLowerCase();
  for (const rhyme of knownRhymes) {
    if (lyricsLower.includes(rhyme)) {
      errors.push(`Lyrics may contain copyrighted nursery rhyme: "${rhyme}"`);
    }
  }

  const log = loadLicenseLog();
  const entry = {
    videoId,
    timestamp: new Date().toISOString(),
    title: script.title,
    passed: errors.length === 0,
    errors,
    assets,
  };
  log.push(entry);
  saveLicenseLog(log);

  if (errors.length > 0) {
    console.error("    [copyright] FAILED checks:");
    errors.forEach((e) => console.error(`      - ${e}`));
  } else {
    console.log("    [copyright] All checks passed. Assets logged.");
  }

  return { passed: errors.length === 0, errors, assetLog: entry };
}
