"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { updateOrganizationSettings } from "@/lib/actions/organizations";
import { useAppStore } from "@/store/appStore";
import type { OrgType } from "@prisma/client";

const ORG_TYPES: OrgType[] = ["UNIVERSITY", "HUB", "SCHOOL", "OTHER"];

export function OrgSettingsPanel({
  orgSlug,
  actorUserId,
  isOrgAdmin,
  initial,
}: {
  orgSlug: string;
  actorUserId: string;
  isOrgAdmin: boolean;
  initial: { name: string; logoUrl: string | null; type: OrgType };
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initial.name);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [type, setType] = useState(initial.type);

  const save = () => {
    startTransition(async () => {
      const res = await updateOrganizationSettings(actorUserId, orgSlug, {
        name,
        logoUrl: logoUrl || null,
        type,
      });
      if (res.success) {
        showToast("Settings saved", "success");
        router.refresh();
      } else showToast(res.error ?? "Failed", "error");
    });
  };

  if (!isOrgAdmin) {
    return (
      <Card className="p-6 text-sm text-gray-500">
        Only organization admins can edit settings.
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Organization Settings</h1>
      <Card className="space-y-4 max-w-lg mb-8 p-4">
        <Input label="Organization name" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="block text-sm">
          <span className="font-medium">Type</span>
          <select
            className="mt-1 block w-full rounded-lg border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as OrgType)}
          >
            {ORG_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.toLowerCase().replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <ImageUploadField label="Organization logo" value={logoUrl} onChange={setLogoUrl} />
        <Button disabled={isPending} onClick={save}>
          Save
        </Button>
      </Card>

      <Card className="max-w-lg space-y-3 p-4">
        <h2 className="font-semibold">Single sign-on (SSO)</h2>
        <p className="text-sm text-gray-500">
          Enterprise SSO (SAML/OAuth) is planned for a future release. Contact platform admin to
          configure identity federation for your organization.
        </p>
      </Card>
    </div>
  );
}
