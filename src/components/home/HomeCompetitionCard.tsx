import Image from "next/image";
import Link from "next/link";
import { Calendar, Trophy } from "lucide-react";
import { resolveCompetitionThumbnail } from "@/lib/catalog-images";

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: "Upcoming",
  REGISTRATION_OPEN: "Open",
  IN_PROGRESS: "Live",
  COMPLETED: "Ended",
};

export function HomeCompetitionCard({
  slug,
  title,
  thumbnailUrl,
  startDate,
  prize,
  status,
  teamsCount,
}: {
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  startDate: string | null;
  prize: string | null;
  status: string;
  teamsCount: number;
}) {
  const live = status === "IN_PROGRESS";
  const open = status === "REGISTRATION_OPEN";
  const imageSrc = resolveCompetitionThumbnail(slug, thumbnailUrl);

  return (
    <Link href={`/competitions/${slug}`} className="home-competition-card group">
      <div className="home-competition-card__visual">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.05]"
          sizes="300px"
          unoptimized={imageSrc.startsWith("/content/") || imageSrc.startsWith("/images/")}
        />
        <div className="home-competition-card__shade" aria-hidden />
        <Trophy className="home-competition-card__glyph" strokeWidth={1.5} />
        <span
          className={`home-competition-card__status${
            live ? " home-competition-card__status--live" : open ? " home-competition-card__status--open" : ""
          }`}
        >
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>
      <div className="home-competition-card__body">
        <h3 className="home-competition-card__title">{title}</h3>
        <p className="home-competition-card__meta">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          {startDate ?? "Dates announced soon"}
        </p>
        {prize && <p className="home-competition-card__prize">{prize}</p>}
        {teamsCount > 0 && (
          <p className="home-competition-card__teams">{teamsCount} teams registered</p>
        )}
      </div>
    </Link>
  );
}
