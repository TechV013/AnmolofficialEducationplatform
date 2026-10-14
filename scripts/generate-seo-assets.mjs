import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_LOGO = path.join(ROOT, "public", "images", "Design-Vidya-Logo.png");
const APP_DIR = path.join(ROOT, "src", "app");
const PUBLIC_IMG = path.join(ROOT, "public", "images");

// Crop of the center monogram from the circular seal logo.
// sideFrac = crop side as a fraction of the shorter image dimension.
// cx/cy    = crop centre as a fraction of width/height.
const CROP = {
  sideFrac: 0.255,
  cx: 0.502,
  cy: 0.492,
};

// Transparent padding baked into the generated icons (fraction of icon size)
// so the mark never touches the rounded-square / circle edge.
const PAD_FRAC = 0.06;

function buildIco(parts) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(parts.length, 4);

  let offset = 6 + 16 * parts.length;
  const entries = [];
  const blobs = [];
  for (const { size, data } of parts) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    blobs.push(data);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...blobs]);
}

function transparentCanvas(size) {
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).png().toBuffer();
}

async function main() {
  const meta = await sharp(SRC_LOGO).metadata();
  const { width: W, height: H } = meta;
  console.log(`logo: ${W}x${H} alpha=${meta.hasAlpha}`);

  const side = Math.round(Math.min(W, H) * CROP.sideFrac);
  const cx = Math.round(W * CROP.cx);
  const cy = Math.round(H * CROP.cy);
  const left = Math.max(0, Math.min(cx - Math.round(side / 2), W - side));
  const top = Math.max(0, Math.min(cy - Math.round(side / 2), H - side));

  console.log(`crop: ${side}x${side} @ (${left},${top})`);

  const monoBuffer = await sharp(SRC_LOGO)
    .extract({ left, top, width: side, height: side })
    .png()
    .toBuffer();

  const padFor = (size) => Math.round(size * PAD_FRAC);

  const iconAt = async (size) => {
    const inner = size - padFor(size) * 2;
    const resized = await sharp(monoBuffer)
      .resize(inner, inner, { fit: "inside", withoutEnlargement: false })
      .png()
      .toBuffer();
    const canvas = await transparentCanvas(size);
    return sharp(canvas)
      .composite([{ input: resized, gravity: "center" }])
      .png()
      .toBuffer();
  };

  const icon512 = await iconAt(512);
  const apple180 = await iconAt(180);
  fs.writeFileSync(path.join(APP_DIR, "icon.png"), icon512);
  fs.writeFileSync(path.join(APP_DIR, "apple-icon.png"), apple180);

  const icoParts = [];
  for (const size of [16, 32, 48]) {
    icoParts.push({ size, data: await iconAt(size) });
  }
  fs.writeFileSync(path.join(APP_DIR, "favicon.ico"), buildIco(icoParts));
  console.log("wrote src/app/{icon.png,apple-icon.png,favicon.ico}");

  // ---- Social share card (1200x630) with the full seal + brand text ----
  const CW = 1200;
  const CH = 630;
  const sealSize = 430;
  const seal = await sharp(SRC_LOGO)
    .resize(sealSize, sealSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const svg = `<svg width="${CW}" height="${CH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${CW}" height="${CH}" fill="#ffffff"/>
    <rect x="0" y="0" width="${CW}" height="14" fill="#14315c"/>
    <rect x="0" y="${CH - 14}" width="${CW}" height="14" fill="#14315c"/>
    <text x="560" y="255" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="#111827">Design Vidya</text>
    <text x="560" y="330" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="400" fill="#4b5563">Master 3D Modeling, Animation,</text>
    <text x="560" y="376" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="400" fill="#4b5563">VFX &amp; Video Editing</text>
    <text x="560" y="470" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#14315c">www.designvidya.com</text>
  </svg>`;

  const og = await sharp(Buffer.from(svg))
    .composite([{ input: seal, left: 70, top: 100 }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_IMG, "og-image.png"), og);
  console.log("wrote public/images/og-image.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
