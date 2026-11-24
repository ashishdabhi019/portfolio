import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import logoWhite from "../assets/logo_white.png";
import logoBlack from "../assets/logo_black.png";
import "./styles/GreoPage.css";
import TextType from "./TextType";
import GlassSurface from "./GlassSurface";

/* ─────────────────────────────────────────────────────────
   GreoModal — floating card on desktop, full screen on mobile
   ───────────────────────────────────────────────────────── */
export function GreoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    let timer: number | undefined;
    const lenis = (window as any).__lenisInstance || (window as any).lenis;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (lenis && typeof lenis.stop === "function") {
        lenis.stop();
      }
    } else {
      timer = window.setTimeout(() => {
        document.body.style.overflow = "";
        document.body.style.overflowY = "auto";
        const currentLenis = (window as any).__lenisInstance || (window as any).lenis;
        if (currentLenis && typeof currentLenis.start === "function") {
          currentLenis.start();
        }
      }, 500);
    }
    return () => {
      if (timer) clearTimeout(timer);
      document.body.style.overflow = "";
      document.body.style.overflowY = "auto";
      const currentLenis = (window as any).__lenisInstance || (window as any).lenis;
      if (currentLenis && typeof currentLenis.start === "function") {
        currentLenis.start();
      }
    };
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

  return createPortal(
    <div
      className={`gm-overlay ${isOpen ? "gm-overlay--open" : ""}`}
      onClick={onClose}
      data-cursor="disable"
      aria-hidden={!isOpen}
    >
      <div
        className="gm-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal={isOpen ? "true" : "false"}
        aria-label="Greo Status"
        data-lenis-prevent="true"
        tabIndex={isOpen ? 0 : -1}
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
            tabIndex={isOpen ? 0 : -1}
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
            key={isOpen ? "open" : "closed"}
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
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Hysteresis buffer prevents rapid jitter/flicker when cursor grazes the perimeter
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        id="greo-trigger-wrapper"
        role="button"
        aria-label={isOpen ? "Close Greo window" : "Open Greo status"}
        data-cursor="disable"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: "pointer" }}
        className={`${isOpen ? "is-open is-active" : ""} ${isHovered ? "is-hovered" : ""}`}
      >
        {/* Soft accent glow halo radiating outward */}
        <div className="greo-border-glow" aria-hidden="true">
          <div className="greo-border-glow-core" />
        </div>

        {/* Real GlassSurface backdrop for the expanded pill */}
        <div className="greo-trigger-bg" aria-hidden="true">
          <GlassSurface
            width="100%"
            height="100%"
            borderRadius={100}
            distortionScale={-180}
            displace={0.5}
            backgroundOpacity={0.12}
            className="greo-pill-glass"
          />
        </div>

        {/* Crisp border beam / shine tracing around the perimeter */}
        <div className="greo-border-shine" aria-hidden="true">
          <div className="greo-border-shine-core" />
        </div>

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
