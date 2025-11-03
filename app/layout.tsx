import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEURAL//ORDER — AI Trading Arena",
  description:
    "Next generation AI trading showcase. Live autonomous agents, real-time performance data, and the future of algorithmic trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
      </body>
    </html>
  );
}

