// Managed credentials stay on Lovable; Vercel contacts only fixed endpoints.
export const LOVABLE_ORIGIN = "https://shubhbooks.lovable.app";

export function isVercelCopy() {
  return process.env["VERCEL"] === "1";
}

export async function forwardToLovable(request: Request, path: "/api/chat" | "/api/public/refresh-views") {
  const headers = new Headers({ "content-type": "application/json" });
  const publicKey = request.headers.get("apikey");
  if (publicKey) headers.set("apikey", publicKey);
  const response = await fetch(`${LOVABLE_ORIGIN}${path}`, {
    method: "POST", headers, body: await request.text(),
    signal: request.signal, redirect: "error",
  });
  const outgoing = new Headers({ "cache-control": "no-store" });
  for (const name of ["content-type", "x-vercel-ai-ui-message-stream", "retry-after"]) {
    const value = response.headers.get(name);
    if (value) outgoing.set(name, value);
  }
  response.headers.forEach((value, name) => {
    if (name.toLowerCase().startsWith("x-lovable-aig-")) outgoing.set(name, value);
  });
  return new Response(response.body, { status: response.status, headers: outgoing });
}

export async function refreshLovableCounts(publicKey: string, signal?: AbortSignal) {
  const response = await fetch(`${LOVABLE_ORIGIN}/api/public/refresh-views`, {
    method: "POST", headers: { apikey: publicKey }, signal: signal ?? null, redirect: "error",
  });
  if (!response.ok) throw new Error(`Book count refresh failed (${response.status})`);
}