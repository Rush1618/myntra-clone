import { ScrollViewStyleReset } from "expo-router/html";
import React from "react";

/**
 * +html.tsx — Custom HTML shell for Expo web static export.
 *
 * On desktop (≥ 768 px) this injects CSS that centres the app inside
 * a phone-shaped frame so it looks like a real Android / iOS app
 * rather than a stretched website.  On mobile the styles are a no-op
 * and the app fills the screen as usual.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* Expo scroll-reset — prevents body from expanding beyond viewport */}
        <ScrollViewStyleReset />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* ── Base reset ── */
              *, *::before, *::after { box-sizing: border-box; }

              html, body {
                margin: 0;
                padding: 0;
                height: 100%;
              }

              /* ── Desktop: phone-frame shell ── */
              @media (min-width: 768px) {
                body {
                  background: radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d0d 100%);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  padding: 24px;
                }

                /* The root div Expo mounts into */
                #root {
                  width: 393px;          /* iPhone 14 Pro width — feels native */
                  height: 852px;         /* iPhone 14 Pro height               */
                  max-height: calc(100vh - 48px);
                  border-radius: 48px;
                  overflow: hidden;
                  position: relative;

                  /* Glossy phone bezel */
                  box-shadow:
                    0 0 0 1px rgba(255,255,255,0.08),
                    0 0 0 10px #111,
                    0 0 0 11px rgba(255,255,255,0.06),
                    0 40px 100px rgba(0,0,0,0.9),
                    0 10px 30px rgba(0,0,0,0.6);
                }

                /* Fake top notch bar for realism */
                #root::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 126px;
                  height: 34px;
                  background: #000;
                  border-radius: 0 0 20px 20px;
                  z-index: 9999;
                  pointer-events: none;
                }
              }

              /* ── Mobile: full screen, no frame ── */
              @media (max-width: 767px) {
                #root {
                  width: 100%;
                  height: 100%;
                  border-radius: 0;
                  box-shadow: none;
                }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
