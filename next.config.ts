import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/ai/writer": [
      "./.agents/skills/copywriting/SKILL.md",
      "./.agents/skills/social/SKILL.md",
      "./.agents/skills/video/SKILL.md",
    ],
    "/api/ai/director": [
      "./.agents/skills/content-strategy/SKILL.md",
      "./.agents/skills/social/SKILL.md",
      "./.agents/skills/video/SKILL.md",
    ],
    "/api/ai/chat": [
      "./.agents/skills/copywriting/SKILL.md",
      "./.agents/skills/social/SKILL.md",
    ],
  },
};

export default nextConfig;
