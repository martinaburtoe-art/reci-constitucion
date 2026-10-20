import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "node:path"
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tanstackStart({ server: { entry: "server" } }),
    nitro(),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      manifest: false,
      devOptions: { enabled: false },
      globDirectory: ".output/public",
      workbox: {
        globPatterns: ["**/*.{js,css,svg,png,ico}", "offline.html"],
        navigateFallback: "offline.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api/, /^\/_serverFn/],
        importScripts: ["/push-events.js"],
        runtimeCaching: [{
          urlPattern: ({ url }) => url.origin === self.location.origin && /^\/assets\/.*[-.][a-zA-Z0-9_-]{8,}\./.test(url.pathname),
          handler: "CacheFirst",
          options: { cacheName: "reciconti-assets", expiration: { maxEntries: 100 } },
        }],
      },
    }),
  ],
  resolve: { dedupe: ["react", "react-dom", "@tanstack/react-router"] },
  build: { outDir: ".output/public", emptyOutDir: true },
});