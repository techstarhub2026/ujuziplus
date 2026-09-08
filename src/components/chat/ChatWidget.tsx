"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM } from "@/lib/constants";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: `Hi! I'm the ${PLATFORM.name} assistant. I can help you find courses, kits, programs, mentors, and competitions across the platform.`,
};

const QUICK_OPTIONS: { label: string; href: string }[] = [
  { label: "Browse courses", href: "/courses" },
  { label: "Explore learning kits", href: "/kits" },
  { label: "Join a bootcamp or program", href: "/programs" },
  { label: "Find a mentor", href: "/mentors" },
  { label: "See competitions & challenges", href: "/competitions" },
  { label: "Get help with my account", href: "/dashboard/settings/profile" },
];

const PLACEHOLDER_REPLY =
  "Thanks for your message! Live replies are coming soon — for now, browse courses or reach out via the community for help.";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [showOptions, setShowOptions] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, showOptions]);

  const replyWithPlaceholder = () => {
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: PLACEHOLDER_REPLY },
      ]);
    }, 500);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    setDraft("");
    setShowOptions(false);
    replyWithPlaceholder();
  };

  const selectOption = (label: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: label }]);
    setShowOptions(false);
    replyWithPlaceholder();
  };

  return (
    <div className="chat-widget" aria-live="polite">
      {open && (
        <div className="chat-widget__panel" role="dialog" aria-label={`${PLATFORM.name} chat assistant`}>
          <div className="chat-widget__header">
            <div className="chat-widget__header-copy">
              <span className="chat-widget__title">{PLATFORM.name} Assistant</span>
              <span className="chat-widget__status">
                <span className="chat-widget__status-dot" aria-hidden />
                Replies coming soon
              </span>
            </div>
            <button
              type="button"
              className="chat-widget__close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="chat-widget__messages" ref={listRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "chat-widget__bubble",
                  m.role === "user" ? "chat-widget__bubble--user" : "chat-widget__bubble--assistant"
                )}
              >
                {m.text}
              </div>
            ))}

            {showOptions && (
              <div className="chat-widget__options">
                {QUICK_OPTIONS.map((opt) => (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    onClick={() => selectOption(opt.label)}
                    className="chat-widget__option"
                  >
                    {opt.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <form className="chat-widget__composer" onSubmit={send}>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              className="chat-widget__input"
              aria-label="Message"
            />
            <button
              type="submit"
              className="chat-widget__send"
              disabled={!draft.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chat-widget__launcher"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
