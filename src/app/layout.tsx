import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-archivo-black",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Odd Folk - Rent Props & Event Items",
  description: "A peer-to-peer marketplace for renting props, event furniture, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'var(--font-inter)', borderRadius: '12px' } }} />
        </AuthProvider>
      </body>
    </html>
  );
}
