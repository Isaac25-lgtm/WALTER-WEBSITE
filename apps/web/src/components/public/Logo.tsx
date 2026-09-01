import Link from "next/link";
import { publicContent } from "../../generated/public-content";

type LogoProps = {
  variant: "header" | "footer" | "about";
  className?: string;
};

export function Logo({ variant, className }: LogoProps) {
  const src = variant === "footer" ? publicContent.logo.footerSrc : publicContent.logo.headerSrc;
  const size =
    variant === "header" ? { width: 233, height: 65 } : variant === "footer" ? { width: 287, height: 80 } : { width: 287, height: 80 };
  return (
    <Link
      className={className ? `site-logo ${className}` : "site-logo"}
      href="/"
      aria-label={`${publicContent.logo.alt} home`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static export of the cropped ATS raster */}
      <img src={src} alt={publicContent.logo.alt} width={size.width} height={size.height} />
    </Link>
  );
}
