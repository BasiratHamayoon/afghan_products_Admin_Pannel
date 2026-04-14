"use client";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import StoreProvider from "@/store/StoreProvider";
import { Toaster } from "react-hot-toast";

export default function ClientProviders({ children }) {
  return (
    <StoreProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange={false}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: "500",
            },
          }}
        />
      </ThemeProvider>
    </StoreProvider>
  );
}