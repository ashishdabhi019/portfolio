import { motion, Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLoading } from "../context/LoadingProvider";

gsap.registerPlugin(ScrollTrigger);

interface FramerTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  staggerDelay?: number;
  yOffset?: number;
}

export const FramerText = ({
  text,
  className = "",
  as: Component = "p",
  staggerDelay = 0.02,
  yOffset = 30,
}: FramerTextProps) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [hasAppeared, setHasAppeared] = useState(false);

  let isLoading = false;
  try {
    const loadingContext = useLoading();
    isLoading = loadingContext.isLoading;
  } catch {
    isLoading = false;
  }

  useEffect(() => {
    // Never trigger while the full-screen loader is still active
    if (isLoading || hasAppeared) return;

    const el = ref.current;
    if (!el) return;

    let triggerInstance: ScrollTrigger | null = null;
    let observer: IntersectionObserver | null = null;

    const reveal = () => {
      setHasAppeared(true);
      if (triggerInstance) triggerInstance.kill();
      if (observer) observer.disconnect();
    };

    // If already in viewport on mount (e.g. reload or anchor jump), reveal immediately
    const rect = el.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    if (rect.top <= windowHeight * 0.9 && rect.bottom >= 0) {
      reveal();
      return;
    }

    // 1. Primary: GSAP ScrollTrigger (seamlessly synchronized with Lenis and GSAP timeline)
    triggerInstance = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: reveal,
    });

    // 2. Secondary: IntersectionObserver with zero negative margin
    observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some(
            (entry) => entry.isIntersecting || entry.intersectionRatio > 0
          )
        ) {
          reveal();
        }
      },
      {
        threshold: 0.05,
      }
    );
    observer.observe(el);

    // 3. Fallback: Lenis and native scroll check
    const checkScroll = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      if (r.top <= h * 0.9 && r.bottom >= 0) {
        reveal();
      }
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });

    const lenis = (window as any).__lenisInstance || (window as any).lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", checkScroll);
    }

    // 4. Safety failsafe: ensure text is NEVER permanently hidden if user is near it
    const failsafeTimer = setTimeout(() => {
      const r = el.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      if (r.top <= h * 1.1) {
        reveal();
      }
    }, 4000);

    return () => {
      if (triggerInstance) triggerInstance.kill();
      if (observer) observer.disconnect();
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", checkScroll);
      }
      clearTimeout(failsafeTimer);
    };
  }, [isLoading, hasAppeared]);

  // Split text into words for paragraph animation
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const MotionComponent =
    Component === "span"
      ? motion.span
      : Component === "div"
      ? motion.div
      : motion.p;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={hasAppeared ? "visible" : "hidden"}
      style={{ display: "inline-block", willChange: "transform, opacity" }}
    >
      {words.map((word, index) => (
        <span
          key={index}
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          <motion.span
            variants={childVariants}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  );
};

export default FramerText;
