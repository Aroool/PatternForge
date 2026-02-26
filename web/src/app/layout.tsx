import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PatternForge",
  description: "Learn DSA patterns visually",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Background glow layer */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-white/8 blur-3xl opacity-40" />
          <div className="absolute top-[30%] left-[12%] h-[420px] w-[420px] rounded-full bg-white/6 blur-3xl opacity-30" />
          <div className="absolute bottom-[-120px] right-[8%] h-[520px] w-[520px] rounded-full bg-white/6 blur-3xl opacity-25" />
        </div>

        {children}
      </body>
    </html>
  );
}