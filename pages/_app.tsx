import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clearToken, readToken } from "../utils/storage";
import { useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { Inter } from "next/font/google";

// self-hosted at build time, no request to google fonts
const inter = Inter({ subsets: ["latin"] });

// attach the saved token to every request
if (typeof window !== "undefined") {
  axios.interceptors.request.use((config) => {
    const token = readToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  // an expired or old token logs the user out
  axios.interceptors.response.use(undefined, (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      readToken()
    ) {
      clearToken();
      // full reload so no logged-in state survives
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/signin");
    }
    return Promise.reject(error);
  });
}

// client errors won't succeed on a retry, server errors might
const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < 2 &&
  !(axios.isAxiosError(error) && (error.response?.status ?? 500) < 500);

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>
      <SkeletonTheme
        baseColor="var(--color-muted)"
        highlightColor="var(--color-border)"
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SkeletonTheme>
    </QueryClientProvider>
  );
}
