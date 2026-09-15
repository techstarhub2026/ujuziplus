"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { factoryResetPlatform, RESET_PHRASE } from "@/lib/actions/factory-reset";

/**
 * Factory reset, behind three deliberate obstacles: the panel is collapsed
 * until asked for, the operator re-enters their password, and they type an
 * exact phrase. Nothing here can be triggered by a stray click.
 */
export function FactoryResetSetting() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const phraseMatches = confirmation.trim() === RESET_PHRASE;
  const canSubmit = phraseMatches && password.length > 0 && !isPending;

  const run = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await factoryResetPlatform({ password, confirmation });
      if (res.success) {
        setPassword("");
        setConfirmation("");
        setOpen(false);
        setMessage({ ok: true, text: `Platform reset — ${res.data.deleted} records removed.` });
      } else {
        setMessage({ ok: false, text: res.error });
      }
    });
  };

  if (!open) {
    return (
      <div>
        <p className="text-xs text-gray-500">
          Permanently deletes all courses, kits, projects, orders, discussions, programs,
          competitions and mentorship records. User accounts and platform settings are kept.
          This cannot be undone.
        </p>
        {message && (
          <p className={`mt-2 text-xs ${message.ok ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => {
            setMessage(null);
            setOpen(true);
          }}
        >
          Reset platform…
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/60 p-4">
      <div className="flex gap-2 text-sm font-semibold text-red-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        This permanently deletes all content
      </div>

      <p className="text-xs text-red-700/90">
        Courses, kits, projects, orders, discussions, programs, competitions and mentorship
        records will be erased. There is no backup and no undo. Accounts stay.
      </p>

      <div>
        <label className="text-xs font-medium text-gray-700">Your password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700">
          Type <span className="font-mono text-red-700">{RESET_PHRASE}</span> to confirm
        </label>
        <input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm"
          placeholder={RESET_PHRASE}
        />
      </div>

      {message && !message.ok && <p className="text-xs text-red-600">{message.text}</p>}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-700"
          disabled={!canSubmit}
          onClick={run}
        >
          {isPending ? "Erasing…" : "Erase all content"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => {
            setOpen(false);
            setPassword("");
            setConfirmation("");
            setMessage(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
