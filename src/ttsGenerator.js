import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const VOICE = "en-US-AriaNeural";

/**
 * Generates singsong narration using Python edge-tts.
 * Splits lyrics into lines and applies pitch/rate variation for musical delivery.
 */
export async function generateNarration(fullText, outPath) {
  const dir = path.dirname(outPath);
  fs.mkdirSync(dir, { recursive: true });

  const lines = fullText
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("[") && !l.startsWith("("));

  if (lines.length === 0) {
    lines.push(fullText);
  }

  const segments = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isChorus = i % 3 === 0;

    let pitch = "+0Hz";
    let rate = "+0%";

    if (isChorus) {
      pitch = "+20Hz";
      rate = "-10%";
    } else if (i % 2 === 0) {
      pitch = "+10Hz";
      rate = "-5%";
    } else {
      pitch = "-5Hz";
      rate = "+5%";
    }

    const segPath = path.join(dir, `seg_${String(i).padStart(3, "0")}.mp3`);
    const escapedText = line.replace(/"/g, '\\"').replace(/'/g, "\\'");

    const pyScript = `import asyncio
import edge_tts

async def main():
    communicate = edge_tts.Communicate("${escapedText}", "${VOICE}", pitch="${pitch}", rate="${rate}")
    await communicate.save("${segPath.replace(/\\/g, "\\\\")}")

asyncio.run(main())`;

    const pyPath = path.join(dir, `tts_seg_${i}.py`);
    fs.writeFileSync(pyPath, pyScript);

    try {
      execSync(`python "${pyPath}"`, { stdio: "pipe", timeout: 30000 });
      if (fs.existsSync(segPath) && fs.statSync(segPath).size > 0) {
        segments.push(segPath);
      }
    } catch (err) {
      console.warn(`    [tts] Segment ${i} failed, skipping: ${err.message?.substring(0, 80)}`);
    }

    try {
      fs.unlinkSync(pyPath);
    } catch (_) {}
  }

  if (segments.length === 0) {
    console.log("    [tts] All segments failed, generating simple TTS...");
    const pyScript = `import asyncio
import edge_tts

async def main():
    communicate = edge_tts.Communicate("${fullText.replace(/"/g, '\\"').replace(/\n/g, " ")}", "${VOICE}")
    await communicate.save("${outPath.replace(/\\/g, "\\\\")}")

asyncio.run(main())`;
    const pyPath = path.join(dir, "tts_fallback.py");
    fs.writeFileSync(pyPath, pyScript);
    try {
      execSync(`python "${pyPath}"`, { stdio: "pipe", timeout: 60000 });
    } catch (err) {
      throw new Error(`TTS generation failed completely: ${err.message}`);
    } finally {
      try { fs.unlinkSync(pyPath); } catch (_) {}
    }
  } else if (segments.length === 1) {
    fs.copyFileSync(segments[0], outPath);
  } else {
    const concatList = segments.map((s) => `file '${s.replace(/\\/g, "/")}'`).join("\n");
    const concatPath = path.join(dir, "segments.txt");
    fs.writeFileSync(concatPath, concatList);

    try {
      execSync(
        `ffmpeg -y -f concat -safe 0 -i "${concatPath.replace(/\\/g, "/")}" -c:a libmp3lame -q:a 2 "${outPath.replace(/\\/g, "/")}"`,
        { stdio: "pipe", timeout: 30000 }
      );
    } catch (err) {
      fs.copyFileSync(segments[0], outPath);
    }

    try { fs.unlinkSync(concatPath); } catch (_) {}
  }

  for (const seg of segments) {
    try { fs.unlinkSync(seg); } catch (_) {}
  }

  if (!fs.existsSync(outPath) || fs.statSync(outPath).size === 0) {
    throw new Error("TTS output file is missing or empty");
  }

  const finalStat = fs.statSync(outPath);
  console.log(`    [tts] Narration: ${(finalStat.size / 1024).toFixed(1)}KB, ${segments.length} segments`);

  return outPath;
}

/**
 * Estimate scene durations - slower for kids content: ~2.0 words/sec.
 */
export function estimateSceneDurations(scenes) {
  return scenes.map((s) => {
    const words = s.text.trim().split(/\s+/).length;
    return Math.max(3, words / 2.0);
  });
}
