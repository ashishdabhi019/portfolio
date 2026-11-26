// server.js — Cloudinary-powered media backend
import express from "express";
import cors from "cors";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const PORT = Number(process.env.PORT) || 3001;

cloudinary.config({
  cloud_name: "dm0ocjzhd",
  api_key: "984136927672923",
  api_secret: process.env.CLOUDINARY_SECRET || "fxAMcCGSvUYrmU6VM4HNnon9U_s",
});

const app = express();
app.use(cors());
app.use(express.json());

// ── Cache & Helper: fetch all media cleanly without exhausting Cloudinary quota
const CACHE_TTL = 180_000; // 3 minutes (max ~20 Search calls/hr vs 500/hr free limit)
const RATE_LIMIT_COOLDOWN_MS = 120_000; // Wait 2 min before retrying after HTTP 420
const OVERLAY_TTL_MS = 10 * 60_000; // 10 min write-through window for instant cross-device sync
const CACHE_FILE = "/tmp/portfolio-cloudinary-cache.json";

let mediaCache = { data: null, lastFetch: 0 };
let inFlightFetch = null;
let rateLimitedUntil = 0;

const recentRegistrations = new Map(); // publicId -> { item, expiresAt }
const recentDeletions = new Map(); // publicId -> { deletedAt, expiresAt }

try {
  if (fs.existsSync(CACHE_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    if (Array.isArray(parsed?.data)) {
      mediaCache = { data: parsed.data, lastFetch: Number(parsed.lastFetch) || 0 };
    }
  }
} catch {
  // Non-fatal: start with empty in-memory cache
}

function persistCache() {
  try {
    if (Array.isArray(mediaCache.data)) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(mediaCache), "utf8");
    }
  } catch {
    // Ignore read-only or ephemeral filesystem failures
  }
}

function extractCloudinaryError(err) {
  const message = err?.error?.message || err?.message || "Unknown Cloudinary error";
  const httpCode = Number(err?.error?.http_code || err?.http_code || 0);
  return { message, httpCode };
}

function applyOverlay(baseItems) {
  const now = Date.now();
  for (const [id, entry] of recentRegistrations.entries()) {
    if (entry.expiresAt <= now) recentRegistrations.delete(id);
  }
  for (const [id, entry] of recentDeletions.entries()) {
    if (entry.expiresAt <= now) recentDeletions.delete(id);
  }

  const filtered = baseItems.filter((item) => {
    const del = recentDeletions.get(item.publicId);
    if (!del) return true;
    const itemMs = item.createdAt ? Date.parse(item.createdAt) : 0;
    return !Number.isNaN(itemMs) && itemMs > del.deletedAt + 2000;
  });

  const existingIds = new Set(filtered.map((item) => item.publicId));
  const pendingAdds = [];
  for (const [id, entry] of recentRegistrations.entries()) {
    if (!existingIds.has(id) && !recentDeletions.has(id)) {
      pendingAdds.push(entry.item);
    }
  }

  return [...pendingAdds, ...filtered];
}

async function fetchAllMedia(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && mediaCache.data && now - mediaCache.lastFetch < CACHE_TTL) {
    return applyOverlay(mediaCache.data);
  }

  if (now < rateLimitedUntil) {
    if (Array.isArray(mediaCache.data)) {
      return applyOverlay(mediaCache.data);
    }
    const err = new Error("Cloudinary API rate-limit cooldown active");
    err.httpCode = 420;
    throw err;
  }

  if (inFlightFetch) {
    const base = await inFlightFetch;
    return applyOverlay(base);
  }

  inFlightFetch = (async () => {
    const result = await cloudinary.search
      .expression("")
      .sort_by("created_at", "desc")
      .max_results(500)
      .execute();

    const formatted = (result.resources || []).map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
      resourceType: r.resource_type,
      format: r.format,
      filename: r.filename || r.public_id.split("/").pop(),
      createdAt: r.created_at,
    }));

    mediaCache = { data: formatted, lastFetch: Date.now() };
    persistCache();
    return formatted;
  })();

  try {
    const base = await inFlightFetch;
    return applyOverlay(base);
  } catch (err) {
    const { httpCode } = extractCloudinaryError(err);
    if (httpCode === 420) {
      rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
    }
    throw err;
  } finally {
    inFlightFetch = null;
  }
}

// ── GET /api/media — Full media list ─────────────────────────────────────────
app.get("/api/media", async (req, res) => {
  const forceRefresh = req.query.refresh === "1";
  try {
    const media = await fetchAllMedia(forceRefresh);
    res.json({ media, total: media.length, fetchedAt: new Date().toISOString() });
  } catch (err) {
    const { message, httpCode } = extractCloudinaryError(err);
    console.error("List error:", message);

    if (Array.isArray(mediaCache.data)) {
      const fallback = applyOverlay(mediaCache.data);
      return res.json({
        media: fallback,
        total: fallback.length,
        fetchedAt: new Date().toISOString(),
        cached: true,
        stale: true,
        warning: message,
      });
    }

    res.status(httpCode === 420 ? 503 : 500).json({
      error: "Failed to fetch media",
      details: message,
      rateLimited: httpCode === 420,
    });
  }
});

// ── POST /api/media/register — Instant write-through after direct upload ─────
app.post("/api/media/register", (req, res) => {
  const { url, publicId, resourceType, format, filename, createdAt } = req.body || {};
  if (
    typeof publicId !== "string" ||
    !publicId.trim() ||
    typeof url !== "string" ||
    !url.includes("/dm0ocjzhd/")
  ) {
    return res.status(400).json({ error: "Invalid media item payload" });
  }

  const item = {
    url,
    publicId,
    resourceType: resourceType || "image",
    format,
    filename: filename || publicId.split("/").pop(),
    createdAt: createdAt || new Date().toISOString(),
  };

  recentDeletions.delete(publicId);
  recentRegistrations.set(publicId, { item, expiresAt: Date.now() + OVERLAY_TTL_MS });

  if (Array.isArray(mediaCache.data)) {
    mediaCache.data = [item, ...mediaCache.data.filter((m) => m.publicId !== publicId)];
    persistCache();
  }

  res.json({ ok: true, item });
});

// ── GET /api/media/sync — Lightweight sync check ──────────────────────────────
app.get("/api/media/sync", async (req, res) => {
  try {
    const media = await fetchAllMedia();
    const total = media.length;
    const latestAt = media.length > 0 ? media[0].createdAt : "";
    res.json({ total, latestAt, checkedAt: new Date().toISOString() });
  } catch (err) {
    const { message, httpCode } = extractCloudinaryError(err);
    res.status(httpCode === 420 ? 503 : 500).json({
      error: "Sync check failed",
      details: message,
      rateLimited: httpCode === 420,
    });
  }
});

// ── DELETE /api/media/:publicId ───────────────────────────────────────────────
app.delete("/api/media/:publicId", async (req, res) => {
  const publicId = decodeURIComponent(req.params.publicId);
  const resourceType = req.body?.resourceType || "image";
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    recentRegistrations.delete(publicId);
    recentDeletions.set(publicId, { deletedAt: Date.now(), expiresAt: Date.now() + OVERLAY_TTL_MS });
    if (Array.isArray(mediaCache.data)) {
      mediaCache.data = mediaCache.data.filter((m) => m.publicId !== publicId);
      persistCache();
    }

    console.log(`🗑️  Deleted: ${publicId} (${result.result})`);
    res.json({ ok: true, result: result.result });
  } catch (err) {
    const { message } = extractCloudinaryError(err);
    console.error("Delete error:", message);
    res.status(500).json({ error: "Could not delete file", details: message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    cloudinary: "connected",
    version: 2,
    cachedCount: mediaCache.data?.length ?? 0,
    rateLimitedUntil,
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`📸 Cloudinary server → http://localhost:${PORT}`);
});