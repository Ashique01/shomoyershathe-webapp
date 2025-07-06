// firebase-messaging.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };

export const requestPermissionAndGetToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // Replace with your actual VAPID key from Firebase Console
      });
      console.log("FCM Token:", token);
      return token || null;
    } else {
      console.warn("Notification permission denied");
      return null;
    }
  } catch (err) {
    console.error("Error getting FCM token", err);
    return null;
  }
};

// Return the unsubscribe function from onMessage for cleanup
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  return onMessage(messaging, (payload: MessagePayload) => {
    callback(payload);
  });
};
