import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getTranslation, TranslationKey } from "@/i18n/translations";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  preferredCountry: string | null;
  setPreferredCountry: (country: string | null) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState(() => localStorage.getItem("preferred_language") || "en");
  const [preferredCountry, setPreferredCountryState] = useState<string | null>(() => localStorage.getItem("preferred_country") || null);

  // Load preferences from DB when user logs in
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("preferred_language, preferred_country")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.preferred_language) {
          setLanguageState(data.preferred_language);
          localStorage.setItem("preferred_language", data.preferred_language);
        }
        if (data?.preferred_country !== undefined) {
          setPreferredCountryState(data.preferred_country);
          if (data.preferred_country) {
            localStorage.setItem("preferred_country", data.preferred_country);
          } else {
            localStorage.removeItem("preferred_country");
          }
        }
      });
  }, [user]);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
    if (user) {
      await supabase.from("profiles").update({ preferred_language: lang } as any).eq("id", user.id);
    }
  };

  const setPreferredCountry = async (country: string | null) => {
    setPreferredCountryState(country);
    if (country) {
      localStorage.setItem("preferred_country", country);
    } else {
      localStorage.removeItem("preferred_country");
    }
    if (user) {
      await supabase.from("profiles").update({ preferred_country: country } as any).eq("id", user.id);
    }
  };

  const t = (key: TranslationKey) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, preferredCountry, setPreferredCountry, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
