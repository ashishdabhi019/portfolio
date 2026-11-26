import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  EDITORIAL_EASE,
  TACTILE_SPRING,
  VIEWPORT_REVEAL,
} from "./utils/motionPresets";

const AI_TAGS = [
  "Python",
  "LangChain",
  "LangGraph",
  "CrewAI",
  "OpenAI",
  "Hugging Face",
  "N8N",
  "RAG",
];

const FULLSTACK_TAGS = [
  "Django",
  "FastAPI",
  "Flask",
  "React",
  "Node.js",
  "PostgreSQL",
  "MongoDB",
  "REST APIs",
];

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };
  useEffect(() => {
    const clickHandlers = new Map<HTMLDivElement, () => void>();

    // Use window.innerWidth as a fallback for ScrollTrigger.isTouch on responsive views (including iPad Pro portrait)
    const isPortraitTablet =
      window.innerHeight > window.innerWidth && window.innerWidth <= 1050;
    if (ScrollTrigger.isTouch || window.innerWidth <= 1024 || isPortraitTablet) {
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");

          const handler = () => handleClick(container);
          clickHandlers.set(container, handler);
          container.addEventListener("click", handler);
        }
      });
    }

    return () => {
      containerRef.current.forEach((container) => {
        if (container) {
          const handler = clickHandlers.get(container);
          if (handler) {
            container.removeEventListener("click", handler);
          }
        }
      });
    };
  }, []);
  return (
    <div id="whatido" className="whatIDO">
      <div className="what-box">
        <motion.h2
          className="title what-title"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_REVEAL}
          transition={{ duration: 0.65, ease: EDITORIAL_EASE }}
        >
          What <br />
          I <em className="what-title-serif">do</em>
          <span className="what-title-dot">.</span>
        </motion.h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%" height="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 0)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>

            <div className="what-content-in">
              <h3>AI / ML</h3>
              <h4>Intelligent Product Development</h4>
              <p>
                Designing intelligent AI systems — autonomous agents, workflow
                automations, and RAG pipelines that think, reason, and act.
                Turning complex AI research into production-ready solutions.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                {AI_TAGS.map((tag) => (
                  <motion.div
                    key={tag}
                    className="what-tags"
                    whileHover={{ y: -2, scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    transition={TACTILE_SPRING}
                  >
                    {tag}
                  </motion.div>
                ))}
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 1)}
          >
            <div className="what-border1">
              <svg height="100%">
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
              </svg>
            </div>
            <div className="what-corner"></div>
            <div className="what-content-in">
              <h3>FULL-STACK</h3>
              <h4>End-to-End Web Development</h4>
              <p>
                Developing full-stack applications with modern frameworks —
                from real-time data platforms to RESTful APIs and interactive
                frontends.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                {FULLSTACK_TAGS.map((tag) => (
                  <motion.div
                    key={tag}
                    className="what-tags"
                    whileHover={{ y: -2, scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    transition={TACTILE_SPRING}
                  >
                    {tag}
                  </motion.div>
                ))}
              </div>
              <div className="what-arrow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
