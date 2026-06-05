import { LessonType } from "../constants";

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  chapterCount: number;
  createdAt: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  description: string | null;
  order: number;
  topicCount: number;
  lessonCount: number;
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  description: string | null;
  order: number;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  topicId: string;
  type: LessonType;
  title: string;
  description: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  isFree: boolean;
  order: number;
  createdAt: string;
}

export interface VideoProgress {
  id: string;
  userId: string;
  lessonId: string;
  position: number;
  duration: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface SaveProgressRequest {
  position: number;
  duration: number;
  completed?: boolean;
}

export interface CreateLessonRequest {
  topicId: string;
  type: LessonType;
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  content?: string;
  thumbnailUrl?: string;
  duration?: number;
  isFree?: boolean;
  order?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  content?: string;
  thumbnailUrl?: string;
  duration?: number;
  isFree?: boolean;
  order?: number;
}

export interface SubjectWithChapters extends Subject {
  chapters: Chapter[];
}

export interface ChapterWithTopics extends Chapter {
  topics: TopicWithLessons[];
}

export interface TopicWithLessons extends Topic {
  lessons: Lesson[];
}
