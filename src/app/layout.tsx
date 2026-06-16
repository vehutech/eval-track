import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/src/app/globals.css";
import { ThemeProvider } from "@/src/components/shared/theme-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "EvalTrack — Teaching Effectiveness Evaluation",
  description: "Institutional teaching evaluation system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.variable}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
