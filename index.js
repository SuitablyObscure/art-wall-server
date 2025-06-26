const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.send("Missing code.");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("✅ Refresh Token:", tokens.refresh_token);
    res.send("Success! Check your Render logs for the refresh token.");
  } catch (err) {
    console.error("❌ Error getting token:", err);
    res.send("Something went wrong.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
