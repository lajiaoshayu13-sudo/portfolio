import Reveal from "./Reveal";
import SpecularButton from "./SpecularButton";
import { contact, profile } from "../data";

export default function Contact() {
  return (
    <footer className="contact" id="contact">
      <div className="contact-main">
        <Reveal>
          <span className="mono">04 — Contact</span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="contact-title">
            {contact.title1}
            <br />
            <span className="outline">{contact.title2}</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="contact-sub">{contact.sub}</p>
        </Reveal>
        <Reveal delay={3}>
          <div className="contact-actions">
            <SpecularButton
              href={`mailto:${contact.email}`}
              size="lg"
              radius={14}
              tint="#ff4438"
              tintOpacity={0.16}
              textColor="#f4eeed"
              lineColor="#ff8a7a"
              baseColor="#4a1410"
              intensity={1.2}
              proximity={320}
            >
              {contact.email}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </SpecularButton>
          </div>
        </Reveal>
      </div>

      <div className="footer-bar">
        <div className="footer-inner">
          <span className="mono">{contact.copyright}</span>
          <div className="footer-socials">
            {contact.socials.map((s) => (
              <a key={s.label} href={s.href}>{s.label}</a>
            ))}
          </div>
          <span className="mono">{profile.location}</span>
        </div>
      </div>
    </footer>
  );
}
