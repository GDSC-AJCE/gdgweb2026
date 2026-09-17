import { useEffect } from "react";
import { stopLenis, startLenis } from "@/components/providers/SmoothScrollProvider";

let lockCount = 0;

/**
 * Locks background scroll when a modal/overlay is active.
 *
 * Handles three scroll vectors:
 *  1. Native browser overflow  – sets `overflow: hidden` on <html> + <body>
 *  2. Lenis smooth-scroll       – calls lenis.stop() / lenis.start()
 *  3. Touch scroll              – blocks touchmove events on the document
 *
 * Automatically compensates for scrollbar width to prevent layout shift.
 * Reference-counted so multiple simultaneous modals work correctly.
 */
export function useBodyScrollLock(active: boolean = true) {
    useEffect(() => {
        if (!active) return;

        lockCount++;

        if (lockCount === 1) {
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;

            // 1. Native overflow lock (+ scrollbar compensation)
            const style = document.createElement("style");
            style.id = "__scroll-lock__";
            style.textContent = `
                html, body {
                    overflow: hidden !important;
                    ${scrollbarWidth > 0 ? `padding-right: ${scrollbarWidth}px !important;` : ""}
                }
            `;
            document.head.appendChild(style);

            // 2. Pause Lenis smooth-scroll engine
            stopLenis();

            // 3. Block touch scroll on the background
            document.addEventListener("touchmove", preventTouchScroll, { passive: false });
        }

        return () => {
            lockCount = Math.max(0, lockCount - 1);
            if (lockCount === 0) {
                // Remove native overflow lock
                const style = document.getElementById("__scroll-lock__");
                if (style) style.remove();

                // Resume Lenis
                startLenis();

                // Restore touch scroll
                document.removeEventListener("touchmove", preventTouchScroll);
            }
        };
    }, [active]);
}

/** Prevent native touchmove on the document (blocks iOS rubber-band scroll). */
function preventTouchScroll(e: TouchEvent) {
    // Allow scrolling inside elements that explicitly opt-in via data-scroll-allow
    const target = e.target as HTMLElement;
    if (target?.closest("[data-scroll-allow]")) return;
    e.preventDefault();
}
