import { afterEach, describe, expect, it, vi } from "vitest";
import { forwardToLovable, isVercelCopy, refreshLovableCounts } from "@/lib/vercel-copy.server";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("Separate Vercel copy", () => {
  it("keeps Lovable mode unless running on Vercel", () => {
    vi.stubEnv("VERCEL", "");
    expect(isVercelCopy()).toBe(false);
    vi.stubEnv("VERCEL", "1");
    expect(isVercelCopy()).toBe(true);
  });

  it("streams the analyst through the fixed origin without private request credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("data: answer\n\n", {
      headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1", "set-cookie": "private", "x-lovable-aig-run-id": "run" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await forwardToLovable(new Request("https://copy.vercel.app/api/chat", {
      method: "POST", body: '{"messages":[]}', headers: { authorization: "Bearer private", cookie: "private" },
    }), "/api/chat");
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://shubhbooks.lovable.app/api/chat");
    const options = fetchMock.mock.calls[0]?.[1];
    expect(options.headers.has("authorization")).toBe(false);
    expect(options.headers.has("cookie")).toBe(false);
    expect(await response.text()).toBe("data: answer\n\n");
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("preserves upstream analyst failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Please wait", { status: 429, headers: { "retry-after": "30" } })));
    const response = await forwardToLovable(new Request("https://copy.vercel.app/api/chat", { method: "POST", body: "{}" }), "/api/chat");
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("30");
  });

  it("does not label a failed count refresh as fresh", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Unavailable", { status: 502 })));
    await expect(refreshLovableCounts("public-key")).rejects.toThrow("Book count refresh failed (502)");
  });
});