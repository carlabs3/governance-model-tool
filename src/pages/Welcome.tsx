import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, Search, Users, Target, FileText, BarChart3 } from "lucide-react";
import logoSrc from "@/assets/NEU-logo_RGB_main-color.png";
import { AppFooter } from "@/components/AppFooter";

const steps = [
  {
    icon: Search,
    label: "Review Existing Models",
    description: "Explore governance models like Full Public Board, Public-Private Partnership, and more",
  },
  {
    icon: Target,
    label: "Establish Vision & Scope",
    description: "Define stakeholders, objectives, and the scope of your Living Lab",
  },
  {
    icon: Layers,
    label: "Define Model Elements",
    description: "Use the Governance Model Canvas to outline strategy and operations",
  },
  {
    icon: FileText,
    label: "Create an Action Plan",
    description: "Define the governance structure and implementation plan",
  },
  {
    icon: BarChart3,
    label: "Continuous Monitoring",
    description: "Monitor and evaluate the governance model over time",
  },
];

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="border-b border-border/60 sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="container-wide py-4">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="NeutralPath 2030" className="h-9 w-auto object-contain" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-28 md:py-40 relative overflow-hidden">
        {/* Subtle background gradient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-r from-brand-primary/8 to-brand-secondary/8 blur-3xl" />
        </div>

        <div className="container-narrow text-center animate-fade-in relative z-[1]">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
              Governance Model
            </span>
            <span className="block text-foreground mt-2 text-4xl md:text-6xl font-semibold">Canvas</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed text-balance">
            Achieving the vision and mission of Living Labs to develop Positive and Clean Energy Districts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/new-project")}
              className="gap-2 text-base px-8 h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
            >
              Create New Project
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/access-project")}
              className="text-base px-8 h-12 rounded-xl border-2 border-brand-primary/40 text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200"
            >
              Access Existing Project
            </Button>
          </div>
        </div>
      </section>

      {/* What is the Governance Model Canvas */}
      <section className="py-20 md:py-24 border-y relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5" />
        <div className="absolute inset-0 border-y border-brand-primary/10" />

        <div className="container-narrow relative z-[1]">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
              What is the Governance Model Canvas?
            </span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed text-base md:text-lg mb-4">
            The Governance Model Canvas, developed within the EU co-funded NEUTRALPATH project, is a visual tool for
            designing and managing governance in Living Labs and PCEDs. It clarifies roles, responsibilities, and
            stakeholder collaboration, helping teams align with their mission while fostering continuous innovation.
          </p>
          <p className="text-center">
            <a
              href="https://neutralpath.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary font-semibold underline hover:text-brand-secondary transition-colors"
            >
              Visit the NEUTRALPATH website
            </a>
          </p>
        </div>
      </section>

      {/* Five Steps Journey */}
      <section className="py-20 md:py-28">
        <div className="container-wide">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
              The Governance Model Definition Journey
            </span>
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
            Follow our structured approach to build a comprehensive governance model tailored to your Living Lab.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="group relative rounded-2xl border border-border/60 bg-card p-6 text-center transition-all duration-300 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 animate-slide-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center mx-auto mb-4 group-hover:from-brand-primary/20 group-hover:to-brand-secondary/20 transition-all duration-300">
                  <step.icon className="w-5 h-5 text-brand-primary" />
                </div>
                <div className="text-[11px] font-bold mb-2 uppercase tracking-widest bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                  Step {index + 1}
                </div>
                <h3 className="font-semibold text-sm mb-2 text-foreground">{step.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Download Guide Button */}
          <div className="mt-10 text-center">
            <p className="text-base md:text-lg text-muted-foreground mb-4 max-w-md mx-auto">
              Go further in detail with our comprehensive guide.
            </p>
            <Button
              asChild
              size="lg"
              className="gap-2 text-base px-8 h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
            >
              <a
                href="https://neutralpath.eu/wp-content/uploads/2025/01/NEUTRALPATH-Governance-model-guide-2.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download the Step-by-Step Guide
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5" />
        <div className="absolute inset-0 border-y border-brand-primary/10" />

        <div className="container-narrow text-center relative z-[1]">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
              Ready to Design Your Governance Model?
            </span>
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
            Use the Governance Model Canvas to outline and design core components of your governance model, or choose
            from expert-designed templates.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/new-project")}
            className="gap-2 text-base px-8 h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-lg shadow-brand-primary/20 transition-all duration-200"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      <AppFooter showBrandLogo />
    </div>
  );
};

export default Welcome;
