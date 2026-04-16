/**
 * PaperBook CMS — live content hydration from Gravity Portal
 * Fetches /api/public/website and populates data-cms-field/data-cms-section elements.
 * Falls back gracefully: if API fails, hardcoded HTML remains unchanged.
 * Include on every page: <script src="js/cms.js" defer></script>
 */
;(function () {
  'use strict';

  // Shared fetch promise — reused by analytics.js to avoid duplicate network request
  // Use relative URL so this works for any domain (paperbook.app, klintro.com, etc.)
  var _cmsApiBase = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';
  window.__pbCmsPromise = window.__pbCmsPromise ||
    fetch(_cmsApiBase + '/public/website')
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });

  window.__pbCmsPromise.then(function (data) {
    if (!data) return; // API failed — leave hardcoded HTML intact
    try {
      if (data.contact || data.social) applyContactInfo(data.contact || {}, data.social || {});
      if (data.integrations && data.integrations.length) applyIntegrations(data.integrations);
      if (data.pricing && data.pricing.length) applyPricing(data.pricing);
      if (data.addons && data.addons.length) applyAddons(data.addons);
      if (data.seo) applyMetaTags(data.seo);
      if (data.about || data.team) applyAboutPage(data.about || {}, data.team || []);
      if (data.hero) applyHero(data.hero);
      if (data.stats && data.stats.length) applyStats(data.stats);
      if (data.featuresHeader) applyFeaturesHeader(data.featuresHeader);
      if (data.howitworks && data.howitworks.length) applyHowItWorks(data.howitworks);
      if (data.earlyAccess) applyEarlyAccess(data.earlyAccess);
      if (data.footerTagline) applyFooterTagline(data.footerTagline);
    } catch (e) {
      console.warn('[PaperBook CMS]', e);
    }
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function field(name) {
    return document.querySelector('[data-cms-field="' + name + '"]');
  }
  function section(name) {
    return document.querySelector('[data-cms-section="' + name + '"]');
  }
  function setText(name, text) {
    var el = field(name);
    if (el && text) el.textContent = text;
  }
  function setHref(name, url) {
    var el = field(name);
    if (el && url) el.href = url;
  }
  function setEmailField(name, email) {
    var el = field(name);
    if (el && email) { el.textContent = email; el.href = 'mailto:' + email; }
  }
  function setMeta(nameOrProp, val, isOg) {
    if (!val) return;
    var sel = isOg
      ? 'meta[property="' + nameOrProp + '"]'
      : 'meta[name="' + nameOrProp + '"]';
    var el = document.querySelector(sel);
    if (el) el.setAttribute('content', val);
  }

  // ─── Contact Info ────────────────────────────────────────────────────────────

  function applyContactInfo(contact, social) {
    if (contact.email)        setEmailField('contact-email', contact.email);
    if (contact.supportEmail) setEmailField('contact-support-email', contact.supportEmail);
    if (contact.email)        setEmailField('contact-phone-email', contact.email);
    if (contact.hours)        setText('contact-hours', contact.hours);
    if (contact.address) {
      var addrEl = field('contact-address');
      if (addrEl) addrEl.innerHTML = contact.address.replace(/\n/g, '<br>');
    }
    // Map pin
    if (contact.mapLat && contact.mapLng) {
      var mapDiv = section('contact-map');
      if (mapDiv) {
        mapDiv.style.display = 'block';
        mapDiv.innerHTML = '<iframe src="https://maps.google.com/maps?q=' +
          encodeURIComponent(contact.mapLat) + ',' + encodeURIComponent(contact.mapLng) +
          '&z=15&output=embed" width="100%" height="200" style="border:0;" loading="lazy" title="Office location"></iframe>';
      }
    }
    // Social links
    var socials = { 'social-twitter': social.twitter, 'social-linkedin': social.linkedin,
                    'social-youtube': social.youtube, 'social-instagram': social.instagram,
                    'social-facebook': social.facebook };
    Object.keys(socials).forEach(function (key) {
      if (socials[key]) setHref(key, socials[key]);
    });
  }

  // ─── Integrations Grid ───────────────────────────────────────────────────────

  // SVG icons for known integration slugs
  var INTEGRATION_ICONS = {
    'razorpay': '<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="14" width="32" height="20" rx="3" stroke="#2563eb" stroke-width="2"/><path d="M8 20h32" stroke="#2563eb" stroke-width="2"/><rect x="12" y="26" width="8" height="4" rx="1" fill="#2563eb"/></svg>',
    'cashfree': '<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="14" stroke="#22c55e" stroke-width="2"/><path d="M24 16v8l6 4" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/><path d="M18 28l3-3 3 3 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'whatsapp': '<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M34 28c0 1.1-.9 2-2 2H16l-4 4V16c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v12z" stroke="#25d366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 22h8M20 26h5" stroke="#25d366" stroke-width="2" stroke-linecap="round"/></svg>',
    'sms-gateway': '<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="10" y="14" width="28" height="20" rx="2" stroke="#f59e0b" stroke-width="2"/><path d="M10 18l14 10 14-10" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'google-workspace': '<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M30 14H18a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V16a2 2 0 00-2-2z" stroke="#ea4335" stroke-width="2"/><path d="M22 14v20M16 22h16M16 30h16" stroke="#ea4335" stroke-width="2"/><circle cx="19" cy="18" r="1.5" fill="#4285f4"/><circle cx="25" cy="18" r="1.5" fill="#34a853"/><circle cx="19" cy="26" r="1.5" fill="#fbbc04"/><circle cx="25" cy="26" r="1.5" fill="#ea4335"/></svg>',
    'tally-zoho': '<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="12" y="12" width="24" height="24" rx="4" stroke="#6d28d9" stroke-width="2"/><path d="M20 20v8M24 18v10M28 22v6" stroke="#6d28d9" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  function letterIcon(name, bg, color) {
    return '<div style="width:48px;height:48px;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:' + color + ';">' + (name || '?')[0].toUpperCase() + '</div>';
  }

  function applyIntegrations(items) {
    var container = section('integrations-grid');
    if (!container) return;
    var active = items.filter(function (i) { return i.isActive !== false; });
    if (!active.length) return;
    container.innerHTML = active.map(function (item) {
      var icon = item.logoUrl
        ? '<img src="' + item.logoUrl + '" alt="' + item.name + '" style="width:48px;height:48px;object-fit:contain;">'
        : (INTEGRATION_ICONS[item.slug] || letterIcon(item.name, item.iconBg || '#f3f4f6', item.iconColor || '#374151'));
      return '<div class="integration-card">' +
        '<div class="integration-icon" style="background:' + (item.iconBg || '#f3f4f6') + ';">' + icon + '</div>' +
        '<h4>' + escHtml(item.name) + '</h4>' +
        '<p>' + escHtml(item.description) + '</p>' +
        '</div>';
    }).join('');
  }

  // ─── Pricing Cards ───────────────────────────────────────────────────────────

  function applyPricing(plans) {
    var container = section('pricing-grid');
    if (!container) return;
    container.innerHTML = plans.map(function (plan) {
      var isFeatured = plan.badge && (plan.badge.toLowerCase().includes('popular') || plan.badge.toLowerCase().includes('recommended'));
      var priceHtml = plan.isCustom
        ? '<div class="price-amount"><span class="price-custom">Custom</span></div>'
        : '<div class="price-amount">' +
            '<span class="price-monthly">₹' + formatNum(plan.monthlyPrice) + '<span>/mo</span></span>' +
            '<span class="price-yearly" style="display:none;">₹' + formatNum(plan.yearlyPrice) + '<span>/mo</span></span>' +
          '</div>';
      var features = Array.isArray(plan.features) ? plan.features : [];
      var featuresHtml = features.slice(0, 8).map(function (f) {
        var label = typeof f === 'string' ? f : (f.name || f.id || String(f));
        return '<li><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#22c55e" stroke-width="1.5"/><path d="M5.5 9l2.5 2.5L12.5 7" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' + escHtml(label) + '</li>';
      }).join('');
      return '<div class="price-card' + (isFeatured ? ' featured' : '') + '">' +
        (plan.badge ? '<div class="price-badge">' + escHtml(plan.badge) + '</div>' : '') +
        '<h3>' + escHtml(plan.name) + '</h3>' +
        (plan.description ? '<p class="plan-desc">' + escHtml(plan.description) + '</p>' : '') +
        priceHtml +
        (plan.maxStudents ? '<p class="plan-students">Up to ' + formatNum(plan.maxStudents) + ' students</p>' : '<p class="plan-students">Unlimited students</p>') +
        '<ul class="plan-features">' + featuresHtml + '</ul>' +
        '<a href="' + escHtml(plan.ctaLink || '/signup.html') + '" class="btn ' + (isFeatured ? 'btn-primary' : 'btn-outline') + ' btn-full">' + escHtml(plan.ctaText || 'Get Started') + '</a>' +
        '</div>';
    }).join('');
    // Re-init pricing toggle
    if (typeof window.initPricingToggle === 'function') window.initPricingToggle();
  }

  // ─── Addons Section ──────────────────────────────────────────────────────────

  function applyAddons(items) {
    var container = section('addons-section');
    if (!container) return;
    // Group by category
    var categories = [];
    var byCategory = {};
    items.forEach(function (item) {
      if (item.isActive === false) return;
      var cat = item.category || 'other';
      if (!byCategory[cat]) { categories.push(cat); byCategory[cat] = []; }
      byCategory[cat].push(item);
    });
    if (!categories.length) return;

    var catLabels = {
      'communication': 'Communication', 'hardware': 'Hardware / Biometric',
      'academic': 'Academic', 'operational': 'Operational',
      'hr-finance': 'HR & Finance', 'customization': 'Customization',
      'support': 'Support', 'scaling': 'Scaling', 'other': 'Other'
    };

    var tabsHtml = '<div class="addon-tabs">' +
      categories.map(function (cat, i) {
        return '<button class="addon-tab' + (i === 0 ? ' active' : '') + '" data-category="' + cat + '">' + (catLabels[cat] || cat) + '</button>';
      }).join('') + '</div>';

    var panelsHtml = categories.map(function (cat, i) {
      var cards = byCategory[cat].map(function (item) {
        return '<div class="addon-card">' +
          (item.badge ? '<span class="addon-badge">' + escHtml(item.badge) + '</span>' : '') +
          '<div class="addon-header"><strong>' + escHtml(item.name) + '</strong>' +
          (item.price ? '<span class="addon-price">&#8377;' + formatNum(item.price) + (item.priceNote ? escHtml(item.priceNote) : '') + '</span>' : '') +
          '</div>' +
          '<p>' + escHtml(item.description || '') + '</p>' +
          '</div>';
      }).join('');
      return '<div class="addons-tab-content' + (i === 0 ? ' active' : '') + '" data-category="' + cat + '">' +
        '<div class="addons-grid">' + cards + '</div></div>';
    }).join('');

    container.innerHTML = tabsHtml + panelsHtml;
    // Re-init addon tabs
    if (typeof window.initAddonTabs === 'function') window.initAddonTabs();
  }

  // ─── Meta Tags ───────────────────────────────────────────────────────────────

  function applyMetaTags(seo) {
    if (seo.homeTitle) document.title = seo.homeTitle;
    setMeta('description', seo.homeDescription || seo.homeTitle);
    setMeta('og:title', seo.homeTitle, true);
    setMeta('og:description', seo.homeDescription, true);
    setMeta('og:image', seo.ogImage, true);
    setMeta('twitter:title', seo.homeTitle);
    setMeta('twitter:description', seo.homeDescription);
    setMeta('twitter:image', seo.ogImage);
    // Keywords
    if (seo.keywords) {
      var kw = document.querySelector('meta[name="keywords"]');
      if (kw) kw.setAttribute('content', seo.keywords);
    }
  }

  // ─── About Page ──────────────────────────────────────────────────────────────

  function applyAboutPage(about, team) {
    // About story description
    if (about.description) {
      var storyEl = section('about-story');
      if (storyEl) {
        // Only replace the first <p> text if present, don't nuke the whole section
        var firstP = storyEl.querySelector('p');
        if (firstP) firstP.textContent = about.description;
      }
    }
    // Mission / vision
    if (about.mission) setText('about-mission', about.mission);
    if (about.vision)  setText('about-vision',  about.vision);
    // About meta tags
    if (about.description) setMeta('description', about.description.substring(0, 160));
    // Team grid
    if (team && team.length) {
      var teamGrid = section('team-grid');
      if (teamGrid) {
        teamGrid.innerHTML = team.map(function (member) {
          return '<div class="team-card">' +
            (member.photoUrl
              ? '<img src="' + member.photoUrl + '" alt="' + escHtml(member.name) + '" class="team-photo">'
              : '<div class="team-avatar">' + (member.name || '?')[0] + '</div>') +
            '<h3 class="team-name">' + escHtml(member.name) + '</h3>' +
            '<p class="team-role">' + escHtml(member.role || '') + '</p>' +
            (member.bio ? '<p class="team-bio">' + escHtml(member.bio) + '</p>' : '') +
            '<div class="team-links">' +
              (member.linkedin ? '<a href="' + member.linkedin + '" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>' : '') +
              (member.twitter ? '<a href="' + member.twitter + '" target="_blank" rel="noopener" aria-label="Twitter">𝕏</a>' : '') +
            '</div></div>';
        }).join('');
      }
    }
  }

  // ─── Hero Section ────────────────────────────────────────────────────────────

  function applyHero(h) {
    var badge = document.querySelector('.hero-badge');
    if (badge && h.badge) badge.textContent = h.badge;

    var h1 = document.querySelector('.hero-content h1');
    if (h1 && h.h1Prefix) {
      h1.innerHTML = escHtml(h.h1Prefix) + ' <span>' + escHtml(h.h1Highlight || '') + '</span>';
    }

    var sub = document.querySelector('.hero-content > p');
    if (sub && h.subheadline) sub.textContent = h.subheadline;

    var cta1 = document.querySelector('.hero-actions .btn-primary');
    if (cta1) {
      if (h.cta1Text) cta1.textContent = h.cta1Text;
      if (h.cta1Link) cta1.href = h.cta1Link;
    }
    var cta2 = document.querySelector('.hero-actions .btn-outline');
    if (cta2) {
      if (h.cta2Text) cta2.textContent = h.cta2Text;
      if (h.cta2Link) cta2.href = h.cta2Link;
    }
  }

  // ─── Stats Strip ─────────────────────────────────────────────────────────────

  function applyStats(items) {
    var els = document.querySelectorAll('.stat-item');
    items.forEach(function (s, i) {
      if (!els[i]) return;
      var eyebrow = els[i].querySelector('.stat-eyebrow');
      var num     = els[i].querySelector('h3');
      var desc    = els[i].querySelector('p');
      if (eyebrow && s.eyebrow) eyebrow.textContent = s.eyebrow;
      if (num) num.innerHTML = escHtml(s.number) + (s.unit ? '<span class="stat-unit"> ' + escHtml(s.unit) + '</span>' : '');
      if (desc && s.description) desc.textContent = s.description;
    });
  }

  // ─── Features Section Header ──────────────────────────────────────────────────

  function applyFeaturesHeader(fh) {
    var label = document.querySelector('#features .section-label');
    var title = document.querySelector('#features .section-title');
    var sub   = document.querySelector('#features .section-subtitle');
    var badge = document.querySelector('.module-count-badge span');
    if (label && fh.label)    label.textContent = fh.label;
    if (title && fh.title)    title.textContent = fh.title;
    if (sub   && fh.subtitle) sub.textContent   = fh.subtitle;
    if (badge && fh.badgeText) badge.textContent = fh.badgeText;
  }

  // ─── How It Works Steps ───────────────────────────────────────────────────────

  function applyHowItWorks(steps) {
    var els = document.querySelectorAll('#how-it-works .step-item');
    steps.forEach(function (s, i) {
      if (!els[i]) return;
      var t = els[i].querySelector('h3');
      var d = els[i].querySelector('p');
      if (t && s.title)       t.textContent = s.title;
      if (d && s.description) d.textContent = s.description;
    });
  }

  // ─── Early Access Section ─────────────────────────────────────────────────────

  function applyEarlyAccess(ea) {
    var label = document.querySelector('#early-access .section-label');
    var title = document.querySelector('#early-access .section-title');
    var sub   = document.querySelector('#early-access .section-subtitle');
    var cta   = document.querySelector('#early-access .ea-cta');
    if (label && ea.label)    label.textContent = ea.label;
    if (title && ea.title)    title.textContent = ea.title;
    if (sub   && ea.subtitle) sub.textContent   = ea.subtitle;
    if (cta) {
      if (ea.ctaText) cta.textContent = ea.ctaText;
      if (ea.ctaLink) cta.href = ea.ctaLink;
    }
    if (ea.cards && ea.cards.length) {
      var cards = document.querySelectorAll('#early-access .ea-card');
      ea.cards.forEach(function (c, i) {
        if (!cards[i]) return;
        var icon = cards[i].querySelector('.ea-icon');
        var t    = cards[i].querySelector('h3');
        var d    = cards[i].querySelector('p');
        if (icon && c.icon)        icon.textContent = c.icon;
        if (t    && c.title)       t.textContent    = c.title;
        if (d    && c.description) d.textContent    = c.description;
      });
    }
  }

  // ─── Footer Tagline ───────────────────────────────────────────────────────────

  function applyFooterTagline(tagline) {
    var el = document.querySelector('.footer-tagline');
    if (el) el.textContent = tagline;
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function formatNum(n) {
    if (!n && n !== 0) return '';
    return Number(n).toLocaleString('en-IN');
  }

})();
