import { useState, useEffect, useRef, useCallback } from "react";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MdPhotoLibrary, MdAdd, MdDelete, MdPlayCircle, MdInsertDriveFile } from "react-icons/md";
import { RiImageLine, RiVideoLine, RiApps2Line } from "react-icons/ri";
import "./styles/PhotoGallery.css";

const CLOUD_NAME = "dm0ocjzhd";
const UPLOAD_PRESET = "portfolio_uploads";
const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || "http://localhost:3001";


interface MediaItem {
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  format?: string;
  filename?: string;
  createdAt?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Media Thumbnail ───────────────────────────────────────────────────────────
function MediaThumb({ item, onClick, isDeleting }: {
  item: MediaItem; onClick: () => void; isDeleting: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`pg-card ${item.resourceType === "video" ? "pg-card--video" : ""} ${isDeleting ? "pg-card--deleting" : ""}`}
      onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}
    >
      {!loaded && <div className="pg-card-skeleton" />}
      {item.resourceType === "video" ? (
        <>
          <video src={item.url} muted preload="metadata"
            onLoadedData={() => setLoaded(true)}
            style={{ opacity: loaded ? 1 : 0 }} />
          {loaded && <div className="pg-card-play"><MdPlayCircle /></div>}
        </>
      ) : item.resourceType === "raw" ? (
        <div className="pg-card--file-inner">
          <MdInsertDriveFile className="pg-file-icon" />
          <span className="pg-file-name">{item.filename || "File"}</span>
          <span className="pg-file-ext">.{item.format?.toUpperCase()}</span>
        </div>
      ) : (
        <img src={item.url} alt="" draggable={false} loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }} />
      )}
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ items, startIdx, onClose, onDelete }: {
  items: MediaItem[]; startIdx: number; onClose: () => void; onDelete: (item: MediaItem) => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => { setLoaded(false); }, [idx]);
  const prev = useCallback(() => { setDirection("prev"); setIdx(i => (i - 1 + items.length) % items.length); }, [items.length]);
  const next = useCallback(() => { setDirection("next"); setIdx(i => (i + 1) % items.length); }, [items.length]);
  useEffect(() => { if (idx >= items.length && items.length > 0) setIdx(items.length - 1); }, [items.length]);
  useEffect(() => { const t = setTimeout(() => setShowHint(false), 2000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (showConfirm) { if (e.key === "Escape") setShowConfirm(false); return; }
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [showConfirm, prev, next, onClose]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; setIsDragging(true); };
  const onTouchMove = (e: React.TouchEvent) => {
    if (showConfirm) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy)) { setDragX(dx); setDragY(0); }
    else if (dy > 0) { setDragY(dy); setDragX(0); }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (showConfirm) { setIsDragging(false); setDragY(0); setDragX(0); return; }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 120 && Math.abs(dx) < 80) onClose();
    else if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    setDragY(0); setDragX(0); setIsDragging(false);
  };

  const confirmDelete = () => { onDelete(items[idx]); setShowConfirm(false); if (items.length <= 1) onClose(); };
  const current = items[idx];

  return (
    <div className="lb-overlay" onClick={showConfirm ? undefined : onClose}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="lb-header-pill">
        <button className="lb-pill-delete" onClick={e => { e.stopPropagation(); setShowConfirm(true); }}><MdDelete /></button>
        <div className="lb-pill-divider" />
        <span className="lb-pill-counter">{idx + 1} / {items.length}</span>
        <div className="lb-pill-divider" />
        <button className="lb-pill-close" onClick={e => { e.stopPropagation(); onClose(); }}><IoClose /></button>
      </div>
      <div className={`lb-swipe-hint ${showHint ? "lb-hint-visible" : ""}`}>
        <IoChevronBack /> Swipe to navigate <IoChevronForward />
      </div>
      <div className="lb-img-wrap" onClick={e => e.stopPropagation()}
        style={{
          transform: `translate(${dragX}px, ${dragY}px)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.2,0.8,0.2,1)",
          opacity: isDragging ? Math.max(0.1, 1 - Math.abs(dragY) / 400) : 1,
        }}>
        {!loaded && <div className="lb-loader"><div className="lb-spinner" /></div>}
        {current?.resourceType === "video" ? (
          <video key={idx} src={current.url} className={`lb-img lb-img--${direction}`}
            controls autoPlay playsInline onLoadedData={() => setLoaded(true)} style={{ opacity: loaded ? 1 : 0 }} />
        ) : current?.resourceType === "raw" ? (
          <div className="lb-file-preview">
            <MdInsertDriveFile className="lb-file-icon" />
            <span>{current.filename}</span>
            <a href={current.url} target="_blank" rel="noopener noreferrer" className="lb-file-download">Download File</a>
          </div>
        ) : (
          <img key={idx} src={current?.url} className={`lb-img lb-img--${direction}`}
            alt="" draggable={false} onLoad={() => setLoaded(true)} style={{ opacity: loaded ? 1 : 0 }} />
        )}
      </div>
      {items.length > 1 && (
        <>
          <button className="lb-arrow lb-prev" onClick={e => { e.stopPropagation(); prev(); }}><IoChevronBack /></button>
          <button className="lb-arrow lb-next" onClick={e => { e.stopPropagation(); next(); }}><IoChevronForward /></button>
        </>
      )}
      {showConfirm && (
        <div className="lb-confirm-overlay" onClick={e => { e.stopPropagation(); setShowConfirm(false); }}>
          <div className="lb-confirm-card" onClick={e => e.stopPropagation()}>
            <button className="lb-confirm-close" onClick={() => setShowConfirm(false)}><IoClose /></button>
            <div className="lb-confirm-icon"><MdDelete /></div>
            <h3 className="lb-confirm-title">Permanently delete this?</h3>
            <p className="lb-confirm-msg">This will remove the file from Cloudinary forever.</p>
            <div className="lb-confirm-actions">
              <button className="lb-confirm-delete" onClick={confirmDelete}>Delete</button>
              <button className="lb-confirm-cancel" onClick={() => setShowConfirm(false)}>Keep</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ progress, filename, onCancel }: { progress: number; filename: string; onCancel: () => void }) {
  return (
    <div className="pg-upload-overlay">
      <div className="pg-upload-card">
        <div className="pg-cloud-scene">
          <div className="pg-dot pg-dot--1" />
          <div className="pg-dot pg-dot--2" />
          <div className="pg-dot pg-dot--3" />
          <div className="pg-dot pg-dot--4" />
          <svg className="pg-cloud-svg" viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cg1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="42" rx="38" ry="24" fill="url(#cg1)" />
            <ellipse cx="34" cy="44" rx="20" ry="16" fill="url(#cg1)" />
            <ellipse cx="66" cy="44" rx="20" ry="16" fill="url(#cg1)" />
            <ellipse cx="50" cy="30" rx="24" ry="20" fill="url(#cg1)" />
          </svg>
          <svg className="pg-arrow-up" viewBox="0 0 24 24" fill="none">
            <path d="M12 20V4M5 11l7-7 7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="pg-upload-label">Uploading to Cloud</p>
        <p className="pg-upload-fname">{filename}</p>
        <div className="pg-upload-track">
          <div className="pg-upload-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="pg-upload-pct">{progress}<span>%</span></p>
        <button className="pg-upload-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────
type FilterType = "all" | "image" | "video";
type Props = { onClose: () => void };

export default function PhotoGallery({ onClose }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ filename: string; progress: number } | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ── Sync state ────────────────────────────────────────────────────────────
  const lastKnownTotal = useRef(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);

  // ── Ref to always access current media inside polling without stale closure
  const mediaRef = useRef<MediaItem[]>([]);
  useEffect(() => { mediaRef.current = media; }, [media]);

  // ── Initial load ──────────────────────────────────────────────────────────
  const loadMedia = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/media`);
      const data = await res.json();
      const items: MediaItem[] = data.media || [];
      setMedia(shuffle(items));
      lastKnownTotal.current = items.length;
    } catch {
      const saved = localStorage.getItem("cloudinary_media");
      if (saved) {
        const items = JSON.parse(saved);
        setMedia(shuffle(items));
        lastKnownTotal.current = items.length;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  // ── Auto-polling: full sync every 5s — detects additions AND deletions ────
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/media`);
        if (!res.ok) return;
        const data = await res.json();
        const serverItems: MediaItem[] = data.media || [];

        const current = mediaRef.current;
        const currentIds = new Set(current.map(m => m.publicId));
        const serverIds = new Set(serverItems.map(m => m.publicId));

        const hasAddition = serverItems.some(m => !currentIds.has(m.publicId));
        const hasDeletion = current.some(m => !serverIds.has(m.publicId));

        if (hasAddition || hasDeletion) {
          setMedia(serverItems);
          localStorage.setItem("cloudinary_media", JSON.stringify(serverItems));
          lastKnownTotal.current = serverItems.length;
        }
      } catch {
        // Silent fail
      }
    };

    const interval = setInterval(poll, 5_000); // every 5 seconds
    return () => clearInterval(interval);
  }, []); // empty deps — uses mediaRef to avoid stale closure

  // ── Save to localStorage whenever media changes ───────────────────────────
  useEffect(() => {
    if (media.length > 0) localStorage.setItem("cloudinary_media", JSON.stringify(media));
  }, [media]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleCancelUpload = () => { xhrRef.current?.abort(); setUploading(null); };

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    for (const file of files) {
      setUploading({ filename: file.name, progress: 0 });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      try {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable)
              setUploading({ filename: file.name, progress: Math.round((ev.loaded / ev.total) * 100) });
          };
          xhr.onload = () => {
            xhrRef.current = null;
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              const newItem: MediaItem = {
                url: data.secure_url, publicId: data.public_id,
                resourceType: data.resource_type as "image" | "video" | "raw",
                format: data.format, filename: file.name,
                createdAt: new Date().toISOString(),
              };
              setMedia(prev => {
                const updated = [newItem, ...prev];
                lastKnownTotal.current = updated.length;
                return updated;
              });
              resolve();
            } else reject(new Error("Upload failed"));
          };
          xhr.onerror = () => { xhrRef.current = null; reject(); };
          xhr.onabort = () => { xhrRef.current = null; reject(new Error("aborted")); };
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);
          xhr.send(formData);
        });
      } catch { }
    }
    setUploading(null);
    e.target.value = "";
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (item: MediaItem) => {
    setDeletingId(item.publicId);
    try {
      await fetch(`${SERVER_URL}/api/media/${encodeURIComponent(item.publicId)}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType: item.resourceType }),
      });
    } catch { }
    setTimeout(() => {
      setMedia(prev => {
        const updated = prev.filter(m => m.publicId !== item.publicId);
        lastKnownTotal.current = updated.length;
        return updated;
      });
      setDeletingId(null);
    }, 300);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && lightboxIdx === null) onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, lightboxIdx]);

  const onTouchStart = (e: React.TouchEvent) => {
    const scrollEl = e.currentTarget.querySelector(".pg-scroll");
    if (scrollEl && scrollEl.scrollTop > 0) return;
    touchStartY.current = e.touches[0].clientY; setIsDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => { if (dragY > 150) onClose(); else setDragY(0); setIsDragging(false); };

  const counts = {
    all: media.length,
    image: media.filter(m => m.resourceType === "image").length,
    video: media.filter(m => m.resourceType === "video").length,
  };

  const filtered = filter === "all" ? media : media.filter(m => m.resourceType === filter);

  const tabs: { key: FilterType; icon: React.ReactNode; label: string }[] = [
    { key: "all", icon: <RiApps2Line />, label: "All" },
    { key: "image", icon: <RiImageLine />, label: "Image" },
    { key: "video", icon: <RiVideoLine />, label: "Video" },
  ];
  const activeTabIndex = tabs.findIndex(t => t.key === filter);

  return (
    <>
      <div className="pg-overlay"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0,0,0,1), opacity 0.3s ease",
          opacity: isDragging ? Math.max(0.4, 1 - dragY / 600) : 1,
        }}>

        {/* ── Main Header Pill ── */}
        <header className="pg-header">
          <div className="pg-header-left" onClick={() => setIsMenuOpen(!isMenuOpen)} role="button" tabIndex={0}>
            <MdPhotoLibrary className="pg-header-icon" />
            <span className="pg-title">Ashish's Gallery</span>
            {media.length > 0 && <span className="pg-count">{media.length}</span>}
          </div>
          <button className="pg-close" onClick={onClose} aria-label="Close"><IoClose /></button>
        </header>

        {/* ── Filter Pill (drops below on click) ── */}
        <div className={`pg-filter-pill ${isMenuOpen ? "show" : "hide"}`}>
          <div className="pg-pill-slider"
            style={{ transform: `translateX(calc(${activeTabIndex * 100}% + ${activeTabIndex * 6}px))` }} />
          {tabs.map(({ key, icon, label }) => (
            <button key={key} className={`pg-pill-tab ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}>
              <span className="tab-icon">{icon}</span>
              <span className="tab-label">{label}</span>
              {counts[key] > 0 && <span className="tab-count">{counts[key]}</span>}
            </button>
          ))}

        </div>


        <input ref={fileInputRef} type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.zip,.mp3,.wav"
          multiple className="pg-upload-input" onChange={handleUpload} />
        <button className="pg-fab" onClick={() => fileInputRef.current?.click()} aria-label="Add files">
          <MdAdd />
        </button>

        <div className="pg-scroll">
          {loading ? (
            <div className="pg-empty">
              <div className="pg-loading-spinner" />
              <p>Loading from Cloudinary...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="pg-empty">
              <MdPhotoLibrary className="pg-empty-icon" />
              <h3>No {filter === "all" ? "media" : filter + "s"} yet</h3>
              <p>Click <strong>+</strong> to upload photos or videos</p>
            </div>
          ) : (
            <div className="pg-grid">
              {filtered.map((item, i) => (
                <MediaThumb key={item.publicId} item={item}
                  onClick={() => setLightboxIdx(i)}
                  isDeleting={deletingId === item.publicId} />
              ))}
            </div>
          )}
        </div>
      </div>

      {uploading && (
        <UploadModal progress={uploading.progress} filename={uploading.filename} onCancel={handleCancelUpload} />
      )}

      {lightboxIdx !== null && (
        <Lightbox items={filtered} startIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)} onDelete={handleDelete} />
      )}
    </>
  );
}