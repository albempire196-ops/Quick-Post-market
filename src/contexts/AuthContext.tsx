import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { SellerNamePrompt } from "@/components/SellerNamePrompt";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSellerNamePrompt, setShowSellerNamePrompt] = useState(false);
  const [sellerNameDraft, setSellerNameDraft] = useState("");
  const [savingSellerName, setSavingSellerName] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user) {
        setShowSellerNamePrompt(false);
        setSellerNameDraft("");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Failed to load profile:", error);
        return;
      }

      const suggestedName =
        data?.full_name?.trim() ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        (typeof user.email === "string" ? user.email.split("@")[0] : "");

      setSellerNameDraft(suggestedName);
      setShowSellerNamePrompt(!data?.full_name?.trim());
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const saveSellerName = async (fullName: string) => {
    if (!user) return;

    setSavingSellerName(true);
    try {
      const profilePayload = {
        id: user.id,
        email: user.email ?? null,
        full_name: fullName,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      };

      const { error: profileError } = await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });
      if (profileError) throw profileError;

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          full_name: fullName,
          name: fullName,
        },
      });

      if (updateUserError) {
        console.error("Failed to update auth metadata:", updateUserError);
      }

      setShowSellerNamePrompt(false);
      toast.success("Seller name saved.");
    } catch (error) {
      console.error("Failed to save seller name:", error);
      toast.error("Could not save seller name.");
    } finally {
      setSavingSellerName(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };


  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signInWithMagicLink, signOut }}>
      {children}
      <SellerNamePrompt
        open={showSellerNamePrompt}
        initialValue={sellerNameDraft}
        email={user?.email}
        saving={savingSellerName}
        onSubmit={saveSellerName}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
