import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORIES_PATH = path.join(__dirname, "..", "data", "stories.json");

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node scripts/addStories.js <topics-file>");
  console.error("  topics-file: one topic per line");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const lines = fs.readFileSync(filePath, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

if (lines.length === 0) {
  console.error("No topics found in file.");
  process.exit(1);
}

let stories = [];
if (fs.existsSync(STORIES_PATH)) {
  stories = JSON.parse(fs.readFileSync(STORIES_PATH, "utf-8"));
}

const existingTopics = new Set(stories.map((s) => s.topic));
let added = 0;

for (const topic of lines) {
  if (existingTopics.has(topic)) {
    console.log(`  Skipped (duplicate): "${topic}"`);
    continue;
  }
  stories.push({
    id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    topic,
    used: false,
  });
  existingTopics.add(topic);
  added++;
}

fs.writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2), "utf-8");
console.log(`Added ${added} new topic(s). ${lines.length - added} skipped as duplicates.`);
console.log(`Total unused: ${stories.filter((s) => !s.used).length}`);
