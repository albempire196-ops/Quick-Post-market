import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast.success("Logged in successfully!");
        subscription.unsubscribe();
        navigate("/", { replace: true });
      }
    });

    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const authError = url.searchParams.get("error_description") || url.searchParams.get("error");

        if (authError) {
          toast.error("Login failed: " + decodeURIComponent(authError));
          navigate("/", { replace: true });
          return;
        }

        // PKCE flow: code in query params
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            toast.error("Login failed: " + error.message);
            navigate("/", { replace: true });
          }
          return;
        }

        // Magic link / implicit flow: token_hash in query params
        const token_hash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type") as "magiclink" | "recovery" | "signup" | null;
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type });
          if (error) {
            toast.error("Login failed: " + error.message);
            navigate("/", { replace: true });
          }
          return;
        }

        // Hash fragment: access_token (implicit flow fallback)
        const hash = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) {
            toast.error("Login failed: " + error.message);
            navigate("/", { replace: true });
          }
          return;
        }

        // Nothing found, go home
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Auth callback error:", err);
        toast.error("Login failed. Please try again.");
        navigate("/", { replace: true });
      }
    };

    handleCallback();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground">Finishing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
