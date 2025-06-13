import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: "THE GAME",
    meta: {
      viewport:
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
    },
  },
  server: {
    // Allow external access for testing on mobile devices
    host: "0.0.0.0",
  },
  output: {
    // This is for GitHub Pages deployment
    distPath: {
      root: "dist",
    },
    // This is needed for GitHub Pages with proper path
    assetPrefix: "./",
  },
});
