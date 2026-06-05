import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authenticate } from "../../middleware/auth";
import { roleGuard } from "../../middleware/role-guard";
import { uploadLimiter } from "../../middleware/rate-limiter";
import { Role } from "@d-chemistry/shared";
import { s3Client, S3_BUCKET, CLOUDFRONT_DOMAIN } from "../../config/s3";
import { cloudinary } from "../../config/cloudinary";
import { sendSuccess, sendError } from "../../utils/response";
import crypto from "crypto";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const router = Router();

// POST /upload/presigned-url — get presigned URL for S3 video upload
router.post(
  "/presigned-url",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename, contentType } = req.body;
      if (!filename || !contentType) {
        sendError(res, "filename and contentType are required", 400);
        return;
      }

      const key = `videos/${Date.now()}_${crypto.randomBytes(8).toString("hex")}/${filename}`;

      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: contentType,
      });

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      const cdnUrl = CLOUDFRONT_DOMAIN
        ? `https://${CLOUDFRONT_DOMAIN}/${key}`
        : `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;

      sendSuccess(res, { presignedUrl, key, cdnUrl });
    } catch (error) {
      next(error);
    }
  }
);

// POST /upload/pdf — upload PDF to Cloudinary
router.post(
  "/pdf",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  uploadLimiter,
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        sendError(res, "No file uploaded", 400);
        return;
      }

      const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "d-chemistry/pdfs",
            format: "pdf",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string; public_id: string });
          }
        );
        stream.end(req.file!.buffer);
      });

      sendSuccess(res, {
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /upload/image — upload image to Cloudinary
router.post(
  "/image",
  authenticate,
  uploadLimiter,
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        sendError(res, "No file uploaded", 400);
        return;
      }

      const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "d-chemistry/images",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string; public_id: string });
          }
        );
        stream.end(req.file!.buffer);
      });

      sendSuccess(res, {
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as uploadRoutes };
