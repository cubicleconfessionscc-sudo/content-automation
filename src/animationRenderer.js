import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

const COLORS = [
  "0xFF6B6B", "0x4ECDC4", "0x45B7D1", "0xFFA07A", "0x98D8C8",
  "0xF7DC6F", "0xBB8FCE", "0x85C1E9", "0xF1948A", "0x82E0AA",
  "0xF8C471", "0xAED6F1", "0xD7BDE2", "0xA3E4D7", "0xFAD7A0",
];

const ANIMAL_SHAPES = {
  fish: { emoji: "🐟", shape: "circle", color: "0x45B7D1" },
  cat: { emoji: "🐱", shape: "circle", color: "0xF7DC6F" },
  dog: { emoji: "🐶", shape: "circle", color: "0xBB8FCE" },
  bird: { emoji: "🐦", shape: "diamond", color: "0x85C1E9" },
  butterfly: { emoji: "🦋", shape: "diamond", color: "0xAED6F1" },
  bee: { emoji: "🐝", shape: "circle", color: "0xF7DC6F" },
  frog: { emoji: "🐸", shape: "circle", color: "0x82E0AA" },
  turtle: { emoji: "🐢", shape: "circle", color: "0x82E0AA" },
  star: { emoji: "⭐", shape: "star", color: "0xF7DC6F" },
  sun: { emoji: "☀️", shape: "circle", color: "0xF7DC6F" },
  moon: { emoji: "🌙", shape: "crescent", color: "0xF7DC6F" },
  heart: { emoji: "❤️", shape: "heart", color: "0xF1948A" },
  flower: { emoji: "🌸", shape: "circle", color: "0xFAD7A0" },
  tree: { emoji: "🌳", shape: "triangle", color: "0x82E0AA" },
  car: { emoji: "🚗", shape: "rectangle", color: "0xF1948A" },
  ball: { emoji: "⚽", shape: "circle", color: "0xFFFFFF" },
  balloon: { emoji: "🎈", shape: "circle", color: "0xF1948A" },
  cloud: { emoji: "☁️", shape: "ellipse", color: "0xFFFFFF" },
  rain: { emoji: "🌧️", shape: "ellipse", color: "0x85C1E9" },
  snow: { emoji: "❄️", shape: "star", color: "0xFFFFFF" },
};

function getShapeForScene(visualKeyword, index) {
  const key = visualKeyword.toLowerCase();
  for (const [animal, info] of Object.entries(ANIMAL_SHAPES)) {
    if (key.includes(animal)) return info;
  }
  return { emoji: null, shape: "circle", color: COLORS[index % COLORS.length] };
}

function getAnimationFilter(type, duration) {
  const fps = 30;
  const frames = Math.ceil(duration * fps);
  switch (type) {
    case "bounce":
      return `zoompan=z='min(zoom+0.001,1.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)+sin(on/${fps})*50':d=${frames}:s=1080x1920:fps=${fps}`;
    case "float":
      return `zoompan=z='1.05':x='iw/2-(iw/zoom/2)+cos(on/${fps})*30':y='ih/2-(ih/zoom/2)+sin(on/${fps})*20':d=${frames}:s=1080x1920:fps=${fps}`;
    case "spin":
      return `zoompan=z='1.1':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${fps}`;
    case "zoom":
      return `zoompan=z='min(zoom+0.002,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${fps}`;
    case "wave":
      return `zoompan=z='1.05':x='iw/2-(iw/zoom/2)+sin(on/${fps})*40':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${fps}`;
    case "pulse":
      return `zoompan=z='1+0.1*sin(on/${fps}*2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${fps}`;
    case "slide":
      return `zoompan=z='1.05':x='(iw-iw/zoom)*on/${frames}':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${fps}`;
    case "twinkle":
      return `zoompan=z='1+0.05*sin(on/${fps}*3)':x='iw/2-(iw/zoom/2)+cos(on/${fps}*2)*10':y='ih/2-(ih/zoom/2)+sin(on/${fps}*3)*10':d=${frames}:s=1080x1920:fps=${fps}`;
    default:
      return `zoompan=z='1.05':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${fps}`;
  }
}

function hexToRgb(hex) {
  const h = hex.replace("0x", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "0x333333" : "0xFFFFFF";
}

function runFfmpeg(cmd) {
  return new Promise((resolve, reject) => {
    cmd.on("end", resolve).on("error", (err) => reject(new Error(err.message || String(err))));
    cmd.run();
  });
}

/**
 * Renders animated scenes using ffmpeg filter_complex.
 * Each scene gets a colorful background with animated shapes and text overlay.
 *
 * @param {{ scenes: {text: string, visualKeyword: string, animationType: string}[], durations: number[], workDir: string }} opts
 * @returns {Promise<string[]>} paths to rendered scene videos
 */
export async function renderScenes({ scenes, durations, workDir }) {
  const scenePaths = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const duration = durations[i];
    const outPath = path.resolve(workDir, `anim_${i}.mp4`).replace(/\\/g, "/");
    const bgColor = COLORS[i % COLORS.length];
    const shapeInfo = getShapeForScene(scene.visualKeyword, i);
    const textColor = getContrastColor(bgColor);
    const fps = 30;
    const frames = Math.ceil(duration * fps);

    const animFilter = getAnimationFilter(scene.animationType || "bounce", duration);
    const lyricText = scene.text.replace(/'/g, "'\\''").replace(/:/g, "\\:");
    const wrappedText = lyricText.length > 40 ? lyricText.substring(0, 40) + "..." : lyricText;

    const filter = [
      `color=c=${bgColor}:s=1080x1920:d=${duration}:r=${fps}`,
      animFilter,
      `drawtext=text='${wrappedText}':fontsize=48:fontcolor=${textColor}:x=(w-text_w)/2:y=h-200:font=Arial:borderw=3:bordercolor=0x000000`,
      `drawtext=text='${scene.visualKeyword}':fontsize=36:fontcolor=${textColor}:x=(w-text_w)/2:y=100:font=Arial:borderw=2:bordercolor=0x000000`,
    ].join(",");

    await runFfmpeg(
      ffmpeg()
        .outputOptions(["-f", "lavfi", "-i", filter, "-t", String(duration), "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p"])
        .output(outPath)
    );

    scenePaths.push(outPath);
  }

  return scenePaths;
}
