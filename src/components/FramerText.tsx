import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

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
      animate={isInView ? "visible" : "hidden"}
      style={{ display: "inline-block", willChange: "transform, opacity" }}
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
