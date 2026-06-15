export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/download") {
      return new Response("StreamVerse Proxy Running", {
        status: 200,
      });
    }

    const videoUrl = url.searchParams.get("url");

    if (!videoUrl) {
      return new Response("Missing url parameter", {
        status: 400,
      });
    }

    try {
      const response = await fetch(videoUrl);

      return new Response(response.body, {
        headers: {
          "Content-Disposition": 'attachment; filename="video.mp4"',
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new Response("Download failed", {
        status: 500,
      });
    }
  },
};