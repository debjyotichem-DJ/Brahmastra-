import { z } from "zod";

export const createOrderSchema = z.object({
  batchId: z.string().uuid(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const razorpayWebhookSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        order_id: z.string(),
        amount: z.number(),
        currency: z.string(),
        status: z.string(),
        method: z.string().optional(),
      }),
    }),
  }),
});

export type CreatePaymentOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RazorpayWebhookInput = z.infer<typeof razorpayWebhookSchema>;
