import Image from "next/image";
import Link from "next/link";
import { Calendar, Users, Rocket } from "lucide-react";
import { resolveProgramThumbnail } from "@/lib/catalog-images";

export function HomeProgramCard({
  slug,
  title,
  type,
  thumbnailUrl,
  startDate,
  format,
  enrolledCount,
  seats,
}: {
  slug: string;
  title: string;
  type: string;
  thumbnailUrl?: string | null;
  startDate: string | null;
  format: string;
  enrolledCount: number;
  seats: number;
}) {
  const seatsLeft = seats > 0 ? seats - enrolledCount : null;
  const imageSrc = resolveProgramThumbnail(slug, thumbnailUrl);

  return (
    <Link href={`/programs/${slug}`} className="home-program-card group">
      <div className="home-program-card__visual">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.05]"
          sizes="300px"
          unoptimized={imageSrc.startsWith("/content/") || imageSrc.startsWith("/images/")}
        />
        <div className="home-program-card__shade" aria-hidden />
        <Rocket className="home-program-card__glyph" strokeWidth={1.5} />
        <span className="home-program-card__type">{type}</span>
      </div>
      <div className="home-program-card__body">
        <h3 className="home-program-card__title">{title}</h3>
        <p className="home-program-card__meta">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          {startDate ?? "Dates TBD"} · {format}
        </p>
        {seats > 0 && (
          <p className="home-program-card__seats">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {enrolledCount}/{seats} enrolled
            {seatsLeft !== null && seatsLeft > 0 && seatsLeft <= 8 && (
              <span className="home-program-card__urgent"> · {seatsLeft} seats left</span>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}
