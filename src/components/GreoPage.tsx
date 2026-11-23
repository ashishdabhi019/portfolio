import { useState, useEffect } from "react";
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      const lenis = (window as any).__lenisInstance || (window as any).lenis;
      if (lenis && typeof lenis.stop === "function") {
        lenis.stop();
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      const lenis = (window as any).__lenisInstance || (window as any).lenis;
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="gm-overlay"
      onClick={onClose}
      data-cursor="disable"
      data-lenis-prevent="true"
    >
      <div
        className="gm-card"
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
          <span className="greo-label-status">ONLINE NOW</span>
        </div>
      </div>

      <GreoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default GreoButton;
