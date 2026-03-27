/* ============================
   LA LYRE BRIARD - JavaScript
   ============================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Header scroll effect ---
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // --- Mobile menu ---
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('open');
            document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu on link click
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                nav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Scroll reveal animations ---
    const revealElements = document.querySelectorAll(
        '.section-header, .about-grid, .stat-item, .prestation-card, .news-card, ' +
        '.join-content, .timeline-item, .instrument-card, .info-box, .contact-item, .contact-form'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Active nav link based on current page ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // --- Audio Player ---
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');

    if (audio && playBtn) {
        // Set initial volume
        audio.volume = 0.8;

        // Play/Pause
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playIcon.className = 'fas fa-pause';
            } else {
                audio.pause();
                playIcon.className = 'fas fa-play';
            }
        });

        // Format time
        function formatTime(s) {
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return m + ':' + (sec < 10 ? '0' : '') + sec;
        }

        // Update progress
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const pct = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = pct + '%';
                currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        });

        // Duration loaded
        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(audio.duration);
        });

        // Click on progress bar to seek
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pct * audio.duration;
        });

        // Volume
        volumeSlider.addEventListener('input', () => {
            audio.volume = volumeSlider.value;
            volumeIcon.className = audio.volume == 0 ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        });

        // Reset on end
        audio.addEventListener('ended', () => {
            playIcon.className = 'fas fa-play';
            progressFill.style.width = '0%';
            currentTimeEl.textContent = '0:00';
        });
    }

    // --- Contact form handler ---
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Message envoy\u00e9 !';
            btn.style.background = '#27ae60';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
                form.reset();
            }, 3000);
        });
    }

});
