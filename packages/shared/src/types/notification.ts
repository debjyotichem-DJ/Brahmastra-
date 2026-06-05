import { NotificationType } from "../constants";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  data: Record<string, string> | null;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  classReminder: boolean;
  testResult: boolean;
  newContent: boolean;
  paymentConfirm: boolean;
  doubtReply: boolean;
  announcement: boolean;
}

export interface UpdateNotificationPreferenceRequest {
  classReminder?: boolean;
  testResult?: boolean;
  newContent?: boolean;
  paymentConfirm?: boolean;
  doubtReply?: boolean;
  announcement?: boolean;
}

export interface SendNotificationRequest {
  userId?: string;
  batchId?: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  batchId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  batchId?: string;
}
