import { useEffect, useState, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  IoPersonOutline,
  IoBriefcaseOutline,
  IoMailOutline,
  IoLayersOutline,
  IoHomeOutline,
} from "react-icons/io5";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Liquid Glass Extraction State ──
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("about");
  const [displayLabel, setDisplayLabel] = useState("About Me");

  // GSAP Refs
  const centerPillRef = useRef<HTMLAnchorElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const extractedPillsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const coreSections = [
    { id: "about", label: "About Me" },
    { id: "whatido", label: "What I Do" },
    { id: "career", label: "Career & Experience" },
    { id: "work", label: "Selected Works" },
    { id: "techstack", label: "Tech Stack" },
    { id: "contact-form", label: "Let's Connect" },
    { id: "contact", label: "Contact Me" },
  ];

  let leftPills: any[] = [];
  let rightPills: any[] = [];

  const activeIdx = coreSections.findIndex((s) => s.id === activeSectionId);
  const activeLabel = coreSections[activeIdx]?.label || "About Me";

  // Directly handle strictly: Previous Page + CURRENT + Next Page (Circular wrap!)
  // If activeIdx is -1 (shouldn't happen), default to 0.
  const safeIdx = activeIdx === -1 ? 0 : activeIdx;
  const prevIdx = (safeIdx - 1 + coreSections.length) % coreSections.length;
  const nextIdx = (safeIdx + 1) % coreSections.length;
  leftPills = [coreSections[prevIdx]];
  rightPills = [coreSections[nextIdx]];

  // Calculate target X position relative to the center
  // We use char-count estimation for "good" spacing without jumpy DOM measurements.
  const getEstWidth = (label: string) => label.length * 8 + 48;
  const cWidth = getEstWidth(activeLabel);
  const gap = 14;

  const EXTRACT_DATA = [
    ...leftPills.reverse().map((p, idx) => {
      const pWidth = getEstWidth(p.label);
      return { ...p, targetX: -(cWidth / 2) - pWidth / 2 - gap - idx * 160 };
    }),
    ...rightPills.map((p, idx) => {
      const pWidth = getEstWidth(p.label);
      return { ...p, targetX: cWidth / 2 + pWidth / 2 + gap + idx * 160 };
    }),
  ];

  // ── ScrollSmoother setup ──────────────────────────────
  useEffect(() => {
    const isDesktop = window.innerWidth > 1024;
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: isDesktop ? 1.7 : 0,
      speed: isDesktop ? 1.7 : 1,
      effects: isDesktop,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    // Only pause on desktop (let scrollSmoother handle it)
    // On tablet/mobile use native scroll
    if (!isDesktop) smoother.paused(true);

    window.addEventListener("resize", () => ScrollSmoother.refresh(true));
  }, []);

  // ── Scroll → compact pill ─────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      // Auto-close mobile & desktop menu when user scrolls
      if (menuOpen) setMenuOpen(false);
      if (desktopExpanded) setDesktopExpanded(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen, desktopExpanded]);

  // ── Track Active Section ──────────────────────────────
  useEffect(() => {
    coreSections.forEach((sec, idx) => {
      const isLast = idx === coreSections.length - 1;

      ScrollTrigger.create({
        trigger: `#${sec.id}`,
        // Fire when the section's top edge reaches 50% down the viewport on all devices
        // This ensures the pill label reflects what the user is actually reading
        start: idx >= coreSections.length - 2 ? "top 70%" : "top 50%",
        end: isLast ? "bottom bottom" : "bottom 50%",
        onEnter: () => setActiveSectionId(sec.id),
        onEnterBack: () => setActiveSectionId(sec.id),
      });
    });

    ScrollTrigger.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Text Slide Morph Physics ───────────────────────────
  useEffect(() => {
    if (activeLabel !== displayLabel && centerTextRef.current && scrolled) {
      // Kill any running animation first to prevent flicker
      gsap.killTweensOf(centerTextRef.current);
      gsap.to(centerTextRef.current, {
        y: -12,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setDisplayLabel(activeLabel);
          gsap.fromTo(
            centerTextRef.current,
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" },
          );
        },
      });
    }
  }, [activeLabel, displayLabel, scrolled]);

 
  const isMobile = window.innerWidth <= 768 && "ontouchstart" in window;
  useEffect(() => {
    // ❌ Disable only for real phones (NOT iPads — iPads get the same expand animation as desktop)
    if (isMobile) return;

    if (!scrolled) {
      setDesktopExpanded(false);
      return;
    }

    let ctx = gsap.context(() => {
      const extractedEls = extractedPillsRef.current.filter(Boolean);

      const tl = gsap.timeline();

      if (!desktopExpanded) {
        // 👉 SHRINK (reverse path, horizontal inline)
        tl.to(extractedEls, {
          x: 0,
          y: 0,
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
          scale: 0.75,
          duration: 0.17,
          ease: "power3.in",
          pointerEvents: "none",
        }).to(
          centerPillRef.current,
          {
            paddingLeft: "20px",
            paddingRight: "20px",
            duration: 0.4,
            ease: "power3.inOut",
          },
          "-=0.4",
        );
      } else {
        // 👉 EXPAND (horizontal spread)
        tl.to(centerPillRef.current, {
          paddingLeft: "32px",
          paddingRight: "32px",
          scale: 1,
          duration: 0.2,
          ease: "power2.inOut",
        })
          .to(
            extractedEls,
            {
              x: (i) => EXTRACT_DATA[i]?.targetX || 0,
              y: 0,
              xPercent: -50,
              yPercent: -50,
              opacity: 1,
              scale: 1,
              duration: 0.9,
              ease: "elastic.out(1, 0.6)",
              pointerEvents: "auto",
            },
            "-=0.05",
          )
          .to(
            centerPillRef.current,
            {
              paddingLeft: "20px",
              paddingRight: "20px",
              duration: 0.4,
              ease: "power3.out",
            },
            "-=0.8",
          );
      }
    });

    return () => ctx.revert();
  }, [desktopExpanded, scrolled, EXTRACT_DATA]);

  // ── Section scroll helper ─────────────────────────────
  const scrollTo = (section: string | number) => {
    setMenuOpen(false);
    const isDesktop = window.innerWidth > 1024;
    if (isDesktop && smoother) {
      if (typeof section === "number") {
        smoother.scrollTo(section, true, "top top");
      } else {
        smoother.scrollTo(section, true, "top top");
      }
    } else {
      if (typeof section === "string") {
        document.querySelector(section)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: section, behavior: "smooth" });
      }
    }
  };

  const navLinks = [
    { label: "ABOUT", href: "#about" },
    { label: "WORK", href: "#work" },
    { label: "GREO", href: "https://greo.in" },
    { label: "CONTACT", href: "#contact" },
  ];

  return (
    <>
      <div className={`header${scrolled ? " scrolled desktop-mode" : ""}`}>
        {/* ── Center pill group: pill + home dot + expanded pills tethered to center ── */}
        <div className="nav-center-group">
          {/* ────── Expanded Pills ────── */}
          {scrolled &&
            EXTRACT_DATA.map((sec, i) => (
              <a
                key={`extra_${sec.id}_${i}`}
                ref={(el) => (extractedPillsRef.current[i] = el)}
                href={`#${sec.id}`}
                className="nav-logo-pill extracted-pill"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(`#${sec.id}`);
                  setDesktopExpanded(false);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    lineHeight: 1,
                    height: "100%",
                  }}
                >
                  <span className="nav-name-first">{sec.label}</span>
                </div>
              </a>
            ))}

          <a
            href="/#"
            ref={centerPillRef}
            className={`nav-logo-pill ${desktopExpanded ? "expanded" : ""}`}
            data-cursor="disable"

            onClick={(e) => {
              e.preventDefault();

              const isPhone =
                window.innerWidth <= 768 && "ontouchstart" in window;

              if (isPhone) {
                scrollTo(0); // only phones scroll to top
              } else if (scrolled) {
                setDesktopExpanded(!desktopExpanded); // iPad + desktop — expand 3 pills
              }
            }}
          >
            {scrolled ? (
              <>
                <div
                  ref={centerTextRef}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    lineHeight: 1,
                    height: "100%",
                  }}
                >
                  <span className="nav-name-first">{displayLabel}</span>
                </div>
              </>
            ) : (
              <>
                <span className="nav-name-first">Ashish</span>
                <span className="nav-name-last">Dabhi</span>
              </>
            )}
          </a>

          {/* Home dot anchored to right of pill */}
          {scrolled && !desktopExpanded && (
            <div
              className="nav-home-dot"
              data-cursor="disable"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                scrollTo(0);
                setDesktopExpanded(false);
              }}
            >
              <IoHomeOutline className="nav-home-icon" />
            </div>
          )}
        </div>

        {/* ── Email pill — desktop center only ── */}
        <a
          href="mailto:ashishdabhi2003@gmail.com"
          className="nav-email-pill"
          data-cursor="disable"
        >
          ashishdabhi2003@gmail.com
        </a>

        {/* ── Desktop nav links pill ── */}
        <ul className="nav-links-pill">
          {navLinks.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={(e) => {
                  if (href.startsWith("/") || href.startsWith("http")) return; // let browser navigate to new page
                  e.preventDefault();
                  scrollTo(href);
                }}
              >
                <HoverLinks text={label} />
              </a>
            </li>
          ))}
        </ul>

        {/* ── Mobile hamburger circle (right) ── */}
        <div
          className={`nav-menu-circle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          <div className="hlines">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      {/* ── Mobile iOS-style Context Menu ── */}
      {menuOpen && (
        <>
          <div
            className="mobile-menu-backdrop"
            onClick={() => setMenuOpen(false)}
          />
          <div className="mobile-ios-menu">
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#about");
              }}
            >
              <IoPersonOutline className="menu-icon" />
              <span>About</span>
            </a>
            <a
              href="#whatido"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#whatido");
              }}
            >
              <IoLayersOutline className="menu-icon" />
              <span>What I Do</span>
            </a>
            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#work");
              }}
            >
              <IoBriefcaseOutline className="menu-icon" />
              <span>Selected Works</span>
            </a>
            <a
              href="#career"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#career");
              }}
            >
              <IoBriefcaseOutline className="menu-icon" />
              <span>Career & Exp</span>
            </a>
            <a
              href="#techstack"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#techstack");
              }}
            >
              <IoLayersOutline className="menu-icon" />
              <span>Tech Stack</span>
            </a>
            <a
              href="https://greo.in"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLayersOutline className="menu-icon" />
              <span>Greo AI</span>
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#contact");
              }}
            >
              <IoMailOutline className="menu-icon" />
              <span>Contact</span>
            </a>
          </div>
        </>
      )}

      <div className="landing-circle1" />
      <div className="landing-circle2" />
      <div className="nav-fade" />
    </>
  );
};

export default Navbar;
