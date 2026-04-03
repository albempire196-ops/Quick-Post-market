// Importet duhet të jenë gjithmonë në fillim
interface AuthPromptModalProps {
  open: boolean;
  onClose: () => void;
}
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
export const AuthPromptModal = ({ open, onClose }: AuthPromptModalProps) => {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, signInWithMagicLink } = useAuth();
  const [showMagic, setShowMagic] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLoading(true);
    try {
      await signInWithMagicLink(magicEmail);
      toast.success("Check your email for the login link!");
      setShowMagic(false);
      setMagicEmail("");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to send magic link");
    } finally {
      setMagicLoading(false);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isRegister) {
        await signUpWithEmail(email, password);
        toast.success("Check your email to confirm registration.");
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      let message = "Something went wrong. Please try again.";
      if (error?.message?.includes("redirect") || error?.message?.includes("OAuth")) {
        message = "Google sign-in failed. Please check your OAuth configuration and redirect URLs.";
      }
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <DialogTitle className="text-2xl font-display">
              Sign in with Google
            </DialogTitle>
            <DialogDescription className="text-base">
              To post products, you need to sign in with a Google account.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-6 space-y-4">
            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="w-full h-14 text-base font-semibold bg-gradient-primary hover:opacity-90 shadow-button rounded-2xl gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
// Fund i komponentit
