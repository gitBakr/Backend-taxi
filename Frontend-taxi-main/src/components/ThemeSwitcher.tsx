import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";
import { useEffect, useState } from "react";

const themes = {
  vibrant: {
    primary: "#8B5CF6", // Violet vif
    secondary: "#F97316", // Orange vif
    accent: "#0EA5E9", // Bleu océan
    "primary-foreground": "#FFFFFF",
    "secondary-foreground": "#FFFFFF",
    "accent-foreground": "#FFFFFF",
  },
  joyful: {
    primary: "#D946EF", // Rose magenta
    secondary: "#F43F5E", // Rouge corail
    accent: "#10B981", // Vert émeraude
    "primary-foreground": "#FFFFFF",
    "secondary-foreground": "#FFFFFF",
    "accent-foreground": "#FFFFFF",
  },
  energetic: {
    primary: "#3B82F6", // Bleu électrique
    secondary: "#EF4444", // Rouge énergique
    accent: "#14B8A6", // Turquoise
    "primary-foreground": "#FFFFFF",
    "secondary-foreground": "#FFFFFF",
    "accent-foreground": "#FFFFFF",
  },
  sunset: {
    primary: "#F59E0B", // Orange doré
    secondary: "#EC4899", // Rose vif
    accent: "#6366F1", // Indigo
    "primary-foreground": "#FFFFFF",
    "secondary-foreground": "#FFFFFF",
    "accent-foreground": "#FFFFFF",
  },
  ocean: {
    primary: "#0284C7", // Bleu océan
    secondary: "#059669", // Vert marin
    accent: "#7C3AED", // Violet profond
    "primary-foreground": "#FFFFFF",
    "secondary-foreground": "#FFFFFF",
    "accent-foreground": "#FFFFFF",
  }
};

export const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState("vibrant");

  const applyTheme = (themeName: keyof typeof themes) => {
    const theme = themes[themeName];
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    setCurrentTheme(themeName);
  };

  useEffect(() => {
    applyTheme(currentTheme as keyof typeof themes);
  }, []);

  const cycleTheme = () => {
    const themeNames = Object.keys(themes);
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    const nextTheme = themeNames[nextIndex] as keyof typeof themes;
    applyTheme(nextTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 right-4 rounded-full w-12 h-12"
      onClick={cycleTheme}
    >
      <Paintbrush className="h-5 w-5" />
    </Button>
  );
};