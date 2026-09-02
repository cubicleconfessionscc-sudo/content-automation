import { generateContentWithRetry } from "./geminiHelpers.js";

/**
 * Generates YouTube-optimized metadata for kids baby rhyme content.
 * COPPA compliant: selfDeclaredMadeForKids = true always.
 *
 * @param {{ title: string, lyrics: string, scenes: object[], mood?: string }} script
 * @returns {Promise<{
 *   youtubeTitle: string,
 *   youtubeDescription: string,
 *   youtubeTags: string[],
 * }>}
 */
export async function generateMetadata(script) {
  const lyricsPreview = script.scenes.map((s) => s.text).join("\n");

  const prompt = `You are a YouTube SEO expert specializing in kids nursery rhyme content. Generate optimized metadata.

Rhyme title: "${script.title}"
Mood: ${script.mood || "cheerful"}
Lyrics preview:
${lyricsPreview}

Return ONLY valid JSON, no markdown fences:
{
  "youtubeTitle": "kid-friendly title under 60 chars, include topic keywords",
  "youtubeDescription": "2-4 sentences for YouTube description, parent-friendly, keyword-rich, mention it's an original nursery rhyme for toddlers",
  "youtubeTags": ["tag1", "tag2", ...]
}

Rules:
- youtubeTitle: MUST be under 60 characters, kid-friendly, include the animal/topic name
- youtubeDescription: parent-focused, mention age range (1-4 years), educational value, original content
- youtubeTags: 15-20 tags mixing broad (nursery rhymes, kids songs, toddler) and specific (animal name, topic)
- All content must be COPPA compliant — no collection of personal data from kids
- Tags should include: nursery rhymes, kids songs, baby songs, toddler, educational, original, [topic-specific tags]`;

  const { data } = await generateContentWithRetry({ prompt, json: true });
  return data;
}
