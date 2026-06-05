import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createOrderSchema, verifyPaymentSchema } from "@d-chemistry/shared";
import { razorpay, RAZORPAY_KEY_ID, RAZORPAY_WEBHOOK_SECRET } from "../../config/razorpay";
import { sendSuccess, sendError, sendNotFound } from "../../utils/response";

const router = Router();

// POST /payments/create-order — create Razorpay order
router.post(
  "/create-order",
  authenticate,
  validate(createOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!razorpay) {
        sendError(res, "Payment gateway not configured", 503);
        return;
      }

      const { batchId } = req.body;

      const batch = await prisma.batch.findUnique({ where: { id: batchId } });
      if (!batch) {
        sendNotFound(res, "Batch");
        return;
      }

      if (batch.isFree) {
        sendError(res, "This batch is free. No payment required.", 400);
        return;
      }

      // Check already enrolled
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_batchId: { userId: req.user!.id, batchId },
        },
      });

      if (existing) {
        sendError(res, "Already enrolled in this batch", 409);
        return;
      }

      const receipt = `dchem_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

      const order = await razorpay.orders.create({
        amount: Math.round(batch.price * 100), // Razorpay uses paise
        currency: "INR",
        receipt,
        notes: {
          userId: req.user!.id,
          batchId,
          batchName: batch.name,
        },
      });

      // Save payment record
      await prisma.payment.create({
        data: {
          userId: req.user!.id,
          batchId,
          amount: batch.price,
          razorpayOrderId: order.id,
          receipt,
          status: "PENDING",
        },
      });

      sendSuccess(res, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID,
        batchName: batch.name,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /payments/verify — verify payment and enroll
router.post(
  "/verify",
  authenticate,
  validate(verifyPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      // Verify signature
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET ?? "")
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        sendError(res, "Invalid payment signature", 400);
        return;
      }

      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
      });

      if (!payment) {
        sendNotFound(res, "Payment");
        return;
      }

      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: "SUCCESS",
        },
      });

      // Auto-enroll
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: payment.userId,
          batchId: payment.batchId,
          status: "ACTIVE",
          paymentId: payment.id,
        },
      });

      sendSuccess(res, { payment, enrollment }, "Payment verified and enrolled successfully");
    } catch (error) {
      next(error);
    }
  }
);

// POST /payments/webhook — Razorpay webhook handler
router.post("/webhook", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET ?? "")
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      sendError(res, "Invalid webhook signature", 400);
      return;
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (event === "payment.captured" && paymentEntity) {
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: paymentEntity.order_id },
      });

      if (payment && payment.status !== "SUCCESS") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: paymentEntity.id,
            status: "SUCCESS",
          },
        });

        // Auto-enroll if not already
        await prisma.enrollment.upsert({
          where: {
            userId_batchId: {
              userId: payment.userId,
              batchId: payment.batchId,
            },
          },
          update: { status: "ACTIVE" },
          create: {
            userId: payment.userId,
            batchId: payment.batchId,
            status: "ACTIVE",
            paymentId: payment.id,
          },
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /payments/history — get user's payment history
router.get("/history", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.id },
      include: { batch: { select: { name: true, class: true, board: true } } },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, payments);
  } catch (error) {
    next(error);
  }
});

export { router as paymentRoutes };
