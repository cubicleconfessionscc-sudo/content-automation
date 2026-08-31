import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORIES_PATH = path.join(__dirname, "..", "data", "stories.json");
const LOG_PATH = path.join(__dirname, "..", "data", "publish-log.json");

function loadStories() {
  if (!fs.existsSync(STORIES_PATH)) {
    fs.writeFileSync(STORIES_PATH, "[]", "utf-8");
    return [];
  }
  return JSON.parse(fs.readFileSync(STORIES_PATH, "utf-8"));
}

function saveStories(stories) {
  fs.writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2), "utf-8");
}

/**
 * Returns the first unused story in queue order.
 * @returns {object | null}
 */
export function pickNextStory() {
  const stories = loadStories();
  return stories.find((s) => !s.used) || null;
}

/**
 * Marks a story as used and stamps the scheduled date.
 * @param {string} id
 * @param {{ videoId?: string, url?: string }} publishInfo
 */
export function markStoryUsed(id, publishInfo = {}) {
  const stories = loadStories();
  const story = stories.find((s) => s.id === id);
  if (story) {
    story.used = true;
    story.scheduledDate = new Date().toISOString().slice(0, 10);
    saveStories(stories);
  }

  // Append to publish log
  const log = fs.existsSync(LOG_PATH)
    ? JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"))
    : [];
  log.push({
    date: new Date().toISOString().slice(0, 10),
    topic: story?.topic || "unknown",
    animalName: story?.animalName || null,
    videoId: publishInfo.videoId || null,
    url: publishInfo.url || null,
    publishedAt: new Date().toISOString(),
  });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf-8");
}

/**
 * Returns count of unused stories remaining.
 * @returns {number}
 */
export function remainingStories() {
  const stories = loadStories();
  return stories.filter((s) => !s.used).length;
}
