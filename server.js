import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import handler from "./api/quiz.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "public");
const envPath = path.join(root, ".env");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined && value && !/your-|changeme|example|xxx/i.test(value)) {
      process.env[key] = value;
    }
  }
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (url.pathname.startsWith("/api/")) {
    req.query = Object.fromEntries(url.searchParams.entries());
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      if (!res.writableEnded) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: "server error" }));
      }
    }
    return;
  }
  const rel = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(publicDir, rel));
  if (!filePath.startsWith(publicDir)) {
    res.statusCode = 403;
    res.end("forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    res.setHeader("Content-Type", types[path.extname(filePath)] || "application/octet-stream");
    res.end(data);
  });
});

const port = Number(process.env.PORT) || 4173;
server.listen(port, "127.0.0.1", () => {
  const names = ["GEMINI_API_KEY", "REQUESTY_API_KEY", "SAMBANOVA_API_KEY", "OPENROUTER_API_KEY", "OPENAI_API_KEY", "XAI_API_KEY", "GROK_API_KEY", "FREEBUFF_API_KEY"];
  const present = names.filter((name) => process.env[name]);
  console.log(`ready http://127.0.0.1:${port}`);
  console.log(present.length ? `keys loaded: ${present.join(", ")}` : "no AI keys loaded");
});
