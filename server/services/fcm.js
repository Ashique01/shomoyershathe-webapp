const admin = require("firebase-admin");

// Parse service account JSON from environment variable
const serviceAccountJson = process.env.FIREBASE_ADMIN_JSON;

if (!serviceAccountJson) {
  throw new Error("FIREBASE_ADMIN_JSON environment variable not set");
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (err) {
  console.error("Invalid FIREBASE_ADMIN_JSON JSON:", err);
  throw err;
}

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendFCMNotification = async (token, title, body) => {
  if (!token || typeof token !== "string" || token.length < 100) {
    throw new Error("Invalid FCM token");
  }
  const message = {
    token,
    notification: { title, body },
  };

  try {
    const response = await admin.messaging().send(message);
    // console.log("✅ Notification sent:", response);
    return response;
  } catch (error) {
    // console.error("❌ FCM Error:", error);
    throw error;
  }
};

module.exports = { sendFCMNotification };
