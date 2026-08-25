import { useState } from "react";
import { profile } from "../data";
import SpecularButton from "./SpecularButton";

// 悬浮玻璃卡片 —— 悬浮于巨型标题之上
const cards = [
  { cls: "gc1", k: "FULL PIPELINE", t1: "AI 短剧 · 漫剧", t2: "全流程制作" },
  { cls: "gc2", k: "CONSISTENCY", t1: "角色一致性", t2: "控制" },
  { cls: "gc3", k: "50 部 / 2 个月", t1: "标准化量产", t2: "SOP 搭建" },
  { cls: "gc4", k: "FILM GRADE", t1: "电影级", t2: "后期包装" },
];

export default function Hero() {
  // 视频加载失败时自动切换为动态渐变背景
  const [videoOk, setVideoOk] = useState(true);

  return (
    <section className="hero hero-cine" id="top">
      <div className="intro-curtain" aria-hidden="true" />
      <div className="hero-media">
        <div className="hero-fallback" />
        {videoOk && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoOk(false)}
            onEnded={(e) => {
              // loop 兜底：部分浏览器/编码下 loop 属性可能失效，手动重播确保循环
              const v = e.currentTarget;
              v.currentTime = 0;
              v.play().catch(() => {});
            }}
          >
            {/* 个人作品：《全民大航海》仿真人短剧片段 */}
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      <div className="hero-tint" />
      <div className="hero-shade" />
      <div className="hero-scan" />

      <div className="container hero-content">
        <div className="hero-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
          </svg>
          {profile.roleEn}
        </div>

        <div className="hero-giant">
          <span className="mask">
            <span className="giant-text mask__i">HE JUN</span>
          </span>
        </div>

        <p className="hero-tagline">
          <span className="mask">
            <span className="mask__i">用 AI 量产故事</span>
          </span>
          <span className="sep" />
          <span className="mask">
            <span className="mask__i">用剪辑打磨质感</span>
          </span>
        </p>
        <p className="hero-sub">{profile.heroSub}</p>
        <div className="hero-actions">
          <SpecularButton
            href="#contact"
            size="lg"
            radius={14}
            tint="#ff4438"
            tintOpacity={0.92}
            textColor="#ffffff"
            lineColor="#ffb3a3"
            baseColor="#4a1410"
            intensity={1.25}
            className="specular-button--primary"
          >
            联系我
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </SpecularButton>
          <SpecularButton
            href="#projects"
            size="lg"
            radius={14}
            tint="#ff4438"
            tintOpacity={0}
            textColor="#e9ecf1"
            lineColor="#ff8a7a"
            baseColor="#525252"
            proximity={300}
          >
            查看作品
          </SpecularButton>
        </div>
      </div>

      <div className="hero-bottom-text">PORTFOLIO · 2026</div>

      {/* 玻璃卡片移至右侧边缘，避开视频主体 */}
      {cards.map((c) => (
        <div className={`glass-card ${c.cls}`} key={c.cls}>
          <div className="gk">{c.k}</div>
          <div className="gt">
            {c.t1}
            <br />
            {c.t2}
          </div>
        </div>
      ))}

      <div className="hero-meta">
        <span className="mono">{profile.location}</span>
        <span className="mono">{profile.availability}</span>
      </div>

      <div className="hero-scroll">
        <span className="mono">Scroll</span>
        <span className="wheel" />
      </div>

      {/* 电影颗粒噪点，置于最上层 */}
      <div className="hero-grain" />
    </section>
  );
}
