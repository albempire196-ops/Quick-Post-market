import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative section-aura">
      <div className="fixed inset-0 mesh-gradient opacity-80 pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[160px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none animate-float" />
      
      <div className="relative text-center px-6 max-w-lg liquid-glass rounded-[2rem] p-10 sm:p-14">
        {/* Large 404 number with gradient */}
        <div className="relative mb-8 opacity-0 animate-counter" style={{ animationDelay: '0.1s' }}>
          <span className="text-[120px] sm:text-[160px] font-display font-bold leading-none text-gradient animate-gradient bg-[length:200%_200%] select-none">
            404
          </span>
          <div className="absolute inset-0 text-[120px] sm:text-[160px] font-display font-bold leading-none text-primary/10 blur-2xl select-none" aria-hidden>
            404
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-3 opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Page not found
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="h-12 px-6 rounded-2xl gap-2 w-full sm:w-auto btn-secondary-premium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate("/")} 
            className="h-12 px-6 btn-premium gap-2 w-full sm:w-auto"
          >
            <span className="btn-shine" />
            <Home className="w-4 h-4" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
