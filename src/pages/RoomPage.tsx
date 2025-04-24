
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { QuizHeader } from '@/components/QuizHeader';
import { QuizLeaderboard } from '@/components/QuizLeaderboard';
import { QuizQuestion as QuizQuestionComponent } from '@/components/QuizQuestion';
import { getRankings } from '@/utils/quiz-utils';
import { Card, CardContent } from '@/components/ui/card';

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, participant, submitAnswer } = useSocket();
  const navigate = useNavigate();
  
  // Redirect to home if room or participant doesn't exist
  useEffect(() => {
    if (!room || !participant) {
      navigate('/');
    }
  }, [room, participant, navigate]);
  
  // Handle submitting an answer
  const handleAnswer = (optionIndex: number, timeToAnswer: number) => {
    if (!room || room.currentQuestion < 0) return;
    
    const currentQuestion = room.questions[room.currentQuestion];
    if (!currentQuestion) return;
    
    submitAnswer({
      questionId: currentQuestion.id,
      selectedOption: optionIndex,
      timeToAnswer
    });
  };
  
  // Get current question
  const currentQuestion = room?.status === 'active' && room.currentQuestion >= 0 
    ? room.questions[room.currentQuestion] 
    : null;
  
  // Check if the participant has answered the current question
  const hasAnswered = participant && currentQuestion 
    ? participant.answers.some(a => a.questionId === currentQuestion.id)
    : false;
  
  // Get participant rank
  const rank = room && participant 
    ? getRankings(room.participants).findIndex(p => p.id === participant.id) + 1 
    : 0;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <QuizHeader />
      
      <main className="flex-1 container py-6">
        {!room ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold">Loading...</h2>
          </div>
        ) : room.status === 'waiting' ? (
          <div className="max-w-md mx-auto text-center py-12">
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">Waiting for Quiz to Start</h2>
                <div className="w-24 h-24 rounded-full bg-quiz-background flex items-center justify-center mb-6">
                  <div className="w-16 h-16 border-4 border-quiz-primary border-t-transparent rounded-full animate-spin-slow"></div>
                </div>
                <p className="text-muted-foreground mb-2">Room Code: <span className="font-bold">{room.id}</span></p>
                <p className="text-muted-foreground">The host will start the quiz soon</p>
              </CardContent>
            </Card>
          </div>
        ) : room.status === 'finished' ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Quiz Finished</h2>
                {participant && (
                  <div className="mb-6">
                    <p className="text-lg mb-1">Your Score:</p>
                    <p className="text-3xl font-bold text-quiz-primary">{participant.score}</p>
                    <p className="text-md mt-2">
                      Rank: <span className="font-bold">{rank}</span> of {room.participants.length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <QuizLeaderboard />
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Your Answers</h3>
                
                <div className="space-y-4">
                  {participant && room.questions.map((question, index) => {
                    const answer = participant.answers.find(a => a.questionId === question.id);
                    const isCorrect = answer?.correct ?? false;
                    const answered = answer !== undefined;
                    
                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Question {index + 1}</span>
                          {answered ? (
                            <span className={`text-sm font-medium ${isCorrect ? 'text-quiz-correct' : 'text-quiz-incorrect'}`}>
                              {isCorrect ? '✓ Correct' : '× Incorrect'}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not answered</span>
                          )}
                        </div>
                        <p className="text-sm">{question.text}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : currentQuestion ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">
                      Question {room.currentQuestion + 1} of {room.questions.length}
                    </span>
                    {hasAnswered && (
                      <span className="text-sm font-medium text-green-600">
                        Answer submitted
                      </span>
                    )}
                  </div>
                  
                  <QuizQuestionComponent 
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    showResults={false}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <QuizLeaderboard compact />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold">No active question</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomPage;
