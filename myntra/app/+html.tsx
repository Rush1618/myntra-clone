import { ScrollViewStyleReset } from "expo-router/html";
import React from "react";

/**
 * +html.tsx — Custom HTML shell for Expo web static export.
 * Full responsive layout — no phone frame. Content adapts via breakpoints.
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
        <title>Myntra — Fashion & Lifestyle</title>
        <meta name="description" content="Shop fashion, clothing, shoes & accessories online on Myntra." />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after { box-sizing: border-box; }
              html, body, #root {
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                -webkit-font-smoothing: antialiased;
              }
              /* Scrollbar styling for desktop */
              ::-webkit-scrollbar { width: 6px; height: 6px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 3px; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
