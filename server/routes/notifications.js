// ✅ CommonJS style
const express = require("express");
const { sendFCMNotification } = require("../services/fcm");

const router = express.Router();

router.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Missing token, title, or body" });
  }

  try {
    const response = await sendFCMNotification(token, title, body);
    res.status(200).json({ success: true, response });
  } catch (err) {
    res.status(500).json({ error: "Failed to send notification", details: err });
  }
});

module.exports = router;
