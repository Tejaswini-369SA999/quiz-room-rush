
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, Participant, QuestionResponse } from '@/types/quiz';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  room: Room | null;
  participant: Participant | null;
  isHost: boolean;
  joinRoom: (roomId: string, name: string) => void;
  createRoom: (name: string) => void;
  startQuiz: () => void;
  submitAnswer: (response: Omit<QuestionResponse, 'participantId'>) => void;
  nextQuestion: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  
  // For development, we will simulate socket events with local storage
  // In a real implementation, this would connect to a socket.io server
  useEffect(() => {
    // Simulate connection with slight delay
    const timer = setTimeout(() => {
      console.log('Socket connected (simulated)');
      setIsConnected(true);
      
      // Check if we have stored participant data
      const storedParticipant = localStorage.getItem('quiz_participant');
      if (storedParticipant) {
        setParticipant(JSON.parse(storedParticipant));
      }
      
      // Check if we have stored room data
      const storedRoomId = localStorage.getItem('quiz_current_room');
      if (storedRoomId) {
        const roomData = localStorage.getItem(`room_${storedRoomId}`);
        if (roomData) {
          setRoom(JSON.parse(roomData));
        }
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      setIsConnected(false);
    };
  }, []);
  
  const isHost = Boolean(room && participant && room.host === participant.id);
  
  // Create a new room
  const createRoom = (name: string) => {
    import('@/utils/quiz-utils').then(({ generateUserId, createRoom, storeRoom }) => {
      // Create participant
      const userId = generateUserId();
      const newParticipant: Participant = {
        id: userId,
        name,
        score: 0,
        answers: []
      };
      
      // Create room
      const newRoom = createRoom(userId);
      newRoom.participants.push(newParticipant);
      
      // Update state
      setParticipant(newParticipant);
      setRoom(newRoom);
      
      // Store in localStorage (simulating persistence)
      localStorage.setItem('quiz_participant', JSON.stringify(newParticipant));
      localStorage.setItem('quiz_current_room', newRoom.id);
      storeRoom(newRoom);
      
      // In real app, would emit socket event here
    });
  };
  
  // Join an existing room
  const joinRoom = (roomId: string, name: string) => {
    import('@/utils/quiz-utils').then(({ generateUserId, getRoom, storeRoom }) => {
      // Get room data
      const roomData = getRoom(roomId);
      
      if (!roomData) {
        console.error('Room not found');
        return;
      }
      
      // Create participant
      const userId = generateUserId();
      const newParticipant: Participant = {
        id: userId,
        name,
        score: 0,
        answers: []
      };
      
      // Add participant to room
      roomData.participants.push(newParticipant);
      
      // Update state
      setParticipant(newParticipant);
      setRoom(roomData);
      
      // Store in localStorage
      localStorage.setItem('quiz_participant', JSON.stringify(newParticipant));
      localStorage.setItem('quiz_current_room', roomId);
      storeRoom(roomData);
      
      // In real app, would emit join room event
    });
  };
  
  // Start the quiz
  const startQuiz = () => {
    if (!room || !isHost) return;
    
    const updatedRoom = {
      ...room,
      status: "active" as const,
      currentQuestion: 0
    };
    
    // Update state
    setRoom(updatedRoom);
    
    // Store updated room
    localStorage.setItem(`room_${updatedRoom.id}`, JSON.stringify(updatedRoom));
    
    // In real app, would emit start quiz event
  };
  
  // Submit an answer to a question
  const submitAnswer = (response: Omit<QuestionResponse, 'participantId'>) => {
    if (!room || !participant) return;
    
    import('@/utils/quiz-utils').then(({ evaluateAnswer, storeRoom }) => {
      const currentQuestion = room.questions[room.currentQuestion];
      
      if (!currentQuestion) return;
      
      const fullResponse: QuestionResponse = {
        ...response,
        participantId: participant.id
      };
      
      // Evaluate answer
      const { correct, score } = evaluateAnswer(currentQuestion, fullResponse);
      
      // Update participant
      const updatedParticipant = {
        ...participant,
        score: participant.score + score,
        answers: [
          ...participant.answers,
          {
            questionId: response.questionId,
            selectedOption: response.selectedOption,
            correct,
            timeToAnswer: response.timeToAnswer
          }
        ]
      };
      
      // Update room's participants list
      const updatedRoom = {
        ...room,
        participants: room.participants.map(p => 
          p.id === participant.id ? updatedParticipant : p
        )
      };
      
      // Update state
      setParticipant(updatedParticipant);
      setRoom(updatedRoom);
      
      // Store updates
      localStorage.setItem('quiz_participant', JSON.stringify(updatedParticipant));
      storeRoom(updatedRoom);
      
      // In real app, would emit answer event
    });
  };
  
  // Move to next question
  const nextQuestion = () => {
    if (!room || !isHost) return;
    
    const nextQuestionIndex = room.currentQuestion + 1;
    
    if (nextQuestionIndex >= room.questions.length) {
      // Quiz is finished
      const updatedRoom = {
        ...room,
        status: "finished" as const
      };
      
      // Update state
      setRoom(updatedRoom);
      
      // Store updated room
      localStorage.setItem(`room_${updatedRoom.id}`, JSON.stringify(updatedRoom));
      
      return;
    }
    
    const updatedRoom = {
      ...room,
      currentQuestion: nextQuestionIndex
    };
    
    // Update state
    setRoom(updatedRoom);
    
    // Store updated room
    localStorage.setItem(`room_${updatedRoom.id}`, JSON.stringify(updatedRoom));
    
    // In real app, would emit next question event
  };
  
  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        room,
        participant,
        isHost,
        joinRoom,
        createRoom,
        startQuiz,
        submitAnswer,
        nextQuestion
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
