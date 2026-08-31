# Content Automation Pipeline (Video + TTS → YouTube + Instagram)

Pulls a topic/script → generates voice (TTS) → assembles a video (visuals + captions + audio)
→ uploads to YouTube (Shorts/normal) and Instagram (Reels). Built as small, swappable modules
so you can hand each file to opencode and iterate independently.

## Pipeline

```
[1] scriptGenerator   -> text script + scene list (JSON)
[2] ttsGenerator       -> narration.mp3 (+ word timings if provider supports it)
[3] mediaFetcher       -> background clips/images per scene (Pexels/Pixabay, or your own assets)
[4] videoAssembler     -> ffmpeg: stitches clips + burns captions + mixes audio -> final.mp4
[5] youtubeUploader    -> uploads final.mp4 via YouTube Data API v3
[6] instagramUploader  -> uploads final.mp4 as a Reel via Instagram Graph API
[index.js]             -> orchestrates 1-6, run with `node src/index.js "your topic"`
```

## Setup

```bash
npm install
cp .env.example .env   # fill in all keys below
```

### Required accounts/keys
- **Script generation**: Anthropic API key (or any LLM) — `ANTHROPIC_API_KEY`
- **TTS**: ElevenLabs (`ELEVENLABS_API_KEY`) — swap for Google/Azure TTS if you prefer
- **Stock media** (optional, if not using your own clips): Pexels API key — `PEXELS_API_KEY`
- **YouTube**: Google Cloud project with YouTube Data API v3 enabled, OAuth2 client
  (`YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`)
- **Instagram**: Facebook Developer app + Instagram **Business/Creator** account linked to a
  Facebook Page (`IG_ACCESS_TOKEN`, `IG_BUSINESS_ACCOUNT_ID`) — Instagram's API requires the
  video to be reachable at a **public URL** during upload, so you need a place to host
  `final.mp4` briefly (S3 bucket, Cloudflare R2, or any public bucket) — see `mediaHost.js`.
- **ffmpeg** installed and on PATH (`sudo apt install ffmpeg` / `brew install ffmpeg`)

### Getting each token (do this first — the code won't run without them)
1. **YouTube OAuth**: create OAuth2 credentials in Google Cloud Console → run the one-time
   `scripts/getYoutubeRefreshToken.js` helper → paste the printed refresh token into `.env`.
2. **Instagram**: Instagram login won't work directly — you must go through the Facebook Graph
   API, and the IG account must be a Business/Creator account connected to a Facebook Page.
   Get a long-lived Page access token from Graph API Explorer.

## Run

```bash
node src/index.js "5 productivity habits that actually work"
```

Add `--publish` to actually upload; without it the pipeline stops after producing `final.mp4`
locally so you can review before publishing.

## Notes / things to decide with opencode
- Rate limits: YouTube allows a limited number of uploads/day per project by default (quota).
  Instagram content publishing also has rate limits (~25 posts/24h per IG account).
- Consider a queue (e.g. a simple SQLite table) if you want to schedule multiple videos/day
  rather than firing one blocking pipeline run per topic.
- Captions: `videoAssembler.js` burns simple centered captions from the TTS word timings; swap
  in `ffmpeg`'s `subtitles` filter with an `.srt` file if you want styled captions instead.
