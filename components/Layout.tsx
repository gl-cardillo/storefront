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
        <meta
          name="description"
          key="description"
          content="Storefront is a demo online shop built with Next.js, React and MongoDB. Browse products, read reviews and fill a basket."
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {/* the footer stays at the bottom on short pages */}
      <div className="flex min-h-screen flex-col">
        <p className="bg-foreground px-4 py-2 text-center text-xs text-surface">
          Demo portfolio project, not a real store. Don&apos;t enter real
          passwords or payment details.
        </p>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
