/** Supabase's free plan caps every uploaded file at 50 MB. */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/** What a gallery link points to: a photo, an uploaded video file, or a YouTube / Instagram video. */
export type Media =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string }
  | { kind: "embed"; src: string; embed: string; site: "youtube" | "instagram" };

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function instagramCode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/([\w-]+)/);
  return m ? m[1] : null;
}

export function media(src: string): Media {
  const yt = youtubeId(src);
  if (yt) return { kind: "embed", src, site: "youtube", embed: `https://www.youtube-nocookie.com/embed/${yt}` };
  const ig = instagramCode(src);
  if (ig) return { kind: "embed", src, site: "instagram", embed: `https://www.instagram.com/p/${ig}/embed` };
  if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(src) || src.includes("/school-videos/")) return { kind: "video", src };
  return { kind: "image", src };
}

/** A link the admin pasted, if it is a YouTube or Instagram video. */
export function isVideoLink(url: string): boolean {
  return youtubeId(url) !== null || instagramCode(url) !== null;
}
