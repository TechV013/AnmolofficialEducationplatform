/**
 * One-off/safety migration: move base64 data-URI course thumbnails out of the
 * database into static files under public/images/courses/.
 *
 * Base64 thumbnails are inlined into every /courses HTML render (1MB+ per
 * image). Static files are CDN-cached, cacheable by the browser, and
 * optimizable by next/image.
 *
 * Usage: DATABASE_URL=... node scripts/extract-base64-thumbnails.js [--dry-run]
 */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const p = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");
const outDir = path.join(__dirname, "..", "public", "images", "courses");
const backupDir = path.join(__dirname, "backup");

const MIME_EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

(async () => {
  const courses = await p.course.findMany({
    where: { thumbnail: { startsWith: "data:" } },
    select: { id: true, title: true, thumbnail: true },
  });

  if (courses.length === 0) {
    console.log("No base64 thumbnails found. Nothing to do.");
    await p.$disconnect();
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(backupDir, { recursive: true });
  const backup = [];
  const report = [];

  for (const c of courses) {
    const match = /^data:(image\/[a-z+]+);base64,(.+)$/s.exec(c.thumbnail);
    if (!match) {
      report.push({ id: c.id, title: c.title, status: "skipped", reason: "unrecognized data URI format" });
      continue;
    }
    const [, mime, b64] = match;
    const ext = MIME_EXT[mime];
    if (!ext) {
      report.push({ id: c.id, title: c.title, status: "skipped", reason: `unsupported mime ${mime}` });
      continue;
    }

    const buffer = Buffer.from(b64, "base64");
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const filename = `${c.id}.${ext}`;
    const publicPath = `/images/courses/${filename}`;
    const filePath = path.join(outDir, filename);

    backup.push({ id: c.id, title: c.title, originalThumbnail: c.thumbnail });

    if (!dryRun) {
      fs.writeFileSync(filePath, buffer);
      await p.course.update({ where: { id: c.id }, data: { thumbnail: publicPath } });
    }

    report.push({
      id: c.id,
      title: c.title,
      status: dryRun ? "would-extract" : "extracted",
      bytes: buffer.length,
      sha256,
      publicPath,
    });
  }

  if (!dryRun && backup.length > 0) {
    const backupPath = path.join(backupDir, `base64-thumbnails-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`Backup written: ${backupPath}`);
  }

  console.table(report);
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
