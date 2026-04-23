import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";


const LOADING_BG = "/images/one.png";

const STATUS_LABELS = [
  { threshold: 75, label: "Almost there…"   },
  { threshold: 50, label: "Building scene…" },
  { threshold: 25, label: "Loading assets…" },
  { threshold: 0,  label: "Starting up…"    },
];

function getStatus(pct: number) {
  return pct >= 100
    ? "Ready to explore"
    : STATUS_LABELS.find((s) => pct >= s.threshold)?.label ?? "Starting up…";
}

/* ─────────────────────────────────────────────────────── */

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();

  const [loaded,  setLoaded]  = useState(false); // percent hit 100
  const [clicked, setClicked] = useState(false); // button pressed

  /* show the button once assets are ready */
  if (percent >= 100 && !loaded) {
    setTimeout(() => setLoaded(true), 400);
  }

  /* handle button click → expand → unmount */
  function handleEnter() {
    if (!loaded || clicked) return;
    import("./utils/initialFX").then((module) => {
      setClicked(true);
      setTimeout(() => {
        module.initialFX?.();
        setIsLoading(false);
      }, 900);
    });
  }

  /* mouse glow on the button wrap */
  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }

  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="loading-screen"
      style={{ backgroundImage: `url(${LOADING_BG})` }}
    >
      {/* dark overlay so text stays legible */}
      <div className="loading-overlay" />

      {/* ── hero stack ── */}
      <div className={`loading-hero ${clicked ? "hero-exit" : ""}`}>

        {/* big heading */}
        <div className="loading-welcome">Welcome</div>

        {/* greeting block */}
        <div className="loading-greeting-block">
          <div className="loading-greeting-rule" />
          <div className="loading-greeting-title">
            Ashish Dabhi &nbsp;·&nbsp; AI / ML Engineer
          </div>
          <p className="loading-greeting-sub">
            You've arrived at my <em>personal portfolio</em> — a curated space
            showcasing my work in artificial intelligence, machine learning,
            and full-stack development.
          </p>
        </div>

        {/* ── glass button / expanding wrap ── */}
        <div
          className={`loading-wrap ${clicked ? "loading-clicked" : ""} ${loaded ? "wrap-ready" : ""}`}
          onMouseMove={handleMouseMove}
          onClick={handleEnter}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleEnter()}
          aria-label="Enter portfolio"
        >
          <div className="loading-hover" />

          <div className="loading-pill">
            {/* progress arc — hidden when loaded */}
            {!loaded && (
              <div className="l-spinner">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="15"
                    stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="94.2"
                    strokeDashoffset={94.2 - (94.2 * clamped) / 100}
                    transform="rotate(-90 18 18)"
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                  />
                </svg>
              </div>
            )}

            {/* button label — swaps in when loaded */}
            <div className="l-pill-text">
              {loaded ? (
                <>
                  <span className="l-enter-label">
                    Enter Portfolio
                    <svg className="l-arrow" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </>
              ) : (
                <>
                  <span className="l-status">{getStatus(clamped)}</span>
                  <span className="l-percent">{clamped}%</span>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* corners */}
      <div className="loading-corner loading-corner-left">
        <span className="loading-dot" />Live
      </div>
      <div className="loading-corner">Portfolio · 2025</div>
    </div>
  );
};

export default Loading;

/* ─── setProgress (unchanged API) ────────────────────── */
export const setProgress = (setLoading: (value: number) => void) => {
  let percent = 0;

  let interval = setInterval(() => {
    if (percent <= 50) {
      percent = Math.min(50, percent + Math.round(Math.random() * 5));
      setLoading(percent);
    } else {
      clearInterval(interval);
      interval = setInterval(() => {
        percent = Math.min(91, percent + Math.round(Math.random()));
        setLoading(percent);
        if (percent > 91) clearInterval(interval);
      }, 2000);
    }
  }, 100);

  const clear = () => { clearInterval(interval); setLoading(100); };

  const loaded = (): Promise<number> =>
    new Promise((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) { percent++; setLoading(percent); }
        else { resolve(percent); clearInterval(interval); }
      }, 2);
    });

  return { loaded, percent, clear };
};