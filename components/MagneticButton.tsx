"use client";

import { useRef, useState } from "react";

export default function MagneticButton({
  children,
  strength = 0.08,
  disabledOnMobile = true,
}: {
  children: React.ReactNode;
  strength?: number;
  disabledOnMobile?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pressed, setPressed] = useState(false);

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    if (disabledOnMobile && isMobile) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    ref.current.style.transform = `
      translate(${x * strength}px, ${y * strength}px)
      scale(${pressed ? "1.02 0.98" : "1"})
    `;
  };

  const reset = () => {
    if (!ref.current) return;

    ref.current.style.transform = `
      translate(0px, 0px)
      scale(1)
    `;
    setPressed(false);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onMouseDown={() => setPressed(true)}
      onMouseUp={reset}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={reset}
      className="inline-block transition-transform duration-200 ease-out will-change-transform"
    >
      {children}
    </div>
  );
}
