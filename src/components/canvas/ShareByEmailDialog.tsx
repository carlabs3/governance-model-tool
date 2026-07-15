import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, X, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Invalid email address" });

interface ShareByEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  accessCode: string;
}

export const ShareByEmailDialog = ({ open, onOpenChange, projectName, accessCode }: ShareByEmailDialogProps) => {
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim().toLowerCase();

    if (!trimmedEmail) return;

    try {
      emailSchema.parse(trimmedEmail);

      if (emails.includes(trimmedEmail)) {
        setError("This email has already been added");
        return;
      }

      if (emails.length >= 10) {
        setError("Maximum 10 recipients allowed");
        return;
      }

      setEmails((prev) => [...prev, trimmedEmail]);
      setEmailInput("");
      setError(null);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSend = async () => {
    if (emails.length === 0) {
      setError("Please add at least one email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.functions.invoke("send-project-share", {
        body: {
          emails,
          projectName,
          accessCode,
          customMessage: customMessage.trim() || undefined,
          projectUrl: `${window.location.origin}/access-project`,
        },
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Invitations sent!",
        description: `${emails.length} collaborator${emails.length > 1 ? "s" : ""} will receive an email invitation.`,
      });
    } catch (err) {
      console.error("Error sending emails:", err);
      setError("Failed to send invitations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmails([]);
    setEmailInput("");
    setCustomMessage("");
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Mail className="w-4 h-4 text-brand-primary" />
            Share by Email
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Invite collaborators to edit this project
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center px-6 py-8">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-sm mb-2">Invitations Sent!</h3>
            <p className="text-xs text-muted-foreground mb-6">
              {emails.length} collaborator{emails.length > 1 ? "s" : ""} will receive an email with access instructions.
            </p>
            <Button
              size="sm"
              onClick={handleClose}
              className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-md shadow-brand-primary/20"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="px-6 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-input" className="text-xs font-medium">
                  Email Addresses
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email-input"
                    type="email"
                    placeholder="collaborator@example.com"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEmail}
                    className="rounded-xl border-brand-primary/40 text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Press Enter or comma to add multiple emails.
                  <br />
                  Email addresses are only used to send the invitation and are not stored.
                </p>
              </div>

              {emails.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {emails.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1 text-xs">
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="custom-message" className="text-xs font-medium">
                  Personal Message (optional)
                </Label>
                <Textarea
                  id="custom-message"
                  placeholder="Add a personal note to your invitation…"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="resize-none text-sm"
                  rows={3}
                />
              </div>

              <div className="bg-muted/40 rounded-xl p-3 text-xs border border-border/60">
                <p className="text-muted-foreground leading-relaxed">
                  Recipients will receive an email with the access code{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">{accessCode}</code> and
                  instructions to access the project.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 p-3 rounded-xl border border-destructive/10">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border/60 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleClose} className="text-xs rounded-xl">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={isLoading || emails.length === 0}
                className="gap-1.5 text-xs rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white border-0 shadow-md shadow-brand-primary/20"
              >
                <Send className="w-3.5 h-3.5" />
                {isLoading ? "Sending…" : `Send ${emails.length > 0 ? `(${emails.length})` : ""}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
