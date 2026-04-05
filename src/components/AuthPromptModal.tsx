import { useState } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AuthPromptModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthPromptModal = ({ open, onClose }: AuthPromptModalProps) => {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setMode("signin");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      if (mode === "magic") {
        await signInWithMagicLink(email);
        toast.success("Check your email for the login link!");
        handleClose();
        return;
      }
      if (mode === "signup") {
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email, password);
        toast.success("Check your email to confirm your account.");
      } else {
        await signInWithEmail(email, password);
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden rounded-[1.75rem] border-border/10 auth-modal-glass">
        {/* Top gradient accent bar */}
        <div className="h-1 bg-gradient-primary" />

        <div className="px-7 pt-7 pb-8 space-y-6">
          {/* Header */}
          <DialogHeader className="space-y-3 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button relative">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <DialogTitle className="text-xl font-display font-bold">
              {mode === "signup" ? "Create your account" : mode === "magic" ? "Magic link sign in" : "Welcome back"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {mode === "signup"
                ? "Join thousands of sellers worldwide"
                : mode === "magic"
                ? "We'll send a secure login link to your email"
                : "Sign in to your Quick Post Market account"}
            </DialogDescription>
          </DialogHeader>

          {/* Google button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            variant="outline"
            size="lg"
            className="w-full h-12 text-sm font-semibold rounded-xl gap-3 border-border/30 hover:border-primary/20 hover:bg-primary/[0.03] transition-all duration-300 relative overflow-hidden"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">or</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="pl-10 h-11 rounded-xl border-border/30 bg-secondary/20 focus:bg-background focus:border-primary/30 transition-all duration-300 text-sm"
              />
            </div>

            {mode !== "magic" && (
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Create a password (6+ chars)" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="pl-10 pr-10 h-11 rounded-xl border-border/30 bg-secondary/20 focus:bg-background focus:border-primary/30 transition-all duration-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full h-11 text-sm font-semibold btn-premium group"
            >
              <span className="btn-shine" />
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "signup" ? "Create Account" : mode === "magic" ? "Send Magic Link" : "Sign In"}
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </form>

          {/* Footer links */}
          <div className="space-y-2 text-center">
            {mode === "signin" && (
              <>
                <button
                  onClick={() => setMode("magic")}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                  Sign in with magic link instead
                </button>
                <p className="text-xs text-muted-foreground">
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">
                    Sign up
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-primary font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            )}
            {mode === "magic" && (
              <button
                onClick={() => setMode("signin")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                Back to sign in with password
              </button>
            )}
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-muted-foreground font-medium">256-bit encrypted &middot; GDPR compliant</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
