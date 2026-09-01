"use client";

import { useEffect, useState } from "react";

/**
 * Hands control back to the Expo app after 3-D Secure.
 *
 * `WebBrowser.openAuthSessionAsync` resolves as soon as the browser navigates
 * to the app's scheme, so this normally closes itself within a moment. The
 * button is the fallback for browsers that block a scripted scheme navigation.
 */
export const NativeHandoff = ({ deepLink }: { deepLink: string }) => {
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    window.location.replace(deepLink);
    const timer = setTimeout(() => setStalled(true), 1500);
    return () => clearTimeout(timer);
  }, [deepLink]);

  return (
    <a
      href={deepLink}
      className="font-semibold text-clay hover:underline"
      style={{ opacity: stalled ? 1 : 0, transition: "opacity 200ms" }}
    >
      Return to the app
    </a>
  );
};
