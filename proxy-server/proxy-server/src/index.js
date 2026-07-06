const ALLOWED_DOMAINS = [
  "youtube.com",
  "googlevideo.com",
  "ytimg.com",
  "vimeo.com",
  "dailymotion.com",
  "archive.org",
  "vidsrc.to",
  "vidsrc.stream",
  "tmdb.org",
  "image.tmdb.org",
  "pexels.com",
  "images.pexels.com",
  "videos.pexels.com",
];

function isAllowedUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (url.pathname !== "/download") {
      return new Response("StreamVerse Proxy Running", {
        status: 200,
        headers: corsHeaders,
      });
    }

    const videoUrl = url.searchParams.get("url");

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "Missing url parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAllowedUrl(videoUrl)) {
      return new Response(JSON.stringify({ error: "URL domain not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const response = await fetch(videoUrl, {
        redirect: "follow",
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch video" }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const contentType = response.headers.get("content-type") || "application/octet-stream";
      return new Response(response.body, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": 'attachment; filename="video.mp4"',
          ...corsHeaders,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Download failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
