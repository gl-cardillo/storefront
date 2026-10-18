import type { ReactNode } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import Toaster from "./ui/Toaster";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <title>Storefront</title>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Navbar />
      {/* matches the fixed navbar height, it has a second row on phones */}
      <main className="pt-27 md:pt-16">{children}</main>
      <Toaster />
    </>
  );
}
