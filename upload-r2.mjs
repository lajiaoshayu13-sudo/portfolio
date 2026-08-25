// 将 data.js 实际引用的视频上传到 Cloudflare R2（S3 兼容）
// 用法（在 portfolio 目录下）：
//   R2_ACCOUNT_ID=xxxx R2_ACCESS_KEY_ID=xxxx R2_SECRET_ACCESS_KEY=xxxx \
//   R2_BUCKET=my-bucket R2_PUBLIC_URL=https://pub-xxxx.r2.dev node upload-r2.mjs
//
// 说明：
// - 自动解析 src/data.js 中的 /videos/xxx.mp4，只上传被引用的视频（排除孤儿文件）
// - 上传到 bucket 的 videos/ 前缀
// - R2_PUBLIC_URL 填启用 R2.dev 公开访问后的地址，或自定义域；留空则输出 S3 形式 URL

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname);
const DATA = path.join(ROOT, 'src/data.js');
const VIDEOS_DIR = path.join(ROOT, 'public/videos');

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET || !BUCKET) {
  console.error('✗ 缺少环境变量，请设置：');
  console.error('  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET');
  console.error('  可选：R2_PUBLIC_URL（启用 R2.dev 公开访问后的地址）');
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET },
});

// 解析 data.js 引用的视频
const src = fs.readFileSync(DATA, 'utf8');
const names = [...new Set(
  [...src.matchAll(/\/videos\/([^"']+\.mp4)/g)].map((m) => m[1])
)];
console.log(`\n📋 data.js 引用 ${names.length} 个视频，准备上传\n`);

const results = [];
for (const name of names) {
  const local = path.join(VIDEOS_DIR, name);
  if (!fs.existsSync(local)) {
    console.warn(`  ⚠ 跳过（本地缺失）: ${name}`);
    continue;
  }
  const key = `videos/${name}`;
  const body = fs.readFileSync(local);
  const sizeMB = (body.length / 1e6).toFixed(1);
  process.stdout.write(`  ↑ ${name} (${sizeMB}MB) -> ${key} ... `);
  try {
    const up = new Upload({
      client,
      params: {
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: 'video/mp4',
      },
    });
    await up.done();
    const url = PUBLIC_URL
      ? `${PUBLIC_URL}/${key}`
      : `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}/${key}`;
    results.push({ name, key, url });
    console.log('✓');
  } catch (e) {
    console.log(`✗ ${e.message}`);
  }
}

console.log('\n=== 上传完成，R2 视频 URL 列表 ===');
for (const r of results) console.log(`${r.name}\t${r.url}`);
console.log(`\n共成功 ${results.length}/${names.length} 个`);
