import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { EDITORIAL_EASE } from "./utils/motionPresets";
import "./styles/WorkStats.css";

interface StatItem {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
}

const PORTFOLIO_STATS: StatItem[] = [
  {
    value: 12,
    suffix: "+",
    label: "PROJECTS DELIVERED",
  },
  {
    value: 25,
    suffix: "+",
    label: "CORE TECHNOLOGIES",
  },
  {
    value: 2,
    suffix: "+",
    label: "YEARS EXPERIENCE",
  },
  {
    value: 98.4,
    decimals: 1,
    suffix: "%",
    label: "PEAK MODEL PRECISION",
  },
];

function formatStatNumber(val: number, decimals: number): string {
  return decimals > 0 ? val.toFixed(decimals) : String(Math.round(val));
}

function AnimatedStatValue({
  value,
  decimals = 0,
  suffix = "",
  active,
  delay = 0,
}: Pick<StatItem, "value" | "decimals" | "suffix"> & {
  active: boolean;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<string>(() =>
    prefersReducedMotion
      ? formatStatNumber(value, decimals)
      : formatStatNumber(0, decimals),
  );
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(formatStatNumber(value, decimals));
      return;
    }

    if (!active || hasAnimated.current) return;
    hasAnimated.current = true;

    const controls = animate(0, value, {
      duration: 1.9,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (latest) => {
        setDisplayValue(formatStatNumber(latest, decimals));
      },
      onComplete: () => {
        setDisplayValue(formatStatNumber(value, decimals));
      },
    });

    return () => controls.stop();
  }, [active, value, decimals, delay, prefersReducedMotion]);

  return (
    <span className="work-stats-value">
      {displayValue}
      {suffix && <span className="work-stats-suffix">{suffix}</span>}
    </span>
  );
}

const WorkStats = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, amount: 0.15 });

  return (
    <section className="work-stats-section" aria-label="Engineering metrics">
      <div className="work-stats-inner">
        <div className="work-stats-grid" ref={gridRef}>
          {PORTFOLIO_STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="work-stats-cell"
              initial={{ opacity: 0, y: 24 }}
              animate={
                gridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
              }
              transition={{
                duration: 0.75,
                delay: index * 0.06,
                ease: EDITORIAL_EASE,
              }}
            >
              <AnimatedStatValue
                value={stat.value}
                decimals={stat.decimals}
                suffix={stat.suffix}
                active={gridInView}
                delay={index * 0.06}
              />
              <motion.span
                className="work-stats-label"
                initial={{ opacity: 0, y: 10 }}
                animate={
                  gridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                }
                transition={{
                  duration: 0.7,
                  delay: index * 0.06 + 0.1,
                  ease: EDITORIAL_EASE,
                }}
              >
                {stat.label}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkStats;
