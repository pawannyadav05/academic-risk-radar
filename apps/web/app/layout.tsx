import React from "react";
import { getSession } from "@/lib/auth";
import { GlobalHeader } from "./components/GlobalHeader";
import "./tokens.css";

export const metadata = {
  title: "Academic Risk Radar",
  description: "Academic Early-Warning and Mentoring Intervention Platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('arr_theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-family)", margin: 0, padding: 0, background: "var(--bg)", color: "var(--text)" }}>
        {session ? (
          <>
            <GlobalHeader session={session} />
            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 24px", boxSizing: "border-box" }}>
              {children}
            </main>
          </>
        ) : (
          <main style={{ minHeight: "100vh" }}>{children}</main>
        )}
      </body>
    </html>
  );
}
