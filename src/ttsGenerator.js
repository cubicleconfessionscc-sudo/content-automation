import fs from "fs";
import path from "path";
import { MsEdgeTTS } from "msedge-tts";

const VOICE = "en-US-AriaNeural";

/**
 * Generates narration audio for the full script using Microsoft Edge TTS (free).
 *
 * @param {string} fullText
 * @param {string} outPath - e.g. work/narration.mp3
 */
export async function generateNarration(fullText, outPath) {
  const dir = path.dirname(outPath);
  fs.mkdirSync(dir, { recursive: true });

  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, "audio-24khz-96kbitrate-mono-mp3");
  await tts.toFile(dir, fullText);

  const generated = path.join(dir, "audio.mp3");
  if (fs.existsSync(generated)) {
    fs.copyFileSync(generated, outPath);
  }
  return outPath;
}

/**
 * Rough estimate of narration duration per scene.
 * Average speaking rate ~2.5 words/sec.
 */
export function estimateSceneDurations(scenes) {
  return scenes.map((s) => {
    const words = s.text.trim().split(/\s+/).length;
    return Math.max(2, words / 2.5);
  });
}
