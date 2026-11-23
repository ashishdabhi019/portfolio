import { useEffect, useRef, useState } from "react";
import "./styles/Navbar.css";
import { applyCursorAccent } from "../utils/cursor";

/* ─── nav sections ─────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#whatido" },
  { label: "Work", href: "#work" },
  { label: "Career", href: "#career" },
  { label: "Contact", href: "#contact" },
];

const MOBILE_LINKS = [
  { num: "01", label: "Home", href: "#" },
  { num: "02", label: "About", href: "#about" },
  { num: "03", label: "Skills", href: "#whatido" },
  { num: "04", label: "Work", href: "#work" },
  { num: "05", label: "Career", href: "#career" },
  { num: "06", label: "Contact", href: "#contact-form" },
];

const ACCENT_COLORS = [
  { label: "Orange", hex: "#F97316" },
  { label: "Purple", hex: "#7F61F4" },
  { label: "Cyan", hex: "#2AD4ED" },
  { label: "Lime", hex: "#C5F337" },
  { label: "Red", hex: "#C71C34" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<"Dark" | "Light" | "Auto">(
    "Dark",
  );
  const [activeAccent, setActiveAccent] = useState<string>("#F97316");

  const popoverRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);
  const ticking = useRef(false);

  /* ── theme handling (Dark / Light / Auto) with smooth switching ── */
  const applyResolvedTheme = (resolved: "dark" | "light") => {
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
    document.body.style.removeProperty("background-color");
  };

  const handleThemeChange = (theme: "Dark" | "Light" | "Auto") => {
    setActiveTheme(theme);
    try {
      localStorage.setItem("portfolio_theme", theme);
    } catch {
      // ignore local storage restrictions
    }

    if (theme === "Auto") {
      document.documentElement.setAttribute("data-theme-setting", "auto");
      const systemLight =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;
      applyResolvedTheme(systemLight ? "light" : "dark");
    } else {
      document.documentElement.setAttribute(
        "data-theme-setting",
        theme.toLowerCase(),
      );
      applyResolvedTheme(theme === "Light" ? "light" : "dark");
    }
  };

  /* ── initialize theme from localStorage or system on mount ───── */
  useEffect(() => {
    let saved: "Dark" | "Light" | "Auto" | null = null;
    try {
      saved = localStorage.getItem("portfolio_theme") as
        | "Dark"
        | "Light"
        | "Auto"
        | null;
    } catch {
      saved = null;
    }
    const initial = saved || "Dark";
    setActiveTheme(initial);

    let savedAccent = "#F97316";
    try {
      const sessionAccent = sessionStorage.getItem("portfolio_accent");
      if (sessionAccent) {
        savedAccent = sessionAccent;
      } else {
        localStorage.removeItem("portfolio_accent");
      }
    } catch {
      savedAccent = "#F97316";
    }
    setActiveAccent(savedAccent);
    document.documentElement.style.setProperty("--accentColor", savedAccent);
    document.documentElement.style.setProperty("--accent", savedAccent);
    document.documentElement.style.setProperty(
      "--accentColorLight",
      savedAccent === "#F97316" ? "#FB923C" : savedAccent,
    );
    document.documentElement.style.setProperty("--theme-accent", savedAccent);
    document.documentElement.style.setProperty("--cta-bg", savedAccent);
    applyCursorAccent(savedAccent);
    window.dispatchEvent(
      new CustomEvent("accentColorChange", { detail: savedAccent })
    );

    if (initial === "Auto") {
      document.documentElement.setAttribute("data-theme-setting", "auto");
      const systemLight =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;
      applyResolvedTheme(systemLight ? "light" : "dark");
    } else {
      document.documentElement.setAttribute(
        "data-theme-setting",
        initial.toLowerCase(),
      );
      applyResolvedTheme(initial === "Light" ? "light" : "dark");
    }

    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = (e: MediaQueryListEvent) => {
      let cur = "Dark";
      try {
        cur = localStorage.getItem("portfolio_theme") || "Dark";
      } catch {
        cur = "Dark";
      }
      if (cur === "Auto") {
        applyResolvedTheme(e.matches ? "light" : "dark");
      }
    };
    mql.addEventListener("change", onSystemChange);
    return () => mql.removeEventListener("change", onSystemChange);
  }, []);

  /* ── handle accent color selection ──────────────────────────── */
  const handleAccentChange = (hex: string) => {
    setActiveAccent(hex);
    try {
      sessionStorage.setItem("portfolio_accent", hex);
    } catch {
      // ignore
    }
    document.documentElement.style.setProperty("--accentColor", hex);
    document.documentElement.style.setProperty("--accent", hex);
    document.documentElement.style.setProperty(
      "--accentColorLight",
      hex === "#F97316" ? "#FB923C" : hex,
    );
    document.documentElement.style.setProperty("--theme-accent", hex);
    document.documentElement.style.setProperty("--cta-bg", hex);
    applyCursorAccent(hex);
    window.dispatchEvent(
      new CustomEvent("accentColorChange", { detail: hex })
    );
  };

  /* ── close desktop popover on outside click or escape key ─────── */
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setThemeOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setThemeOpen(false);
      }
    };
    if (themeOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [themeOpen]);

  /* ── scroll: transparent at top → frosted-glass when scrolled ── */
  /* navbar NEVER hides — always stays visible                       */
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 40);
        lastY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── lock body scroll smoothly without layout shifts on close ── */
  useEffect(() => {
    let timer: number | undefined;
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      // Delay clearing overflow until close animation completes to prevent layout jump
      timer = window.setTimeout(() => {
        document.body.style.overflow = "";
      }, 350);
    }
    return () => {
      if (timer) clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* ── smooth scroll helper ────────────────────────────────────── */
  const scrollTo = (href: string) => {
    setMenuOpen(false);
    document.body.style.overflow = "";
    const lenis = (window as any).lenis;
    if (href === "#") {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    if (lenis) {
      lenis.scrollTo(href, { duration: 1.2, offset: -80 });
    } else {
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 60);
    }
  };

  /* ── classes ─────────────────────────────────────────────────── */
  const navCls = [
    "nf-nav",
    scrolled ? "nf-nav--scrolled" : "",
    menuOpen ? "nf-nav--menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* ══════════ NAVBAR ══════════ */}
      <nav className={navCls} aria-label="Main navigation" data-cursor="disable">
        <div className="nf-nav__inner" data-cursor="disable">
          {/* ── LEFT: logo ────────────────────────────────────── */}
          <a
            href="#"
            className="nf-logo"
            data-cursor="disable"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#");
            }}
            aria-label="Ashish Dabhi — home"
          >
            {/* Desktop / Tablet: Lettermark + Stacked Name */}
            <div className="nf-logo__desktop">
              {/* Clean AD monogram lettermark with dynamic accent triangle/dot */}
              <div className="nf-logo__badge" aria-hidden="true">
                <svg
                  className="nf-logo__badge-svg"
                  viewBox="0 0 272 151"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Accent Triangle / Dot in dynamic accent color */}
                  <path
                    className="nf-logo__dot"
                    d="M 26 90 L 52 151 H 0 Z"
                    fill="var(--accentColor, #F97316)"
                  />

                  {/* Main AD Lettermark — white in dark theme, black in light theme */}
                  <path
                    className="nf-logo__mark"
                    d="M 63 0 H 98 L 151 122 H 189 C 214 122 234 101 234 75 C 234 49 212 28 184 28 H 150 L 137 0 H 191 C 233 0 267 34 267 75.5 C 267 117 233 151 191 151 H 128 Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>

              {/* Name with swipe-up rolling text hover effect (matching Work, Skills, About) */}
              <div className="nf-logo__text">
                <span className="nf-logo__name">
                  <span className="nf-logo__roll" aria-hidden="true">
                    <span className="nf-logo__roll-text nf-logo__roll-text--front">
                      Ashish <span className="nf-logo__surname">Dabhi</span>
                    </span>
                    <span className="nf-logo__roll-text nf-logo__roll-text--bottom">
                      Ashish <span className="nf-logo__surname">Dabhi</span>
                    </span>
                  </span>
                  <span className="nf-sr-only">Ashish Dabhi</span>
                </span>
              </div>
            </div>

            {/* Mobile (≤ 834px): AD lettermark only — no text */}
            <div className="nf-logo__mobile" aria-hidden="true">
              <svg
                className="nf-logo__badge-svg"
                viewBox="0 0 272 151"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Accent Triangle / Dot in dynamic accent color */}
                <path
                  className="nf-logo__dot"
                  d="M 26 90 L 52 151 H 0 Z"
                  fill="var(--accentColor, #F97316)"
                />

                {/* Main AD Lettermark — white in dark theme, black in light theme */}
                <path
                  className="nf-logo__mark"
                  d="M 63 0 H 98 L 151 122 H 189 C 214 122 234 101 234 75 C 234 49 212 28 184 28 H 150 L 137 0 H 191 C 233 0 267 34 267 75.5 C 267 117 233 151 191 151 H 128 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
          </a>

          {/* ── CENTRE: nav links (desktop/tablet ≥ 769px) ────── */}
          <div className="nf-links-wrapper" data-cursor="disable">
            <ul className="nf-links" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="nf-links__item"
                    data-cursor="disable"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(href);
                    }}
                  >
                    <span className="nf-roll-box" aria-hidden="true">
                      <span className="nf-roll-box__text nf-roll-box__text--front">
                        {label}
                      </span>
                      <span className="nf-roll-box__text nf-roll-box__text--bottom">
                        {label}
                      </span>
                    </span>
                    <span className="nf-sr-only">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── RIGHT: controls ───────────────────────────────── */}
          <div className="nf-controls" data-cursor="disable">
            {/* Theme popover wrapper (desktop/tablet) */}
            <div className="nf-theme-popover-wrap" ref={popoverRef} data-cursor="disable">
              <button
                className={`nf-theme-btn${themeOpen ? " is-active" : ""}`}
                data-cursor="disable"
                aria-label={`Theme & accent settings (Current: ${activeTheme})`}
                aria-expanded={themeOpen}
                aria-haspopup="true"
                title="Theme & accent settings"
                onClick={() => setThemeOpen((v) => !v)}
              >
                {/* half-moon split icon with smooth rotation on toggle */}
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  style={{
                    transform:
                      activeTheme === "Light"
                        ? "rotate(180deg)"
                        : activeTheme === "Auto"
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path d="M12 2a10 10 0 0 0 0 20V2Z" fill="currentColor" />
                </svg>
              </button>

              {/* Floating Theme Popover Card on Big Screen */}
              <div
                className={`nf-theme-dropdown${themeOpen ? " is-open" : ""}`}
                role="dialog"
                aria-label="Theme and accent settings"
                data-cursor="disable"
              >
                {/* THEME Section */}
                <div className="nf-popover-section">
                  <div className="nf-popover-title">THEME</div>
                  <div
                    className="nf-theme-switcher"
                    data-active={activeTheme}
                    role="radiogroup"
                    aria-label="Theme selection"
                  >
                    <span className="nf-theme-slider" aria-hidden="true" />
                    {(["Dark", "Light", "Auto"] as const).map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        role="radio"
                        aria-checked={activeTheme === theme}
                        className={`nf-theme-tab${activeTheme === theme ? " is-active" : ""}`}
                        onClick={() => handleThemeChange(theme)}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ACCENT Section */}
                <div className="nf-popover-section">
                  <div className="nf-popover-title">ACCENT</div>
                  <div
                    className="nf-accent-row"
                    role="radiogroup"
                    aria-label="Accent color selection"
                  >
                    {ACCENT_COLORS.map(({ label, hex }) => (
                      <button
                        key={label}
                        type="button"
                        role="radio"
                        aria-checked={activeAccent === hex}
                        aria-label={`${label} accent`}
                        className={`nf-accent-swatch${activeAccent === hex ? " is-active" : ""}`}
                        style={{ backgroundColor: hex }}
                        onClick={() => handleAccentChange(hex)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA pill — scrolls to Contact section */}
            <a
              href="#contact-form"
              className="nf-cta"
              data-cursor="disable"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#contact-form");
              }}
            >
              <span className="nf-cta__text">Let's talk</span>
            </a>

            {/* Mobile hamburger ─ 2 sleek parallel bars */}
            <button
              className={`nf-hamburger${menuOpen ? " nf-hamburger--open" : ""}`}
              data-cursor="disable"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className="nf-hamburger__bar" />
              <span className="nf-hamburger__bar" />
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════ MOBILE FULL-SCREEN OVERLAY ══════════ */}
      <div
        className={`nf-overlay${menuOpen ? " nf-overlay--open" : ""}`}
        data-cursor="disable"
        aria-hidden={!menuOpen}
      >
        {/* backdrop tap-to-close */}
        <div
          className="nf-overlay__backdrop"
          onClick={() => setMenuOpen(false)}
        />

        <div className="nf-overlay__panel">
          {/* Spacer allowing persistent fixed navbar (AD▪ logo, Let's talk CTA, ✕ button) to sit cleanly on top */}
          <div className="nf-overlay__spacer" aria-hidden="true" />

          {/* Large numbered navigation links list with divider lines */}
          <nav className="nf-overlay__links" aria-label="Mobile navigation">
            {MOBILE_LINKS.map(({ num, label, href }, i) => (
              <div
                key={label}
                className="nf-overlay__row"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <div className="nf-overlay__item">
                  <a
                    href={href}
                    className="nf-overlay__link"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(href);
                    }}
                  >
                    <span className="nf-overlay__num">{num}</span>
                    <span className="nf-overlay__label">{label}</span>
                  </a>
                </div>
              </div>
            ))}
          </nav>

          {/* THEME segmented capsule toggle with smooth sliding indicator */}
          <div className="nf-overlay__section">
            <div className="nf-overlay__section-title">THEME</div>
            <div
              className="nf-theme-switcher"
              data-active={activeTheme}
              role="radiogroup"
              aria-label="Theme selection"
            >
              {/* Sliding white pill indicator */}
              <span className="nf-theme-slider" aria-hidden="true" />
              {(["Dark", "Light", "Auto"] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  role="radio"
                  aria-checked={activeTheme === theme}
                  className={`nf-theme-tab${activeTheme === theme ? " is-active" : ""}`}
                  onClick={() => handleThemeChange(theme)}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* ACCENT color swatches */}
          <div className="nf-overlay__section">
            <div className="nf-overlay__section-title">ACCENT</div>
            <div
              className="nf-accent-row"
              role="radiogroup"
              aria-label="Accent color selection"
            >
              {ACCENT_COLORS.map(({ label, hex }) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={activeAccent === hex}
                  aria-label={`${label} accent`}
                  className={`nf-accent-swatch${activeAccent === hex ? " is-active" : ""}`}
                  style={{ backgroundColor: hex }}
                  onClick={() => handleAccentChange(hex)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background ambient blobs removed to eliminate side glitches */}
    </>
  );
};

export default Navbar;
