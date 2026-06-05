import { PaymentStatus } from "../constants";

export interface Payment {
  id: string;
  userId: string;
  batchId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  status: PaymentStatus;
  receipt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  batchId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  batchName: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentHistory {
  payments: Payment[];
  total: number;
}

export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: MonthlyRevenue[];
  batchRevenue: BatchRevenue[];
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
  count: number;
}

export interface BatchRevenue {
  batchId: string;
  batchName: string;
  amount: number;
  studentCount: number;
}
