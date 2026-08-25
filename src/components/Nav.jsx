import { useEffect, useState } from "react";
import { profile } from "../data";
import SpecularButton from "./SpecularButton";

export default function Nav() {
  // 滑过第一屏（约 85vh）后，导航切换为磨砂玻璃固定悬浮态
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setPinned(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${pinned ? " pinned" : ""}`}>
      <div className="nav-inner">
        <a href="#top" className="nav-logo">
          <span className="dot" />
          {profile.nameEn}
        </a>
        <div className="nav-right">
          <nav className="nav-links">
            <a href="#about"><span className="idx">01</span>关于我</a>
            <a href="#projects"><span className="idx">02</span>精选项目</a>
            <a href="#advantages"><span className="idx">03</span>个人优势</a>
          </nav>
          <SpecularButton
            href="#contact"
            size="sm"
            radius={12}
            tint="#ff4438"
            tintOpacity={0}
            textColor="#f0e9e8"
            lineColor="#ff8a7a"
            baseColor="#525252"
            proximity={220}
          >
            联系我
          </SpecularButton>
        </div>
      </div>
    </header>
  );
}
