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
import { copyrightCheck } from "./copyrightCheck.js";

const DAILY_LIMIT = parseInt(process.env.DAILY_UPLOAD_LIMIT || "1", 10);

function logFileStats(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.log(`    [file] ${label}: MISSING`);
    return false;
  }
  const stat = fs.statSync(filePath);
  console.log(`    [file] ${label}: ${(stat.size / 1024).toFixed(1)}KB`);
  return stat.size > 0;
}

async function main() {
  console.log("=".repeat(60));
  console.log(`[batch] Daily Baby Rhyme Pipeline`);
  console.log(`[batch] Upload limit: ${DAILY_LIMIT}`);
  console.log(`[batch] Stories remaining: ${remainingStories()}`);
  console.log("=".repeat(60));

  let uploaded = 0;

  while (uploaded < DAILY_LIMIT) {
    const story = pickNextStory();
    if (!story) {
      console.log("[batch] Story queue is empty. Nothing to upload.");
      break;
    }

    const workDir = path.join(config.paths.work, story.id);
    fs.mkdirSync(workDir, { recursive: true });

    console.log(`\n${"─".repeat(60)}`);
    console.log(`[batch] (${uploaded + 1}/${DAILY_LIMIT}): "${story.topic}"`);
    console.log(`[batch] Animal: ${story.animalName || "N/A"}`);
    console.log(`[batch] Work dir: ${workDir}`);
    console.log(`${"─".repeat(60)}`);

    try {
      console.log("\n  [1/7] Generating rhyme lyrics...");
      const script = await generateScript(story.topic, story.animalName);
      fs.writeFileSync(path.join(workDir, "script.json"), JSON.stringify(script, null, 2));
      console.log(`    Title: "${script.title}"`);
      console.log(`    Mood: ${script.mood}`);
      console.log(`    Scenes: ${script.scenes.length}`);
      console.log(`    Lyrics preview: ${(script.lyrics || "").substring(0, 100)}...`);

      console.log("\n  [2/7] Generating narration with pitch variation...");
      const fullText = script.scenes.map((s) => s.text).join("\n");
      const narrationPath = path.join(workDir, "narration.mp3");
      await generateNarration(fullText, narrationPath);
      logFileStats(narrationPath, "narration.mp3");

      const durations = estimateSceneDurations(script.scenes);
      console.log(`    Scene durations: ${durations.map((d) => d.toFixed(1) + "s").join(", ")}`);
      console.log(`    Total duration: ${durations.reduce((a, b) => a + b, 0).toFixed(1)}s`);

      console.log("\n  [3/7] Selecting background music...");
      const musicPath = pickKidsMusic();
      if (musicPath) {
        logFileStats(musicPath, "background music");
      } else {
        console.log("    [music] No background music found (narration only)");
      }

      console.log("\n  [4/7] Rendering animated scenes (Puppeteer)...");
      const scenePaths = await renderScenes({
        scenes: script.scenes,
        durations,
        workDir,
      });
      console.log(`    Rendered ${scenePaths.length} scenes:`);
      for (let i = 0; i < scenePaths.length; i++) {
        logFileStats(scenePaths[i], `scene_${i}`);
      }

      console.log("\n  [5/7] Copyright safety check...");
      const copyrightResult = copyrightCheck({
        videoId: story.id,
        workDir,
        script,
        narrationPath,
        musicPath: musicPath || undefined,
      });

      if (!copyrightResult.passed) {
        console.error("\n  [ABORT] Copyright check failed. Skipping this story.");
        markStoryUsed(story.id, { videoId: null, url: null });
        uploaded++;
        continue;
      }

      console.log("\n  [6/7] Assembling final video...");
      const finalPath = path.join(workDir, "final.mp4");
      await assembleVideo({
        clipPaths: scenePaths,
        durations,
        scenes: script.scenes,
        narrationPath,
        workDir,
        musicPath: musicPath || undefined,
      });
      logFileStats(finalPath, "final.mp4");

      console.log("\n  [7/7] Generating metadata & uploading...");
      const metadata = await generateMetadata(script);
      console.log(`    YouTube title: "${metadata.youtubeTitle}"`);
      console.log(`    Tags: ${metadata.youtubeTags?.slice(0, 5).join(", ")}...`);
      fs.writeFileSync(path.join(workDir, "metadata.json"), JSON.stringify(metadata, null, 2));

      console.log("  [upload] Uploading to YouTube...");
      const { url, videoId } = await uploadToYouTube({
        filePath: finalPath,
        title: metadata.youtubeTitle,
        description: metadata.youtubeDescription,
        tags: metadata.youtubeTags,
      });
      console.log(`  [SUCCESS] YouTube: ${url}`);

      markStoryUsed(story.id, { videoId, url });
      console.log(`  [done] "${story.topic}" published successfully.`);
      uploaded++;
    } catch (err) {
      console.error(`\n  [FAILED] ${err.message}`);
      console.error(`  Stack: ${err.stack?.split("\n").slice(0, 3).join("\n")}`);
      console.error("  Story was NOT marked as used. Will retry next run.");
      break;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`[batch] Done. Uploaded ${uploaded}/${DAILY_LIMIT} videos.`);
  console.log(`[batch] ${remainingStories()} stories remaining.`);
  console.log("=".repeat(60));
}

function pickKidsMusic() {
  const kidsDir = path.join(__dirname, "..", "assets", "music", "kids");
  if (!fs.existsSync(kidsDir)) return null;

  const files = fs.readdirSync(kidsDir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return (ext === ".mp3" || ext === ".wav" || ext === ".ogg" || ext === ".m4a") && !f.startsWith("test-");
  });

  if (files.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * files.length);
  return path.join(kidsDir, files[randomIndex]);
}

main();
