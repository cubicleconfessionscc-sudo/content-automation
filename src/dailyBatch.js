import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { pickNextStory, markStoryUsed, remainingStories } from "./storyPicker.js";
import { generateScript } from "./scriptGenerator.js";
import { generateNarration, estimateSceneDurations } from "./ttsGenerator.js";
import { renderScenes } from "./animationRenderer.js";
import { assembleVideo } from "./videoAssembler.js";
import { generateMetadata } from "./metadataGenerator.js";
import { uploadToYouTube } from "./youtubeUploader.js";

const DAILY_LIMIT = parseInt(process.env.DAILY_UPLOAD_LIMIT || "1", 10);

async function main() {
  console.log(`[batch] Daily upload limit: ${DAILY_LIMIT}`);
  console.log(`[batch] Stories remaining: ${remainingStories()}`);

  let uploaded = 0;

  while (uploaded < DAILY_LIMIT) {
    const story = pickNextStory();
    if (!story) {
      console.log("[batch] Story queue is empty. Nothing to upload.");
      break;
    }

    const workDir = path.join(config.paths.work, story.id);
    fs.mkdirSync(workDir, { recursive: true });

    console.log(`\n[batch] Processing (${uploaded + 1}/${DAILY_LIMIT}): "${story.topic}"`);

    try {
      // Step 1: Generate script
      console.log("  [1/6] Generating rhyme lyrics...");
      const script = await generateScript(story.topic, story.animalName);
      fs.writeFileSync(path.join(workDir, "script.json"), JSON.stringify(script, null, 2));
      console.log(`    Title: "${script.title}"`);
      console.log(`    Scenes: ${script.scenes.length}`);

      // Step 2: Generate narration
      console.log("  [2/6] Generating narration...");
      const fullText = script.scenes.map((s) => s.text).join(" ");
      const narrationPath = path.join(workDir, "narration.mp3");
      await generateNarration(fullText, narrationPath);
      const durations = estimateSceneDurations(script.scenes);

      // Step 3: Pick background music
      console.log("  [3/6] Selecting background music...");
      const musicPath = pickKidsMusic();

      // Step 4: Render animation
      console.log("  [4/6] Rendering animation...");
      const scenePaths = await renderScenes({
        scenes: script.scenes,
        durations,
        workDir,
      });
      console.log(`    Rendered ${scenePaths.length} scenes`);

      // Step 5: Assemble video
      console.log("  [5/6] Assembling video...");
      const finalPath = path.join(workDir, "final.mp4");
      await assembleVideo({
        clipPaths: scenePaths,
        durations,
        scenes: script.scenes,
        narrationPath,
        workDir,
        musicPath: musicPath || undefined,
      });
      console.log(`    Output: ${finalPath}`);

      // Step 6: Generate metadata and upload
      console.log("  [6/6] Generating metadata...");
      const metadata = await generateMetadata(script);
      console.log(`    YouTube title: "${metadata.youtubeTitle}"`);
      fs.writeFileSync(path.join(workDir, "metadata.json"), JSON.stringify(metadata, null, 2));

      console.log("  [upload] Uploading to YouTube...");
      const { url, videoId } = await uploadToYouTube({
        filePath: finalPath,
        title: metadata.youtubeTitle,
        description: metadata.youtubeDescription,
        tags: metadata.youtubeTags,
      });
      console.log(`    YouTube: ${url}`);

      // Mark as used and log
      markStoryUsed(story.id, { videoId, url });
      console.log(`  [done] "${story.topic}" published successfully.`);

      uploaded++;
    } catch (err) {
      console.error(`\n  [FAILED] ${err.message}`);
      console.error("  Story was NOT marked as used. Will retry next run.");
      break;
    }
  }

  console.log(`\n[batch] Done. Uploaded ${uploaded}/${DAILY_LIMIT} videos.`);
  console.log(`[batch] ${remainingStories()} stories remaining.`);
}

function pickKidsMusic() {
  const kidsDir = path.join(__dirname, "..", "assets", "music", "kids");
  if (!fs.existsSync(kidsDir)) return null;

  const files = fs.readdirSync(kidsDir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ext === ".mp3" || ext === ".wav" || ext === ".ogg" || ext === ".m4a";
  });

  if (files.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * files.length);
  return path.join(kidsDir, files[randomIndex]);
}

main();
