import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-2 text-8xl font-bold tracking-tight text-accent">
        404
      </h1>
      <h2 className="mb-4 text-2xl font-bold tracking-tight">
        Page not found
      </h2>
      <p className="mb-8 max-w-md text-muted">
        Looks like this chapter hasn&apos;t been written yet. Let&apos;s get
        you back to the story.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
        data-cursor="pointer"
      >
        Back to home
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </div>
  );
}
