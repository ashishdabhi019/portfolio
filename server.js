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

// ── Helper: fetch all media ───────────────────────────────────────────────────
async function fetchAllMedia() {
  const [images, videos, raws] = await Promise.all([
    cloudinary.api.resources({ resource_type: "image", max_results: 500, type: "upload" }),
    cloudinary.api.resources({ resource_type: "video", max_results: 500, type: "upload" }),
    cloudinary.api.resources({ resource_type: "raw",   max_results: 500, type: "upload" }),
  ]);

  const fmt = (resources, type) =>
    resources.map(r => ({
      url: r.secure_url,
      publicId: r.public_id,
      resourceType: type,
      format: r.format,
      filename: r.filename || r.public_id.split("/").pop(),
      createdAt: r.created_at,  // ← include timestamp for sync detection
    }));

  return [
    ...fmt(images.resources, "image"),
    ...fmt(videos.resources, "video"),
    ...fmt(raws.resources, "raw"),
  ];
}

// ── GET /api/media — Full media list ─────────────────────────────────────────
app.get("/api/media", async (req, res) => {
  try {
    const media = await fetchAllMedia();
    res.json({ media, total: media.length, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// ── GET /api/media/sync — Lightweight sync check ──────────────────────────────
// Returns only count + latest item timestamp. Used for polling without fetching all data.
app.get("/api/media/sync", async (req, res) => {
  try {
    const [images, videos] = await Promise.all([
      cloudinary.api.resources({ resource_type: "image", max_results: 500, type: "upload" }),
      cloudinary.api.resources({ resource_type: "video", max_results: 500, type: "upload" }),
    ]);

    const allResources = [...images.resources, ...videos.resources];
    const total = allResources.length;

    // Find the most recently created item
    const latestAt = allResources.reduce((latest, r) => {
      return r.created_at > latest ? r.created_at : latest;
    }, "");

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