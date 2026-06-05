import { z } from "zod";

export const createDoubtSchema = z.object({
  text: z.string().min(1, "Doubt text is required").max(5000),
  lessonId: z.string().uuid().optional(),
  questionId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
});

export const createDoubtReplySchema = z.object({
  text: z.string().min(1, "Reply text is required").max(5000),
  imageUrl: z.string().url().optional(),
});

export const updateDoubtStatusSchema = z.object({
  status: z.enum(["OPEN", "ANSWERED", "CLOSED"]),
});

export const createLiveClassSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  batchId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  meetLink: z.string().url().optional(),
});

export const updateLiveClassSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(2000).optional(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().min(1).optional(),
  meetLink: z.string().url().optional(),
  recordingLessonId: z.string().uuid().optional(),
});

export const updateNotificationPreferenceSchema = z.object({
  classReminder: z.boolean().optional(),
  testResult: z.boolean().optional(),
  newContent: z.boolean().optional(),
  paymentConfirm: z.boolean().optional(),
  doubtReply: z.boolean().optional(),
  announcement: z.boolean().optional(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(5000),
  batchId: z.string().uuid().optional(),
});

export const createFlashCardSchema = z.object({
  topicId: z.string().uuid(),
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(2000),
  category: z.enum(["NAME_REACTION", "PERIODIC_TREND", "FORMULA", "CONCEPT"]),
  imageUrl: z.string().url().optional(),
});

export const createFormulaSheetSchema = z.object({
  chapterId: z.string().uuid(),
  title: z.string().min(1).max(300),
  pdfUrl: z.string().url().optional(),
  htmlContent: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export type CreateDoubtInput = z.infer<typeof createDoubtSchema>;
export type CreateDoubtReplyInput = z.infer<typeof createDoubtReplySchema>;
export type CreateLiveClassInput = z.infer<typeof createLiveClassSchema>;
export type UpdateLiveClassInput = z.infer<typeof updateLiveClassSchema>;
export type UpdateNotificationPreferenceInput = z.infer<typeof updateNotificationPreferenceSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type CreateFlashCardInput = z.infer<typeof createFlashCardSchema>;
export type CreateFormulaSheetInput = z.infer<typeof createFormulaSheetSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
