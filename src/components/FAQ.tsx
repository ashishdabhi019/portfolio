import { useState, useRef } from "react";
import "./styles/FAQ.css";
import { useScrollLineReveal } from "./utils/useScrollReveal";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "What kind of projects do you work on?",
    answer:
      "I build full-stack web applications, AI/ML solutions, mobile apps, and SaaS products. My stack spans React, Next.js, Node.js, Python, and AI tools like LangChain, OpenAI, and custom LLM pipelines. Whether it's a sleek frontend or a smart backend, I bring it end-to-end.",
  },
  {
    question: "Do you work with clients remotely?",
    answer:
      "Yes — 100% remote, anywhere in the world. I'm comfortable with async communication across time zones and use tools like Slack, Notion, Loom, and GitHub to keep things moving efficiently.",
  },
  {
    question: "How does a project typically work?",
    answer:
      "We start with a discovery call to scope your idea, then I deliver a clear proposal with milestones, timeline, and pricing. After kickoff, I work in short sprints with regular updates and demos so you're never in the dark.",
  },
  {
    question: "What is your approach to AI and ML projects?",
    answer:
      "I focus on practical AI — things that actually work in production. This means building clean data pipelines, selecting the right model for the task, integrating APIs like OpenAI or Gemini, and testing rigorously before deployment. No hype, just real results.",
  },
  {
    question: "How much does a project cost?",
    answer:
      "Every project is different. Simple landing pages start from a few hundred dollars; complex AI applications or full SaaS platforms can range much higher. After our initial call, I'll give you a transparent estimate with no surprises.",
  },
  {
    question: "How do I start a project with you?",
    answer:
      "Just fill out the form below or send me an email at ashishdabhi2003@gmail.com. Tell me what you're building, your timeline, and any relevant details. I'll get back to you within 24 hours to set up a call.",
  },
];

interface FAQItemAccordionProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItemAccordion = ({ item, isOpen, onToggle }: FAQItemAccordionProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
      <button
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
        data-cursor="disable"
      >
        <span className="faq-question-text">{item.question}</span>
        <span className="faq-toggle" aria-hidden="true">
          {isOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </button>
      <div
        ref={contentRef}
        className="faq-answer-wrap"
        style={{ maxHeight: isOpen ? (contentRef.current?.scrollHeight ?? 400) + "px" : "0px" }}
      >
        <p className="faq-answer">{item.answer}</p>
      </div>
      <div className="faq-divider" aria-hidden="true" />
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  useScrollLineReveal(headingRef);
  return (
    <section className="faq-section">
      {/* ── Top border ── */}
      <div className="faq-top-border" aria-hidden="true" />

      <div className="faq-container">
        <div className="faq-grid">
          {/* ── Left — sticky heading ── */}
          <div className="faq-left" ref={headingRef}>
            <div className="faq-eyebrow-mask">
              <div className="title-reveal-line faq-eyebrow">
                <span className="faq-eyebrow-num">(11)</span>
                <span className="faq-eyebrow-line" aria-hidden="true" />
                <span className="faq-eyebrow-label">FAQ</span>
              </div>
            </div>

            <h2 className="faq-heading">
              <span className="faq-reveal-mask">
                <span className="title-reveal-line">Questions,</span>
              </span>
              <span className="faq-reveal-mask">
                <span className="title-reveal-line">
                  <em className="faq-heading-serif">answered</em>
                  <span className="faq-heading-dot">.</span>
                </span>
              </span>
            </h2>
          </div>

          {/* ── Right — accordion ── */}
          <div className="faq-right">
            {FAQ_DATA.map((item, i) => (
              <FAQItemAccordion
                key={i}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex((prev) => (prev === i ? null : i))}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
