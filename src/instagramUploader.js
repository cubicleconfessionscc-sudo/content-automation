import axios from "axios";
import { config } from "./config.js";

const GRAPH_BASE = "https://graph.facebook.com/v20.0";

/**
 * Publishes final.mp4 as an Instagram Reel.
 *
 * IMPORTANT: Instagram's Graph API requires the video to be fetchable from a
 * PUBLIC URL, not uploaded as raw bytes. So you must host final.mp4
 * somewhere public first (S3/R2/etc) and pass that URL in as `publicVideoUrl`.
 * See mediaHost.js for a starter uploader to do that step.
 *
 * @param {{publicVideoUrl: string, caption: string}} opts
 * @returns {Promise<string>} the resulting IG media permalink (best-effort)
 */
export async function uploadToInstagram({ publicVideoUrl, caption }) {
  const { accessToken, businessAccountId } = config.instagram;

  // Step 1: create a media container.
  const createRes = await axios.post(`${GRAPH_BASE}/${businessAccountId}/media`, null, {
    params: {
      media_type: "REELS",
      video_url: publicVideoUrl,
      caption,
      access_token: accessToken,
    },
  });
  const creationId = createRes.data.id;

  // Step 2: poll status until the container finishes processing.
  let status = "IN_PROGRESS";
  while (status === "IN_PROGRESS") {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await axios.get(`${GRAPH_BASE}/${creationId}`, {
      params: { fields: "status_code", access_token: accessToken },
    });
    status = statusRes.data.status_code;
    if (status === "ERROR") throw new Error("Instagram failed to process the video container.");
  }

  // Step 3: publish it.
  const publishRes = await axios.post(`${GRAPH_BASE}/${businessAccountId}/media_publish`, null, {
    params: { creation_id: creationId, access_token: accessToken },
  });

  return `https://www.instagram.com/reel/${publishRes.data.id}/`;
}
