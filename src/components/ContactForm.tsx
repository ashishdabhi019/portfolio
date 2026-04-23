import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { MdCheckCircle, MdError } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import { 
    HiOutlineUser, 
    HiOutlineEnvelope, 
    HiOutlinePhone, 
    HiOutlineMapPin, 
    HiOutlineChatBubbleBottomCenterText 
} from "react-icons/hi2";
import { MdKeyboardArrowDown, MdSearch, MdLocationOn } from "react-icons/md";
import "./styles/ContactForm.css";
import { COUNTRIES, LOCATION_SUGGESTIONS } from "../data/formOptions";


// ──────────────────────────────────────────────────────────────
//  ⚙️  EMAILJS CONFIG – replace with your own IDs from emailjs.com
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
    const locationRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<StatusState>({ type: "idle" });
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [locationSearchQuery, setLocationSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        from_name: "",
        from_email: "",
        mobile: "",
        location: "",
        message: "",
    });

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowCountryDropdown(false);
            }
            if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
                setShowLocationDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!showCountryDropdown) {
            setSearchQuery("");
        }
    }, [showCountryDropdown]);

    useEffect(() => {
        if (!showLocationDropdown) {
            setLocationSearchQuery("");
        }
    }, [showLocationDropdown]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.from_name ||
            !formData.from_email ||
            !formData.mobile ||
            !formData.location
        )
            return;

        if (
            SERVICE_ID === "YOUR_SERVICE_ID" ||
            TEMPLATE_ID === "YOUR_TEMPLATE_ID" ||
            PUBLIC_KEY === "YOUR_PUBLIC_KEY"
        ) {
            setStatus({
                type: "error",
                message: "EmailJS not configured. Please add your credentials in ContactForm.tsx."
            });
            setTimeout(() => setStatus({ type: "idle" }), 5000);
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
            // Send auto reply to visitor
            await emailjs.sendForm(
                SERVICE_ID,
                AUTO_REPLY_TEMPLATE_ID,
                formRef.current!,
                PUBLIC_KEY
            );

            setStatus({ type: "success" });
            setFormData({
                from_name: "",
                from_email: "",
                mobile: "",
                location: "",
                message: "",
            });
        } catch (err: any) {
            console.error("EmailJS Error:", err);
            setStatus({
                type: "error",
                message: err?.text || "Something went wrong. Please check your EmailJS configuration.",
            });
        } finally {
            setTimeout(() => setStatus({ type: "idle" }), 5000);
        }
    };

    return (
        <div className="contact-section section-container" id="contact-form">
            <div className="contact-container cf-inner">
                {/* Heading */}
                <div className="cf-heading">
                    <div className="cf-heading-title-row">
                        <h3>Let's Connect !</h3>
                    </div>
                    <p>
                        Have a project in mind or just want to say hi?
                        <br />
                        Fill in the form and I'll get back to you.
                    </p>
                </div>

                {/* Card */}
                <div className="cf-card">
                    {/* Glow orbs - wrapped in a clipper so they don't leak when card overflow is visible */}
                    <div className="cf-orb-clipper">
                        <div className="cf-orb cf-orb-1" />
                        <div className="cf-orb cf-orb-2" />
                    </div>

                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="cf-form"
                        data-cursor="disable"
                        autoComplete="off"
                    >
                        {/* Row 1 – Name & Email */}
                        <div className="cf-row">
                            <div className="cf-field">
                                <div className="cf-label-row">
                                    <HiOutlineUser className="cf-label-icon" />
                                    <label htmlFor="cf-name">Your Name</label>
                                </div>
                                <input
                                    id="cf-name"
                                    type="text"
                                    name="from_name"
                                    placeholder="Ashish Dabhi"
                                    value={formData.from_name}
                                    onChange={handleChange}
                                    required
                                    data-cursor="disable"
                                />
                            </div>
                            <div className="cf-field">
                                <div className="cf-label-row">
                                    <HiOutlineEnvelope className="cf-label-icon" />
                                    <label htmlFor="cf-email">Email Address</label>
                                </div>
                                <input
                                    id="cf-email"
                                    type="email"
                                    name="from_email"
                                    placeholder="you@example.com"
                                    value={formData.from_email}
                                    onChange={handleChange}
                                    required
                                    data-cursor="disable"
                                />
                            </div>
                        </div>

                        {/* Row 2 – Mobile & Location */}
                        <div className="cf-row">
                            <div className="cf-field">
                                <div className="cf-label-row">
                                    <HiOutlinePhone className="cf-label-icon" />
                                    <label htmlFor="cf-mobile">Mobile Number</label>
                                </div>
                                <div className="cf-phone-input-wrapper">
                                    <div className="cf-country-selector-container" ref={dropdownRef}>
                                        <div 
                                            className={`cf-selected-country ${showCountryDropdown ? "active" : ""}`}
                                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                            data-cursor="disable"
                                        >
                                            <span className="cf-flag">{selectedCountry.country}</span>
                                            <span className="cf-dial-code">{selectedCountry.code}</span>
                                            <MdKeyboardArrowDown className="cf-dropdown-icon" />
                                        </div>

                                        {showCountryDropdown && (
                                            <div className="cf-country-dropdown">
                                                <div className="cf-country-search">
                                                    <MdSearch className="cf-search-icon" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Search country..." 
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="cf-country-list">
                                                    {COUNTRIES.filter(c => 
                                                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                        c.code.includes(searchQuery)
                                                    ).map((c) => (
                                                        <div 
                                                            key={`${c.country}-${c.code}`}
                                                            className={`cf-country-option ${selectedCountry.country === c.country ? "selected" : ""}`}
                                                            onClick={() => {
                                                                setSelectedCountry(c);
                                                                setShowCountryDropdown(false);
                                                            }}
                                                        >
                                                            <span className="cf-option-flag">{c.country}</span>
                                                            <span className="cf-option-name">{c.name}</span>
                                                            <span className="cf-option-code">{c.code}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="cf-mobile"
                                        type="tel"
                                        name="mobile"
                                        placeholder="98765 43210"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                        data-cursor="disable"
                                    />
                                </div>
                            </div>
                            <div className="cf-field cf-location-field" ref={locationRef}>
                                <div className="cf-label-row">
                                    <HiOutlineMapPin className="cf-label-icon" />
                                    <label htmlFor="cf-location">Location</label>
                                </div>
                                <div className="cf-location-input-wrapper">
                                    <input
                                        id="cf-location"
                                        type="text"
                                        name="location"
                                        placeholder="City, Country"
                                        value={formData.location}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setShowLocationDropdown(true);
                                        }}
                                        onFocus={() => setShowLocationDropdown(true)}
                                        required
                                        data-cursor="disable"
                                        autoComplete="off"
                                    />

                                    {showLocationDropdown && (
                                        <div className="cf-location-dropdown cf-country-dropdown">
                                            <div className="cf-country-search">
                                                <MdSearch className="cf-search-icon" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search location..." 
                                                    value={locationSearchQuery}
                                                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="cf-country-list">
                                                {LOCATION_SUGGESTIONS.filter(suggestion => 
                                                    suggestion.toLowerCase().includes(locationSearchQuery.toLowerCase())
                                                ).length > 0 ? (
                                                    LOCATION_SUGGESTIONS.filter(suggestion => 
                                                        suggestion.toLowerCase().includes(locationSearchQuery.toLowerCase())
                                                    ).map((suggestion) => (
                                                        <div 
                                                            key={suggestion}
                                                            className={`cf-country-option ${formData.location === suggestion ? "selected" : ""}`}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, location: suggestion }));
                                                                setShowLocationDropdown(false);
                                                            }}
                                                        >
                                                            <MdLocationOn className="cf-option-flag" style={{ fontSize: '14px' }} />
                                                            <span className="cf-option-name">{suggestion}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="cf-no-suggestions">No matches found</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="cf-field cf-field-full">
                            <div className="cf-label-row">
                                <HiOutlineChatBubbleBottomCenterText className="cf-label-icon" />
                                <label htmlFor="cf-message">Message (optional)</label>
                            </div>
                            <textarea
                                id="cf-message"
                                name="message"
                                rows={4}
                                placeholder="Tell me about your project or idea…"
                                value={formData.message}
                                onChange={handleChange}
                                data-cursor="disable"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className={`cf-btn ${status.type === "loading" ? "cf-btn--loading" : ""}`}
                            disabled={status.type === "loading"}
                            data-cursor="disable"
                        >
                            {status.type === "loading" ? (
                                <span className="cf-spinner" />
                            ) : (
                                <>
                                    <span className="cf-btn-text">Send Message</span>
                                    <IoSend className="cf-btn-icon" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Status toast */}
                    {status.type === "success" && (
                        <div className="cf-toast cf-toast--success">
                            <MdCheckCircle />
                            Message sent! I'll get back to you soon.
                        </div>
                    )}
                    {status.type === "error" && (
                        <div className="cf-toast cf-toast--error">
                            <MdError />
                            {status.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
