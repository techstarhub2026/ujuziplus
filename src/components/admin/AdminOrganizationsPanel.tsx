"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  adminCreateOrganization,
  adminUpdateOrganization,
  adminDeleteOrganization,
  createOrgAdminCredentials,
} from "@/lib/actions/organizations";
import { useAppStore } from "@/store/appStore";
import type { OrgType } from "@prisma/client";

type OrgRow = {
  id: string;
  slug: string;
  name: string;
  type: OrgType;
  memberCount: number;
  isVerified: boolean;
  logoUrl: string | null;
  _count: { members: number; kitRequests: number; courses: number };
};

const ORG_TYPES: OrgType[] = ["UNIVERSITY", "HUB", "SCHOOL", "OTHER"];

function OrgAdminCreator({ orgId, orgName }: { orgId: string; orgName: string }) {
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const create = () => {
    if (!fullName.trim() || !email.trim()) return;
    startTransition(async () => {
      const res = await createOrgAdminCredentials(orgId, { fullName, email });
      if (res.success) {
        showToast(`Admin credentials sent to ${email}`, "success");
        setOpen(false);
        setFullName("");
        setEmail("");
        router.refresh();
      } else showToast(res.error ?? "Failed", "error");
    });
  };

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        <UserPlus className="h-3.5 w-3.5 mr-1" />
        Add portal admin
        {open ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
      </Button>
      {open && (
        <Card className="mt-2 p-4 space-y-3 border-brand/30 bg-brand/5">
          <p className="text-xs font-semibold text-brand uppercase tracking-wide">
            Create portal admin for {orgName}
          </p>
          <p className="text-xs text-gray-500">
            A new account will be created with ORG_ADMIN role and login credentials will be emailed.
          </p>
          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
          />
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@organisation.ac.tz"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={isPending || !fullName.trim() || !email.trim()}
              onClick={create}
            >
              {isPending ? "Creating…" : "Create & send credentials"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export function AdminOrganizationsPanel({ organizations }: { organizations: OrgRow[] }) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<OrgType>("UNIVERSITY");

  const create = () => {
    startTransition(async () => {
      const res = await adminCreateOrganization({ name, slug, type });
      if (res.success) {
        showToast("Organization created", "success");
        setShowForm(false);
        setName("");
        setSlug("");
        router.refresh();
      } else showToast(res.error ?? "Failed", "error");
    });
  };

  const toggleVerified = (org: OrgRow) => {
    startTransition(async () => {
      const res = await adminUpdateOrganization(org.id, { isVerified: !org.isVerified });
      if (res.success) router.refresh();
      else showToast(res.error ?? "Failed", "error");
    });
  };

  const deleteOrg = (org: OrgRow) => {
    const message =
      org._count.members > 0
        ? `"${org.name}" has ${org._count.members} member${org._count.members !== 1 ? "s" : ""}. Deleting it will remove their organization membership and all kit inventory/requests. This cannot be undone. Continue?`
        : `Delete "${org.name}" permanently? This cannot be undone.`;
    if (!confirm(message)) return;
    startTransition(async () => {
      const res = await adminDeleteOrganization(org.id);
      if (res.success) { showToast("Organization deleted", "success"); router.refresh(); }
      else showToast(res.error ?? "Delete failed", "error");
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-sm text-gray-500">
            Schools, universities, and partner hubs on the platform
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>Add organization</Button>
      </div>

      {showForm && (
        <Card className="mb-6 p-4 space-y-3 max-w-lg">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="techstar-university"
          />
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
          <Button disabled={isPending || !name.trim() || !slug.trim()} onClick={create}>
            Create
          </Button>
        </Card>
      )}

      {organizations.length === 0 ? (
        <Card className="py-12 text-center text-sm text-gray-400">No organizations yet.</Card>
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => (
            <Card key={org.id} className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{org.name}</h3>
                    <Badge variant="outline" className="capitalize">
                      {org.type.toLowerCase()}
                    </Badge>
                    {org.isVerified && <Badge variant="success">Verified</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                    <span>/org/{org.slug}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />{org._count.members} members
                    </span>
                    <span>{org._count.courses} courses</span>
                    <span>{org._count.kitRequests} kit requests</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/org/${org.slug}/dashboard`}>Portal</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/org/${org.slug}/programs`}>Programs</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => toggleVerified(org)}
                  >
                    {org.isVerified ? "Unverify" : "Verify"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isPending}
                    onClick={() => deleteOrg(org)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {/* Org admin creation inline */}
              <OrgAdminCreator orgId={org.id} orgName={org.name} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
