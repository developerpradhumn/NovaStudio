/* scripts.js — vanilla JS for interactions:
   - theme toggle (dark / light)
   - mobile nav toggle
   - reveal-on-scroll (IntersectionObserver)
   - animated counters
   - portfolio filtering
   - active nav link on scroll
   - contact form UI (no backend)
*/

(() => {
    const html = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.getElementById('mobile-toggle');
    const nav = document.getElementById('nav');
    const yearEl = document.getElementById('year');

    // Initialize year
    yearEl.textContent = new Date().getFullYear();

    // Theme: remember user preference in localStorage
    const getSavedTheme = () => localStorage.getItem('site-theme') || null;
    const applyTheme = theme => {
        if (theme === 'light') html.setAttribute('data-theme', 'light');
        else html.setAttribute('data-theme', 'dark');
    };
    const initialTheme = getSavedTheme() || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem('site-theme', next);
        // small pulse animation
        themeToggle.animate([{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }], { duration: 280 });
    });

    // Mobile nav toggle
    mobileToggle.addEventListener('click', () => {
        const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', String(!expanded));
        nav.style.display = expanded ? '' : 'block';
    });

    // Smooth reveal on scroll
    const revealEls = document.querySelectorAll('.reveal, [data-aos]');
    const ioOptions = { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // animate counters inside
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(animateCounter);
                // unobserve to improve performance
                revealObserver.unobserve(entry.target);
            }
        });
    }, ioOptions);
    revealEls.forEach(el => revealObserver.observe(el));

    // Animated counters — simple incremental animation
    function animateCounter(el) {
        if (el.dataset.animated) return;
        el.dataset.animated = true;
        const target = +el.getAttribute('data-target') || 0;
        const duration = 1400;
        const start = performance.now();
        const initial = 0;
        function step(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // quick ease
            const value = Math.floor(initial + (target - initial) * eased);
            el.textContent = value;
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = target;
        }
        requestAnimationFrame(step);
    }

    // Portfolio filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioGrid = document.getElementById('portfolio-grid');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            const items = portfolioGrid.querySelectorAll('.portfolio-item');
            items.forEach(item => {
                const cat = item.getAttribute('data-category');
                if (filter === '*' || cat === filter) {
                    item.style.display = '';
                    requestAnimationFrame(() => item.classList.add('visible'));
                } else {
                    item.style.display = 'none';
                    item.classList.remove('visible');
                }
            });
        });
    });

    // Active nav link on scroll
    const sections = Array.from(document.querySelectorAll('main .section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => sectionObserver.observe(s));

    // Smooth scroll for header links (native behavior already supports, but ensure offset for sticky header)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').slice(1);
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;
            e.preventDefault();
            const headerOffset = document.getElementById('header').offsetHeight + 8;
            const rect = targetEl.getBoundingClientRect();
            const top = window.scrollY + rect.top - headerOffset;
            window.scrollTo({ top, behavior: 'smooth' });
            // close mobile nav if open
            if (mobileToggle.getAttribute('aria-expanded') === 'true') {
                mobileToggle.click();
            }
        });
    });

    // Contact form: simple front-end validation + feedback
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // simple validation
            const fm = new FormData(contactForm);
            const name = fm.get('name'), email = fm.get('email'), message = fm.get('message');
            if (!name || !email || !message) {
                alert('Please fill in name, email and message.');
                return;
            }
            // fake send — show micro-interaction
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            const original = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            setTimeout(() => {
                submitBtn.textContent = 'Message sent ✓';
                submitBtn.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 420 });
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = original;
                    contactForm.reset();
                }, 1400);
            }, 900);
        });
    }

    // Accessibility improvements: keyboard focus styles
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') document.body.classList.add('user-is-tabbing');
    });

    // Tiny parallax for glass cards (pointer move)
    const hero = document.querySelector('.hero-media');
    if (hero) {
        hero.addEventListener('pointermove', (e) => {
            const rect = hero.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / rect.width;
            const dy = (e.clientY - cy) / rect.height;
            const cards = hero.querySelectorAll('.card');
            cards.forEach((c, i) => {
                const depth = (i + 1) * 6;
                c.style.transform = `translate3d(${dx * depth}px, ${dy * depth}px, 0) rotate(${(i - 1) * 2}deg)`;
            });
        });
        hero.addEventListener('pointerleave', () => {
            hero.querySelectorAll('.card').forEach((c, i) => {
                c.style.transform = '';
            });
        });
    }

    // performance: reduce observer usage when tab not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            revealObserver.disconnect();
            sectionObserver.disconnect();
        } else {
            // re-init (simple approach)
            revealEls.forEach(el => revealObserver.observe(el));
            sections.forEach(s => sectionObserver.observe(s));
        }
    });

})();