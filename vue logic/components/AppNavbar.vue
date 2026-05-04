<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isScrolled = ref(false);
const mobileMenuOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<template>
  <nav class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="navbar-inner">

      <!-- Logo -->
      <router-link to="/" class="navbar-logo">
        <div class="logo-icon-wrap">
          <i class="pi pi-heart-fill"></i>
        </div>
        <span class="logo-wordmark">Onco<span class="logo-accent">SaaS</span></span>
      </router-link>

      <!-- Navigation Links (desktop) -->
      <div class="navbar-links">
        <a href="#features" class="nav-link">Features</a>
        <a href="#pricing" class="nav-link">Pricing</a>
        <a href="#reviews" class="nav-link">Reviews</a>
      </div>

      <!-- CTA Buttons (desktop) -->
      <div class="navbar-actions">
        <router-link to="/login" class="btn-signin">Sign In</router-link>
        <router-link to="/register" class="btn-getstarted">Get Started</router-link>
      </div>

      <!-- Mobile hamburger -->
      <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">
        <span class="hamburger-line" :class="{ 'line-top-open': mobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'line-mid-open': mobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'line-bot-open': mobileMenuOpen }"></span>
      </button>

    </div>

    <!-- Mobile menu -->
    <div class="mobile-menu" :class="{ 'mobile-menu-open': mobileMenuOpen }">
      <a href="#features" class="mobile-link" @click="mobileMenuOpen = false">Features</a>
      <a href="#pricing" class="mobile-link" @click="mobileMenuOpen = false">Pricing</a>
      <a href="#reviews" class="mobile-link" @click="mobileMenuOpen = false">Reviews</a>
      <div class="mobile-menu-divider"></div>
      <router-link to="/login" class="mobile-link" @click="mobileMenuOpen = false">Sign In</router-link>
      <router-link to="/register" class="mobile-cta" @click="mobileMenuOpen = false">Get Started →</router-link>
    </div>
  </nav>
</template>

<style scoped>
/* ============================================================
   NAVBAR BASE
   ============================================================ */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  transition: background 0.3s, box-shadow 0.3s, border-color 0.3s, padding 0.3s;

  /* Force light appearance — counteract base.css dark mode */
  color-scheme: light;
  color: #0f172a;
}

.navbar-scrolled {
  background: rgba(255, 255, 255, 0.97);
  border-color: #e2e8f0;
  box-shadow: 0 1px 16px rgba(15, 23, 42, 0.08);
}

/* ============================================================
   INNER LAYOUT
   ============================================================ */
.navbar-inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

/* ============================================================
   LOGO
   ============================================================ */
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon-wrap {
  width: 36px;
  height: 36px;
  background: #0f172a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.85rem;
  transition: background 0.2s;
  flex-shrink: 0;
}

.navbar-logo:hover .logo-icon-wrap {
  background: #1e293b;
}

.logo-wordmark {
  font-size: 1.2rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.logo-accent {
  color: #0d9488;
}

/* ============================================================
   NAV LINKS (desktop)
   ============================================================ */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 36px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  text-decoration: none;
  transition: color 0.2s;
  white-space: nowrap;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: #0d9488;
  border-radius: 2px;
  transform: scaleX(0);
  transition: transform 0.2s;
  transform-origin: center;
}

.nav-link:hover {
  color: #0d9488;
}

.nav-link:hover::after {
  transform: scaleX(1);
}

/* ============================================================
   CTA ACTIONS (desktop)
   ============================================================ */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-signin {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  text-decoration: none;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
  white-space: nowrap;
}

.btn-signin:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.btn-getstarted {
  display: inline-flex;
  align-items: center;
  padding: 9px 20px;
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff;
  background: #0f172a;
  text-decoration: none;
  border-radius: 10px;
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
}

.btn-getstarted:hover {
  background: #1e293b;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.3);
  transform: translateY(-1px);
}

/* ============================================================
   MOBILE HAMBURGER
   ============================================================ */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.mobile-menu-btn:hover {
  background: #f1f5f9;
}

.hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: #334155;
  border-radius: 2px;
  transition: transform 0.25s, opacity 0.25s;
  transform-origin: center;
}

.line-top-open  { transform: translateY(7px) rotate(45deg); }
.line-mid-open  { opacity: 0; transform: scaleX(0); }
.line-bot-open  { transform: translateY(-7px) rotate(-45deg); }

/* ============================================================
   MOBILE MENU DROPDOWN
   ============================================================ */
.mobile-menu {
  display: none;
  flex-direction: column;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 12px 24px 20px;
  gap: 2px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1);

  /* Animate in */
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  padding-top: 0;
  padding-bottom: 0;
}

.mobile-menu-open {
  max-height: 400px;
  padding-top: 12px;
  padding-bottom: 20px;
}

.mobile-link {
  display: block;
  padding: 10px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
  text-decoration: none;
  border-radius: 8px;
  transition: color 0.2s;
}

.mobile-link:hover {
  color: #0d9488;
}

.mobile-menu-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 8px 0;
}

.mobile-cta {
  display: inline-flex;
  align-items: center;
  margin-top: 6px;
  padding: 11px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
  background: #0f172a;
  text-decoration: none;
  border-radius: 10px;
  transition: background 0.2s;
  align-self: flex-start;
}

.mobile-cta:hover {
  background: #1e293b;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 768px) {
  .navbar-links,
  .navbar-actions {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }
}

/* Smooth scroll for anchor links */
html {
  scroll-behavior: smooth;
}
</style>