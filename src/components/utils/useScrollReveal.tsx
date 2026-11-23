import { useEffect, RefObject } from "react";
import gsap from "gsap";

/**
 * useScrollLineReveal
 *
 * Drives a clean masked-line scroll reveal animation matching the
 * older high-end editorial layout:
 * - Line 1: "Tell us what"
 * - Line 2: "you're building."
 * - Triggers ONCE when scrolled into view (never resets on repeated scroll)
 * - Zero blur / zero glow (crisp typography)
 * - Multi-layer trigger (IntersectionObserver + Lenis scroll listener + failsafe)
 *   so the title is NEVER stuck invisible.
 */
export function useScrollLineReveal(titleRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const lines = el.querySelectorAll<HTMLElement>(".title-reveal-line");
    if (!lines.length) return;

    let hasTriggered = false;

    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const initialRect = el.getBoundingClientRect();

    const triggerReveal = () => {
      if (hasTriggered) return;
      hasTriggered = true;

      gsap.fromTo(
        lines,
        {
          yPercent: 115,
          opacity: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.14,
          clearProps: "transform,opacity",
        },
      );
    };

    // If already in viewport on mount, trigger immediately
    if (initialRect.top <= windowHeight * 0.9 && initialRect.bottom >= 0) {
      triggerReveal();
      return;
    }

    // Set initial hidden state for offscreen elements
    gsap.set(lines, { yPercent: 115, opacity: 0 });

    // 1. Primary: IntersectionObserver (robust with smooth-scroll and virtual scroll)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            triggerReveal();
            observer.disconnect();
            break;
          }
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: [0, 0.1],
      },
    );

    observer.observe(el);

    // 2. Secondary: Lenis smooth scroll listener
    const checkScrollPosition = () => {
      if (hasTriggered) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= windowHeight * 0.92 && rect.bottom >= 0) {
        triggerReveal();
        observer.disconnect();
      }
    };

    const lenis = (window as any).__lenisInstance || (window as any).lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", checkScrollPosition);
    }

    window.addEventListener("scroll", checkScrollPosition, { passive: true });

    // 3. Failsafe: Ensure text is NEVER permanently hidden
    const failsafeTimer = setTimeout(() => {
      if (!hasTriggered) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight * 1.1) {
          triggerReveal();
          observer.disconnect();
        }
      }
    }, 1500);

    return () => {
      observer.disconnect();
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", checkScrollPosition);
      }
      window.removeEventListener("scroll", checkScrollPosition);
      clearTimeout(failsafeTimer);
    };
  }, [titleRef]);
}
