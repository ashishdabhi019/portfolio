import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import logoWhite from "../assets/logo_white.png";
import logoBlack from "../assets/logo_black.png";
import "./styles/GreoPage.css";
import TextType from "./TextType";

/* ─────────────────────────────────────────────────────────
   GreoModal — floating card on desktop, full drawer on mobile
   ───────────────────────────────────────────────────────── */
export function GreoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false);
  const [origin, setOrigin] = useState<{
    x: number;
    y: number;
    cardX: number;
    cardY: number;
  } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let rAF: number;
    if (isOpen) {
      const btn =
        document.getElementById("greo-ring-btn") ||
        document.getElementById("greo-trigger-wrapper");
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const bx = Math.round(rect.left + rect.width / 2);
        const by = Math.round(rect.top + rect.height / 2);

        // Pre-calculate card origin for desktop layout
        const cardW = Math.min(420, window.innerWidth - 48);
        const cardH = Math.min(640, window.innerHeight - 48);
        const cardLeft = window.innerWidth - 30 - cardW;
        const cardTop = window.innerHeight - 24 - cardH;

        setOrigin({
          x: bx,
          y: by,
          cardX: Math.round(bx - cardLeft),
          cardY: Math.round(by - cardTop),
        });
      }
      setShouldRender(true);
      rAF = requestAnimationFrame(() => {
        // Measure real card element once mounted for exact pixel accuracy
        if (btn && cardRef.current) {
          const btnRect = btn.getBoundingClientRect();
          const cardRect = cardRef.current.getBoundingClientRect();
          const bx = Math.round(btnRect.left + btnRect.width / 2);
          const by = Math.round(btnRect.top + btnRect.height / 2);
          setOrigin({
            x: bx,
            y: by,
            cardX: Math.round(bx - cardRect.left),
            cardY: Math.round(by - cardRect.top),
          });
        }
        setIsAnimatingOpen(true);
      });
      document.body.style.overflow = "hidden";
      const lenis = (window as any).__lenisInstance || (window as any).lenis;
      if (lenis && typeof lenis.stop === "function") {
        lenis.stop();
      }
      return () => {
        cancelAnimationFrame(rAF);
      };
    } else {
      setIsAnimatingOpen(false);
      document.body.style.overflow = "";
      document.body.style.overflowY = "auto";
      const lenis = (window as any).__lenisInstance || (window as any).lenis;
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
      timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`gm-overlay ${isAnimatingOpen ? "gm-overlay--open" : ""}`}
      onClick={onClose}
      data-cursor="disable"
      data-lenis-prevent="true"
    >
      <div
        ref={cardRef}
        className="gm-card"
        style={
          origin
            ? ({
                "--greo-origin-x": `${origin.x}px`,
                "--greo-origin-y": `${origin.y}px`,
                "--greo-card-x": `${origin.cardX}px`,
                "--greo-card-y": `${origin.cardY}px`,
              } as React.CSSProperties)
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Greo Status"
      >
        <div className="gm-glow" />

        {/* Top Header */}
        <div className="gm-header">
          <div className="gm-header-left">
            <div className="gm-logo-icon">
              <img
                src={logoWhite}
                alt="Greo"
                className="greo-mob-logo greo-logo--dark"
              />
              <img
                src={logoBlack}
                alt="Greo"
                className="greo-mob-logo greo-logo--light"
              />
            </div>
            <div className="gm-header-info">
              <span className="gm-header-title">Greo</span>
              <div className="gm-header-sub">Ashish&apos;s AI Assistant</div>
            </div>
          </div>
          <button
            type="button"
            className="gm-close-btn"
            onClick={onClose}
            aria-label="Close Greo window"
            data-cursor="disable"
          >
            <IoClose className="gm-close-icon" />
          </button>
        </div>

        {/* Body Content - Exact same Work In Progress look */}
        <div className="gm-body">
          <div className="gm-logo-wrap">
            <img
              src={logoWhite}
              alt="Greo"
              className="gp-logo greo-logo--dark"
            />
            <img
              src={logoBlack}
              alt="Greo"
              className="gp-logo greo-logo--light"
            />
          </div>

          <TextType
            as="h2"
            className="gp-heading"
            text={[
              "Working on it.",
              "Crafting code.",
              "Polishing UI.",
              "Almost there.",
              "Fixing bugs.",
              "Deploying soon.",
              "Stay tuned.",
              "Designing future.",
              "Connecting DB.",
              "Optimizing app.",
              "Scaling up.",
              "Squashing bugs.",
              "Brewing coffee.",
            ]}
            typingSpeed={90}
            deletingSpeed={40}
            pauseDuration={5000}
            showCursor={false}
          />

          <div className="gp-badge">
            <span className="gp-dot" />
            Currently in production
          </div>

          <p className="gp-sub">More updates coming soon.</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────
   GreoButton — floating button shown on the main portfolio
   ───────────────────────────────────────────────────────── */
export function GreoButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        id="greo-trigger-wrapper"
        role="button"
        aria-label={isOpen ? "Close Greo window" : "Open Greo status"}
        data-cursor="disable"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ cursor: "pointer" }}
        className={isOpen ? "is-active" : ""}
      >
        <button id="greo-ring-btn" aria-label="Open Greo status" tabIndex={-1}>
          <img
            src={logoWhite}
            alt="Greo"
            className="greo-mob-logo greo-logo--dark"
          />
          <img
            src={logoBlack}
            alt="Greo"
            className="greo-mob-logo greo-logo--light"
          />
        </button>
        <div id="greo-trigger-label">
          <span className="greo-label-title">Ask Greo</span>
          <span className="greo-label-status">
            <span className="greo-status-dot" aria-hidden="true" />
            ONLINE NOW
          </span>
        </div>
      </div>

      <GreoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default GreoButton;
