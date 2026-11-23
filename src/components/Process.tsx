import { useRef } from "react";
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
  useScrollLineReveal(headerRef);

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
        <div className="process-cards-container">
          {PROCESS_STEPS.map((step, index) => (
            <div
              key={step.number}
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
