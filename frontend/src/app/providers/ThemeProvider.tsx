import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { PropsWithChildren } from "react";

type ThemeProviderProps = PropsWithChildren<{
  defaultTheme?: "light" | "dark" | "system";
}>;

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme} enableSystem>
      {children}
    </NextThemesProvider>
  );
}

