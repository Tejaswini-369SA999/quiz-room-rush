
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/context/SocketContext';
import { QuizHeader } from '@/components/QuizHeader';
import { QuizLeaderboard } from '@/components/QuizLeaderboard';
import { QuestionUploader } from '@/components/QuestionUploader';
import { QuizQuestion as QuizQuestionComponent } from '@/components/QuizQuestion';
import { QuizQuestion } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { allParticipantsAnswered } from '@/utils/quiz-utils';

const HostPage = () => {
  const { room, isHost, startQuiz, nextQuestion } = useSocket();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('setup');
  const [showAnswers, setShowAnswers] = useState(false);
  const [isQuestionTimedOut, setIsQuestionTimedOut] = useState(false);
  
  useEffect(() => {
    // If not host or no room, redirect to home
    if (!isHost || !room) {
      navigate('/');
    }
  }, [isHost, room, navigate]);
  
  useEffect(() => {
    // Auto-switch to quiz tab when quiz starts
    if (room?.status === 'active' && activeTab === 'setup') {
      setActiveTab('quiz');
    }
    
    // Reset question state when question changes
    if (room?.status === 'active') {
      setShowAnswers(false);
      setIsQuestionTimedOut(false);
    }
  }, [room, activeTab]);
  
  const handleQuestionsLoaded = (questions: QuizQuestion[]) => {
    // In a real app, would update the room with new questions via socket
    console.log('Questions loaded:', questions.length);
    
    // For now, we'll update localStorage directly (simulating backend)
    if (room) {
      const updatedRoom = {
        ...room,
        questions
      };
      
      localStorage.setItem(`room_${room.id}`, JSON.stringify(updatedRoom));
      window.location.reload(); // Force reload to update state from localStorage
    }
  };
  
  const handleStartQuiz = () => {
    startQuiz();
  };
  
  const handleShowAnswers = () => {
    setShowAnswers(true);
  };
  
  const handleNextQuestion = () => {
    nextQuestion();
    setShowAnswers(false);
    setIsQuestionTimedOut(false);
  };
  
  const handleTimeUp = () => {
    setIsQuestionTimedOut(true);
    // Auto show answers after a small delay
    setTimeout(() => {
      setShowAnswers(true);
    }, 1000);
  };
  
  // Generate shareable room link
  const roomLink = room ? `${window.location.origin}/room/${room.id}` : '';
  
  const currentQuestion = room?.status === 'active' && room.currentQuestion >= 0 
    ? room.questions[room.currentQuestion] 
    : null;
  
  const isLastQuestion = room?.questions && room.currentQuestion === room.questions.length - 1;
  
  const allAnswered = room && room.currentQuestion >= 0
    ? allParticipantsAnswered(room, room.currentQuestion)
    : false;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <QuizHeader />
      
      {room && (
        <main className="flex-1 container py-6">
          <Tabs 
            defaultValue="setup" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
              <TabsTrigger value="setup" disabled={room.status === 'active'}>Setup</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="results" disabled={room.status !== 'finished'}>Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Room Information</h2>
                    
                    <div className="grid gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Room Code</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold tracking-wider bg-quiz-background text-quiz-primary px-3 py-1 rounded-md">
                            {room.id}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(room.id)}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Join Link</p>
                        <div className="flex items-center gap-2">
                          <input 
                            readOnly 
                            value={roomLink} 
                            className="bg-quiz-background rounded px-3 py-1 text-sm w-full"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(roomLink)}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Questions</p>
                        <p className="text-lg font-bold">
                          {room.questions.length} questions ready
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Participants</p>
                        <p className="text-lg font-bold">
                          {room.participants.length} {room.participants.length === 1 ? 'player' : 'players'} joined
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        className="w-full bg-quiz-primary hover:bg-quiz-accent" 
                        size="lg"
                        onClick={handleStartQuiz}
                        disabled={room.questions.length === 0 || room.participants.length <= 1}
                      >
                        Start Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <QuestionUploader onQuestionsLoaded={handleQuestionsLoaded} />
              </div>
              
              <QuizLeaderboard />
            </TabsContent>
            
            <TabsContent value="quiz" className="space-y-6">
              {room.status === 'waiting' ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">Quiz Not Started</h2>
                  <p className="text-muted-foreground mb-6">Go to Setup to start the quiz</p>
                  <Button onClick={() => setActiveTab('setup')}>Go to Setup</Button>
                </div>
              ) : room.status === 'finished' ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">Quiz Finished</h2>
                  <p className="text-muted-foreground mb-6">View the results</p>
                  <Button onClick={() => setActiveTab('results')}>See Results</Button>
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
                          
                          <div className="space-x-2">
                            {!showAnswers ? (
                              <Button 
                                variant="outline" 
                                onClick={handleShowAnswers}
                                disabled={!isQuestionTimedOut && !allAnswered}
                              >
                                Show Answers
                              </Button>
                            ) : (
                              <Button 
                                onClick={handleNextQuestion}
                                className="bg-quiz-primary hover:bg-quiz-accent"
                              >
                                {isLastQuestion ? "End Quiz" : "Next Question"}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <QuizQuestionComponent 
                          question={currentQuestion}
                          showResults={showAnswers}
                          onAnswer={() => {}}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <QuizLeaderboard />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-xl font-bold">No questions available</h2>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Final Results</h2>
                  
                  <QuizLeaderboard />
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-bold mb-4">Question Statistics</h3>
                    
                    <div className="space-y-4">
                      {room.questions.map((question, index) => {
                        // Calculate stats for this question
                        const answers = room.participants.flatMap(p => 
                          p.answers.filter(a => a.questionId === question.id)
                        );
                        
                        const totalAnswers = answers.length;
                        const correctAnswers = answers.filter(a => a.correct).length;
                        const correctPercentage = totalAnswers > 0 
                          ? Math.round((correctAnswers / totalAnswers) * 100) 
                          : 0;
                        
                        return (
                          <div key={question.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Question {index + 1}</span>
                              <span className="text-sm">
                                {correctPercentage}% Correct
                              </span>
                            </div>
                            <p className="text-sm mb-2">{question.text}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-quiz-primary h-2 rounded-full" 
                                style={{width: `${correctPercentage}%`}}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      )}
    </div>
  );
};

export default HostPage;
