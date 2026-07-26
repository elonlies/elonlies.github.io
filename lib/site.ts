import { datasetStats } from "@/lib/data";

export const siteName = "Elon Musk Trust Score";
export const siteDescription =
  `A transparent, citation-backed record of ${datasetStats.totalRecords} public claims, promises, and outcomes.`;

export const primaryNavigation = [
  { href: "/score", label: "Score" },
  { href: "/score#evidence", label: "Evidence" },
  { href: "/visualizations", label: "Visualize" },
  { href: "/methodology", label: "Method" },
  { href: "/#downloads", label: "Download" },
];
