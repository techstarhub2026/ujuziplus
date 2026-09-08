import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLATFORM } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold">About {PLATFORM.name}</h1>
      <p className="mt-4 text-lg text-gray-600">
        TechStar UjuziLab is Africa&apos;s modern learning and innovation ecosystem — combining STEM education,
        practical labs, project showcases, competitions, and entrepreneurship.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/courses">Browse courses</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/kits">Explore learning kits</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/register">Create free account</Link>
        </Button>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {[
          { title: "Our Mission", text: "Build Africa's next generation of innovators through accessible, practical STEM education." },
          { title: "Our Vision", text: "A continent where every young person can learn, build, and launch solutions to local challenges." },
          { title: "Innovation First", text: "We go beyond video courses — projects, labs, and hackathons are core to learning." },
          { title: "Community Driven", text: "Learners, instructors, schools, and hubs collaborate in one ecosystem." },
        ].map((v) => (
          <Card key={v.title}>
            <h3 className="font-semibold text-brand">{v.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{v.text}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-12">
        <h3 className="font-semibold">Timeline</h3>
        <ul className="mt-4 space-y-3 border-l-2 border-brand pl-4">
          <li><strong>2024</strong> — Platform concept & pilot programs</li>
          <li><strong>2025</strong> — UjuziLab MVP launch in Tanzania</li>
          <li><strong>2026</strong> — Full ecosystem: orgs, competitions, AI mentor</li>
        </ul>
      </Card>
    </div>
  );
}
