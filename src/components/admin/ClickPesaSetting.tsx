"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateClickPesaCredentials } from "@/lib/actions/platform-settings";

/**
 * ClickPesa API keys, editable from the console so they can be rotated without
 * a redeploy. Saved values are never sent back to the browser — the fields
 * start empty and show whether a key is currently stored instead.
 */
export function ClickPesaSetting({
  hasClientId,
  hasApiKey,
  hasWebhookSecret,
}: {
  hasClientId: boolean;
  hasApiKey: boolean;
  hasWebhookSecret: boolean;
}) {
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateClickPesaCredentials({ clientId, apiKey, webhookSecret });
      if (res.success) {
        setClientId("");
        setApiKey("");
        setWebhookSecret("");
        setMessage({ ok: true, text: "Saved. New keys apply to the next payment." });
      } else {
        setMessage({ ok: false, text: res.error });
      }
    });
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    stored: boolean,
    hint: string
  ) => (
    <div>
      <label className="flex items-center justify-between text-xs font-medium text-gray-600">
        {label}
        <span className={stored ? "text-green-600" : "text-gray-400"}>
          {stored ? "stored" : "not set"}
        </span>
      </label>
      <input
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={stored ? "•••••••• — leave blank to keep" : hint}
        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-3">
      {field("Client ID", clientId, setClientId, hasClientId, "From your ClickPesa dashboard")}
      {field("API key", apiKey, setApiKey, hasApiKey, "From your ClickPesa dashboard")}
      {field(
        "Webhook secret (optional)",
        webhookSecret,
        setWebhookSecret,
        hasWebhookSecret,
        "Used to verify payment callbacks"
      )}

      {message && (
        <p className={`text-xs ${message.ok ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <Button size="sm" onClick={save} disabled={isPending}>
        {isPending ? "Saving…" : "Save credentials"}
      </Button>
    </div>
  );
}
