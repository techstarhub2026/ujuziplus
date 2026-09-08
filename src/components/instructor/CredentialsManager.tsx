"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaUploadField } from "@/components/ui/MediaUploadField";
import { useAppStore } from "@/store/appStore";
import {
  addCredential,
  updateCredential,
  deleteCredential,
  getInstructorCredentials,
  type InstructorCredentialInput,
} from "@/lib/actions/instructor-credentials";
import type { InstructorCredential } from "@prisma/client";

const emptyDraft = (): InstructorCredentialInput => ({
  title: "",
  issuer: "",
  issueDate: "",
  credentialUrl: "",
  fileUrl: "",
});

function toDraft(cred: InstructorCredential): InstructorCredentialInput {
  return {
    title: cred.title,
    issuer: cred.issuer ?? "",
    issueDate: cred.issueDate ? cred.issueDate.toISOString().slice(0, 10) : "",
    credentialUrl: cred.credentialUrl ?? "",
    fileUrl: cred.fileUrl ?? "",
  };
}

export function CredentialsManager({
  userId,
  initialCredentials,
}: {
  userId: string;
  initialCredentials: InstructorCredential[];
}) {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<InstructorCredentialInput>(emptyDraft());
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  function startAdd() {
    setDraft(emptyDraft());
    setEditingId(null);
    setAdding(true);
  }

  function startEdit(cred: InstructorCredential) {
    setDraft(toDraft(cred));
    setEditingId(cred.id);
    setAdding(false);
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
  }

  function save() {
    if (!draft.title.trim()) {
      showToast("Certification title is required.", "error");
      return;
    }
    startTransition(async () => {
      const result = editingId
        ? await updateCredential(userId, editingId, draft)
        : await addCredential(userId, draft);

      if (result.error) {
        showToast(result.error, "error");
        return;
      }

      showToast(editingId ? "Certification updated" : "Certification added", "success");
      cancel();
      const fresh = await getInstructorCredentials(userId);
      setCredentials(fresh);
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteCredential(userId, id);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      setCredentials((prev) => prev.filter((c) => c.id !== id));
      showToast("Certification removed", "success");
    });
  }

  return (
    <div className="space-y-4">
      {credentials.map((cred) => (
        <Card key={cred.id} className="p-4">
          {editingId === cred.id ? (
            <CredentialForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} isPending={isPending} />
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{cred.title}</p>
                <p className="text-sm text-gray-500">
                  {[cred.issuer, cred.issueDate ? cred.issueDate.getFullYear() : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {(cred.credentialUrl || cred.fileUrl) && (
                  <a
                    href={cred.credentialUrl || cred.fileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                  >
                    View credential <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  aria-label="Edit certification"
                  onClick={() => startEdit(cred)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete certification"
                  disabled={isPending}
                  onClick={() => remove(cred.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      ))}

      {adding ? (
        <Card className="p-4">
          <CredentialForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} isPending={isPending} />
        </Card>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={startAdd}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add certification
        </Button>
      )}
    </div>
  );
}

function CredentialForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  isPending,
}: {
  draft: InstructorCredentialInput;
  setDraft: (d: InstructorCredentialInput) => void;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-2">
      <Input
        label="Title"
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="e.g. Certified Robotics Instructor"
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Issuer (optional)"
          value={draft.issuer}
          onChange={(e) => setDraft({ ...draft, issuer: e.target.value })}
        />
        <Input
          label="Issue date"
          type="date"
          value={draft.issueDate}
          onChange={(e) => setDraft({ ...draft, issueDate: e.target.value })}
        />
      </div>
      <Input
        label="Credential URL (optional)"
        value={draft.credentialUrl}
        onChange={(e) => setDraft({ ...draft, credentialUrl: e.target.value })}
      />
      <MediaUploadField
        kind="doc"
        label="Certificate file (optional)"
        hint="Upload a PDF from your device."
        value={draft.fileUrl ?? ""}
        onChange={(url) => setDraft({ ...draft, fileUrl: url })}
        localOnly
      />
      <div className="flex gap-2 pt-1">
        <Button type="button" size="sm" disabled={isPending} onClick={onSave}>
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
