import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };
  useEffect(() => {
    const clickHandlers = new Map<HTMLDivElement, () => void>();

    // Use window.innerWidth as a fallback for ScrollTrigger.isTouch on responsive views
    if (ScrollTrigger.isTouch || window.innerWidth <= 1024) {
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
        <h2 className="title">
          W<span className="hat-h2">hat</span>
          <div>
            I<span className="do-h2"> Do</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
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
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="100%"
                  stroke="white"
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
                <div className="what-tags">Python</div>
                <div className="what-tags">LangChain</div>
                <div className="what-tags">LangGraph</div>
                <div className="what-tags">CrewAI</div>
                <div className="what-tags">OpenAI</div>
                <div className="what-tags">Hugging Face</div>
                <div className="what-tags">N8N</div>
                <div className="what-tags">RAG</div>
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
                  stroke="white"
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
                <div className="what-tags">Django</div>
                <div className="what-tags">FastAPI</div>
                <div className="what-tags">Flask</div>
                <div className="what-tags">React</div>
                <div className="what-tags">Node.js</div>
                <div className="what-tags">PostgreSQL</div>
                <div className="what-tags">MongoDB</div>
                <div className="what-tags">REST APIs</div>
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
