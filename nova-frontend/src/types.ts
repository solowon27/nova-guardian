export type Child = {
  id: string;
  name: string;
  age: number;
};

export type Question = {
  type: 'EXPLAIN' | 'SHORT_ANSWER' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  prompt: string;
  options?: string[];
  answer?: string;
};

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AssignmentStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'EVALUATED';

export type AnswerEvaluation = {
  questionIndex: number;
  isCorrect: boolean;
  feedback?: string;
};

export type AssignmentResponse = {
  questionIndex: number;
  answer: string;
};

export type Assignment = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  status: AssignmentStatus;
  createdAt: string;
  questions: Question[];
  evaluation?: AnswerEvaluation[];
  feedback?: string;
  score?: number;
  responses: AssignmentResponse[];
};
