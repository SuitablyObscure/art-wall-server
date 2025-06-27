const express = require("express");
const { google } = require("googleapis");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "https://art-wall-server.onrender.com/oauth2callback";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const FOLDER_ID = process.env.FOLDER_ID;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oauth2Client });

app.get("/", async (req, res) => {
  try {
    const query = `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`;

    const result = await drive.files.list({
      q: query,
      fields: "files(id, name, mimeType)",
    });

    const images = result.data.files.map(file => ({
      src: `https://drive.google.com/uc?export=view&id=${file.id}`,
      alt: file.name
    }));

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Art Wall</title>
        <style>
          body {
            font-family: sans-serif;
            background: #111;
            color: #fff;
            margin: 0;
            padding: 1rem;
            text-align: center;
          }
          h1 {
            margin-bottom: 1rem;
            font-size: 2rem;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            padding: 0;
          }
          .grid img {
            width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.1);
          }
          .grid figcaption {
            font-size: 0.75rem;
            margin-top: 0.25rem;
            color: #aaa;
          }
        </style>
      </head>
      <body>
        <h1>Art Wall</h1>
        ${
          images.length > 0
            ? `<div class="grid">
                ${images
                  .map(
                    img => `
                      <figure>
                        <img src="${img.src}" alt="${img.alt}" loading="lazy" />
                        <figcaption>${img.alt}</figcaption>
                      </figure>
                    `
                  )
                  .join("")}
              </div>`
            : "<p>No images found. Check your Google Drive folder and try again.</p>"
        }
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error("Failed to fetch images:", err);
    res.status(500).send("Error fetching images");
  }
});

app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log("Refresh token:", tokens.refresh_token);
    res.send("✅ Success! Refresh token logged to server logs.");
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).send("Something went wrong. Check server logs.");
  }
});

app.listen(port, () => {
  console.log(`Art Wall server running on port ${port}`);
});
