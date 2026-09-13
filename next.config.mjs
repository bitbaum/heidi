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
/** @type {import('next').NextConfig['redirects']} */
async function redirects() {
  return [
    {
      // `/:locale/check` was a real, indexed page until the checker became
      // evidence on the method page. Links to it exist in the wild and in
      // Google's index, so it moves permanently rather than 404s — a retired
      // URL that answers 404 throws away whatever standing it had.
      // The locale is spelled out rather than left as `:locale`. A bare
      // wildcard matches ANY first segment — including `api`, so `/api/check`
      // 308'd to `/api/method` and the checker silently stopped working while
      // the page around it still rendered perfectly. `lib/i18n/routes.test.ts`
      // asserts this list equals LOCALES so the two cannot drift.
      source: "/:locale(de|gsw|fr|it|rm|en|ru)/check",
      destination: "/:locale/method",
      permanent: true,
    },
  ];
}

const nextConfig = {
  redirects,
  // The box's launch.sh looks for a server.js — see sync-infra.sh.
  output: "standalone",
  reactStrictMode: true,
  env: { COMMIT_SHA: commitSha() },
};
export default nextConfig;
