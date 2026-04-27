
// server.js — Cloudinary-powered media backend
import express from "express";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

const PORT = 3001;

// ── Cloudinary Config ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: "dm0ocjzhd",
  api_key: "984136927672923",
  api_secret: process.env.CLOUDINARY_SECRET || "fxAMcCGSvUYrmU6VM4HNnon9U_s",
});

const app = express();
app.use(cors());
app.use(express.json());

// ── GET /api/media — List all media from Cloudinary ──────────────────────────
app.get("/api/media", async (req, res) => {
  try {
    const [images, videos, raws] = await Promise.all([
      cloudinary.api.resources({ resource_type: "image", max_results: 500, type: "upload" }),
      cloudinary.api.resources({ resource_type: "video", max_results: 500, type: "upload" }),
      cloudinary.api.resources({ resource_type: "raw",   max_results: 500, type: "upload" }),
    ]);

    const format = (resources, type) =>
      resources.map(r => ({
        url: r.secure_url,
        publicId: r.public_id,
        resourceType: type,
        format: r.format,
        filename: r.filename || r.public_id.split("/").pop(),
      }));

    const media = [
      ...format(images.resources, "image"),
      ...format(videos.resources, "video"),
      ...format(raws.resources, "raw"),
    ];

    res.json({ media });
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// ── DELETE /api/media/:publicId — Delete from Cloudinary ─────────────────────
app.delete("/api/media/:publicId", async (req, res) => {
  // publicId may contain slashes, decode it
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
  console.log(`   Cloud: dm0ocjzhd`);
});