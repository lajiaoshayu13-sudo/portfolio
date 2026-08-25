import sharp from "sharp";
import fs from "fs";
import path from "path";

const dir = path.resolve("public/posters");
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".png"));

let totalBefore = 0;
let totalAfter = 0;

for (const f of files) {
  const src = path.join(dir, f);
  const name = f.slice(0, f.length - 4);
  const dst = path.join(dir, name + ".webp");
  const before = fs.statSync(src).size;
  await sharp(src)
    .webp({ quality: 82, effort: 4 })
    .toFile(dst);
  const after = fs.statSync(dst).size;
  totalBefore += before;
  totalAfter += after;
  const pct = ((1 - after / before) * 100).toFixed(1);
  console.log(`${f.padEnd(46)} ${(before/1e6).toFixed(2)}MB -> ${(after/1e6).toFixed(2)}MB (-${pct}%)`);
  // 原始 PNG 由后续 shell rm 统一清理（环境 safe-delete 拦截了 fs.unlinkSync）
}

console.log("----");
console.log(`合计: ${(totalBefore/1e6).toFixed(1)}MB -> ${(totalAfter/1e6).toFixed(1)}MB`);
console.log(`节省: ${((1 - totalAfter/totalBefore)*100).toFixed(1)}%`);
