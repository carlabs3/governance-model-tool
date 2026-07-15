import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, X, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GuestSecurityNoticeProps {
  projectId: string;
  isSensitiveSection?: boolean;
}

export const GuestSecurityNotice = ({ projectId, isSensitiveSection = false }: GuestSecurityNoticeProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user is authenticated or notice is dismissed
  if (isAuthenticated || isDismissed) {
    return null;
  }

  const handleCreateAccount = () => {
    navigate('/auth', { 
      state: { 
        claimProjectId: projectId,
        returnTo: '/canvas'
      } 
    });
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 text-sm">
            {isSensitiveSection 
              ? 'You\'re editing sensitive information'
              : 'You\'re working as a guest'}
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            {isSensitiveSection
              ? 'This section may contain sensitive data. Create an account for better protection and to access your project from any device.'
              : 'Your project is only accessible via the access code. Create an account to save it to your dashboard and manage it securely.'}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button 
              size="sm" 
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleCreateAccount}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Create Account
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              onClick={() => setIsDismissed(true)}
            >
              Continue as Guest
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          onClick={() => setIsDismissed(true)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
