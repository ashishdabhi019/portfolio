import { useState, useCallback, useEffect, useRef } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { FaPlay, FaPause, FaRotateRight } from "react-icons/fa6";

const projects = [
  {
    title: "Bottle Detection",
    category: "AI · Computer Vision · Object Detection",
    tools: "Python, OpenCV, YOLOv8, Computer Vision, Real-time Inference",
    image: "/images/bottle_detection.png",
  },
  {
    title: "Fire & Smoke Detection",
    category: "AI · Computer Vision · Safety System",
    tools: "Python, YOLOv8, OpenCV, Deep Learning, Alert System",
    image: "/images/smoke_detection.png",
  },
  {
    title: "AI Chatbot",
    category: "AI · Conversational Assistant · Full Stack",
    tools: "React, Python, Flask, Ollama, LLM, REST API",
    image: "/images/chatbot.png",
  },
  {
    title: "TrendRadar AI Automation",
    category: "AI · Automation · Social Intelligence",
    tools: "n8n, X API, YouTube API, Reddit API, OpenAI, Google Sheets API",
    image: "/images/trendradar.png",
  },
  {
    title: "IntelliDoc Engine",
    category: "AI · Document Intelligence · Backend Pipeline",
    tools: "FastAPI, Claude API, Python, LLM, Pydantic, REST API",
    image: "/images/intellidoc.png",
  },
];

const Work = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const AUTOPLAY_INTERVAL = 6000; // 6s — professional readable pacing

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    if (trackRef.current) {
      const slideWidth = trackRef.current.clientWidth;
      trackRef.current.scrollTo({
        left: index * slideWidth,
        behavior: "smooth",
      });
    }
  }, []);

  const goToNext = useCallback(() => {
    // If we're on the last slide, stop and switch to replay mode
    if (currentIndex === projects.length - 1) {
      setIsPlaying(false);
      setHasCompleted(true);
      return;
    }
    const newIndex = currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, goToSlide]);

  // Replay: smoothly go back to first slide and resume
  const handleReplay = useCallback(() => {
    setHasCompleted(false);
    setIsPlaying(true);
    goToSlide(0);
  }, [goToSlide]);

  // Section Visibility Observer (Pauses timer when scrolled away)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Starts when any 10% is visible
    );

    observer.observe(section);

    return () => {
      observer.unobserve(section);
    };
  }, []);

  // Auto-Play Effect
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    // Only run the timer if the section is visible and actively playing
    if (isPlaying && isVisible) {
      intervalId = setInterval(() => {
        goToNext();
      }, AUTOPLAY_INTERVAL);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, isVisible, goToNext]);

  // Intersection Observer for updating active dot on native user scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setCurrentIndex(index);
          }
        });
      },
      {
        root: track,
        threshold: 0.6, // Fire when 60% of the slide enters the view
      }
    );

    const slides = Array.from(track.children);
    slides.forEach((slide) => observer.observe(slide));

    return () => {
      slides.forEach((slide) => observer.unobserve(slide));
    };
  }, []);

  return (
    <div className="work-section" id="work" ref={sectionRef}>
      <div className="work-container section-container">
        <h2 className="title">
          Selected Works
        </h2>

        <div className="carousel-wrapper">
          {/* Slides */}
          <div className="carousel-track-container" style={{ touchAction: 'pan-y' }}>
            <div
              className="carousel-track native-scroll-track"
              ref={trackRef}
            >
              {projects.map((project, index) => (
                <div className="carousel-slide" key={index} data-index={index}>
                  <div className="carousel-content">
                    <div className="carousel-info">
                      <div className="carousel-number">
                        <h3>0{index + 1}</h3>
                      </div>
                      <div className="carousel-details">
                        <h4>{project.title}</h4>
                        <p className="carousel-category">
                          {project.category}
                        </p>
                        <div className="carousel-tools">
                          <span className="tools-label">Tools & Features</span>
                          <p>{project.tools}</p>
                        </div>
                      </div>
                    </div>
                    <div className="carousel-image-wrapper">
                      <WorkImage image={project.image} alt={project.title} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liquid Glass Apple Controls */}
          <div className="apple-controls-bar">
            {/* Pagination Indicators Pill */}
            <div className="apple-pagination-pill glass-pill" data-cursor="disable">
              {projects.map((_, index) => (
                <button
                  key={index}
                  className={`apple-dot ${index === currentIndex ? "apple-dot-active" : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to project ${index + 1}`}
                >
                  {index === currentIndex && (
                    <span
                      key={`progress-${index}-${currentIndex}`}
                      className="apple-dot-progress"
                      style={{
                        animationDuration: `${AUTOPLAY_INTERVAL}ms`,
                        animationPlayState: (isPlaying && !hasCompleted) ? 'running' : 'paused',
                        width: hasCompleted ? "100%" : undefined,
                        animationName: hasCompleted ? "none" : "progressFill"
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Play/Pause/Replay Pill */}
            <button
              className={`apple-play-pill glass-pill${hasCompleted ? " replay-mode" : ""}`}
              onClick={hasCompleted ? handleReplay : () => setIsPlaying(!isPlaying)}
              aria-label={hasCompleted ? "Replay" : isPlaying ? "Pause autoplay" : "Start autoplay"}
              data-cursor="disable"
            >
              {hasCompleted
                ? <FaRotateRight style={{ transform: "rotate(-50deg)", fontSize: "20px", strokeWidth: "15px", stroke: "currentColor" }} />
                : isPlaying ? <FaPause /> : <FaPlay />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
