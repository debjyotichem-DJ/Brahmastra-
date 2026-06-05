import { DoubtStatus } from "../constants";

export interface Doubt {
  id: string;
  userId: string;
  lessonId: string | null;
  questionId: string | null;
  text: string;
  imageUrl: string | null;
  status: DoubtStatus;
  createdAt: string;
  updatedAt: string;
  replies: DoubtReply[];
  user?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface DoubtReply {
  id: string;
  doubtId: string;
  userId: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
}

export interface CreateDoubtRequest {
  text: string;
  lessonId?: string;
  questionId?: string;
  imageUrl?: string;
}

export interface CreateDoubtReplyRequest {
  text: string;
  imageUrl?: string;
}
