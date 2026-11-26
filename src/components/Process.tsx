import { useEffect, useRef } from "react";
import "./styles/Process.css";
import { useScrollLineReveal } from "./utils/useScrollReveal";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "Discover",
    description:
      "Workshops, data audit, and technical scoping to understand your constraints, workflows, and AI feasibility.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "Selecting optimal foundation models, designing modular RAG & agentic pipelines, and interactive UX prototyping.",
  },
  {
    number: "03",
    title: "Engineer",
    description:
      "Clean, tested code, prompt engineering, vector database indexing, and scalable APIs shipped in short iterations.",
  },
  {
    number: "04",
    title: "Launch",
    description:
      "Rigorous LLM evals, hallucination mitigation, latency benchmarks, security audits, and a calm, monitored release.",
  },
  {
    number: "05",
    title: "Evolve",
    description:
      "Continuous telemetry, model cost reduction, caching layers, and a roadmap that keeps your product improving.",
  },
];

const Process = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useScrollLineReveal(headerRef);

  useEffect(() => {
    const container = cardsContainerRef.current;
    const probe = probeRef.current;
    if (!container || !probe) return;

    let stackBaseTop = 96;
    let stackStep = 22.4;
    let offsets: number[] = [];
    let heights: number[] = [];
    let isMobileMode = false;

    const updateStickyState = () => {
      const cards = cardRefs.current;
      if (!isMobileMode) {
        for (let i = 0; i < cards.length; i++) {
          cards[i]?.classList.remove("is-stack-sticky");
        }
        return;
      }

      const vh = window.innerHeight || document.documentElement.clientHeight;
      const containerRect = container.getBoundingClientRect();

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card) continue;
        const cardHeight = heights[i] || 270;
        const stackTop = stackBaseTop + i * stackStep;
        const naturalTop = containerRect.top + (offsets[i] || 0);

        // Only activate position:sticky once the card has scrolled well above Safari's
        // bottom toolbar zone, so sticky layers never intersect the bottom viewport edge.
        const isAboveBottomZone = stackTop + cardHeight < vh - 65;
        const shouldStick =
          isAboveBottomZone &&
          naturalTop <= stackTop + 70 &&
          containerRect.bottom > 0;

        card.classList.toggle("is-stack-sticky", shouldStick);
      }
    };

    const measureFlowGeometry = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      isMobileMode = vw <= 1024 && vh > 500;

      if (!isMobileMode) {
        updateStickyState();
        return;
      }

      const probeStyle = getComputedStyle(probe);
      stackBaseTop = parseFloat(probeStyle.top) || 96;
      stackStep = parseFloat(probeStyle.height) || 22.4;

      const cards = cardRefs.current;
      const nextOffsets: number[] = [];
      const nextHeights: number[] = [];
      let y = 0;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card) continue;
        nextOffsets[i] = y;
        const h = card.getBoundingClientRect().height;
        nextHeights[i] = h;
        const mb = parseFloat(getComputedStyle(card).marginBottom) || 0;
        y += h + mb;
      }

      offsets = nextOffsets;
      heights = nextHeights;
      updateStickyState();
    };

    measureFlowGeometry();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measureFlowGeometry)
        : null;
    ro?.observe(container);

    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", measureFlowGeometry, { passive: true });

    let lenisUnsub: (() => void) | undefined;
    const attachLenis = () => {
      const lenis = (window as any).__lenisInstance || (window as any).lenis;
      if (lenis && typeof lenis.on === "function") {
        lenis.on("scroll", updateStickyState);
        lenisUnsub = () => lenis.off?.("scroll", updateStickyState);
      }
    };
    const rafId = requestAnimationFrame(attachLenis);

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", measureFlowGeometry);
      lenisUnsub?.();
    };
  }, []);

  return (
    <section className="process-section" id="process">
      {/* ── Top full-width divider line ── */}
      <div className="process-top-border" aria-hidden="true" />

      <div className="process-container">
        {/* ── Header: Eyebrow + Headline + Subtext ── */}
        <div className="process-header">
          <div className="process-header-left" ref={headerRef}>
            {/* Eyebrow: (06) —— HOW I WORK */}
            <div className="process-tag-mask">
              <div className="title-reveal-line process-tag">
                <span className="process-tag-num">(10)</span>
                <span className="process-tag-line" aria-hidden="true" />
                <span className="process-tag-label">HOW I WORK</span>
              </div>
            </div>

            {/* Scroll Font Reveal Headline */}
            <h2 className="process-heading">
              <span className="process-reveal-mask">
                <span className="title-reveal-line">A process built</span>
              </span>
              <span className="process-reveal-mask">
                <span className="title-reveal-line">
                  for <em className="process-heading-serif">momentum</em>
                  <span className="process-heading-dot">.</span>
                </span>
              </span>
            </h2>
          </div>

          <div className="process-header-right">
            <p className="process-subtitle">
              Clear milestones, honest estimates, and production-ready code
              shipped in short sprints — you always know exactly where your
              build stands.
            </p>
          </div>
        </div>

        {/* ── Stacking Cards List ── */}
        <div className="process-cards-container" ref={cardsContainerRef}>
          <div className="process-stack-probe" ref={probeRef} aria-hidden="true" />
          {PROCESS_STEPS.map((step, index) => (
            <div
              key={step.number}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="process-card"
              style={
                {
                  "--card-index": index,
                  "--stack-offset": index,
                } as React.CSSProperties
              }
            >
              <div className="process-card-inner">
                <div className="process-card-left">
                  <span className="process-card-num">{step.number}</span>
                  <h3 className="process-card-title">{step.title}</h3>
                </div>
                <div className="process-card-right">
                  <p className="process-card-desc">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
