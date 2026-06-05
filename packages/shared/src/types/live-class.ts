export interface LiveClass {
  id: string;
  title: string;
  description: string | null;
  batchId: string;
  scheduledAt: string;
  duration: number;
  meetLink: string | null;
  agoraChannelName: string | null;
  recordingLessonId: string | null;
  isActive: boolean;
  createdAt: string;
  batch?: {
    id: string;
    name: string;
  };
}

export interface CreateLiveClassRequest {
  title: string;
  description?: string;
  batchId: string;
  scheduledAt: string;
  duration: number;
  meetLink?: string;
}

export interface UpdateLiveClassRequest {
  title?: string;
  description?: string;
  scheduledAt?: string;
  duration?: number;
  meetLink?: string;
  recordingLessonId?: string;
}

export interface FlashCard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  category: string;
  imageUrl: string | null;
  order: number;
}

export interface FormulaSheet {
  id: string;
  chapterId: string;
  title: string;
  pdfUrl: string | null;
  htmlContent: string | null;
  order: number;
}

export interface CreateFlashCardRequest {
  topicId: string;
  front: string;
  back: string;
  category: string;
  imageUrl?: string;
}

export interface CreateFormulaSheetRequest {
  chapterId: string;
  title: string;
  pdfUrl?: string;
  htmlContent?: string;
}
