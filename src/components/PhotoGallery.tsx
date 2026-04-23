import { useState, useEffect, useRef, useCallback } from "react";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MdPhotoLibrary, MdAdd, MdDelete } from "react-icons/md";
import "./styles/PhotoGallery.css";

// ── Import all photos ─────────────────────────────────────────────────────────
const photoModules = import.meta.glob(
  "../assets/photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, as: "url" }
);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ photos, startIdx, onClose, onDelete }: {
  photos: string[];
  startIdx: number;
  onClose: () => void;
  onDelete: (url: string) => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const touchStartX = useRef(0);

  const prev = useCallback(() => {
    setDirection("prev");
    setIdx(i => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const next = useCallback(() => {
    setDirection("next");
    setIdx(i => (i + 1) % photos.length);
  }, [photos.length]);

  // Clamp idx if photos array shrinks after deletion
  useEffect(() => {
    if (idx >= photos.length && photos.length > 0) setIdx(photos.length - 1);
  }, [photos.length]);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (showConfirm) {
        if (e.key === "Escape") setShowConfirm(false);
        return;
      }
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [showConfirm, prev, next, onClose]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (showConfirm) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
  };

  const confirmDelete = () => {
    const url = photos[idx];
    onDelete(url);
    setShowConfirm(false);
    // If last photo, close lightbox
    if (photos.length <= 1) onClose();
  };

  return (
    <div className="lb-overlay" onClick={showConfirm ? undefined : onClose} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* Integrated Header Pill — top center (Unified) */}
      <div className="lb-header-pill">
        <button
          className="lb-pill-delete"
          onClick={e => { e.stopPropagation(); setShowConfirm(true); }}
          aria-label="Delete photo"
          title="Delete this photo"
        >
          <MdDelete />
        </button>
        <div className="lb-pill-divider" />
        <span className="lb-pill-counter">{idx + 1} / {photos.length}</span>
        <div className="lb-pill-divider" />
        <button
          className="lb-pill-close"
          onClick={e => { e.stopPropagation(); onClose(); }}
          aria-label="Close"
          title="Close gallery"
        >
          <IoClose />
        </button>
      </div>

      {/* Swipe hint */}
      <div className={`lb-swipe-hint ${showHint ? "lb-hint-visible" : ""}`}>
        <IoChevronBack /> Swipe to navigate <IoChevronForward />
      </div>

      {/* Image */}
      <div className="lb-img-wrap" onClick={e => e.stopPropagation()}>
        <img
          key={idx}
          src={photos[idx]}
          className={`lb-img lb-img--${direction}`}
          alt={`Photo ${idx + 1}`}
          draggable={false}
        />
      </div>

      {/* Prev / Next arrows */}
      {photos.length > 1 && (
        <>
          <button className="lb-arrow lb-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous">
            <IoChevronBack />
          </button>
          <button className="lb-arrow lb-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Next">
            <IoChevronForward />
          </button>
        </>
      )}

      {/* ── Confirm delete modal ─────────────────────────────── */}
      {showConfirm && (
        <div className="lb-confirm-overlay" onClick={e => { e.stopPropagation(); setShowConfirm(false); }}>
          <div className="lb-confirm-card" onClick={e => e.stopPropagation()}>
            {/* Close button inside card */}
            <button className="lb-confirm-close" onClick={() => setShowConfirm(false)}>
              <IoClose />
            </button>

            <div className="lb-confirm-icon"><MdDelete /></div>

            <h3 className="lb-confirm-title">Permanently delete this photo?</h3>
            <p className="lb-confirm-msg">This will remove the file from your gallery forever. This action is irreversible.</p>

            <div className="lb-confirm-actions">
              <button className="lb-confirm-delete" onClick={confirmDelete}>Delete</button>
              <button className="lb-confirm-cancel" onClick={() => setShowConfirm(false)}>Keep Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────
type Props = { onClose: () => void };

export default function PhotoGallery({ onClose }: Props) {
  const [photos, setPhotos] = useState<string[]>(() =>
    shuffle(Object.values(photoModules) as string[])
  );
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload
  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const formData = new FormData();
    files.forEach(f => formData.append("photos", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.urls?.length) setPhotos(prev => [...data.urls, ...prev]);
    } catch {
      const urls = files.map(f => URL.createObjectURL(f));
      setPhotos(prev => [...urls, ...prev]);
    }
    e.target.value = "";
  }, []);

  // Delete — called from Lightbox after confirmation
  const handleDelete = useCallback(async (url: string) => {
    setDeletingUrl(url);
    const filename = url.split("/").pop() ?? "";
    try {
      await fetch(`/api/photo/${encodeURIComponent(filename)}`, { method: "DELETE" });
    } catch { /* server down — still remove from UI */ }
    setTimeout(() => {
      setPhotos(prev => prev.filter(p => p !== url));
      setDeletingUrl(null);
    }, 300);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lightboxIdx === null) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, lightboxIdx]);

  return (
    <>
      <div className="pg-overlay">
        <header className="pg-header">
          <div className="pg-header-left">
            <MdPhotoLibrary className="pg-header-icon" />
            <span className="pg-title">Ashish's Gallery</span>
            {photos.length > 0 && <span className="pg-count">{photos.length}</span>}
          </div>
          <button className="pg-close" onClick={onClose} aria-label="Close gallery">
            <IoClose />
          </button>
        </header>

        {/* Floating upload button */}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="pg-upload-input" onChange={handleUpload} />
        <button className="pg-fab" onClick={() => fileInputRef.current?.click()} aria-label="Add photos">
          <MdAdd />
        </button>

        <div className="pg-scroll">
          {photos.length === 0 ? (
            <div className="pg-empty">
              <MdPhotoLibrary className="pg-empty-icon" />
              <h3>No photos yet</h3>
              <p>Drop your photos into <code>src/assets/photos/</code></p>
            </div>
          ) : (
            <div className="pg-grid">
              {photos.map((url, i) => (
                <div
                  key={url}
                  className={`pg-card ${deletingUrl === url ? "pg-card--deleting" : ""}`}
                  onClick={() => setLightboxIdx(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open photo ${i + 1}`}
                  onKeyDown={e => e.key === "Enter" && setLightboxIdx(i)}
                >
                  <img src={url} alt={`Photo ${i + 1}`} draggable={false} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          startIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
