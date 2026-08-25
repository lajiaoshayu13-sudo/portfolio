import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 缓动：高级、丝滑、无弹跳
const EASE = "expo.out";          // 强视觉进场（标题、巨型字）
const EASE_SOFT = "power3.out";   // 卡片 stagger，柔和不抢戏
const EASE_INOUT = "power2.inOut";

// 是否偏好减少动效（无障碍）
const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * 初始化全站动效。返回 gsap.context 以便卸载时 revert()。
 * 必须在首屏绘制前（useLayoutEffect）调用，gsap.set 的隐藏态会在 paint 前生效，避免闪烁。
 */
export function initSiteAnim() {
  if (prefersReduced()) {
    document.body.classList.add("anim-reduced");
    return null;
  }

  const ctx = gsap.context(() => {
    /* ---------- 1. 初始隐藏态（绘制前设好，无 FOUC） ---------- */
    gsap.set(
      ".nav, .hero-badge, .hero-sub, .hero-actions, .glass-card, .hero-meta, .hero-scroll, .hero-bottom-text",
      { autoAlpha: 0, y: 24 }
    );
    gsap.set(".hero-giant .mask__i, .hero-tagline .mask__i", { yPercent: 118 });
    gsap.set(
      [".project-card", ".adv-card", ".stat", ".about-contact-item", ".about-portrait", ".about-body"],
      { autoAlpha: 0, y: 60, scale: 0.97 }
    );

    /* ---------- 2. 首屏 Opening 时间线 ---------- */
    const curtain = document.querySelector(".intro-curtain");
    const heroTl = gsap.timeline({ defaults: { ease: EASE } });

    if (curtain) {
      heroTl.fromTo(
        curtain,
        { scaleY: 1, transformOrigin: "top" },
        {
          scaleY: 0,
          duration: 1.05,
          ease: "expo.inOut",
          onComplete: () => {
            curtain.style.display = "none";
          },
        },
        0
      );
    }

    heroTl
      .to(".nav", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.2)
      .to(".hero-badge", { autoAlpha: 1, y: 0, duration: 0.9 }, 0.35)
      .to(".hero-giant .mask__i", { yPercent: 0, duration: 1.35 }, 0.45)
      .to(".hero-tagline .mask__i", { yPercent: 0, duration: 1.15, stagger: 0.12 }, 0.72)
      .to(".hero-sub", { autoAlpha: 1, y: 0, duration: 0.95 }, 0.98)
      .to(".hero-actions", { autoAlpha: 1, y: 0, duration: 0.95 }, 1.12)
      .to(
        ".glass-card",
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.0, stagger: 0.1, ease: EASE_SOFT },
        0.9
      )
      .to(
        [".hero-meta", ".hero-scroll", ".hero-bottom-text"],
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 },
        1.25
      );

    /* ---------- 3. 各模块标题：遮罩揭开 + 位移 + 压缩后归位 ---------- */
    gsap.utils.toArray("section.section").forEach((sec) => {
      const idx = sec.querySelector(".section-index");
      const thin = sec.querySelector(".section-title .thin");
      const title = sec.querySelector(".section-title");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sec, start: "top 78%", once: true },
        defaults: { ease: EASE },
      });
      if (idx) tl.from(idx, { autoAlpha: 0, y: 30, duration: 0.8 }, 0);
      // 英文标题：更大位移、更晚进入，制造「先大幅进场」的视觉层级
      if (thin)
        tl.from(thin, { autoAlpha: 0, yPercent: 70, duration: 1.15 }, 0.05);
      // 主标题：clip-path 遮罩揭开 + 轻微压缩(scaleY)后归位
      if (title)
        tl.fromTo(
          title,
          {
            clipPath: "inset(0 0 100% 0)",
            yPercent: 22,
            scaleY: 0.92,
            transformOrigin: "top center",
            autoAlpha: 0,
          },
          {
            clipPath: "inset(0 0 0% 0)",
            yPercent: 0,
            scaleY: 1,
            autoAlpha: 1,
            duration: 1.2,
          },
          0.14
        );
    });

    /* ---------- 4. 卡片 / 信息块：依次 stagger 出现 ---------- */
    ScrollTrigger.batch(
      ".project-card, .adv-card, .stat, .about-contact-item, .about-portrait, .about-body",
      {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            ease: EASE_SOFT,
            stagger: 0.12,
            overwrite: true,
          }),
      }
    );

    /* ---------- 5. 轻微 parallax（仅作用于无 hover 冲突的元素） ---------- */
    const heroMedia = document.querySelector(".hero-media");
    if (heroMedia) {
      gsap.fromTo(
        heroMedia,
        { yPercent: -4, scale: 1.04 },
        {
          yPercent: 4,
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }
    const portrait = document.querySelector(".about-portrait .pc-card-wrapper");
    if (portrait) {
      gsap.fromTo(
        portrait,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-portrait",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }

    /* ---------- 6. 资源/字体加载后刷新触发点 ---------- */
    window.addEventListener("load", () => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 600);
  });

  return ctx;
}
