
import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { QuizQuestion as QuizQuestionType } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { QuizTimer } from '@/components/QuizTimer';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer?: (optionIndex: number, timeToAnswer: number) => void;
  showResults?: boolean;
  className?: string;
}

export function QuizQuestion({ question, onAnswer, showResults = false, className }: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  
  const { participant } = useSocket();
  
  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setStartTime(Date.now());
    setIsTimerRunning(true);
    
    // Check if participant already answered this question
    if (participant) {
      const existingAnswer = participant.answers.find(a => a.questionId === question.id);
      if (existingAnswer?.selectedOption !== undefined && existingAnswer.selectedOption !== null) {
        setSelectedOption(existingAnswer.selectedOption);
        setIsTimerRunning(false);
      }
    }
  }, [question, participant]);
  
  const handleOptionClick = (optionIndex: number) => {
    if (selectedOption !== null || showResults) return;
    
    setSelectedOption(optionIndex);
    setIsTimerRunning(false);
    
    const timeToAnswer = Date.now() - startTime;
    onAnswer?.(optionIndex, timeToAnswer);
  };
  
  const handleTimeUp = () => {
    if (selectedOption === null && !showResults) {
      // Time is up and no option was selected
      onAnswer?.(-1, 12000); // -1 indicates no answer, 12000ms is full time
    }
  };
  
  return (
    <div className={cn('rounded-lg', className)}>
      <div className="mb-6">
        <QuizTimer 
          isRunning={isTimerRunning && !showResults} 
          onTimeUp={handleTimeUp}
        />
      </div>
      
      <div className="mb-8">
        <span className={cn(
          "inline-block px-3 py-1 mb-2 text-xs font-medium rounded-full",
          question.difficulty === "medium" ? 
            "bg-orange-100 text-orange-700" : 
            "bg-blue-100 text-blue-700"
        )}>
          {question.difficulty === "medium" ? "Medium" : "Basic"}
        </span>
        <h3 className="text-xl md:text-2xl font-bold mb-2">{question.text}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = showResults && index === question.correctOption;
          const isIncorrect = showResults && isSelected && index !== question.correctOption;
          
          return (
            <div
              key={index}
              className={cn(
                'quiz-option',
                isSelected && 'selected',
                isCorrect && 'correct',
                isIncorrect && 'incorrect'
              )}
              onClick={() => handleOptionClick(index)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  isSelected ? "bg-quiz-secondary text-white" : "bg-gray-100"
                )}>
                  {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                </div>
                <span className="font-medium">{option}</span>
              </div>
              
              {showResults && (
                <div className={cn(
                  "absolute right-3 top-3 w-6 h-6 rounded-full flex items-center justify-center",
                  isCorrect ? "bg-quiz-correct text-white" : 
                  isIncorrect ? "bg-quiz-incorrect text-white" : 
                  "hidden"
                )}>
                  {isCorrect ? "✓" : "×"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
