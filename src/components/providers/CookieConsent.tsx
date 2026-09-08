"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent";

type StoredConsent = {
  analytics: boolean;
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const save = (prefs: StoredConsent) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setVisible(false);
    setCustomizing(false);
  };

  const acceptAll = () => save({ analytics: true });
  const savePreferences = () => save({ analytics });

  if (!visible) return null;

  if (customizing) {
    return (
      <div className="cookie-consent cookie-consent--customize" role="dialog" aria-label="Customize cookies">
        <div className="cookie-consent__icon">
          <Cookie className="h-5 w-5" />
        </div>
        <div className="cookie-consent__body">
          <p className="cookie-consent__text cookie-consent__text--title">Customize cookies</p>
          <div className="cookie-consent__option">
            <span className="cookie-consent__option-label">Essential</span>
            <span className="cookie-consent__option-hint">Always on — required to keep you signed in.</span>
          </div>
          <label className="cookie-consent__option cookie-consent__option--toggle">
            <span>
              <span className="cookie-consent__option-label">Analytics &amp; preferences</span>
              <span className="cookie-consent__option-hint">Helps us understand usage and improve the platform.</span>
            </span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
          </label>
          <p className="cookie-consent__text">
            See our{" "}
            <Link href="/privacy" className="cookie-consent__link">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="cookie-consent__actions">
          <Button size="sm" variant="outline" onClick={() => setCustomizing(false)}>
            Back
          </Button>
          <Button size="sm" onClick={savePreferences}>
            Save preferences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cookie-consent" role="dialog" aria-label="Cookie consent">
      <div className="cookie-consent__icon">
        <Cookie className="h-5 w-5" />
      </div>
      <div className="cookie-consent__body">
        <p className="cookie-consent__text">
          We use cookies to keep you signed in and improve your experience. See our{" "}
          <Link href="/privacy" className="cookie-consent__link">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <div className="cookie-consent__actions">
        <Button size="sm" variant="outline" onClick={() => setCustomizing(true)}>
          Customize
        </Button>
        <Button size="sm" onClick={acceptAll}>
          Accept all cookies
        </Button>
      </div>
    </div>
  );
}
