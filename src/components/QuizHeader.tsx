
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface QuizHeaderProps {
  className?: string;
}

export function QuizHeader({ className }: QuizHeaderProps) {
  const { room, participant, isHost } = useSocket();
  const navigate = useNavigate();
  
  const handleExit = () => {
    // Clear local storage and navigate to home
    localStorage.removeItem('quiz_participant');
    localStorage.removeItem('quiz_current_room');
    navigate('/');
  };
  
  return (
    <header className={cn('py-4 px-6 flex items-center justify-between border-b', className)}>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-quiz-primary">Quiz Room</h1>
        {room && (
          <span className="text-sm font-semibold bg-quiz-background text-quiz-primary px-2 py-1 rounded-md">
            Room: {room.id}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {participant && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-quiz-accent">
              {isHost ? 'Host' : 'Player'}:
            </span>
            <span className="font-semibold">{participant.name}</span>
            {room?.status === 'active' && (
              <span className="text-sm font-medium ml-2">
                Score: <span className="font-bold text-quiz-primary">{participant.score}</span>
              </span>
            )}
          </div>
        )}
        
        <Button variant="outline" size="sm" onClick={handleExit}>
          Exit
        </Button>
      </div>
    </header>
  );
}
