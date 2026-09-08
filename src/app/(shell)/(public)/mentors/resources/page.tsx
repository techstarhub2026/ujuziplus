import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import {
  BookOpen, Users, Calendar, Video, MessageSquare, Award,
  CheckCircle, Download, ArrowRight, Lightbulb, Target, Heart,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { MotionGrid, RevealItem, RevealStagger } from "@/components/motion/RevealStagger";

const CONDUCT_ITEMS = [
  "Respect learners' time — show up prepared and on time for every session.",
  "Maintain confidentiality — do not share personal information shared in sessions.",
  "Be inclusive — serve learners regardless of gender, background, or ability.",
  "Set clear expectations — communicate availability and response times upfront.",
  "Encourage, don't solve — guide learners to their own answers rather than doing it for them.",
  "Report concerns — contact platform staff if you witness bullying, harassment, or misconduct.",
  "Keep sessions professional — sessions must occur on platform-approved channels.",
  "No commercial solicitation — mentoring is a gift; do not sell services to mentees.",
];

const JOURNEY_STEPS = [
  { icon: <Target className="h-6 w-6" />, step: "1", title: "Build your profile", desc: "Upload a clear photo, write a compelling bio focused on what you offer learners, add your expertise tracks, and set your availability. A strong profile gets 3× more requests." },
  { icon: <CheckCircle className="h-6 w-6" />, step: "2", title: "Agree to the Code of Conduct", desc: "Read and accept our community standards. This is required before your profile is published and visible to learners." },
  { icon: <Calendar className="h-6 w-6" />, step: "3", title: "Set your office hours", desc: "Add recurring weekly slots when learners can see you are available. Connect your Calendly, Google Calendar, or any booking link." },
  { icon: <MessageSquare className="h-6 w-6" />, step: "4", title: "Respond to requests promptly", desc: "Learners who apply will send a goal and message. Aim to respond within 48 hours — quick responses build trust and are rewarded with higher visibility." },
  { icon: <Video className="h-6 w-6" />, step: "5", title: "Run your first session", desc: "Use the session booking system or your own meeting link. Prepare with the session agenda templates below." },
  { icon: <Users className="h-6 w-6" />, step: "6", title: "Start a cohort (optional)", desc: "Group up to 20 learners around a shared track (e.g. 'AI Cohort Jan 2026'). Cohort members attend scheduled group sessions and build together." },
];

const SESSION_TEMPLATES = [
  {
    type: "Intro Call",
    duration: "30 min",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    agenda: [
      "Warm-up: learner shares their background (5 min)",
      "Goal clarification: what do they want to achieve? (10 min)",
      "Mentor shares relevant experience and how you can help (10 min)",
      "Agree on frequency, communication channel, next steps (5 min)",
    ],
  },
  {
    type: "Technical Guidance",
    duration: "45–60 min",
    color: "bg-violet-50 border-violet-200 text-violet-800",
    agenda: [
      "Check-in: progress since last session? (5 min)",
      "Learner demos or explains what they built / got stuck on (15 min)",
      "Mentor explains concepts, reviews code, suggests resources (25 min)",
      "Action items: what will learner do before next session? (5 min)",
    ],
  },
  {
    type: "Career & Employability",
    duration: "45 min",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    agenda: [
      "Learner shares CV or portfolio for review (10 min)",
      "Discuss target roles and gaps to fill (10 min)",
      "Practical advice on job search, networking, interviews (20 min)",
      "Resources: job boards, communities, certifications to pursue (5 min)",
    ],
  },
  {
    type: "Project Review / Demo Day Prep",
    duration: "60 min",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    agenda: [
      "Learner presents their project / prototype (15 min)",
      "Mentor gives structured feedback: what works, what to improve (20 min)",
      "Practice the pitch: 60-second elevator pitch drill (15 min)",
      "Refinement plan and next demo milestone (10 min)",
    ],
  },
  {
    type: "Innovation & Startup Coaching",
    duration: "60 min",
    color: "bg-rose-50 border-rose-200 text-rose-800",
    agenda: [
      "Problem definition: is the problem real and worth solving? (15 min)",
      "Solution review: is the approach technically feasible? (15 min)",
      "Business model & market: who will pay and why? (15 min)",
      "Next milestone: what does a working MVP look like? (15 min)",
    ],
  },
];

const TIPS = [
  { icon: <Heart className="h-4 w-4 text-red-400" />, title: "Ask, don't tell", body: "Use questions to help learners arrive at their own insights. 'What have you tried so far?' is more powerful than giving the answer directly." },
  { icon: <Lightbulb className="h-4 w-4 text-amber-400" />, title: "Share failures too", body: "Learners benefit enormously from hearing about mentors' failures, not just successes. Normalize struggle and experimentation." },
  { icon: <Target className="h-4 w-4 text-brand" />, title: "Specific beats generic", body: "Instead of 'learn Python,' say 'build a temperature-logging script with a Raspberry Pi to learn loops and file I/O.' Concrete next steps stick." },
  { icon: <Award className="h-4 w-4 text-violet-400" />, title: "Celebrate progress", body: "Acknowledge even small wins. A learner who built their first LED circuit has taken a real step — recognition keeps them going." },
];

export default function MentorResourcesPage() {
  return (
    <div className="learner-canvas mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <LearnerPageHero
        banner="mentors"
        title="Mentor Hub"
        subtitle="Everything you need to onboard, run outstanding sessions, and make a lasting impact on the next generation of African STEM innovators."
        eyebrow="For mentors"
      />

      {/* Quick nav */}
      <Reveal className="mt-8" delay={0.04}>
        <RevealStagger className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "#getting-started", label: "Getting started", icon: <BookOpen className="h-4 w-4" /> },
            { href: "#code-of-conduct", label: "Code of conduct", icon: <CheckCircle className="h-4 w-4" /> },
            { href: "#session-templates", label: "Session templates", icon: <Calendar className="h-4 w-4" /> },
            { href: "#tips", label: "Mentoring tips", icon: <Lightbulb className="h-4 w-4" /> },
          ].map((item) => (
            <RevealItem key={item.href}>
              <a
                href={item.href}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand hover:shadow-md shadow-sm"
              >
                {item.icon} {item.label}
              </a>
            </RevealItem>
          ))}
        </RevealStagger>
      </Reveal>

      {/* Getting started */}
      <Reveal as="section" className="mt-14 scroll-mt-8" delay={0.05}>
        <div id="getting-started" className="scroll-mt-8">
          <h2 className="font-display text-xl font-bold mb-6">Getting started as a mentor</h2>
          <RevealStagger className="space-y-4">
            {JOURNEY_STEPS.map((s) => (
              <RevealItem key={s.step}>
                <div className="flex gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-brand/20">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-sm">
                    {s.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-brand">{s.icon}</span>
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/mentors"
              className="flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 transition-all duration-200 hover:-translate-y-0.5 shadow hover:shadow-lg hover:shadow-brand/25"
            >
              View your public profile <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/mentors"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand/50 hover:text-brand transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              Go to mentor dashboard
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Code of conduct */}
      <Reveal as="section" className="mt-16 scroll-mt-8" delay={0.04}>
        <div id="code-of-conduct" className="scroll-mt-8">
          <h2 className="font-display text-xl font-bold mb-2">Mentor Code of Conduct</h2>
          <p className="text-sm text-gray-500 mb-6">
            UjuziPlus Lab mentors are held to the highest professional standard. By publishing your profile, you agree to the following.
          </p>
          <Card className="p-6">
            <ul className="space-y-3">
              {CONDUCT_ITEMS.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <strong>Violations</strong> of this code may result in suspension or removal from the platform. If you experience or witness a conduct violation, please{" "}
              <Link href="/contact" className="underline font-medium">contact our team immediately</Link>.
            </div>
          </Card>
        </div>
      </Reveal>

      {/* Session templates */}
      <Reveal as="section" className="mt-16 scroll-mt-8" delay={0.04}>
        <div id="session-templates" className="scroll-mt-8">
          <h2 className="font-display text-xl font-bold mb-2">Session agenda templates</h2>
          <p className="text-sm text-gray-500 mb-6">
            Use these structured agendas to run focused, high-value sessions. Adapt them freely to your style.
          </p>
          <MotionGrid className="grid gap-5 sm:grid-cols-2">
            {SESSION_TEMPLATES.map((t) => (
              <RevealItem key={t.type}>
                <div className={`rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${t.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{t.type}</h3>
                    <span className="text-xs font-medium opacity-70">{t.duration}</span>
                  </div>
                  <ol className="space-y-2">
                    {t.agenda.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </RevealItem>
            ))}
          </MotionGrid>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <Download className="h-4 w-4 shrink-0 text-gray-400" />
            Want a printable version? Download the{" "}
            <a href="#" className="text-brand font-medium hover:underline">Mentor Session Pack (PDF)</a>.
          </div>
        </div>
      </Reveal>

      {/* Tips */}
      <Reveal as="section" className="mt-16 scroll-mt-8" delay={0.04}>
        <div id="tips" className="scroll-mt-8">
          <h2 className="font-display text-xl font-bold mb-6">High-impact mentoring tips</h2>
          <MotionGrid className="grid gap-4 sm:grid-cols-2">
            {TIPS.map((tip) => (
              <RevealItem key={tip.title}>
                <Card className="p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand/20">
                  <div className="flex items-center gap-2 mb-2">
                    {tip.icon}
                    <h3 className="font-semibold text-sm text-gray-900">{tip.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip.body}</p>
                </Card>
              </RevealItem>
            ))}
          </MotionGrid>
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal className="mt-16" delay={0.04}>
        <section className="rounded-2xl bg-gradient-to-br from-brand/10 to-violet-50 border border-brand/20 px-8 py-10 text-center">
          <h2 className="font-display text-xl font-bold mb-2">Ready to make an impact?</h2>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Every session you run plants a seed. The learner you help today may be building Africa&apos;s next great innovation tomorrow.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/mentors"
              className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 transition-all duration-200 hover:-translate-y-0.5 shadow hover:shadow-lg hover:shadow-brand/30"
            >
              View my mentor profile
            </Link>
            <Link
              href="/dashboard/mentors"
              className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand/50 hover:text-brand transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              Manage sessions & cohorts
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
