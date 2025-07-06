// services/fcm.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = path.join(__dirname, "../config/firebase-service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendFCMNotification = async (token, title, body) => {
  // 🔐 Token validation here
  if (!token || typeof token !== "string" || token.length < 100) {
    throw new Error("Invalid FCM token");
  }
  const message = {
    token,
    notification: {
      title,
      body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);
    return response;
  } catch (error) {
    console.error("❌ FCM Error:", error);
    throw error;
  }
};

module.exports = { sendFCMNotification };
