import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import EdgeGlow from "./EdgeGlow";
import ShinyText from "./ShinyText";
import { projects } from "../data";

function PosterLightbox({ media, onClose }) {
  const videoRef = useRef(null);
  // 关闭图标位置：默认相对容器(竖屏视频贴合画面)，横版视频由下方测量改为贴实际画面
  const [iconPos, setIconPos] = useState({ top: 80, right: 12 });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // 预览打开时锁定页面滚动，避免滚轮缩放/拖拽时整页跟着滑动
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [onClose]);

  // 视频预览：测量 object-fit:contain 后的真实画面矩形，
  // 把关闭图标定位到「画面」右上角（距画面顶 80px、距画面右 12px）。
  // 竖屏视频画面铺满容器 → 与相对容器定位一致；横版视频画面居中留黑边 → 贴画面而非黑边。
  useEffect(() => {
    if (!media?.video) return;
    const compute = () => {
      const v = videoRef.current;
      if (!v) return;
      const rect = v.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      if (!W || !H || !vw || !vh) return;
      const elAspect = W / H;
      const vidAspect = vw / vh;
      let contentW, contentH;
      if (elAspect > vidAspect) {
        // 高度受限，左右留黑边
        contentH = H;
        contentW = H * vidAspect;
      } else {
        // 宽度受限，上下留黑边
        contentW = W;
        contentH = W / vidAspect;
      }
      const contentLeft = (W - contentW) / 2;
      const contentTop = (H - contentH) / 2;
      setIconPos({ top: contentTop + 80, right: contentLeft + 12 });
    };
    const v = videoRef.current;
    compute();
    v?.addEventListener("loadedmetadata", compute);
    v?.addEventListener("canplay", compute);
    window.addEventListener("resize", compute);
    return () => {
      v?.removeEventListener("loadedmetadata", compute);
      v?.removeEventListener("canplay", compute);
      window.removeEventListener("resize", compute);
    };
  }, [media?.video]);

  if (!media) return null;

  return (
    <div className="poster-lightbox" onClick={onClose}>
      {media.video ? (
        <div
          className="poster-lightbox-video-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="poster-lightbox-video-close"
            style={{ top: iconPos.top, right: iconPos.right }}
            onClick={onClose}
            aria-label="关闭预览"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <video
            ref={videoRef}
            className="poster-lightbox-video"
            src={media.video}
            controls
            autoPlay
            playsInline
          />
        </div>
      ) : (
        <>
          <button
            type="button"
            className="poster-lightbox-close"
            onClick={onClose}
            aria-label="关闭预览"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <img
            className="poster-lightbox-img"
            src={media.image}
            alt="预览大图"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </>
      )}
    </div>
  );
}

function PosterDropdown({ options, selected, onSelect, open, setOpen }) {
  const ref = useRef(null);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handle = (e) => {
      if (open) {
        const inToggle = ref.current && ref.current.contains(e.target);
        const inMenu = menuRef.current && menuRef.current.contains(e.target);
        if (!inToggle && !inMenu) setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, setOpen]);

  // 打开时计算按钮位置，用 fixed 定位脱离卡片 overflow:hidden 的裁切
  // 滚动/resize 时持续更新，保持菜单与按钮对齐
  useEffect(() => {
    if (!open || !toggleRef.current) return;

    const update = () => {
      const r = toggleRef.current.getBoundingClientRect();
      const menuWidth = 240;
      const menuHeight = menuRef.current?.offsetHeight || 360;
      let left = r.right + 12;
      // 防止超出右侧视口
      if (left + menuWidth > window.innerWidth - 8) {
        left = Math.max(8, r.left - menuWidth - 12);
      }
      // 默认显示在按钮上方右对齐，贴合「短剧海报栏目右上方」
      let top = r.top - menuHeight - 8;
      // 上方空间不足则向下展开
      if (top < 8) {
        top = r.bottom + 8;
        // 下方也超出视口则贴底
        if (top + menuHeight > window.innerHeight - 8) {
          top = Math.max(8, window.innerHeight - menuHeight - 8);
        }
      }
      setMenuPos({ top, left });
    };

    update();
    // rAF 节流 + passive，避免滚动时每帧多次触发 getBoundingClientRect/setState
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  if (!options) return null;

  const categories = Object.keys(options);

  const menu = open && (
    <div
      ref={menuRef}
      className="poster-dropdown-menu"
      style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
    >
      {categories.map((cat) => {
        const items = options[cat] || [];
        return (
          <div className="poster-dropdown-group" key={cat}>
            <div className="poster-dropdown-cat">{cat}</div>
            {items.length === 0 ? (
              <div className="poster-dropdown-empty">敬请期待</div>
            ) : (
              items.map((opt) => {
                const key = opt.video || opt.image;
                return (
                  <EdgeGlow
                    as="button"
                    type="button"
                    key={key}
                    className={`poster-dropdown-item ${selected === key ? "active" : ""}`}
                    onClick={() => {
                      onSelect(opt);
                      setOpen(false);
                    }}
                  >
                    <span>{opt.label}</span>
                  </EdgeGlow>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="poster-dropdown" ref={ref}>
      <button
        type="button"
        ref={toggleRef}
        className={`poster-dropdown-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span>查看详情</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {menu && createPortal(menu, document.body)}
    </div>
  );
}

function ProjectCard({ p, i }) {
  const [selected, setSelected] = useState(
    p.poster?.image ? { image: p.poster.image } : null
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [coverRatio, setCoverRatio] = useState(9 / 16);

  // 动态读取图片原始宽高比，使封面区域比例匹配图片本身，
  // 避免 contain 模式下因比例不一致产生上下/左右黑边。
  useEffect(() => {
    if (selected?.image) {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setCoverRatio(img.naturalWidth / img.naturalHeight);
        }
      };
      img.src = selected.image;
    } else {
      setCoverRatio(9 / 16);
    }
  }, [selected?.image, selected?.video]);

  const hasMedia = !!(selected?.image || selected?.video);
  const coverStyle =
    hasMedia && selected?.image ? { aspectRatio: coverRatio } : undefined;

  return (
    <EdgeGlow as="article" className="project-card">
      {/* 大图/视频预览用 portal 挂到 body：
          .project-card 有 overflow:hidden / hover transform / isolation:isolate，
          且 GSAP 会给卡片写入 transform，会让 position:fixed 以卡片为基准并被裁切。
          portal 后弹窗才真正脱离卡片、以整个屏幕为基准居中显示。 */}
      {lightboxOpen &&
        hasMedia &&
        createPortal(
          <PosterLightbox media={selected} onClose={() => setLightboxOpen(false)} />,
          document.body
        )}
      <div
        className={`project-cover ${hasMedia ? "poster-cover" : ""}`}
        style={coverStyle}
        onClick={() => hasMedia && setLightboxOpen(true)}
        role={hasMedia ? "button" : undefined}
        aria-label={hasMedia ? "点击查看大图" : undefined}
        tabIndex={hasMedia ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasMedia && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setLightboxOpen(true);
          }
        }}
      >
        {selected?.video ? (
          <video
            className="poster-video"
            src={selected.video}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : selected?.image ? (
          <div
            className="poster-bg poster-real"
            style={{ backgroundImage: `url(${selected.image})` }}
          />
        ) : (
          <>
            <div className={`art ${p.art}`} />
            <span className="badge">{p.badge}</span>
          </>
        )}
        {selected?.image && (
          <button
            type="button"
            className="poster-zoom-btn"
            aria-label="全屏查看图片"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </button>
        )}
      </div>
      <div className="project-info">
        <div>
          {p.tags && p.tags.length > 0 && (
            <div className="project-tags">
              {p.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          )}
          <h3><ShinyText text={p.title} /></h3>
          <p className="desc">{p.desc}</p>
          {p.poster?.options && (
            <PosterDropdown
              options={p.poster.options}
              selected={selected?.video || selected?.image}
              onSelect={setSelected}
              open={menuOpen}
              setOpen={setMenuOpen}
            />
          )}
        </div>
        {p.metrics && p.metrics.length > 0 && (
          <div className="project-foot">
            <div className="project-metrics">
              {p.metrics.map((m) => (
                <div className="m" key={m.t}>
                  <div className="n">
                    {m.n}
                    <em>{m.em}</em>
                  </div>
                  <div className="t">{m.t}</div>
                </div>
              ))}
            </div>
            <a href="#contact" className="project-link" aria-label="查看项目详情">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </EdgeGlow>
  );
}

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="section-index">
              <span className="mono">02 — Works</span>
              <span className="line" />
            </div>
            <h2 className="section-title">
              <ShinyText text="精选项目" /> <span className="thin">/ Selected Works</span>
            </h2>
          </div>
          <p className="section-desc">
            从 AI 短剧到品牌影像，每一个项目都是「技术 × 叙事」的一次实践。
          </p>
        </div>

        <div className="projects">
          {projects.map((p, i) => (
            <ProjectCard p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
