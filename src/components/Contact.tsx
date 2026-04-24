import { useState } from "react";
import { createPortal } from "react-dom";
import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";
import SecretModal from "./SecretModal";
import PhotoGallery from "./PhotoGallery";

const Contact = () => {
  const [showModal, setShowModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const handleUnlock = () => {
    setShowModal(false);
    // Small delay so the modal close animation plays first
    setTimeout(() => setShowGallery(true), 200);
  };

  return (
    <>
      <div className="contact-section section-container" id="contact">
        <div className="contact-container">
          <h3>Contact</h3>
          <div className="contact-flex">
            <div className="contact-box">
              <h4>Email</h4>
              <p>
                <a href="mailto:ashishdabhi2003@gmail.com" data-cursor="disable">
                  ashishdabhi2003@gmail.com
                </a>
              </p>
              <h4>Phone</h4>
              <p>
                <a href="tel:+919328232215" data-cursor="disable">
                  +91 93282 32215
                </a>
              </p>
              <h4>Education</h4>
              <p>B.E in Computer Science & Engineering</p>
            </div>
            <div className="contact-box">
              <h4>Social</h4>
              <a
                href="https://github.com/ashishdabhi019"
                target="_blank"
                data-cursor="disable"
                className="contact-social"
              >
                Github <MdArrowOutward />
              </a>
              <a
                href="https://www.linkedin.com/in/ashish-dabhi-6549b8289/"
                target="_blank"
                data-cursor="disable"
                className="contact-social"
              >
                Linkedin <MdArrowOutward />
              </a>
              <a
                href="https://x.com/AshishDabh41722"
                target="_blank"
                data-cursor="disable"
                className="contact-social"
              >
                X <MdArrowOutward />
              </a>
              <a
                href="https://www.instagram.com/whyuashish"
                target="_blank"
                data-cursor="disable"
                className="contact-social"
              >
                Instagram <MdArrowOutward />
              </a>
            </div>
            <div className="contact-box">
              <h2>
                Designed and Developed <br /> by{" "}
                {/* 🔒 Secret easter egg — click to reveal photo gallery */}
                <span
                  className="secret-name"
                  onClick={() => setShowModal(true)}
                >
                  Ashish Dabhi
                </span>
              </h2>
              <h5>
                <MdCopyright /> 2026
              </h5>
            </div>
          </div>
        </div>
      </div>

      {/* Portals render straight into document.body — bypasses GSAP scroll
          transform which would break position:fixed inside #smooth-content */}
      {showModal && createPortal(
        <SecretModal
          onUnlock={handleUnlock}
          onClose={() => setShowModal(false)}
        />,
        document.body
      )}

      {showGallery && createPortal(
        <PhotoGallery onClose={() => setShowGallery(false)} />,
        document.body
      )}
    </>
  );
};

export default Contact;
