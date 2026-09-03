import type { Metadata } from "next";
import { PortfolioPage as PortfolioView } from "../../../src/components/public/portfolio/PortfolioPage";

export const metadata: Metadata = {
  title: "Portfolio",
};

export default function PortfolioPage() {
  return <PortfolioView />;
}
