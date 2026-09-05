import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use a generous size limit to accommodate base64 drawing sketches and detailed database loads
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // File path for persistence in container workspace
  const DB_PATH = path.join(process.cwd(), "store-v2.json");

  // In-memory cache fallback to stay fast and survive disk write edge-cases
  let dbCache: any = null;

  // Pre-load on startup
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      dbCache = JSON.parse(raw);
      console.log("Successfully preloaded corporate inventory store from local file storage!");
    }
  } catch (error) {
    console.error("Error preloading local file store:", error);
  }

  // API Route - Get shared workspace state
  app.get("/api/get-state", (req, res) => {
    try {
      if (!dbCache && fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        dbCache = JSON.parse(raw);
      }
      res.json(dbCache || {});
    } catch (e) {
      console.error("Failed reading storage directory:", e);
      res.json(dbCache || {}); // Return cache on error
    }
  });

  // API Route - Update shared workspace state
  app.post("/api/save-state", (req, res) => {
    try {
      const payload = req.body;
      dbCache = {
        ...(dbCache || {}),
        ...payload,
        syncedAt: new Date().toISOString()
      };
      
      // Save synchronously to file
      fs.writeFileSync(DB_PATH, JSON.stringify(dbCache, null, 2), "utf-8");
      res.json({ success: true, message: "Corporate inventory store synced successfully!" });
    } catch (e) {
      console.error("Failed writing storage directory:", e);
      res.status(500).json({ success: false, error: String(e) });
    }
  });

  // Setup directory for shared PDFs
  const pdfsDir = path.join(process.cwd(), "shared-pdfs");
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  // Serve shared PDFs statically
  app.use("/shared-pdfs", express.static(pdfsDir));

  // API Route - Upload generated PDF for WhatsApp sharing
  app.post("/api/upload-pdf", (req, res) => {
    try {
      const { pdfBase64, filename } = req.body;
      if (!pdfBase64) {
        return res.status(400).json({ error: "Missing pdfBase64 parameter" });
      }

      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const cleanFilename = (filename || "document.pdf").replace(/[^a-zA-Z0-9_.-]/g, "_");
      const savedFilename = `${uniqueId}_${cleanFilename}`;

      fs.writeFileSync(path.join(pdfsDir, savedFilename), buffer);

      const proto = (req.headers["x-forwarded-proto"] as string) || "http";
      const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;
      const hostUrl = process.env.APP_URL || `${proto}://${host}`;
      const cleanHostUrl = hostUrl.endsWith("/") ? hostUrl.slice(0, -1) : hostUrl;
      const fileUrl = `${cleanHostUrl}/shared-pdfs/${savedFilename}`;

      res.json({ success: true, url: fileUrl });
    } catch (error) {
      console.error("Failed to upload shared PDF:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Vite development middleware or Static build production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Marine Fasteners ERP App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
