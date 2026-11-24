import { readFile } from "node:fs/promises";
import path from "node:path";

export type AiSkillName = "copywriting" | "content-strategy" | "social" | "video";

const SKILL_SECTIONS: Record<AiSkillName, readonly string[]> = {
  copywriting: [
    "Writing Style Rules",
    "No AI Tells",
    "Claims Must Be Supportable — and Declines Must Name Their Unlock",
  ],
  "content-strategy": [
    "Content Types",
    "Content Ideation Sources",
    "Per-Format Execution Discipline",
  ],
  social: ["No AI Tells", "Content Ideas by Situation", "Short-Form Video (TikTok, Reels, Shorts)"],
  video: ["Video Production Workflows", "Common Mistakes"],
};

const SKILL_PATHS: Record<AiSkillName, string> = {
  copywriting: ".agents/skills/copywriting/SKILL.md",
  "content-strategy": ".agents/skills/content-strategy/SKILL.md",
  social: ".agents/skills/social/SKILL.md",
  video: ".agents/skills/video/SKILL.md",
};

function extractSections(markdown: string, requestedSections: readonly string[]): string[] {
  const lines = markdown.split(/\r?\n/);
  const sections: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading || !requestedSections.includes(heading[2])) continue;

    const level = heading[1].length;
    let end = index + 1;
    while (end < lines.length) {
      const nextHeading = lines[end].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (nextHeading && nextHeading[1].length <= level) break;
      end += 1;
    }

    sections.push(lines.slice(index, end).join("\n").trim());
    index = end - 1;
  }

  return sections;
}

export async function loadSkillGuidance(
  skillNames: readonly AiSkillName[],
  sectionOverrides: Partial<Record<AiSkillName, readonly string[]>> = {}
): Promise<string> {
  const skills = await Promise.all(
    skillNames.map(async (name) => {
      const skillPath = path.join(process.cwd(), SKILL_PATHS[name]);
      const markdown = await readFile(skillPath, "utf8");
      const sections = extractSections(markdown, sectionOverrides[name] || SKILL_SECTIONS[name]);

      if (sections.length === 0) {
        throw new Error(`Không tìm thấy phần hướng dẫn cần dùng trong skill "${name}".`);
      }

      return `## Skill: ${name}\n${sections.join("\n\n")}`;
    })
  );

  return skills.join("\n\n");
}
