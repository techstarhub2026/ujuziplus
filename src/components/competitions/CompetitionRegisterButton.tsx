"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerForCompetition } from "@/lib/actions/competitions";
import { useAppStore } from "@/store/appStore";
import { useRouter } from "next/navigation";

/**
 * Countries running qualifiers. An entry with no country cannot be placed in
 * a national bracket, which is why this is a required choice rather than free
 * text someone can spell six different ways.
 */
const COUNTRIES = ["Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi", "Other"];

/**
 * Competition entry.
 *
 * This was a single optional "Team name" box beside a Register button, so
 * organisers received entries carrying no country, no school and no members —
 * everything then chased by email. The form collects it up front, and opens
 * only when the entrant chooses to register so the card stays compact.
 */
export function CompetitionRegisterButton({
  userId,
  competitionSlug,
  isRegistered,
  open,
}: {
  userId: string;
  competitionSlug: string;
  isRegistered: boolean;
  open: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [country, setCountry] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [memberNames, setMemberNames] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();

  if (!open) {
    return (
      <Button size="sm" variant="secondary" disabled>
        {isRegistered ? "Team registered" : "Registration closed"}
      </Button>
    );
  }

  if (isRegistered) {
    return (
      <Button size="sm" variant="secondary" disabled>
        Registered
      </Button>
    );
  }

  if (!showForm) {
    return (
      <Button size="sm" onClick={() => setShowForm(true)}>
        Register team
      </Button>
    );
  }

  const canSubmit = teamName.trim().length > 0 && country.length > 0 && !isPending;

  const submit = () => {
    startTransition(async () => {
      const res = await registerForCompetition(userId, competitionSlug, {
        teamName,
        country,
        schoolName,
        memberCount: memberCount ? Number(memberCount) : undefined,
        memberNames,
        ageRange,
        contactPhone,
      });
      if (res.success) {
        showToast("Team registered!", "success");
        setShowForm(false);
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-navy">Register your team</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Team name *"
          placeholder="Innovators TZ"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Country *</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm shadow-sm focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="">Select a country…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="School or club"
          placeholder="Dar es Salaam Secondary School"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        />

        <Input
          label="Number of members"
          type="number"
          min={1}
          placeholder="4"
          value={memberCount}
          onChange={(e) => setMemberCount(e.target.value)}
        />

        <Input
          label="Age range"
          placeholder="14–17"
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
        />

        <Input
          label="Contact phone"
          placeholder="+255 …"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Member names</label>
        <textarea
          rows={3}
          placeholder="One per line"
          value={memberNames}
          onChange={(e) => setMemberNames(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" disabled={!canSubmit} onClick={submit}>
          {isPending ? "Registering…" : "Register team"}
        </Button>
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
