import type { ReactNode } from "react";
import { MobileCallBar } from "./MobileCallBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SkipLink } from "./SkipLink";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <MobileCallBar />
      <WhatsAppFloat />
    </>
  );
}
