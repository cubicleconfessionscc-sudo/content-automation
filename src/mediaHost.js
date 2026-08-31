import axios from "axios";
import fs from "fs";
import { config } from "./config.js";

/**
 * Instagram needs a public URL to fetch the video from. This is a thin stub:
 * point PUBLIC_UPLOAD_WEBHOOK at your own upload endpoint (a small Express
 * route in front of an S3/R2 bucket with public-read works well), and it
 * should return { url: "https://..." }.
 *
 * If you'd rather do this directly with an AWS SDK / R2 client instead of a
 * webhook, swap the body of this function — keep the same return shape.
 */
export async function hostFilePublicly(filePath) {
  if (!config.publicUploadWebhook) {
    throw new Error(
      "PUBLIC_UPLOAD_WEBHOOK is not set. Instagram requires a public video URL — " +
        "set up an S3/R2 bucket + upload endpoint and point this env var at it."
    );
  }

  const fileBuffer = fs.readFileSync(filePath);
  const res = await axios.post(config.publicUploadWebhook, fileBuffer, {
    headers: { "Content-Type": "video/mp4" },
    maxBodyLength: Infinity,
  });

  return res.data.url;
}
