// server.js — Photo upload backend
// Saves uploaded photos to src/assets/photos/ permanently
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTO_DIR = path.join(__dirname, "src", "assets", "photos");
const PORT = 3001;

// Ensure photo dir exists
if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR, { recursive: true });

const app = express();

// Allow requests from Vite dev server (any port/host)
app.use(cors());

// Save uploaded files directly to src/assets/photos/
const storage = multer.diskStorage({
  destination: PHOTO_DIR,
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `upload-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|jpg|png|webp|gif|heic)/.test(file.mimetype);
    cb(null, ok);
  },
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB per file
});

// Serve photos as static files (so frontend can display them by URL)
app.use("/photos", express.static(PHOTO_DIR));

// Upload endpoint — accepts multiple files
app.post("/api/upload", upload.array("photos", 50), (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No valid image files received" });
  }
  const host = req.headers.host?.split(":")[0] || "localhost";
  const urls = files.map(
    (f) => `http://${host}:${PORT}/photos/${f.filename}`
  );
  console.log(`✅ Saved ${files.length} photo(s):`, files.map((f) => f.filename));
  res.json({ urls });
});

// Delete endpoint — removes a photo from src/assets/photos/
app.delete("/api/photo/:filename", (req, res) => {
  // path.basename prevents directory traversal (e.g. ../../etc/passwd)
  const safe = path.basename(req.params.filename);
  const filePath = path.join(PHOTO_DIR, safe);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    fs.unlinkSync(filePath);
    console.log(`🗑️  Deleted: ${safe}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: "Could not delete file" });
  }
});

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`📸 Photo server → http://localhost:${PORT}`);
  console.log(`   Saving to: ${PHOTO_DIR}`);
});
