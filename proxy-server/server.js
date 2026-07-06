const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
}));

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

app.get("/download", async (req, res) => {
  try {
    const videoUrl = req.query.url;

    if (!videoUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    if (!isAllowedUrl(videoUrl)) {
      return res.status(403).json({ error: "URL domain not allowed" });
    }

    const response = await fetch(videoUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch video" });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');

    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    };
    await pump();
  } catch (err) {
    console.error("[proxy] Download error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Download failed" });
    }
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Proxy running on port ${port}`);
});
