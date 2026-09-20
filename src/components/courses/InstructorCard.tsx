import { MessageCircle, BadgeCheck } from "lucide-react";

const WHATSAPP_NUMBER = "917073345025";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function InstructorCard({ name }: { name: string }) {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I have a question about the course by ${name}.`
  )}`;

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted">Instructor</p>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#172554] text-base font-bold text-white">
          {initials(name)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-bold text-text">
            {name}
            <BadgeCheck className="h-4 w-4 text-primary" />
          </p>
          <p className="text-xs text-muted">Course Instructor</p>
        </div>
      </div>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-soft-blue px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
      >
        <MessageCircle className="h-4 w-4" />
        Chat on WhatsApp
      </a>
    </div>
  );
}