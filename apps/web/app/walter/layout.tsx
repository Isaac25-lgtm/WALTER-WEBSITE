import type { ReactNode } from "react";
import "../../src/styles/walter.css";
import { MANAGEMENT_COPY } from "../../src/components/walter/management-copy";

export default function WalterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="walter-shell">
      <a className="walter-skip-link" href="#main-content">
        {MANAGEMENT_COPY.skipToContent}
      </a>
      <main id="main-content">{children}</main>
    </div>
  );
}
