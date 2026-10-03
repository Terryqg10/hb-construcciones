import { ArrowUpRight, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { videoClips, type VideoClip } from "@/lib/video-clips";
import { Reveal } from "@/components/ui/Reveal";
import { VideoCard } from "@/components/ui/VideoCard";
import { VideoCarousel } from "@/components/ui/VideoCarousel";

interface VideoGalleryProps {
  /** Clips a mostrar; por defecto, todos los de video-clips.ts. */
  clips?: readonly VideoClip[];
}

const LINK_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

export function VideoGallery({ clips = videoClips }: VideoGalleryProps) {
  if (clips.length === 0) return null;

  return (
    <section aria-labelledby="videos-obras-titulo" className="mt-20">
      <Reveal>
        <h3 id="videos-obras-titulo" className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Nuestras obras en vídeo
        </h3>
        <p className="mt-2 text-center text-sm text-slate-500">
          Así trabajamos, directamente desde la obra.
        </p>
      </Reveal>

      <VideoCarousel>
        {clips.map((clip) => (
          <li key={clip.id} className="w-[68vw] max-w-64 shrink-0 snap-start sm:w-56 sm:max-w-none lg:w-52">
            <VideoCard clip={clip} />
          </li>
        ))}
      </VideoCarousel>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={siteConfig.tiktokHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 rounded-full bg-slate-100 px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 active:scale-[0.97] ${LINK_FOCUS}`}
        >
          Ver más en TikTok
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>

        <a
          href={siteConfig.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.97] ${LINK_FOCUS}`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Escríbenos por WhatsApp
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      </div>
    </section>
  );
}
