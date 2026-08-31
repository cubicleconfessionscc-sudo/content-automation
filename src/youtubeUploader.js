import fs from "fs";
import { google } from "googleapis";
import { config } from "./config.js";

function getAuthedClient() {
  const oauth2Client = new google.auth.OAuth2(
    config.youtube.clientId,
    config.youtube.clientSecret,
    config.youtube.redirectUri
  );
  oauth2Client.setCredentials({ refresh_token: config.youtube.refreshToken });
  return oauth2Client;
}

/**
 * Verifies the authenticated channel matches YT_CHANNEL_ID.
 * @param {object} youtube - authenticated YouTube API client
 * @returns {Promise<string>} the verified channel ID
 */
async function verifyChannel(youtube) {
  const res = await youtube.channels.list({
    part: ["id", "snippet"],
    mine: true,
  });

  const channels = res.data.items;
  if (!channels || channels.length === 0) {
    throw new Error("No YouTube channel found for this account.");
  }

  const targetId = config.youtube.channelId;
  if (!targetId) {
    console.warn("[youtube] YT_CHANNEL_ID not set — uploading to first available channel:", channels[0].id);
    return channels[0].id;
  }

  const match = channels.find((ch) => ch.id === targetId);
  if (!match) {
    const available = channels.map((c) => `  ${c.id} (${c.snippet.title})`).join("\n");
    throw new Error(
      `Channel mismatch! Target: ${targetId}\nAvailable channels:\n${available}\n` +
      `Make sure your Google account has manager/owner access to @CubicleConfessionsCC.`
    );
  }

  return match.id;
}

/**
 * Uploads final.mp4 as a YouTube video to the verified channel.
 *
 * @param {{filePath: string, title: string, description: string, tags?: string[]}} opts
 * @returns {Promise<{url: string, videoId: string}>}
 */
export async function uploadToYouTube({ filePath, title, description, tags = [] }) {
  const auth = getAuthedClient();
  const youtube = google.youtube({ version: "v3", auth });

  // Verify channel before uploading
  const channelId = await verifyChannel(youtube);
  console.log(`[youtube] Verified channel: ${channelId}`);

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId: "2", // People & Blogs; change to "22" for People & Blogs or "24" for Entertainment
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: true, // COPPA compliant
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  return {
    url: `https://www.youtube.com/watch?v=${res.data.id}`,
    videoId: res.data.id,
  };
}
