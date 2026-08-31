import fs from "fs";
import { config } from "./config.js";
import { pickNextStory, markStoryUsed, remainingStories } from "./storyPicker.js";
import { generateScript } from "./scriptGenerator.js";
import { generateNarration, estimateSceneDurations } from "./ttsGenerator.js";
import { fetchClipsForKeywords } from "./mediaFetcher.js";
import { pickMusicTrack } from "./musicPicker.js";
import { assembleVideo } from "./videoAssembler.js";
import { generateMetadata } from "./metadataGenerator.js";
import { uploadToYouTube } from "./youtubeUploader.js";
import { uploadToInstagram } from "./instagramUploader.js";
import { hostFilePublicly } from "./mediaHost.js";

async function main() {
  const story = pickNextStory();
  if (!story) {
    console.log("[auto] Story queue is empty. Add topics with: node scripts/addStories.js <file>");
    process.exit(0);
  }

  const workDir = config.paths.work;
  fs.mkdirSync(workDir, { recursive: true });

  console.log(`[auto] Story queue: ${remainingStories()} remaining (including current)`);
  console.log(`[auto] Processing: "${story.topic}" (${story.id})\n`);

  try {
    // Step 1: Generate script
    console.log("[1/7] Generating script...");
    const script = await generateScript(story.topic);
    fs.writeFileSync(`${workDir}/script.json`, JSON.stringify(script, null, 2));
    console.log(`   Title: "${script.title}"`);
    console.log(`   Mood: ${script.mood || "not set"}`);
    console.log(`   Scenes: ${script.scenes.length}`);

    // Step 2: Generate narration
    console.log("\n[2/7] Generating narration audio...");
    const fullText = script.scenes.map((s) => s.text).join(" ");
    const narrationPath = `${workDir}/narration.mp3`;
    await generateNarration(fullText, narrationPath);
    const durations = estimateSceneDurations(script.scenes);
    console.log(`   Narration: ${narrationPath}`);

    // Step 3: Pick background music
    console.log("\n[3/7] Selecting background music...");
    const musicPath = pickMusicTrack(script.mood);
    if (musicPath) {
      console.log(`   Music: ${musicPath}`);
    } else {
      console.warn("   No music tracks found in assets/music/. Proceeding without background music.");
      console.warn("   Drop MP3s into assets/music/{upbeat,chill,dramatic,motivational}/ to add music.");
    }

    // Step 4: Fetch background clips
    console.log("\n[4/7] Fetching background clips...");
    const keywords = script.scenes.map((s) => s.visualKeyword);
    const clipPaths = await fetchClipsForKeywords(keywords, workDir);
    console.log(`   Downloaded ${clipPaths.filter(Boolean).length}/${keywords.length} clips`);

    // Step 5: Assemble video
    console.log("\n[5/7] Assembling video...");
    const finalPath = await assembleVideo({
      clipPaths,
      durations,
      scenes: script.scenes,
      narrationPath,
      workDir,
      musicPath: musicPath || undefined,
    });
    console.log(`   Output: ${finalPath}`);

    // Step 6: Generate metadata
    console.log("\n[6/7] Generating titles and hashtags...");
    const metadata = await generateMetadata(script);
    console.log(`   YouTube title: "${metadata.youtubeTitle}"`);
    console.log(`   IG hashtags: ${metadata.hashtags.slice(0, 5).join(", ")}...`);

    // Save metadata for reference
    fs.writeFileSync(`${workDir}/metadata.json`, JSON.stringify(metadata, null, 2));

    // Step 7: Publish
    console.log("\n[7/7] Publishing...");

    console.log("   Uploading to YouTube...");
    const ytUrl = await uploadToYouTube({
      filePath: finalPath,
      title: metadata.youtubeTitle,
      description: metadata.youtubeDescription,
      tags: metadata.youtubeTags,
    });
    console.log(`   YouTube: ${ytUrl}`);

    if (config.instagram.accessToken && config.instagram.businessAccountId) {
      console.log("   Uploading to Instagram...");
      const publicUrl = await hostFilePublicly(finalPath);
      const igCaption = `${metadata.instagramCaption}\n\n${metadata.hashtags.join(" ")}`;
      const igUrl = await uploadToInstagram({ publicVideoUrl: publicUrl, caption: igCaption });
      console.log(`   Instagram: ${igUrl}`);
    } else {
      console.log("   Instagram: skipped (no API keys set)");
    }

    // Mark story as used only after successful publish
    markStoryUsed(story.id);
    console.log(`\n[auto] Done! Story "${story.topic}" published and marked as used.`);
    console.log(`[auto] ${remainingStories()} stories remaining in queue.`);

  } catch (err) {
    console.error(`\n[auto] FAILED: ${err.message}`);
    console.error("[auto] Story was NOT marked as used. Re-run `npm run auto` to retry.");
    process.exit(1);
  }
}

main();
