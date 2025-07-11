import { User, Student, Activity, Submission, Draft } from './types';

const STORAGE_KEYS = {
  USERS: 'teacher_system_users',
  STUDENTS: 'teacher_system_students',
  ACTIVITIES: 'teacher_system_activities',
  SUBMISSIONS: 'teacher_system_submissions',
  DRAFTS: 'teacher_system_drafts',
  CURRENT_USER: 'teacher_system_current_user'
};

// Initialize default teacher account
const initializeDefaultData = () => {
  const users = getUsers();
  if (users.length === 0) {
    const defaultTeacher: User = {
      id: 'teacher_001',
      type: 'teacher',
      name: 'Professor',
      password: 'admin123'
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultTeacher]));
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return data ? JSON.parse(data) : [];
};

export const saveStudent = (student: Student): void => {
  const students = getStudents();
  const existingIndex = students.findIndex(s => s.id === student.id);
  
  if (existingIndex >= 0) {
    students[existingIndex] = student;
  } else {
    students.push(student);
  }
  
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const getActivities = (): Activity[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  return data ? JSON.parse(data) : [];
};

export const saveActivity = (activity: Activity): void => {
  const activities = getActivities();
  const existingIndex = activities.findIndex(a => a.id === activity.id);
  
  if (existingIndex >= 0) {
    activities[existingIndex] = activity;
  } else {
    activities.push(activity);
  }
  
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
};

export const getSubmissions = (): Submission[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  return data ? JSON.parse(data) : [];
};

export const saveSubmission = (submission: Submission): void => {
  const submissions = getSubmissions();
  const existingIndex = submissions.findIndex(s => s.id === submission.id);
  
  if (existingIndex >= 0) {
    submissions[existingIndex] = submission;
  } else {
    submissions.push(submission);
  }
  
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
};

export const getDrafts = (): Draft[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DRAFTS);
  return data ? JSON.parse(data) : [];
};

export const saveDraft = (draft: Draft): void => {
  const drafts = getDrafts();
  const existingIndex = drafts.findIndex(d => 
    d.activityId === draft.activityId && 
    d.studentId === draft.studentId && 
    d.questionId === draft.questionId
  );
  
  if (existingIndex >= 0) {
    drafts[existingIndex] = draft;
  } else {
    drafts.push(draft);
  }
  
  localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const generateStudentId = (): string => {
  const students = getStudents();
  let id: string;
  
  do {
    id = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  } while (students.some(s => s.studentId === id));
  
  return id;
};

// Initialize default data on import
initializeDefaultData();