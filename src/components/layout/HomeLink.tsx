"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

export function HomeLink({
  children,
  className,
  onNavigate,
}: {
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();
    if (window.location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <Link href="/" onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
