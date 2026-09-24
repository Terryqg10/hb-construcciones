import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY no está definida.");
  process.exit(1);
}

const publicDir = path.resolve(import.meta.dirname, "..", "public");
const outDir = path.join(publicDir, "before-after");
await mkdir(outDir, { recursive: true });

const jobs = [
  {
    file: "before-piscina-v2.jpg",
    sourceAfter: path.join(publicDir, "gallery", "gallery-01.jpg"),
    prompt:
      "Edit this exact photo, changing ONLY the pool itself: drain all the water and show worn, cracked, empty concrete with no lights inside it. Do NOT change anything else — keep the exact same house, roofline, windows, doors, walls, wooden deck, wall lights, plants, trees, sky, and the same night/dusk lighting exactly as in the original photo. Photorealistic, no people, no text, no watermark.",
  },
  {
    file: "before-cocina.jpg",
    sourceAfter: path.join(publicDir, "gallery", "gallery-02.jpg"),
    prompt:
      "Edit this exact photo to show the same kitchen before renovation: outdated worn wooden cabinets, old yellowed countertop, dated appliances, dimmer lighting. Keep the exact same camera angle, framing, window position, and room layout. Photorealistic, no people, no text, no watermark.",
  },
  {
    file: "before-bano.jpg",
    sourceAfter: path.join(publicDir, "gallery", "gallery-03.jpg"),
    prompt:
      "Edit this exact photo to show the same bathroom before renovation: old cracked tiles, rusty worn fixtures, outdated sink and toilet, dimmer lighting. Keep the exact same camera angle, framing, window position, and room layout. Photorealistic, no people, no text, no watermark.",
  },
];

for (const job of jobs) {
  const outPath = path.join(outDir, job.file);

  if (existsSync(outPath)) {
    console.log(`Saltando ${job.file} (ya existe).`);
    continue;
  }

  console.log(`Generando ${job.file} a partir de ${path.basename(job.sourceAfter)}...`);

  const imageBuffer = await readFile(job.sourceAfter);
  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("prompt", job.prompt);
  form.append("quality", "medium");
  form.append("image", new Blob([imageBuffer], { type: "image/jpeg" }), "after.jpg");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error generando ${job.file}: ${response.status} ${errorBody}`);
    process.exit(1);
  }

  const json = await response.json();
  const b64 = json.data[0].b64_json;
  const buffer = Buffer.from(b64, "base64");
  await writeFile(outPath, buffer);
  console.log(`OK: ${job.file}`);
}

console.log("Listo.");
