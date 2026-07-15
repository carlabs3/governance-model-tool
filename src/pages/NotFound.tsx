import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden page-transition">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-brand-primary/8 to-brand-secondary/8 blur-3xl" />
      </div>

      <div className="text-center relative z-[1]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center mx-auto mb-6">
          <Layers className="w-8 h-8 text-brand-primary" />
        </div>
        <h1 className="mb-2 text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">404</span>
        </h1>
        <p className="mb-6 text-lg text-muted-foreground">Oops! Page not found</p>
        <Button
          onClick={() => window.location.href = '/'}
          className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
