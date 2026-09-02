import { generateContentWithRetry } from "./geminiHelpers.js";

/**
 * Generates an ORIGINAL baby rhyme lyric with proper AABB/ABCB rhyme scheme.
 * @param {string} topic
 * @param {string} animalName
 * @returns {Promise<{title: string, lyrics: string, mood: string, scenes: {text: string, visualKeyword: string, animationType: string}[]}>}
 */
export async function generateScript(topic, animalName = null) {
  const animalHint = animalName ? `The star animal is a ${animalName}.` : "";

  const prompt = `You are a children's songwriter for toddlers (ages 1-4). Write a NURSERY RHYME — this MUST be a song with proper rhyming verses, NOT a story or spoken text.

Topic: "${topic}"
${animalHint}

STRICT RULES:
1. Write the lyrics as a SONG with clear verse-chorus structure
2. Each line MUST rhyme with the next line (AABB scheme: line 1 rhymes with line 2, line 3 rhymes with line 4)
3. OR use ABCB scheme (lines 2 and 4 rhyme)
4. Include a REPEATING CHORUS (2-4 lines that repeat after each verse)
5. 80-120 words total
6. Use simple words a 2-year-old can follow
7. Use repetition — toddlers love hearing the same words again and again
8. Include sounds like "moo moo", "quack quack", "baa baa" if it's an animal topic
9. Make it BOUNCY and FUN to sing aloud
10. NEVER write prose or sentences — write SONG LYRICS with line breaks between each line

Return ONLY valid JSON, no markdown fences:
{
  "title": "catchy title with the animal/topic name, under 50 chars",
  "mood": "one of: upbeat, cheerful, calm, playful, sleepy",
  "lyrics": "full lyrics with [Chorus] markers, one line per lyric line",
  "scenes": [
    {
      "text": "2-4 lines of lyrics for this scene",
      "visualKeyword": "2-3 words describing what to show (e.g., 'happy cow jumping')",
      "animationType": "one of: bounce, float, spin, zoom, wave, pulse, slide, twinkle"
    }
  ]
}

EXAMPLE of good lyrics structure:
[Verse 1]
Line one that rhymes
With line two that rhymes
Line three that rhymes
With line four that rhymes

[Chorus]
Chorus line one
Chorus line two
Chorus line three

Break into 4-6 scenes. Each scene = one verse or chorus.
The visualKeyword should describe what appears on screen (e.g., "bouncing cow", "spinning star").`;

  const { data } = await generateContentWithRetry({ prompt, json: true });
  return data;
}
