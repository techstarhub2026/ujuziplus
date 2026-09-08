/**
 * /certificate/[verifyCode] — Public certificate verification + display
 * Anyone with the link can verify the certificate's authenticity.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { verifyCertificate } from "@/lib/actions/certificates";
import { formatDate } from "@/lib/utils";
import { Award, CheckCircle2, BookOpen, ExternalLink } from "lucide-react";

interface Props {
  params: { verifyCode: string };
}

export default async function CertificatePage({ params }: Props) {
  const cert = await verifyCertificate(params.verifyCode);
  if (!cert) notFound();

  const courseUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/courses/${cert.course.slug}`;

  return (
    <div className="learner-canvas flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="mb-6 flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 ring-1 ring-green-200">
        <CheckCircle2 className="h-4 w-4" />
        Verified certificate
      </div>

      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-brand/20 bg-white shadow-2xl animate-fade-in">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-brand via-brand-dark to-brand px-8 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-7 w-7" />
              <span className="text-xl font-display font-bold tracking-wide">UjuziLab</span>
            </div>
            <span className="text-xs opacity-70 font-mono">
              #{params.verifyCode.slice(-8).toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/80">Certificate of Completion</p>
        </div>

        {/* Body */}
        <div className="px-8 py-10 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">
            This is to certify that
          </p>

          <div className="mb-6 flex flex-col items-center gap-3">
            {cert.user.avatarUrl && (
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-brand/20">
                <Image
                  src={cert.user.avatarUrl}
                  alt={cert.user.fullName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <h1 className="font-display text-3xl font-bold text-gray-900">
              {cert.user.fullName}
            </h1>
          </div>

          <p className="text-gray-500 mb-2 text-sm">has successfully completed</p>

          <h2 className="font-display text-2xl font-semibold text-gray-800 mb-2">
            {cert.course.title}
          </h2>

          <p className="text-sm text-gray-400 mb-8">
            Instructed by <span className="font-medium text-gray-600">{cert.course.instructor.fullName}</span>
            {cert.course.durationHours > 0 && (
              <> · {cert.course.durationHours} hours</>
            )}
          </p>

          {/* Issue date */}
          <div className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600">
            Issued {formatDate(cert.issuedAt)}
          </div>

          {/* Decorative divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <Award className="h-5 w-5 text-brand opacity-60" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Authenticity verified by UjuziLab
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
            verify code: {params.verifyCode.slice(-12).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`/api/certificate/${params.verifyCode}`}
          download
          className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark hover:shadow-md"
        >
          <Award className="h-4 w-4" />
          Download PDF
        </a>
        <Link
          href={courseUrl}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <BookOpen className="h-4 w-4" />
          View course
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          UjuziLab
        </Link>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
        This certificate can be shared publicly. Anyone with this link can verify its authenticity.
      </p>
    </div>
  );
}
