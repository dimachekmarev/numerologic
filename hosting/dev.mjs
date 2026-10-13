import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import worker from "../dist/server/index.js";
import { localDatabase } from "./local-db.mjs";
const port = Number(process.env.PORT || 8080),
  origin = `http://127.0.0.1:${port}`,
  root = resolve("dist/client");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};
const env = {
  DB: localDatabase(process.env.LOCAL_DB || ":memory:"),
  PREVIEW_MODE: process.env.PREVIEW_MODE || "false",
  AI_API_KEY: process.env.AI_API_KEY,
  AI_BASE_URL: process.env.AI_BASE_URL,
  AI_MODEL: process.env.AI_MODEL,
  APP_ORIGIN: origin,
  ASSETS: {
    async fetch(req) {
      const pathname = decodeURIComponent(new URL(req.url).pathname),
        p = resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
      if (!p.startsWith(root + "/"))
        return new Response("Not found", { status: 404 });
      try {
        const data = await readFile(p),
          ext = p.slice(p.lastIndexOf("."));
        return new Response(data, {
          headers: { "Content-Type": types[ext] || "application/octet-stream" },
        });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    },
  },
};
createServer(async (req, res) => {
  try {
    const parts = [];
    for await (const part of req) parts.push(part);
    const r = new Request(origin + req.url, {
      method: req.method,
      headers: req.headers,
      ...(!["GET", "HEAD"].includes(req.method)
        ? { body: Buffer.concat(parts) }
        : {}),
    });
    const result = await worker.fetch(r, env, {
      waitUntil: (p) => p.catch(() => {}),
    });
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    res.writeHead(500);
    res.end("Local preview error");
  }
}).listen(port, "127.0.0.1", () =>
  console.log("Numerologic local QA: " + origin),
);
