import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AORM",
      fileName: (format) =>
        `aorm.${format === "umd" ? "umd.js" : format === "es" ? "js" : "cjs"}`,
      formats: ["es", "cjs", "umd"],
    },
    sourcemap: true,
    target: "esnext",
    minify: true,
    rollupOptions: {
      output: {
        exports: "named",
        globals: {
          // Define globals if needed for UMD build
        },
      },
    },
  },
  plugins: [dts()],
  test: {
    // Vitest configuration
    globals: true,
    environment: "jsdom",
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
