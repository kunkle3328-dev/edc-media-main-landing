import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EDC Media Landing Engine",
  description: "AI-powered conversion-focused landing page creation system and digital revenue platform for EDC Media.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07090E",
  colorScheme: "dark",
};

import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#07090E] text-white">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // 1. Uncaught script exceptions for ChunkLoadError
                window.addEventListener('error', function(e) {
                  if (e && e.message && (e.message.indexOf('ChunkLoadError') !== -1 || e.message.indexOf('Loading chunk') !== -1)) {
                    console.warn('[EDC Media] Recovering from stale chunk runtime error...');
                    triggerRecoveryReload();
                  }
                });

                // 2. Resource-level 404s for .js / .css chunk elements (useCapture = true)
                window.addEventListener('error', function(e) {
                  var target = e.target;
                  if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
                    var src = target.src || target.href || '';
                    if (src.indexOf('chunks') !== -1 || src.indexOf('_next/static') !== -1) {
                      console.warn('[EDC Media] Intercepted chunk asset 404 resource error:', src);
                      triggerRecoveryReload();
                    }
                  }
                }, true);

                function triggerRecoveryReload() {
                  try {
                    var lastReload = sessionStorage.getItem('edc_last_chunk_reload');
                    var now = Date.now();
                    if (!lastReload || (now - parseInt(lastReload, 10)) > 8000) {
                      sessionStorage.setItem('edc_last_chunk_reload', String(now));
                      window.location.reload();
                    }
                  } catch (err) {
                    window.location.reload();
                  }
                }

                // Passive touchstart to immediately register active click states in mobile Safari/Chrome iframes
                document.addEventListener('touchstart', function() {}, { passive: true });
              }
            `,
          }}
        />
      </head>
      <body className="bg-[#07090E] text-white antialiased min-h-screen selection:bg-[#00E5FF] selection:text-[#07090E]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
