"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { publicContent } from "../../generated/public-content";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="menu-toggle__glyph" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <nav
        id={panelId}
        className={open ? "mobile-nav-panel is-open" : "mobile-nav-panel"}
        aria-label="Primary"
        hidden={!open}
      >
        {publicContent.navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
