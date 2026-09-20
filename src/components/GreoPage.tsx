import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
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
      <span id="greo-trigger-label">Ask Greo...</span>
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
          pauseDuration={5000}
          showCursor={false}
          textColors={["#ffffff"]}
        />
        <div className="gp-badge">
          <span className="gp-dot" />
          Currently in production
        </div>
        <p className="gp-sub">
          More updates coming soon.
        </p>
      </div>

      <button 
        className="gp-back" 
        onClick={() => window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate("/")} 
        aria-label="Go Back"
      >
        <IoArrowBack className="gp-back-icon" />
        <span className="gp-back-text">Back</span>
      </button>
    </div>
  );
}
