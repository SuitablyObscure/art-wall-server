const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Step 1: Authorization URL generator
app.get("/", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/drive.readonly"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  res.send(`<a href="${url}">Authorize with Google</a>`);
});

// Step 2: Handle Google callback
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.send("Missing code.");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Refresh Token:", tokens.refresh_token);
    res.send("Success! Refresh token logged to server logs.");
  } catch (err) {
    console.error("Error getting token:", err);
    console.error("OAuth callback error:", err);
res.status(500).send("Something went wrong. Check server logs.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
