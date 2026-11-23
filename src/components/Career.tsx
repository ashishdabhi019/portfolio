import { useRef } from "react";
import { useScrollLineReveal } from "./utils/useScrollReveal";
import "./styles/Career.css";

const LordiconLocationPin = () => (
  <span className="career-lordicon-wrap" aria-hidden="true">
    <svg className="career-lordicon-svg" viewBox="-44 -44 88 102" fill="none">
      {/* Ground Impact Shockwave Lines (Shape Layer 1) */}
      <g className="career-lordicon-ground">
        <line
          x1="0"
          y1="50.2"
          x2="-38"
          y2="50.2"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="50.2"
          x2="38"
          y2="50.2"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
      {/* Dynamic Jumping & Wobbling Pin Group (Layer 2 & Layer 3) */}
      <g className="career-lordicon-pin">
        <path
          className="career-lordicon-body"
          d="M-31.669,6.468 C-32.746,3.135 -33.377,-0.409 -33.377,-4.105 C-33.377,-23.266 -17.227,-38.656 2.215,-37.404 C18.698,-36.343 32.098,-23.040 33.285,-6.566 C33.595,-2.266 33.050,1.865 31.902,5.720 C26.544,23.707 0.003,50.200 0.003,50.200 C0.003,50.200 -24.979,27.166 -31.669,6.468 Z"
          stroke="currentColor"
          strokeWidth="5.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          className="career-lordicon-core"
          cx="0"
          cy="-4.103"
          r="15.704"
          stroke="currentColor"
          strokeWidth="5.8"
        />
      </g>
    </svg>
  </span>
);

const Career = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  useScrollLineReveal(headerRef);

  return (
    <section id="career" className="career-section">
      <div className="career-container">
        {/* Left-Aligned Header Block with Reveal Animation */}
        <div className="career-header" ref={headerRef}>
          {/* Signature Section Tag: (03) —— PROFESSIONAL JOURNEY with scroll reveal */}
          <div className="career-tag-mask">
            <div className="title-reveal-line career-tag">
              <span className="career-tag-num">(03)</span>
              <span className="career-tag-line" aria-hidden="true" />
              <span className="career-tag-label">PROFESSIONAL JOURNEY</span>
            </div>
          </div>

          {/* Left-aligned signature headline with cool 2nd large title in italic serif */}
          <h2 className="career-title">
            <span className="career-reveal-mask">
              <span className="title-reveal-line">From Code to</span>
            </span>
            <span className="career-reveal-mask">
              <span className="title-reveal-line">
                <span className="career-title-accent">Intelligence</span>
                <span className="career-title-dot">.</span>
              </span>
            </span>
          </h2>

          {/* Subtitle description */}
          <div className="career-desc-mask">
            <p className="career-intro-desc">
              An overview of my professional journey, from software development
              to engineering intelligent AI systems, autonomous agents, and
              scalable solutions.
            </p>
          </div>
        </div>

        {/* Central interactive timeline with generous space above */}
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot" aria-hidden="true" />
          </div>

          {/* ITEM 1: AI Engineer @ Drytis.ai */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4 className="career-role-title">AI Engineer</h4>
                <div className="career-company-badge">
                  <span className="career-company">Drytis.ai</span>
                  <span className="career-location">
                    <LordiconLocationPin />
                    <span className="career-location-text">Remote</span>
                  </span>
                </div>
              </div>
              <h3 className="career-year">2026</h3>
            </div>
            <p className="career-desc">
              Working as an AI Engineer designing, building, and optimizing
              production-grade AI/ML pipelines and model integrations.
              Developing voice-based AI chatbots, conversational agents, and
              intelligent automation workflows to streamline business processes.
              Collaborating with cross-functional teams utilizing LLMs, RAG
              pipelines, and modern AI/ML frameworks to deliver scalable,
              high-performance solutions.
            </p>
          </div>

          {/* ITEM 2: Software Developer @ Stackyzer Technologies */}
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4 className="career-role-title">
                  Software Developer – Python &amp; AI/ML
                </h4>
                <div className="career-company-badge">
                  <span className="career-company">Stackyzer Technologies</span>
                  <span className="career-location">
                    <LordiconLocationPin />
                    <span className="career-location-text">Ahmedabad</span>
                  </span>
                </div>
              </div>
              <h3 className="career-year">2024</h3>
            </div>
            <p className="career-desc">
              Gained 1+ year of hands-on experience in Python &amp; AI/ML
              product development. Built Lumina — an AI-powered RAG
              conversational assistant, the FirststepAI Crate Tracker
              (full-stack, real-time), and Testio — an automated online test
              system via PDF upload. Deployed ML models on NVIDIA Jetson edge
              hardware for real-time inference. Participated in agile sprints
              delivering scalable AI/ML solutions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Career;
