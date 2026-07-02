"use client";

import { ReactNode } from "react";
import { GoogleReCaptchaProvider } from "@google-recaptcha/react";

interface RecaptchaProviderProps {
  children: ReactNode;
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // If site key is not configured, bypass reCAPTCHA provider and render children directly
  if (!siteKey) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      type="v3"
      siteKey={siteKey}
      language="th"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
