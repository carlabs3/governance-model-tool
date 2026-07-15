import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "@/context/ProjectContext";
import Welcome from "./pages/Welcome";
import NewProject from "./pages/NewProject";
import AccessProject from "./pages/AccessProject";
import Setup from "./pages/Setup";
import Questionnaire from "./pages/Questionnaire";
import Canvas from "./pages/Canvas";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/new-project" element={<NewProject />} />
            <Route path="/access-project" element={<AccessProject />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/canvas" element={<Canvas />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
