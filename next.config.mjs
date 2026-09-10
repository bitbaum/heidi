import { execSync } from "node:child_process";

/** Short commit SHA baked in at build time so /api/health can say which build is live. */
function commitSha() {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The box's launch.sh looks for a server.js — see sync-infra.sh.
  output: "standalone",
  reactStrictMode: true,
  env: { COMMIT_SHA: commitSha() },
};
export default nextConfig;
