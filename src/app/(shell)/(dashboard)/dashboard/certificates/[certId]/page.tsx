import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth-server";

/** Legacy route — redirect to real certificate by id or verify code */
export default async function CertificateLegacyPage({
  params,
}: {
  params: { certId: string };
}) {
  const session = await getAuthSession();

  const byId = await db.certificate.findUnique({
    where: { id: params.certId },
    select: { verifyCode: true, userId: true },
  });

  if (byId) {
    if (session?.user?.id === byId.userId || session?.user?.role === "ADMIN") {
      redirect(`/certificate/${byId.verifyCode}`);
    }
  }

  const byCode = await db.certificate.findUnique({
    where: { verifyCode: params.certId },
    select: { verifyCode: true },
  });
  if (byCode) redirect(`/certificate/${byCode.verifyCode}`);

  redirect("/dashboard/certificates");
}
