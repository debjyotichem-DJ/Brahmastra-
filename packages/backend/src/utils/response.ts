import { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string
): void {
  res.status(200).json({
    success: true,
    data,
    pagination,
    message,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: Array<{ field: string; message: string }>
): void {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

export function sendNotFound(res: Response, resource = "Resource"): void {
  res.status(404).json({
    success: false,
    message: `${resource} not found`,
  });
}
