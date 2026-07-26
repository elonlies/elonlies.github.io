import Link from "next/link";
import { datasetStats, formatDate } from "@/lib/data";
import { primaryNavigation } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="site-header__inner">
        <Link className="wordmark" href="/" aria-label="Elon Musk Trust Score home">
          <span className="wordmark__primary">ELON MUSK</span>
          <span className="wordmark__slash" aria-hidden="true">
            /
          </span>
          <span>TRUST RECORD</span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          {primaryNavigation.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="dataset-stamp">
          <span>Dataset {datasetStats.versionLabel}</span>
          <span aria-hidden="true">·</span>
          <span>Evaluated {formatDate(datasetStats.evaluationDate)}</span>
        </p>
      </div>
    </header>
  );
}
