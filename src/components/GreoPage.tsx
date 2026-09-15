import { useNavigate } from "react-router-dom";
import logoWhite from "../assets/logo_white.png";
import "./styles/GreoPage.css";
import TextType from "./TextType";

/* ─────────────────────────────────────────────────────────
   GreoButton — floating button shown on the main portfolio
   ───────────────────────────────────────────────────────── */
export function GreoButton() {
  const navigate = useNavigate();

  return (
    <div
      id="greo-trigger-wrapper"
      role="button"
      aria-label="View Greo status"
      data-cursor="disable"
      onClick={() => navigate("/greo")}
      style={{ cursor: "pointer" }}
    >
      <button id="greo-ring-btn" aria-label="Open Greo status">
        <img src={logoWhite} alt="Greo" className="greo-mob-logo" />
      </button>
      <span id="greo-trigger-label">Try Greo</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   GreoPage — full /greo status page
   ───────────────────────────────────────────────────────── */
export default function GreoPage() {
  const navigate = useNavigate();
  return (
    <div className="gp-root">
      <div className="gp-glow" />

      <div className="gp-content">
        <img src={logoWhite} alt="Greo" className="gp-logo" />
        <TextType
          as="h1"
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
            "Brewing coffee."
          ]}
          typingSpeed={90}
          deletingSpeed={40}
          pauseDuration={8000}
          showCursor={false}
          textColors={["#ffffff"]}
        />
        <div className="gp-badge">
          <span className="gp-dot" />
          Currently in production
        </div>
        <p className="gp-sub">
          Come back soon at{" "}
          <a href="https://greo.com" target="_blank" rel="noopener noreferrer">
            greo.com
          </a>
        </p>
      </div>

      <button 
        className="gp-back" 
        onClick={() => window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate("/")} 
        aria-label="Go Back"
      >
        <span className="gp-back-text">← Back</span>
        <svg className="gp-back-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
