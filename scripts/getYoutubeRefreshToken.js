// Run once: node scripts/getYoutubeRefreshToken.js
// Opens a browser for you to grant your app access to your YouTube channel,
// then prints a refresh token to paste into .env as YT_REFRESH_TOKEN.
import http from "http";
import { google } from "googleapis";
import open from "open";
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.YT_CLIENT_ID,
  process.env.YT_CLIENT_SECRET,
  process.env.YT_REDIRECT_URI || "http://localhost:5000/oauth2callback"
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/youtube.upload"],
});

const server = http
  .createServer(async (req, res) => {
    if (!req.url.startsWith("/oauth2callback")) return;
    const code = new URL(req.url, "http://localhost:5000").searchParams.get("code");
    const { tokens } = await oauth2Client.getToken(code);
    res.end("Success — you can close this tab. Check your terminal for the refresh token.");
    console.log("\nYT_REFRESH_TOKEN=" + tokens.refresh_token + "\n");
    server.close();
    process.exit(0);
  })
  .listen(5000, () => {
    console.log("Opening browser for Google auth...");
    open(authUrl);
  });
