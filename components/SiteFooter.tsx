import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="eyebrow">An auditable public record</p>
          <p className="site-footer__statement">
            Independent and unaffiliated with Elon Musk or any of his companies.
          </p>
        </div>
        <div className="site-footer__links">
          <Link href="/score#evidence">Browse all claims</Link>
          <Link href="/visualizations">Explore visualizations</Link>
          <Link href="/methodology">Read the methodology</Link>
          <a href="/downloads/elon_musk_claims_verified_v2.csv" download>
            Download the CSV
          </a>
        </div>
        <p className="site-footer__fine">
          A failed prediction is not automatically a lie. This project evaluates
          documented outcomes and keeps intent as a separate question.
        </p>
      </div>
    </footer>
  );
}
