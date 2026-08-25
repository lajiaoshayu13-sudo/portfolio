import EdgeGlow from "./EdgeGlow";
import ShinyText from "./ShinyText";
import { advantages } from "../data";

export default function Advantages() {
  return (
    <section className="section" id="advantages">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="section-index">
              <span className="mono">03 — Strengths</span>
              <span className="line" />
            </div>
            <h2 className="section-title">
              <ShinyText text="个人优势" /> <span className="thin">/ Strengths</span>
            </h2>
          </div>
          <p className="section-desc">
            既懂模型，也懂镜头；既能搭建流程，也能打磨细节。
          </p>
        </div>

        <div className="adv-grid">
          {advantages.map((a, i) => (
            <EdgeGlow as="div" className="adv-card" key={a.num}>
              <span className="adv-num">{a.num}</span>
              <div className="adv-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
                  <path d={a.icon} />
                </svg>
              </div>
              <h3><ShinyText text={a.title} /></h3>
              <p>{a.desc}</p>
              <div className="adv-keywords">
                {a.keywords.map((k) => (
                  <span key={k}>#{k}</span>
                ))}
              </div>
            </EdgeGlow>
          ))}
        </div>
      </div>
    </section>
  );
}
