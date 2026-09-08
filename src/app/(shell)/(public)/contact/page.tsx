"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { submitContactForm } from "@/lib/actions/contact";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await submitContactForm({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
    });
    if (result.success) {
      setStatus("sent");
      e.currentTarget.reset();
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  return (
    <div className="learner-canvas mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <LearnerPageHero
        banner="contact"
        title="Contact us"
        subtitle="Questions about courses, kits, or organization plans? We're here to help."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3" padding="md">
          {status === "sent" ? (
            <p className="text-sm text-gray-600">
              Thanks — your message was sent. We typically reply within two business days.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" name="name" required placeholder="Your name" />
                <Input label="Email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <Input label="Subject" name="subject" required placeholder="How can we help?" />
              <Textarea
                label="Message"
                name="message"
                required
                rows={5}
                placeholder="Tell us more about your question…"
              />
              <Button type="submit" className="w-full" size="lg" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card padding="md" className="space-y-4">
            <h3 className="font-display font-semibold text-gray-900">Get in touch</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>hello@ujuzilab.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>Dar es Salaam, Tanzania</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>Mon–Fri, 9am–5pm EAT</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
