import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA: setelah dibuka sekali (online), service worker meng-cache seluruh
    // aplikasi sehingga bisa dibuka offline / di-install sebagai aplikasi.
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["img/LogoBenline.png"],
      manifest: {
        name: "Benline — Undian Acara",
        short_name: "Benline",
        description:
          "Aplikasi pengundian acara Benline: beberapa sesi, pemenang unik, bisa dipakai offline.",
        theme_color: "#18181b",
        background_color: "#18181b",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/img/LogoBenline.png", sizes: "192x192", type: "image/png" },
          { src: "/img/LogoBenline.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // Semua hasil build di-precache → offline penuh setelah kunjungan pertama.
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
