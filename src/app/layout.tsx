import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingSupport from "@/components/FloatingSupport";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  verification: {
    google: "R8F6UkNMybScXYaszR0NuWk1lbzGOo_vmIkOVuKzEa4",
  },
  title: "DialyStock | Gestión Médica Inteligente & Eco-Eficiente",
  description: "Optimiza tu clínica de diálisis con tecnología sostenible. Reducimos el uso de papel y mejoramos la eficiencia operativa en hemodiálisis y diálisis peritoneal. Gestión de inventarios para una salud más verde.",
  keywords: ["gestión de inventarios médicos", "diálisis eco-eficiente", "ahorro de papel clínicas", "hemodiálisis", "diálisis peritoneal", "salud sostenible", "software médico Colombia", "automatización clínica"],
  authors: [{ name: "Manuel Madrid", url: "https://madfer93.github.io/Perfil-comercial-Manuel/" }],
  openGraph: {
    title: "DialyStock | El Futuro de la Gestión Médica",
    description: "Sistemas avanzados para clínicas de diálisis. Mejora la atención al paciente mientras cuidas el planeta reduciendo desperdicios.",
    url: "https://dialystock.vercel.app/",
    siteName: "DialyStock",
    images: [
      {
        url: "/logo-dialystock.png",
        width: 1200,
        height: 630,
        alt: "DialyStock Logo - Gestión Sostenible",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DialyStock | Tecnología Médica Sostenible",
    description: "Evolución en sistemas de salud: Gestión de inventarios eco-eficiente para diálisis.",
    images: ["/logo-dialystock.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <FloatingSupport />
      </body>
    </html>
  );
}
