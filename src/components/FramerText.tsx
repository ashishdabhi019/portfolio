import { motion, useInView, Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
  const isInView = useInView(ref, { once: true, amount: 0.05, margin: "0px 0px 100px 0px" });
  const [hasAppeared, setHasAppeared] = useState(false);

  useEffect(() => {
    if (isInView) {
      setHasAppeared(true);
    }
  }, [isInView]);

  // Robust visibility check for Lenis smooth scroll and instant trigger on mount
  useEffect(() => {
    if (hasAppeared) return;

    const checkVisibility = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight + 80 && rect.bottom > 0) {
        setHasAppeared(true);
      }
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    const lenis = (window as any).__lenisInstance || (window as any).lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", checkVisibility);
    }

    // Safety timeout: guaranteed reveal so text is never blank
    const timer = setTimeout(() => {
      setHasAppeared(true);
    }, 1500);

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", checkVisibility);
      }
      clearTimeout(timer);
    };
  }, [hasAppeared]);

  // Split text into words for paragraph animation
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
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

  const MotionComponent = motion(Component as any);

  return (
    <MotionComponent
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={hasAppeared ? "visible" : "hidden"}
      style={{ display: "block", willChange: "transform, opacity" }}
    >
      {words.map((word, index) => (
        <span key={index} style={{ display: "inline-block", marginRight: "0.25em" }}>
          <motion.span variants={childVariants} style={{ display: "inline-block" }}>
            {word}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  );
};

export default FramerText;
