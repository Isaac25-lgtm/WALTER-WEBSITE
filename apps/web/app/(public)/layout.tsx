import type { ReactNode } from "react";
import { SiteFrame } from "../../src/components/public/SiteFrame";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
