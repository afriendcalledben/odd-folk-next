import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import Script from "next/script";
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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${inter.variable} antialiased`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-80Z35DQBCK" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-80Z35DQBCK');
        `}</Script>
        <AuthProvider>
          {children}
          <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'var(--font-inter)', borderRadius: '12px' } }} />
        </AuthProvider>
      </body>
    </html>
  );
}
