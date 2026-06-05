import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma known request errors
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaError = err as { code: string; meta?: { target?: string[] } };

    if (prismaError.code === "P2002") {
      const target = prismaError.meta?.target?.join(", ") ?? "field";
      res.status(409).json({
        success: false,
        message: `A record with this ${target} already exists`,
      });
      return;
    }

    if (prismaError.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }
  }

  // Default 500
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
}
