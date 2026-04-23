import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // All /api and /photos requests go to Express backend
      "/api": "http://localhost:3001",
      "/photos": "http://localhost:3001",
    },
  },
});
