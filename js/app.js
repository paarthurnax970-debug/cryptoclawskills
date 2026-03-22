/* ═══════════════════════════════════════════════════════════════
   CryptoClaw Skills Hub — App JS
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── Globals ───────────────────────────────────────────────────
let SKILLS = [];

// ─── Fetch skills.json ─────────────────────────────────────────
async function loadSkills() {
  try {
    const res = await fetch('./data/skills.json');
    const data = await res.json();
    SKILLS = data.skills || [];
    return SKILLS;
  } catch (e) {
    console.error('Failed to load skills.json', e);
    return [];
  }
}

// ─── Category icons ────────────────────────────────────────────
const CATEGORY_ICONS = {
  'Scanner':      '🔍',
  'Analyzer':     '📊',
  'Risk Manager': '🛡️',
  'Portfolio':    '📈',
  'News':         '📰',
  'DeFi':         '⚡',
  'Automation':   '🤖',
};
function categoryIcon(cat) {
  return CATEGORY_ICONS[cat] || '🔧';
}

// ─── Render star rating ────────────────────────────────────────
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  let html = '<span class="stars">';
  for (let i = 0; i < full; i++)  html += '<span class="star-filled">★</span>';
  if (half)                        html += '<span class="star-filled">½</span>';
  for (let i = 0; i < empty; i++) html += '<span class="star-empty">★</span>';
  html += '</span>';
  return html;
}

// ─── Render a skill card ───────────────────────────────────────
function renderSkillCard(skill, linkToDetail = true) {
  const icon = categoryIcon(skill.category);
  const priceClass = skill.price === 0 ? 'free' : '';
  const detailUrl = `skill-detail.html?id=${skill.id}`;

  return `
    <div class="skill-card" data-id="${skill.id}" data-category="${skill.category}" data-price="${skill.price}">
      <div class="skill-card-header">
        <div class="skill-icon">${icon}</div>
        <div class="skill-price ${priceClass}">${skill.price_display}</div>
      </div>
      <div>
        <div class="skill-name">${escHtml(skill.name)}</div>
        <div class="skill-tagline">${escHtml(skill.tagline)}</div>
      </div>
      <div class="skill-meta">
        <span class="badge badge-category">${escHtml(skill.category)}</span>
        ${skill.verified_safe ? '<span class="badge badge-verified">✓ Verified Safe</span>' : ''}
        ${skill.price === 0 ? '<span class="badge badge-free">Free</span>' : ''}
      </div>
      <div class="skill-stats">
        <span class="skill-stat">${renderStars(skill.rating)} ${skill.rating}</span>
        <span class="skill-stat">↓ ${skill.installs}</span>
        <span class="skill-stat">💬 ${skill.reviews}</span>
      </div>
      <div class="skill-card-actions">
        ${linkToDetail
          ? `<a href="${detailUrl}" class="btn btn-outline btn-sm" style="flex:1">Details</a>`
          : ''}
        <a href="${skill.gumroad_url}" target="_blank" rel="noopener"
           class="btn btn-primary btn-sm" style="flex:1">
          ${skill.price === 0 ? 'Get Free' : 'Buy Now'}
        </a>
      </div>
    </div>
  `;
}

// ─── Escape HTML ───────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Nav active link ───────────────────────────────────────────
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html') ||
        (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ─── Mobile menu toggle ─────────────────────────────────────────
function initMobileMenu() {
  const hamburger = document.querySelector('.nav-hamburger');
  const menu = document.querySelector('.mobile-menu');
  if (!hamburger || !menu) return;
  hamburger.addEventListener('click', () => {
    menu.classList.toggle('open');
    hamburger.textContent = menu.classList.contains('open') ? '✕' : '☰';
  });
  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.textContent = '☰';
    });
  });
}

// ─── Accordion ─────────────────────────────────────────────────
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const body = trigger.nextElementSibling;
      const isOpen = trigger.classList.contains('open');
      // Close all
      document.querySelectorAll('.accordion-trigger').forEach(t => {
        t.classList.remove('open');
        if (t.nextElementSibling) t.nextElementSibling.classList.remove('open');
      });
      // Open clicked if was closed
      if (!isOpen) {
        trigger.classList.add('open');
        if (body) body.classList.add('open');
      }
    });
  });
}

// ─── Animate number counter ────────────────────────────────────
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const from = 0;
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease out cubic
    el.textContent = Math.round(from + (target - from) * ease).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const observers = document.querySelectorAll('[data-counter]');
  if (!observers.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.counter, 10);
        animateCounter(entry.target, target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  observers.forEach(el => io.observe(el));
}

// ─── MARKETPLACE PAGE ──────────────────────────────────────────
async function initMarketplace() {
  const grid = document.getElementById('skills-grid');
  const searchInput = document.getElementById('search');
  const resultCount = document.getElementById('result-count');
  const noResults = document.getElementById('no-results');
  if (!grid) return;

  grid.innerHTML = '<div class="loading"><div class="spinner"></div>Loading skills…</div>';
  const skills = await loadSkills();
  if (!skills.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><h3>No skills found</h3></div>';
    return;
  }

  let activeCategory = 'all';
  let activePrice = 'all';
  let searchTerm = '';

  function filterAndRender() {
    let filtered = skills.filter(s => {
      const matchCat = activeCategory === 'all' || s.category === activeCategory;
      const matchPrice =
        activePrice === 'all' ? true :
        activePrice === 'free' ? s.price === 0 :
        activePrice === 'u10'  ? s.price > 0 && s.price < 10 :
        activePrice === 'u25'  ? s.price >= 10 && s.price < 25 :
        activePrice === 'u25p' ? s.price >= 25 : true;
      const matchSearch =
        searchTerm === '' ||
        s.name.toLowerCase().includes(searchTerm) ||
        s.tagline.toLowerCase().includes(searchTerm) ||
        s.description.toLowerCase().includes(searchTerm) ||
        s.tags.some(t => t.toLowerCase().includes(searchTerm));
      return matchCat && matchPrice && matchSearch;
    });

    if (resultCount) resultCount.textContent = `${filtered.length} skill${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      grid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
    } else {
      if (noResults) noResults.style.display = 'none';
      grid.innerHTML = filtered.map(s => renderSkillCard(s, true)).join('');
    }
  }

  // Category chips
  document.querySelectorAll('[data-filter-cat]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-cat]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.filterCat;
      filterAndRender();
    });
  });

  // Price chips
  document.querySelectorAll('[data-filter-price]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-price]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activePrice = chip.dataset.filterPrice;
      filterAndRender();
    });
  });

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.toLowerCase().trim();
      filterAndRender();
    });
  }

  filterAndRender();
}

// ─── HOMEPAGE ──────────────────────────────────────────────────
async function initHomepage() {
  const featuredGrid = document.getElementById('featured-grid');
  const skillCountEl = document.getElementById('stat-skills');
  const installCountEl = document.getElementById('stat-installs');
  if (!featuredGrid) return;

  const skills = await loadSkills();
  if (!skills.length) return;

  // Stats
  const totalInstalls = skills.reduce((sum, s) => sum + s.installs, 0);
  if (skillCountEl) {
    skillCountEl.dataset.counter = skills.length;
  }
  if (installCountEl) {
    installCountEl.dataset.counter = totalInstalls;
  }
  initCounters();

  // Featured: first 3 skills
  const featured = skills.slice(0, 3);
  featuredGrid.innerHTML = featured.map(s => renderSkillCard(s, true)).join('');
}

// ─── SKILL DETAIL PAGE ─────────────────────────────────────────
async function initSkillDetail() {
  const container = document.getElementById('skill-detail-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>Skill not found</h3><p>No skill ID provided.</p></div>';
    return;
  }

  container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading skill…</div>';
  const skills = await loadSkills();
  const skill = skills.find(s => s.id === id);

  if (!skill) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">😕</div><h3>Skill not found</h3><p>The skill "${escHtml(id)}" doesn't exist.</p><a href="marketplace.html" class="btn btn-outline" style="margin-top:16px">Browse Marketplace</a></div>`;
    return;
  }

  document.title = `${skill.name} — CryptoClaw Skills Hub`;
  const breadcrumb = document.getElementById('breadcrumb-skill');
  if (breadcrumb) breadcrumb.textContent = skill.name;

  const tags = (skill.tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join(' ');
  const reqs = (skill.requirements || []).map(r => `<li>${escHtml(r)}</li>`).join('');
  const stars = renderStars(skill.rating);
  const icon = categoryIcon(skill.category);

  container.innerHTML = `
    <div class="skill-detail-header card" style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;margin-bottom:32px">
      <div class="skill-icon" style="width:72px;height:72px;font-size:2rem;flex-shrink:0">${icon}</div>
      <div style="flex:1;min-width:200px">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px">
          <h1 style="font-size:1.8rem">${escHtml(skill.name)}</h1>
          <span class="badge badge-category">${escHtml(skill.category)}</span>
          ${skill.verified_safe ? '<span class="badge badge-verified">✓ Verified Safe</span>' : ''}
        </div>
        <p style="font-size:1.05rem;color:var(--text-dim);margin-bottom:16px">${escHtml(skill.tagline)}</p>
        <div class="skill-stats" style="margin-bottom:16px">
          <span class="skill-stat">${stars} ${skill.rating} (${skill.reviews} reviews)</span>
          <span class="skill-stat">↓ ${skill.installs} installs</span>
          <span class="skill-stat">By <strong style="color:var(--accent)">${escHtml(skill.seller)}</strong>${skill.seller_verified ? ' ✓' : ''}</span>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <span style="font-size:2rem;font-weight:800;color:var(--accent)">${escHtml(skill.price_display)}</span>
          <a href="${skill.gumroad_url}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">
            ${skill.price === 0 ? '🎁 Get for Free' : '💳 Buy on Gumroad'}
          </a>
          <a href="install-guide.html" class="btn btn-outline">📖 Install Guide</a>
        </div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-bottom:32px">
      <div>
        <div class="card" style="margin-bottom:24px">
          <h3 style="margin-bottom:16px">About This Skill</h3>
          <p style="color:var(--text-dim);line-height:1.7">${escHtml(skill.long_description || skill.description)}</p>
        </div>
        <div class="card">
          <h3 style="margin-bottom:16px">🔖 Tags</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${tags}</div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:24px">
          <h3 style="margin-bottom:16px">⚙️ Requirements</h3>
          ${reqs ? `<ul style="color:var(--text-dim);padding-left:20px;display:flex;flex-direction:column;gap:8px">${reqs}</ul>` : '<p>No special requirements.</p>'}
        </div>
        <div class="card alert-gold" style="border:1px solid rgba(201,168,76,0.3);padding:20px">
          <h4 style="color:var(--gold);margin-bottom:10px">🛡️ Safety Review</h4>
          <p style="font-size:0.875rem;color:var(--text-dim)">${escHtml(skill.safety_notes || 'This skill has been reviewed by the Paarthurnax team.')}</p>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:32px">
      <h3 style="margin-bottom:20px">📦 Installation Instructions</h3>
      <ol style="padding-left:24px;display:flex;flex-direction:column;gap:12px;color:var(--text-dim)">
        <li><strong style="color:var(--text)">Purchase the skill</strong> — Click "Buy on Gumroad" and complete checkout. You'll receive a download link.</li>
        <li><strong style="color:var(--text)">Download the skill folder</strong> — Extract the ZIP file. You'll have a folder named <code style="background:rgba(0,229,204,0.1);padding:2px 6px;border-radius:4px">${escHtml(skill.id)}/</code></li>
        <li><strong style="color:var(--text)">Locate your OpenClaw skills directory</strong> — Usually at <code style="background:rgba(0,229,204,0.1);padding:2px 6px;border-radius:4px">~/.openclaw/workspace/skills/</code></li>
        <li><strong style="color:var(--text)">Copy the folder</strong> — Move the extracted skill folder into your OpenClaw skills directory</li>
        <li><strong style="color:var(--text)">Configure the skill</strong> — Edit the <code style="background:rgba(0,229,204,0.1);padding:2px 6px;border-radius:4px">SKILL.md</code> or <code style="background:rgba(0,229,204,0.1);padding:2px 6px;border-radius:4px">config.json</code> inside the skill folder</li>
        <li><strong style="color:var(--text)">Restart OpenClaw</strong> — The skill will be auto-detected. Ask your agent: "What skills do you have?"</li>
      </ol>
      <a href="install-guide.html" class="btn btn-outline btn-sm" style="margin-top:20px">📖 Full Install Guide</a>
    </div>

    <div class="card">
      <h3 style="margin-bottom:20px">💬 Reviews <span style="color:var(--text-muted);font-size:0.9rem;font-weight:400">(${skill.reviews} total)</span></h3>
      <div class="alert" style="font-size:0.875rem">
        Reviews are manually verified by the Paarthurnax team. Purchase the skill on Gumroad and email us your feedback to have it featured here.
      </div>
    </div>
  `;
}

// ─── SELL PAGE ─────────────────────────────────────────────────
function initSellPage() {
  const form = document.getElementById('seller-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    const status = document.getElementById('form-status');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const data = new FormData(form);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.innerHTML = `
          <div style="text-align:center;padding:40px 24px">
            <div style="font-size:3rem;margin-bottom:16px">🎉</div>
            <h3 style="color:var(--accent);margin-bottom:12px">Submission Received!</h3>
            <p>Thanks for submitting your skill. We'll review it within 3–5 business days and get back to you via email.</p>
          </div>
        `;
      } else {
        throw new Error('Form submission failed');
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Submit Skill for Review';
      if (status) {
        status.textContent = 'Submission failed. Please email paarthurnax970@gmail.com directly.';
        status.style.color = '#f87171';
      }
    }
  });
}

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initMobileMenu();
  initAccordions();

  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '' || page === '/') initHomepage();
  if (page === 'marketplace.html') initMarketplace();
  if (page === 'skill-detail.html') initSkillDetail();
  if (page === 'sell.html') initSellPage();
});
