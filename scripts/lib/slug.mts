// Lógica de slugs compartida por los scripts de medios (frames, videos).
// Pura: sin I/O, para que los nombres de salida sean estables entre scripts.

import path from "node:path";

export interface SluggedFile {
  fileName: string;
  slug: string;
}

export function slugify(fileName: string): string {
  const base = path.parse(fileName).name;
  const slug = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "video" : slug;
}

// Orden alfabético fijo (localeCompare); ante colisiones añade -2, -3...
export function assignSlugs(fileNames: readonly string[]): SluggedFile[] {
  const used = new Set<string>();
  return [...fileNames].sort((a, b) => a.localeCompare(b)).map((fileName) => {
    const base = slugify(fileName);
    let slug = base;
    for (let n = 2; used.has(slug); n += 1) slug = `${base}-${n}`;
    used.add(slug);
    return { fileName, slug };
  });
}
