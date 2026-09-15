import "./styles/About.css";
import { FramerText } from "./FramerText";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h2 className="title">About Me</h2>
        <FramerText
          className="para"
          text="AI/ML Engineer with 2+ years of experience building intelligent products using Python, LangChain, and scikit-learn. Skilled in RAG systems, model deployment on edge hardware, and full-stack development. Passionate about turning cutting-edge AI research into real-world solutions."
        />
      </div>
    </div>
  );
};

export default About;
