import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { PropsWithChildren, useMemo } from "react";
import NavBar from "./NavBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { chesspointTheme, chesspointDarkTheme } from "@/theme/chesspointTheme";
import MusicPlayer from "@/components/MusicPlayer";
import UniverseChessBackground from "@/components/background/UniverseChessBackground";

export default function Layout({ children }: PropsWithChildren) {
  const [isDarkMode, setDarkMode] = useLocalStorage("useDarkMode", true);

  const theme = useMemo(
    () => createTheme(isDarkMode !== false ? chesspointDarkTheme : chesspointTheme),
    [isDarkMode]
  );

  // Use default dark mode if localStorage value is null (still loading)
  const effectiveDarkMode = isDarkMode !== null ? isDarkMode : true;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UniverseChessBackground />
      <div className={effectiveDarkMode ? 'dark-mode' : ''}>
        <NavBar
          darkMode={effectiveDarkMode}
          switchDarkMode={() => setDarkMode((val) => !val)}
        />
        <main style={{ 
          margin: "2vh 1vw", 
          paddingTop: "64px",
          minHeight: "calc(100vh - 64px)",
          background: 'transparent',
          color: effectiveDarkMode ? '#FFFFFF' : '#1B1B1F'
        }}>
          {children}
        </main>
        <MusicPlayer />
      </div>
    </ThemeProvider>
  );
}
