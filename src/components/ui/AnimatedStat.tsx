"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface AnimatedStatProps {
  value: string;
  className?: string;
}

function splitValue(value: string) {
  const match = value.match(/\d+/);
  if (!match || match.index === undefined) return null;
  return {
    prefix: value.slice(0, match.index),
    digits: match[0],
    suffix: value.slice(match.index + match[0].length),
  };
}

export function AnimatedStat({ value, className }: AnimatedStatProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const parsed = useMemo(() => splitValue(value), [value]);

  const [display, setDisplay] = useState(
    parsed ? `${parsed.prefix}0${parsed.suffix}` : value,
  );

  useEffect(() => {
    if (!isInView || !parsed) return;

    const target = Number(parsed.digits);
    const controls = animate(0, target, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(`${parsed.prefix}${Math.round(latest)}${parsed.suffix}`);
      },
    });

    return () => controls.stop();
  }, [isInView, parsed]);

  return (
    <p ref={ref} className={className}>
      {display}
    </p>
  );
}
