import Razorpay from "razorpay";
import { env } from "./env";

let razorpayInstance: Razorpay | null = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export const razorpay = razorpayInstance;
export const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID;
export const RAZORPAY_WEBHOOK_SECRET = env.RAZORPAY_WEBHOOK_SECRET;
