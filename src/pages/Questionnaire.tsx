import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Layers, CheckCircle2, Loader2 } from 'lucide-react';
import logoSrc from '@/assets/NEU-logo_RGB_main-color.png';
import { AppFooter } from '@/components/AppFooter';
import { StepIndicator } from '@/components/StepIndicator';
import { QUESTIONNAIRE_QUESTIONS, GOVERNANCE_TEMPLATES, QuestionnaireAnswer } from '@/types/governance';
import { useProject } from '@/context/ProjectContext';
import { cn } from '@/lib/utils';

const Questionnaire = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createProject, applyTemplate, currentProject, isLoading } = useProject();
  const state = location.state as { projectName?: string; isChange?: boolean } | null;
  const projectName = state?.projectName || 'Untitled Project';
  const isChange = state?.isChange || false;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);

  const question = QUESTIONNAIRE_QUESTIONS[currentQuestion];
  const steps = QUESTIONNAIRE_QUESTIONS.map((_, i) => ({ number: i + 1, label: `Q${i + 1}` }));

  const getRecommendedTemplate = () => {
    const scores: Record<string, number> = {
      'public-board': 0,
      'community-based': 0,
      'hybrid': 0,
      'multi-stakeholder': 0,
      'project-based': 0,
    };

    answers.forEach((answer) => {
      if (answer.answerId === 'public' || answer.answerId === 'hierarchical' || answer.answerId === 'consultative') {
        scores['public-board'] += 1;
      }
      if (answer.answerId === 'community' || answer.answerId === 'consensus' || answer.answerId === 'co-creation') {
        scores['community-based'] += 1;
      }
      if (answer.answerId === 'mixed' || answer.answerId === 'collaborative') {
        scores['hybrid'] += 1;
      }
      if (answer.answerId === 'multi' || answer.answerId === 'participatory') {
        scores['multi-stakeholder'] += 1;
      }
      if (answer.answerId === 'project' || answer.answerId === 'none') {
        scores['project-based'] += 1;
      }
    });

    const maxScore = Math.max(...Object.values(scores));
    const recommended = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'hybrid';
    
    return GOVERNANCE_TEMPLATES.find((t) => t.id === recommended) || GOVERNANCE_TEMPLATES[1];
  };

  const handleAnswer = (answerId: string) => {
    const newAnswers = [...answers.filter((a) => a.questionId !== question.id), { questionId: question.id, answerId }];
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONNAIRE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
    } else if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (isChange && currentProject) {
      navigate('/canvas');
    } else {
      navigate('/setup', { state: { projectName } });
    }
  };

  const handleCreateProject = async (templateId: string) => {
    if (isChange && currentProject) {
      await applyTemplate(templateId);
      navigate('/canvas');
    } else {
      await createProject(projectName, templateId);
      navigate('/canvas');
    }
  };

  const currentAnswer = answers.find((a) => a.questionId === question?.id);
  const recommendedTemplate = getRecommendedTemplate();

  const BrandHeader = () => (
    <header className="border-b border-border/60 sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
      <div className="container-wide py-4">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="NeutralPath 2030" className="h-9 w-auto object-contain" />
        </div>
      </div>
    </header>
  );

  if (showResult) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <BrandHeader />

        <main className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-brand-primary/8 to-brand-secondary/8 blur-3xl" />
          </div>

          <div className="container-narrow relative z-[1]">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Questions
            </Button>

            <div className="max-w-lg mx-auto rounded-2xl border border-border/60 bg-card p-8 md:p-10 shadow-lg shadow-brand-primary/5 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary/15 to-brand-secondary/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-brand-primary" />
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                  Your Recommended Template
                </span>
              </h1>
              <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                Based on your answers, we recommend:
              </p>

              <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-xl p-6 mb-8 border border-brand-primary/10">
                <h2 className="text-xl font-bold mb-2 tracking-tight">
                  <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                    {recommendedTemplate.name}
                  </span>
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {recommendedTemplate.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => handleCreateProject(recommendedTemplate.id)}
                  className="gap-2 h-12 rounded-xl text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      Use This Template
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => isChange ? navigate('/canvas') : navigate('/setup', { state: { projectName } })}
                  className="h-12 rounded-xl border-2 border-brand-primary/40 text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200"
                >
                  Choose Different
                </Button>
              </div>
            </div>
          </div>
        </main>

        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <BrandHeader />

      <main className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-brand-primary/8 to-brand-secondary/8 blur-3xl" />
        </div>

        <div className="container-narrow relative z-[1]">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <StepIndicator steps={steps} currentStep={currentQuestion + 1} className="mb-12" />

          <div className="max-w-lg mx-auto rounded-2xl border border-border/60 bg-card p-8 md:p-10 shadow-lg shadow-brand-primary/5 animate-fade-in">
            <div className="text-sm font-bold mb-2 uppercase tracking-widest bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
              Question {currentQuestion + 1} of {QUESTIONNAIRE_QUESTIONS.length}
            </div>
            <h2 className="text-xl font-bold mb-6 text-foreground tracking-tight">{question.question}</h2>

            <div className="space-y-3 mb-8">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm',
                    currentAnswer?.answerId === option.id
                      ? 'border-brand-primary bg-brand-primary/5 text-foreground'
                      : 'border-border/60 hover:border-brand-primary/40 text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Button
              className="w-full gap-2 h-12 rounded-xl text-base bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
              disabled={!currentAnswer}
              onClick={handleNext}
            >
              {currentQuestion < QUESTIONNAIRE_QUESTIONS.length - 1 ? 'Next Question' : 'See Recommendation'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default Questionnaire;
