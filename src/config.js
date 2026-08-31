import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function required(name) {
  const val = process.env[name];
  if (!val) console.warn(`[config] Warning: ${name} is not set in .env`);
  return val;
}

export const config = {
  geminiApiKey: required("GEMINI_API_KEY"),
  elevenLabsApiKey: required("ELEVENLABS_API_KEY"),
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
  pexelsApiKey: process.env.PEXELS_API_KEY || "",
  youtube: {
    clientId: required("YT_CLIENT_ID"),
    clientSecret: required("YT_CLIENT_SECRET"),
    redirectUri: process.env.YT_REDIRECT_URI || "http://localhost:5000/oauth2callback",
    refreshToken: required("YT_REFRESH_TOKEN"),
    channelId: process.env.YT_CHANNEL_ID || "",
  },
  instagram: {
    accessToken: process.env.IG_ACCESS_TOKEN || "",
    businessAccountId: process.env.IG_BUSINESS_ACCOUNT_ID || "",
  },
  publicUploadWebhook: process.env.PUBLIC_UPLOAD_WEBHOOK || "",
  paths: {
    work: path.join(__dirname, "..", "work"),
  },
};
