import Link from "next/link";
import { publicContent } from "../../generated/public-content";

export function DesktopNavigation() {
  return (
    <nav className="desktop-nav" aria-label="Primary">
      {publicContent.navigation.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
