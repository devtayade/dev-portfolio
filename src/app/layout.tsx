import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import CustomCursor from "@/components/ui/CustomCursor";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yourportfolio.com"),
  title: {
    default: "Product Designer Portfolio",
    template: "%s | Product Designer",
  },
  description:
    "Product Designer crafting intelligent, human-centered experiences at the intersection of AI and design.",
  keywords: [
    "Product Designer",
    "AI Design",
    "UX Design",
    "Portfolio",
    "Human-AI Interaction",
    "Design Systems",
  ],
  authors: [{ name: "Product Designer" }],
  openGraph: {
    title: "Product Designer Portfolio",
    description:
      "Product Designer crafting intelligent, human-centered experiences at the intersection of AI and design.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Designer Portfolio",
    description:
      "Crafting intelligent, human-centered experiences at the intersection of AI and design.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <CustomCursor />
          <Navbar />
          <PageTransition>
            <div id="main-content">{children}</div>
          </PageTransition>
          <Footer />
      </body>
    </html>
  );
}
