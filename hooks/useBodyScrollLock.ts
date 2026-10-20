import { useEffect } from "react";
import { stopLenis, startLenis } from "@/components/providers/SmoothScrollProvider";

let lockCount = 0;

/**
 * Locks background window scroll when a modal or overlay is active,
 * while ensuring internal modal content scrolls smoothly without getting blocked.
 */
export function useBodyScrollLock(active: boolean = true) {
    useEffect(() => {
        if (!active) return;

        lockCount++;

        if (lockCount === 1) {
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;

            // 1. Native overflow lock on documentElement and body
            const style = document.createElement("style");
            style.id = "__scroll-lock__";
            style.textContent = `
                html, body {
                    overflow: hidden !important;
                    ${scrollbarWidth > 0 ? `padding-right: ${scrollbarWidth}px !important;` : ""}
                }
            `;
            document.head.appendChild(style);

            // 2. Pause Lenis smooth-scroll on main page
            stopLenis();

            // 3. Prevent touch-drag on backdrop outside modal scroll areas
            document.addEventListener("touchmove", preventTouchScroll, { passive: false });
        }

        return () => {
            lockCount = Math.max(0, lockCount - 1);
            if (lockCount === 0) {
                const style = document.getElementById("__scroll-lock__");
                if (style) style.remove();

                startLenis();

                document.removeEventListener("touchmove", preventTouchScroll);
            }
        };
    }, [active]);
}

/** Prevent touchmove on backdrop while permitting scroll inside any scrollable container */
function preventTouchScroll(e: TouchEvent) {
    const target = e.target as HTMLElement;
    if (
        target?.closest("[data-scroll-allow]") ||
        target?.closest("[data-lenis-prevent]") ||
        target?.closest(".overflow-y-auto") ||
        target?.closest(".overflow-y-scroll") ||
        target?.closest(".overflow-auto")
    ) {
        return;
    }
    e.preventDefault();
}
