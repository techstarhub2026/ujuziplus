/**
 * /dashboard/certificates — Student's earned certificates
 */

import { redirect } from "next/navigation";
import { getMyCertificates } from "@/lib/actions/certificates";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Award, BookOpen, ExternalLink } from "lucide-react";
import { getAuthSession } from "@/lib/auth-server";

export default async function CertificatesPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const certs = await getMyCertificates(session.user.id);

  return (
    <div className="animate-fade-in">
      <PageHeader
        variant="hero"
        banner="my-courses"
        title="My Certificates"
        description={`${certs.length} certificate${certs.length !== 1 ? "s" : ""} earned`}
      />

      {certs.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
            <Award className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="font-semibold text-gray-600 mb-2">No certificates yet</h3>
          <p className="text-sm text-gray-400 mb-5">
            Complete a course to earn your first certificate.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand/90 transition"
          >
            <BookOpen className="h-4 w-4" />Browse courses
          </Link>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <Card key={cert.id} hover className="flex flex-col overflow-hidden p-0">
              {/* Course thumbnail */}
              <div className="relative h-32 w-full bg-gray-100">
                {cert.course.thumbnailUrl ? (
                  <Image
                    src={cert.course.thumbnailUrl}
                    alt={cert.course.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-gray-300" />
                  </div>
                )}
                {/* Badge overlay */}
                <div className="absolute top-3 right-3 rounded-full bg-brand p-2 shadow">
                  <Award className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="font-semibold line-clamp-2">{cert.course.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    by {cert.course.instructor.fullName}
                  </p>
                </div>

                <p className="text-xs text-gray-400">
                  Issued {formatDate(cert.issuedAt)}
                </p>

                <div className="mt-auto flex items-center gap-2">
                  <Link
                    href={`/certificate/${cert.verifyCode}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand/90 transition"
                  >
                    <Award className="h-3.5 w-3.5" />View & share
                  </Link>
                  <a
                    href={`/api/certificate/${cert.verifyCode}`}
                    download
                    className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:text-brand hover:border-brand transition"
                    title="Download PDF"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
