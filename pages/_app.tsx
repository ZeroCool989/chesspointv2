import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@/styles/globals.css";
import { AppProps } from "next/app";
import Layout from "@/sections/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/lib/i18n";
import { useEffect } from "react";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  // Suppress harmless HMR development warnings (temporarily disabled to debug)
  // Re-enable after fixing rendering issue
  // useEffect(() => {
  //   // ... console filter code ...
  // }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </QueryClientProvider>
  );
}
