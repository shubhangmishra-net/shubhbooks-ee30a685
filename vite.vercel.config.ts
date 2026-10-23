import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Only Vercel selects this file; Lovable keeps the default configuration.
export default defineConfig({
  tanstackStart: { server: { entry: "server" } },
  nitro: { preset: "vercel" },
  vite: { define: { "import.meta.env.VITE_VERCEL_COPY": JSON.stringify("true") } },
});