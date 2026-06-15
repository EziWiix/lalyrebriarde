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

    // --- Active nav link based on current page (robuste avec ou sans .html) ---
    function normPage(p) {
        p = (p || '').split('/').pop().replace(/\.html$/, '');
        return (p === '' || p === 'index') ? 'home' : p;
    }
    const currentNorm = normPage(window.location.pathname);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (normPage(link.getAttribute('href')) === currentNorm) {
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

        // Banderole hero : prochaine date à venir (toutes formations confondues)
        const heroNext = document.getElementById('heroNext');
        if (heroNext) {
            const upcoming = [...datesContainer.querySelectorAll('.date-item[data-date]')]
                .map((it) => ({ it: it, d: new Date(it.dataset.date + 'T00:00:00') }))
                .filter((x) => !isNaN(x.d.getTime()) && x.d >= today)
                .sort((a, b) => a.d - b.d);
            if (upcoming.length) {
                const moisCourt = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
                const next = upcoming[0].it, d = upcoming[0].d;
                const h4 = next.querySelector('h4'), p = next.querySelector('p');
                const titre = h4 ? h4.textContent.trim() : '';
                const lieu = p ? p.textContent.trim() : '';
                let txt = 'Prochaine sortie : ' + d.getDate() + ' ' + moisCourt[d.getMonth()] + ' ' + d.getFullYear() + ' — ' + titre;
                if (lieu) txt += ' · ' + lieu;
                document.getElementById('heroNextText').textContent = txt;
                heroNext.style.display = 'inline-flex';
            }
        }
    }

    // --- Galerie : visionneuse (lightbox) ---
    const galleryGrid = document.getElementById('galleryGrid');
    const lightbox = document.getElementById('lightbox');

    // Actualités : masquer le message "aucune affiche" s'il y a des affiches
    const affichesEmpty = document.getElementById('affichesEmpty');
    if (affichesEmpty && galleryGrid && galleryGrid.querySelector('img')) {
        affichesEmpty.style.display = 'none';
    }

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

    // --- Espace membres : partitions dynamiques (Google Sheets) ---
    (function () {
        const SECTIONS = {
            'Cartonnier': { icon: 'fa-star', label: "Répertoire Marching'Band", badge: true },
            'En attente': { icon: 'fa-bookmark', label: 'À garder en attente de classement' },
            'À retirer': { icon: 'fa-trash-alt', label: 'À supprimer des cartonniers', supprimer: true, nolink: true },
            'Sonneries': { icon: 'fa-bell', label: 'Sonneries' },
            'Hymnes': { icon: 'fa-flag', label: 'Hymnes' },
            'Marches': { icon: 'fa-person-walking', label: 'Marches' },
            'En cours': { icon: 'fa-hourglass-half', label: "En cours d'apprentissage" },
            'À garder': { icon: 'fa-bookmark', label: 'À garder' },
            'À supprimer': { icon: 'fa-trash-alt', label: 'À supprimer (à remettre à Ricardo)', supprimer: true }
        };
        function parseCSV(text) {
            const rows = []; let row = [], field = '', q = false;
            for (let i = 0; i < text.length; i++) {
                const c = text[i];
                if (q) {
                    if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
                    else field += c;
                } else {
                    if (c === '"') q = true;
                    else if (c === ',') { row.push(field); field = ''; }
                    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
                    else if (c !== '\r') field += c;
                }
            }
            if (field.length || row.length) { row.push(field); rows.push(row); }
            return rows;
        }
        const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        function loadPartitions(containerId, url) {
            const el = document.getElementById(containerId);
            if (!el) return;
            fetch(url).then((r) => r.text()).then((text) => {
                const rows = parseCSV(text.replace(/^﻿/, '').trim());
                const head = rows.shift().map((h) => h.trim());
                const ix = (n) => head.indexOf(n);
                const iSec = ix('Section'), iNum = ix('N°'), iTit = ix('Titre'), iDisp = ix('Disponible'), iLien = ix('Lien'), iYt = ix('YouTube'), iNote = ix('Note');
                const groups = {}, order = [];
                rows.forEach((r) => {
                    const sec = (r[iSec] || '').trim();
                    if (!sec || !(r[iTit] || '').trim()) return;
                    if (!groups[sec]) { groups[sec] = []; order.push(sec); }
                    groups[sec].push(r);
                });
                let html = '';
                order.forEach((sec) => {
                    const cfg = SECTIONS[sec] || { icon: 'fa-music', label: sec };
                    const items = groups[sec];
                    html += '<div class="partitions-programme">';
                    html += '<h4 class="partitions-titre' + (cfg.supprimer ? ' supprimer' : '') + '"><i class="fas ' + cfg.icon + '"></i> ' + esc(cfg.label);
                    if (cfg.badge) html += ' <span class="partitions-badge">' + items.length + ' morceaux</span>';
                    html += '</h4><div class="partitions-list">';
                    items.forEach((r) => {
                        const num = (r[iNum] || '').trim();
                        const tit = (r[iTit] || '').trim();
                        const disp = (r[iDisp] || '').trim().toLowerCase();
                        const lien = (r[iLien] || '').trim();
                        const yt = iYt >= 0 ? (r[iYt] || '').trim() : '';
                        const note = (r[iNote] || '').trim();
                        const status = (disp === 'non') ? 'wip' : 'ready';
                        const name = (num ? num + ' - ' : '') + tit;
                        html += '<div class="partition-item"><span class="partition-status ' + status + '"></span>';
                        html += '<span class="partition-name">' + esc(name) + (note ? ' <span class="partition-note">(' + esc(note) + ')</span>' : '') + '</span>';
                        html += '<div class="partition-links">';
                        if (!cfg.nolink && lien) {
                            const liens = lien.split(/\s+/).filter(Boolean);
                            liens.forEach((l, k) => {
                                html += '<a href="' + l.replace(/"/g, '%22') + '" target="_blank" rel="noopener" class="partition-link pdf"><i class="fas fa-file-pdf"></i> Partition' + (liens.length > 1 ? ' ' + (k + 1) : '') + '</a>';
                            });
                        }
                        if (!cfg.nolink && yt) html += '<a href="' + yt.replace(/"/g, '%22') + '" target="_blank" rel="noopener" class="partition-link youtube"><i class="fab fa-youtube"></i> Vidéo</a>';
                        html += '</div></div>';
                    });
                    html += '</div></div>';
                });
                el.innerHTML = html || '<p style="color:#888;">Aucune partition pour le moment.</p>';
            }).catch(() => {
                el.innerHTML = '<p style="color:#888;">Impossible de charger les partitions pour le moment. Réessayez plus tard.</p>';
            });
        }
        loadPartitions('partitionsMarching', 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2tCW0Tnz0UiuzynCrIoX82OA1Kfz7m4hKhxspOeoS4JM2qnuXs_cvASUs4Ayx9laYAhEJPO_jeYIC/pub?output=csv');
        loadPartitions('partitionsFanfare', 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2tCW0Tnz0UiuzynCrIoX82OA1Kfz7m4hKhxspOeoS4JM2qnuXs_cvASUs4Ayx9laYAhEJPO_jeYIC/pub?gid=995643220&single=true&output=csv');
        loadPartitions('partitionsOrchestre', 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2tCW0Tnz0UiuzynCrIoX82OA1Kfz7m4hKhxspOeoS4JM2qnuXs_cvASUs4Ayx9laYAhEJPO_jeYIC/pub?gid=1811564376&single=true&output=csv');
    })();

});
