import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — let's create something amazing together.",
};

const socialLinks = [
  { label: "LinkedIn", href: "https://linkedin.com", icon: "in" },
  { label: "Dribbble", href: "https://dribbble.com", icon: "Dr" },
  { label: "Twitter", href: "https://twitter.com", icon: "X" },
  { label: "GitHub", href: "https://github.com", icon: "GH" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <div className="grid gap-16 lg:grid-cols-2">
        {/* Left: CTA + info */}
        <div>
          <p className="mb-4 text-sm font-medium tracking-widest uppercase text-accent">
            Get in touch
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Got a story to tell?
            <br />
            <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
              Let&apos;s write the next
              <br />
              chapter together.
            </span>
          </h1>
          <p className="mb-10 text-lg text-muted">
            Whether you have a project in mind, want to collaborate, or just
            want to say hello — I&apos;d love to hear from you.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <a
                href="mailto:hello@example.com"
                className="text-muted transition-colors hover:text-accent"
                data-cursor="pointer"
              >
                hello@example.com
              </a>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                Socials
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-xs font-bold text-muted transition-colors hover:border-accent hover:text-accent"
                    data-cursor="pointer"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
