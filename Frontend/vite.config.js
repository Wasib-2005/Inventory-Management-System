import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isHttps = env.VITE_IS_HTTPS === "true";
  const backendHost = env.VITE_BACKEND_API_HEADER;

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    server: {
      port: 3000,
      ...(isHttps && {
        https: {
          key: fs.readFileSync(
            path.resolve(__dirname, "../certs/localhost-key.pem"),
          ),
          cert: fs.readFileSync(
            path.resolve(__dirname, "../certs/localhost.pem"),
          ),
        },
      }),
      proxy: {
        "/api": {
          target: `${isHttps ? "https" : "http"}://${backendHost}`,
          secure: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
