import fs from "fs";
import { config } from "./config.js";
import { generateScript } from "./scriptGenerator.js";
import { generateNarration, estimateSceneDurations } from "./ttsGenerator.js";
import { fetchClipsForKeywords } from "./mediaFetcher.js";
import { assembleVideo } from "./videoAssembler.js";
import { uploadToYouTube } from "./youtubeUploader.js";
import { uploadToInstagram } from "./instagramUploader.js";
import { hostFilePublicly } from "./mediaHost.js";

async function main() {
  const args = process.argv.slice(2);
  const publish = args.includes("--publish");
  const topic = args.filter((a) => a !== "--publish").join(" ");

  if (!topic) {
    console.error('Usage: node src/index.js "your topic" [--publish]');
    process.exit(1);
  }

  const workDir = config.paths.work;
  fs.mkdirSync(workDir, { recursive: true });

  console.log(`\n[1/6] Generating script for: "${topic}"`);
  const script = await generateScript(topic);
  fs.writeFileSync(`${workDir}/script.json`, JSON.stringify(script, null, 2));
  console.log(`   -> "${script.title}" (${script.scenes.length} scenes)`);

  console.log("[2/6] Generating narration audio");
  const fullText = script.scenes.map((s) => s.text).join(" ");
  const narrationPath = `${workDir}/narration.mp3`;
  await generateNarration(fullText, narrationPath);
  const durations = estimateSceneDurations(script.scenes);

  console.log("[3/6] Fetching background clips");
  const keywords = script.scenes.map((s) => s.visualKeyword);
  const clipPaths = await fetchClipsForKeywords(keywords, workDir);

  console.log("[4/6] Assembling video (ffmpeg)");
  const finalPath = await assembleVideo({
    clipPaths,
    durations,
    scenes: script.scenes,
    narrationPath,
    workDir,
  });
  console.log(`   -> ${finalPath}`);

  if (!publish) {
    console.log("\nDone (local only). Re-run with --publish to upload to YouTube + Instagram.");
    return;
  }

  console.log("[5/6] Uploading to YouTube");
  const ytUrl = await uploadToYouTube({
    filePath: finalPath,
    title: script.title,
    description: fullText,
    tags: keywords,
  });
  console.log(`   -> ${ytUrl}`);

  console.log("[6/6] Uploading to Instagram");
  const publicUrl = await hostFilePublicly(finalPath);
  const igUrl = await uploadToInstagram({ publicVideoUrl: publicUrl, caption: fullText });
  console.log(`   -> ${igUrl}`);

  console.log("\nAll done.");
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
