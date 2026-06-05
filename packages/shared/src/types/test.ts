import {
  ExamType,
  Difficulty,
  TestType,
  QuestionType,
} from "../constants";

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctIndex: number;
  explanation: string;
  topicId: string;
  difficulty: Difficulty;
  type: QuestionType;
  pyqYear: number | null;
  examType: ExamType | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface QuestionOption {
  index: number;
  text: string;
  imageUrl?: string;
}

export interface Test {
  id: string;
  title: string;
  description: string | null;
  type: TestType;
  duration: number;
  totalMarks: number;
  negativeMarking: number;
  batchId: string | null;
  isPublished: boolean;
  scheduledAt: string | null;
  sections: TestSection[];
  createdAt: string;
}

export interface TestSection {
  id: string;
  testId: string;
  name: string;
  questionIds: string[];
  marksPerQuestion: number;
  negativeMarks: number;
  order: number;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  percentile: number | null;
  rank: number | null;
  startedAt: string;
  submittedAt: string | null;
  timeTaken: number | null;
  responses: TestResponse[];
}

export interface TestResponse {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOption: number | null;
  integerAnswer: number | null;
  isCorrect: boolean;
  isMarkedForReview: boolean;
  timeSpent: number;
}

export interface StartTestRequest {
  testId: string;
}

export interface SubmitTestRequest {
  testId: string;
  responses: SubmitResponseItem[];
}

export interface SubmitResponseItem {
  questionId: string;
  selectedOption: number | null;
  integerAnswer: number | null;
  timeSpent: number;
  isMarkedForReview: boolean;
}

export interface CreateTestRequest {
  title: string;
  description?: string;
  type: TestType;
  duration: number;
  totalMarks: number;
  negativeMarking?: number;
  batchId?: string;
  scheduledAt?: string;
  sections: CreateTestSectionRequest[];
}

export interface CreateTestSectionRequest {
  name: string;
  questionIds: string[];
  marksPerQuestion: number;
  negativeMarks?: number;
  order: number;
}

export interface CreateQuestionRequest {
  text: string;
  options: QuestionOption[];
  correctIndex: number;
  explanation: string;
  topicId: string;
  difficulty: Difficulty;
  type?: QuestionType;
  pyqYear?: number;
  examType?: ExamType;
  imageUrl?: string;
}

export interface TestResultSummary {
  attempt: TestAttempt;
  test: Test;
  sectionBreakdown: SectionBreakdown[];
  timePerQuestion: TimePerQuestion[];
  topicAccuracy: TopicAccuracy[];
}

export interface SectionBreakdown {
  sectionName: string;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  maxScore: number;
}

export interface TimePerQuestion {
  questionId: string;
  timeSpent: number;
  isCorrect: boolean;
}

export interface TopicAccuracy {
  topicId: string;
  topicName: string;
  correct: number;
  total: number;
  accuracy: number;
}
