const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const API_KEY = process.env.GOOGLE_API_KEY;

app.get("/", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'+and+trashed=false&key=${API_KEY}&fields=files(id,name)`;

    const response = await axios.get(url);
    const files = response.data.files || [];

    const imageUrls = files.map(
      (file) => `https://drive.google.com/uc?export=view&id=${file.id}`
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Art Wall</title>
          <style>
            body { background: #111; color: #fff; font-family: sans-serif; text-align: center; }
            img { max-width: 90vw; margin: 1rem auto; display: block; border-radius: 8px; box-shadow: 0 0 10px rgba(255,255,255,0.1); }
          </style>
        </head>
        <body>
          <h1>✨ ART WALL ✨</h1>
          ${imageUrls.map((url) => `<img src="${url}" alt="Art">`).join("\n")}
        </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error("Error listing files:", err.response?.data || err.message);
    res.status(500).send("Something went wrong.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
