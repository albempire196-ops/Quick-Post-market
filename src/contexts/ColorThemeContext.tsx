import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ColorTheme = "purple" | "blue" | "green" | "orange" | "rose" | "teal";

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType>({
  colorTheme: "purple",
  setColorTheme: () => {},
});

export const COLOR_THEMES: { value: ColorTheme; label: string; color: string }[] = [
  { value: "purple", label: "Purple", color: "#7c3aed" },
  { value: "blue",   label: "Blue",   color: "#2563eb" },
  { value: "green",  label: "Green",  color: "#059669" },
  { value: "orange", label: "Orange", color: "#ea6a0a" },
  { value: "rose",   label: "Rose",   color: "#e11d48" },
  { value: "teal",   label: "Teal",   color: "#0891b2" },
];

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    return (localStorage.getItem("color-theme") as ColorTheme) || "purple";
  });

  const applyTheme = (theme: ColorTheme) => {
    if (theme === "purple") {
      document.documentElement.removeAttribute("data-color-theme");
    } else {
      document.documentElement.setAttribute("data-color-theme", theme);
    }
  };

  useEffect(() => {
    applyTheme(colorTheme);
  }, []);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem("color-theme", theme);
    applyTheme(theme);
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
};

export const useColorTheme = () => useContext(ColorThemeContext);
