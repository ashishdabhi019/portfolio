import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MdPhotoLibrary, MdAdd, MdDelete, MdPlayCircle, MdInsertDriveFile } from "react-icons/md";
import { RiImageLine, RiVideoLine, RiApps2Line } from "react-icons/ri";
import GlassSurface from "./GlassSurface";
import "./styles/PhotoGallery.css";
import {
  EDITORIAL_EASE,
  SOFT_SPRING,
  TACTILE_SPRING,
  staggerDelay,
} from "./utils/motionPresets";

const CLOUD_NAME = "dm0ocjzhd";
const UPLOAD_PRESET = "portfolio_uploads";
// Use the live Render backend URL in production, or localhost during local development.
const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL || 
  (import.meta.env.PROD ? "https://portfolio-n9c9.onrender.com" : "http://localhost:3001");


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

function getContrastOnAccent(hex: string): "#050810" | "#ffffff" {
  const clean = hex.trim().replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  if ([r, g, b].some(Number.isNaN)) return "#ffffff";
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? "#050810" : "#ffffff";
}

interface MasonryPosition {
  left: number;
  top: number;
  width: number;
}

const SKELETON_RATIOS = [0.76, 1.15, 0.85, 1.32, 0.94, 0.72, 1.22, 0.8, 1.08, 0.88, 1.26, 0.9];
const SKELETON_KEYS = SKELETON_RATIOS.map((_, i) => `pg-skeleton-${i}`);

function getPlaceholderRatio(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return SKELETON_RATIOS[Math.abs(hash) % SKELETON_RATIOS.length];
}

function getMasonryMetrics(width: number): { cols: number; gap: number } {
  if (width < 600) return { cols: 2, gap: 10 };
  if (width < 900) return { cols: 3, gap: 12 };
  if (width < 1240) return { cols: 4, gap: 14 };
  if (width < 1600) return { cols: 5, gap: 14 };
  return { cols: 6, gap: 16 };
}

function useMasonryLayout(itemKeys: string[]) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const keysRef = useRef<string[]>(itemKeys);
  keysRef.current = itemKeys;

  const [layout, setLayout] = useState<{
    positions: Record<string, MasonryPosition>;
    height: number;
    colWidth: number;
  }>({ positions: {}, height: 0, colWidth: 200 });

  const rafRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const measureAndPlace = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const containerWidth = grid.clientWidth;
    if (containerWidth <= 0) return;

    const keys = keysRef.current;
    if (keys.length === 0) {
      setLayout((prev) =>
        prev.height === 0 && Object.keys(prev.positions).length === 0
          ? prev
          : { positions: {}, height: 0, colWidth: containerWidth },
      );
      return;
    }

    const { cols, gap } = getMasonryMetrics(containerWidth);
    const colWidth = Math.max(80, (containerWidth - gap * (cols - 1)) / cols);
    const colHeights = new Array<number>(cols).fill(0);
    const nextPositions: Record<string, MasonryPosition> = {};

    for (const key of keys) {
      const el = itemRefs.current.get(key);
      if (el) {
        // Synchronize column width before measuring card height so reflow is exact on resize
        el.style.width = `${colWidth}px`;
      }
      const measuredHeight = el ? el.offsetHeight : 0;
      const cardHeight =
        measuredHeight > 0
          ? measuredHeight
          : Math.round(colWidth / getPlaceholderRatio(key));

      let shortestCol = 0;
      for (let c = 1; c < cols; c++) {
        if (colHeights[c] < colHeights[shortestCol]) {
          shortestCol = c;
        }
      }

      nextPositions[key] = {
        left: shortestCol * (colWidth + gap),
        top: colHeights[shortestCol],
        width: colWidth,
      };
      colHeights[shortestCol] += cardHeight + gap;
    }

    const totalHeight = Math.max(0, Math.max(...colHeights) - gap);
    setLayout((prev) => {
      if (
        prev.height === totalHeight &&
        prev.colWidth === colWidth &&
        Object.keys(prev.positions).length === keys.length
      ) {
        let same = true;
        for (const k of keys) {
          const a = prev.positions[k];
          const b = nextPositions[k];
          if (!a || !b || a.left !== b.left || a.top !== b.top || a.width !== b.width) {
            same = false;
            break;
          }
        }
        if (same) return prev;
      }
      return { positions: nextPositions, height: totalHeight, colWidth };
    });
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      measureAndPlace();
    });
  }, [measureAndPlace]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      scheduleMeasure();
    });
    resizeObserverRef.current = ro;
    if (gridRef.current) ro.observe(gridRef.current);
    itemRefs.current.forEach((el) => ro.observe(el));

    return () => {
      ro.disconnect();
      resizeObserverRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scheduleMeasure]);

  const itemKeysSignature = itemKeys.join("|");
  useLayoutEffect(() => {
    measureAndPlace();
  }, [itemKeysSignature, measureAndPlace]);

  const setGridRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (gridRef.current && gridRef.current !== el) {
        resizeObserverRef.current?.unobserve(gridRef.current);
      }
      gridRef.current = el;
      if (el) {
        resizeObserverRef.current?.observe(el);
        measureAndPlace();
      }
    },
    [measureAndPlace],
  );

  const setItemRef = useCallback((key: string, el: HTMLDivElement | null) => {
    const prevEl = itemRefs.current.get(key);
    if (prevEl && prevEl !== el) {
      resizeObserverRef.current?.unobserve(prevEl);
      itemRefs.current.delete(key);
    }
    if (el) {
      itemRefs.current.set(key, el);
      resizeObserverRef.current?.observe(el);
    }
  }, []);

  return { setGridRef, layout, setItemRef, scheduleMeasure };
}

// ── Media Thumbnail ───────────────────────────────────────────────────────────
function MediaThumb({ item, index, onClick, isDeleting, onMediaReady }: {
  item: MediaItem;
  index: number;
  onClick: () => void;
  isDeleting: boolean;
  onMediaReady: () => void;
}) {
  const [loaded, setLoaded] = useState(item.resourceType === "raw");
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const placeholderRatio = getPlaceholderRatio(item.publicId);

  useEffect(() => {
    if (item.resourceType === "raw") {
      setLoaded(true);
      setErrored(false);
      return;
    }
    if (item.resourceType === "image") {
      const img = imgRef.current;
      if (img?.complete && img.naturalWidth > 0) {
        setLoaded(true);
        onMediaReady();
      } else {
        setLoaded(false);
      }
    } else {
      const vid = videoRef.current;
      if (vid && vid.readyState >= 1) {
        setLoaded(true);
        onMediaReady();
      } else {
        setLoaded(false);
      }
    }
    setErrored(false);
  }, [item.url, item.resourceType, onMediaReady]);

  const handleLoadComplete = () => {
    setLoaded(true);
    onMediaReady();
  };

  const handleLoadError = () => {
    setErrored(true);
    setLoaded(true);
    onMediaReady();
  };

  const lockPlaceholderAspect = !loaded && item.resourceType !== "raw";

  return (
    <motion.div
      className={`pg-card ${item.resourceType === "video" ? "pg-card--video" : ""} ${isDeleting ? "pg-card--deleting" : ""}`}
      style={
        lockPlaceholderAspect
          ? { aspectRatio: String(placeholderRatio) }
          : undefined
      }
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: staggerDelay(index, 0.025, 0.25),
        ease: EDITORIAL_EASE,
      }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}
    >
      {!loaded && <div className="pg-card-skeleton" aria-hidden="true" />}
      {item.resourceType === "video" ? (
        errored ? (
          <div className="pg-card--file-inner">
            <MdPlayCircle className="pg-file-icon" />
            <span className="pg-file-name">Video unavailable</span>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={item.url}
              muted
              preload="metadata"
              onLoadedData={handleLoadComplete}
              onLoadedMetadata={handleLoadComplete}
              onError={handleLoadError}
              className={`pg-media ${loaded ? "is-loaded" : "is-loading"}`}
            />
            {loaded && <div className="pg-card-play"><MdPlayCircle /></div>}
          </>
        )
      ) : item.resourceType === "raw" ? (
        <div className="pg-card--file-inner">
          <MdInsertDriveFile className="pg-file-icon" />
          <span className="pg-file-name">{item.filename || "File"}</span>
          <span className="pg-file-ext">.{item.format?.toUpperCase()}</span>
        </div>
      ) : errored ? (
        <div className="pg-card--file-inner">
          <MdPhotoLibrary className="pg-file-icon" />
          <span className="pg-file-name">{item.filename || "Image unavailable"}</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={item.url}
          alt=""
          draggable={false}
          loading="lazy"
          decoding="async"
          onLoad={handleLoadComplete}
          onError={handleLoadError}
          className={`pg-media ${loaded ? "is-loaded" : "is-loading"}`}
        />
      )}
    </motion.div>
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
    <motion.div
      className="lb-overlay"
      data-lenis-prevent="true"
      onClick={showConfirm ? undefined : onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: EDITORIAL_EASE }}
    >
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={idx}
            initial={{
              opacity: 0,
              x: direction === "next" ? 42 : direction === "prev" ? -42 : 0,
              scale: 0.98,
            }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{
              opacity: 0,
              x: direction === "next" ? -42 : direction === "prev" ? 42 : 0,
              scale: 0.98,
            }}
            transition={{ duration: 0.24, ease: EDITORIAL_EASE }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "100%",
              maxHeight: "88vh",
            }}
          >
            {current?.resourceType === "video" ? (
              <video src={current.url} className={`lb-img lb-img--${direction}`}
                controls autoPlay playsInline onLoadedData={() => setLoaded(true)} style={{ opacity: loaded ? 1 : 0 }} />
            ) : current?.resourceType === "raw" ? (
              <div className="lb-file-preview">
                <MdInsertDriveFile className="lb-file-icon" />
                <span>{current.filename}</span>
                <a href={current.url} target="_blank" rel="noopener noreferrer" className="lb-file-download">Download File</a>
              </div>
            ) : (
              <img src={current?.url} className={`lb-img lb-img--${direction}`}
                alt="" draggable={false} onLoad={() => setLoaded(true)} style={{ opacity: loaded ? 1 : 0 }} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {items.length > 1 && (
        <>
          <button className="lb-arrow lb-prev" onClick={e => { e.stopPropagation(); prev(); }}><IoChevronBack /></button>
          <button className="lb-arrow lb-next" onClick={e => { e.stopPropagation(); next(); }}><IoChevronForward /></button>
        </>
      )}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="lb-confirm-overlay"
            onClick={e => { e.stopPropagation(); setShowConfirm(false); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="lb-confirm-card"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={SOFT_SPRING}
            >
              <button className="lb-confirm-close" onClick={() => setShowConfirm(false)}><IoClose /></button>
              <div className="lb-confirm-icon"><MdDelete /></div>
              <h3 className="lb-confirm-title">Permanently delete this?</h3>
              <p className="lb-confirm-msg">This will remove the file from Cloudinary forever.</p>
              <div className="lb-confirm-actions">
                <button className="lb-confirm-delete" onClick={confirmDelete}>Delete</button>
                <button className="lb-confirm-cancel" onClick={() => setShowConfirm(false)}>Keep</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ progress, filename, onCancel }: { progress: number; filename: string; onCancel: () => void }) {
  const clamped = Math.min(100, Math.max(0, progress));
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * clamped) / 100;
  const isComplete = clamped >= 100;

  return (
    <motion.div
      className="pg-upload-overlay"
      data-lenis-prevent="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <motion.div
        className="pg-upload-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={SOFT_SPRING}
      >
        <div className="pg-upload-emblem" aria-hidden="true">
          <motion.div
            className="pg-upload-aura"
            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.5, 0.95, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {!isComplete && (
            <>
              <motion.span
                className="pg-upload-pulse"
                animate={{ scale: [0.78, 1.24], opacity: [0.55, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.span
                className="pg-upload-pulse"
                animate={{ scale: [0.78, 1.24], opacity: [0.45, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1, ease: "easeOut" }}
              />
            </>
          )}

          <motion.svg
            className="pg-upload-orbit"
            viewBox="0 0 194 194"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <circle
              className="pg-upload-orbit-circle"
              cx="97"
              cy="97"
              r="91"
              strokeWidth="1.5"
              strokeDasharray="6 10"
              strokeLinecap="round"
            />
          </motion.svg>

          <svg className="pg-upload-ring" viewBox="0 0 176 176" fill="none">
            <circle
              className="pg-upload-ring-track"
              cx="88"
              cy="88"
              r={radius}
              strokeWidth="6"
            />
            <motion.circle
              className="pg-upload-ring-progress"
              cx="88"
              cy="88"
              r={radius}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
              transform="rotate(-90 88 88)"
            />
          </svg>

          <motion.div
            className="pg-upload-icon-wrap"
            animate={isComplete ? { scale: [0.92, 1.06, 1] } : { y: [0, -3.5, 0] }}
            transition={
              isComplete
                ? TACTILE_SPRING
                : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <svg className="pg-upload-cloud-svg" viewBox="0 0 80 80" fill="none">
              <path
                d="M19 63H61C69.8 63 77 56.2 77 47.8C77 40.2 71.1 33.9 63.6 32.9C61.1 21.2 50.9 13 39 13C25.3 13 14.2 23.8 14 37.3C7.8 38.8 3 44.1 3 50.6C3 57.6 10.1 63 19 63Z"
                className="pg-upload-cloud-shape"
              />
              {isComplete ? (
                <motion.path
                  d="M32.5 46.5L37.5 51.5L48.5 39.5"
                  className="pg-upload-cloud-check"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: EDITORIAL_EASE }}
                />
              ) : (
                <>
                  <motion.circle
                    cx="28"
                    cy="53"
                    r="1.5"
                    className="pg-upload-particle"
                    animate={{ y: [0, -12], opacity: [0, 0.85, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.circle
                    cx="52"
                    cy="53"
                    r="1.5"
                    className="pg-upload-particle"
                    animate={{ y: [0, -12], opacity: [0, 0.85, 0] }}
                    transition={{ duration: 1.5, delay: 0.55, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.g
                    animate={{ y: [3.5, -3.5, 3.5], opacity: [0.88, 1, 0.88] }}
                    transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path
                      d="M40 53V39"
                      className="pg-upload-cloud-arrow"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M34.5 44.5L40 38.5L45.5 44.5"
                      className="pg-upload-cloud-arrow"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.g>
                </>
              )}
            </svg>
          </motion.div>
        </div>

        <div className="pg-upload-meta">
          <p className="pg-upload-label">{isComplete ? "Finishing Upload" : "Uploading to Cloud"}</p>
          <div className="pg-upload-fname-pill" title={filename}>
            <p className="pg-upload-fname">{filename}</p>
          </div>
        </div>

        <div className="pg-upload-progress-block">
          <div className="pg-upload-track">
            <motion.div
              className="pg-upload-fill"
              animate={{ width: `${clamped}%` }}
              transition={{ duration: 0.25, ease: EDITORIAL_EASE }}
            />
          </div>
          <p className="pg-upload-pct">{clamped}<span>%</span></p>
        </div>

        <motion.button
          className="pg-upload-cancel"
          onClick={onCancel}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={TACTILE_SPRING}
        >
          Cancel Upload
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

interface LenisController {
  stop?: () => void;
  start?: () => void;
}

function getLenisInstance(): LenisController | undefined {
  const win = window as Window & {
    __lenisInstance?: LenisController;
    lenis?: LenisController;
  };
  return win.__lenisInstance || win.lenis;
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

  // ── Sync readable foreground contrast with active portfolio accent color
  useEffect(() => {
    const syncAccentContrast = (accentHex?: string) => {
      const hex =
        accentHex ||
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accentColor")
          .trim() ||
        "#F97316";
      document.documentElement.style.setProperty(
        "--pg-on-accent",
        getContrastOnAccent(hex),
      );
    };

    syncAccentContrast();
    const onAccentChange = (e: Event) => {
      const custom = e as CustomEvent<string>;
      syncAccentContrast(custom.detail);
    };
    window.addEventListener("accentColorChange", onAccentChange);
    return () => window.removeEventListener("accentColorChange", onAccentChange);
  }, []);

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
        // Fallback to localStorage sync for cross-tab updates when server is unreachable
        const saved = localStorage.getItem("cloudinary_media");
        if (saved) {
          try {
            const localItems = JSON.parse(saved);
            if (localItems.length !== mediaRef.current.length) {
              setMedia(localItems);
            }
          } catch (e) {}
        }
      }
    };

    const interval = setInterval(poll, 5_000); // every 5 seconds
    return () => clearInterval(interval);
  }, []); // empty deps — uses mediaRef to avoid stale closure

  // ── Sync across tabs instantly using Storage Event ────────────────────────
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cloudinary_media" && e.newValue) {
        try { setMedia(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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

  // ── Lock main site Lenis + body scroll only while gallery overlay is mounted
  useEffect(() => {
    const lenis = getLenisInstance();
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverscroll = document.body.style.overscrollBehavior;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    lenis?.stop?.();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overscrollBehavior = prevBodyOverscroll;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;
      getLenisInstance()?.start?.();
    };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    const scrollEl = e.currentTarget.querySelector(".pg-scroll");
    if (scrollEl && scrollEl.scrollTop > 0) return;
    touchStartY.current = e.touches[0].clientY; setIsDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy <= 0) {
      setIsDragging(false);
      setDragY(0);
      return;
    }
    setDragY(dy);
  };
  const onTouchEnd = () => { if (dragY > 150) onClose(); else setDragY(0); setIsDragging(false); };

  const counts = {
    all: media.length,
    image: media.filter(m => m.resourceType === "image").length,
    video: media.filter(m => m.resourceType === "video").length,
  };

  const filtered = filter === "all" ? media : media.filter(m => m.resourceType === filter);
  const masonryKeys = loading ? SKELETON_KEYS : filtered.map((m) => m.publicId);
  const { setGridRef, layout: masonry, setItemRef, scheduleMeasure } =
    useMasonryLayout(masonryKeys);

  const tabs: { key: FilterType; icon: React.ReactNode; label: string }[] = [
    { key: "all", icon: <RiApps2Line />, label: "All" },
    { key: "image", icon: <RiImageLine />, label: "Image" },
    { key: "video", icon: <RiVideoLine />, label: "Video" },
  ];
  const activeTabIndex = tabs.findIndex(t => t.key === filter);

  return (
    <>
      <div className="pg-overlay"
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0,0,0,1), opacity 0.3s ease",
          opacity: isDragging ? Math.max(0.4, 1 - dragY / 600) : 1,
        }}>

        {/* ── iPhone Photos-style progressive top blur gradient ── */}
        <div className="pg-top-blur" aria-hidden="true" />

        {/* ── Main Center Pill (GlassSurface) ── */}
        <header className="pg-header">
          <div className="pg-glass-bg" aria-hidden="true">
            <GlassSurface
              width="100%"
              height="100%"
              borderRadius={50}
              distortionScale={-180}
              displace={0.5}
              backgroundOpacity={0.14}
              saturation={1.45}
              className="pg-glass-surface"
            />
          </div>
          <div className="pg-header-left" onClick={() => setIsMenuOpen(!isMenuOpen)} role="button" tabIndex={0}>
            <MdPhotoLibrary className="pg-header-icon" />
            <span className="pg-title">Ashish's Gallery</span>
            <span className="pg-count">{media.length}</span>
          </div>
          <button className="pg-close" onClick={onClose} aria-label="Close"><IoClose /></button>
        </header>

        {/* ── Mobile-only floating close pill (top-right) ── */}
        <button className="pg-mobile-close" onClick={onClose} aria-label="Close gallery">
          <IoClose />
        </button>

        {/* ── Filter Pill (drops below on click) ── */}
        <div className={`pg-filter-pill ${isMenuOpen ? "show" : "hide"}`}>
          <div className="pg-pill-slider"
            style={{ transform: `translateX(calc(${activeTabIndex * 100}% + ${activeTabIndex * 6}px))` }} />
          {tabs.map(({ key, icon, label }) => (
            <button key={key} className={`pg-pill-tab ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}>
              <span className="tab-icon">{icon}</span>
              <span className="tab-label">{label}</span>
              <span className="tab-count">{counts[key]}</span>
            </button>
          ))}

        </div>


        <input ref={fileInputRef} type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.zip,.mp3,.wav"
          multiple className="pg-upload-input" onChange={handleUpload} />
        <button className="pg-fab" onClick={() => fileInputRef.current?.click()} aria-label="Add files">
          <div className="pg-glass-bg pg-glass-bg--fab" aria-hidden="true">
            <GlassSurface
              width="100%"
              height="100%"
              borderRadius={50}
              distortionScale={-180}
              displace={0.5}
              backgroundOpacity={0.14}
              saturation={1.5}
              className="pg-glass-surface"
            />
          </div>
          <span className="pg-fab-accent-ring" aria-hidden="true" />
          <MdAdd className="pg-fab-icon" />
        </button>

        <div className="pg-scroll" data-lenis-prevent="true">
          {loading ? (
            <div
              className="pg-grid"
              ref={setGridRef}
              style={{ height: `${masonry.height}px` }}
              aria-busy="true"
              aria-label="Loading gallery media"
            >
              {SKELETON_KEYS.map((key, i) => {
                const pos = masonry.positions[key];
                return (
                  <div
                    key={key}
                    ref={(el) => setItemRef(key, el)}
                    className="pg-masonry-item"
                    style={{
                      left: pos ? `${pos.left}px` : 0,
                      top: pos ? `${pos.top}px` : 0,
                      width: `${pos ? pos.width : masonry.colWidth}px`,
                      opacity: pos ? 1 : 0,
                    }}
                  >
                    <div
                      className="pg-card pg-card--skeleton-placeholder"
                      style={{ aspectRatio: String(SKELETON_RATIOS[i]) }}
                    >
                      <div className="pg-card-skeleton" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : filtered.length === 0 ? (
            <div className="pg-empty">
              <MdPhotoLibrary className="pg-empty-icon" />
              <h3>No {filter === "all" ? "media" : filter + "s"} yet</h3>
              <p>Click <strong>+</strong> to upload photos or videos</p>
            </div>
          ) : (
            <div
              className="pg-grid"
              ref={setGridRef}
              style={{ height: `${masonry.height}px` }}
            >
              {filtered.map((item, i) => {
                const pos = masonry.positions[item.publicId];
                return (
                  <div
                    key={item.publicId}
                    ref={(el) => setItemRef(item.publicId, el)}
                    className="pg-masonry-item"
                    style={{
                      left: pos ? `${pos.left}px` : 0,
                      top: pos ? `${pos.top}px` : 0,
                      width: `${pos ? pos.width : masonry.colWidth}px`,
                      opacity: pos ? 1 : 0,
                    }}
                  >
                    <MediaThumb
                      item={item}
                      index={i}
                      onClick={() => setLightboxIdx(i)}
                      isDeleting={deletingId === item.publicId}
                      onMediaReady={scheduleMeasure}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {uploading && (
          <UploadModal key="upload-modal" progress={uploading.progress} filename={uploading.filename} onCancel={handleCancelUpload} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox key="lightbox" items={filtered} startIdx={lightboxIdx}
            onClose={() => setLightboxIdx(null)} onDelete={handleDelete} />
        )}
      </AnimatePresence>
    </>
  );
}