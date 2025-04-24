
import { useState } from 'react';
import { parseQuestions } from '@/utils/quiz-utils';
import { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface QuestionUploaderProps {
  onQuestionsLoaded: (questions: QuizQuestion[]) => void;
}

export function QuestionUploader({ onQuestionsLoaded }: QuestionUploaderProps) {
  const [inputData, setInputData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputData(e.target.value);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputData(content);
      }
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Please try again or paste your questions directly.",
        variant: "destructive"
      });
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  const handleSubmit = () => {
    if (!inputData.trim()) {
      toast({
        title: "No data",
        description: "Please upload or paste your questions first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const questions = parseQuestions(inputData);
      
      if (questions.length === 0) {
        toast({
          title: "No valid questions found",
          description: "Please check your format and try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: `${questions.length} questions loaded`,
        description: "Your questions are ready to use in the quiz."
      });
      
      onQuestionsLoaded(questions);
      setInputData('');
    } catch (error) {
      console.error('Error parsing questions:', error);
      toast({
        title: "Error parsing questions",
        description: "Please check your format and try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };
  
  const exampleFormat = `"What is the capital of France?","London","Berlin","Paris","Madrid",2,basic
"Which planet is known as the Red Planet?","Jupiter","Mars","Venus","Saturn",1,basic
"What is the chemical symbol for gold?","Au","Ag","Fe","Cu",0,medium"`;
  
  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-lg font-bold mb-2">Upload Questions</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a CSV or JSON file with your questions, or paste them directly.
      </p>
      
      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isLoading}
          >
            Upload File
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".csv,.json,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
          
          <Button
            variant="outline"
            onClick={() => setInputData(exampleFormat)}
          >
            Use Example
          </Button>
        </div>
        
        <Textarea
          placeholder="Paste your questions in CSV or JSON format..."
          className="min-h-[200px]"
          value={inputData}
          onChange={handleTextareaChange}
        />
        
        <div className="text-xs text-muted-foreground mt-2">
          <p className="font-medium mb-1">Format:</p>
          <p>CSV: "Question","Option 1","Option 2","Option 3","Option 4",Correct Index (0-3),Difficulty</p>
          <p>Or JSON array of question objects</p>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !inputData.trim()}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Load Questions"}
        </Button>
      </div>
    </div>
  );
}
