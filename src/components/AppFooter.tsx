import { Link } from 'react-router-dom';
import logoSrc from '@/assets/NEU-logo_RGB_main-color.png';
import euFlagSrc from '@/assets/eu-flag.png';

interface AppFooterProps {
  /** Show the NeutralPath logo row (used on Welcome page) */
  showBrandLogo?: boolean;
}

export const AppFooter = ({ showBrandLogo = false }: AppFooterProps) => {
  return (
    <footer className="py-8 border-t border-border/40">
      <div className="container-wide flex flex-col items-center gap-4">
        {showBrandLogo && (
          <img src={logoSrc} alt="NeutralPath 2030" className="h-7 w-auto object-contain" />
        )}

        <div className="flex items-center gap-2.5">
          <img src={euFlagSrc} alt="European Union Flag" className="h-8 w-auto object-contain" />
          <span className="text-xs text-muted-foreground leading-tight">
            Co-funded by the<br />European Union
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
          <span>Designed for NEUTRALPATH by Three o'clock</span>
          <span className="text-muted-foreground/30">·</span>
          <Link
            to="/privacy-policy"
            className="hover:text-brand-primary transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};
