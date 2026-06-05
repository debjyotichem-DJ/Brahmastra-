export {
  loginSchema,
  registerSchema,
  otpSendSchema,
  otpVerifySchema,
  googleAuthSchema,
  refreshTokenSchema,
  onboardingSchema,
  updateProfileSchema,
  updateFcmTokenSchema,
} from "./auth.schema";

export {
  createSubjectSchema,
  createChapterSchema,
  createTopicSchema,
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  saveProgressSchema,
} from "./course.schema";

export {
  createQuestionSchema,
  bulkCreateQuestionsSchema,
  createTestSchema,
  submitTestSchema,
  testFilterSchema,
} from "./test.schema";

export {
  createBatchSchema,
  updateBatchSchema,
  enrollBatchSchema,
  assignSubjectsToBatchSchema,
} from "./batch.schema";

export {
  createOrderSchema,
  verifyPaymentSchema,
  razorpayWebhookSchema,
} from "./payment.schema";

export {
  createDoubtSchema,
  createDoubtReplySchema,
  updateDoubtStatusSchema,
  createLiveClassSchema,
  updateLiveClassSchema,
  updateNotificationPreferenceSchema,
  createAnnouncementSchema,
  createFlashCardSchema,
  createFormulaSheetSchema,
  paginationSchema,
  idParamSchema,
} from "./doubt.schema";

// Re-export all input types
export type { LoginInput, RegisterInput, OtpSendInput, OtpVerifyInput, GoogleAuthInput, RefreshTokenInput, OnboardingInput, UpdateProfileInput } from "./auth.schema";
export type { CreateSubjectInput, CreateChapterInput, CreateTopicInput, CreateLessonInput, UpdateLessonInput, ReorderLessonsInput, SaveProgressInput } from "./course.schema";
export type { CreateQuestionInput, BulkCreateQuestionsInput, CreateTestInput, SubmitTestInput, TestFilterInput } from "./test.schema";
export type { CreateBatchInput, UpdateBatchInput, EnrollBatchInput, CreateOrderInput as EnrollOrderInput } from "./batch.schema";
export type { CreatePaymentOrderInput, VerifyPaymentInput, RazorpayWebhookInput } from "./payment.schema";
export type { CreateDoubtInput, CreateDoubtReplyInput, CreateLiveClassInput, UpdateLiveClassInput, UpdateNotificationPreferenceInput, CreateAnnouncementInput, CreateFlashCardInput, CreateFormulaSheetInput, PaginationInput } from "./doubt.schema";
