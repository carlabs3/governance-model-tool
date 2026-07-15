import { useState, useContext } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Mail, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/context/AuthContext";
import { z } from "zod";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });

interface SaveConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  accessCode: string;
}

export const SaveConfirmationDialog = ({
  open,
  onOpenChange,
  projectName,
  accessCode,
}: SaveConfirmationDialogProps) => {
  const authContext = useContext(AuthContext);
  const userEmail = authContext?.user?.email ?? "";

  const [email, setEmail] = useState(userEmail);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    // Reset state for next open
    setTimeout(() => {
      setSent(false);
      setError(null);
      setEmail(userEmail);
    }, 200);
    onOpenChange(false);
  };

  const handleSendEmail = async () => {
    try {
      emailSchema.parse(email);
    } catch {
      setError("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const { error: fnError } = await supabase.functions.invoke("send-project-share", {
        body: {
          emails: [email.trim().toLowerCase()],
          projectName,
          accessCode,
          customMessage: "Here is your saved Governance Model Canvas with the access details.",
          projectUrl: `${window.location.origin}/access-project`,
        },
      });

      if (fnError) throw fnError;
      setSent(true);
    } catch {
      setError("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">
        <VisuallyHidden.Root>
          <DialogTitle>Canvas Saved</DialogTitle>
          <DialogDescription>Your governance model has been saved successfully.</DialogDescription>
        </VisuallyHidden.Root>
        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-1.5">Canvas saved</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Your governance model has been saved successfully.
          </p>

          {sent ? (
            /* Email sent confirmation */
            <div className="space-y-4">
              <div className="bg-success/5 border border-success/15 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-sm text-success font-medium">
                  <Mail className="w-4 h-4" />
                  Email sent!
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">A copy has been sent to {email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose} className="text-xs text-muted-foreground">
                Close
              </Button>
            </div>
          ) : (
            /* Email form */
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-left space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Send a copy to your email
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className="text-sm h-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendEmail();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleSendEmail}
                    disabled={isSending || !email.trim()}
                    className="gap-1.5 h-9 px-4 shrink-0 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-md shadow-brand-primary/20"
                  >
                    {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {isSending ? "Sending…" : "Send"}
                  </Button>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  We'll send the canvas link and access code to this address. <br />
                  Your email is only used to send this message and is not stored.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
