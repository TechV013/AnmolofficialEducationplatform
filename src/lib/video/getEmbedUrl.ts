export type MediaType = "youtube" | "vimeo" | "html5";

export interface MediaInfo {
  type: MediaType;
  embedUrl: string;
}

export function getEmbedUrl(url: string): MediaInfo {
  if (!url) return { type: "html5", embedUrl: "" };

  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0] || "";
  } else if (url.includes("youtube.com/embed/")) {
    videoId = url.split("youtube.com/embed/")[1]?.split(/[?#]/)[0] || "";
  } else if (url.includes("youtube.com/shorts/")) {
    videoId = url.split("youtube.com/shorts/")[1]?.split(/[?#]/)[0] || "";
  } else if (url.includes("v=")) {
    const queryPart = url.split("?")[1];
    if (queryPart) {
      const urlParams = new URLSearchParams(queryPart);
      videoId = urlParams.get("v") || "";
    }
  }

  if (videoId && videoId.length === 11) {
    return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1` };
  }

  const vimeoMatch = url.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?)/
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }

  return { type: "html5", embedUrl: url };
}

export function getEmbedUrlWithResume(url: string, seconds: number): MediaInfo {
  const info = getEmbedUrl(url);
  if (seconds <= 0) return info;

  const floorSeconds = Math.floor(seconds);

  if (info.type === "youtube") {
    return { ...info, embedUrl: info.embedUrl + `&start=${floorSeconds}` };
  }
  if (info.type === "vimeo") {
    return { ...info, embedUrl: info.embedUrl + `#t=${floorSeconds}s` };
  }
  return info;
}

export function getMediaTypeLabel(type: MediaType): string {
  switch (type) {
    case "youtube": return "YouTube";
    case "vimeo": return "Vimeo";
    case "html5": return "Video";
  }
}
