
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOption: number; // Index of the correct option (0-3)
  difficulty: "basic" | "medium";
}

export interface Room {
  id: string;
  host: string; // ID of host user
  status: "waiting" | "active" | "finished";
  currentQuestion: number;
  questions: QuizQuestion[];
  participants: Participant[];
  created: number; // Timestamp
}

export interface Participant {
  id: string;
  name: string;
  score: number;
  answers: {
    questionId: string;
    selectedOption: number | null;
    correct: boolean;
    timeToAnswer: number | null; // null if no answer
  }[];
}

export interface QuestionResponse {
  questionId: string;
  participantId: string;
  selectedOption: number;
  timeToAnswer: number; // Time in ms from question display to answer selection
}

export interface QuizResults {
  roomId: string;
  participants: Participant[];
  questions: QuizQuestion[];
  questionStats: {
    questionId: string;
    correctCount: number;
    totalAnswers: number;
    avgTimeToAnswer: number;
  }[];
  finished: number; // Timestamp
}
