export interface User {
  id: string;
  type: 'teacher' | 'student';
  name: string;
  studentId?: string;
  password: string;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  password: string;
  createdAt: string;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: number;
  points: number;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  attachments: FileAttachment[];
  createdAt: string;
  createdBy: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64
  uploadedAt: string;
  uploadedBy: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | number;
  isCorrect?: boolean;
  points: number;
}

export interface Submission {
  id: string;
  activityId: string;
  studentId: string;
  answers: StudentAnswer[];
  attachments: FileAttachment[];
  submittedAt: string;
  totalPoints: number;
  maxPoints: number;
  grade: number;
}

export interface Draft {
  activityId: string;
  studentId: string;
  questionId: string;
  content: string;
  savedAt: string;
}