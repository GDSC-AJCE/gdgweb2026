import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import GoogleLabsPreloader from "@/components/GoogleLabsPreloader";
import { AuthProvider } from "@/context/AuthContext";
import { DialogProvider } from "@/context/DialogContext";
import { ThemeProvider } from "@/context/ThemeContext";
import CustomDialog from "@/components/CustomDialog";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gdgajce.vercel.app"),
  title: {
    template: "%s | GDG AJCE",
    default: "GDG AJCE | Google Developer Groups on Campus",
  },
  description: "Official GDG on Campus platform for Amal Jyothi College of Engineering. Empowering students with cutting-edge Google technologies (AI/ML, Gemini, Cloud, Android, Web, and Open Source).",
  keywords: ["GDG AJCE", "GDG on Campus AJCE", "Google Developer Groups", "Amal Jyothi College of Engineering", "Flutter", "Android", "Gemini", "Firebase", "Google Cloud", "Tech Community", "Hackathons"],
  authors: [{ name: "GDG AJCE Core Team" }],
  creator: "GDG AJCE",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "256x256", type: "image/png" },
      { url: "/icon.png", sizes: "256x256", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "256x256", type: "image/png" },
      { url: "/apple-icon.png", sizes: "256x256", type: "image/png" },
    ],
  },
  openGraph: {
    title: "GDG AJCE — Google Developer Groups on Campus",
    description: "Empowering students with cutting-edge Google technologies (AI/ML, Gemini, Cloud, Android, Web, and Open Source).",
    url: "https://gdgajce.vercel.app",
    siteName: "GDG AJCE",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GDG AJCE — Google Developer Groups on Campus",
    description: "Empowering students with cutting-edge Google technologies (AI/ML, Gemini, Cloud, Android, Web, and Open Source).",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try { localStorage.removeItem('gdg_theme'); document.documentElement.classList.remove('dark'); document.documentElement.classList.add('light'); document.documentElement.setAttribute('data-theme', 'light'); } catch(e) {}`,
          }}
        />
      </head>
      <body className={`${inter.className} ${robotoMono.variable} bg-[#f5f1e4] text-[#2c2e2a] antialiased min-h-screen flex flex-col selection:bg-[#8ed462]/35 selection:text-[#2c2e2a]`}>
        <SmoothScrollProvider>
          <GoogleLabsPreloader />
          <ThemeProvider>
            <AuthProvider>
              <DialogProvider>
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </DialogProvider>
            </AuthProvider>
          </ThemeProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
