import { z } from "zod";

export const createBatchSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  class: z.enum(["10", "11", "12"]),
  board: z.enum(["ICSE", "ISC", "CBSE", "JEE", "NEET"]),
  isFree: z.boolean().default(false),
  price: z.number().min(0).default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateBatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  isFree: z.boolean().optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const enrollBatchSchema = z.object({
  batchId: z.string().uuid(),
  inviteCode: z.string().optional(),
});

export const assignSubjectsToBatchSchema = z.object({
  subjectIds: z.array(z.string().uuid()).min(1),
});

export const createOrderSchema = z.object({
  batchId: z.string().uuid(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
export type EnrollBatchInput = z.infer<typeof enrollBatchSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
