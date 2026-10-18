import type { ReactNode } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Toaster from "./ui/Toaster";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <title>Storefront</title>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {/* the footer stays at the bottom on short pages */}
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
