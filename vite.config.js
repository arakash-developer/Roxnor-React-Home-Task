import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@layers": path.resolve(__dirname, "./src/components/layers"),
      "@pages": path.resolve(__dirname, "./src/components/pages"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
    },
  },
});
