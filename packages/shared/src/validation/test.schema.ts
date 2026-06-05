import { z } from "zod";

const questionOptionSchema = z.object({
  index: z.number().int().min(0).max(3),
  text: z.string().min(1),
  imageUrl: z.string().url().optional(),
});

export const createQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  options: z
    .array(questionOptionSchema)
    .length(4, "Exactly 4 options are required"),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1, "Explanation is required"),
  topicId: z.string().uuid(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  type: z.enum(["MCQ", "INTEGER"]).default("MCQ"),
  pyqYear: z.number().int().min(1990).max(2030).optional(),
  examType: z
    .enum(["JEE_MAIN", "JEE_ADVANCED", "NEET", "ISC", "ICSE", "CBSE", "WBJEE"])
    .optional(),
  imageUrl: z.string().url().optional(),
});

export const bulkCreateQuestionsSchema = z.object({
  questions: z.array(createQuestionSchema).min(1).max(200),
});

const createTestSectionSchema = z.object({
  name: z.string().min(1).max(100),
  questionIds: z.array(z.string().uuid()).min(1),
  marksPerQuestion: z.number().min(0).default(4),
  negativeMarks: z.number().min(0).default(1),
  order: z.number().int().min(0),
});

export const createTestSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  type: z.enum(["PRACTICE", "MOCK", "CHAPTER", "PYQ"]),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  totalMarks: z.number().min(0),
  negativeMarking: z.number().min(0).default(0),
  batchId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime().optional(),
  sections: z.array(createTestSectionSchema).min(1),
});

export const submitResponseSchema = z.object({
  questionId: z.string().uuid(),
  selectedOption: z.number().int().min(0).max(3).nullable(),
  integerAnswer: z.number().int().nullable(),
  timeSpent: z.number().min(0),
  isMarkedForReview: z.boolean().default(false),
});

export const submitTestSchema = z.object({
  testId: z.string().uuid(),
  responses: z.array(submitResponseSchema).min(1),
});

export const testFilterSchema = z.object({
  type: z.enum(["PRACTICE", "MOCK", "CHAPTER", "PYQ"]).optional(),
  batchId: z.string().uuid().optional(),
  examType: z
    .enum(["JEE_MAIN", "JEE_ADVANCED", "NEET", "ISC", "ICSE", "CBSE", "WBJEE"])
    .optional(),
  pyqYear: z.number().int().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type BulkCreateQuestionsInput = z.infer<typeof bulkCreateQuestionsSchema>;
export type CreateTestInput = z.infer<typeof createTestSchema>;
export type SubmitTestInput = z.infer<typeof submitTestSchema>;
export type TestFilterInput = z.infer<typeof testFilterSchema>;
