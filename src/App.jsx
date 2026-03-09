import { useState, useEffect, useRef } from "react";
import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const API_BASE = "https://decideforus-backend.onrender.com/api";

const THINKING_STEPS = [
  "Understanding your preferences...",
  "Scanning nearby places...",
  "Checking crowd levels...",
  "Finding best match for you...",
  "Finalizing recommendation...",
];

// ─── Styles ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --purple: #7c3aed;
    --purple-light: #a78bfa;
    --purple-dark: #5b21b6;
    --purple-bg: #f5f3ff;
    --purple-border: #ede9fe;
    --white: #ffffff;
    --gray-50: #fafafa;
    --gray-100: #f4f4f5;
    --gray-200: #e4e4e7;
    --gray-400: #a1a1aa;
    --gray-600: #52525b;
    --gray-800: #27272a;
    --gray-900: #18181b;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(124,58,237,0.10), 0 2px 6px rgba(0,0,0,0.06);
    --shadow-lg: 0 12px 40px rgba(124,58,237,0.15), 0 4px 12px rgba(0,0,0,0.08);
    --radius: 16px;
    --radius-sm: 10px;
    --radius-xs: 8px;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--gray-50);
    color: var(--gray-900);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Navbar ── */
  .navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 64px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--purple-border);
  }
  .navbar-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
    color: var(--gray-900); text-decoration: none;
  }
  .navbar-logo-icon {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, var(--purple), var(--purple-light));
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .navbar-logo span { color: var(--purple); }
  .navbar-right { display: flex; align-items: center; gap: 12px; }
  .nav-history-btn {
    font-size: 14px; font-weight: 500; color: var(--gray-600);
    background: none; border: none; cursor: pointer; padding: 6px 12px;
    border-radius: var(--radius-xs); transition: all 0.15s;
  }
  .nav-history-btn:hover { color: var(--purple); background: var(--purple-bg); }

  /* Avatar dropdown */
  .nav-user { position: relative; }
  .nav-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, var(--purple), var(--purple-light));
    color: white; font-weight: 700; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 2px solid var(--purple-border);
    overflow: hidden; transition: transform 0.15s;
  }
  .nav-avatar:hover { transform: scale(1.05); }
  .nav-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .nav-dropdown {
    position: absolute; top: 48px; right: 0; min-width: 180px;
    background: white; border-radius: var(--radius-sm);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    border: 1px solid var(--gray-200);
    padding: 8px; overflow: hidden;
    animation: dropIn 0.15s ease;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .nav-dropdown-name {
    padding: 8px 10px; font-size: 13px; font-weight: 600; color: var(--gray-600);
    border-bottom: 1px solid var(--gray-100); margin-bottom: 4px;
  }
  .nav-dropdown-btn {
    width: 100%; text-align: left; padding: 8px 10px;
    background: none; border: none; border-radius: 6px;
    font-size: 14px; color: var(--gray-800); cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    transition: background 0.12s;
  }
  .nav-dropdown-btn:hover { background: var(--gray-100); }
  .nav-dropdown-btn.logout { color: #dc2626; }
  .nav-dropdown-btn.logout:hover { background: #fef2f2; }

  /* ── Auth Page ── */
  .auth-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f7ff 0%, #ede9fe 50%, #ddd6fe 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    position: relative; overflow: hidden;
  }
  .auth-page::before {
    content: ''; position: absolute;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%);
    top: -150px; right: -150px;
  }
  .auth-page::after {
    content: ''; position: absolute;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%);
    bottom: -100px; left: -100px;
  }
  .auth-card {
    width: 100%; max-width: 400px; z-index: 1;
    background: white; border-radius: 24px;
    padding: 40px 36px;
    box-shadow: 0 24px 60px rgba(124,58,237,0.15), 0 8px 20px rgba(0,0,0,0.06);
    animation: fadeUp 0.4s ease;
  }
  .auth-logo {
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; margin-bottom: 28px;
  }
  .auth-logo-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, var(--purple), var(--purple-light));
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; box-shadow: 0 8px 20px rgba(124,58,237,0.3);
  }
  .auth-title {
    font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700;
    color: var(--gray-900); text-align: center;
  }
  .auth-subtitle { font-size: 13px; color: var(--gray-400); text-align: center; margin-top: 4px; }

  .auth-label { display: block; font-size: 13px; font-weight: 500; color: var(--gray-600); margin-bottom: 6px; }
  .auth-input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid var(--gray-200); border-radius: var(--radius-xs);
    font-size: 15px; font-family: 'DM Sans', sans-serif;
    color: var(--gray-900); background: var(--gray-50);
    outline: none; transition: all 0.2s; margin-bottom: 14px;
  }
  .auth-input:focus { border-color: var(--purple); background: white; box-shadow: 0 0 0 3px rgba(124,58,237,0.08); }
  .auth-input::placeholder { color: var(--gray-400); }

  .btn-purple {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, var(--purple), var(--purple-dark));
    color: white; border: none; border-radius: var(--radius-xs);
    font-size: 15px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s; box-shadow: 0 4px 12px rgba(124,58,237,0.3);
  }
  .btn-purple:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(124,58,237,0.4); }
  .btn-purple:active { transform: translateY(0); }
  .btn-purple:disabled { background: var(--gray-200); color: var(--gray-400); box-shadow: none; cursor: not-allowed; transform: none; }

  .btn-google {
    width: 100%; padding: 12px;
    background: white; border: 1.5px solid var(--gray-200);
    border-radius: var(--radius-xs); font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif; color: var(--gray-800);
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.2s; margin-bottom: 16px;
  }
  .btn-google:hover { border-color: var(--purple); background: var(--purple-bg); box-shadow: var(--shadow-sm); }

  .auth-divider {
    display: flex; align-items: center; gap: 10px;
    font-size: 12px; color: var(--gray-400); margin: 16px 0;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--gray-200);
  }
  .auth-switch { font-size: 13px; color: var(--gray-400); text-align: center; margin-top: 16px; }
  .auth-switch button {
    background: none; border: none; color: var(--purple);
    font-weight: 600; cursor: pointer; font-size: 13px; padding: 0;
  }
  .auth-switch button:hover { text-decoration: underline; }

  /* ── Landing Page ── */
  .landing-page {
    min-height: 100vh; padding-top: 64px;
    background: white; overflow: hidden;
  }
  .landing-hero {
    position: relative;
    padding: 80px 32px 60px;
    text-align: center;
    background: linear-gradient(180deg, #faf8ff 0%, white 100%);
    overflow: hidden;
  }
  .landing-hero-bg {
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 70%);
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--purple-bg); border: 1px solid var(--purple-border);
    color: var(--purple); font-size: 13px; font-weight: 600;
    padding: 6px 14px; border-radius: 999px; margin-bottom: 24px;
    animation: fadeUp 0.5s ease;
  }
  .landing-title {
    font-family: 'Syne', sans-serif; font-size: clamp(36px, 6vw, 64px);
    font-weight: 800; line-height: 1.1; color: var(--gray-900);
    margin-bottom: 20px; position: relative; z-index: 1;
    animation: fadeUp 0.5s ease 0.1s both;
  }
  .landing-title .highlight {
    color: var(--purple); position: relative; display: inline-block;
  }
  .landing-subtitle {
    font-size: 18px; color: var(--gray-600); max-width: 480px; margin: 0 auto 36px;
    line-height: 1.6; position: relative; z-index: 1;
    animation: fadeUp 0.5s ease 0.2s both;
  }
  .hero-cta-group {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    position: relative; z-index: 1;
    animation: fadeUp 0.5s ease 0.3s both;
  }
  .btn-hero {
    padding: 16px 36px; font-size: 16px; font-weight: 700;
    background: linear-gradient(135deg, var(--purple), var(--purple-dark));
    color: white; border: none; border-radius: 12px; cursor: pointer;
    font-family: 'Syne', sans-serif;
    box-shadow: 0 8px 24px rgba(124,58,237,0.35);
    transition: all 0.2s; display: flex; align-items: center; gap: 8px;
  }
  .btn-hero:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,0.45); }
  .btn-hero:disabled { background: var(--gray-200); color: var(--gray-400); box-shadow: none; cursor: not-allowed; transform: none; }
  .location-note {
    font-size: 13px; color: var(--gray-400);
    display: flex; align-items: center; gap: 6px;
  }
  .location-note.warn { color: #d97706; }
  .location-note.ok { color: #16a34a; }

  /* Features */
  .landing-features {
    padding: 64px 32px; max-width: 960px; margin: 0 auto;
  }
  .features-title {
    font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700;
    text-align: center; color: var(--gray-900); margin-bottom: 48px;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 24px;
  }
  .feature-card {
    background: white; border: 1px solid var(--purple-border);
    border-radius: var(--radius); padding: 28px 24px;
    transition: all 0.2s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--purple-light); }
  .feature-icon { font-size: 32px; margin-bottom: 14px; }
  .feature-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--gray-900); margin-bottom: 8px; }
  .feature-desc { font-size: 14px; color: var(--gray-600); line-height: 1.5; }

  /* Steps */
  .landing-steps {
    padding: 64px 32px;
    background: linear-gradient(135deg, #faf8ff, #ede9fe);
  }
  .steps-inner { max-width: 960px; margin: 0 auto; }
  .steps-title {
    font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700;
    text-align: center; color: var(--gray-900); margin-bottom: 48px;
  }
  .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 32px; }
  .step-item { text-align: center; }
  .step-num {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--purple); color: white;
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 4px 12px rgba(124,58,237,0.3);
  }
  .step-label { font-size: 15px; font-weight: 600; color: var(--gray-900); margin-bottom: 6px; }
  .step-desc { font-size: 13px; color: var(--gray-600); }

  /* ── Question Pages ── */
  .q-page {
    min-height: 100vh; padding: 80px 20px 40px;
    background: linear-gradient(180deg, #faf8ff 0%, white 60%);
    display: flex; flex-direction: column; align-items: center;
  }
  .q-top {
    width: 100%; max-width: 560px;
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px;
  }
  .q-back {
    width: 36px; height: 36px; border-radius: 10px;
    background: white; border: 1px solid var(--gray-200);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; color: var(--gray-600);
    transition: all 0.15s; flex-shrink: 0;
  }
  .q-back:hover { border-color: var(--purple); color: var(--purple); background: var(--purple-bg); }
  .q-progress-wrap { flex: 1; }
  .q-progress-label {
    display: flex; justify-content: space-between;
    font-size: 12px; color: var(--gray-400); margin-bottom: 6px;
  }
  .q-progress-bar {
    height: 5px; background: var(--gray-200); border-radius: 99px; overflow: hidden;
  }
  .q-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--purple), var(--purple-light));
    border-radius: 99px; transition: width 0.4s ease;
  }
  .q-restart {
    font-size: 13px; color: var(--gray-400); background: none; border: none;
    cursor: pointer; padding: 4px 8px; border-radius: 6px;
  }
  .q-restart:hover { color: var(--purple); background: var(--purple-bg); }

  .q-card {
    width: 100%; max-width: 560px;
    background: white; border-radius: 24px;
    padding: 36px 32px;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--purple-border);
    animation: fadeUp 0.3s ease;
  }
  .q-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: var(--purple-bg); font-size: 26px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .q-card h2 {
    font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800;
    color: var(--gray-900); margin-bottom: 8px;
  }
  .q-sub { font-size: 14px; color: var(--gray-400); margin-bottom: 28px; }
  .q-options { display: flex; flex-direction: column; gap: 10px; }
  .q-option {
    width: 100%; padding: 16px 20px;
    background: var(--gray-50); border: 1.5px solid var(--gray-200);
    border-radius: 12px; font-size: 15px; font-weight: 500;
    color: var(--gray-800); cursor: pointer; text-align: left;
    font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 12px;
    transition: all 0.18s;
  }
  .q-option:hover {
    border-color: var(--purple); color: var(--purple);
    background: var(--purple-bg); transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(124,58,237,0.12);
  }
  .q-option-emoji { font-size: 22px; flex-shrink: 0; }

  /* ── Thinking ── */
  .thinking-page {
    min-height: 100vh; padding-top: 64px;
    background: linear-gradient(180deg, #faf8ff 0%, white 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .thinking-card {
    width: 100%; max-width: 440px; margin: 20px;
    background: white; border-radius: 24px;
    padding: 48px 40px; text-align: center;
    box-shadow: var(--shadow-lg); border: 1px solid var(--purple-border);
    animation: fadeUp 0.3s ease;
  }
  .thinking-spinner {
    width: 72px; height: 72px; margin: 0 auto 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--purple), var(--purple-light));
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124,58,237,0.3); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 16px rgba(124,58,237,0); }
  }
  .thinking-card h2 {
    font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700;
    color: var(--gray-900); margin-bottom: 12px;
  }
  .thinking-step {
    font-size: 15px; color: var(--purple); font-weight: 500;
    min-height: 24px; transition: all 0.3s;
  }
  .dot-loader {
    display: flex; gap: 6px; justify-content: center; margin-top: 20px;
  }
  .dot-loader span {
    width: 8px; height: 8px; border-radius: 50%; background: var(--purple-light);
    animation: blink 1.4s infinite both;
  }
  .dot-loader span:nth-child(2) { animation-delay: 0.2s; }
  .dot-loader span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
  }

  /* ── Result ── */
  .result-page {
    min-height: 100vh; padding: 80px 20px 40px;
    background: linear-gradient(180deg, #faf8ff 0%, white 60%);
    display: flex; align-items: center; justify-content: center;
  }
  .result-card {
    width: 100%; max-width: 520px;
    background: white; border-radius: 24px;
    padding: 40px 36px; text-align: center;
    box-shadow: var(--shadow-lg); border: 1px solid var(--purple-border);
    animation: fadeUp 0.4s ease;
  }
  .result-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    color: #16a34a; font-size: 13px; font-weight: 600;
    padding: 5px 12px; border-radius: 999px; margin-bottom: 20px;
  }
  .result-card h2 {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700;
    color: var(--gray-600); margin-bottom: 8px;
  }
  .result-name {
    font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800;
    color: var(--gray-900); margin-bottom: 12px; line-height: 1.2;
  }
  .result-reason {
    font-size: 16px; color: var(--gray-600); line-height: 1.6;
    padding: 16px; background: var(--purple-bg); border-radius: 12px;
    border: 1px solid var(--purple-border); margin-bottom: 20px;
    text-align: left;
  }
  .result-tags {
    display: flex; flex-wrap: wrap; gap: 8px;
    justify-content: center; margin-bottom: 28px;
  }
  .result-tag {
    padding: 4px 12px; background: var(--gray-100);
    border-radius: 999px; font-size: 13px; color: var(--gray-600); font-weight: 500;
  }
  .result-actions { display: flex; flex-direction: column; gap: 10px; }
  .btn-whatsapp {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #25D366, #1da851);
    color: white; border: none; border-radius: 12px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 12px rgba(37,211,102,0.3);
    transition: all 0.2s;
  }
  .btn-whatsapp:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,211,102,0.4); }
  .btn-restart {
    width: 100%; padding: 13px;
    background: var(--gray-50); border: 1.5px solid var(--gray-200);
    color: var(--gray-700); border-radius: 12px;
    font-size: 15px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  }
  .btn-restart:hover { border-color: var(--purple); color: var(--purple); background: var(--purple-bg); }

  /* ── History ── */
  .history-page {
    min-height: 100vh; padding: 80px 20px 40px;
    background: linear-gradient(180deg, #faf8ff 0%, white 60%);
  }
  .history-inner { max-width: 720px; margin: 0 auto; padding-top: 32px; }
  .history-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px;
  }
  .history-header h1 {
    font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800;
    color: var(--gray-900);
  }
  .history-header p { font-size: 14px; color: var(--gray-400); margin-top: 4px; }

  .history-empty {
    text-align: center; padding: 80px 40px;
    background: white; border-radius: var(--radius);
    border: 1.5px dashed var(--gray-200);
  }
  .history-empty-icon { font-size: 56px; margin-bottom: 16px; }
  .history-empty h3 {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700;
    color: var(--gray-800); margin-bottom: 8px;
  }
  .history-empty p { font-size: 15px; color: var(--gray-400); margin-bottom: 24px; }

  /* ── Location Permission Banner ── */
  .loc-banner {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 200; width: calc(100% - 40px); max-width: 480px;
    background: white; border-radius: var(--radius);
    box-shadow: 0 16px 48px rgba(0,0,0,0.15);
    border: 1px solid var(--purple-border);
    padding: 20px 24px;
    display: flex; align-items: flex-start; gap: 14px;
    animation: slideUp 0.4s ease;
  }
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
    to   { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  .loc-banner-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--purple-bg); font-size: 20px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .loc-banner-body { flex: 1; }
  .loc-banner-title { font-size: 15px; font-weight: 600; color: var(--gray-900); margin-bottom: 4px; }
  .loc-banner-sub { font-size: 13px; color: var(--gray-400); margin-bottom: 12px; }
  .loc-banner-btns { display: flex; gap: 8px; }
  .loc-btn-allow {
    padding: 8px 16px; background: var(--purple); color: white;
    border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .loc-btn-allow:hover { background: var(--purple-dark); }
  .loc-btn-skip {
    padding: 8px 14px; background: none; border: 1.5px solid var(--gray-200);
    color: var(--gray-600); border-radius: 8px; font-size: 13px; cursor: pointer;
    transition: all 0.15s;
  }
  .loc-btn-skip:hover { border-color: var(--gray-400); }
  .loc-banner-close {
    background: none; border: none; cursor: pointer;
    font-size: 18px; color: var(--gray-400); padding: 0; width: 24px; flex-shrink: 0;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .navbar { padding: 0 16px; }
    .q-card { padding: 28px 20px; }
    .result-card { padding: 28px 20px; }
    .auth-card { padding: 32px 24px; }
    .landing-hero { padding: 60px 20px 48px; }
  }
`;

// ─── Location Banner Component ─────────────────────────────────────────────────
function LocationBanner({ onAllow, onSkip, onDismiss }) {
  return (
    <div className="loc-banner">
      <div className="loc-banner-icon">📍</div>
      <div className="loc-banner-body">
        <div className="loc-banner-title">Enable Location for Better Results</div>
        <div className="loc-banner-sub">
          We'll find the best restaurants near you. Your location is never stored.
        </div>
        <div className="loc-banner-btns">
          <button className="loc-btn-allow" onClick={onAllow}>Allow Location</button>
          <button className="loc-btn-skip" onClick={onSkip}>Skip for now</button>
        </div>
      </div>
      <button className="loc-banner-close" onClick={onDismiss}>✕</button>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ user, onLogout, onHistory, onDashboard, screen }) {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <div className="navbar-logo-icon">✦</div>
        Picksi
      </div>
      <div className="navbar-right">
        {user && (
          <>
            {screen !== "history" && (
              <button className="nav-history-btn" onClick={onHistory}>View History</button>
            )}
            <div className="nav-user" ref={ref}>
              <div className="nav-avatar" onClick={() => setShowMenu(v => !v)}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="user" />
                  : <span>{user.email[0].toUpperCase()}</span>
                }
              </div>
              {showMenu && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-name">{user.displayName || user.email}</div>
                  <button className="nav-dropdown-btn" onClick={() => { setShowMenu(false); onDashboard(); }}>
                    🏠 Dashboard
                  </button>
                  <button className="nav-dropdown-btn logout" onClick={() => { setShowMenu(false); onLogout(); }}>
                    → Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── Question Card ─────────────────────────────────────────────────────────────
function QuestionCard({ step, total, icon, title, sub, options, onBack, onRestart, progress }) {
  return (
    <div className="q-page">
      <div className="q-top">
        <button className="q-back" onClick={onBack}>←</button>
        <div className="q-progress-wrap">
          <div className="q-progress-label">
            <span>Step {step} of {total}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="q-progress-bar">
            <div className="q-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button className="q-restart" onClick={onRestart}>↺</button>
      </div>
      <div className="q-card">
        <div className="q-icon">{icon}</div>
        <h2>{title}</h2>
        <p className="q-sub">{sub}</p>
        <div className="q-options">
          {options.map((opt) => (
            <button key={opt.value} className="q-option" onClick={() => opt.onClick()}>
              <span className="q-option-emoji">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login"); // login | signup

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | granted | denied | skipped
  const [showLocBanner, setShowLocBanner] = useState(false);

  const [goingWith, setGoingWith] = useState("");
  const [time, setTime] = useState("");
  const [mood, setMood] = useState("");
  const [foodType, setFoodType] = useState("");
  const [budget, setBudget] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  // Show location banner when user lands on landing page
  useEffect(() => {
    if (screen === "landing" && user && locationStatus === "idle") {
      const timer = setTimeout(() => setShowLocBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, [screen, user, locationStatus]);

  // Location logic
  const requestLocation = () => {
    setShowLocBanner(false);
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const skipLocation = () => {
    setShowLocBanner(false);
    setLocationStatus("skipped");
  };

  // Auth handlers
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) return alert("Please enter email and password.");
    try {
      if (authMode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setScreen("landing");
    setLocationStatus("idle");
  };

  // Thinking flow
  useEffect(() => {
    if (screen !== "thinking") return;
    setThinkingIndex(0);
    const interval = setInterval(() => {
      setThinkingIndex(p => p < THINKING_STEPS.length - 1 ? p + 1 : p);
    }, 700);
    const timer = setTimeout(async () => {
      clearInterval(interval);
      await fetchRecommendation();
      setScreen("result");
    }, 3800);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [screen]);

  const fetchRecommendation = async () => {
    if (!location.lat) {
      setRecommendation({ name: "A Popular Nearby Restaurant", reason: "Based on your preferences, this is a top-rated spot loved by locals in your area." });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, goingWith, budget, time, foodType, location }),
      });
      const data = await res.json();
      setRecommendation(data);
    } catch {
      setRecommendation({ name: "A Popular Nearby Restaurant", reason: "A reliable and highly-rated spot near you, perfect for your preferences." });
    }
  };

  const restartFlow = () => {
    setGoingWith(""); setTime(""); setMood(""); setFoodType(""); setBudget("");
    setRecommendation(null); setScreen("landing");
  };

  const goBack = () => {
    const map = { q1: "landing", q2: "q1", q3: "q2", q4: "q3", q5: "q4" };
    setScreen(map[screen] || "landing");
  };

  const shareOnWhatsApp = () => {
    if (!recommendation?.name) return;
    const msg = `🍽️ *Picksi decided for us!*\n\n📍 *${recommendation.name}*\n💡 ${recommendation.reason}\n\n✨ Try it yourself → https://ai-picks--ninadrane1998.replit.app/`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ── Loading ────────────────────────────────────────────
  if (loadingAuth) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="thinking-spinner" style={{ width: 56, height: 56, fontSize: 24 }}>✦</div>
        </div>
      </>
    );
  }

  // ── Auth ───────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <style>{css}</style>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="auth-logo-icon">✦</div>
              <div>
                <div className="auth-title">Welcome to Picksi</div>
                <div className="auth-subtitle">
                  {authMode === "login" ? "Sign in to find your perfect restaurant" : "Create your account to get started"}
                </div>
              </div>
            </div>

            <button className="btn-google" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
              Continue with Google
            </button>

            <div className="auth-divider">OR</div>

            <label className="auth-label">Email</label>
            <input type="email" className="auth-input" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />

            <label className="auth-label">Password</label>
            <input type="password" className="auth-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleEmailAuth()} />

            <button className="btn-purple" onClick={handleEmailAuth}>
              {authMode === "login" ? "Sign In" : "Create Account"}
            </button>

            <p className="auth-switch">
              {authMode === "login"
                ? <>Don't have an account? <button onClick={() => setAuthMode("signup")}>Sign up</button></>
                : <>Already have an account? <button onClick={() => setAuthMode("login")}>Sign in</button></>
              }
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── Landing ────────────────────────────────────────────
  if (screen === "landing") {
    return (
      <>
        <style>{css}</style>
        <Navbar user={user} onLogout={handleLogout} onHistory={() => setScreen("history")}
          onDashboard={() => setScreen("landing")} screen={screen} />
        <div className="landing-page">
          <div className="landing-hero">
            <div className="landing-hero-bg" />
            <div className="hero-badge">✦ AI-Powered Food Decisions</div>
            <h1 className="landing-title">
              Stop Overthinking.<br />
              Let <span className="highlight">Picksi</span> Decide.
            </h1>
            <p className="landing-subtitle">
              Answer 5 quick questions and get an AI-picked restaurant near you — tailored to your mood, budget, and company.
            </p>
            <div className="hero-cta-group">
              <button
                className="btn-hero"
                onClick={() => setScreen("q1")}
                disabled={locationStatus === "idle"}
              >
                🍽️ Find My Restaurant
              </button>
              {locationStatus === "idle" && (
                <span className="location-note warn">
                  ⚠️ Allow location first to continue
                </span>
              )}
              {locationStatus === "granted" && (
                <span className="location-note ok">
                  ✅ Location detected — ready to go!
                </span>
              )}
              {(locationStatus === "denied" || locationStatus === "skipped") && (
                <button className="btn-hero" onClick={() => setScreen("q1")} style={{ marginTop: 4 }}>
                  🍽️ Continue Without Location
                </button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="landing-features">
            <div className="features-title">Why Picksi?</div>
            <div className="features-grid">
              {[
                { icon: "🧠", title: "Smart AI Engine", desc: "Learns your mood, budget, and company to find the perfect spot." },
                { icon: "📍", title: "Hyper-Local Results", desc: "Uses your real-time location to surface nearby, open restaurants." },
                { icon: "⚡", title: "Instant Answer", desc: "No scrolling, no reviews. Get one confident recommendation in seconds." },
                { icon: "🔒", title: "100% Private", desc: "We never store your location or personal data. Ever." },
              ].map(f => (
                <div className="feature-card" key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="landing-steps">
            <div className="steps-inner">
              <div className="steps-title">How it Works</div>
              <div className="steps-grid">
                {[
                  { n: 1, label: "Allow Location", desc: "So we know where to look" },
                  { n: 2, label: "Answer 5 Questions", desc: "Mood, company, budget..." },
                  { n: 3, label: "AI Thinks", desc: "Our engine picks the best match" },
                  { n: 4, label: "Go Eat!", desc: "Share with your group & enjoy" },
                ].map(s => (
                  <div className="step-item" key={s.n}>
                    <div className="step-num">{s.n}</div>
                    <div className="step-label">{s.label}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location Permission Banner */}
        {showLocBanner && (
          <LocationBanner
            onAllow={requestLocation}
            onSkip={skipLocation}
            onDismiss={() => setShowLocBanner(false)}
          />
        )}
      </>
    );
  }

  // ── History ────────────────────────────────────────────
  if (screen === "history") {
    return (
      <>
        <style>{css}</style>
        <Navbar user={user} onLogout={handleLogout} onHistory={() => setScreen("history")}
          onDashboard={() => setScreen("landing")} screen={screen} />
        <div className="history-page">
          <div className="history-inner">
            <div className="history-header">
              <div>
                <h1>Your History</h1>
                <p>Every decision, perfectly solved.</p>
              </div>
              <button className="btn-purple" style={{ width: "auto", padding: "12px 20px" }}
                onClick={() => setScreen("q1")}>
                + Pick a Spot
              </button>
            </div>
            <div className="history-empty">
              <div className="history-empty-icon">🍽️</div>
              <h3>Hungry and indecisive?</h3>
              <p>Let the Decision Engine handle it. Your first recommendation is just a few questions away.</p>
              <button className="btn-purple" style={{ width: "auto", padding: "14px 28px" }}
                onClick={() => setScreen("q1")}>
                Start First Decision
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Questions ──────────────────────────────────────────
  const qProps = { onBack: goBack, onRestart: restartFlow };

  if (screen === "q1") return (
    <>
      <style>{css}</style>
      <Navbar user={user} onLogout={handleLogout} onHistory={() => setScreen("history")} onDashboard={() => setScreen("landing")} screen={screen} />
      <QuestionCard {...qProps} step={1} total={5} progress={20} icon="👥" title="Who are you going with?" sub="Help us understand your plan better"
        options={[
          { emoji: "👯", label: "Friends", value: "friends", onClick: () => { setGoingWith("friends"); setScreen("q2"); } },
          { emoji: "❤️", label: "Girlfriend / Date", value: "date", onClick: () => { setGoingWith("date"); setScreen("q2"); } },
          { emoji: "👨‍👩‍👧", label: "Sister / Family", value: "family", onClick: () => { setGoingWith("family"); setScreen("q2"); } },
          { emoji: "💼", label: "Office Team", value: "office", onClick: () => { setGoingWith("office"); setScreen("q2"); } },
          { emoji: "🧍", label: "Solo", value: "solo", onClick: () => { setGoingWith("solo"); setScreen("q2"); } },
        ]}
      />
    </>
  );

  if (screen === "q2") return (
    <>
      <style>{css}</style>
      <Navbar user={user} onLogout={handleLogout} onHistory={() => setScreen("history")} onDashboard={() => setScreen("landing")} screen={screen} />
      <QuestionCard {...qProps} step={2} total={5} progress={40} icon="🕐" title="When is the plan?" sub="Choose your meal time"
        options={[
          { emoji: "☀️", label: "Breakfast", value: "breakfast", onClick: () => { setTime("breakfast"); setScreen("q3"); } },
          { emoji: "🍱", label: "Lunch", value: "lunch", onClick: () => { setTime("lunch"); setScreen("q3"); } },
          { emoji: "☕", label: "Evening Snacks", value: "evening", onClick: () => { setTime("evening"); setScreen("q3"); } },
          { emoji: "🌙", label: "Dinner", value: "dinner", onClick: () => { setTime("dinner"); setScreen("q3"); } },
        ]}
      />
    </>
  );

  if (screen === "q3") return (
    <>
      <style>{css}</style>
      <Navbar user={user} onLogout={handleLogout} onHistory={() => setScreen("history")} onDashboard={() => setScreen("landing")} screen={screen} />
      <QuestionCard {...qProps} step={3} total={5} progress={60} icon="✨" title="What's the vibe?" sub="Select your mood for today"
        options={[
          { emoji: "😌", label: "Casual & Chill", value: "casual", onClick: () => { setMood("casual"); setScreen("q4"); } },
          { emoji: "🤫", label: "Quiet & Peaceful", value: "quiet", onClick: () => { setMood("quiet"); setScreen("q4"); } },
          { emoji: "🎉", label: "Fun & Lively", value: "fun", onClick: () => { setMood("fun"); setScreen("q4"); } },
          { emoji: "🕯️", label: "Romantic", value: "romantic", onClick: () => { setMood("romantic"); setScreen("q4"); } },
        ]}
      />
    </>
  );

  if (screen === "q4") return (
    <>
      <style>{css}</style>
      <Navbar user={user} onLogout={handleLogout} onHistory={() => setScreen("history")} onDashboard={() => setScreen("landing")} screen={screen} />
      <QuestionCard {...qProps} step={4} total={5} progress={80} icon="🍴" title="Food preference?" sub="Choose what you're craving"
        options={[
          { emoji: "🥦", label: "Vegetarian", value: "veg", onClick: () => { setFoodType("veg"); setScreen("q5"); } },
          { emoji: "🍗", label: "Non-Vegetarian", value: "non-veg", onClick: () => { setFoodType("non-veg"); setScreen("q5"); } },
          { emoji: "🍽️", label: "Both / Mixed", value: "mixed", onClick: () => { setFoodType("mixed"); setScreen("q5"); } },
          { emoji: "🌱", label: "Vegan", value: "vegan", onClick: () => { setFoodType("vegan"); setScreen("q5"); } },
        ]}
      />
    </>
  );

  if (screen === "q5") return (
    <>
      <style>{css}</style>
      <Navbar user={user} onLogout={handleLogout} onHistory={() => setScreen("history")} onDashboard={() => setScreen("landing")} screen={screen} />
      <QuestionCard {...qProps} step={5} total={5} progress={100} icon="💰" title="Budget per person?" sub="Select your spending range"
        options={[
          { emoji: "₹", label: "Budget  (Under ₹200)", value: "low", onClick: () => { setBudget("low"); setScreen("thinking"); } },
          { emoji: "₹₹", label: "Moderate  (₹200–₹600)", value: "medium", onClick: () => { setBudget("medium"); setScreen("thinking"); } },
          { emoji: "₹₹₹", label: "Premium  (₹600+)", value: "high", onClick: () => { setBudget("high"); setScreen("thinking"); } },
        ]}
      />
    </>
  );

  // ── Thinking ───────────────────────────────────────────
  if (screen === "thinking") return (
    <>
      <style>{css}</style>
      <Navbar user={user} onLogout={handleLogout} onHistory={() => setScreen("history")} onDashboard={() => setScreen("landing")} screen={screen} />
      <div className="thinking-page">
        <div className="thinking-card">
          <div className="thinking-spinner">🤔</div>
          <h2>Finding your perfect spot...</h2>
          <div className="thinking-step">{THINKING_STEPS[thinkingIndex]}</div>
          <div className="dot-loader">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </>
  );

  // ── Result ─────────────────────────────────────────────
  if (screen === "result") return (
    <>
      <style>{css}</style>
      <Navbar user={user} onLogout={handleLogout} onHistory={() => setScreen("history")} onDashboard={() => setScreen("landing")} screen={screen} />
      <div className="result-page">
        <div className="result-card">
          <div className="result-badge">✅ High Confidence Match</div>
          <h2>Here's your recommendation</h2>
          <div className="result-name">{recommendation?.name || "A Great Spot Near You"}</div>
          <div className="result-reason">{recommendation?.reason || "Perfectly matched to your preferences."}</div>
          <div className="result-tags">
            {[goingWith, time, mood, foodType, budget].filter(Boolean).map(tag => (
              <span key={tag} className="result-tag">{tag}</span>
            ))}
          </div>
          <div className="result-actions">
            <button className="btn-whatsapp" onClick={shareOnWhatsApp}>
              💬 Share on WhatsApp
            </button>
            <button className="btn-restart" onClick={restartFlow}>
              ↺ Start Again
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return null;
}
