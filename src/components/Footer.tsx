import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { MdArrowOutward } from "react-icons/md";
import "./styles/Footer.css";
import SecretModal from "./SecretModal";
import PhotoGallery from "./PhotoGallery";
import { useScrollLineReveal } from "./utils/useScrollReveal";

/* ── Split string into individual letter <span>s for per-letter hover ── */
const SplitText = ({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) => {
  const letters = text.split("");
  return (
    <span className="footer-name" onClick={onClick}>
      {letters.map((char, i) =>
        char === " " ? (
          <span key={i} className="footer-letter footer-letter-space">
            {"\u00A0"}
          </span>
        ) : (
          <span
            key={i}
            className="footer-letter"
            style={{ transitionDelay: `${i * 55}ms` }}
          >
            {char}
          </span>
        ),
      )}
    </span>
  );
};

const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const ctaTitleRef = useRef<HTMLHeadingElement>(null);

  // Clean masked-line scroll font reveal animation matching older look (triggers once, zero blur, zero glow)
  useScrollLineReveal(ctaTitleRef);

  const handleUnlock = () => {
    setShowModal(false);
    setTimeout(() => setShowGallery(true), 200);
  };

  const handleScrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const lenis = (window as any).__lenisInstance || (window as any).lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo("#contact-form", {
        offset: 0,
        immediate: false,
      });
      return;
    }

    const target = document.getElementById("contact-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          FOOTER ROOT — unified continuous background (#131318)
      ══════════════════════════════════════════════════════════ */}
      <footer className="footer-root" id="contact">
        {/* ── Top CTA Section: "Let's build something remarkable together." ── */}
        <section className="footer-cta-block">
          {/* Ambient top center background glow matching reference image */}
          <div className="footer-cta-glow" aria-hidden="true" />

          {/* Full-width top border matching bottom divider */}
          <div className="footer-cta-top-border" aria-hidden="true" />

          <div className="footer-cta-inner">
            {/* Eyebrow */}
            <p className="footer-cta-eyebrow">HAVE A PROJECT IN MIND?</p>

            {/* Big headline with clean masked line scroll font reveal (older look & position) */}
            <h2 ref={ctaTitleRef} className="footer-cta-heading">
              <span className="title-reveal-mask">
                <span className="title-reveal-line">Let's build</span>
              </span>
              <span className="title-reveal-mask">
                <span className="title-reveal-line">something</span>
              </span>
              <span className="title-reveal-mask">
                <span className="title-reveal-line">
                  <em className="footer-cta-serif">remarkable</em>
                  <span className="footer-cta-together--desktop">
                    {" "}
                    together.
                  </span>
                </span>
              </span>
              <span className="title-reveal-mask footer-cta-together--mobile-mask">
                <span className="title-reveal-line">together.</span>
              </span>
            </h2>

            {/* CTA row */}
            <div className="footer-cta-actions">
              <a
                href="#contact-form"
                onClick={handleScrollToForm}
                className="footer-cta-btn"
                data-cursor="disable"
              >
                <span className="footer-cta-btn__text">Start a project</span>
                <span className="footer-cta-btn__icon" aria-hidden="true">
                  <span className="footer-cta-arrow-track">
                    <svg
                      className="footer-cta-arrow footer-cta-arrow--front"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                    <svg
                      className="footer-cta-arrow footer-cta-arrow--back"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </span>
              </a>
              <a
                href="mailto:ashishdabhi2003@gmail.com"
                className="footer-cta-email"
                data-cursor="disable"
              >
                ashishdabhi2003@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* ── Full-width divider between CTA and footer info ── */}
        <div className="footer-divider" aria-hidden="true" />

        {/* ── Main Footer Info & Big Display Name ── */}
        <div className="footer-main-block">
          <div className="footer-inner">
            {/* ── Three-column info row (perfect Swiss editorial alignment) ── */}
            <div className="footer-top">
              {/* Col 1 — Contact */}
              <div className="footer-col">
                <p className="footer-col-label">CONTACT</p>
                <div className="footer-col-content">
                  <a
                    href="mailto:ashishdabhi2003@gmail.com"
                    className="footer-link"
                    data-cursor="disable"
                  >
                    ashishdabhi2003@gmail.com
                  </a>
                  <a
                    href="tel:+919328232215"
                    className="footer-link"
                    data-cursor="disable"
                  >
                    +91 93282 32215
                  </a>
                  <span className="footer-location">Gujarat, India</span>
                </div>
              </div>

              {/* Col 2 — Socials */}
              <div className="footer-col">
                <p className="footer-col-label">SOCIALS</p>
                <div className="footer-col-content">
                  {[
                    {
                      label: "Github",
                      href: "https://github.com/ashishdabhi019",
                    },
                    {
                      label: "LinkedIn",
                      href: "https://www.linkedin.com/in/ashish-dabhi-6549b8289/",
                    },
                    {
                      label: "X (Twitter)",
                      href: "https://x.com/AshishDabh41722",
                    },
                    {
                      label: "Instagram",
                      href: "https://www.instagram.com/whyuashish",
                    },
                  ].map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="disable"
                      className="footer-social-link"
                    >
                      <span className="footer-social-name">{label}</span>
                      <MdArrowOutward
                        className="footer-social-icon"
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Col 3 — Role & Availability */}
              <div className="footer-col footer-col-role footer-col-about">
                <p className="footer-col-label">ROLE</p>
                <div className="footer-col-content">
                  <p className="footer-about-text">
                    AI / ML Engineer &amp; Full-Stack Developer
                  </p>
                  <p className="footer-about-sub">
                    B.E. Computer Science &amp; Engineering
                  </p>
                  <p className="footer-avail-text">
                    Open to freelance &amp; full-time opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Big name — full-width, centered, zero clipping ──
              🔒 Secret easter egg: clicking the name opens SecretModal */}
          <div className="footer-name-wrap">
            <SplitText text="ASHISH DABHI" onClick={() => setShowModal(true)} />
          </div>

          {/* ── Full-width edge-to-edge bottom line ── */}
          <div className="footer-bottom-divider" aria-hidden="true" />

          {/* ── Bottom bar ── */}
          <div className="footer-bottom">
            <div className="footer-bottom-inner">
              <span className="footer-copy">
                © 2026 Ashish Dabhi. All rights reserved.
              </span>
              <span className="footer-made">
                Designed &amp; Developed by Ashish Dabhi
              </span>
            </div>
          </div>
        </div>
      </footer>

      {showModal &&
        createPortal(
          <SecretModal
            onUnlock={handleUnlock}
            onClose={() => setShowModal(false)}
          />,
          document.body,
        )}

      {showGallery &&
        createPortal(
          <PhotoGallery onClose={() => setShowGallery(false)} />,
          document.body,
        )}
    </>
  );
};

export default Footer;
