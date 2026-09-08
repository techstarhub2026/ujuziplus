"use client";

import { useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Plus, Trash2, FileText, Upload, X } from "lucide-react";
import { UjuziLoader } from "@/components/ui/UjuziLoader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { submitSignupCredentials } from "@/lib/actions/auth";
import { uploadSignupCredentialFile } from "@/lib/upload-client";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";

type CredentialDraft = {
  title: string;
  issuer: string;
  issueDate: string;
  fileUrl: string;
};

const emptyCredential = (): CredentialDraft => ({
  title: "",
  issuer: "",
  issueDate: "",
  fileUrl: "",
});

function CertificateFileUpload({
  token,
  value,
  onChange,
}: {
  token: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      const data = await uploadSignupCredentialFile(file, token, setProgress);
      onChange(data.url);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium">Certificate file (PDF, optional)</span>

      {!value && !uploading && (
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-brand transition"
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="h-6 w-6 text-gray-400" />
          <p className="mt-1.5 text-xs text-gray-600">
            Click or drag &amp; drop to upload from your device
          </p>
          <p className="mt-0.5 text-xs text-gray-400">PDF · max 15 MB</p>
        </div>
      )}

      {uploading && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-gray-600">Uploading…</span>
            <span className="text-xs font-medium text-brand">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-brand transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {value && !uploading && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="min-w-0 flex-1 truncate text-xs text-gray-700">
            {fileName || value.split("/").pop()}
          </span>
          <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
          <button
            type="button"
            aria-label="Remove file"
            onClick={() => {
              onChange("");
              setFileName("");
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        aria-label="Upload certificate PDF"
        className="hidden"
        onChange={handlePick}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function CertificationsForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [credentials, setCredentials] = useState<CredentialDraft[]>([emptyCredential()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function updateCredential(index: number, field: keyof CredentialDraft, value: string) {
    setCredentials((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function addCredential() {
    setCredentials((prev) => [...prev, emptyCredential()]);
  }

  function removeCredential(index: number) {
    setCredentials((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This signup session is invalid. Please register again.");
      return;
    }

    setLoading(true);
    const cleaned = credentials.map((c) => ({
      title: c.title.trim(),
      issuer: c.issuer.trim() || undefined,
      issueDate: c.issueDate || undefined,
      fileUrl: c.fileUrl.trim() || undefined,
    }));

    const result = await submitSignupCredentials(token, cleaned);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (!token) {
    return (
      <AuthShell
        panelTitle="Session expired"
        panelSubtitle="Your signup session could not be found."
      >
        <AuthCard>
          <div className="text-center">
            <p className="text-red-600">This link is invalid or has expired.</p>
            <Link
              href="/auth/register"
              className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Sign up again
            </Link>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        panelTitle="Thanks for applying to teach"
        panelSubtitle="Our team reviews every instructor application to keep the learning experience high quality."
      >
        <AuthCard>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              Your instructor application is under review
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              An admin will review your certifications and get back to you by email. You&apos;ll
              be able to sign in as soon as your application is approved.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      panelTitle="Show us your expertise"
      panelSubtitle="Add certifications or credentials so our team can verify your skills before approving your instructor account."
    >
      <AuthCard>
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold text-gray-900">Certifications</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload a certificate (PDF) from your device, or add the details manually. At least
            one is required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <FormAlert variant="error">{error}</FormAlert>}

          {credentials.map((cred, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor={`cred-title-${index}`}>Certification {index + 1}</Label>
                {credentials.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove certification ${index + 1}`}
                    onClick={() => removeCredential(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Input
                id={`cred-title-${index}`}
                placeholder="e.g. Certified Robotics Instructor"
                value={cred.title}
                onChange={(e) => updateCredential(index, "title", e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Issuer (optional)"
                  value={cred.issuer}
                  onChange={(e) => updateCredential(index, "issuer", e.target.value)}
                />
                <Input
                  type="date"
                  value={cred.issueDate}
                  onChange={(e) => updateCredential(index, "issueDate", e.target.value)}
                />
              </div>

              <CertificateFileUpload
                token={token}
                value={cred.fileUrl}
                onChange={(url) => updateCredential(index, "fileUrl", url)}
              />
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addCredential}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add another certification
          </Button>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? (
              <UjuziLoader size="sm" className="ujuzi-loader--on-brand" label="Submitting" />
            ) : (
              "Submit application"
            )}
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export default function CertificationsPage() {
  return (
    <Suspense>
      <CertificationsForm />
    </Suspense>
  );
}
