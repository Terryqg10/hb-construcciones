// Extrae 4 fotogramas por vídeo (20/40/60/80 %) a /candidatas y genera una hoja de contactos.
// Uso: npm run frames   (requiere ffmpeg y ffprobe en el PATH)

import { execFile } from "node:child_process";
import { access, mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { assignSlugs } from "./lib/slug.mts";

const execFileAsync = promisify(execFile);

// ───────────── Constantes de configuración ─────────────

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VIDEOS_DIR = path.join(ROOT_DIR, "videos");
const OUTPUT_DIR = path.join(ROOT_DIR, "candidatas");
const VIDEO_EXTENSIONS: readonly string[] = [".mp4", ".mov"];
const FRAME_POSITIONS: readonly number[] = [0.2, 0.4, 0.6, 0.8];
const MAX_SIDE_PX = 1600;
const WEBP_QUALITY = 80;
const INSTALL_HINT = "winget install --id Gyan.FFmpeg -e   (después reabre la terminal)";

// ───────────── Tipos ─────────────

interface VideoJob {
  sourcePath: string;
  fileName: string;
  slug: string;
}

type VideoStatus = "processed" | "skipped" | "failed";

interface VideoResult {
  job: VideoJob;
  status: VideoStatus;
  error?: string;
}

// ───────────── Jobs (slugs compartidos con process-videos) ─────────────

function buildJobs(fileNames: readonly string[]): VideoJob[] {
  return assignSlugs(fileNames).map(({ fileName, slug }) => ({
    sourcePath: path.join(VIDEOS_DIR, fileName),
    fileName,
    slug,
  }));
}

function frameFileName(slug: string, index: number): string {
  return `${slug}-${String(index + 1).padStart(2, "0")}.webp`;
}

// ───────────── Llamadas a ffmpeg / ffprobe ─────────────

function describeError(error: unknown): string {
  if (error instanceof Error) {
    const stderr = (error as Error & { stderr?: unknown }).stderr;
    if (typeof stderr === "string" && stderr.trim() !== "") {
      return stderr.trim().split("\n").slice(-2).join(" ");
    }
    return error.message;
  }
  return String(error);
}

// execFile (sin shell): los nombres con espacios y paréntesis no necesitan escapado.
async function run(command: string, args: readonly string[]): Promise<string> {
  const { stdout } = await execFileAsync(command, [...args], { maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

async function assertToolsInstalled(): Promise<void> {
  for (const tool of ["ffmpeg", "ffprobe"]) {
    try {
      await run(tool, ["-version"]);
    } catch {
      throw new Error(`No se encuentra "${tool}" en el PATH.\nInstálalo con: ${INSTALL_HINT}`);
    }
  }
}

async function probeDuration(videoPath: string): Promise<number> {
  const out = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    videoPath,
  ]);
  const duration = Number(out.trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Duración no válida: "${out.trim()}"`);
  }
  return duration;
}

// Redimensiona sin ampliar nunca: el lado mayor queda en ≤ MAX_SIDE_PX.
const SCALE_FILTER =
  `scale='min(${MAX_SIDE_PX},iw)':'min(${MAX_SIDE_PX},ih)':force_original_aspect_ratio=decrease`;

async function extractFrame(videoPath: string, seconds: number, outPath: string): Promise<void> {
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", seconds.toFixed(3), // antes de -i: salto rápido
    "-i", videoPath,
    "-frames:v", "1",
    "-vf", SCALE_FILTER,
    "-c:v", "libwebp",
    "-quality", String(WEBP_QUALITY),
    "-map_metadata", "-1",
    outPath,
  ]);
}

// ───────────── Procesado de un vídeo ─────────────

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function processVideo(job: VideoJob): Promise<VideoResult> {
  const finalPaths = FRAME_POSITIONS.map((_, i) => path.join(OUTPUT_DIR, frameFileName(job.slug, i)));
  const tmpPaths = finalPaths.map((p) => p.replace(/\.webp$/, ".tmp.webp"));

  // Idempotencia: si ya están las 4 imágenes, no se toca nada.
  const present = await Promise.all(finalPaths.map(exists));
  if (present.every(Boolean)) return { job, status: "skipped" };

  try {
    const duration = await probeDuration(job.sourcePath);
    for (let i = 0; i < FRAME_POSITIONS.length; i += 1) {
      await extractFrame(job.sourcePath, duration * FRAME_POSITIONS[i], tmpPaths[i]);
    }
    // Solo se renombra cuando los 4 fotogramas se han generado bien.
    for (let i = 0; i < finalPaths.length; i += 1) {
      await rename(tmpPaths[i], finalPaths[i]);
    }
    return { job, status: "processed" };
  } catch (error) {
    await Promise.all(tmpPaths.map((p) => rm(p, { force: true })));
    return { job, status: "failed", error: describeError(error) };
  }
}

// ───────────── Hoja de contactos ─────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Se construye desde los .webp presentes en la carpeta, no solo desde esta ejecución.
async function renderContactSheet(): Promise<number> {
  const files = (await readdir(OUTPUT_DIR))
    .filter((f) => f.endsWith(".webp") && !f.endsWith(".tmp.webp"))
    .sort((a, b) => a.localeCompare(b));

  const groups = new Map<string, string[]>();
  for (const file of files) {
    const match = /^(.+)-\d{2}\.webp$/.exec(file);
    if (match === null) continue;
    const slug = match[1];
    groups.set(slug, [...(groups.get(slug) ?? []), file]);
  }

  const sections = [...groups.entries()]
    .map(([slug, frames]) => {
      const figures = frames
        .map((f) => {
          const name = escapeHtml(f);
          return `<figure><img src="${encodeURI(f)}" alt="${name}" loading="lazy"><figcaption>${name}</figcaption></figure>`;
        })
        .join("\n      ");
      return `  <section>\n    <h2>${escapeHtml(slug)}</h2>\n    <div class="row">\n      ${figures}\n    </div>\n  </section>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Candidatas</title>
<style>
  body { margin: 0; padding: 2rem; font-family: system-ui, sans-serif; color: #111; background: #fafafa; }
  h1 { font-size: 1.5rem; margin: 0 0 .25rem; }
  .meta { color: #777; margin: 0 0 2rem; }
  section { margin-bottom: 2.5rem; }
  h2 { font-size: .95rem; font-weight: 600; margin: 0 0 .75rem; word-break: break-all; }
  .row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  figure { margin: 0; }
  img { display: block; width: 100%; aspect-ratio: 9 / 16; object-fit: contain; background: #eee; border-radius: 1rem; }
  figcaption { margin-top: .5rem; font-size: .75rem; color: #777; word-break: break-all; }
  @media (max-width: 700px) { .row { grid-template-columns: repeat(2, 1fr); } }
</style>
</head>
<body>
  <h1>Candidatas</h1>
  <p class="meta">${groups.size} vídeos · ${files.length} fotogramas</p>
${sections}
</body>
</html>
`;
  await writeFile(path.join(OUTPUT_DIR, "index.html"), html, "utf8");
  return groups.size;
}

// ───────────── Programa principal ─────────────

async function listVideoFiles(): Promise<string[]> {
  try {
    const entries = await readdir(VIDEOS_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && VIDEO_EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
      .map((e) => e.name);
  } catch {
    throw new Error(`No se puede leer la carpeta de vídeos: ${VIDEOS_DIR}`);
  }
}

async function main(): Promise<void> {
  await assertToolsInstalled();
  const jobs = buildJobs(await listVideoFiles());
  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Vídeos encontrados: ${jobs.length}\n`);

  const results: VideoResult[] = [];
  for (const [i, job] of jobs.entries()) {
    const result = await processVideo(job);
    results.push(result);
    const label = { processed: "OK    ", skipped: "SALTA ", failed: "FALLA " }[result.status];
    console.log(`[${i + 1}/${jobs.length}] ${label} ${job.fileName}${result.error ? ` → ${result.error}` : ""}`);
  }

  const count = (status: VideoStatus): number => results.filter((r) => r.status === status).length;
  const failed = results.filter((r) => r.status === "failed");
  const sheetVideos = await renderContactSheet();

  console.log(`\nResumen: ${count("processed")} procesados · ${count("skipped")} saltados · ${failed.length} fallidos`);
  for (const r of failed) console.log(`  ✗ ${r.job.fileName}: ${r.error}`);
  console.log(`Hoja de contactos: ${path.join(OUTPUT_DIR, "index.html")} (${sheetVideos} vídeos)`);
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
