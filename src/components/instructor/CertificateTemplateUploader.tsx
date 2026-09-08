"use client";

/**
 * CertificateTemplateUploader
 * Lets an instructor upload a custom PDF certificate template for their course.
 *
 * The PDF should have AcroForm text fields named:
 *   student_name, course_title, instructor_name,
 *   issue_date, verify_code, duration_hours
 *
 * The system fills these automatically when a certificate is downloaded.
 */

import { useEffect, useState } from "react";
import { Upload, FileText, Trash2, Check, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  saveCertificateTemplate,
  getCertificateTemplate,
  deleteCertificateTemplate,
} from "@/lib/actions/certificates";

const FIELD_NAMES = [
  "student_name",
  "course_title",
  "instructor_name",
  "issue_date",
  "verify_code",
  "duration_hours",
];

export function CertificateTemplateUploader({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<{ filePath: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCertificateTemplate(courseId).then((tpl) => {
      setExisting(tpl);
      setLoading(false);
    });
  }, [courseId]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Template PDF must be under 20 MB.");
      return;
    }
    setError("");
    setWarning("");
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "doc");

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = async () => {
      setUploading(false);
      if (xhr.status !== 200) {
        setError("Upload failed. Please try again.");
        return;
      }
      const json = JSON.parse(xhr.responseText) as { url: string };
      // Strip /uploads prefix so we store a relative path under public/
      const filePath = json.url.replace(/^\//, "");
      const res = await saveCertificateTemplate(courseId, filePath);
      if (!res.success) { setError(res.error); return; }
      setExisting({ filePath });
      if (res.data?.warning) {
        setWarning(res.data.warning);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    };
    xhr.onerror = () => { setUploading(false); setError("Upload failed."); };
    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteCertificateTemplate(courseId);
    setExisting(null);
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Info box */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <div className="flex gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">How PDF templates work</p>
            <p className="text-xs text-blue-600 mb-2">
              Design your certificate in any PDF editor (Adobe Acrobat, LibreOffice, Canva→PDF).
              Add text form fields with these exact names and the system will fill them automatically:
            </p>
            <div className="flex flex-wrap gap-1">
              {FIELD_NAMES.map((f) => (
                <code
                  key={f}
                  className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-mono text-blue-800"
                >
                  {f}
                </code>
              ))}
            </div>
            <p className="mt-2 text-xs text-blue-600">
              If no template is uploaded, a built-in certificate design is used automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Current template */}
      {existing && (
        <Card className="flex items-center gap-3 bg-green-50 border-green-200">
          <FileText className="h-6 w-6 shrink-0 text-green-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">Template uploaded</p>
            <p className="text-xs text-green-600 truncate">{existing.filePath}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </Card>
      )}

      {/* Upload area */}
      <label className="group block cursor-pointer">
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition group-hover:border-brand group-hover:bg-orange-50">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="text-sm text-gray-600">Uploading… {progress}%</p>
              <div className="w-full max-w-xs rounded-full bg-gray-200 h-1.5 overflow-hidden">
                <div className="h-1.5 bg-brand rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-gray-100 p-4 group-hover:bg-orange-100">
                <Upload className="h-6 w-6 text-gray-400 group-hover:text-brand" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                {existing ? "Replace template" : "Upload PDF template"}
              </p>
              <p className="text-xs text-gray-400">PDF · max 20 MB</p>
            </>
          )}
        </div>
      </label>

      {saved && (
        <p className="flex items-center gap-1.5 text-sm text-green-600">
          <Check className="h-4 w-4" />Template saved successfully.
        </p>
      )}
      {warning && (
        <p className="flex items-start gap-1.5 text-sm text-amber-600">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />{warning}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
