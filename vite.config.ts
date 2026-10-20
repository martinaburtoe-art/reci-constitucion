// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: { plugins: [VitePWA({strategies: "generateSW", registerType: "autoUpdate", injectRegister: null, manifest: false, devOptions: {enabled: false}, workbox: {globPatterns: ["**/*.{js,css,svg,png,ico}", "offline.html"], navigateFallback: "offline.html", navigateFallbackDenylist: [/^\/~oauth/, /^\/api/, /^\/_serverFn/], importScripts: ["/push-events.js"], runtimeCaching: [{urlPattern: ({url}) => url.origin===self.location.origin && /^\/assets\/.*[-.][a-zA-Z0-9_-]{8,}\./.test(url.pathname), handler: "CacheFirst", options: {cacheName: "reciconti-assets", expiration: {maxEntries: 100}}}]}})] },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
