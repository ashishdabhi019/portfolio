import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/FAQ.css";
import { useScrollLineReveal } from "./utils/useScrollReveal";
import {
  EDITORIAL_EASE,
  VIEWPORT_REVEAL,
  staggerDelay,
} from "./utils/motionPresets";

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
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItemAccordion = ({
  item,
  index,
  isOpen,
  onToggle,
}: FAQItemAccordionProps) => {
  return (
    <motion.div
      className={`faq-item${isOpen ? " faq-item--open" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_REVEAL}
      transition={{
        duration: 0.55,
        delay: staggerDelay(index, 0.045, 0.25),
        ease: EDITORIAL_EASE,
      }}
    >
      <button
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
        data-cursor="disable"
      >
        <span className="faq-question-text">{item.question}</span>
        <span className="faq-toggle" aria-hidden="true">
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.35, ease: EDITORIAL_EASE }}
          >
            <line
              x1="2"
              y1="8"
              x2="14"
              y2="8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <motion.line
              x1="8"
              y1="2"
              x2="8"
              y2="14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              initial={false}
              animate={{
                opacity: isOpen ? 0 : 1,
                scaleY: isOpen ? 0 : 1,
              }}
              style={{ originX: "8px", originY: "8px" }}
              transition={{ duration: 0.22, ease: EDITORIAL_EASE }}
            />
          </motion.svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="faq-answer"
            className="faq-answer-wrap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.42, ease: EDITORIAL_EASE },
              opacity: { duration: 0.26, ease: "easeOut" },
            }}
            style={{ overflow: "hidden" }}
          >
            <p className="faq-answer">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="faq-divider" aria-hidden="true" />
    </motion.div>
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
                index={i}
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
