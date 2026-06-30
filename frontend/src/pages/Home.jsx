import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';

/* ─── Particle canvas hero ─── */
const ParticleHero = () => {
  const canvasRef = useRef(null);
  const heroRef   = useRef(null);
  const animRef   = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero   = heroRef.current;
    if (!canvas || !hero) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor(burst, ox, oy) {
        if (burst) {
          this.x  = ox; this.y = oy;
          this.vx = (Math.random() - .5) * 9;
          this.vy = (Math.random() - .5) * 9;
          this.life = 1; this.decay = .018 + Math.random() * .02;
        } else {
          this.x  = Math.random() * W;
          this.y  = Math.random() * H;
          this.vx = (Math.random() - .5) * .35;
          this.vy = (Math.random() - .5) * .35;
          this.life  = Math.random();
          this.decay = .0015 + Math.random() * .002;
        }
        this.r     = burst ? Math.random() * 2.5 + 1 : Math.random() * 1.5 + .4;
        const hue  = 230 + Math.random() * 70;
        const lum  = 55 + Math.random() * 25;
        this.color = `hsl(${hue},75%,${lum}%)`;
        this.burst = burst;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.burst) { this.vy += .12; this.vx *= .97; }
        this.life -= this.decay;
        if (!this.burst) {
          if (this.x < 0 || this.x > W) this.vx *= -1;
          if (this.y < 0 || this.y > H) this.vy *= -1;
        }
      }
      draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle   = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw connection lines between nearby particles
    const drawLines = (ps) => {
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.globalAlpha = (1 - d / 90) * 0.12 * Math.min(ps[i].life, ps[j].life);
            ctx.strokeStyle = '#818cf8';
            ctx.lineWidth   = .8;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }
    };

    for (let i = 0; i < 90; i++) particlesRef.current.push(new Particle(false));

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      drawLines(particlesRef.current.filter(p => !p.burst));
      particlesRef.current = particlesRef.current.filter(p => {
        p.update(); p.draw();
        if (!p.burst && p.life <= 0) { particlesRef.current.push(new Particle(false)); return false; }
        return p.life > 0;
      });
      animRef.current = requestAnimationFrame(loop);
    };
    loop();

    const burst = (e) => {
      const r = hero.getBoundingClientRect();
      for (let i = 0; i < 70; i++)
        particlesRef.current.push(new Particle(true, e.clientX - r.left, e.clientY - r.top));
    };
    hero.addEventListener('click', burst);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      hero.removeEventListener('click', burst);
    };
  }, []);

  return (
    <div ref={heroRef} className="relative cursor-pointer select-none" style={{ minHeight: '92vh' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,.10), transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 80% 70%, rgba(16,185,129,.06), transparent 70%)' }} />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-28 pb-20">

        {/* Eyebrow pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary-500/20 text-primary-400 text-xs font-bold tracking-widest uppercase mb-8"
          style={{ animation: 'fadeUp .6s .1s ease both' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
          AI-Powered Flatmate Matching
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight text-white mb-6"
          style={{ animation: 'fadeUp .7s .25s ease both' }}>
          Find Your<br />
          <span className="gradient-text">Perfect Room</span>
          <br />& Flatmate
        </h1>

        {/* Subtext */}
        <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-10"
          style={{ animation: 'fadeUp .7s .4s ease both' }}>
          Our Gemini-powered compatibility engine scores every match in seconds —
          real-time chat unlocks the moment you connect.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16"
          style={{ animation: 'fadeUp .7s .55s ease both' }}>
          <Link
            to="/register"
            className="btn-primary px-8 py-3.5 text-base"
            style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}
          >
            Get Started Free
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
          <Link
            to="/listings"
            className="btn-secondary px-8 py-3.5 text-base"
          >
            Browse Rooms
          </Link>
        </div>

        {/* Stats row */}
        <StatsRow />

        {/* Hint */}
        <p className="absolute bottom-6 right-6 text-xs text-slate-700 pointer-events-none">
          Click anywhere for burst
        </p>
      </div>
    </div>
  );
};

/* ─── Animated stats counter ─── */
const useCountUp = (target, duration = 1400, start = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let s = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      s = Math.min(s + step, target);
      setVal(Math.round(s));
      if (s >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration, start]);
  return val;
};

const StatsRow = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  const listings = useCountUp(2847, 1400, visible);
  const matches  = useCountUp(94,   1600, visible);
  const chats    = useCountUp(312,  1200, visible);

  const stats = [
    { value: listings.toLocaleString(), label: 'Active Listings',  suffix: '+' },
    { value: matches,                   label: 'Match Accuracy',    suffix: '%' },
    { value: chats.toLocaleString(),    label: 'Chats Today',       suffix: '' },
  ];

  return (
    <div ref={ref} className="flex flex-wrap justify-center gap-8 md:gap-16"
      style={{ animation: 'fadeUp .7s .7s ease both', opacity: 0, animationFillMode: 'forwards' }}>
      {stats.map((s, i) => (
        <div key={i} className="text-center">
          <p className="text-3xl font-black text-white tabular-nums">
            {s.value}<span className="text-primary-400">{s.suffix}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 tracking-wide">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

/* ─── How It Works steps ─── */
const steps = [
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
    color: 'from-primary-500/20 to-primary-500/5',
    accent: 'text-primary-400',
    glow: 'rgba(99,102,241,.25)',
    title: 'Create Your Profile',
    desc: 'Set your budget, preferred location, and move-in date. Owners list rooms with photos, rent, and furnishing details.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    ),
    color: 'from-amber-500/20 to-amber-500/5',
    accent: 'text-amber-400',
    glow: 'rgba(245,158,11,.25)',
    title: 'AI Scores the Match',
    desc: 'Gemini evaluates budget alignment, location proximity, and move-in fit — returning a 0–100 score with a clear explanation.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    ),
    color: 'from-emerald-500/20 to-emerald-500/5',
    accent: 'text-emerald-400',
    glow: 'rgba(16,185,129,.25)',
    title: 'Connect & Chat',
    desc: 'Express interest, get accepted, and unlock real-time WebSocket chat instantly. Email notifications keep both parties informed.',
  },
];

/* ─── Feature grid items ─── */
const features = [
  { title: 'AI Compatibility Score', desc: 'Gemini LLM computes a 0–100 match score with a natural language explanation stored in DB.', color: 'border-primary-500/20 hover:border-primary-500/40' },
  { title: 'Real-Time Chat', desc: 'WebSocket-powered messaging unlocked on accepted interest. All messages persisted in the database.', color: 'border-emerald-500/20 hover:border-emerald-500/40' },
  { title: 'Smart Fallback', desc: "If the LLM is unavailable, a rule-based engine computes a score so the platform never goes dark.", color: 'border-amber-500/20 hover:border-amber-500/40' },
  { title: 'Email Notifications', desc: 'Owners notified on high-score interest (>80). Tenants notified on acceptance or rejection.', color: 'border-red-500/20 hover:border-red-500/40' },
  { title: 'Role-Based Access', desc: 'Three distinct roles: Tenant, Owner, and Admin — each with their own dashboard and permissions.', color: 'border-cyan-500/20 hover:border-cyan-500/40' },
  { title: 'Admin Dashboard', desc: 'Manage users, listings, and view platform-wide analytics from a central admin control panel.', color: 'border-violet-500/20 hover:border-violet-500/40' },
];

/* ─── Main Home component ─── */
const Home = () => (
  <PublicLayout>
    {/* Hero */}
    <ParticleHero />

    {/* How It Works */}
    <section className="max-w-6xl mx-auto px-4 py-24">
      <div className="text-center mb-16" style={{ animation: 'fadeUp .6s ease both' }}>
        <p className="section-label mb-3">The Flow</p>
        <h2 className="text-4xl font-black text-white">How It Works</h2>
        <p className="text-slate-400 mt-3 max-w-lg mx-auto">Three steps from sign-up to moving in — powered by AI.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 stagger-enter">
        {steps.map((step, i) => (
          <div
            key={i}
            className="card p-7 group hover:-translate-y-2 transition-transform duration-300 cursor-default"
            style={{ boxShadow: `0 0 0 0 ${step.glow}` }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${step.glow}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 ${step.accent} group-hover:scale-110 transition-transform duration-300`}>
              {step.icon}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-black tracking-widest ${step.accent}`}>0{i + 1}</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Features grid */}
    <section className="max-w-6xl mx-auto px-4 pb-24">
      <div className="text-center mb-12">
        <p className="section-label mb-3">What You Get</p>
        <h2 className="text-4xl font-black text-white">Platform Features</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-enter">
        {features.map((f, i) => (
          <div
            key={i}
            className={`glass rounded-2xl p-6 border ${f.color} transition-all duration-300 hover:-translate-y-1 cursor-default`}
          >
            <div className="w-2 h-2 rounded-full bg-current mb-4 opacity-60" />
            <h3 className="font-bold text-white mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Owner CTA banner */}
    <section className="max-w-6xl mx-auto px-4 pb-24">
      <div className="relative rounded-3xl overflow-hidden p-12 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.15) 0%, rgba(16,185,129,.08) 100%)' }}>
        <div className="absolute inset-0 border border-white/8 rounded-3xl pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(99,102,241,.12), transparent)' }} />
        <div className="relative z-10">
          <p className="section-label mb-4 text-primary-400">For Property Owners</p>
          <h2 className="text-4xl font-black text-white mb-4">
            List Your Room.<br />
            <span className="gradient-text">Find the Right Tenant.</span>
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Post your room in minutes. Our AI scores every incoming interest request so you spend time only on high-quality matches.
          </p>
          <Link to="/register" className="btn-primary px-10 py-4 text-base">
            List Your Room Free
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Home;
