const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/download", async (req, res) => {
  try {
    const videoUrl = req.query.url;

 const response = await axios({
  method: "GET",
  url: videoUrl,
  responseType: "stream",
  maxRedirects: 10,
  timeout: 60000,
});

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="video.mp4"'
    );

    response.data.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Download failed");
  }
});

app.listen(3001, () => {
  console.log("Proxy running on port 3001");
});