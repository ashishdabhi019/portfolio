import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import "./styles/Work.css";

interface Project {
  num: string;
  title: string;
  category: string;
  tagline: string;
  tools: string[];
  image: string;
  link: string;
}

const projects: Project[] = [
  {
    num: "01",
    title: "Bottle Detection",
    category: "APP DEVELOPMENT",
    tagline:
      "Real-time industrial conveyor object detection & automated sorting pipeline with 98.4% precision.",
    tools: ["Python", "OpenCV", "YOLOv8", "Inference"],
    image: "/images/bottle_detection.png",
    link: "https://github.com/ashishdabhi",
  },
  {
    num: "02",
    title: "Fire & Smoke Detection",
    category: "AI SAFETY SYSTEM",
    tagline:
      "Autonomous surveillance hazard identification & alerting deep vision models.",
    tools: ["Python", "YOLOv8", "OpenCV", "Deep Learning"],
    image: "/images/smoke_detection.png",
    link: "https://github.com/ashishdabhi",
  },
  {
    num: "03",
    title: "AI Chatbot",
    category: "CONVERSATIONAL AI",
    tagline:
      "Full-stack conversational agent powered by local Ollama LLMs with retrieval memory.",
    tools: ["React", "Python", "Flask", "Ollama", "REST API"],
    image: "/images/chatbot.png",
    link: "https://github.com/ashishdabhi",
  },
  {
    num: "04",
    title: "TrendRadar AI",
    category: "AUTOMATION & SCRAPING",
    tagline:
      "Autonomous multi-platform trend intelligence system synthesizing viral social data.",
    tools: ["n8n", "OpenAI", "X API", "YouTube API"],
    image: "/images/trendradar.png",
    link: "https://github.com/ashishdabhi",
  },
  {
    num: "05",
    title: "IntelliDoc Engine",
    category: "DOCUMENT INTELLIGENCE",
    tagline:
      "Enterprise multimodal document parsing pipeline with Claude API & strict schema extraction.",
    tools: ["FastAPI", "Claude API", "Python", "Pydantic"],
    image: "/images/intellidoc.png",
    link: "https://github.com/ashishdabhi",
  },
];

const Work = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  // Detect whether to use horizontal desktop scroll or vertical mobile/tablet scroll
  const checkIsDesktop = useCallback(() => {
    if (typeof window === "undefined") return true;
    const isPortrait = window.innerHeight > window.innerWidth;
    // On phones and iPad vertical (portrait <= 1050px), use vertical stacked scroll
    if (window.innerWidth < 1024) return false;
    if (isPortrait && window.innerWidth <= 1050) return false;
    return true;
  }, []);

  const [isDesktop, setIsDesktop] = useState(checkIsDesktop);

  // Measure dynamic horizontal scroll distance (active only on desktop)
  const updateDistance = useCallback(() => {
    if (!checkIsDesktop()) {
      setScrollDistance(0);
      return;
    }
    if (trackRef.current) {
      const dist = Math.max(
        0,
        trackRef.current.scrollWidth - window.innerWidth,
      );
      setScrollDistance(dist);
    }
  }, [checkIsDesktop]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(checkIsDesktop());
      updateDistance();
    };

    updateDistance();
    window.addEventListener("resize", handleResize);

    if (document.fonts) {
      document.fonts.ready.then(updateDistance);
    }

    const t1 = setTimeout(updateDistance, 150);
    const t2 = setTimeout(updateDistance, 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [checkIsDesktop, updateDistance]);

  // Framer Motion scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Custom spring physics matching website's Framer Motion settings
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    mass: 0.15,
    restDelta: 0.0001,
  });

  // Transform spring progress into horizontal translation (desktop only)
  const x = useTransform(smoothProgress, [0, 1], [0, -scrollDistance]);

  return (
    <section
      className="work-section"
      id="work"
      ref={sectionRef}
      style={{
        height:
          isDesktop && scrollDistance > 0
            ? `${scrollDistance + window.innerHeight}px`
            : undefined,
      }}
    >
      <div className="work-pin-stage">
        {/* Track: animated horizontally on desktop, natural vertical stack on phone & iPad vertical */}
        <motion.div
          className="work-horizontal-track"
          ref={trackRef}
          style={isDesktop ? { x } : undefined}
        >
          {/* ITEM 0: Intro Header Block (glides left as you scroll) */}
          <div className="work-intro-block">
            {/* Tag: (03) —— SELECTED WORK */}
            <div className="work-tag">
              <span className="work-tag-num">(03)</span>
              <span className="work-tag-line" aria-hidden="true" />
              <span className="work-tag-label">SELECTED WORK</span>
            </div>

            {/* Headline: Work that *moves* the needle. (Desktop: 3 lines, Mobile & iPad mini: strictly 2 lines) */}
            <h2 className="work-heading">
              <span className="work-heading-desktop">
                Work that
                <br />
                <span className="work-heading-accent">moves</span> the
                <br />
                needle.
              </span>
              <span className="work-heading-mobile">
                <span className="work-heading-m-line1">
                  Work that <span className="work-heading-accent">moves</span>
                </span>
                <span className="work-heading-m-line2">the needle.</span>
              </span>
            </h2>

            {/* Subtitle */}
            <p className="work-desc">
              <span className="work-desc-brands">
                A few of the brands I've designed, built and grown with.
              </span>
              <span className="work-desc-scroll">Scroll to explore.</span>
            </p>
          </div>

          {/* ITEMS 1 TO 5: Wide Cinema Cards with Project & Tech Details */}
          {projects.map((project) => (
            <motion.div
              key={project.title}
              className="work-card"
              initial={!isDesktop ? { opacity: 0, y: 30 } : undefined}
              whileInView={!isDesktop ? { opacity: 1, y: 0 } : undefined}
              viewport={
                !isDesktop ? { once: true, margin: "-40px" } : undefined
              }
              transition={
                !isDesktop
                  ? { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
                  : undefined
              }
            >
              {/* Card Background Image */}
              <div className="work-card-bg">
                <img
                  src={project.image}
                  alt={project.title}
                  className="work-card-img"
                  loading="lazy"
                  draggable={false}
                  onLoad={updateDistance}
                />
                <div className="work-card-overlay" aria-hidden="true" />
              </div>

              {/* Card Number in lower right corner (restored to old place) */}
              <span className="work-card-number" aria-hidden="true">
                {project.num}
              </span>

              {/* Card Bottom: Metadata, Title, Description Tagline & Tech Chips */}
              <div className="work-card-bottom">
                <div className="work-card-meta">
                  <span className="work-card-meta-category">
                    {project.category}
                  </span>
                  <h3 className="work-card-title">{project.title}</h3>
                </div>

                <p className="work-card-tagline">{project.tagline}</p>

                <div className="work-card-tools">
                  {project.tools.map((tool) => (
                    <span key={tool} className="work-card-tool-tag">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* ITEM 6: "View all work" Card */}
          <motion.div
            className="work-card work-card--view-all"
            data-cursor="pointer"
            aria-label="View all work"
            initial={!isDesktop ? { opacity: 0, y: 30 } : undefined}
            whileInView={!isDesktop ? { opacity: 1, y: 0 } : undefined}
            viewport={!isDesktop ? { once: true, margin: "-40px" } : undefined}
            transition={
              !isDesktop
                ? { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
                : undefined
            }
          >
            <div className="work-view-all-circle" aria-hidden="true">
              <span className="work-view-all-arrow">→</span>
            </div>
            <span className="work-view-all-text">View all work</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Work;
