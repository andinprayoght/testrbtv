import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Target host tunggal
const TARGET_HOST = "https://fhlsport121.fgs37g8.xyz";

// Supaya req.body tetap ada
app.use(express.text({ type: "*/*" }));

// Handle preflight CORS
app.options("*", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  });
  res.sendStatus(204);
});

// Halaman root biar nggak 404
app.get("/", (req, res) => {
  res.send("✅ Proxy is running! Gunakan path misalnya: /hls/stream.m3u8");
});

// Proxy semua request lain
app.all("*", async (req, res) => {
  try {
    const path = req.url.startsWith("/") ? req.url : `/${req.url}`;
    const targetUrl = TARGET_HOST + path;

    // Buat headers
    const headers = {
      ...req.headers,
      "user-agent": req.get("user-agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      referer: "https://morgan.h3eaulperhapsfuzkhurried.shop/",
      origin: "https://morgan.h3eaulperhapsfuzkhurried.shop",
      cookie:
        "",
    };

    delete headers["host"]; // jangan forward host lama

    // Request ke upstream
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    // Tambah CORS headers
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });

    // Forward status + headers
    res.writeHead(upstream.status, Object.fromEntries(upstream.headers));

    if (upstream.body) {
      upstream.body.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy internal error: " + err.message);
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Proxy running on port ${PORT}`)
);
