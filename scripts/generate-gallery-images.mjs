import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY no está definida.");
  process.exit(1);
}

const outDir = path.resolve(import.meta.dirname, "..", "public", "gallery");
await mkdir(outDir, { recursive: true });

const jobs = [
  {
    file: "gallery-01.jpg",
    size: "1536x1024",
    prompt:
      "Professional real estate photography of a finished luxury outdoor swimming pool at dusk, turquoise water, wooden deck, warm ambient lighting, modern house in background, photorealistic, high quality, no people, no text, no watermark",
  },
  {
    file: "gallery-02.jpg",
    size: "1024x1024",
    prompt:
      "Professional real estate photography of a fully renovated modern kitchen, white and wood cabinets, marble countertop, natural daylight, photorealistic, high quality, no people, no text, no watermark",
  },
  {
    file: "gallery-03.jpg",
    size: "1024x1536",
    prompt:
      "Professional real estate photography of a fully renovated modern bathroom with glass shower, minimalist tile, natural daylight, photorealistic, high quality, no people, no text, no watermark",
  },
  {
    file: "gallery-04.jpg",
    size: "1536x1024",
    prompt:
      "Professional real estate photography of a renovated modern house facade, clean lines, large windows, landscaped front yard, daylight, photorealistic, high quality, no people, no text, no watermark",
  },
  {
    file: "gallery-05.jpg",
    size: "1024x1024",
    prompt:
      "Professional real estate photography of a renovated modern living room, new flooring, minimalist furniture, natural daylight, photorealistic, high quality, no people, no text, no watermark",
  },
  {
    file: "gallery-06.jpg",
    size: "1024x1536",
    prompt:
      "Professional real estate photography of a finished backyard swimming pool with wooden deck and evening ambient lighting, close angle, photorealistic, high quality, no people, no text, no watermark",
  },
];

for (const job of jobs) {
  if (existsSync(path.join(outDir, job.file))) {
    console.log(`Saltando ${job.file} (ya existe).`);
    continue;
  }

  console.log(`Generando ${job.file}...`);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: job.prompt,
      size: job.size,
      quality: "medium",
      output_format: "jpeg",
      n: 1,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error generando ${job.file}: ${response.status} ${errorBody}`);
    process.exit(1);
  }

  const json = await response.json();
  const b64 = json.data[0].b64_json;
  const buffer = Buffer.from(b64, "base64");
  await writeFile(path.join(outDir, job.file), buffer);
  console.log(`OK: ${job.file}`);
}

console.log("Listo.");
