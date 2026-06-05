export type { User, Profile, AuthTokens, LoginResponse, OtpSendRequest, OtpVerifyRequest, GoogleAuthRequest, RegisterRequest, OnboardingRequest, UpdateProfileRequest } from "./user";
export type { Subject, Chapter, Topic, Lesson, VideoProgress, SaveProgressRequest, CreateLessonRequest, UpdateLessonRequest, SubjectWithChapters, ChapterWithTopics, TopicWithLessons } from "./course";
export type { Question, QuestionOption, Test, TestSection, TestAttempt, TestResponse, StartTestRequest, SubmitTestRequest, SubmitResponseItem, CreateTestRequest, CreateTestSectionRequest, CreateQuestionRequest, TestResultSummary, SectionBreakdown, TimePerQuestion, TopicAccuracy } from "./test";
export type { Batch, Enrollment, CreateBatchRequest, EnrollBatchRequest, BatchWithSubjects } from "./batch";
export type { Payment, CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PaymentHistory, RevenueStats, MonthlyRevenue, BatchRevenue } from "./payment";
export type { Notification, NotificationPreference, UpdateNotificationPreferenceRequest, SendNotificationRequest, Announcement, CreateAnnouncementRequest } from "./notification";
export type { Doubt, DoubtReply, CreateDoubtRequest, CreateDoubtReplyRequest } from "./doubt";
export type { LiveClass, CreateLiveClassRequest, UpdateLiveClassRequest, FlashCard, FormulaSheet, CreateFlashCardRequest, CreateFormulaSheetRequest } from "./live-class";

/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** API error response */
export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/** Dashboard stats for students */
export interface DashboardStats {
  streak: number;
  subjectProgress: SubjectProgress[];
  upcomingClasses: LiveClass[];
  upcomingTests: Test[];
  recentScores: RecentScore[];
  weakTopics: WeakTopic[];
  quoteOfTheDay: string;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface RecentScore {
  testId: string;
  testTitle: string;
  score: number;
  totalMarks: number;
  date: string;
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  chapterName: string;
  accuracy: number;
  attemptCount: number;
}

/** Admin analytics */
export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalBatches: number;
  totalRevenue: number;
  dau: number[];
  videoWatchTime: number;
  testCompletionRate: number;
  topStudents: TopStudent[];
}

export interface TopStudent {
  userId: string;
  name: string;
  avatar: string | null;
  averageScore: number;
  testsCompleted: number;
}
