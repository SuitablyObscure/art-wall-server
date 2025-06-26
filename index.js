const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Step 1: Route to start OAuth flow
app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", // required to get refresh token
    scope: ["https://www.googleapis.com/auth/drive.readonly"],
    prompt: "consent", // forces asking again to ensure refresh token is returned
  });
  res.redirect(url);
});

// Step 2: OAuth callback route
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.send("Missing code.");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token); // ⬅️ You'll need this
    res.send("✅ Success! Refresh token logged to server logs.");
  } catch (err) {
    console.error("❌ Error getting token:", err.response?.data || err.message);
    res.send("Something went wrong.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
