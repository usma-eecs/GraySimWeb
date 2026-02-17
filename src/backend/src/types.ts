export type CpuPolicy = "FIFO" | "SJF" | "STCF" | "RR" | "MLFQ";
export type PagePolicy = "FIFO" | "LRU" | "OPT" | "CLOCK";

export interface CpuProcess {
  id: string;
  arrival: number;
  burst: number;
}

export interface CpuProblem {
  id: string;
  processes: CpuProcess[];
  quantum: number;
  createdAt: number;
  horizon?: number;
}

export interface CpuPolicyResult {
  timeline: string[];
  matrix: string[][];
  description: string;
}

export interface CpuFeedbackResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
}

export interface PageProblem {
  id: string;
  referenceString: number[];
  frameCount: number;
  createdAt: number;
}

export interface PagePolicyResult {
  memory: string[][];
  description: string;
}

export interface PageFeedbackResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
}
