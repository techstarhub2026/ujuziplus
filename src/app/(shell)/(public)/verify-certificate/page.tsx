"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { verifyCertificate } from "@/lib/actions/certificates";

type CertResult = Awaited<ReturnType<typeof verifyCertificate>>;

export default function VerifyCertificatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CertResult | null | "invalid">(null);
  const [isPending, startTransition] = useTransition();

  const verify = () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const cert = await verifyCertificate(trimmed);
      if (cert) {
        setResult(cert);
      } else {
        setResult("invalid");
      }
    });
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-center">Verify Certificate</h1>
      <p className="mt-2 text-center text-gray-500">
        Enter the verification code from the certificate
      </p>
      <Card className="mt-8 p-4">
        <Input
          label="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste verify code from certificate"
          onKeyDown={(e) => e.key === "Enter" && verify()}
        />
        <Button className="mt-4 w-full" disabled={isPending || !code.trim()} onClick={verify}>
          {isPending ? "Verifying…" : "Verify"}
        </Button>
      </Card>

      {result && result !== "invalid" && (
        <Card className="mt-6 border-green-200 bg-green-50 p-4">
          <Badge variant="success" className="mb-3">
            Valid certificate
          </Badge>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Learner</dt>
              <dd className="font-medium">{result.user.fullName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Course</dt>
              <dd className="font-medium">{result.course.title}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Instructor</dt>
              <dd>{result.course.instructor.fullName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Issued</dt>
              <dd>{new Date(result.issuedAt).toLocaleDateString("en-TZ")}</dd>
            </div>
          </dl>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => router.push(`/certificate/${result.verifyCode}`)}
          >
            View full certificate
          </Button>
        </Card>
      )}

      {result === "invalid" && (
        <Card className="mt-6 border-red-200 bg-red-50 p-4">
          <Badge variant="error">Invalid or not found</Badge>
          <p className="mt-2 text-sm text-red-700">No certificate matches this code.</p>
        </Card>
      )}

      <p className="mt-6 text-center text-xs text-gray-400">
        Have a share link? Open{" "}
        <Link href="/dashboard/certificates" className="text-brand hover:underline">
          your certificates
        </Link>{" "}
        to copy the verify URL.
      </p>
    </div>
  );
}
