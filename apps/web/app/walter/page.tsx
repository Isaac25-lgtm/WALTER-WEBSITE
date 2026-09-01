import type { Metadata } from "next";
import { WalterSignInPage } from "../../src/components/walter/WalterSignInPage";

export const metadata: Metadata = {
  title: "Management sign in",
  robots: { index: false, follow: false },
};

export default function WalterPage() {
  return <WalterSignInPage />;
}
