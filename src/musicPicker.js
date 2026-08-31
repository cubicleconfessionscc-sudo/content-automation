import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MUSIC_DIR = path.join(__dirname, "..", "assets", "music");

const MOODS = ["upbeat", "chill", "dramatic", "motivational"];

/**
 * Picks a random music track from the folder matching the given mood.
 * Falls back to any available mood if the requested one has no tracks.
 *
 * @param {string} mood - one of: upbeat, chill, dramatic, motivational
 * @returns {string | null} absolute path to an mp3 file, or null if none found
 */
export function pickMusicTrack(mood) {
  const normalizedMood = mood?.toLowerCase() || "upbeat";
  const moodFolder = MOODS.includes(normalizedMood) ? normalizedMood : "upbeat";

  let track = pickRandomFromMood(moodFolder);

  if (!track) {
    for (const fallbackMood of MOODS) {
      if (fallbackMood === moodFolder) continue;
      track = pickRandomFromMood(fallbackMood);
      if (track) {
        console.warn(`[musicPicker] No tracks in "${moodFolder}", using "${fallbackMood}" fallback`);
        break;
      }
    }
  }

  return track;
}

function pickRandomFromMood(mood) {
  const dir = path.join(MUSIC_DIR, mood);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ext === ".mp3" || ext === ".wav" || ext === ".ogg" || ext === ".m4a";
  });

  if (files.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * files.length);
  return path.join(dir, files[randomIndex]);
}
