import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found page-shell">
      <p className="eyebrow">404 · Record not found</p>
      <h1>This evidence record does not exist.</h1>
      <p>
        The record ID may be incorrect, or the requested page may have moved.
      </p>
      <Link className="button" href="/score#evidence">
        Browse all claims
      </Link>
    </main>
  );
}
