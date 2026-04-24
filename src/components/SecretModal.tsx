import { useState, useEffect, useRef } from "react";
import { MdLock, MdLockOpen, MdClose, MdBackspace, MdAutoAwesome, MdStars } from "react-icons/md";
import "./styles/SecretModal.css";

const CORRECT_PIN = "171003";

type Props = {
  onUnlock: () => void;
  onClose: () => void;
};

export default function SecretModal({ onUnlock, onClose }: Props) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [status, setStatus] = useState<"idle" | "wrong" | "unlocking">("idle");
  const overlayRef = useRef<HTMLDivElement>(null);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Drag to dismiss (mobile only logic)
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const onTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    } else {
      setDragY(0);
    }
    setIsDragging(false);
  };

  const addDigit = (d: string) => {
    if (status === "unlocking") return;
    if (pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    setStatus("idle");

    if (next.length === 6) {
      setTimeout(() => {
        if (next === CORRECT_PIN) {
          setStatus("unlocking");
          setTimeout(() => onUnlock(), 700);
        } else {
          setShake(true);
          setStatus("wrong");
          setTimeout(() => {
            setShake(false);
            setPin("");
            setStatus("idle");
          }, 700);
        }
      }, 200);
    }
  };

  const del = () => {
    if (status === "unlocking") return;
    setPin(p => p.slice(0, -1));
    setStatus("idle");
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") addDigit(e.key);
      else if (e.key === "Backspace") del();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pin, status]);

  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="sm-overlay" ref={overlayRef} onClick={handleBackdrop}>
      <div 
        className={`sm-card ${shake ? "sm-shake" : ""} ${status === "unlocking" ? "sm-unlock" : ""}`}
        style={{ 
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.38s ease"
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lock icon */}
        <div className="sm-lock-icon">
          {status === "unlocking"
            ? <MdLockOpen className="sm-lock-svg sm-lock-open" />
            : <MdLock className="sm-lock-svg" />}
        </div>

        <h2 className="sm-title">Something Secret<br /><span>Just For You</span></h2>

        <p className="sm-hint">
          {status === "wrong" ? (
            <span className="sm-hint-row">
              <MdClose className="sm-hint-icon sm-hint-error" /> Wrong code. Try again.
            </span>
          ) : status === "unlocking" ? (
            <span className="sm-hint-row">
              <MdAutoAwesome className="sm-hint-icon sm-hint-accent" /> Unlocking...
            </span>
          ) : (
            <span className="sm-hint-row">
              <MdStars className="sm-hint-icon sm-hint-accent" /> Enter the code to reveal a hidden world
            </span>
          )}
        </p>

        {/* PIN dots */}
        <div className="sm-dots">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`sm-dot ${i < pin.length ? "sm-dot-filled" : ""} ${status === "wrong" ? "sm-dot-wrong" : ""} ${status === "unlocking" ? "sm-dot-unlock" : ""}`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="sm-numpad">
          {KEYS.map((k, idx) => (
            <button
              key={idx}
              className={`sm-key ${k === "" ? "sm-key-empty" : ""} ${k === "del" ? "sm-key-del" : ""}`}
              onClick={() => {
                if (k === "del") del();
                else if (k !== "") addDigit(k);
              }}
              disabled={k === ""}
              aria-label={k === "del" ? "Delete" : k === "" ? "" : k}
            >
              {k === "del" ? <MdBackspace className="sm-backspace-icon" /> : k}
            </button>
          ))}
        </div>

        <button className="sm-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
