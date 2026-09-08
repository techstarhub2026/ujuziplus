"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updatePrivacySettings, type UserPrivacyData } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { PageHeader } from "@/components/shared/PageHeader";

export function PrivacySettingsForm({
  userId,
  initial,
}: {
  userId: string;
  initial: UserPrivacyData;
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function setPref<K extends keyof UserPrivacyData>(key: K, value: UserPrivacyData[K]) {
    setPrefs((current) => ({ ...current, [key]: value }));
    setSuccess(false);
  }

  async function handleSave() {
    setLoading(true);
    setSuccess(false);
    setError("");

    const result = await updatePrivacySettings(userId, prefs);

    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Privacy"
        description="Control what others see on your public profile."
      />
      <Card className="max-w-lg space-y-4" padding="md">
        {error && <FormAlert variant="error">{error}</FormAlert>}
        {success && <FormAlert variant="success">Privacy settings saved.</FormAlert>}

        <label className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Public profile</span>
          <input
            type="checkbox"
            checked={prefs.publicProfile}
            onChange={(e) => setPref("publicProfile", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/30"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Show enrolled courses on profile</span>
          <input
            type="checkbox"
            checked={prefs.showCoursesOnProfile}
            onChange={(e) => setPref("showCoursesOnProfile", e.target.checked)}
            disabled={!prefs.publicProfile}
            className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/30 disabled:opacity-40"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Show certificates on profile</span>
          <input
            type="checkbox"
            checked={prefs.showCertificatesOnProfile}
            onChange={(e) => setPref("showCertificatesOnProfile", e.target.checked)}
            disabled={!prefs.publicProfile}
            className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/30 disabled:opacity-40"
          />
        </label>

        <p className="text-xs text-gray-500">
          When public profile is off, your profile page is hidden from other users.
        </p>

        <Button onClick={handleSave} disabled={loading} className="mt-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save privacy settings"
          )}
        </Button>
      </Card>
    </div>
  );
}
