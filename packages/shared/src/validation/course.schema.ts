import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(1000).optional(),
  icon: z.string().url().optional(),
  order: z.number().int().min(0).default(0),
});

export const createChapterSchema = z.object({
  subjectId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0).default(0),
});

export const createTopicSchema = z.object({
  chapterId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0).default(0),
});

export const createLessonSchema = z.object({
  topicId: z.string().uuid(),
  type: z.enum(["VIDEO", "PDF", "ARTICLE", "DPP"]),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  videoUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  content: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  isFree: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(2000).optional(),
  videoUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  content: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  isFree: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderLessonsSchema = z.object({
  lessonOrders: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(0),
    })
  ),
});

export const saveProgressSchema = z.object({
  position: z.number().min(0),
  duration: z.number().min(0),
  completed: z.boolean().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema>;
export type SaveProgressInput = z.infer<typeof saveProgressSchema>;
