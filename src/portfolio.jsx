import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

// ─── Particle Canvas Background ───────────────────────────────────────────────
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn particles
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.5 + 0.2,
        color: ["#7c3aed", "#06b6d4", "#3b82f6"][Math.floor(Math.random() * 3)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      // Draw faint connecting lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "#7c3aed";
            ctx.globalAlpha = (1 - dist / 120) * 0.15;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Shared Glow Button ────────────────────────────────────────────────────────
function GlowButton({ children, onClick, outline = false, href, disabled = false }) {
  const base = {
    display: "inline-block",
    padding: "12px 32px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "0.95rem",
    letterSpacing: "0.05em",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    textDecoration: "none",
    border: "none",
    opacity: disabled ? 0.6 : 1,
  };
  const filled = {
    ...base,
    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
    color: "#fff",
    boxShadow: "0 0 24px rgba(124,58,237,0.55), 0 0 8px rgba(6,182,212,0.3)",
  };
  const outlined = {
    ...base,
    background: "transparent",
    color: "#06b6d4",
    border: "1.5px solid #06b6d4",
    boxShadow: "0 0 12px rgba(6,182,212,0.3)",
  };
  const style = outline ? outlined : filled;
  if (href)
    return <a href={href} style={style}>{children}</a>;
  return <button style={style} onClick={onClick} disabled={disabled}>{children}</button>;
}

// ─── Custom Select Component ──────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder = "Select an option" }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div ref={selectRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: isOpen ? "1px solid #7c3aed" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "14px 18px",
          color: value ? "#e2e8f0" : "#64748b",
          fontSize: "0.9rem",
          outline: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.2s ease",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
        onBlur={(e) => !isOpen && (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      >
        <span>{selectedLabel}</span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", marginLeft: 8 }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          right: 0,
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: 12,
          zIndex: 1000,
          boxShadow: "0 0 24px rgba(124,58,237,0.2), 0 4px 12px rgba(0,0,0,0.5)",
          maxHeight: 320,
          overflowY: "auto",
          backdropFilter: "blur(10px)",
        }}>
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange({ target: { value: opt.value } });
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                padding: "12px 18px",
                background: value === opt.value ? "rgba(124,58,237,0.3)" : "transparent",
                border: "none",
                borderLeft: value === opt.value ? "3px solid #7c3aed" : "3px solid transparent",
                color: value === opt.value ? "#7c3aed" : "#cbd5e1",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(124,58,237,0.15)";
                e.target.style.color = "#7c3aed";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = value === opt.value ? "rgba(124,58,237,0.3)" : "transparent";
                e.target.style.color = value === opt.value ? "#7c3aed" : "#cbd5e1";
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section Wrapper ───────────────────────────────────────────────────────────
function Section({ id, children, style = {} }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        zIndex: 1,
        padding: "100px 24px",
        maxWidth: 1100,
        margin: "0 auto",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function SectionHeading({ label, title }) {
  return (
    <div style={{ marginBottom: 56, textAlign: "center" }}>
      <span
        style={{
          display: "inline-block",
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#06b6d4",
          background: "rgba(6,182,212,0.1)",
          border: "1px solid rgba(6,182,212,0.3)",
          padding: "4px 14px",
          borderRadius: 999,
          marginBottom: 16,
        }}
      >
        {label}
      </span>
      <h2
        style={{
          fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
          fontWeight: 800,
          background: "linear-gradient(90deg, #e2e8f0, #94a3b8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ─── Glass Card ────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, glow = false }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        backdropFilter: "blur(12px)",
        padding: "28px 32px",
        transition: "transform 0.3s, box-shadow 0.3s",
        boxShadow: glow
          ? "0 0 40px rgba(124,58,237,0.2), 0 4px 24px rgba(0,0,0,0.4)"
          : "0 4px 24px rgba(0,0,0,0.3)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow =
          "0 0 48px rgba(124,58,237,0.35), 0 8px 32px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = glow
          ? "0 0 40px rgba(124,58,237,0.2), 0 4px 24px rgba(0,0,0,0.4)"
          : "0 4px 24px rgba(0,0,0,0.3)";
      }}
    >
      {children}
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["About", "Projects", "Services", "Contact"];

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 32px",
        height: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(5,8,20,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "#fff", fontSize: "1rem",
            boxShadow: "0 0 16px rgba(124,58,237,0.6)",
          }}
        >
          H
        </div>
        <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#e2e8f0", letterSpacing: "0.04em" }}>
          Harsh.dev
        </span>
      </div>

      {/* Desktop Links */}
      <div style={{ display: "flex", gap: 36 }} className="desktop-nav">
        {links.map((l) => (
          <button
            key={l}
            onClick={() => scrollTo(l)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#94a3b8", fontSize: "0.9rem", fontWeight: 500,
              letterSpacing: "0.04em", transition: "color 0.2s",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.target.style.color = "#06b6d4")}
            onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}
          >
            {l}
          </button>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <GlowButton onClick={() => scrollTo("Contact")}>Hire Me</GlowButton>
        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: "none", background: "none", border: "none",
            cursor: "pointer", color: "#e2e8f0", fontSize: "1.5rem",
          }}
          className="hamburger"
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          style={{
            position: "absolute", top: 68, left: 0, right: 0,
            background: "rgba(5,8,20,0.97)", borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", flexDirection: "column", padding: "16px 32px",
          }}
        >
          {links.map((l) => (
            <button
              key={l}
              onClick={() => scrollTo(l)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#94a3b8", fontSize: "1rem", padding: "12px 0",
                textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "120px 24px 80px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Glow orbs */}
      <div style={{
        position: "absolute", top: "25%", left: "15%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "30%", right: "10%",
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 800 }}>
        {/* Badge */}
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 999, padding: "6px 18px",
            marginBottom: 32, fontSize: "0.8rem",
            letterSpacing: "0.12em", color: "#a78bfa",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", display: "inline-block", boxShadow: "0 0 8px #7c3aed" }} />
          Available for new projects
        </div>

        {/* Name */}
        <h1
          style={{
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            margin: "0 0 16px",
            background: "linear-gradient(135deg, #e2e8f0 30%, #7c3aed 65%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}
        >
          Harsh Verma
        </h1>

        {/* Title */}
        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            fontWeight: 600,
            color: "#06b6d4",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: "0 0 24px",
          }}
        >
          Software Developer
        </p>

        {/* Tagline */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "#94a3b8",
            lineHeight: 1.7,
            maxWidth: 620,
            margin: "0 auto 48px",
          }}
        >
          I build <strong style={{ color: "#e2e8f0" }}>scalable digital solutions</strong> tailored to your vision — from idea to deployment, I transform complex problems into seamless experiences.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <GlowButton onClick={() => scrollTo("contact")}>Hire Me →</GlowButton>
          <GlowButton outline onClick={() => scrollTo("projects")}>View Work</GlowButton>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex", justifyContent: "center", gap: 48,
            marginTop: 72, flexWrap: "wrap",
          }}
        >
          {[
            { num: "50+", label: "Projects Delivered" },
            { num: "4+", label: "Years Experience" },
            { num: "98%", label: "Client Satisfaction" },
          ].map(({ num, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{
                fontSize: "2rem", fontWeight: 800, margin: 0,
                background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{num}</p>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 0", letterSpacing: "0.05em" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────
function About() {
  const traits = [
    { icon: "🧠", title: "Problem Solver", desc: "I break complex problems into elegant, maintainable solutions." },
    { icon: "⚡", title: "Fast Executor", desc: "Rapid iteration without sacrificing quality or scalability." },
    { icon: "🎯", title: "Client-First", desc: "Your goals drive every technical decision I make." },
    { icon: "🔄", title: "Adaptable", desc: "From SaaS to fintech to e-commerce — I adapt to your domain." },
  ];
  return (
    <Section id="about">
      <SectionHeading label="Who I Am" title="Built to Solve. Wired to Deliver." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        {/* Left text */}
        <div>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: 24 }}>
            Hey, I'm <strong style={{ color: "#e2e8f0" }}>Harsh</strong> — a full-stack software developer with a love for turning ambitious ideas into polished, production-ready products.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: 24 }}>
            I don't fit into one service box. Whether you need a blazing-fast web platform, a mobile app, a custom API, or an AI-powered tool — I bring the same systems-thinking mindset and technical depth to every engagement.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.8 }}>
            My approach: understand your real problem first, then engineer the cleanest path to your goal — always with maintainability and performance in mind.
          </p>
          <div style={{ marginTop: 32 }}>
            <GlowButton href="#contact">Let's Talk</GlowButton>
          </div>
        </div>

        {/* Right traits grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {traits.map(({ icon, title, desc }) => (
            <GlassCard key={title} style={{ padding: "20px 22px" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{icon}</div>
              <h3 style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 6px" }}>{title}</h3>
              <p style={{ color: "#64748b", fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #about > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Section>
  );
}

// ─── PROJECTS ────────────────────────────────────────────────────────────────
const projects = [
  {
    title: "NexusPay",
    desc: "Real-time cross-border payment platform processing $2M+ monthly. Built with microservices, WebSockets, and zero-downtime deploys.",
    tags: ["Node.js", "React", "PostgreSQL", "Stripe", "Docker"],
    gradient: "linear-gradient(135deg,#7c3aed,#4f46e5)",
    link: "#",
  },
  {
    title: "HelixAI Dashboard",
    desc: "AI-powered analytics platform for e-commerce brands — tracks KPIs, forecasts revenue, and surfaces growth opportunities in real time.",
    tags: ["Python", "FastAPI", "OpenAI", "Next.js", "Redis"],
    gradient: "linear-gradient(135deg,#0891b2,#06b6d4)",
    link: "#",
  },
  {
    title: "OrbitCMS",
    desc: "Headless CMS with visual page builder, multi-tenant support, and plugin marketplace. Powers 20+ brands across 3 verticals.",
    tags: ["TypeScript", "GraphQL", "MongoDB", "AWS S3", "React"],
    gradient: "linear-gradient(135deg,#7c3aed,#ec4899)",
    link: "#",
  },
  {
    title: "TrailSync Mobile",
    desc: "Offline-first trail-running app with GPS tracking, community features, and real-time weather overlays. 10k+ MAU.",
    tags: ["React Native", "Expo", "Supabase", "Mapbox"],
    gradient: "linear-gradient(135deg,#059669,#06b6d4)",
    link: "#",
  },
  {
    title: "FlowDesk",
    desc: "Internal support ticket system with AI triage, SLA tracking, and Slack/email integration. Reduced resolution time by 40%.",
    tags: ["Vue.js", "Laravel", "MySQL", "OpenAI", "Pusher"],
    gradient: "linear-gradient(135deg,#d97706,#f59e0b)",
    link: "#",
  },
  {
    title: "CodeLens",
    desc: "VS Code extension for automated code review powered by LLMs — 8k downloads, used by 60+ engineering teams.",
    tags: ["TypeScript", "LangChain", "VS Code API", "Anthropic"],
    gradient: "linear-gradient(135deg,#be185d,#7c3aed)",
    link: "#",
  },
];

function Projects() {
  return (
    <Section id="projects">
      <SectionHeading label="Portfolio" title="Work That Speaks for Itself" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {projects.map((p) => (
          <GlassCard key={p.title} glow style={{ padding: 0, overflow: "hidden" }}>
            {/* Color band */}
            <div style={{ height: 6, background: p.gradient }} />
            <div style={{ padding: "24px 28px" }}>
              <h3 style={{ color: "#e2e8f0", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 10px" }}>
                {p.title}
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.7, margin: "0 0 18px" }}>
                {p.desc}
              </p>
              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {p.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "rgba(124,58,237,0.12)",
                      border: "1px solid rgba(124,58,237,0.25)",
                      color: "#a78bfa",
                      borderRadius: 999,
                      padding: "3px 10px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={p.link}
                style={{
                  color: "#06b6d4", fontSize: "0.82rem", fontWeight: 700,
                  textDecoration: "none", letterSpacing: "0.05em",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                View Project →
              </a>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────────────────────
const services = [
  {
    icon: "◈",
    title: "Custom Digital Solutions",
    desc: "No template, no shortcuts. I engineer platforms built exactly for your problem — from architecture to deployment.",
    accent: "#7c3aed",
  },
  {
    icon: "◉",
    title: "End-to-End Product Development",
    desc: "From wireframe to production: product scoping, design, development, testing, and launch — all under one roof.",
    accent: "#06b6d4",
  },
  {
    icon: "⬡",
    title: "Scalable & High-Performance Systems",
    desc: "I build for growth. APIs, databases, and frontends designed to handle 10x traffic without breaking a sweat.",
    accent: "#8b5cf6",
  },
  {
    icon: "◬",
    title: "AI & Automation Integration",
    desc: "Bring intelligence into your product — LLMs, automation pipelines, data workflows, and intelligent UIs.",
    accent: "#0891b2",
  },
  {
    icon: "⬟",
    title: "Interactive & Immersive Experiences",
    desc: "Web apps and interfaces that don't just function — they delight. Motion, real-time data, and pixel-perfect UIs.",
    accent: "#ec4899",
  },
  {
    icon: "⬢",
    title: "Technical Rescue & Optimization",
    desc: "Slow app? Messy codebase? I audit, refactor, and modernize legacy systems to perform and scale.",
    accent: "#f59e0b",
  },
];

function Services() {
  return (
    <Section id="services">
      <SectionHeading label="Capabilities" title="Not Services. Solutions." />
      <p style={{
        textAlign: "center", color: "#64748b", maxWidth: 540,
        margin: "-32px auto 56px", lineHeight: 1.7, fontSize: "0.95rem",
      }}>
        I don't sell packages. I solve problems. Whatever your challenge, I bring the tools, thinking, and execution to get it done right.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
        {services.map(({ icon, title, desc, accent }) => (
          <GlassCard key={title}>
            <div
              style={{
                width: 48, height: 48, borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${accent}20`,
                border: `1px solid ${accent}40`,
                fontSize: "1.4rem",
                color: accent,
                marginBottom: 20,
                boxShadow: `0 0 20px ${accent}30`,
              }}
            >
              {icon}
            </div>
            <h3 style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "1rem", margin: "0 0 10px" }}>{title}</h3>
            <p style={{ color: "#64748b", fontSize: "0.87rem", lineHeight: 1.7, margin: 0 }}>{desc}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO @ NovaSaaS",
    avatar: "SC",
    text: "Harsh delivered a production-ready platform in 6 weeks. The code quality, communication, and delivery speed were beyond anything we'd experienced with any other freelancer.",
    accent: "#7c3aed",
  },
  {
    name: "James Okafor",
    role: "Founder @ FleetOps",
    avatar: "JO",
    text: "Not only did Harsh build exactly what we envisioned, he pointed out architectural issues we hadn't considered — and solved them before they became problems.",
    accent: "#06b6d4",
  },
  {
    name: "Maria Torres",
    role: "Product Lead @ Shopify Agency",
    avatar: "MT",
    text: "We've worked with 10+ developers. Harsh is in a different league — he owns the outcome, not just the ticket. Will be our go-to for all future builds.",
    accent: "#8b5cf6",
  },
];

function Testimonials() {
  return (
    <Section id="testimonials">
      <SectionHeading label="Reviews" title="What Clients Say" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
        {testimonials.map(({ name, role, avatar, text, accent }) => (
          <GlassCard key={name}>
            {/* Stars */}
            <div style={{ color: "#f59e0b", fontSize: "0.9rem", marginBottom: 16, letterSpacing: 2 }}>
              ★★★★★
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 24px", fontStyle: "italic" }}>
              "{text}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: `${accent}30`, border: `2px solid ${accent}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: accent, fontWeight: 700, fontSize: "0.8rem",
              }}>
                {avatar}
              </div>
              <div>
                <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>{name}</p>
                <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>{role}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", project: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize EmailJS on component mount
  useEffect(() => {
    emailjs.init("st7AeCuJPi7uF7lSS"); // You'll get this from EmailJS dashboard
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await emailjs.send(
        "service_htneys9",     // You'll get this from EmailJS
        "template_i21h4i7",    // You'll create this in EmailJS
        {
          from_name: form.name,
          from_email: form.email,
          project_type: form.project,
          message: form.message,
          to_email: "freelanceharsh007@gmail.com", // Your email
        }
      );

      setSent(true);
      setForm({ name: "", email: "", project: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "14px 18px",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border 0.2s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    color: "#94a3b8",
    fontSize: "0.8rem",
    marginBottom: 8,
    fontWeight: 600,
    letterSpacing: "0.05em",
  };

  const socials = [
    { label: "GitHub", icon: "⌨", href: "#" },
    { label: "LinkedIn", icon: "◈", href: "#" },
    { label: "Twitter / X", icon: "◉", href: "#" },
    { label: "Email", icon: "✉", href: "mailto:freelanceharsh007@gmail.com" },
  ];

  return (
    <Section id="contact">
      <SectionHeading label="Get In Touch" title="Let's Build Something Together" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        {/* Left: form */}
        <GlassCard glow>
          {sent && (
            <div style={{
              background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 10, padding: "12px 18px", marginBottom: 24, color: "#06b6d4", fontSize: "0.9rem",
            }}>
              ✓ Message sent! I'll get back to you within 24 hours.
            </div>
          )}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "12px 18px", marginBottom: 24, color: "#ef4444", fontSize: "0.9rem",
            }}>
              ✗ {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  style={inputStyle}
                  placeholder="Your name"
                  value={form.name}
                  required
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Project Type</label>
              <CustomSelect
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                options={[
                  { value: "", label: "Select a category" },
                  { value: "Web Application", label: "Web Application" },
                  { value: "Mobile App", label: "Mobile App" },
                  { value: "API / Backend", label: "API / Backend" },
                  { value: "AI / Automation", label: "AI / Automation" },
                  { value: "Performance Optimization", label: "Performance Optimization" },
                  { value: "Other / Not sure yet", label: "Other / Not sure yet" },
                ]}
                placeholder="Select a category"
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Message</label>
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                placeholder="Tell me about your project, timeline, and goals..."
                value={form.message}
                required
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <GlowButton disabled={loading}>
              {loading ? "Sending..." : "Send Message →"}
            </GlowButton>
          </form>
        </GlassCard>

        {/* Right: info */}
        <div>
          <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: 32, fontSize: "0.95rem" }}>
            Got a project in mind? I'd love to hear about it. I typically respond within <strong style={{ color: "#e2e8f0" }}>24 hours</strong> and offer a free 30-minute discovery call for new clients.
          </p>

          {/* Info items */}
          {[
            { label: "Email", value: "freelanceharsh007@gmail.com", color: "#7c3aed" },
            { label: "Timezone", value: "UTC+5:30 (IST) — Flexible", color: "#06b6d4" },
            { label: "Availability", value: "Open to new projects", color: "#10b981" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0,
              }} />
              <div>
                <p style={{ color: "#64748b", fontSize: "0.72rem", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                <p style={{ color: "#e2e8f0", fontSize: "0.9rem", margin: 0, fontWeight: 500 }}>{value}</p>
              </div>
            </div>
          ))}

          {/* Socials */}
          <div style={{ marginTop: 36, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 28 }}>
            <p style={{ color: "#64748b", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              Find me online
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {socials.map(({ label, icon, href }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#94a3b8", fontSize: "1rem",
                    textDecoration: "none", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#7c3aed";
                    e.currentTarget.style.color = "#7c3aed";
                    e.currentTarget.style.background = "rgba(124,58,237,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #contact > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <p style={{ color: "#334155", fontSize: "0.8rem", margin: 0 }}>
        © {year} Harsh Verma · Crafted with precision & purpose · All rights reserved.
      </p>
      <p style={{ color: "#1e293b", fontSize: "0.72rem", margin: "6px 0 0" }}>
        Built with React · Open to global clients
      </p>
    </footer>
  );
}

// ─── SMOOTH SCROLL PROGRESS BAR ───────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setPct((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, height: 3,
      width: `${pct}%`, zIndex: 200,
      background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
      transition: "width 0.1s linear",
      boxShadow: "0 0 8px rgba(124,58,237,0.6)",
    }} />
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      {/* Global Styles */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          background: #050814;
          color: #e2e8f0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050814; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 99px; }
        ::selection { background: rgba(124,58,237,0.4); }
      `}</style>

      <ScrollProgress />
      <ParticleBackground />
      <Navbar />

      <main>
        <Hero />
        {/* Divider glow */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(6,182,212,0.4), transparent)", margin: "0 40px" }} />
        <About />
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)", margin: "0 40px" }} />
        <Projects />
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.2), transparent)", margin: "0 40px" }} />
        <Services />
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)", margin: "0 40px" }} />
        <Testimonials />
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)", margin: "0 40px" }} />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
