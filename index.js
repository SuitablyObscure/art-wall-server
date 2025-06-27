const express = require("express"); const { google } = require("googleapis"); const path = require("path"); const app = express(); const port = process.env.PORT || 3000;

const CLIENT_ID = process.env.CLIENT_ID; const CLIENT_SECRET = process.env.CLIENT_SECRET; const REDIRECT_URI = process.env.REDIRECT_URI || "https://art-wall-server.onrender.com/oauth2callback"; const REFRESH_TOKEN = process.env.REFRESH_TOKEN; const FOLDER_ID = process.env.FOLDER_ID || "your-shared-folder-id"; // Replace with your actual folder ID

const oauth2Client = new google.auth.OAuth2( CLIENT_ID, CLIENT_SECRET, REDIRECT_URI );

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oauth2Client });

app.get("/", async (req, res) => { try { const result = await drive.files.list({ q: '${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false, fields: "files(id, name, mimeType)" });

const images = result.data.files.map(file =>
  `https://drive.google.com/uc?export=view&id=${file.id}`
);

const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Art Wall</title>
    <style>
      body { font-family: sans-serif; background: #111; color: white; margin: 0; padding: 1rem; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
      .grid img { width: 100%; height: auto; border-radius: 8px; box-shadow: 0 0 8px #000; }
    </style>
  </head>
  <body>
    <h1>Art Wall</h1>
    <div class="grid">
      ${images.map(src => `<img src="${src}" loading="lazy">`).join("")}
    </div>
  </body>
  </html>
`;

res.send(html);

} catch (err) { console.error("Failed to fetch images:", err); res.status(500).send("Error fetching images"); } });

app.get("/oauth2callback", async (req, res) => { const code = req.query.code; try { const { tokens } = await oauth2Client.getToken(code); oauth2Client.setCredentials(tokens); console.log("Refresh token:", tokens.refresh_token); res.send("Success! Refresh token logged to server logs."); } catch (err) { console.error("OAuth callback error:", err); res.status(500).send("Something went wrong. Check server logs."); } });

app.listen(port, () => { console.log(Server running on port ${port}); });

