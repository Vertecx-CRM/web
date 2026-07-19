"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type GoogleAdProps = {
  className?: string;
  slot?: string;
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SMALL;

export default function GoogleAd({ className = "", slot = DEFAULT_SLOT }: GoogleAdProps) {
  const canRender = Boolean(ADSENSE_CLIENT && slot);

  useEffect(() => {
    if (!canRender) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ad blockers and pending AdSense approval can make this fail in the browser.
    }
  }, [canRender, slot]);

  if (!canRender) return null;

  return (
    <div className={`mx-auto w-full max-w-5xl px-4 ${className}`}>
      <ins
        className="adsbygoogle block min-h-[90px] overflow-hidden rounded-md border border-gray-200 bg-white"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}
