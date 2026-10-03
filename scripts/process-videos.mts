// Procesa los clips de /videos-seleccionados a /public/videos: un .mp4 ligero (H.264, ≤ 720 px,
// sin audio) y una portada .webp por clip. Recorta barras negras incrustadas.
// Uso: npm run videos [-- --only=<slug>]   (requiere ffmpeg y ffprobe en el PATH)

import { execFile } from "node:child_process";
import { access, mkdir, readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { assignSlugs } from "./lib/slug.mts";
import { videoClips } from "../src/lib/video-clips.ts";

const execFileAsync = promisify(execFile);

// ───────────── Constantes de configuración ─────────────

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INPUT_DIR = path.join(ROOT_DIR, "videos-seleccionados");
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "videos");
const VIDEO_EXTENSIONS: readonly string[] = [".mp4", ".mov"];
const MAX_VIDEO_WIDTH_PX = 720;
const CRF = 28;
const MAX_POSTER_SIDE_PX = 1600;
const WEBP_QUALITY = 80;
const DEFAULT_POSTER_POSITION = 0.3;
const CROP_SAMPLE_START = 0.1;
const CROP_SAMPLE_SECONDS = 10;
const MIN_CROP_REMOVED_RATIO = 0.05;
const MAX_VIDEO_BYTES = 4 * 1024 * 1024;
const INSTALL_HINT = "winget install --id Gyan.FFmpeg -e   (después reabre la terminal)";

// ───────────── Tipos ─────────────

interface VideoJob {
  sourcePath: string;
  fileName: string;
  slug: string;
}

interface Dimensions {
  width: number;
  height: number;
}

interface CropBox extends Dimensions {
  x: number;
  y: number;
}

interface VideoInfo extends Dimensions {
  duration: number;
}

type VideoStatus = "processed" | "skipped" | "failed";

interface VideoResult {
  job: VideoJob;
  status: VideoStatus;
  error?: string;
  sizeBytes?: number;
}

// ───────────── Lógica pura ─────────────

// Extrae cada "crop=W:H:X:Y" que imprime cropdetect.
function parseCropdetect(output: string): CropBox[] {
  const boxes: CropBox[] = [];
  for (const match of output.matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)) {
    boxes.push({
      width: Number(match[1]),
      height: Number(match[2]),
      x: Number(match[3]),
      y: Number(match[4]),
    });
  }
  return boxes;
}

function cropKey(box: CropBox): string {
  return `${box.width}:${box.height}:${box.x}:${box.y}`;
}

// Elige el recorte más frecuente; solo se aplica si quita ≥ 5 % del área y cabe en el fotograma.
function pickCrop(boxes: readonly CropBox[], frame: Dimensions): CropBox | null {
  const counts = new Map<string, { box: CropBox; count: number }>();
  for (const box of boxes) {
    const key = cropKey(box);
    const entry = counts.get(key);
    counts.set(key, { box, count: (entry?.count ?? 0) + 1 });
  }
  let best: { box: CropBox; count: number } | null = null;
  for (const entry of counts.values()) {
    if (best === null || entry.count > best.count) best = entry;
  }
  if (best === null) return null;

  const { box } = best;
  const fits = box.x + box.width <= frame.width && box.y + box.height <= frame.height;
  const removed = 1 - (box.width * box.height) / (frame.width * frame.height);
  return fits && removed >= MIN_CROP_REMOVED_RATIO ? box : null;
}

function cropFilter(crop: CropBox | null): string[] {
  return crop === null ? [] : [`crop=${cropKey(crop)}`];
}

function buildVideoFilter(crop: CropBox | null): string {
  return [...cropFilter(crop), `scale='min(${MAX_VIDEO_WIDTH_PX},iw)':-2`, "format=yuv420p"].join(",");
}

function buildPosterFilter(crop: CropBox | null): string {
  return [
    ...cropFilter(crop),
    `scale='min(${MAX_POSTER_SIDE_PX},iw)':'min(${MAX_POSTER_SIDE_PX},ih)':force_original_aspect_ratio=decrease`,
  ].join(",");
}

// Segundo de la portada: el configurado en video-clips.ts o, por defecto, el 30 % de la duración.
function posterSeconds(configured: number | undefined, duration: number): number {
  const wanted = configured ?? duration * DEFAULT_POSTER_POSITION;
  return Math.min(Math.max(wanted, 0), Math.max(duration - 0.1, 0));
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildJobs(fileNames: readonly string[]): VideoJob[] {
  return assignSlugs(fileNames).map(({ fileName, slug }) => ({
    sourcePath: path.join(INPUT_DIR, fileName),
    fileName,
    slug,
  }));
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
async function run(command: string, args: readonly string[]): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync(command, [...args], { maxBuffer: 20 * 1024 * 1024 });
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === "string" || typeof value === "number" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

// Duración y dimensiones *después* de aplicar la rotación (metadato rotate / display matrix).
async function probeVideo(videoPath: string): Promise<VideoInfo> {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height:stream_side_data=rotation:stream_tags=rotate:format=duration",
    "-of", "json",
    videoPath,
  ]);
  const data: unknown = JSON.parse(stdout);
  if (!isRecord(data)) throw new Error("Respuesta de ffprobe no válida");
  const streams = Array.isArray(data.streams) ? data.streams : [];
  const stream: unknown = streams[0];
  if (!isRecord(stream)) throw new Error("El archivo no tiene pista de vídeo");

  const width = toFiniteNumber(stream.width);
  const height = toFiniteNumber(stream.height);
  const duration = isRecord(data.format) ? toFiniteNumber(data.format.duration) : null;
  if (width === null || height === null || width <= 0 || height <= 0) {
    throw new Error("Dimensiones no válidas");
  }
  if (duration === null || duration <= 0) throw new Error("Duración no válida");

  const sideData = Array.isArray(stream.side_data_list) ? stream.side_data_list : [];
  const rotations = sideData.map((d: unknown) => (isRecord(d) ? toFiniteNumber(d.rotation) : null));
  const tags = isRecord(stream.tags) ? toFiniteNumber(stream.tags.rotate) : null;
  const rotation = Math.abs(rotations.find((r) => r !== null) ?? tags ?? 0) % 180;
  return rotation === 90 ? { width: height, height: width, duration } : { width, height, duration };
}

async function detectCrop(videoPath: string, info: VideoInfo): Promise<CropBox | null> {
  const { stderr } = await run("ffmpeg", [
    "-hide_banner", "-nostats",
    "-ss", (info.duration * CROP_SAMPLE_START).toFixed(3),
    "-t", String(CROP_SAMPLE_SECONDS),
    "-i", videoPath,
    "-vf", "cropdetect=limit=24:round=2",
    "-an", "-f", "null", "-",
  ]);
  return pickCrop(parseCropdetect(stderr), info);
}

async function encodeVideo(videoPath: string, crop: CropBox | null, outPath: string): Promise<void> {
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", videoPath,
    "-vf", buildVideoFilter(crop),
    "-c:v", "libx264",
    "-crf", String(CRF),
    "-preset", "medium",
    "-an",
    "-movflags", "+faststart",
    "-map_metadata", "-1",
    outPath,
  ]);
}

async function extractPoster(videoPath: string, seconds: number, crop: CropBox | null, outPath: string): Promise<void> {
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", seconds.toFixed(3), // antes de -i: salto rápido
    "-i", videoPath,
    "-frames:v", "1",
    "-vf", buildPosterFilter(crop),
    "-c:v", "libwebp",
    "-quality", String(WEBP_QUALITY),
    "-map_metadata", "-1",
    outPath,
  ]);
}

// ───────────── Procesado de un clip ─────────────

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function processVideo(job: VideoJob): Promise<VideoResult> {
  const mp4Path = path.join(OUTPUT_DIR, `${job.slug}.mp4`);
  const webpPath = path.join(OUTPUT_DIR, `${job.slug}.webp`);
  const tmpMp4 = path.join(OUTPUT_DIR, `${job.slug}.tmp.mp4`);
  const tmpWebp = path.join(OUTPUT_DIR, `${job.slug}.tmp.webp`);

  // Idempotencia: si ya están el .mp4 y la portada, no se toca nada.
  if ((await exists(mp4Path)) && (await exists(webpPath))) {
    return { job, status: "skipped", sizeBytes: (await stat(mp4Path)).size };
  }

  try {
    const info = await probeVideo(job.sourcePath);
    const crop = await detectCrop(job.sourcePath, info);
    const configured = videoClips.find((clip) => clip.id === job.slug)?.posterAt;

    await encodeVideo(job.sourcePath, crop, tmpMp4);
    await extractPoster(job.sourcePath, posterSeconds(configured, info.duration), crop, tmpWebp);
    // Solo se renombra cuando ambos archivos se han generado bien.
    await rename(tmpMp4, mp4Path);
    await rename(tmpWebp, webpPath);
    return { job, status: "processed", sizeBytes: (await stat(mp4Path)).size };
  } catch (error) {
    await Promise.all([tmpMp4, tmpWebp].map((p) => rm(p, { force: true })));
    return { job, status: "failed", error: describeError(error) };
  }
}

// ───────────── Programa principal ─────────────

async function listVideoFiles(): Promise<string[]> {
  try {
    const entries = await readdir(INPUT_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && VIDEO_EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
      .map((e) => e.name);
  } catch {
    throw new Error(`No se puede leer la carpeta de vídeos: ${INPUT_DIR}`);
  }
}

// --only=<slug>: procesa solo ese clip (para pruebas). Los slugs se calculan sobre la lista completa.
function parseOnlyArg(args: readonly string[]): string | null {
  const arg = args.find((a) => a.startsWith("--only="));
  return arg === undefined ? null : arg.slice("--only=".length);
}

async function main(): Promise<void> {
  await assertToolsInstalled();
  const allJobs = buildJobs(await listVideoFiles());
  const only = parseOnlyArg(process.argv.slice(2));
  const jobs = only === null ? allJobs : allJobs.filter((j) => j.slug === only);
  if (only !== null && jobs.length === 0) throw new Error(`No hay ningún clip con el slug "${only}"`);
  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Clips a procesar: ${jobs.length}\n`);

  const results: VideoResult[] = [];
  for (const [i, job] of jobs.entries()) {
    const result = await processVideo(job);
    results.push(result);
    const label = { processed: "OK    ", skipped: "SALTA ", failed: "FALLA " }[result.status];
    const size = result.sizeBytes === undefined ? "" : ` (${formatMegabytes(result.sizeBytes)})`;
    console.log(`[${i + 1}/${jobs.length}] ${label} ${job.fileName} → ${job.slug}${size}${result.error ? ` → ${result.error}` : ""}`);
  }

  const count = (status: VideoStatus): number => results.filter((r) => r.status === status).length;
  const failed = results.filter((r) => r.status === "failed");
  const heavy = results.filter((r) => r.sizeBytes !== undefined && r.sizeBytes > MAX_VIDEO_BYTES);

  console.log(`\nResumen: ${count("processed")} procesados · ${count("skipped")} saltados · ${failed.length} fallidos`);
  for (const r of failed) console.log(`  ✗ ${r.job.fileName}: ${r.error}`);
  for (const r of heavy) {
    console.log(`  ⚠ ${r.job.slug}.mp4 pesa ${formatMegabytes(r.sizeBytes ?? 0)} (> ${formatMegabytes(MAX_VIDEO_BYTES)})`);
  }

  const knownSlugs = new Set(allJobs.map((j) => j.slug));
  for (const clip of videoClips) {
    if (!knownSlugs.has(clip.id)) console.log(`  ⚠ video-clips.ts lista "${clip.id}" pero no hay archivo con ese slug`);
  }
  const listedIds = new Set(videoClips.map((c) => c.id));
  for (const job of allJobs) {
    if (!listedIds.has(job.slug)) console.log(`  ⚠ "${job.slug}" no figura en video-clips.ts (portada al 30 %, sin tarjeta)`);
  }
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
