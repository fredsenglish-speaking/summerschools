import { media } from "@/lib/media";

/** One gallery entry: a photo (opens full size), a video file, or an embedded YouTube / Instagram video. */
export function GalleryItem({ src, alt = "" }: { src: string; alt?: string }) {
  const m = media(src);
  if (m.kind === "video") {
    return (
      <div className="g-item g-video">
        <video src={`${m.src}#t=0.1`} controls preload="metadata" playsInline />
      </div>
    );
  }
  if (m.kind === "embed") {
    return (
      <div className={`g-item g-embed ${m.site}`}>
        <iframe src={m.embed} title={alt || m.site} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    );
  }
  return (
    <a href={m.src} target="_blank" rel="noreferrer" className="g-item">
      <img src={m.src} alt={alt} loading="lazy" />
    </a>
  );
}
