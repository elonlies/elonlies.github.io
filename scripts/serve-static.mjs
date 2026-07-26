import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputRoot = path.join(repositoryRoot, "out");
const port = Number(process.env.PORT ?? 3000);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".csv", "text/csv; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
]);

async function resolveFile(requestPath) {
  const relativePath = decodeURIComponent(requestPath).replace(/^\/+/, "");
  const candidate = path.resolve(outputRoot, relativePath);

  if (!candidate.startsWith(`${outputRoot}${path.sep}`) && candidate !== outputRoot) {
    return null;
  }

  try {
    const candidateStat = await stat(candidate);
    if (candidateStat.isDirectory()) return path.join(candidate, "index.html");
    if (candidateStat.isFile()) return candidate;
  } catch {
    // Fall through to the exported 404 page.
  }

  return path.join(outputRoot, "404.html");
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const filePath = await resolveFile(requestUrl.pathname);

  if (!filePath) {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    const isNotFound = filePath.endsWith(`${path.sep}404.html`);
    response.writeHead(isNotFound ? 404 : 200, {
      "content-length": fileStat.size,
      "content-type":
        contentTypes.get(path.extname(filePath)) ?? "application/octet-stream",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Static export not found. Run npm run build first.");
  }
});

server.listen(port, () => {
  console.log(`Static export available at http://localhost:${port}`);
});
