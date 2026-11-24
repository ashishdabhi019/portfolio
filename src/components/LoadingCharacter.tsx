import { useEffect, useState } from "react";
import { useLoading } from "../context/LoadingProvider";
import { motion } from "framer-motion";
import "./styles/MinimalLoader.css";

/* ════════════════════════════════════════════════════════
   Cinematic Editorial Loader:
   • Pure black background
   • Top header: ASHISH DABHI (left) · LOADING EXPERIENCE (right)
   • Center: Giant bold kinetic ASHISH DABHI reveal on complete
   • Bottom horizontal divider line
   • Bottom-left: LONDON · DUBAI · JEDDAH · TORONTO
   • Bottom-right: Bold orange 000-100 counter
   ════════════════════════════════════════════════════════ */

const LoadingCharacter = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();

  const [displayNum, setDisplayNum] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [exiting, setExiting] = useState(false);

  /* ── Smooth animated 000 -> 100 counter ── */
  useEffect(() => {
    const target = Math.min(100, Math.max(0, percent));
    if (target === displayNum) return;
    const diff = target - displayNum;
    const step = Math.sign(diff) * Math.max(1, Math.ceil(Math.abs(diff) / 5));
    const t = setTimeout(() => {
      setDisplayNum((n) => {
        const next = n + step;
        return diff > 0 ? Math.min(next, target) : Math.max(next, target);
      });
    }, 28);
    return () => clearTimeout(t);
  }, [percent, displayNum]);

  /* ── Reveal center giant title when approaching 100% ── */
  useEffect(() => {
    if (displayNum >= 82 || percent >= 100) {
      setShowTitle(true);
    }
  }, [displayNum, percent]);

  /* ── Trigger exit once 100 is reached and title is presented ── */
  useEffect(() => {
    if (displayNum >= 100) {
      const t = setTimeout(() => {
        setExiting(true);
      }, 750);
      return () => clearTimeout(t);
    }
  }, [displayNum]);

  const WORDS = ["PORTFOLIO"];
  let charCounter = 0;

  return (
    <motion.div
      className="f-loader"
      data-lenis-prevent="true"
      initial={{ y: 0 }}
      animate={{ y: exiting ? "-100%" : 0 }}
      transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
      onAnimationComplete={() => {
        if (exiting) {
          import("./utils/initialFX").then((mod) => {
            mod.initialFX?.();
            setIsLoading(false);
          });
        }
      }}
    >
      {/* ── Top Bar ── */}
      <div className="f-loader-top">
        <span className="f-loader-brand">ASHISH DABHI</span>
        <span className="f-loader-status">LOADING EXPERIENCE</span>
      </div>

      {/* ── Center Massive Bold Title with 3D Bottom Flip Animation ── */}
      <div className="f-loader-center">
        <h1 className="f-loader-title" aria-label="Portfolio">
          {WORDS.map((word, wIdx) => (
            <span className="f-loader-word" key={wIdx}>
              {word.split("").map((char, cIdx) => {
                const idx = charCounter++;
                return (
                  <span className="f-loader-char-mask" key={cIdx}>
                    <motion.span
                      className="f-loader-char"
                      initial={{ y: "130%", rotateX: -90, opacity: 0 }}
                      animate={
                        showTitle
                          ? {
                              y: ["130%", "-4%", "0%"],
                              rotateX: [-90, 8, 0],
                              opacity: [0, 1, 1],
                            }
                          : { y: "130%", rotateX: -90, opacity: 0 }
                      }
                      transition={{
                        duration: 0.75,
                        delay: idx * 0.035,
                        times: [0, 0.72, 1],
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {char}
                    </motion.span>
                  </span>
                );
              })}
            </span>
          ))}
        </h1>
      </div>

      {/* ── Bottom Section ── */}
      <div className="f-loader-bottom">
        {/* Giant Orange Counter */}
        <div className="f-loader-counter-row">
          <div className="f-loader-counter">
            {String(Math.min(100, displayNum)).padStart(3, "0")}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingCharacter;

export const setProgress = (
  setLoading: (value: number | ((prev: number) => number)) => void
) => {
  let internalPercent = 0;
  let interval = setInterval(() => {
    if (internalPercent <= 50) {
      internalPercent = Math.min(50, internalPercent + Math.round(Math.random() * 5));
      setLoading((prev) => Math.max(prev, internalPercent));
    } else {
      clearInterval(interval);
      interval = setInterval(() => {
        internalPercent = Math.min(91, internalPercent + Math.round(Math.random()));
        setLoading((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return prev;
          }
          return Math.max(prev, internalPercent);
        });
        if (internalPercent > 91) clearInterval(interval);
      }, 2000);
    }
  }, 100);

  const clear = () => {
    clearInterval(interval);
    setLoading(100);
  };
  const loaded = (): Promise<number> =>
    new Promise((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (internalPercent < 100) {
          internalPercent++;
          setLoading((prev) => Math.max(prev, internalPercent));
        } else {
          resolve(internalPercent);
          clearInterval(interval);
        }
      }, 2);
    });
  return { loaded, percent: internalPercent, clear };
};
