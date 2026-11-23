import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "./styles/ContactForm.css";
import { COUNTRIES } from "../data/formOptions";
import { useScrollLineReveal } from "./utils/useScrollReveal";

// ──────────────────────────────────────────────────────────────
//  ⚙️  EMAILJS CONFIG
// ──────────────────────────────────────────────────────────────
const SERVICE_ID: string = "service_7r8sogn";
const TEMPLATE_ID: string = "template_crlpuuq";
const AUTO_REPLY_TEMPLATE_ID: string = "template_p6o34fj";
const PUBLIC_KEY: string = "SCJ1HUNy62TP_tBBi";
// ──────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "success" | "error";

interface StatusState {
  type: Status;
  message?: string;
}

const ContactForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<StatusState>({ type: "idle" });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<(typeof COUNTRIES)[0] | null>(null); // "Select" by default
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    from_name: "",
    from_email: "",
    mobile: "",
    message: "",
  });

  // Clean masked-line scroll font reveal animation matching older look (triggers once, zero blur, zero glow)
  useScrollLineReveal(titleRef);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from_name || !formData.from_email) return;

    if (
      SERVICE_ID === "YOUR_SERVICE_ID" ||
      TEMPLATE_ID === "YOUR_TEMPLATE_ID" ||
      PUBLIC_KEY === "YOUR_PUBLIC_KEY"
    ) {
      setStatus({
        type: "error",
        message: "Unable to send your message. Please check your internet connection and try again.",
      });
      return;
    }

    setStatus({ type: "loading" });
    try {
      await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        formRef.current!,
        PUBLIC_KEY
      );
      // Auto reply to visitor
      if (AUTO_REPLY_TEMPLATE_ID && !AUTO_REPLY_TEMPLATE_ID.includes("YOUR_")) {
        await emailjs.sendForm(
          SERVICE_ID,
          AUTO_REPLY_TEMPLATE_ID,
          formRef.current!,
          PUBLIC_KEY
        ).catch(() => {});
      }

      setStatus({ type: "success" });
      setFormData({
        from_name: "",
        from_email: "",
        mobile: "",
        message: "",
      });
    } catch (err: any) {
      console.error("EmailJS Error:", err);
      setStatus({
        type: "error",
        message: err?.text || "Unable to send your message. Please check your internet connection and try again.",
      });
    }
  };

  const handleReset = () => {
    setStatus({ type: "idle" });
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="nf-book-section" id="contact-form">
      {/* ── Full-width partition line between FAQ and Book an Appointment ── */}
      <div className="nf-book-top-border" aria-hidden="true" />

      <div className="nf-book-container">
        <div className="nf-book-grid">
          {/* ── Left Column: Heading & Info ─────────────────── */}
          <div className="nf-book-left" ref={titleRef}>
            {/* Tag: (12) —— BOOK AN APPOINTMENT */}
            <div className="nf-book-tag-mask">
              <div className="title-reveal-line nf-book-tag">
                <span className="nf-book-tag-num">(12)</span>
                <span className="nf-book-tag-line" aria-hidden="true" />
                <span className="nf-book-tag-label">BOOK AN APPOINTMENT</span>
              </div>
            </div>

            {/* Scroll Font Reveal Animation: original 2-line title look */}
            <h2 className="nf-book-title">
              <span className="title-reveal-mask">
                <span className="title-reveal-line">Tell us what</span>
              </span>
              <span className="title-reveal-mask">
                <span className="title-reveal-line">
                  you're <em className="nf-title-serif">building</em>
                  <span className="nf-title-dot">.</span>
                </span>
              </span>
            </h2>

            <p className="nf-book-subtitle">
              Share a few details about your idea and I will get back to you soon.
            </p>
          </div>

          {/* ── Right Column: The Form OR State Screen ──────── */}
          <div className="nf-book-right">
            {status.type === "success" ? (
              <div className="nf-state-screen nf-state-screen--success">
                <div className="nf-state-badge">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="nf-state-title">Message sent!</h3>
                <p className="nf-state-desc">
                  Thank you for reaching out. I have received your message and will get back to you soon.
                </p>
                <button
                  type="button"
                  className="nf-state-action"
                  onClick={handleReset}
                  data-cursor="disable"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : status.type === "error" ? (
              <div className="nf-state-screen nf-state-screen--error">
                <div className="nf-state-badge">
                  <span className="nf-state-badge__exclamation">!</span>
                </div>
                <h3 className="nf-state-title">Connection error</h3>
                <p className="nf-state-desc">
                  Unable to send your message. Please check your internet connection and try again.
                </p>
                <button
                  type="button"
                  className="nf-state-action"
                  onClick={handleReset}
                  data-cursor="disable"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="nf-book-form"
                autoComplete="off"
                data-cursor="disable"
              >
              {/* Row 1: Full name & Email address */}
              <div className="nf-form-row">
                <div className={`nf-input-group ${formData.from_name ? "is-filled" : ""}`}>
                  <label htmlFor="nf-name" className="nf-input-label">
                    <span className="nf-label-rest">Full name</span>
                    <span className="nf-label-float">FULL NAME</span>
                  </label>
                  <input
                    id="nf-name"
                    type="text"
                    name="from_name"
                    placeholder=" "
                    value={formData.from_name}
                    onChange={handleChange}
                    required
                    className="nf-text-input"
                    data-cursor="disable"
                  />
                </div>

                <div className={`nf-input-group ${formData.from_email ? "is-filled" : ""}`}>
                  <label htmlFor="nf-email" className="nf-input-label">
                    <span className="nf-label-rest">Email address</span>
                    <span className="nf-label-float">EMAIL ADDRESS</span>
                  </label>
                  <input
                    id="nf-email"
                    type="email"
                    name="from_email"
                    placeholder=" "
                    value={formData.from_email}
                    onChange={handleChange}
                    required
                    className="nf-text-input"
                    data-cursor="disable"
                  />
                </div>
              </div>

              {/* Row 2: CODE select + WhatsApp number */}
              <div className="nf-form-row nf-form-row--phone">
                {/* Country Code Trigger */}
                <div className="nf-code-group" ref={dropdownRef}>
                  <span className="nf-accent-label">CODE</span>
                  <div
                    className={`nf-code-trigger ${showCountryDropdown ? "is-open" : ""}`}
                    onClick={() => setShowCountryDropdown((v) => !v)}
                    role="button"
                    tabIndex={0}
                    data-cursor="disable"
                  >
                    <span className="nf-code-trigger__text">
                      {selectedCountry ? `${selectedCountry.code}` : "Select"}
                    </span>
                    <svg
                      className={`nf-code-chevron ${showCountryDropdown ? "is-flipped" : ""}`}
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>

                  {/* Dropdown Menu */}
                  {showCountryDropdown && (
                    <div className="nf-country-dropdown" data-lenis-prevent="true">
                      <div className="nf-country-search-wrap">
                        <input
                          type="text"
                          className="nf-country-search"
                          placeholder="Search country or code..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          data-cursor="disable"
                        />
                      </div>
                      <div className="nf-country-list">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((c) => (
                            <div
                              key={`${c.country}-${c.code}-${c.name}`}
                              className={`nf-country-item ${
                                selectedCountry?.country === c.country ? "is-selected" : ""
                              }`}
                              onClick={() => {
                                setSelectedCountry(c);
                                setShowCountryDropdown(false);
                                setSearchQuery("");
                              }}
                              data-cursor="disable"
                            >
                              <span className="nf-country-item__flag">{c.country}</span>
                              <span className="nf-country-item__name">{c.name}</span>
                              <span className="nf-country-item__code">{c.code}</span>
                            </div>
                          ))
                        ) : (
                          <div className="nf-country-empty">No results found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp number input */}
                <div className={`nf-input-group nf-input-group--phone ${formData.mobile ? "is-filled" : ""}`}>
                  <label htmlFor="nf-phone" className="nf-input-label">
                    <span className="nf-label-rest">WhatsApp number</span>
                    <span className="nf-label-float">WHATSAPP NUMBER</span>
                  </label>
                  <input
                    id="nf-phone"
                    type="tel"
                    name="mobile"
                    placeholder=" "
                    value={formData.mobile}
                    onChange={handleChange}
                    className="nf-text-input"
                    data-cursor="disable"
                  />
                </div>
              </div>

              {/* Row 3: Tell us about your project */}
              <div className="nf-form-row nf-form-row--full">
                <div className={`nf-input-group ${formData.message ? "is-filled" : ""}`}>
                  <label htmlFor="nf-message" className="nf-input-label">
                    <span className="nf-label-rest">Tell us about your project</span>
                    <span className="nf-label-float">TELL US ABOUT YOUR PROJECT</span>
                  </label>
                  <textarea
                    id="nf-message"
                    name="message"
                    rows={3}
                    placeholder=" "
                    value={formData.message}
                    onChange={handleChange}
                    className="nf-text-input nf-textarea"
                    data-cursor="disable"
                  />
                </div>
              </div>

              {/* Hidden inputs to guarantee EmailJS receives all expected variables */}
              <input
                type="hidden"
                name="full_mobile"
                value={selectedCountry ? `${selectedCountry.code} ${formData.mobile}` : formData.mobile}
              />
              <input type="hidden" name="country_code" value={selectedCountry?.code || ""} />
              <input type="hidden" name="country_name" value={selectedCountry?.name || ""} />
              <input type="hidden" name="location" value={selectedCountry ? `${selectedCountry.name} (${selectedCountry.code})` : "General"} />

              {/* Row 4: Privacy policy note & Submit pill */}
              <div className="nf-form-footer">
                <p className="nf-privacy-note">
                  Your details are handled under our privacy policy.
                </p>

                <button
                  type="submit"
                  className={`nf-submit-btn ${status.type === "loading" ? "is-loading" : ""}`}
                  disabled={status.type === "loading"}
                  data-cursor="disable"
                >
                  {status.type === "loading" ? (
                    <span className="nf-spinner" />
                  ) : (
                    <>
                      <span className="nf-submit-btn__text">Send message</span>
                      <span className="nf-submit-btn__icon" aria-hidden="true">
                        <span className="nf-arrow-track">
                          {/* Front arrow — drives out to right like a car on hover */}
                          <svg
                            className="nf-arrow nf-arrow--front"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                          {/* Back arrow — enters from left into same place on hover */}
                          <svg
                            className="nf-arrow nf-arrow--back"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </span>
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </section>
  );
};

export default ContactForm;
