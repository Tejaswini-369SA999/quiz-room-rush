
import { QuizQuestion, Room, Participant, QuestionResponse } from "@/types/quiz";

// Generate a random room ID (6 characters)
export const generateRoomId = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitting similar looking characters
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate a unique user ID
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Parse CSV or JSON questions
export const parseQuestions = (data: string): QuizQuestion[] => {
  try {
    // Try parsing as JSON first
    const jsonData = JSON.parse(data);
    if (Array.isArray(jsonData)) {
      return validateAndFormatQuestions(jsonData);
    }
  } catch (e) {
    // If JSON parsing fails, try CSV
    return parseCSVQuestions(data);
  }
  return [];
};

// Parse CSV format questions
export const parseCSVQuestions = (csvData: string): QuizQuestion[] => {
  // Split by lines
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) return [];
  
  const questions: QuizQuestion[] = [];
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Split by comma, but respect quoted values
    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    
    if (parts.length >= 6) { // question, 4 options, correct answer index, difficulty
      const question: QuizQuestion = {
        id: `q_${Date.now()}_${i}`,
        text: parts[0].replace(/^"|"$/g, ''),
        options: parts.slice(1, 5).map(part => part.replace(/^"|"$/g, '')),
        correctOption: parseInt(parts[5].replace(/^"|"$/g, ''), 10),
        difficulty: parts[6]?.toLowerCase() === 'medium' ? 'medium' : 'basic'
      };
      
      if (!isNaN(question.correctOption) && question.correctOption >= 0 && question.correctOption <= 3) {
        questions.push(question);
      }
    }
  }
  
  return questions;
};

// Validate and format JSON questions
export const validateAndFormatQuestions = (jsonData: any[]): QuizQuestion[] => {
  return jsonData
    .filter(item => 
      item.text && 
      Array.isArray(item.options) && 
      item.options.length === 4 && 
      typeof item.correctOption === 'number' &&
      item.correctOption >= 0 && 
      item.correctOption <= 3
    )
    .map((item, index) => ({
      id: item.id || `q_${Date.now()}_${index}`,
      text: item.text,
      options: item.options,
      correctOption: item.correctOption,
      difficulty: item.difficulty === 'medium' ? 'medium' : 'basic'
    }));
};

// Calculate score based on answer and time
export const calculateScore = (
  correct: boolean, 
  timeToAnswer: number | null
): number => {
  if (!correct || timeToAnswer === null) return 0;
  
  const baseScore = 10; // Base score for correct answer
  const maxTimeBonus = 5; // Maximum time bonus points
  const maxTimeAllowed = 12000; // 12 seconds in ms
  
  // Calculate time bonus (faster answers get more points)
  const timeRatio = 1 - (timeToAnswer / maxTimeAllowed);
  const timeBonus = Math.round(timeRatio * maxTimeBonus);
  
  return baseScore + timeBonus;
};

// Evaluate participant's answer
export const evaluateAnswer = (
  question: QuizQuestion,
  response: QuestionResponse
): { correct: boolean; score: number } => {
  const correct = question.correctOption === response.selectedOption;
  const score = calculateScore(correct, response.timeToAnswer);
  
  return { correct, score };
};

// Get example questions for testing
export const getExampleQuestions = (): QuizQuestion[] => {
  return [
    {
      id: "q1",
      text: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctOption: 2,
      difficulty: "basic"
    },
    {
      id: "q2",
      text: "Which planet is known as the Red Planet?",
      options: ["Jupiter", "Mars", "Venus", "Saturn"],
      correctOption: 1,
      difficulty: "basic"
    },
    {
      id: "q3",
      text: "What is the chemical symbol for gold?",
      options: ["Au", "Ag", "Fe", "Cu"],
      correctOption: 0,
      difficulty: "medium"
    }
  ];
};

// Create a new room
export const createRoom = (hostId: string, questions?: QuizQuestion[]): Room => {
  return {
    id: generateRoomId(),
    host: hostId,
    status: "waiting",
    currentQuestion: -1,
    questions: questions || getExampleQuestions(),
    participants: [],
    created: Date.now()
  };
};

// Check if all participants have answered
export const allParticipantsAnswered = (room: Room, questionIndex: number): boolean => {
  if (room.participants.length === 0) return false;
  
  const questionId = room.questions[questionIndex]?.id;
  if (!questionId) return false;
  
  return room.participants.every(participant => {
    return participant.answers.some(a => a.questionId === questionId);
  });
};

// Get current rankings based on scores
export const getRankings = (participants: Participant[]): Participant[] => {
  return [...participants].sort((a, b) => b.score - a.score);
};

// Store room in localStorage (temporary until we add proper database)
export const storeRoom = (room: Room): void => {
  localStorage.setItem(`room_${room.id}`, JSON.stringify(room));
};

// Get room from localStorage
export const getRoom = (roomId: string): Room | null => {
  const roomData = localStorage.getItem(`room_${roomId}`);
  return roomData ? JSON.parse(roomData) : null;
};
