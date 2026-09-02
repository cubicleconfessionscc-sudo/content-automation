/**
 * Sky Friends — original mascot assets for the baby-rhyme renderer.
 * Source of truth for character appearance. See docs/character-bible.md.
 * The copyright gate (src/copyrightCheck.js) only allows these IDs.
 */

export const ALLOWED_MASCOT_IDS = Object.freeze(["sunny", "cloudie", "lunie", "stella", "roy"]);

export const CHARACTERS = [
  {
    id: "sunny",
    name: "Sunny",
    tagline: "the bright one",
    animation: "bob",
    eyeStyle: "sky-round",
    mouthStyle: "sky-open",
    eyeColor: "#5B3A1E",
    cheekColor: "#FFB6C1",
    palette: { bg1: "#7EC8FF", bg2: "#BCECFF", accent: "#FFF3B0", text: "#3A2A1E" },
  },
  {
    id: "cloudie",
    name: "Cloudie",
    tagline: "the cuddly one",
    animation: "float",
    eyeStyle: "sky-wink",
    mouthStyle: "sky-smile",
    eyeColor: "#5B8CB8",
    cheekColor: "#FFC9B0",
    palette: { bg1: "#AFDCFF", bg2: "#EAF6FF", accent: "#FFFFFF", text: "#2B4A66" },
  },
  {
    id: "lunie",
    name: "Lunie",
    tagline: "the sleepy one",
    animation: "float-slow",
    eyeStyle: "sky-sleepy",
    mouthStyle: "sky-o",
    eyeColor: "#7A6A2B",
    cheekColor: "#D8C7F5",
    palette: { bg1: "#2B2D66", bg2: "#4A4E9E", accent: "#FFF3C4", text: "#FFF3C4" },
  },
  {
    id: "stella",
    name: "Stella",
    tagline: "the sparkly one",
    animation: "twinkle",
    eyeStyle: "sky-mixed",
    mouthStyle: "sky-open",
    eyeColor: "#5B3A1E",
    cheekColor: "#FFA9C9",
    palette: { bg1: "#3A2E6E", bg2: "#6A5ACD", accent: "#FFF0A0", text: "#FFF0A0" },
  },
  {
    id: "roy",
    name: "Roy",
    tagline: "the colorful one",
    animation: "wave",
    eyeStyle: "sky-round",
    mouthStyle: "sky-smile",
    eyeColor: "#4A6B8A",
    cheekColor: "#FFB0A0",
    palette: { bg1: "#9BD4FF", bg2: "#D8F0FF", accent: "#FFD9E8", text: "#2B4A66" },
  },
];

export const MASCOT_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));

export function getCharacterPalette(char) {
  return char.palette || CHARACTERS[0].palette;
}

function faceMarkup(char) {
  const eyes = [];
  const leftEye =
    char.eyeStyle === "sky-wink"
      ? `<div class="sky-eye left sky-wink"></div>`
      : char.eyeStyle === "sky-sleepy"
        ? `<div class="sky-eye left sky-sleepy"></div>`
        : char.eyeStyle === "sky-mixed"
          ? `<div class="sky-eye left sky-wink"></div>`
          : `<div class="sky-eye left sky-round"><div class="shine"></div></div>`;
  const rightEye =
    char.eyeStyle === "sky-sleepy"
      ? `<div class="sky-eye right sky-sleepy"></div>`
      : char.eyeStyle === "sky-mixed"
        ? `<div class="sky-eye right sky-round"><div class="shine"></div></div>`
        : char.eyeStyle === "sky-wink"
          ? `<div class="sky-eye right sky-round"><div class="shine"></div></div>`
          : `<div class="sky-eye right sky-round"><div class="shine"></div></div>`;
  eyes.push(leftEye, rightEye);
  return `
    <div class="skyface">
      ${eyes.join("\n      ")}
      <div class="sky-cheek left"></div>
      <div class="sky-cheek right"></div>
      <div class="sky-mouth ${char.mouthStyle}"></div>
    </div>`;
}

function sunMarkup(char, sizeVw) {
  return `
    <div class="sky-${char.id}" style="width:${sizeVw}vw;height:${sizeVw}vw;--face:${char.eyeColor};--cheek:${char.cheekColor};">
      <div class="sunny-ray"></div>
      <div class="sunny-body"></div>
      ${faceMarkup(char)}
    </div>`;
}

function cloudMarkup(char, sizeVw, puffScale) {
  const s = puffScale || 1;
  return `
    <div class="sky-${char.id}" style="width:${sizeVw}vw;height:${sizeVw}vw;--face:${char.eyeColor};--cheek:${char.cheekColor};">
      <div class="${char.id}-puff ${char.id}-pl" style="transform:scale(${s});"></div>
      <div class="${char.id}-puff ${char.id}-pm" style="transform:scale(${s});"></div>
      <div class="${char.id}-puff ${char.id}-pr" style="transform:scale(${s});"></div>
      <div class="${char.id}-base" style="transform:scale(${s});"></div>
      ${faceMarkup(char)}
    </div>`;
}

function lunieMarkup(char, sizeVw) {
  return `
    <div class="sky-${char.id}" style="width:${sizeVw}vw;height:${sizeVw}vw;--face:${char.eyeColor};--cheek:${char.cheekColor};">
      <div class="lunie-cap">
        <div class="lunie-pom"></div>
      </div>
      <div class="lunie-body"></div>
      ${faceMarkup(char)}
    </div>`;
}

function stellaMarkup(char, sizeVw) {
  return `
    <div class="sky-${char.id}" style="width:${sizeVw}vw;height:${sizeVw}vw;--face:${char.eyeColor};--cheek:${char.cheekColor};">
      <div class="stella-halo"></div>
      <div class="stella-body"></div>
      ${faceMarkup(char)}
    </div>`;
}

function royMarkup(char, sizeVw) {
  return `
    <div class="sky-${char.id}" style="width:${sizeVw}vw;height:${sizeVw}vw;--face:${char.eyeColor};--cheek:${char.cheekColor};">
      <div class="roy-ring"></div>
      <div class="roy-puff roy-pl"></div>
      <div class="roy-puff roy-pm"></div>
      <div class="roy-puff roy-pr"></div>
      <div class="roy-base"></div>
      ${faceMarkup(char)}
    </div>`;
}

/** Returns the body HTML (inner content of the animated .character wrapper). */
export function characterMarkup(char, sizeVw) {
  switch (char.id) {
    case "sunny":
      return sunMarkup(char, sizeVw);
    case "cloudie":
      return cloudMarkup(char, sizeVw, 1);
    case "lunie":
      return lunieMarkup(char, sizeVw);
    case "stella":
      return stellaMarkup(char, sizeVw);
    case "roy":
      return royMarkup(char, sizeVw);
    default:
      throw new Error(`[characterAssets] Unknown character id: ${char.id}`);
  }
}

/**
 * Shared face + unique silhouette CSS for a character. Namespaced by id so
 * multiple mascots can share one page (intro/outro).
 */
export function characterCss(char) {
  const c = char.id;
  return `
  .sky-${c} { position: relative; }
  .sky-${c} .sunny-ray {
    position: absolute; inset: -24%; border-radius: 50%;
    background: repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,217,61,0.95) 0deg 12deg, transparent 12deg 45deg);
  }
  .sky-${c} .sunny-body {
    position: absolute; inset: 0; border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #FFEF8F, #FFD93D 60%, #F7B733);
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  .sky-${c} .${c}-puff { position: absolute; background: #FFFFFF; border-radius: 50%; }
  .sky-${c} .${c}-pl { width: 52%; height: 52%; left: 0%; top: 16%; }
  .sky-${c} .${c}-pm { width: 62%; height: 62%; left: 19%; top: 0%; }
  .sky-${c} .${c}-pr { width: 52%; height: 52%; right: 0%; top: 12%; }
  .sky-${c} .${c}-base {
    position: absolute; left: 8%; right: 8%; bottom: 2%; top: 36%;
    background: #FFFFFF; border-radius: 42% 42% 46% 46%;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  .sky-${c} .lunie-cap {
    position: absolute; left: 14%; top: -18%; width: 44%; height: 26%;
    background: #6FB1F7; border-radius: 70% 24% 0 0; transform: rotate(-12deg);
    z-index: 3;
  }
  .sky-${c} .lunie-pom {
    position: absolute; left: -14%; top: -8%; width: 40%; height: 96%;
    background: #FFFFFF; border-radius: 50%;
  }
  .sky-${c} .lunie-body {
    position: absolute; inset: 4% 0 0 0; border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #FFF7D0, #FDEB9D 55%, #EACB78);
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  }
  .sky-${c} .stella-halo {
    position: absolute; inset: -10%; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,215,100,0.4) 0%, transparent 70%);
  }
  .sky-${c} .stella-body {
    position: absolute; inset: 2%;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    background: radial-gradient(circle at 35% 30%, #FFF5BE, #FFD764 60%, #F5B83C);
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  .sky-${c} .roy-ring {
    position: absolute; inset: -26%; border-radius: 50%;
    background: conic-gradient(from 90deg, #FF6B6B, #FFD93D, #4ECDC4, #6C9BFF, #9B6BFF, #FF6B6B);
    -webkit-mask: radial-gradient(closest-side, transparent 42%, #000 45%);
  }
  .sky-${c} .roy-puff { position: absolute; background: #FFFFFF; border-radius: 50%; }
  .sky-${c} .roy-pl { width: 48%; height: 48%; left: 0%; top: 18%; }
  .sky-${c} .roy-pm { width: 56%; height: 56%; left: 22%; top: 2%; }
  .sky-${c} .roy-pr { width: 48%; height: 48%; right: 0%; top: 14%; }
  .sky-${c} .roy-base {
    position: absolute; left: 8%; right: 8%; bottom: 4%; top: 38%;
    background: #FFFFFF; border-radius: 42% 42% 46% 46%;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  .sky-${c} .skyface { position: absolute; inset: 10% 4% 12% 4%; }
  .sky-${c} .sky-eye { position: absolute; top: 24%; width: 15%; height: 15%; background: var(--face); border-radius: 50%; }
  .sky-${c} .sky-eye.left { left: 26%; }
  .sky-${c} .sky-eye.right { left: 60%; }
  .sky-${c} .sky-eye .shine { position: absolute; top: 16%; right: 12%; width: 32%; height: 32%; background: #FFFFFF; border-radius: 50%; }
  .sky-${c} .sky-eye.sky-wink { width: 17%; height: 10%; border-radius: 50% 50% 0 0; background: transparent; border-bottom: 4px solid var(--face); }
  .sky-${c} .sky-eye.sky-sleepy { width: 17%; height: 10%; border-radius: 0 0 50% 50%; background: transparent; border-top: 4px solid var(--face); }
  .sky-${c} .sky-eye.sky-wink.left { left: 24%; }
  .sky-${c} .sky-cheek { position: absolute; top: 46%; width: 18%; height: 10%; background: var(--cheek); border-radius: 50%; opacity: 0.8; }
  .sky-${c} .sky-cheek.left { left: 10%; }
  .sky-${c} .sky-cheek.right { right: 8%; }
  .sky-${c} .sky-mouth { position: absolute; top: 62%; left: 50%; transform: translateX(-50%); }
  .sky-${c} .sky-mouth.sky-smile { width: 34%; height: 20%; border: 4px solid var(--face); border-top: none; border-radius: 0 0 60% 60%; }
  .sky-${c} .sky-mouth.sky-open { width: 18%; height: 24%; background: var(--face); border-radius: 50%; }
  .sky-${c} .sky-mouth.sky-o { width: 12%; height: 16%; border: 4px solid var(--face); border-radius: 50%; }
`;
}

/** Deterministic mascot selection per scene — always an approved cast member. */
export function pickCharacterForScene(scene, index) {
  const k = `${scene.visualKeyword || ""} ${scene.text || ""}`.toLowerCase();
  const has = (re) => re.test(k);
  if (has(/(night|moon|dream|sleep|bedtime|slumber|drowsy|goodnight|yawn)/)) return MASCOT_BY_ID.lunie;
  if (has(/(sun|bright|warm|morning|cheer|happy|greet|sunny|shine|boast)/)) return MASCOT_BY_ID.sunny;
  if (has(/(cloud|rain|puddle|feel|sorry|share|hug|cry|snuggl|cuddle|soft)/)) return MASCOT_BY_ID.cloudie;
  if (has(/(rainbow|season|kind|calm|harmon|hue)/)) return MASCOT_BY_ID.roy;
  if (has(/(sparkle|letter|alphabet|wow|surprise|hooray|celebrate|twinkl|star)/)) return MASCOT_BY_ID.stella;
  return CHARACTERS[Math.abs(index) % CHARACTERS.length];
}

/**
 * Builds the complete CSS for several characters sharing one page (intro/outro).
 */
export function castCss(ids = ALLOWED_MASCOT_IDS) {
  return ids.map((id) => characterCss(MASCOT_BY_ID[id])).join("\n");
}