import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * Generates an ORIGINAL baby rhyme lyric (never reproducing copyrighted material).
 * @param {string} topic
 * @param {string} animalName - if the topic is about a specific animal
 * @returns {Promise<{title: string, lyrics: string, mood: string, scenes: {text: string, visualKeyword: string, animationType: string}[]}>}
 */
export async function generateScript(topic, animalName = null) {
  const animalHint = animalName ? `The star of this rhyme is a ${animalName}.` : "";

  const prompt = `You are a children's songwriter for toddlers (ages 1-4). Write an ORIGINAL nursery rhyme.

Topic: "${topic}"
${animalHint}

RULES:
- Write completely ORIGINAL lyrics. NEVER reproduce any existing copyrighted nursery rhyme.
- 60-130 words total, singsong AABB or ABCB rhyme scheme
- 1-2 minutes at a slow kids' reading pace
- Include a short repeating chorus (2-4 lines that repeat)
- Simple vocabulary a 3-year-old can follow
- Positive, educational, fun tone
- Each scene should have a simple visual description suited to 2D animation

Return ONLY valid JSON, no markdown fences:
{
  "title": "catchy kid-friendly title, under 60 chars",
  "mood": "one of: upbeat, cheerful, calm, playful, sleepy",
  "lyrics": "full lyrics with chorus marked in [Chorus] brackets",
  "scenes": [
    {
      "text": "the lyric lines for this scene",
      "visualKeyword": "2-3 word search term for animation reference",
      "animationType": "one of: bounce, float, spin, zoom, wave, pulse, slide, twinkle"
    }
  ]
}

Break into 4-8 scenes. Each scene = one verse or chorus section.
The animationType describes the primary motion for that scene's visual elements.`;

  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  const cleaned = raw.replace(/^```json\s*|\s*```$/g, "");
  return JSON.parse(cleaned);
}
