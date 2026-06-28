'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  useEffect(() => {
    // Smooth scroll and animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.feat-card, .benefit-item').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'all 0.5s ease';
      observer.observe(el);
    });

    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        nav.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(0,0,0,.08)' : 'none';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleSmoothScroll = (e, id) => {
    e.preventDefault();
    const target = document.querySelector(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <style>{`
        /* Scoped styles for Landing Page */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 6%; height: 68px;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          transition: box-shadow 0.2s;
        }
        .nav-logo { display: flex; align-items: center; gap: .5rem; font-size: 1.2rem; font-weight: 800; color: var(--dark); letter-spacing: -0.5px; text-decoration: none; }
        .nav-logo .logo-icon { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; }
        .nav-logo .logo-icon svg { width: 34px; height: 34px; }
        .nav-links { display: flex; align-items: center; gap: 2rem; }
        .nav-links a { text-decoration: none; color: var(--gray); font-weight: 500; font-size: 0.95rem; transition: color .2s; }
        .nav-links a:hover { color: var(--primary); }
        .nav-actions { display: flex; align-items: center; gap: 1rem; }
        
        .btn { display: inline-flex; align-items: center; gap: .5rem; padding: .55rem 1.4rem; border-radius: 8px; font-weight: 600; font-size: .9rem; text-decoration: none; transition: all .2s; cursor: pointer; border: none; }
        .btn-ghost { color: var(--dark); background: transparent; border: 1.5px solid var(--border); }
        .btn-ghost:hover { border-color: var(--primary); color: var(--primary); }
        .btn-primary { background: var(--primary); color: #fff; box-shadow: 0 2px 12px rgba(79,110,245,.35); }
        .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(79,110,245,.45); }
        .btn-lg { padding: .8rem 2rem; font-size: 1rem; border-radius: 10px; }
        .btn-outline { background: transparent; border: 2px solid rgba(255,255,255,.6); color: #fff; }
        .btn-outline:hover { background: rgba(255,255,255,.15); }

        .hero {
          padding: 140px 6% 80px;
          text-align: center;
          background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #EEF2FF 100%);
          position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 800px; border-radius: 50%;
          background: radial-gradient(circle, rgba(79,110,245,.10) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: .5rem;
          background: var(--primary-light); color: var(--primary);
          padding: .3rem 1rem; border-radius: 999px; font-size: .8rem; font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .hero h1 {
          font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 800; line-height: 1.15;
          letter-spacing: -1.5px; color: var(--dark); max-width: 780px; margin: 0 auto 1.2rem;
        }
        .hero h1 span { color: var(--primary); }
        .hero p { font-size: 1.15rem; color: var(--gray); max-width: 520px; margin: 0 auto 2.4rem; }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .hero-stats { display: flex; justify-content: center; gap: 3rem; margin-top: 3.5rem; flex-wrap: wrap; }
        .hero-stat { text-align: center; }
        .hero-stat .num { font-size: 1.8rem; font-weight: 800; color: var(--primary); }
        .hero-stat .label { font-size: .8rem; color: var(--gray); font-weight: 500; margin-top: .15rem; }

        .trusted {
          padding: 2.5rem 6%;
          background: #fff;
          border-bottom: 1px solid var(--border);
          text-align: center;
        }
        .trusted p { font-size: .8rem; color: var(--gray); text-transform: uppercase; letter-spacing: .1em; font-weight: 600; margin-bottom: 1.5rem; }
        .trusted-logos { display: flex; align-items: center; justify-content: center; gap: 3rem; flex-wrap: wrap; }
        .trusted-logos span { font-size: 1.05rem; font-weight: 700; color: #94a3b8; letter-spacing: -.3px; }

        .features { padding: 90px 6%; background: var(--white); }
        .section-tag { display: inline-block; background: var(--primary-light); color: var(--primary); font-size: .8rem; font-weight: 600; padding: .3rem .9rem; border-radius: 999px; margin-bottom: 1rem; }
        .section-title { font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 800; letter-spacing: -1px; color: var(--dark); margin-bottom: .7rem; }
        .section-sub { color: var(--gray); font-size: 1rem; max-width: 480px; }
        .features-header { text-align: center; margin-bottom: 3.5rem; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 1.5rem; }
        .feat-card {
          background: var(--light); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 2rem;
          transition: all .3s;
        }
        .feat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--primary-light); }
        .feat-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: var(--primary-light); display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.2rem; color: var(--primary);
        }
        .feat-icon svg { width: 24px; height: 24px; stroke: currentColor; }
        .feat-card h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: .5rem; color: var(--dark); }
        .feat-card p { font-size: .9rem; color: var(--gray); line-height: 1.65; }

        .preview-section { padding: 90px 6%; background: linear-gradient(145deg, #4F6EF5 0%, #6B5CF5 45%, #7C3AED 100%); }
        .preview-header { text-align: center; margin-bottom: 3rem; }
        .preview-header .section-title { color: #fff; }
        .preview-header .section-sub { color: rgba(255,255,255,.75); margin: 0 auto; }
        .dashboard-mock {
          max-width: 900px; margin: 0 auto;
          background: #fff; border-radius: 18px;
          overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.35);
        }
        .mock-topbar {
          background: #F9FAFB; border-bottom: 1px solid #E5E7EB; padding: .6rem 1.2rem;
          display: flex; align-items: center; gap: .5rem;
        }
        .mock-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mock-url { flex: 1; background: #fff; border: 1px solid #E5E7EB; border-radius: 5px; padding: .25rem .65rem; color: #9CA3AF; font-size: .7rem; margin: 0 .75rem; }
        .mock-body { display: flex; height: 360px; }
        .mock-sidebar { width: 170px; background: #fff; border-right: 1px solid #E5E7EB; padding: .9rem; flex-shrink: 0; }
        .mock-sidebar-logo { display: flex; align-items: center; gap: .4rem; font-weight: 800; font-size: .9rem; color: #111827; margin-bottom: 1.2rem; padding-bottom: .8rem; border-bottom: 1px solid #E5E7EB; }
        .mock-sidebar-logo svg { flex-shrink: 0; }
        .mock-nav-item { padding: .4rem .65rem; border-radius: 7px; color: #6B7280; font-size: .72rem; font-weight: 500; margin-bottom: .2rem; cursor: pointer; display: flex; align-items: center; gap: .4rem; }
        .mock-nav-item.active { background: #4F6EF5; color: #fff; }
        .mock-content { flex: 1; padding: 1.2rem; background: #F7F8FC; overflow: hidden; }
        .mock-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: .6rem; margin-bottom: 1rem; }
        .mock-stat-card { background: #fff; border-radius: 9px; padding: .7rem .8rem; border: 1px solid #E5E7EB; }
        .mock-stat-icon { width: 26px; height: 26px; border-radius: 7px; margin-bottom: .4rem; display: flex; align-items: center; justify-content: center; }
        .mock-stat-icon svg { width: 13px; height: 13px; stroke: currentColor; }
        .mock-stat-icon.blue { background: #DBEAFE; color: #2563EB; }
        .mock-stat-icon.green { background: #DCFCE7; color: #16A34A; }
        .mock-stat-icon.purple { background: #EEF2FF; color: #4F6EF5; }
        .mock-stat-icon.orange { background: #FEF3C7; color: #D97706; }
        .mock-stat-num { font-size: 1.1rem; font-weight: 800; color: #111827; }
        .mock-stat-label { font-size: .58rem; color: #9CA3AF; font-weight: 500; margin-top: .1rem; }
        .mock-charts { display: grid; grid-template-columns: 1.6fr 1fr; gap: .6rem; }
        .mock-chart-card { background: #fff; border-radius: 9px; padding: .75rem; border: 1px solid #E5E7EB; }
        .mock-chart-title { font-size: .68rem; font-weight: 700; color: #111827; margin-bottom: .5rem; }
        .mock-bars { display: flex; align-items: flex-end; gap: 3px; height: 65px; }
        .mock-bar { flex: 1; background: #4F6EF5; border-radius: 3px 3px 0 0; opacity: .85; }
        .mock-list-item { font-size: .6rem; color: #6B7280; padding: .2rem 0; border-bottom: 1px solid #F3F4F6; display: flex; justify-content: space-between; }
        .mock-list-item span:last-child { color: #4F6EF5; font-weight: 600; }

        .benefits { padding: 90px 6%; background: var(--white); }
        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; margin-top: 3rem; }
        .benefit-item { text-align: center; padding: 2rem; }
        .benefit-icon { width: 56px; height: 56px; border-radius: 14px; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.1rem; }
        .benefit-icon svg { width: 26px; height: 26px; stroke: currentColor; }
        .benefit-item h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: .5rem; }
        .benefit-item p { color: var(--gray); font-size: .9rem; }

        .cta {
          padding: 90px 6%; text-align: center;
          background: linear-gradient(135deg, #4F6EF5 0%, #7C3AED 100%);
        }
        .cta h2 { font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 800; color: #fff; letter-spacing: -1px; margin-bottom: .8rem; }
        .cta p { color: rgba(255,255,255,.8); font-size: 1.05rem; margin-bottom: 2rem; }
        .cta-actions { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }

        footer {
          background: var(--dark); color: #94a3b8;
          padding: 3rem 6% 2rem;
        }
        .footer-top { display: grid; grid-template-columns: 1.5fr repeat(4, 1fr); gap: 2rem; margin-bottom: 2rem; }
        .footer-brand .logo { display: flex; align-items: center; gap: .5rem; font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: .7rem; }
        .footer-brand .logo .logo-icon { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .footer-brand .logo .logo-icon svg { width: 30px; height: 30px; }
        .footer-brand p { font-size: .85rem; line-height: 1.7; }
        .footer-col h4 { color: #fff; font-size: .85rem; font-weight: 700; margin-bottom: 1rem; }
        .footer-col a { display: block; color: #94a3b8; text-decoration: none; font-size: .82rem; margin-bottom: .5rem; transition: color .2s; }
        .footer-col a:hover { color: var(--primary); }
        .footer-bottom { border-top: 1px solid #334155; padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .footer-bottom p { font-size: .82rem; }
        .social-links { display: flex; gap: 1rem; }
        .social-links a { color: #94a3b8; text-decoration: none; font-size: .82rem; font-weight: 500; transition: color .2s; }
        .social-links a:hover { color: var(--primary); }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          .mock-stats { grid-template-columns: repeat(2, 1fr); }
          .mock-charts { grid-template-columns: 1fr; }
          .mock-sidebar { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 100 100" fill="none" stroke="#4F6EF5" strokeWidth="7.5" strokeLinecap="round">
              <path d="M78 20 A41 41 0 1 0 78 80" />
              <path d="M67 31 A26 26 0 1 0 67 69" />
              <line x1="44" y1="38" x2="84" y2="38" />
              <line x1="44" y1="50" x2="78" y2="50" />
              <line x1="44" y1="62" x2="71" y2="62" />
              <circle cx="78" cy="20" r="5" fill="#4F6EF5" stroke="none" />
              <circle cx="78" cy="80" r="5" fill="#4F6EF5" stroke="none" />
            </svg>
          </div>
          Finprint
        </Link>
        <div className="nav-links">
          <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>Features</a>
          <a href="#benefits" onClick={(e) => handleSmoothScroll(e, '#benefits')}>Benefits</a>
          <a href="#preview" onClick={(e) => handleSmoothScroll(e, '#preview')}>Dashboard</a>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/login" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">✦ Modern Workforce Management</div>
        <h1>Clarity for your <span>workforce</span></h1>
        <p>Track performance, attendance, and growth — all in one place. Built for teams that move fast.</p>
        <div className="hero-actions">
          <Link href="/login" className="btn btn-primary btn-lg">Get Started Free</Link>
          <a href="#preview" className="btn btn-ghost btn-lg" onClick={(e) => handleSmoothScroll(e, '#preview')}>View Dashboard</a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="num">500+</div><div className="label">Companies</div></div>
          <div className="hero-stat"><div className="num">10k+</div><div className="label">Employees</div></div>
          <div className="hero-stat"><div className="num">99.9%</div><div className="label">Uptime</div></div>
          <div className="hero-stat"><div className="num">4.8★</div><div className="label">Rating</div></div>
        </div>
      </section>

      {/* TRUSTED */}
      <div className="trusted">
        <p>Trusted by leading companies</p>
        <div className="trusted-logos">
          <span>Acme Corp</span>
          <span>TechFlow</span>
          <span>Innovate</span>
          <span>BuildCo</span>
          <span>DataLabs</span>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="features-header">
          <div className="section-tag">Everything You Need</div>
          <h2 className="section-title">Powerful features to manage<br />your entire workforce</h2>
          <p className="section-sub">All your HR tools in one streamlined, modern platform.</p>
        </div>
        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="7" r="4" /><path d="M2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M17 11a3 3 0 1 0 0-6" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              </svg>
            </div>
            <h3>Employee Management</h3>
            <p>Centralize employee data, roles, and departments. Onboard new team members effortlessly with streamlined workflows.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3>Performance Tracking</h3>
            <p>Set goals, track progress, and conduct reviews. Get insights into top performers and areas for improvement.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
              </svg>
            </div>
            <h3>Attendance Monitoring</h3>
            <p>Track clock-ins, time off, and attendance patterns. Automate timesheets and reduce manual data entry.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
              </svg>
            </div>
            <h3>Analytics Dashboard</h3>
            <p>Real-time insights and reports. Visualize trends, identify patterns, and make data-driven decisions.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3>Payroll Management</h3>
            <p>Automate payroll calculations, manage bonuses and deductions, and generate detailed payslips instantly.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <h3>Training & Development</h3>
            <p>Enroll teams in training programs, track course completion, and issue certificates automatically.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3>Leave Management</h3>
            <p>Streamline leave requests and approvals. Track balances across annual, sick, and casual leave types.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3>Self-Assessment</h3>
            <p>Enable employees to rate their own performance and submit quarterly assessments for HR review.</p>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="preview-section" id="preview">
        <div className="preview-header">
          <div className="section-tag" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>Live Preview</div>
          <h2 className="section-title">A dashboard that works for you</h2>
          <p className="section-sub">Clean, intuitive, and powerful — designed for every HR professional.</p>
        </div>
        <div className="dashboard-mock">
          <div className="mock-topbar">
            <div style={{ display: 'flex', gap: '.3rem' }}>
              <div className="mock-dot" style={{ background: '#FF5F57' }}></div>
              <div className="mock-dot" style={{ background: '#FEBC2E' }}></div>
              <div className="mock-dot" style={{ background: '#28C840' }}></div>
            </div>
            <div className="mock-url">finprint.app/dashboard</div>
          </div>
          <div className="mock-body">
            <div className="mock-sidebar">
              <div className="mock-sidebar-logo">
                <svg viewBox="0 0 100 100" fill="none" stroke="#4F6EF5" strokeWidth="9" strokeLinecap="round" style={{ width: 20, height: 20, flexShrink: 0 }}>
                  <path d="M78 20 A41 41 0 1 0 78 80" />
                  <path d="M67 31 A26 26 0 1 0 67 69" />
                  <line x1="44" y1="38" x2="84" y2="38" />
                  <line x1="44" y1="50" x2="78" y2="50" />
                  <line x1="44" y1="62" x2="71" y2="62" />
                  <circle cx="78" cy="20" r="5" fill="#4F6EF5" stroke="none" />
                  <circle cx="78" cy="80" r="5" fill="#4F6EF5" stroke="none" />
                </svg>
                Finprint
              </div>
              <div className="mock-nav-item active">Dashboard</div>
              <div className="mock-nav-item">Employees</div>
              <div className="mock-nav-item">Attendance</div>
              <div className="mock-nav-item">Departments</div>
              <div className="mock-nav-item">Leave</div>
              <div className="mock-nav-item">Analytics</div>
              <div className="mock-nav-item">Payroll</div>
              <div className="mock-nav-item">Training</div>
            </div>
            <div className="mock-content">
              <div className="mock-stats">
                <div className="mock-stat-card">
                  <div className="mock-stat-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" />
                    </svg>
                  </div>
                  <div className="mock-stat-num">8</div>
                  <div className="mock-stat-label">Contract Ends</div>
                </div>
                <div className="mock-stat-card">
                  <div className="mock-stat-icon green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                  <div className="mock-stat-num">92%</div>
                  <div className="mock-stat-label">Attendance Rate</div>
                </div>
                <div className="mock-stat-card">
                  <div className="mock-stat-icon purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
                    </svg>
                  </div>
                  <div className="mock-stat-num">217</div>
                  <div className="mock-stat-label">Attendance</div>
                </div>
                <div className="mock-stat-card">
                  <div className="mock-stat-icon orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="17" y1="8" x2="23" y2="14" /><line x1="23" y1="8" x2="17" y2="14" />
                    </svg>
                  </div>
                  <div className="mock-stat-num">18</div>
                  <div className="mock-stat-label">Absence</div>
                </div>
              </div>
              <div className="mock-charts">
                <div className="mock-chart-card">
                  <div className="mock-chart-title">Employees by Department</div>
                  <div className="mock-bars">
                    <div className="mock-bar" style={{ height: '55%' }}></div>
                    <div className="mock-bar" style={{ height: '70%' }}></div>
                    <div className="mock-bar" style={{ height: '50%' }}></div>
                    <div className="mock-bar" style={{ height: '85%' }}></div>
                    <div className="mock-bar" style={{ height: '65%' }}></div>
                    <div className="mock-bar" style={{ height: '90%' }}></div>
                    <div className="mock-bar" style={{ height: '75%' }}></div>
                  </div>
                </div>
                <div className="mock-chart-card">
                  <div className="mock-chart-title">Top Performers</div>
                  <div className="mock-list-item"><span>Mahmoud Ali</span><span>4.9★</span></div>
                  <div className="mock-list-item"><span>Mona Fathy</span><span>4.8★</span></div>
                  <div className="mock-list-item"><span>Ahmed Hany</span><span>4.7★</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits" id="benefits">
        <div className="features-header">
          <div className="section-tag">Why Finprint</div>
          <h2 className="section-title">Built for how modern<br />HR teams work</h2>
        </div>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Save Time</h3>
            <p>Automate repetitive HR tasks and spend more time on what matters — building your team.</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <h3>Better Decisions</h3>
            <p>Make informed choices with real-time data and analytics at your fingertips.</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3>Team Visibility</h3>
            <p>Get complete visibility into your workforce with comprehensive dashboards and reports.</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3>Secure & Reliable</h3>
            <p>Enterprise-grade security with 99.9% uptime. Your data is always safe and accessible.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start managing your team smarter today</h2>
        <p>Join hundreds of companies already using Finprint.</p>
        <div className="cta-actions">
          <Link href="/login" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: '700' }}>Get Started Free</Link>
          <Link href="/login" className="btn btn-outline btn-lg">Sign In</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 100 100" fill="none" stroke="#4F6EF5" strokeWidth="7.5" strokeLinecap="round">
                  <path d="M78 20 A41 41 0 1 0 78 80" />
                  <path d="M67 31 A26 26 0 1 0 67 69" />
                  <line x1="44" y1="38" x2="84" y2="38" />
                  <line x1="44" y1="50" x2="78" y2="50" />
                  <line x1="44" y1="62" x2="71" y2="62" />
                  <circle cx="78" cy="20" r="5" fill="#4F6EF5" stroke="none" />
                  <circle cx="78" cy="80" r="5" fill="#4F6EF5" stroke="none" />
                </svg>
              </div>
              Finprint
            </div>
            <p>Modern workforce management for growing teams.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Security</a>
            <a href="#">Updates</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">License</a>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Finprint. All rights reserved.</p>
          <div className="social-links">
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
