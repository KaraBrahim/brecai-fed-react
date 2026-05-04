<script setup>
import AppNavbar from '@/components/AppNavbar.vue';
import Button from 'primevue/button';
</script>

<template>
  <div class="page-root">

    <AppNavbar />

    <!-- Hero Section -->
    <section class="hero-section">

      <!-- Background blobs -->
      <div class="hero-blob hero-blob-1"></div>
      <div class="hero-blob hero-blob-2"></div>
      <div class="hero-blob hero-blob-3"></div>

      <div class="container">

        <!-- Badge -->
        <div class="badge-wrapper">
          <div class="badge">
            <span class="badge-dot"></span>
            v2.0 is Live
          </div>
        </div>

        <!-- Main headline -->
        <h1 class="hero-headline">
          The Operating System for<br />
          <span class="hero-headline-gradient">Modern Oncology.</span>
        </h1>

        <!-- Subheadline -->
        <p class="hero-subheadline">
          Ditch the spreadsheets. Manage chemotherapy protocols, patient vitals,
          and billing in one unified, HIPAA-compliant dashboard.
        </p>

        <!-- Stats -->
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-number">12k+</span>
            <span class="hero-stat-label">Patients Managed</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-number">98%</span>
            <span class="hero-stat-label">HIPAA Compliance Score</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-number">4.9★</span>
            <span class="hero-stat-label">Avg. Clinic Rating</span>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="hero-ctas">
          <router-link to="/register">
            <button class="btn-primary">
              Start Free Trial
              <span class="btn-arrow">→</span>
            </button>
          </router-link>
          <router-link to="/demo">
            <button class="btn-secondary">
              <span class="btn-play">▶</span>
              Watch Demo
            </button>
          </router-link>
        </div>

        <!-- Dashboard mockup -->
        <div class="mockup-wrapper">
          <div class="mockup-shell">
            <div class="mockup-chrome">
              <div class="mockup-dot red"></div>
              <div class="mockup-dot yellow"></div>
              <div class="mockup-dot green"></div>
              <div class="mockup-url-bar">app.oncosaas.com/dashboard</div>
            </div>
            <div class="mockup-body">
              <!-- Fake Dashboard UI -->
              <div class="fake-sidebar">
                <div class="fake-logo-block"></div>
                <div class="fake-nav-item active"></div>
                <div class="fake-nav-item"></div>
                <div class="fake-nav-item"></div>
                <div class="fake-nav-item"></div>
                <div class="fake-nav-item"></div>
              </div>
              <div class="fake-main">
                <div class="fake-topbar">
                  <div class="fake-page-title"></div>
                  <div class="fake-topbar-actions">
                    <div class="fake-avatar"></div>
                  </div>
                </div>
                <div class="fake-stats-row">
                  <div class="fake-stat-card">
                    <div class="fake-stat-label"></div>
                    <div class="fake-stat-val teal"></div>
                    <div class="fake-stat-trend up"></div>
                  </div>
                  <div class="fake-stat-card">
                    <div class="fake-stat-label"></div>
                    <div class="fake-stat-val blue"></div>
                    <div class="fake-stat-trend up"></div>
                  </div>
                  <div class="fake-stat-card">
                    <div class="fake-stat-label"></div>
                    <div class="fake-stat-val purple"></div>
                    <div class="fake-stat-trend down"></div>
                  </div>
                </div>
                <div class="fake-content-row">
                  <div class="fake-chart-card">
                    <div class="fake-chart-title"></div>
                    <div class="fake-chart-bars">
                      <div class="fake-bar" style="height: 60%"></div>
                      <div class="fake-bar" style="height: 80%"></div>
                      <div class="fake-bar" style="height: 45%"></div>
                      <div class="fake-bar teal-bar" style="height: 90%"></div>
                      <div class="fake-bar" style="height: 70%"></div>
                      <div class="fake-bar" style="height: 55%"></div>
                      <div class="fake-bar teal-bar" style="height: 85%"></div>
                    </div>
                  </div>
                  <div class="fake-list-card">
                    <div class="fake-list-title"></div>
                    <div class="fake-list-row"><div class="fake-avatar-sm"></div><div class="fake-row-text"><div class="fake-row-name"></div><div class="fake-row-sub"></div></div><div class="fake-badge-pill teal"></div></div>
                    <div class="fake-list-row"><div class="fake-avatar-sm purple"></div><div class="fake-row-text"><div class="fake-row-name"></div><div class="fake-row-sub"></div></div><div class="fake-badge-pill yellow"></div></div>
                    <div class="fake-list-row"><div class="fake-avatar-sm blue"></div><div class="fake-row-text"><div class="fake-row-name"></div><div class="fake-row-sub"></div></div><div class="fake-badge-pill teal"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Floating badges -->
          <div class="floating-badge badge-left">
            <div class="floating-badge-icon">🔒</div>
            <div>
              <div class="floating-badge-title">HIPAA Certified</div>
              <div class="floating-badge-sub">End-to-end encrypted</div>
            </div>
          </div>
          <div class="floating-badge badge-right">
            <div class="floating-badge-icon">⚡</div>
            <div>
              <div class="floating-badge-title">Real-time sync</div>
              <div class="floating-badge-sub">Across all devices</div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Logos / trust section -->
    <section class="trust-section">
      <div class="container">
        <p class="trust-label">Trusted by leading oncology centers</p>
        <div class="trust-logos">
          <span class="trust-logo">Mayo Clinic Network</span>
          <span class="trust-logo">Johns Hopkins Oncology</span>
          <span class="trust-logo">MD Anderson</span>
          <span class="trust-logo">Memorial Sloan Kettering</span>
          <span class="trust-logo">Cleveland Clinic</span>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="container">

        <div class="section-header">
          <div class="section-chip">Features</div>
          <h2 class="section-title">Workflow, Simplified.</h2>
          <p class="section-subtitle">
            Everything is designed to save you clicks, so you can save lives.
          </p>
        </div>

        <div class="features-grid">

          <div class="feature-card feature-card-large">
            <div class="feature-icon-wrap blue-icon">
              <i class="pi pi-chart-line"></i>
            </div>
            <h3 class="feature-title">Vitals Tracking</h3>
            <p class="feature-desc">
              Visualize patient recovery trends instantly. Track toxicity levels and white blood cell counts with zero friction. Automated alerts notify your team when values fall outside safe thresholds.
            </p>
            <div class="feature-img-placeholder chart-placeholder">
              <div class="mini-chart">
                <div class="mini-bar" style="height:40%"></div>
                <div class="mini-bar" style="height:65%"></div>
                <div class="mini-bar teal-mini" style="height:55%"></div>
                <div class="mini-bar" style="height:80%"></div>
                <div class="mini-bar teal-mini" style="height:70%"></div>
                <div class="mini-bar" style="height:90%"></div>
              </div>
            </div>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrap teal-icon">
              <i class="pi pi-calendar"></i>
            </div>
            <h3 class="feature-title">Smart Scheduling</h3>
            <p class="feature-desc">
              Our engine automatically calculates chemotherapy cycles, ensuring protocols are followed to the day.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrap purple-icon">
              <i class="pi pi-lock"></i>
            </div>
            <h3 class="feature-title">Bank-Grade Security</h3>
            <p class="feature-desc">
              Fully HIPAA compliant. End-to-end encryption for all patient data, backups, and communications.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-wrap orange-icon">
              <i class="pi pi-file"></i>
            </div>
            <h3 class="feature-title">Smart Billing</h3>
            <p class="feature-desc">
              Automated insurance coding and billing. Reduce claim rejections by up to 60% with AI-assisted coding.
            </p>
          </div>

          <div class="feature-card feature-card-dark">
            <div class="feature-icon-wrap white-icon">
              <i class="pi pi-users"></i>
            </div>
            <h3 class="feature-title feature-title-light">Team Collaboration</h3>
            <p class="feature-desc feature-desc-light">
              Real-time collaboration tools for oncologists, nurses, and administrative staff. One source of truth for every patient.
            </p>
          </div>

        </div>

      </div>
    </section>

    <!-- Testimonial Section -->
    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <div class="section-chip">Testimonials</div>
          <h2 class="section-title">Loved by Oncologists</h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"OncoSaaS cut our administrative overhead by 40%. Our team spends more time with patients and less time wrestling with spreadsheets."</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar" style="background: #0ea5e9;">DK</div>
              <div>
                <div class="testimonial-name">Dr. David Kim</div>
                <div class="testimonial-role">Chief of Oncology, Stanford Medical</div>
              </div>
            </div>
          </div>
          <div class="testimonial-card testimonial-featured">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"The chemo protocol management is a game-changer. Dosing errors are down to zero since we switched, and the audit trail gives us total confidence."</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar" style="background: #14b8a6;">SR</div>
              <div>
                <div class="testimonial-name">Dr. Sarah Reeves</div>
                <div class="testimonial-role">Oncology Director, Cleveland Clinic</div>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"Onboarding took less than a day. The interface is intuitive, the support team is incredible, and the HIPAA compliance tools are unmatched."</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar" style="background: #8b5cf6;">ML</div>
              <div>
                <div class="testimonial-name">Dr. Maria Lopez</div>
                <div class="testimonial-role">Medical Director, MD Anderson</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="pricing-section">
      <div class="container">

        <div class="section-header">
          <div class="section-chip">Pricing</div>
          <h2 class="section-title">Simple Pricing</h2>
          <p class="section-subtitle">Start for free, upgrade as you grow.</p>
        </div>

        <div class="pricing-grid">

          <!-- Starter Plan -->
          <div class="pricing-card">
            <div class="plan-name">Starter</div>
            <div class="plan-price">
              <span class="plan-price-number">$0</span>
            </div>
            <p class="plan-tagline">For solo doctors.</p>

            <router-link to="/register" class="plan-cta-link">
              <button class="btn-plan-outline">Start Free</button>
            </router-link>

            <ul class="plan-features">
              <li><span class="check">✓</span> Up to 50 patients</li>
              <li><span class="check">✓</span> Basic patient records</li>
              <li><span class="check">✓</span> Email support</li>
              <li><span class="check muted">✓</span> <span class="muted-text">Protocol management</span></li>
              <li><span class="check muted">✓</span> <span class="muted-text">Advanced analytics</span></li>
            </ul>
          </div>

          <!-- Pro Plan (Featured) -->
          <div class="pricing-card pricing-card-featured">
            <div class="plan-badge">Best Value</div>
            <div class="plan-name plan-name-light">Clinic Pro</div>
            <div class="plan-price">
              <span class="plan-price-number plan-price-light">$49</span>
              <span class="plan-price-period">/mo</span>
            </div>
            <p class="plan-tagline plan-tagline-light">For growing teams.</p>

            <router-link to="/register" class="plan-cta-link">
              <button class="btn-plan-teal">Get Started</button>
            </router-link>

            <ul class="plan-features plan-features-light">
              <li><span class="check check-teal">✓</span> Unlimited patients</li>
              <li><span class="check check-teal">✓</span> Chemo protocol management</li>
              <li><span class="check check-teal">✓</span> Priority support</li>
              <li><span class="check check-teal">✓</span> Advanced analytics</li>
              <li><span class="check check-teal">✓</span> Smart billing</li>
            </ul>
          </div>

          <!-- Enterprise Plan -->
          <div class="pricing-card">
            <div class="plan-name">Enterprise</div>
            <div class="plan-price">
              <span class="plan-price-number" style="font-size: 2.5rem;">Custom</span>
            </div>
            <p class="plan-tagline">For hospital networks.</p>

            <router-link to="/contact" class="plan-cta-link">
              <button class="btn-plan-outline">Contact Sales</button>
            </router-link>

            <ul class="plan-features">
              <li><span class="check">✓</span> Unlimited staff accounts</li>
              <li><span class="check">✓</span> Full API access</li>
              <li><span class="check">✓</span> On-premise deployment</li>
              <li><span class="check">✓</span> Dedicated account manager</li>
              <li><span class="check">✓</span> Custom integrations</li>
            </ul>
          </div>

        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-inner">
          <div class="cta-blob"></div>
          <h2 class="cta-title">Ready to transform your oncology practice?</h2>
          <p class="cta-subtitle">Join 500+ oncology clinics already using OncoSaaS. No credit card required.</p>
          <div class="cta-btns">
            <router-link to="/register">
              <button class="btn-primary btn-large">Start Free Trial</button>
            </router-link>
            <router-link to="/contact">
              <button class="btn-ghost-light">Talk to Sales</button>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="footer-logo">
              <div class="logo-icon">
                <i class="pi pi-heart-fill"></i>
              </div>
              <span class="logo-text">Onco<span class="logo-teal">SaaS</span></span>
            </div>
            <p class="footer-tagline">The operating system for modern oncology. Empowering clinicians to focus on what matters most.</p>
            <div class="footer-socials">
              <a href="#" class="social-link"><i class="pi pi-twitter"></i></a>
              <a href="#" class="social-link"><i class="pi pi-linkedin"></i></a>
              <a href="#" class="social-link"><i class="pi pi-github"></i></a>
            </div>
          </div>
          <div class="footer-links-group">
            <div class="footer-links-col">
              <div class="footer-col-title">Product</div>
              <a href="#" class="footer-link">Features</a>
              <a href="#" class="footer-link">Pricing</a>
              <a href="#" class="footer-link">Security</a>
              <a href="#" class="footer-link">Changelog</a>
            </div>
            <div class="footer-links-col">
              <div class="footer-col-title">Company</div>
              <a href="#" class="footer-link">About</a>
              <a href="#" class="footer-link">Blog</a>
              <a href="#" class="footer-link">Careers</a>
              <a href="#" class="footer-link">Contact</a>
            </div>
            <div class="footer-links-col">
              <div class="footer-col-title">Legal</div>
              <a href="#" class="footer-link">Privacy</a>
              <a href="#" class="footer-link">Terms</a>
              <a href="#" class="footer-link">HIPAA</a>
              <a href="#" class="footer-link">BAA</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copy">© 2026 OncoSaaS Inc. All rights reserved.</p>
          <div class="footer-badges">
            <span class="footer-badge">🔒 HIPAA</span>
            <span class="footer-badge">🛡️ SOC2</span>
            <span class="footer-badge">✅ HITECH</span>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<style scoped>
/* ============================================================
   RESET & ROOT — override base.css conflicts
   ============================================================ */
.page-root {
  min-height: 100vh;
  width: 100%;
  background-color: #ffffff;
  color: #0f172a;
  font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
  overflow-x: hidden;
  /* Counteract dark mode from base.css */
  color-scheme: light;
}

/* Force light mode regardless of system preference */
.page-root * {
  box-sizing: border-box;
}

/* ============================================================
   CONTAINER — centered, padded, max-width
   ============================================================ */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ============================================================
   BUTTONS
   ============================================================ */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #0f172a;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 32px;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 24px rgba(15,23,42,0.25);
}
.btn-primary:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(15,23,42,0.3);
}
.btn-arrow { font-size: 1.1rem; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  color: #334155;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 28px;
  border-radius: 100px;
  border: 1.5px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.btn-secondary:hover { background: #f8fafc; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.btn-play { font-size: 0.75rem; }

.btn-large { padding: 16px 40px; font-size: 1.1rem; }

.btn-ghost-light {
  display: inline-flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  padding: 16px 32px;
  border-radius: 100px;
  border: 1.5px solid rgba(255,255,255,0.3);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}
.btn-ghost-light:hover { background: rgba(255,255,255,0.25); }

/* Plan buttons */
.btn-plan-outline {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #cbd5e1;
  background: transparent;
  color: #334155;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-plan-outline:hover { background: #f8fafc; }

.btn-plan-teal {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #14b8a6;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-plan-teal:hover { background: #0d9488; }

/* ============================================================
   HERO
   ============================================================ */
.hero-section {
  position: relative;
  padding: 140px 0 80px;
  overflow: hidden;
  background: #ffffff;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.hero-blob-1 {
  width: 700px; height: 700px;
  background: rgba(20, 184, 166, 0.12);
  top: -200px; left: 50%;
  transform: translateX(-50%);
}
.hero-blob-2 {
  width: 400px; height: 400px;
  background: rgba(59, 130, 246, 0.08);
  top: 100px; right: -100px;
}
.hero-blob-3 {
  width: 300px; height: 300px;
  background: rgba(139, 92, 246, 0.06);
  bottom: 0; left: -80px;
}

.hero-section .container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.badge-wrapper {
  margin-bottom: 28px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 100px;
  background: #f0fdf9;
  border: 1px solid #99f6e4;
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #14b8a6;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

.hero-headline {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
  max-width: 800px;
}

.hero-headline-gradient {
  background: linear-gradient(135deg, #0d9488 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subheadline {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: #64748b;
  max-width: 600px;
  line-height: 1.7;
  margin-bottom: 32px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.hero-stat-number {
  font-size: 1.5rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.hero-stat-label {
  font-size: 0.72rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.hero-stat-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

.hero-ctas {
  display: flex;
  gap: 16px;
  margin-bottom: 64px;
  flex-wrap: wrap;
  justify-content: center;
}

/* ---- Mockup ---- */
.mockup-wrapper {
  position: relative;
  width: 100%;
  max-width: 900px;
}

.mockup-shell {
  border-radius: 16px;
  background: #0f172a;
  padding: 4px;
  box-shadow:
      0 40px 80px rgba(15,23,42,0.3),
      0 0 0 1px rgba(255,255,255,0.05);
}

.mockup-chrome {
  background: #1e293b;
  border-radius: 12px 12px 0 0;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}

.mockup-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.mockup-dot.red { background: #ef4444; }
.mockup-dot.yellow { background: #f59e0b; }
.mockup-dot.green { background: #22c55e; }

.mockup-url-bar {
  flex: 1;
  margin: 0 16px;
  background: #0f172a;
  border-radius: 6px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #64748b;
  font-family: monospace;
}

.mockup-body {
  background: #f1f5f9;
  border-radius: 0 0 12px 12px;
  display: flex;
  height: 340px;
  overflow: hidden;
}

/* Fake sidebar */
.fake-sidebar {
  width: 56px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  flex-shrink: 0;
}

.fake-logo-block {
  width: 32px;
  height: 32px;
  background: #14b8a6;
  border-radius: 8px;
  margin-bottom: 8px;
}

.fake-nav-item {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
}

.fake-nav-item.active {
  background: rgba(20,184,166,0.25);
  position: relative;
}

.fake-nav-item.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: #14b8a6;
  border-radius: 0 2px 2px 0;
}

/* Fake main */
.fake-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fake-topbar {
  background: #fff;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.fake-page-title {
  width: 140px;
  height: 14px;
  background: #e2e8f0;
  border-radius: 4px;
}

.fake-topbar-actions { display: flex; gap: 8px; align-items: center; }

.fake-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #2563eb);
}

.fake-stats-row {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  flex-shrink: 0;
}

.fake-stat-card {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid #e2e8f0;
}

.fake-stat-label {
  width: 60%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 3px;
}

.fake-stat-val {
  height: 18px;
  width: 70%;
  border-radius: 4px;
}
.fake-stat-val.teal { background: #ccfbf1; }
.fake-stat-val.blue { background: #dbeafe; }
.fake-stat-val.purple { background: #ede9fe; }

.fake-stat-trend {
  height: 8px;
  width: 40%;
  border-radius: 3px;
}
.fake-stat-trend.up { background: #dcfce7; }
.fake-stat-trend.down { background: #fee2e2; }

.fake-content-row {
  display: flex;
  gap: 10px;
  padding: 0 16px 12px;
  flex: 1;
  min-height: 0;
}

.fake-chart-card, .fake-list-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fake-chart-card { flex: 1.4; }
.fake-list-card { flex: 1; }

.fake-chart-title, .fake-list-title {
  height: 10px;
  width: 50%;
  background: #e2e8f0;
  border-radius: 3px;
}

.fake-chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  flex: 1;
  padding-top: 8px;
}

.fake-bar {
  flex: 1;
  background: #e2e8f0;
  border-radius: 3px 3px 0 0;
  transition: height 0.3s;
}
.fake-bar.teal-bar { background: #14b8a6; }

.fake-list-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fake-avatar-sm {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #e2e8f0;
  flex-shrink: 0;
}
.fake-avatar-sm.purple { background: #c4b5fd; }
.fake-avatar-sm.blue { background: #93c5fd; }

.fake-row-text { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.fake-row-name { height: 8px; background: #e2e8f0; border-radius: 3px; width: 80%; }
.fake-row-sub { height: 6px; background: #f1f5f9; border-radius: 3px; width: 55%; }

.fake-badge-pill {
  width: 40px; height: 16px; border-radius: 100px;
}
.fake-badge-pill.teal { background: #ccfbf1; }
.fake-badge-pill.yellow { background: #fef9c3; }

/* Floating badges */
.floating-badge {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  animation: float 4s ease-in-out infinite;
}

.badge-left {
  bottom: 40px;
  left: -24px;
  animation-delay: 0s;
}

.badge-right {
  top: 60px;
  right: -24px;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.floating-badge-icon { font-size: 1.4rem; }
.floating-badge-title { font-size: 0.8rem; font-weight: 700; color: #0f172a; }
.floating-badge-sub { font-size: 0.7rem; color: #94a3b8; }

/* ============================================================
   TRUST SECTION
   ============================================================ */
.trust-section {
  padding: 32px 0;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.trust-label {
  text-align: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 20px;
}

.trust-logos {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.trust-logo {
  font-size: 0.85rem;
  font-weight: 700;
  color: #cbd5e1;
  letter-spacing: 0.02em;
}

/* ============================================================
   SECTION HEADERS
   ============================================================ */
.section-header {
  text-align: center;
  margin-bottom: 56px;
}

.section-chip {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 100px;
  background: #f0fdf9;
  border: 1px solid #99f6e4;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
  line-height: 1.1;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ============================================================
   FEATURES
   ============================================================ */
.features-section {
  padding: 96px 0;
  background: #ffffff;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
}

.feature-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 32px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.feature-card:hover {
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.feature-card-large {
  grid-column: 1 / 3;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.feature-card-large .feature-img-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 120px;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 12px;
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 80px;
  width: 100%;
}

.mini-bar {
  flex: 1;
  background: #e2e8f0;
  border-radius: 3px 3px 0 0;
}
.mini-bar.teal-mini { background: #14b8a6; }

.feature-card-dark {
  background: #0f172a;
  border-color: #1e293b;
}

.feature-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  margin-bottom: 20px;
  grid-column: 1 / -1;
}
.blue-icon { background: #dbeafe; color: #2563eb; }
.teal-icon { background: #ccfbf1; color: #0d9488; }
.purple-icon { background: #ede9fe; color: #7c3aed; }
.orange-icon { background: #ffedd5; color: #ea580c; }
.white-icon { background: rgba(255,255,255,0.1); color: #e2e8f0; }

.feature-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;
  grid-column: 1 / -1;
}

.feature-title-light { color: #f8fafc; }

.feature-desc {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.65;
  grid-column: 1 / -1;
}
.feature-desc-light { color: #94a3b8; }

/* ============================================================
   TESTIMONIALS
   ============================================================ */
.testimonials-section {
  padding: 96px 0;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.testimonial-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.testimonial-featured {
  background: #0f172a;
  border-color: #1e293b;
}

.testimonial-stars {
  color: #f59e0b;
  font-size: 0.9rem;
  letter-spacing: 2px;
}

.testimonial-text {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #334155;
  flex: 1;
}

.testimonial-featured .testimonial-text { color: #cbd5e1; }

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.testimonial-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.testimonial-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}

.testimonial-featured .testimonial-name { color: #f8fafc; }

.testimonial-role {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* ============================================================
   PRICING
   ============================================================ */
.pricing-section {
  padding: 96px 0;
  background: #ffffff;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: start;
}

.pricing-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.pricing-card-featured {
  background: #0f172a;
  border-color: #14b8a6;
  box-shadow: 0 24px 64px rgba(15,23,42,0.2), 0 0 0 4px rgba(20,184,166,0.1);
}

.plan-badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: #14b8a6;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 5px 16px;
  border-radius: 100px;
  white-space: nowrap;
}

.plan-name {
  font-size: 0.75rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}
.plan-name-light { color: #14b8a6; }

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.plan-price-number {
  font-size: 3.5rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.04em;
  line-height: 1;
}
.plan-price-light { color: #ffffff; }
.plan-price-period { font-size: 1.1rem; color: #64748b; font-weight: 500; }

.plan-tagline {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 24px;
}
.plan-tagline-light { color: #64748b; }

.plan-cta-link {
  display: block;
  margin-bottom: 28px;
  text-decoration: none;
}

.plan-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  color: #334155;
}

.plan-features-light li { color: #cbd5e1; }

.check {
  font-size: 0.8rem;
  font-weight: 900;
  color: #22c55e;
  flex-shrink: 0;
}
.check-teal { color: #14b8a6; }
.check.muted { color: #cbd5e1; }
.muted-text { color: #cbd5e1; text-decoration: line-through; }

/* ============================================================
   CTA SECTION
   ============================================================ */
.cta-section {
  padding: 80px 0;
  background: #ffffff;
}

.cta-inner {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #0d9488 50%, #2563eb 100%);
  border-radius: 28px;
  padding: 72px 48px;
  text-align: center;
  overflow: hidden;
}

.cta-blob {
  position: absolute;
  width: 600px;
  height: 600px;
  background: rgba(255,255,255,0.04);
  border-radius: 50%;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.cta-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
  position: relative;
}

.cta-subtitle {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 36px;
  position: relative;
}

.cta-btns {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
}

.cta-btns .btn-primary {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.cta-btns .btn-primary:hover { background: #f8fafc; }

/* ============================================================
   FOOTER
   ============================================================ */
.footer {
  background: #0f172a;
  padding: 64px 0 32px;
  color: #fff;
}

.footer-top {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 60px;
  margin-bottom: 48px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: #14b8a6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #fff;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 900;
  color: #fff;
}

.logo-teal { color: #14b8a6; }

.footer-tagline {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.6;
  max-width: 280px;
}

.footer-socials {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.social-link:hover { background: #334155; color: #fff; }

.footer-links-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.footer-links-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col-title {
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.footer-link {
  font-size: 0.875rem;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover { color: #94a3b8; }

.footer-bottom {
  border-top: 1px solid #1e293b;
  padding-top: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-copy {
  font-size: 0.8rem;
  color: #475569;
}

.footer-badges {
  display: flex;
  gap: 12px;
}

.footer-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  background: #1e293b;
  padding: 4px 10px;
  border-radius: 6px;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  .feature-card-large {
    grid-column: 1 / -1;
    grid-template-columns: 1fr;
  }
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  .pricing-card-featured {
    order: -1;
  }
  .footer-top {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .floating-badge {
    display: none;
  }
  .hero-stat-divider { display: none; }
}

@media (max-width: 640px) {
  .hero-section { padding: 100px 0 60px; }
  .cta-inner { padding: 48px 24px; }
  .hero-ctas { flex-direction: column; align-items: stretch; }
  .btn-primary, .btn-secondary { justify-content: center; }
}
</style>