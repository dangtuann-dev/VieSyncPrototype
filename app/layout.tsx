import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from 'next/script';

const fontDisplay = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const fontBody = DM_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "VieSync — Xóa bỏ khoảng cách, Đột phá kỹ năng",
  description: "Nền tảng học tập Blended Learning kết hợp video số và học trực tuyến tương tác",
};

import { LanguageProvider } from "@/context/LanguageContext"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className={`${fontDisplay.variable} ${fontBody.variable} antialiased`}>
        <LanguageProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(37,99,235,0.12)',
                fontFamily: 'var(--font-body)',
              }
            }}
          />
          {/* Dùng Next.js Script để xóa Vercel Toolbar một cách an toàn */}
          <Script id="hide-vercel-toolbar" strategy="afterInteractive">
            {`
              (function() {
                const hideToolbar = () => {
                  const toolbar = document.querySelector('vercel-live-feedback') || 
                                  document.querySelector('#vercel-live-feedback') ||
                                  document.querySelector('[data-vercel-toolbar]');
                  if (toolbar) {
                    toolbar.style.display = 'none';
                    toolbar.remove();
                  }
                };
                setInterval(hideToolbar, 1000);
                window.addEventListener('load', hideToolbar);
              })();
            `}
          </Script>
        </LanguageProvider>
      </body>
    </html>
  );
}
