"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { bulkImportOrgMembers } from "@/lib/actions/org-members";
import { useAppStore } from "@/store/appStore";
import { Upload, FileSpreadsheet } from "lucide-react";

export function OrgMembersBulkImport({
  orgSlug,
  actorUserId,
}: {
  orgSlug: string;
  actorUserId: string;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | null>(null);

  const processFile = (file: File) => {
    startTransition(async () => {
      const text = await file.text();
      const res = await bulkImportOrgMembers(actorUserId, orgSlug, text);
      if (!res.success) {
        showToast(res.error ?? "Import failed", "error");
        return;
      }

      const { added, invited, skipped, errors } = res.data;
      const summary = `${added} added, ${invited} invited, ${skipped} skipped`;
      setLastResult(
        errors.length > 0 ? `${summary}. ${errors.length} error(s).` : summary
      );
      showToast(`Import complete: ${summary}`, "success");
      router.refresh();
    });
  };

  return (
    <Card className="mb-6 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <FileSpreadsheet className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Bulk import (CSV)</h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload a CSV with columns <code className="text-xs">email,role</code>. Roles:{" "}
            <code className="text-xs">member</code>, <code className="text-xs">instructor</code>, or{" "}
            <code className="text-xs">admin</code>. Existing users are added immediately; others
            receive an email invite.
          </p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isPending ? "Importing…" : "Choose CSV file"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => {
            const sample =
              "email,role\nstudent2@example.com,member\ncolleague@university.edu,instructor\n";
            processFile(new File([sample], "members-sample.csv", { type: "text/csv" }));
          }}
        >
          Try sample
        </Button>
      </div>

      {lastResult && <p className="text-xs text-gray-600">Last import: {lastResult}</p>}
    </Card>
  );
}
