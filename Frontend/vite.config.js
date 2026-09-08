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
  const configuredBackend = env.VITE_BACKEND_API_HEADER || "localhost:5000";
  const backendTarget = /^https?:\/\//.test(configuredBackend)
    ? configuredBackend
    : `${isHttps ? "https" : "http"}://${configuredBackend}`;

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
          target: backendTarget,
          secure: false,
          changeOrigin: true,
        },
      },
    },
  };
});
