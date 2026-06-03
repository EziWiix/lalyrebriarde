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

    // --- Audio Player (playlist) ---
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prevTrack');
    const nextBtn = document.getElementById('nextTrack');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');
    const trackTitle = document.getElementById('trackTitle');
    const playlistEl = document.getElementById('playlist');

    const tracks = [
        { title: 'The Witch and the Saint', src: 'audio/the-witch-and-the-saint.mp3' },
        { title: "Dans les yeux d'Émilie", src: 'audio/dans-les-yeux-demilie.mp3' },
        { title: 'France Gall', src: 'audio/france-gall.mp3' },
        { title: 'Forrest Gump', src: 'audio/forrest-gump.mp3' },
        { title: 'A Klezmer Karnival', src: 'audio/a-klezmer-karnival.mp3' }
    ];

    if (audio && playBtn && playlistEl) {
        let current = 0;
        audio.volume = 0.8;

        function formatTime(s) {
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return m + ':' + (sec < 10 ? '0' : '') + sec;
        }

        // Construit la playlist
        tracks.forEach((t, i) => {
            const li = document.createElement('li');
            li.className = 'player-track';
            li.innerHTML = '<span class="track-num">' + (i + 1) + '</span>' +
                '<span class="track-name">' + t.title + '</span>' +
                '<i class="fas fa-volume-high track-eq"></i>';
            li.addEventListener('click', () => { loadTrack(i, true); });
            playlistEl.appendChild(li);
        });
        const trackEls = [...playlistEl.children];

        function loadTrack(i, autoplay) {
            current = (i + tracks.length) % tracks.length;
            audio.src = tracks[current].src;
            trackTitle.textContent = tracks[current].title;
            trackEls.forEach((el, k) => el.classList.toggle('active', k === current));
            progressFill.style.width = '0%';
            currentTimeEl.textContent = '0:00';
            totalTimeEl.textContent = '0:00';
            if (autoplay) audio.play();
        }

        // Init sur la 1re piste (sans lecture auto)
        loadTrack(0, false);

        playBtn.addEventListener('click', () => {
            if (audio.paused) { audio.play(); } else { audio.pause(); }
        });
        audio.addEventListener('play', () => { playIcon.className = 'fas fa-pause'; });
        audio.addEventListener('pause', () => { playIcon.className = 'fas fa-play'; });

        prevBtn.addEventListener('click', () => loadTrack(current - 1, true));
        nextBtn.addEventListener('click', () => loadTrack(current + 1, true));

        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                progressFill.style.width = (audio.currentTime / audio.duration) * 100 + '%';
                currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        });
        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(audio.duration);
        });
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            if (audio.duration) audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
        });
        volumeSlider.addEventListener('input', () => {
            audio.volume = volumeSlider.value;
            volumeIcon.className = audio.volume == 0 ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        });
        // Piste suivante automatique en fin de morceau
        audio.addEventListener('ended', () => loadTrack(current + 1, true));
    }

    // --- Contact form handler (envoi via Web3Forms) ---
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!form.reportValidity()) return;
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

            const formData = new FormData(form);
            const emailEl = form.querySelector('#email');
            if (emailEl && emailEl.value) formData.set('replyto', emailEl.value);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            })
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) throw new Error(data.message || 'Erreur');
                btn.innerHTML = '<i class="fas fa-check"></i> Message envoy\u00e9 !';
                btn.style.background = '#27ae60';
                form.reset();
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 4000);
            })
            .catch(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
                alert("Une erreur est survenue lors de l'envoi. Merci de r\u00e9essayer, ou de nous contacter directement par mail.");
            });
        });
    }

    // --- Agenda : masque les dates passées, trie, cache les sections vides ---
    const datesContainer = document.getElementById('datesContainer');
    if (datesContainer) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let totalVisible = 0;
        datesContainer.querySelectorAll('.dates-section').forEach((section) => {
            const list = section.querySelector('.dates-list');
            // Retire les dates passées
            section.querySelectorAll('.date-item').forEach((it) => {
                const d = new Date(it.dataset.date + 'T00:00:00');
                if (isNaN(d.getTime()) || d < today) it.remove();
            });
            // Trie les restantes par date croissante
            const remaining = [...section.querySelectorAll('.date-item')];
            remaining.sort((a, b) => a.dataset.date.localeCompare(b.dataset.date));
            remaining.forEach((it) => list.appendChild(it));
            if (remaining.length === 0) section.style.display = 'none';
            totalVisible += remaining.length;
        });
        const empty = document.getElementById('datesEmpty');
        if (empty) empty.style.display = totalVisible === 0 ? 'block' : 'none';
    }

    // --- Galerie : visionneuse (lightbox) ---
    const galleryGrid = document.getElementById('galleryGrid');
    const lightbox = document.getElementById('lightbox');
    if (galleryGrid && lightbox) {
        const imgs = [...galleryGrid.querySelectorAll('img')];
        const lbImg = document.getElementById('lbImg');
        let idx = 0;
        function openLb(i) {
            idx = (i + imgs.length) % imgs.length;
            lbImg.src = imgs[idx].src;
            lbImg.alt = imgs[idx].alt;
            lightbox.classList.add('open');
        }
        function closeLb() { lightbox.classList.remove('open'); }
        imgs.forEach((im, i) => im.addEventListener('click', () => openLb(i)));
        document.getElementById('lbClose').addEventListener('click', closeLb);
        document.getElementById('lbPrev').addEventListener('click', () => openLb(idx - 1));
        document.getElementById('lbNext').addEventListener('click', () => openLb(idx + 1));
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLb();
            else if (e.key === 'ArrowLeft') openLb(idx - 1);
            else if (e.key === 'ArrowRight') openLb(idx + 1);
        });
    }

    // --- Espace membres : prochaines répétitions (calcul auto) ---
    const nextReh = document.getElementById('nextRehearsals');
    if (nextReh) {
        const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        function prochain(jourCible, heureFin) {
            const now = new Date();
            const d = new Date(); d.setHours(0, 0, 0, 0);
            let ajout = (jourCible - d.getDay() + 7) % 7;
            if (ajout === 0 && now.getHours() >= heureFin) ajout = 7; // répétition déjà passée aujourd'hui
            d.setDate(d.getDate() + ajout);
            return d;
        }
        function fmt(d) {
            const aujourdhui = new Date(); aujourdhui.setHours(0, 0, 0, 0);
            const demain = new Date(aujourdhui); demain.setDate(demain.getDate() + 1);
            let prefix = '';
            if (d.getTime() === aujourdhui.getTime()) prefix = "Aujourd'hui — ";
            else if (d.getTime() === demain.getTime()) prefix = 'Demain — ';
            return prefix + jours[d.getDay()] + ' ' + d.getDate() + ' ' + mois[d.getMonth()] + ' ' + d.getFullYear();
        }
        const repets = [
            { nom: 'Orchestre', date: prochain(1, 22), horaire: '20h30 à 22h15' },
            { nom: "Marching'Band", date: prochain(4, 22), horaire: '20h30 à 22h00' }
        ];
        repets.sort((a, b) => a.date - b.date);
        nextReh.innerHTML = '<strong>Prochaines répétitions :</strong>' +
            repets.map(r => '<br><span class="members-alert-line"><strong>' + r.nom + '</strong> — ' + fmt(r.date) + ' · ' + r.horaire + '</span>').join('') +
            '<br><span class="members-alert-sub">Salle des fêtes de Boissy-le-Châtel</span>';
    }

    // --- Planning membres : masque les dates passées ---
    const planningBody = document.getElementById('planningBody');
    if (planningBody) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        planningBody.querySelectorAll('tr[data-date]').forEach((tr) => {
            const d = new Date(tr.dataset.date + 'T00:00:00');
            if (!isNaN(d.getTime()) && d < today) tr.remove();
        });
    }

});
