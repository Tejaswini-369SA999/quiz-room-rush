
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSocket } from '@/context/SocketContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [isJoining, setIsJoining] = useState(false);
  const { createRoom, joinRoom } = useSocket();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  
  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value.toUpperCase());
  };
  
  const handleCreateRoom = () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your name",
      });
      return;
    }
    
    createRoom(name);
    navigate('/host');
  };
  
  const handleJoinRoom = async () => {
    if (!name.trim() || !roomId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your name and room code",
      });
      return;
    }
    
    setIsJoining(true);
    
    try {
      const success = await joinRoom(roomId, name);
      if (success) {
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-6 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-quiz-primary">Quiz Room Rush</h1>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-quiz-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-quiz-primary">
                Welcome to Quiz Room Rush
              </CardTitle>
              <CardDescription className="text-center">
                Create or join a quiz room to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={activeTab === 'join' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('join')}
                    className={activeTab === 'join' ? 'bg-quiz-primary text-white' : ''}
                  >
                    Join Room
                  </Button>
                  <Button
                    variant={activeTab === 'create' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('create')}
                    className={activeTab === 'create' ? 'bg-quiz-primary text-white' : ''}
                  >
                    Create Room
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium">
                      Your Name
                    </label>
                    <Input 
                      id="name"
                      placeholder="Enter your name" 
                      value={name}
                      onChange={handleNameChange}
                    />
                  </div>
                  
                  {activeTab === 'join' && (
                    <div>
                      <label htmlFor="room-id" className="text-sm font-medium">
                        Room Code
                      </label>
                      <Input 
                        id="room-id"
                        placeholder="Enter room code" 
                        value={roomId}
                        onChange={handleRoomIdChange}
                        maxLength={6}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full bg-quiz-primary hover:bg-quiz-accent" 
                onClick={activeTab === 'join' ? handleJoinRoom : handleCreateRoom}
                disabled={(!name.trim() || (activeTab === 'join' && !roomId.trim())) || isJoining}
              >
                {isJoining ? 'Joining...' : activeTab === 'join' ? 'Join Quiz' : 'Create Quiz'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        <p>Quiz Room Rush © 2025</p>
      </footer>
    </div>
  );
};

export default Index;
