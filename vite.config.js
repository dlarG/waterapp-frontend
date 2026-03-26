// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Import the plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the plugin to the plugins array
  ],
  server: {
    host: true, // or '0.0.0.0'
    port: 5173, // default Vite port
  },
});
