import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@/styles/globals.css";
import { AppProps } from "next/app";
import Layout from "@/sections/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MusicPlayer from "@/components/MusicPlayer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Provider as JotaiProvider } from "jotai";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <MusicPlayer />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
