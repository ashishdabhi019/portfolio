import "./styles/Career.css";

const Career = () => {
  return (
    <div id="career" className="career-section section-container">
      <div className="career-container">
        <h2>
          Career <span>&</span>
          <br /> Experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI Engineer</h4>
                <h5>
                  Drytis.ai<br />
                  Remote
                </h5>
              </div>
              <h3>2026</h3>
            </div>
            <p>
              Working as an AI Engineer designing, building, and optimizing production-grade AI/ML pipelines and model integrations. Developing voice-based AI chatbots, conversational agents, and intelligent automation workflows to streamline business processes. Collaborating with cross-functional teams utilizing LLMs, RAG pipelines, and modern AI/ML frameworks to deliver scalable, high-performance solutions.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Developer – Python &amp; AI/ML</h4>
                <h5>
                  Stackyzer Technologies<br />
                  Ahmedabad
                </h5>
              </div>
              <h3>2024</h3>
            </div>
            <p>
              Gained 1+ year of hands-on experience in Python &amp; AI/ML product
              development. Built Lumina — an AI-powered RAG conversational
              assistant, the FirststepAI Crate Tracker (full-stack, real-time),
              and Testio — an automated online test system via PDF upload.
              Deployed ML models on NVIDIA Jetson edge hardware for real-time
              inference. Participated in agile sprints delivering scalable
              AI/ML solutions.
            </p>
          </div>
          {/* <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI/ML Engineer</h4>
                <h5>XYZ Tech</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Currently working on cutting-edge AI/ML solutions, building
              intelligent systems and scalable Python-based applications.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Career;
