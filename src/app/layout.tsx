import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProviderWithClerk from "@/components/ConvexProviderWithClerk";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://justforum.com"),
  title: "JustForum - 한국어 커뮤니티 포럼",
  description: "질문과 피드백을 나누는 한국어 커뮤니티 포럼입니다. 개발자와 사용자들이 소통하며 지식을 공유하는 공간입니다.",
  keywords: "포럼, 커뮤니티, 질문, 피드백, 개발, 한국어, 토론, Q&A",
  authors: [{ name: "JustForum Team" }],
  
  // Open Graph
  openGraph: {
    title: "JustForum - 한국어 커뮤니티 포럼",
    description: "질문과 피드백을 나누는 한국어 커뮤니티 포럼입니다. 개발자와 사용자들이 소통하며 지식을 공유하는 공간입니다.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://justforum.com",
    siteName: "JustForum",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JustForum - 한국어 커뮤니티 포럼",
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "JustForum - 한국어 커뮤니티 포럼",
    description: "질문과 피드백을 나누는 한국어 커뮤니티 포럼입니다.",
    images: ["/og-image.jpg"],
  },

  // Alternative languages
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://justforum.com",
    languages: {
      'ko-KR': process.env.NEXT_PUBLIC_SITE_URL || "https://justforum.com",
      'ko': process.env.NEXT_PUBLIC_SITE_URL || "https://justforum.com",
    },
  },

  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // App specific
  applicationName: "JustForum",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  
  // Format detection
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      "naver-site-verification": process.env.NAVER_SITE_VERIFICATION || "",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ConvexClientProviderWithClerk>
            <Header />
            <main className="pt-16">{children}</main>
          </ConvexClientProviderWithClerk>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
