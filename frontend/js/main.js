/* ==========================================================================
   AZAN CAPTURE ZONE - MAIN JAVASCRIPT  (Enhanced Edition)
   --------------------------------------------------------------------------
   Presentation layer only. It never touches forms, links, URLs, data or any
   backend behaviour. The original behaviours are preserved:
     - mobile menu toggle (+ closes when a link is clicked)
     - header shadow after scrolling
   New, purely visual additions:
     - scroll progress bar, back-to-top button
     - scroll-reveal with "focus pull" images
     - hero bokeh lights + scroll cue
     - count-up statistics
     - card spotlight + soft cursor glow (mouse devices only)
   Every motion effect respects prefers-reduced-motion.
   ========================================================================== */

(() => {
  'use strict';

  const onReady = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn)
      : fn();

  onReady(() => {
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const scrollBehavior = prefersReduced ? 'auto' : 'smooth';

    /* ----------------------------------------------------------------------
       1. MOBILE MENU  (original behaviour + accessibility state)
       ---------------------------------------------------------------------- */
    const menuToggle = $('.menu-toggle');
    const navLinks = $('.nav-links');

    if (menuToggle && navLinks) {
      const icon = menuToggle.querySelector('i');

      const setMenu = (open) => {
        navLinks.classList.toggle('active', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        if (icon) {
          icon.classList.toggle('fa-bars', !open);
          icon.classList.toggle('fa-times', open);
        }
      };

      menuToggle.setAttribute('aria-expanded', 'false');

      menuToggle.addEventListener('click', () => {
        setMenu(!navLinks.classList.contains('active'));
      });

      // Close mobile menu when clicking a link
      $$('a', navLinks).forEach((link) => {
        link.addEventListener('click', () => setMenu(false));
      });

      // Close on Escape or when clicking outside the header
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) setMenu(false);
      });
      document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && !e.target.closest('header')) setMenu(false);
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth > 1180) setMenu(false);
      });
    }

    /* ----------------------------------------------------------------------
       2. SCROLL STATE: header, progress bar, back-to-top
       ---------------------------------------------------------------------- */
    const header = $('header');

    const progress = document.createElement('div');
    progress.id = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    const toTop = document.createElement('button');
    toTop.type = 'button';
    toTop.className = 'to-top';
    toTop.setAttribute('aria-label', 'Back to top');
    toTop.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior }));
    document.body.appendChild(toTop);

    let scrollTicking = false;
    const updateScrollState = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (header) header.classList.toggle('scrolled', y > 50);
      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      toTop.classList.toggle('show', y > 700);
      scrollTicking = false;
    };
    const requestScrollUpdate = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(updateScrollState);
    };
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate);
    updateScrollState();

    /* ----------------------------------------------------------------------
       3. HERO: bokeh lights + scroll cue
       ---------------------------------------------------------------------- */
    const hero = $('.hero');

    if (hero) {
      if (!prefersReduced) {
        const rand = (min, max) => Math.random() * (max - min) + min;
        const wrap = document.createElement('div');
        wrap.className = 'bokeh';
        wrap.setAttribute('aria-hidden', 'true');

        const count = window.innerWidth < 700 ? 9 : 18;
        for (let i = 0; i < count; i++) {
          const dot = document.createElement('span');
          const ruby = Math.random() < 0.3;
          const size = rand(22, 96);
          dot.style.setProperty('--s', `${size.toFixed(0)}px`);
          dot.style.setProperty('--x', `${rand(0, 96).toFixed(1)}%`);
          dot.style.setProperty('--y', `${rand(35, 98).toFixed(1)}%`);
          dot.style.setProperty('--dur', `${rand(9, 18).toFixed(1)}s`);
          dot.style.setProperty('--delay', `${rand(0, 10).toFixed(1)}s`);
          dot.style.setProperty('--dx', `${rand(-50, 50).toFixed(0)}px`);
          dot.style.setProperty('--o', rand(0.25, 0.6).toFixed(2));
          dot.style.setProperty('--b', `${size > 60 ? 3 : 1}px`);
          dot.style.setProperty('--tint', ruby ? 'rgba(190, 50, 95, 0.45)' : 'rgba(216, 180, 94, 0.5)');
          wrap.appendChild(dot);
        }
        hero.insertBefore(wrap, hero.firstChild);

        // Pause the lights when the hero is off screen
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(([entry]) => {
            hero.classList.toggle('is-offscreen', !entry.isIntersecting);
          }).observe(hero);
        }
      }

      const cue = document.createElement('button');
      cue.type = 'button';
      cue.className = 'scroll-cue';
      cue.setAttribute('aria-label', 'Scroll to content');
      cue.innerHTML = '<span></span>';
      cue.addEventListener('click', () => {
        const next = hero.nextElementSibling;
        if (next) next.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      });
      hero.appendChild(cue);
    }

    /* ----------------------------------------------------------------------
       4. SCROLL REVEAL  (images come into focus as they enter view)
       ---------------------------------------------------------------------- */
    const revealSelectors = [
      '.section-header',
      '.filter-buttons',
      '.card',
      '.package-card',
      '.review-card',
      '.video-card',
      '.contact-card',
      '.about-image',
      '.about-text',
      '.stat-box',
      '.footer-content',
      '.article-meta',
      '.article-title',
      '.article-hero-img',
      '.article-content > *'
    ].join(',');

    const canObserve = 'IntersectionObserver' in window;

    if (!prefersReduced && canObserve) {
      const targets = $$(revealSelectors).filter((el) => !el.closest('.hero'));
      const perParent = new Map();

      targets.forEach((el) => {
        const index = perParent.get(el.parentElement) || 0;
        perParent.set(el.parentElement, index + 1);
        el.style.setProperty('--d', `${Math.min(index, 5) * 90}ms`);
        el.classList.add('reveal');
      });

      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            revealObserver.unobserve(el);
            el.classList.add('in-view');

            // Remove the helper classes after the entrance so normal
            // hover transitions take over without any leftover delay.
            const delay = parseInt(el.style.getPropertyValue('--d'), 10) || 0;
            window.setTimeout(() => {
              el.classList.remove('reveal', 'in-view');
              el.style.removeProperty('--d');
            }, 1600 + delay);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );

      targets.forEach((el) => revealObserver.observe(el));
    }

    /* ----------------------------------------------------------------------
       5. COUNT-UP STATISTICS  (final text is always the original value)
       ---------------------------------------------------------------------- */
    const statValues = $$('.stat-box h3');

    if (statValues.length && !prefersReduced && canObserve) {
      const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

      const countUp = (el) => {
        const original = el.textContent.trim();
        const match = original.match(/^(\d+)(.*)$/);
        if (!match) return;

        const target = parseInt(match[1], 10);
        const suffix = match[2];
        const duration = 1800;
        const start = performance.now();

        const step = (now) => {
          const t = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(target * easeOutExpo(t)) + suffix;
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = original;
        };
        el.textContent = '0' + suffix;
        requestAnimationFrame(step);
      };

      const statObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            statObserver.unobserve(entry.target);
            countUp(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      statValues.forEach((el) => statObserver.observe(el));
    }

    /* ----------------------------------------------------------------------
       6. POINTER EFFECTS  (mouse devices only)
       ---------------------------------------------------------------------- */
    if (finePointer) {
      // Card spotlight: tell CSS where the pointer is inside the hovered card
      const spotlightSelector = '.card, .package-card, .review-card, .video-card, .contact-card';
      document.addEventListener(
        'pointermove',
        (e) => {
          const card = e.target.closest && e.target.closest(spotlightSelector);
          if (!card) return;
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        },
        { passive: true }
      );

      // Soft golden light that trails the cursor
      if (!prefersReduced) {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.setAttribute('aria-hidden', 'true');
        document.body.appendChild(glow);

        let targetX = 0;
        let targetY = 0;
        let x = 0;
        let y = 0;
        let running = false;

        const tick = () => {
          x += (targetX - x) * 0.14;
          y += (targetY - y) * 0.14;
          glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;

          if (Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5) {
            requestAnimationFrame(tick);
          } else {
            running = false;
          }
        };

        window.addEventListener(
          'pointermove',
          (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!glow.classList.contains('on')) {
              x = targetX;
              y = targetY;
              glow.classList.add('on');
            }
            if (!running) {
              running = true;
              requestAnimationFrame(tick);
            }
          },
          { passive: true }
        );
        document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('on'));
      }
    }
  });
})();