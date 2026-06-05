import { Board, StudentClass, EnrollmentStatus } from "../constants";

export interface Batch {
  id: string;
  name: string;
  description: string | null;
  class: StudentClass;
  board: Board;
  isFree: boolean;
  price: number;
  inviteCode: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  studentCount: number;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  batchId: string;
  status: EnrollmentStatus;
  paymentId: string | null;
  enrolledAt: string;
  expiresAt: string | null;
  batch?: Batch;
}

export interface CreateBatchRequest {
  name: string;
  description?: string;
  class: StudentClass;
  board: Board;
  isFree?: boolean;
  price?: number;
  startDate?: string;
  endDate?: string;
}

export interface EnrollBatchRequest {
  batchId: string;
  inviteCode?: string;
}

export interface BatchWithSubjects extends Batch {
  subjectIds: string[];
  testIds: string[];
}
