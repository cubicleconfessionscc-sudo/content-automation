import fs from "fs";
import axios from "axios";
import { config } from "./config.js";

/**
 * Fetches one vertical stock video clip per scene keyword from Pexels.
 * If you'd rather use your own asset library, replace the body of this
 * function to pull from a local folder keyed by tag instead.
 *
 * @param {string[]} keywords
 * @param {string} workDir
 * @returns {Promise<string[]>} local file paths, one per keyword
 */
export async function fetchClipsForKeywords(keywords, workDir) {
  const paths = [];

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    const outPath = `${workDir}/clip_${i}.mp4`;

    if (!config.pexelsApiKey) {
      console.warn(
        `[mediaFetcher] No PEXELS_API_KEY set — skipping fetch for "${keyword}". ` +
          `Drop your own clip at ${outPath} manually.`
      );
      paths.push(outPath);
      continue;
    }

    const search = await axios.get("https://api.pexels.com/videos/search", {
      headers: { Authorization: config.pexelsApiKey },
      params: { query: keyword, orientation: "portrait", per_page: 1 },
    });

    const video = search.data.videos?.[0];
    if (!video) {
      console.warn(`[mediaFetcher] No results for "${keyword}"`);
      paths.push(null);
      continue;
    }

    // Pick the smallest file that's still HD-ish, to keep downloads fast.
    const file =
      video.video_files.find((f) => f.quality === "hd") || video.video_files[0];

    const res = await axios.get(file.link, { responseType: "arraybuffer" });
    fs.writeFileSync(outPath, res.data);
    paths.push(outPath);
  }

  return paths;
}
