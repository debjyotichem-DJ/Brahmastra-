export enum LessonType {
  VIDEO = "VIDEO",
  PDF = "PDF",
  ARTICLE = "ARTICLE",
  DPP = "DPP",
}

export enum DoubtStatus {
  OPEN = "OPEN",
  ANSWERED = "ANSWERED",
  CLOSED = "CLOSED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export enum NotificationType {
  CLASS_REMINDER = "CLASS_REMINDER",
  TEST_RESULT = "TEST_RESULT",
  NEW_CONTENT = "NEW_CONTENT",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  DOUBT_REPLY = "DOUBT_REPLY",
  ANNOUNCEMENT = "ANNOUNCEMENT",
}

export enum FlashCardCategory {
  NAME_REACTION = "NAME_REACTION",
  PERIODIC_TREND = "PERIODIC_TREND",
  FORMULA = "FORMULA",
  CONCEPT = "CONCEPT",
}
