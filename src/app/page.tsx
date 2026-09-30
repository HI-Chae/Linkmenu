"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type LinkItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  mark: string;
  tone: string;
};

const links: LinkItem[] = [
  { id: "github", label: "깃허브", description: "만드는 것들과 코드 기록", href: "https://github.com/[chae.hi@gmail.com]", mark: "GH", tone: "lime" },
  { id: "blog", label: "블로그", description: "스마트일렉트로닉스", href: "https://www.smart-ele.co.kr", mark: "B", tone: "blue" },
  { id: "email", label: "이메일", description: "chae.hi@gmail.com", href: "mailto:chae.hi@gmail.com", mark: "@", tone: "blue" },
];

const countsKey = "linknamu:click-counts";
const themeKey = "linknamu:theme";

export default function Home() {
  const [theme, setTheme] = useState<Theme>("light");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeKey);
    const savedCounts = window.localStorage.getItem(countsKey);

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    }

    if (savedCounts) {
      try {
        setCounts(JSON.parse(savedCounts) as Record<string, number>);
      } catch {
        window.localStorage.removeItem(countsKey);
      }
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(themeKey, nextTheme);
  }

  function recordClick(id: string) {
    const nextCounts = { ...counts, [id]: (counts[id] ?? 0) + 1 };
    setCounts(nextCounts);
    window.localStorage.setItem(countsKey, JSON.stringify(nextCounts));
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
            <span>{String(links.length).padStart(2, "0")} LINKS</span>
          </div>
          <ul className="link-list">
            {links.map((link, index) => (
              <li className="link-item" key={link.id} style={{ animationDelay: `${index * 70}ms` }}>
                <a className="link-card" href={link.href} target="_blank" rel="noreferrer" onClick={() => recordClick(link.id)}>
                  <span className={`link-mark ${link.tone}`} aria-hidden="true">{link.mark}</span>
                  <span className="link-copy">
                    <span className="link-title">{link.label}</span>
                    <span className="link-description">{link.description}</span>
                  </span>
                  <span className="link-count" aria-label={`${counts[link.id] ?? 0}회 클릭`}>
                    <strong>{counts[link.id] ?? 0}</strong>
                    <span>CLICKS</span>
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