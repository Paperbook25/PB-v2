// ===========================================
// Mobile Menu Toggle
// ===========================================
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
  const menuIcon = menuBtn.querySelector('.menu-icon');
  const closeIcon = menuBtn.querySelector('.close-icon');

  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    if (menuIcon) menuIcon.style.display = open ? 'none' : 'block';
    if (closeIcon) closeIcon.style.display = open ? 'block' : 'none';
  });

  // Close mobile menu on link click (but not dropdown triggers)
  mobileMenu.querySelectorAll('a:not(.mobile-dropdown-trigger)').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      if (menuIcon) menuIcon.style.display = 'block';
      if (closeIcon) closeIcon.style.display = 'none';
    });
  });
}

// Mobile dropdown toggles
document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdown = trigger.parentElement;
    // Close other dropdowns
    document.querySelectorAll('.mobile-dropdown.open').forEach(d => {
      if (d !== dropdown) d.classList.remove('open');
    });
    dropdown.classList.toggle('open');
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href && href !== '#') {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Navbar background on scroll
const nav = document.getElementById('navbar');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// Scroll reveal with IntersectionObserver
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Animated stat counter
const statsSection = document.querySelector('.stats');
if (statsSection) {
  let statsCounted = false;
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        const items = statsSection.querySelectorAll('.stat-item h3');
        items.forEach(el => {
          const original = el.textContent;
          const numMatch = original.replace(/,/g, '').match(/[\d.]+/);
          if (!numMatch) return;
          const target = parseFloat(numMatch[0]);
          const isFloat = original.includes('.') && !original.includes('/');
          const hasSlash = original.includes('/');
          const duration = 1600;
          const start = performance.now();
          const step = now => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;
            if (hasSlash) {
              el.textContent = current.toFixed(1) + '/5';
            } else if (isFloat) {
              el.textContent = current.toFixed(1) + '%';
            } else if (target >= 100000) {
              el.textContent = Math.floor(current).toLocaleString('en-IN') + '+';
            } else {
              el.textContent = Math.floor(current).toLocaleString('en-IN') + '+';
            }
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = original;
            }
          };
          el.textContent = hasSlash ? '0.0/5' : isFloat ? '0.0%' : '0+';
          requestAnimationFrame(step);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statsObserver.observe(statsSection);
}

// ===========================================
// Module Tabs Component
// ===========================================
class ModuleTabs {
  constructor(container) {
    this.container = container;
    if (!this.container) return;

    this.primaryTabs = this.container.querySelectorAll('.tab-btn');
    this.tabPanels = this.container.querySelectorAll('.tab-panel');

    if (this.primaryTabs.length === 0 || this.tabPanels.length === 0) {
      console.warn('ModuleTabs: No tabs or panels found');
      return;
    }

    this.init();
  }

  init() {
    // Bind primary tab clicks
    this.primaryTabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.handleTabClick(e));
    });

    // Initialize subtabs within each panel
    this.tabPanels.forEach(panel => {
      const subtabs = panel.querySelectorAll('.subtab-btn');
      subtabs.forEach(subtab => {
        subtab.addEventListener('click', (e) => this.handleSubtabClick(e, panel));
      });
    });

    // Handle initial URL state
    this.handleUrlState();

    // Listen for browser back/forward
    window.addEventListener('popstate', () => this.handleUrlState());
  }

  handleTabClick(e) {
    const clickedTab = e.currentTarget;
    const tabId = clickedTab.dataset.tab;

    // Update active tab
    this.primaryTabs.forEach(tab => {
      tab.classList.toggle('active', tab === clickedTab);
      tab.setAttribute('aria-selected', tab === clickedTab);
    });

    // Update active panel
    this.tabPanels.forEach(panel => {
      const isActive = panel.dataset.panel === tabId;
      panel.classList.toggle('active', isActive);
      panel.setAttribute('aria-hidden', !isActive);
    });

    // Update URL
    this.updateUrl(tabId, null);

    // Activate first subtab in new panel
    const activePanel = this.container.querySelector(`.tab-panel[data-panel="${tabId}"]`);
    if (activePanel) {
      const firstSubtab = activePanel.querySelector('.subtab-btn');
      if (firstSubtab) {
        this.activateSubtab(firstSubtab, activePanel);
      }
    }
  }

  handleSubtabClick(e, panel) {
    const clickedSubtab = e.currentTarget;
    this.activateSubtab(clickedSubtab, panel);

    // Update URL with subtab
    const activeTab = this.container.querySelector('.tab-btn.active');
    const tabId = activeTab ? activeTab.dataset.tab : null;
    const subtabId = clickedSubtab.dataset.subtab;
    this.updateUrl(tabId, subtabId);
  }

  activateSubtab(subtab, panel) {
    const subtabId = subtab.dataset.subtab;
    const subtabs = panel.querySelectorAll('.subtab-btn');
    const subtabPanels = panel.querySelectorAll('.subtab-panel');

    // Update active subtab
    subtabs.forEach(st => {
      st.classList.toggle('active', st === subtab);
      st.setAttribute('aria-selected', st === subtab);
    });

    // Update active subtab panel
    subtabPanels.forEach(sp => {
      const isActive = sp.dataset.subtabPanel === subtabId;
      sp.classList.toggle('active', isActive);
      sp.setAttribute('aria-hidden', !isActive);
    });
  }

  updateUrl(tabId, subtabId) {
    const url = new URL(window.location);
    if (tabId) {
      url.searchParams.set('tab', tabId);
    } else {
      url.searchParams.delete('tab');
    }
    if (subtabId) {
      url.searchParams.set('subtab', subtabId);
    } else {
      url.searchParams.delete('subtab');
    }
    window.history.pushState({}, '', url);
  }

  handleUrlState() {
    const params = new URLSearchParams(window.location.search);
    const tabId = params.get('tab');
    const subtabId = params.get('subtab');

    // Activate tab from URL or default to first
    if (tabId) {
      const targetTab = this.container.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      if (targetTab) {
        targetTab.click();
      }
    } else {
      const firstTab = this.primaryTabs[0];
      if (firstTab && !firstTab.classList.contains('active')) {
        firstTab.click();
      }
    }

    // Activate subtab from URL
    if (subtabId) {
      const activePanel = this.container.querySelector('.tab-panel.active');
      if (activePanel) {
        const targetSubtab = activePanel.querySelector(`.subtab-btn[data-subtab="${subtabId}"]`);
        if (targetSubtab) {
          this.activateSubtab(targetSubtab, activePanel);
        }
      }
    }
  }
}

// Initialize ModuleTabs on pages that have it
const moduleTabsContainer = document.querySelector('.module-tabs-section');
if (moduleTabsContainer) {
  new ModuleTabs(moduleTabsContainer);
}

// ===========================================
// Pricing Toggle (Monthly/Yearly)
// ===========================================
window.initPricingToggle = function() {
  const pricingToggle = document.getElementById('pricing-toggle');
  if (pricingToggle) {
    const toggleLabels = document.querySelectorAll('.toggle-label');

    // Set initial state
    if (toggleLabels[0]) toggleLabels[0].classList.add('active');

    pricingToggle.addEventListener('change', () => {
      const isYearly = pricingToggle.checked;

      // Update toggle labels
      toggleLabels.forEach((label, index) => {
        if (isYearly) {
          label.classList.toggle('active', index === 1);
        } else {
          label.classList.toggle('active', index === 0);
        }
      });

      // Re-query DOM each time to include dynamically loaded pricing cards
      const monthlyPrices = document.querySelectorAll('.price-monthly');
      const yearlyPrices = document.querySelectorAll('.price-yearly');
      const monthlyPeriods = document.querySelectorAll('.period-monthly');
      const yearlyPeriods = document.querySelectorAll('.period-yearly');

      // Toggle price display
      monthlyPrices.forEach(el => el.style.display = isYearly ? 'none' : 'inline');
      yearlyPrices.forEach(el => el.style.display = isYearly ? 'inline' : 'none');
      monthlyPeriods.forEach(el => el.style.display = isYearly ? 'none' : 'inline');
      yearlyPeriods.forEach(el => el.style.display = isYearly ? 'inline' : 'none');
    });
  }
};
window.initPricingToggle();

// ===========================================
// Add-Ons Category Tabs
// ===========================================
window.initAddonTabs = function() {
  const addonTabs = document.querySelectorAll('.addon-tab');
  const addonContents = document.querySelectorAll('.addons-tab-content');

  if (addonTabs.length > 0) {
    addonTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.category;

        // Update active tab
        addonTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active content
        addonContents.forEach(content => {
          content.classList.toggle('active', content.dataset.category === category);
        });
      });
    });
  }
};
window.initAddonTabs();
