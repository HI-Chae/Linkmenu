"use client";

import { useEffect, useState } from "react";

import { formatLinkCount, LINK_DEFS, normalizeLinkCounts } from "@/lib/linkClicks";

type Theme = "light" | "dark";

const themeKey = "linknamu:theme";

export default function Home() {
  const [theme, setTheme] = useState<Theme>("light");
  const [counts, setCounts] = useState<Record<string, number>>(() => normalizeLinkCounts());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeKey);

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    }

    const loadCounts = async () => {
      try {
        const response = await fetch("/api/links");
        if (!response.ok) {
          throw new Error("Failed to fetch counts");
        }

        const payload = (await response.json()) as { counts?: Record<string, number> };
        setCounts(normalizeLinkCounts(payload.counts));
      } catch {
        setCounts(normalizeLinkCounts());
      }
    };

    void loadCounts();
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(themeKey, nextTheme);
  }

  async function recordClick(id: string) {
    setCounts((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to record click");
      }

      const payload = (await response.json()) as { count?: number };
      setCounts((current) => ({
        ...current,
        [id]: typeof payload.count === "number" ? payload.count : (current[id] ?? 0),
      }));

      return typeof payload.count === "number" ? payload.count : (counts[id] ?? 0);
    } catch {
      setCounts((current) => ({ ...current, [id]: current[id] ?? 0 }));
      return counts[id] ?? 0;
    }
  }

  async function handleLinkClick(event: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) {
    event.preventDefault();
    await recordClick(id);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function copyPageLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="링크나무 홈">
          linknamu<span className="wordmark-leaf">.</span>
        </a>
        <div className="topbar-tools">
          <span className="page-index">CREATOR PAGE / 001</span>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
            title={theme === "light" ? "다크 모드" : "라이트 모드"}
          >
            <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
          </button>
        </div>
      </header>

      <main className="profile-page">
        <section className="profile-intro" aria-labelledby="profile-name">
          <div className="avatar-wrap">
            <div
              className="avatar"
              role="img"
              aria-label="Hong Il Chae 프로필 사진"
              style={{ backgroundImage: 'url("/채홍일 님.jpg")' }}
            />
            <span className="avatar-stamp" aria-hidden="true">✳</span>
          </div>
          <p className="profile-kicker">CREATOR · DEVELOPER</p>
          <h1 id="profile-name">Hong Il Chae</h1>
          <p className="profile-bio">Claude Code에 관심이 많아요</p>
          <div className="profile-actions">
            <span className="location-note"><span className="live-dot" aria-hidden="true" />ONLINE, MAKING THINGS</span>
            <button className="share-button" type="button" onClick={copyPageLink} aria-label="프로필 링크 복사" title={copied ? "복사 완료" : "프로필 링크 복사"}>
              <span aria-hidden="true">{copied ? "✓" : "↗"}</span>
            </button>
          </div>
          <span className="copy-status" role="status" aria-live="polite">{copied ? "주소를 복사했어요" : ""}</span>
        </section>

        <section className="links-section" aria-labelledby="links-heading">
          <div className="section-heading">
            <h2 id="links-heading">내 링크</h2>
            <span>{String(LINK_DEFS.length).padStart(2, "0")} LINKS</span>
          </div>
          <ul className="link-list">
            {LINK_DEFS.map((link, index) => (
              <li className="link-item" key={link.id} style={{ animationDelay: `${index * 70}ms` }}>
                <a
                  className="link-card"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => void handleLinkClick(event, link.href, link.id)}
                >
                  <span className={`link-mark ${link.tone}`} aria-hidden="true">{link.mark}</span>
                  <span className="link-copy">
                    <span className="link-title">{link.label}</span>
                    <span className="link-description">{link.description}</span>
                  </span>
                  <span className="link-count" aria-label={`${counts[link.id] ?? 0}회 클릭`}>
                    <strong>{formatLinkCount(counts[link.id] ?? 0)}</strong>
                  </span>
                  <span className="link-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="links-footnote">좋아하는 곳들을 한데 모았어요.</p>
        </section>

        <footer className="page-footer">
          <span>MADE WITH CARE</span><span className="footer-spark" aria-hidden="true">✳</span><span>LINKNAMU © 2025</span>
        </footer>
      </main>
    </div>
  );
}