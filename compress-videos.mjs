// 批量压缩 public/videos 下的 mp4：720p(H.264 CRF23) + AAC 96k + faststart
// 逐个处理，输出到同名 .cmp.mp4，校验通过后替换原文件。
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

const dir = path.resolve("public/videos");
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".mp4"));

const ffprobeDur = (file) =>
  new Promise((resolve) => {
    const p = spawn(ffmpegPath, [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      file,
    ]);
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("close", () => resolve(parseFloat(out) || 0));
  });

const run = (file) =>
  new Promise((resolve) => {
    const src = path.join(dir, file);
    const tmp = path.join(dir, file + ".cmp.mp4");
    const args = [
      "-y", "-i", src,
      "-vf", "scale='min(1280,iw)':-2",
      "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "96k",
      "-movflags", "+faststart",
      tmp,
    ];
    const p = spawn(ffmpegPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    p.on("close", async (code) => {
      if (code !== 0) {
        console.log(`✗ ${file} 失败 (code ${code})`);
        try { fs.unlinkSync(tmp); } catch {}
        return resolve();
      }
      const before = fs.statSync(src).size;
      const after = fs.statSync(tmp).size;
      const dBefore = await ffprobeDur(src);
      const dTmp = await ffprobeDur(tmp);
      // 时长误差 < 1s 且体积变小才替换
      if (after < before && Math.abs(dBefore - dTmp) < 1.5) {
        fs.renameSync(tmp, src);
        const pct = ((1 - after / before) * 100).toFixed(1);
        console.log(`✓ ${file}  ${(before/1e6).toFixed(1)}MB -> ${(after/1e6).toFixed(1)}MB (-${pct}%)`);
      } else {
        try { fs.unlinkSync(tmp); } catch {}
        console.log(`· ${file} 跳过 (体积未减或时长异常)`);
      }
      resolve();
    });
  });

let totalBefore = 0;
const t0 = Date.now();
console.log(`开始压缩 ${files.length} 个视频...`);
for (const f of files) {
  totalBefore += fs.statSync(path.join(dir, f)).size;
  await run(f);
}
let totalAfter = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".mp4"))) {
  totalAfter += fs.statSync(path.join(dir, f)).size;
}
console.log("----");
console.log(`视频合计: ${(totalBefore/1e6).toFixed(1)}MB -> ${(totalAfter/1e6).toFixed(1)}MB (-${((1-totalAfter/totalBefore)*100).toFixed(1)}%)`);
console.log(`耗时: ${((Date.now()-t0)/1000).toFixed(1)}s`);
