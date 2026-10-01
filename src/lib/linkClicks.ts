export const LINK_DEFS = [
  { id: "github", label: "깃허브", description: "만드는 것들과 코드 기록", href: "https://github.com/[chae.hi@gmail.com]", mark: "GH", tone: "lime" },
  { id: "blog", label: "블로그", description: "스마트일렉트로닉스", href: "https://www.smart-ele.co.kr", mark: "B", tone: "blue" },
  { id: "email", label: "이메일", description: "chae.hi@gmail.com", href: "mailto:chae.hi@gmail.com", mark: "@", tone: "blue" },
] as const;

export type LinkId = (typeof LINK_DEFS)[number]["id"];
export type LinkCountMap = Record<string, number>;

export function normalizeLinkCounts(input?: Partial<Record<string, number>>): LinkCountMap {
  const counts = {} as LinkCountMap;

  for (const link of LINK_DEFS) {
    const rawValue = input?.[link.id];
    const numericValue = typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : 0;
    counts[link.id] = Math.max(0, Math.floor(numericValue));
  }

  return counts;
}

export function formatLinkCount(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return `${safeValue}회`;
}
