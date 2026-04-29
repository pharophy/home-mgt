import { createReadStream } from "node:fs";
import { access, readFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const clientDist = path.join(repoRoot, "client", "dist");
const apiOrigin = "http://127.0.0.1:3211";
const port = 4173;

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"]
]);

function sendNotFound(res) {
  res.statusCode = 404;
  res.end("Not found");
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendNotFound(res);
    return;
  }

  const url = new URL(req.url, `http://127.0.0.1:${port}`);

  if (url.pathname.startsWith("/api/")) {
    const upstream = await fetch(`${apiOrigin}${url.pathname}${url.search}`, {
      method: req.method,
      headers: req.headers,
      duplex: "half",
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : req
    });

    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (!upstream.body) {
      res.end();
      return;
    }

    for await (const chunk of upstream.body) {
      res.write(chunk);
    }
    res.end();
    return;
  }

  const relativePath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.join(clientDist, relativePath);
  try {
    await access(filePath);
    res.setHeader(
      "content-type",
      contentTypes.get(path.extname(filePath)) ?? "application/octet-stream"
    );
    createReadStream(filePath).pipe(res);
    return;
  } catch {
    const indexHtml = await readFile(path.join(clientDist, "index.html"));
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(indexHtml);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`E2E client listening on http://127.0.0.1:${port}`);
});
