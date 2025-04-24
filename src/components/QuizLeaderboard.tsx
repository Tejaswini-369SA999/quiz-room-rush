
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';
import { getRankings } from '@/utils/quiz-utils';

interface QuizLeaderboardProps {
  className?: string;
  compact?: boolean;
}

export function QuizLeaderboard({ className, compact = false }: QuizLeaderboardProps) {
  const { room } = useSocket();
  
  if (!room) return null;
  
  const rankings = getRankings(room.participants);
  
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Leaderboard</h3>
        <p className="text-sm text-muted-foreground">
          {room.participants.length} {room.participants.length === 1 ? 'player' : 'players'}
        </p>
      </div>
      
      <div className="p-4">
        {rankings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No participants yet
          </div>
        ) : (
          <div className={compact ? "max-h-60 overflow-y-auto" : ""}>
            {rankings.map((participant, index) => (
              <div 
                key={participant.id}
                className={cn(
                  "leaderboard-row",
                  index === 0 && "leaderboard-row-top"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 ? "bg-yellow-400 text-yellow-800" :
                    index === 1 ? "bg-gray-300 text-gray-700" :
                    index === 2 ? "bg-amber-600 text-amber-100" :
                    "bg-gray-100 text-gray-500"
                  )}>
                    {index + 1}
                  </div>
                  <span className={cn(
                    "font-medium",
                    index < 3 && "font-semibold"
                  )}>
                    {participant.name}
                  </span>
                </div>
                <span className="font-bold text-quiz-primary">{participant.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
