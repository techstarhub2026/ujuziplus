"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InsertLinkDialog({
  open,
  onClose,
  onInsert,
  defaultLabel = "",
  defaultUrl = "",
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (label: string, url: string) => void;
  defaultLabel?: string;
  defaultUrl?: string;
}) {
  const [label, setLabel] = useState(defaultLabel);
  const [url, setUrl] = useState(defaultUrl);
  const [urlError, setUrlError] = useState("");
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLabel(defaultLabel);
    setUrl(defaultUrl);
    setUrlError("");
    const t = window.setTimeout(() => urlRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, defaultLabel, defaultUrl]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setUrlError("URL is required.");
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
      setUrlError("Use a full URL starting with https:// or http://");
      return;
    }
    onInsert(label.trim() || trimmedUrl, trimmedUrl);
    onClose();
  }

  return (
    <div className="insert-link-dialog" role="presentation">
      <button
        type="button"
        className="insert-link-dialog__backdrop"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="insert-link-title"
        className="insert-link-dialog__panel"
      >
        <div className="insert-link-dialog__head">
          <div className="flex items-center gap-2">
            <span className="insert-link-dialog__icon">
              <Link2 className="h-4 w-4" />
            </span>
            <h2 id="insert-link-title" className="insert-link-dialog__title">
              Insert link
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="insert-link-dialog__close"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="insert-link-dialog__form">
          <div>
            <label htmlFor="insert-link-url" className="insert-link-dialog__label">
              URL
            </label>
            <div className="relative">
              <ExternalLink className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={urlRef}
                id="insert-link-url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError("");
                }}
                placeholder="https://github.com/your-repo"
                className="insert-link-dialog__input insert-link-dialog__input--with-icon"
                autoComplete="url"
              />
            </div>
            {urlError && <p className="insert-link-dialog__error">{urlError}</p>}
          </div>

          <div>
            <label htmlFor="insert-link-label" className="insert-link-dialog__label">
              Link text <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="insert-link-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. My GitHub repo, Article, Demo site"
              className="insert-link-dialog__input"
            />
            <p className="insert-link-dialog__hint">
              Highlight text in your post first to pre-fill this field.
            </p>
          </div>

          <div className="insert-link-dialog__actions">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Insert link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
