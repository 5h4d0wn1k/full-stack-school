const target = process.env.HEALTH_URL ?? "http://127.0.0.1:3000/health";
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 5000);

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

try {
  const response = await fetch(target, { signal: controller.signal });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Expected HTTP 2xx from ${target}, received ${response.status}`);
  }

  if (body.status !== "ok" || body.service !== "full-stack-school") {
    throw new Error(`Unexpected health payload from ${target}: ${JSON.stringify(body)}`);
  }

  console.log(`Health smoke passed for ${target}`);
} finally {
  clearTimeout(timeout);
}
