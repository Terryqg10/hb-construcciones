import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY no está definida.");
  process.exit(1);
}

const outPath = path.resolve(import.meta.dirname, "..", "public", "hero-bg.jpg");

if (existsSync(outPath)) {
  console.log("Saltando hero-bg.jpg (ya existe).");
  process.exit(0);
}

const prompt =
  "Ultra-realistic wide panoramic shot of a modern luxury house terrace with a pristine swimming pool at twilight. Architectural photography, warm interior lighting contrasting with cool deep blue water, high contrast, 8k, photorealistic, clean composition. Absolutely no text, no people.";

console.log("Generando hero-bg.jpg con gpt-image-1...");

const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-image-1",
    prompt,
    size: "1536x1024",
    quality: "high",
    output_format: "jpeg",
    n: 1,
  }),
});

if (!response.ok) {
  const errorBody = await response.text();
  console.error(`Error generando hero-bg.jpg: ${response.status} ${errorBody}`);
  process.exit(1);
}

const json = await response.json();
const b64 = json.data[0].b64_json;
await writeFile(outPath, Buffer.from(b64, "base64"));
console.log("OK: hero-bg.jpg");
