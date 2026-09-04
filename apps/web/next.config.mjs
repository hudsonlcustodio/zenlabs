/**
 * Next.js configuration — apps/web (ADR-0003).
 *
 * Deliberately minimal: no Tailwind, no image domains, no rewrites. The design
 * system (P18) and the product surfaces (P15+) bring their own configuration.
 */
/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // The app source lives under src/app; Next discovers it automatically.
  eslint: { ignoreDuringBuilds: true }, // lint runs once, from the root (P1.01 AC-3)
  typescript: { ignoreBuildErrors: true }, // typecheck runs once, from the root
};
