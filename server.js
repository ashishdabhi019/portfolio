// server.js — Cloudinary-powered media backend
import express from "express";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

const PORT = 3001;

cloudinary.config({
  cloud_name: "dm0ocjzhd",
  api_key: "984136927672923",
  api_secret: process.env.CLOUDINARY_SECRET || "fxAMcCGSvUYrmU6VM4HNnon9U_s",
});

const app = express();
app.use(cors());
app.use(express.json());

// ── Cache & Helper: fetch all media ───────────────────────────────────────────
let mediaCache = { data: null, lastFetch: 0 };
const CACHE_TTL = 30000; // 30 seconds

async function fetchAllMedia() {
  if (mediaCache.data && Date.now() - mediaCache.lastFetch < CACHE_TTL) {
    return mediaCache.data;
  }

  // Use Search API (5000 limits) instead of Admin API (500 limits) to prevent crashes
  const result = await cloudinary.search
    .expression("")
    .sort_by("created_at", "desc")
    .max_results(500)
    .execute();

  const formatted = result.resources.map(r => ({
    url: r.secure_url,
    publicId: r.public_id,
    resourceType: r.resource_type,
    format: r.format,
    filename: r.filename || r.public_id.split("/").pop(),
    createdAt: r.created_at,
  }));

  mediaCache = { data: formatted, lastFetch: Date.now() };
  return formatted;
}

// ── GET /api/media — Full media list ─────────────────────────────────────────
app.get("/api/media", async (req, res) => {
  try {
    const media = await fetchAllMedia();
    res.json({ media, total: media.length, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("List error:", err);
    // If rate limited but we have cache, return cache
    if (mediaCache.data) {
      return res.json({ media: mediaCache.data, total: mediaCache.data.length, fetchedAt: new Date().toISOString(), cached: true });
    }
    res.status(500).json({ error: "Failed to fetch media", details: err.message });
  }
});

// ── GET /api/media/sync — Lightweight sync check ──────────────────────────────
app.get("/api/media/sync", async (req, res) => {
  try {
    const media = await fetchAllMedia();
    const total = media.length;
    const latestAt = media.length > 0 ? media[0].createdAt : "";
    res.json({ total, latestAt, checkedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Sync check failed" });
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
    console.log(`🗑️  Deleted: ${publicId} (${result.result})`);
    res.json({ ok: true, result: result.result });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Could not delete file" });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ ok: true, cloudinary: "connected" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`📸 Cloudinary server → http://localhost:${PORT}`);
});