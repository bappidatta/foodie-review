import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { UtensilsCrossed } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foodie Review — Share Your Food Adventures",
  description: "Upload photos, videos, and reviews of your favorite food experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="mt-auto border-t border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto max-w-6xl px-4 py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UtensilsCrossed className="size-4 text-primary" />
                  Foodie Review
                </div>
                <p className="text-xs text-muted-foreground">
                  Share your food adventures with the world.
                </p>
                <p className="text-xs text-muted-foreground/60">
                  &copy; {new Date().getFullYear()} Foodie Review. Made with love for food lovers.
                </p>
              </div>
            </div>
          </footer>
          <Toaster richColors closeButton position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
