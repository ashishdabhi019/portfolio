import logoWhite from "../assets/logo_white.png";

/**
 * Greo floating button — redirects to greo.in
 * The full Greo app lives at: github.com/ashishdabhi019/Greo
 * CSS for this button is in src/index.css
 */
export default function GreoChatArea() {
  return (
    <a
      id="greo-trigger-wrapper"
      href="https://greo.in"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Greo AI"
      data-cursor="disable"
    >
      <button id="greo-ring-btn" aria-label="Talk to Greo">
        <img src={logoWhite} alt="Greo" className="greo-mob-logo" />
      </button>
      <span id="greo-trigger-label">Try Greo</span>
    </a>
  );
}
