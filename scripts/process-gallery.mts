// Convierte las fotos aprobadas de /fotos-seleccionadas en WebP optimizados en /public/gallery
// y genera src/lib/galeria-data.ts. Nunca modifica ni borra los originales.
// Uso: npm run galeria   (lee scripts/nombres-propuestos.json)

import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// ───────────── Constantes de configuración ─────────────

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT_DIR, "fotos-seleccionadas");
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "gallery");
const PROPOSAL_PATH = path.join(ROOT_DIR, "scripts", "nombres-propuestos.json");
const DATA_PATH = path.join(ROOT_DIR, "src", "lib", "galeria-data.ts");
const IMAGE_EXTENSIONS: readonly string[] = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIDE_PX = 1600;
const WEBP_QUALITY = 80;
const WARN_BYTES = 300 * 1024;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ───────────── Tipos ─────────────

type PhotoStatus = "ok" | "dudosa";

interface PhotoProposal {
  readonly original: string;
  readonly slug: string;
  readonly alt: string;
  readonly status: PhotoStatus;
  readonly avisos: readonly string[];
  // Si es false, la foto se excluye de la galería sin borrarla de la propuesta.
  readonly incluir: boolean;
}

interface PhotoJob {
  readonly proposal: PhotoProposal;
  readonly slug: string;
  readonly sourcePath: string;
  readonly outputPath: string;
}

type JobStatus = "processed" | "skipped" | "failed";

interface JobResult {
  readonly job: PhotoJob;
  readonly status: JobStatus;
  readonly error?: string;
  readonly width?: number;
  readonly height?: number;
  readonly sizeBytes?: number;
}

interface GalleryEntry {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

// ───────────── Lectura y validación de la propuesta ─────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseProposal(value: unknown, index: number): PhotoProposal {
  if (!isRecord(value)) throw new Error(`Entrada ${index + 1}: no es un objeto.`);
  const { original, slug, alt, status, avisos, incluir } = value;
  const label = `Entrada ${index + 1}`;

  if (typeof original !== "string" || original === "") throw new Error(`${label}: falta "original".`);
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    throw new Error(`${label} (${original}): "slug" inválido (minúsculas, números y guiones).`);
  }
  if (typeof alt !== "string" || alt.trim() === "") throw new Error(`${label} (${original}): "alt" vacío.`);
  if (status !== "ok" && status !== "dudosa") {
    throw new Error(`${label} (${original}): "status" debe ser "ok" o "dudosa".`);
  }
  if (incluir !== undefined && typeof incluir !== "boolean") {
    throw new Error(`${label} (${original}): "incluir" debe ser true o false.`);
  }
  const warnings =
    Array.isArray(avisos) && avisos.every((a): a is string => typeof a === "string") ? avisos : [];

  return { original, slug, alt: alt.trim(), status, avisos: warnings, incluir: incluir !== false };
}

async function loadProposals(): Promise<PhotoProposal[]> {
  const raw: unknown = JSON.parse(await readFile(PROPOSAL_PATH, "utf8"));
  if (!Array.isArray(raw)) throw new Error("nombres-propuestos.json debe ser una lista.");
  const proposals = raw.map((item: unknown, i) => parseProposal(item, i));

  const seen = new Set<string>();
  for (const p of proposals) {
    if (seen.has(p.original)) throw new Error(`"${p.original}" aparece dos veces en la propuesta.`);
    seen.add(p.original);
  }
  return proposals;
}

async function listSourceFiles(): Promise<string[]> {
  const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && IMAGE_EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
    .map((e) => e.name);
}

// ───────────── Jobs (nombres finales, con -2, -3 en orden alfabético del original) ─────────────

function buildJobs(proposals: readonly PhotoProposal[]): PhotoJob[] {
  const slugByOriginal = new Map<string, string>();
  const used = new Set<string>();

  const alphabetical = [...proposals].sort((a, b) => a.original.localeCompare(b.original));
  for (const p of alphabetical) {
    let slug = p.slug;
    for (let n = 2; used.has(slug); n += 1) slug = `${p.slug}-${n}`;
    used.add(slug);
    slugByOriginal.set(p.original, slug);
  }

  // Se conserva el orden de la propuesta: es el orden de aparición en la galería.
  return proposals.map((proposal) => {
    const slug = slugByOriginal.get(proposal.original) ?? proposal.slug;
    return {
      proposal,
      slug,
      sourcePath: path.join(SOURCE_DIR, proposal.original),
      outputPath: path.join(OUTPUT_DIR, `${slug}.webp`),
    };
  });
}

// ───────────── Procesado de una foto ─────────────

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function modifiedMs(filePath: string): Promise<number | null> {
  try {
    return (await stat(filePath)).mtimeMs;
  } catch {
    return null;
  }
}

async function readOutputInfo(job: PhotoJob): Promise<{ width: number; height: number; sizeBytes: number }> {
  const { width, height } = await sharp(job.outputPath).metadata();
  if (width === undefined || height === undefined) {
    throw new Error("No se pudieron leer las dimensiones del WebP generado.");
  }
  return { width, height, sizeBytes: (await stat(job.outputPath)).size };
}

async function processPhoto(job: PhotoJob): Promise<JobResult> {
  const tempPath = job.outputPath.replace(/\.webp$/, ".tmp.webp");
  try {
    const sourceMs = await modifiedMs(job.sourcePath);
    if (sourceMs === null) throw new Error("No existe el archivo original.");

    const outputMs = await modifiedMs(job.outputPath);
    if (outputMs !== null && outputMs >= sourceMs) {
      return { job, status: "skipped", ...(await readOutputInfo(job)) };
    }

    // rotate() aplica la orientación EXIF; sin withMetadata() se eliminan EXIF/ICC/XMP.
    await sharp(job.sourcePath)
      .rotate()
      .resize({ width: MAX_SIDE_PX, height: MAX_SIDE_PX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(tempPath);
    await rename(tempPath, job.outputPath);

    return { job, status: "processed", ...(await readOutputInfo(job)) };
  } catch (error: unknown) {
    await rm(tempPath, { force: true });
    return { job, status: "failed", error: describeError(error) };
  }
}

// ───────────── Módulo de datos generado ─────────────

function renderGalleryModule(entries: readonly GalleryEntry[]): string {
  const items = entries
    .map(
      (e) =>
        `  {\n    src: ${JSON.stringify(e.src)},\n    alt: ${JSON.stringify(e.alt)},\n    width: ${e.width},\n    height: ${e.height},\n  },`,
    )
    .join("\n");

  return `// Generado por \`npm run galeria\` (scripts/process-gallery.mts). No editar a mano.
// Fuente: scripts/nombres-propuestos.json

export interface GalleryPhoto {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export const galleryPhotos: readonly GalleryPhoto[] = [
${items}
];
`;
}

async function writeIfChanged(filePath: string, content: string): Promise<boolean> {
  try {
    if ((await readFile(filePath, "utf8")) === content) return false;
  } catch {
    // No existe todavía: se crea.
  }
  await writeFile(filePath, content, "utf8");
  return true;
}

// ───────────── Principal ─────────────

function formatKb(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`;
}

async function main(): Promise<void> {
  const proposals = await loadProposals();
  const sourceFiles = await listSourceFiles();

  const missing = proposals.filter((p) => !sourceFiles.includes(p.original));
  const unlisted = sourceFiles.filter((f) => !proposals.some((p) => p.original === f));
  const doubtful = proposals.filter((p) => p.incluir && p.status === "dudosa");
  const excluded = proposals.filter((p) => !p.incluir);
  const approved = proposals.filter((p) => p.incluir && p.status === "ok");

  const jobs = buildJobs(approved);
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  console.log(`Fotos a procesar: ${jobs.length}\n`);

  const results: JobResult[] = [];
  for (const [i, job] of jobs.entries()) {
    const result = await processPhoto(job);
    results.push(result);
    const label = { processed: "OK    ", skipped: "SALTA ", failed: "FALLA " }[result.status];
    console.log(`[${i + 1}/${jobs.length}] ${label} ${job.proposal.original} → ${job.slug}.webp${result.error ? ` (${result.error})` : ""}`);
  }

  const entries: GalleryEntry[] = [];
  for (const r of results) {
    if (r.status === "failed" || r.width === undefined || r.height === undefined) continue;
    entries.push({ src: `/gallery/${r.job.slug}.webp`, alt: r.job.proposal.alt, width: r.width, height: r.height });
  }
  const dataChanged = await writeIfChanged(DATA_PATH, renderGalleryModule(entries));

  const count = (status: JobStatus): number => results.filter((r) => r.status === status).length;
  const failed = results.filter((r) => r.status === "failed");
  const heavy = results.filter((r) => (r.sizeBytes ?? 0) > WARN_BYTES);

  console.log(`\nResumen: ${count("processed")} procesadas · ${count("skipped")} saltadas · ${failed.length} fallidas`);
  console.log(`Datos: ${path.relative(ROOT_DIR, DATA_PATH)} (${entries.length} fotos, ${dataChanged ? "actualizado" : "sin cambios"})`);
  for (const r of failed) console.log(`  ✗ ${r.job.proposal.original}: ${r.error}`);
  for (const p of doubtful) console.log(`  ? Dudosa, no procesada: ${p.original} (pásala a "ok" cuando esté resuelta)`);
  for (const p of excluded) console.log(`  – Excluida (incluir: false): ${p.original}`);
  for (const p of missing) console.log(`  ! En la propuesta pero no existe en la carpeta: ${p.original}`);
  for (const f of unlisted) console.log(`  ! En la carpeta pero no está en la propuesta: ${f}`);
  for (const r of heavy) console.log(`  ⚠ Pesa más de ${formatKb(WARN_BYTES)}: ${r.job.slug}.webp (${formatKb(r.sizeBytes ?? 0)})`);

  if (failed.length > 0 || missing.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
