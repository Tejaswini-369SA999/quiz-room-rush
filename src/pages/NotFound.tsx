
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-quiz-primary mb-4">404</h1>
        <p className="text-2xl font-medium mb-6">Oops! Page not found</p>
        <p className="text-muted-foreground mb-8">
          The quiz room you're looking for might have ended or never existed.
        </p>
        <Button 
          className="bg-quiz-primary hover:bg-quiz-accent" 
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
