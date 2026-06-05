import admin from "firebase-admin";
import { env } from "./env";

let firebaseApp: admin.app.App | null = null;

if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const messaging = firebaseApp ? admin.messaging() : null;

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  if (!messaging) {
    console.warn("Firebase messaging not configured. Skipping push notification.");
    return false;
  }

  try {
    await messaging.send({
      token: fcmToken,
      notification: { title, body },
      data: data ?? {},
      android: {
        priority: "high",
        notification: {
          channelId: "d-chemistry-notifications",
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: { sound: "default", badge: 1 },
        },
      },
    });
    return true;
  } catch (error) {
    console.error("FCM push error:", error);
    return false;
  }
}

export async function sendPushToMultiple(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<number> {
  if (!messaging || fcmTokens.length === 0) return 0;

  try {
    const response = await messaging.sendEachForMulticast({
      tokens: fcmTokens,
      notification: { title, body },
      data: data ?? {},
    });
    return response.successCount;
  } catch (error) {
    console.error("FCM multicast error:", error);
    return 0;
  }
}
