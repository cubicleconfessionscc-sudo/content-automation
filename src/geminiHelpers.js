import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

/**
 * Gemini generateContent with exponential-backoff retries for transient
 * 429/503 errors so unattended batch runs don't die on spikes.
 */
export async function generateContentWithRetry({
  prompt,
  json = false,
  attempts = 4,
  delayMs = 6000,
}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim();
      if (!json) return { raw, data: raw };
      const cleaned = raw.replace(/^```json\s*|\s*```$/g, "");
      return { raw, data: JSON.parse(cleaned) };
    } catch (err) {
      lastErr = err;
      const wait = delayMs * Math.pow(2, i);
      console.warn(
        `    [gemini] attempt ${i + 1}/${attempts} failed (${String(err.message || err).slice(0, 140)}). retrying in ${(wait / 1000).toFixed(0)}s`
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}