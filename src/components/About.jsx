import ProfileCard from "./ProfileCard";
import EdgeGlow from "./EdgeGlow";
import ShinyText from "./ShinyText";
import { profile } from "../data";

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="section-index">
              <span className="mono">01 — About</span>
              <span className="line" />
            </div>
            <h2 className="section-title">
              <ShinyText text="个人经历" /> <span className="thin">/ About Me</span>
            </h2>
          </div>
          <p className="section-desc">
            四年后期功底，一年 AI 全流程深耕——从买量素材到漫剧量产，始终在一线做交付。
          </p>
        </div>

        <div className="about-grid">
          <EdgeGlow as="div" className="about-portrait">
            <ProfileCard
              name={profile.name}
              title={profile.role}
              handle={profile.wechat}
              status="求职中"
              contactText="联系我"
              avatarUrl="/avatar-hejun.svg"
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              innerGradient="linear-gradient(145deg, rgba(72,18,22,0.95) 0%, rgba(8,3,5,0.98) 100%)"
              behindGlowColor="rgba(170,40,28,0.32)"
              behindGlowSize="45%"
              onContactClick={() => {
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </EdgeGlow>

          <div className="about-body">
            <h3>
              技术负责<em>量产</em>，审美负责<em>质感</em>——我两者都要。
            </h3>
            {profile.aboutParas.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="about-contacts">
              <EdgeGlow as="div" className="about-contact-item">
                <div className="k">Email</div>
                <div className="v">{profile.email}</div>
              </EdgeGlow>
              <EdgeGlow as="div" className="about-contact-item">
                <div className="k">WeChat</div>
                <div className="v">{profile.wechat}</div>
              </EdgeGlow>
              <EdgeGlow as="div" className="about-contact-item">
                <div className="k">Phone</div>
                <div className="v">{profile.phone}</div>
              </EdgeGlow>
              <EdgeGlow as="div" className="about-contact-item">
                <div className="k">Location</div>
                <div className="v">{profile.location}</div>
              </EdgeGlow>
            </div>
          </div>
        </div>

        <div className="stats-row">
          {profile.stats.map((s) => (
            <EdgeGlow as="div" className="stat" key={s.label}>
              <div className="num">
                {s.num}
                <sup>{s.sup}</sup>
              </div>
              <div className="label">{s.label}</div>
            </EdgeGlow>
          ))}
        </div>
      </div>
    </section>
  );
}
