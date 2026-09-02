# TingGiggle Sky Friends — Character Bible (v1.0)

> Original character IP for CubicleConfessionsCC baby-rhyme videos.
> Every character below is an original design. They are rendered exclusively with
> code-generated CSS shapes (no copyrighted artwork, no licensed images).
> These are the ONLY characters permitted in the animation. The renderer must
> never fall back to generic/random designs — the copyright gate enforces this.

## Brand concept

A gentle daytime-to-nighttime sky world. Every rhyme is hosted, sung, or reacted
to by the Sky Friends. Bright candy palette, rounded shapes, big cheering faces —
designed for 1-4 year olds (COPPA-safe, no data collection, no licensed assets).

## The five Sky Friends

### 1) Sunny (sun) — "the bright one"
- Role: host of daytime rhymes, greetings, happy songs, counting, colors.
- Body: warm sun yellow `#FFD93D`, 16% of frame width as a circle.
- Signature: golden **ray ring** (repeating-conic-gradient) behind the body + little **round sunglasses** on sunny days.
- Eyes: large DARK BROWN `#5B3A1E` round eyes with white shines.
- Cheeks: warm pink `#FFB6C1`. Mouth: big open smile.
- Palette: sky `#7EC8FF → #BCECFF`, accent `#FFF3B0`, text `#3A2A1E`.
- Personality: cheerful, bouncy, generous, laughs loudly.
- Animation: `bob` (bounce), occasionally `spin`.
- Used for: "sunny day", "good morning", counting, colors, greeting scenes.

### 2) Cloudie (cloud) — "the cuddly one"
- Role: comfort scenes, bedtime gentleness (when it's not night), feelings, hugs.
- Body: puffy cloud of three overlapping circles (`#FFFFFF`), base soft `#E8F4FF`.
- Signature: three-puff silhouette + a tiny **soft blue scarf** `#6FB1F7`.
- Eyes: happy closed arcs (winks) `#5B8CB8`; Mouth: small cheerful smile.
- Cheeks: soft peach `#FFC9B0`.
- Palette: sky `#AFDCFF → #EAF6FF`, accent `#FFFFFF`, text `#2B4A66`.
- Personality: soft-spoken, kind, slow, forgiving, loves hugs.
- Animation: `float` (slow gentle rise/fall).
- Used for: rainy days, sharing, saying sorry, "cloudy day".

### 3) Lunie (moon) — "the sleepy one"
- Role: bedtime, nights, dreams, counting sheep, goodnight songs.
- Body: moon circle `#FDEB9D` with a **soft crescent shading** (darker rim `#E8C86A`) and a tiny **pointy nightcap** `#6FB1F7` with a pom-pom.
- Eyes: sleepy curved lines; Mouth: tiny relaxed "o" smile.
- Cheeks: lavender `#D8C7F5`.
- Palette: night `#2B2D66 → #4A4E9E`, accent `#FFF3C4`, text `#FFF3C4`.
- Personality: calm, slow, whispers, yawns, gentle.
- Animation: `float-slow` (very gentle).
- Used for: bedtime, night-time animals, "sleepy" scenes, dreams.

### 4) Stella (star) — "the sparkly one"
- Role: wonder, joy, alphabet/stars, surprise, celebrations, "twinkle, sparkle" scenes.
- Body: five-point star (`clip-path` polygon) `#FFD764`, 15% of frame width.
- Signature: **sparkle aura** (small ✦ shapes orbiting) + crowned highlight.
- Eyes: one dot + one wink (playful asymmetry) `#5B3A1E`; Mouth: delighted open smile.
- Cheeks: pink `#FFA9C9`.
- Palette: indigo night `#3A2E6E → #6A5ACD`, accent `#FFF0A0`, text `#FFF0A0`.
- Personality: curious, excited, dramatic (in a fun way), proud.
- Animation: `twinkle` (scale + rotate wiggle).
- Used for: alphabet, counting stars, surprises, big reveals, "hooray" moments.

### 5) Roy (rainbow) — "the colorful one"
- Role: feelings, colors of the world, calming storms, being kind, and every season.
- Body: white cloud silhouette (like Cloudie, slightly smaller) + a **rainbow arc ring**
  around it (`#FF6B6B → #FFD93D → #4ECDC4 → #6C9BFF → #9B6BFF`).
- Signature: the rainbow ring is always visible around the cloud body.
- Eyes: round gentle `#5B8CB8`; Mouth: warm closed smile with a blush.
- Cheeks: coral `#FFB0A0`.
- Palette: calm sky `#9BD4FF → #D8F0FF`, accent `#FFD9E8`, text `#2B4A66`.
- Personality: wise, warm, harmonizing, encouraging.
- Animation: `wave` (side sway).
- Used for: rainbow days, colors, "it's okay to cry", feeling better, seasons.

## Frozen specifications (canvas: 1080×1920)

- Body size: 13% of frame width (≈140×140px) typical; intro/outro use 8-10%.
- Face placement: eyes at 30% height, mouth at 60%, cheeks at 50% of body.
- Every character MUST show at least one eye shine (white `#FFFFFF`) for life.
- Outline: none — flat modern shapes with soft drop shadow `rgba(0,0,0,0.12)`.
- Typeface: `Arial Rounded MT Bold` / fallback `Nunito` / `Arial`.
- Spacing rule: mascot centered at 50%/35%; lyrics bottom bar, never overlap the face.

## Usage rules (part of every copyright gate):

1. ONLY the five characters above may appear. No additional characters may be added
   without updating this bible + `src/characterAssets.js` + the copyright whitelist.
2. Every rendered scene MUST declare which character it used
   (`work/mascots-used.json`); the copyright check aborts if any is missing/unknown.
3. No mimicking of existing kids-show characters (e.g., no red round monster-like
   faces, no yellow sponge-like squares, no bear in red-and-blue jumpsuit).
4. Intros and outros use the full five-character cast — they are frozen designs.
5. If a new rhyme theme needs a 6th character, first draft a bible entry, get owner
   sign-off, then add to `characterAssets.js` whitelist. Never ship outside the bible.