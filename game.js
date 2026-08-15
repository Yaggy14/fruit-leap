// Main Game Controller with Attached Moving Platform Entities & Attempt Reset Logic

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        const radius = Array.isArray(r) ? r[0] : (r || 0);
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + w, y, x + w, y + h, radius);
        this.arcTo(x + w, y + h, x, y + h, radius);
        this.arcTo(x, y + h, x, y, radius);
        this.arcTo(x, y, x + w, y, radius);
        this.closePath();
        return this;
    };
}

if (typeof window.admob === 'undefined') {
    window.admob = {
        showRewardedAd: (onSuccess) => onSuccess && onSuccess(),
        showInterstitialAd: (onComplete) => onComplete && onComplete()
    };
}

if (typeof window.audio === 'undefined') {
    window.audio = {
        playJump: () => {},
        playCoin: () => {},
        playStar: () => {},
        playHurt: () => {},
        playWin: () => {},
        playGameOver: () => {}
    };
}

const I18N = {
    tr: {
        stars: "YILDIZ",
        playGame: "▶ OYUNA BAŞLA",
        storyQuest: "📖 HİKAYE & GÖREV",
        chapters: "🗺️ CHAPTERLAR",
        shop: "🛍️ KARAKTER MARKETİ",
        freeLife: "📺 ÜCRETSİZ CAN (+1 ❤️)",
        doorLockedMsg: "Kapı Kilitli 🔒! Bölümü geçmek için önce haritanın ortasındaki Altın Anahtarı 🔑 bulmalıyız!",
        keyFoundMsg: "Altın Anahtarı 🔑 Buldun! Şimdi bölüm sonundaki kilitli kapıyı açabilirsin! 🚪✨",
        ch0Msg: "Chapter 0 Test Sahasına Hoş Geldin! Burada yeni özellikleri deneyebilirsin! 🧪🐰🚀",
        ch1Msg: "Sunny Meadow'a geldik! Çalınan meyveleri topla, Çift Zıplamak için havadayken tekrar Zıpla! 🐰✨",
        ch2Msg: "Candy Kingdom! Tatlı ama tuzaklı bir yer... Dikkat et Piko, portallar (🔮🌀) burada başlıyor!",
        ch3Msg: "Cloud Paradise! Bulut adaları çok yüksek, eğilme engellerine (DUCK ▼) dikkat et!",
        ch4Msg: "Rainbow Hills! Kayan zeminler başladı, dengemi korumalıyım!",
        ch5Msg: "DİKKAT! Gölge Balçıkları (👾) burada nöbet tutuyor, kafalarına zıplayıp onları yenmeliyim!",
        ch10Msg: "TEHLİKE! Çift Kırmızı Dikenler (🌵⚠️) başladı! Dikenlere dokunma, canın azalır!",
        chGeneric: "Meyve Vadisi'ni kurtarmak için Altın Anahtarı 🔑 aramaya devam edelim! 🐰🚀",
        victoryTitle: "🎉 TEBRİKLER! MEYVE VADİSİ KURTULDU! 🎉",
        victorySubtitle: "Mükemmel Başarı! Tüm Seviyeleri Tamamladın!",
        victoryStoryText: "Piko ve cesur arkadaşları 25 Yıldız Anahtarını ve çalınan tüm sihirli meyveleri toplayıp Dev Saman Yolu Ağacı'na geri koydu! Gölge Balçıkları vadiyi terk etti ve Meyve Vadisi sonsuza dek eski neşe ve huzuruna kavuştu! 🌳✨🐰🏆",
        victoryMainMenu: "🏠 ANA MENÜYE DÖN"
    },
    en: {
        stars: "STARS",
        playGame: "▶ PLAY GAME",
        storyQuest: "📖 STORY & QUEST",
        chapters: "🗺️ CHAPTERS",
        shop: "🛍️ CHARACTER SHOP",
        freeLife: "📺 FREE LIFE (+1 ❤️)",
        doorLockedMsg: "Door is Locked 🔒! Find the Golden Key 🔑 mid-map to open!",
        keyFoundMsg: "You found the Golden Key 🔑! Now you can open the exit door! 🚪✨",
        ch0Msg: "Welcome to Chapter 0 Test Playground! Try all new features here! 🧪🐰🚀",
        ch1Msg: "Welcome to Sunny Meadow! Collect fruits and tap JUMP again in mid-air to DOUBLE JUMP! 🐰✨",
        ch2Msg: "Candy Kingdom! Watch out Piko, portals (🔮🌀) start here!",
        ch3Msg: "Cloud Paradise! Cloud islands are high, watch out for DUCK ▼ ceilings!",
        ch4Msg: "Rainbow Hills! Moving platforms ahead, keep your balance!",
        ch5Msg: "WARNING! Shadow Slimes (👾) are patrolling, jump on their heads to defeat them!",
        ch10Msg: "DANGER! Double Red Spikes (🌵⚠️) ahead! Avoid spikes or lose energy!",
        chGeneric: "Let's find the Golden Key 🔑 and save Fruit Valley! 🐰🚀",
        victoryTitle: "🎉 CONGRATULATIONS! FRUIT VALLEY IS SAVED! 🎉",
        victorySubtitle: "Outstanding Heroism! You Completed All Chapters!",
        victoryStoryText: "Piko and his brave friends collected all 25 Golden Keys and stolen magic fruits, placing them back on the Great Milky Way Tree! The Shadow Slimes fled and Fruit Valley is restored forever! 🌳✨🐰🏆",
        victoryMainMenu: "🏠 RETURN TO MAIN MENU"
    }
};

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.lang = localStorage.getItem('game_lang') || 'tr';
        this.state = 'MENU';
        this.currentChapterIdx = 0;
        this.currentLevelIdx = 0;

        this.score = 0;
        this.levelStartScore = 0;
        this.lives = 3;
        this.levelTimer = 0;
        this.fruitsCollected = 0;
        this.totalFruits = 0;

        this.progress = this.loadProgress();

        this.player = new Player(50, 350);
        this.player.currentSkinId = this.progress.equippedSkin || 'bunny';
        this.camera = { x: 0, y: 0 };

        this.platforms = [];
        this.hazards = [];
        this.overheadCeilings = [];
        this.bouncyPads = [];
        this.enemies = [];
        this.portals = [];
        this.crates = [];
        this.fans = [];
        this.switches = [];
        this.collectibles = [];
        this.particles = [];

        this.keys = { left: false, right: false, up: false, down: false };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatsUI();
        this.renderChapterChips();
        this.renderLevelGrid(1);
        this.renderShopGrid();
        requestAnimationFrame((t) => this.loop(t));
    }

    loadProgress() {
        const saved = localStorage.getItem('fruit_leap_progress_v2');
        let prog = {
            unlockedLevel: "1-1",
            levelStars: {},
            totalStars: 0,
            highScore: 0,
            unlockedSkins: ['bunny'],
            equippedSkin: 'bunny',
            globalLives: 5,
            lastHeartRegenTime: Date.now()
        };
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                prog = { ...prog, ...parsed };
            } catch (e) { }
        }
        if (prog.globalLives === undefined) prog.globalLives = 5;
        if (!prog.lastHeartRegenTime) prog.lastHeartRegenTime = Date.now();
        return prog;
    }

    saveProgress() {
        localStorage.setItem('fruit_leap_progress_v2', JSON.stringify(this.progress));
        this.updateStatsUI();
    }

    checkHeartRegen() {
        const MAX_LIVES = 5;
        if ((this.progress.globalLives || 0) >= MAX_LIVES) {
            this.progress.lastHeartRegenTime = Date.now();
            return;
        }
        const now = Date.now();
        const elapsed = now - (this.progress.lastHeartRegenTime || now);
        const REGEN_MS = 30 * 60 * 1000; // 30 minutes
        if (elapsed >= REGEN_MS) {
            const gained = Math.floor(elapsed / REGEN_MS);
            this.progress.globalLives = Math.min(MAX_LIVES, (this.progress.globalLives || 0) + gained);
            const remainder = elapsed % REGEN_MS;
            this.progress.lastHeartRegenTime = now - remainder;
            localStorage.setItem('fruit_leap_progress_v2', JSON.stringify(this.progress));
        }
    }

    getHeartRegenTimerText() {
        if ((this.progress.globalLives || 0) >= 5) return "MAX";
        const now = Date.now();
        const elapsed = now - (this.progress.lastHeartRegenTime || now);
        const REGEN_MS = 30 * 60 * 1000;
        const remainingMs = Math.max(0, REGEN_MS - (elapsed % REGEN_MS));
        const totalSecs = Math.floor(remainingMs / 1000);
        const m = Math.floor(totalSecs / 60);
        const s = totalSecs % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    updateStatsUI() {
        this.checkHeartRegen();
        const livesText = `${this.progress.globalLives || 0}/5`;
        const timerText = this.getHeartRegenTimerText();

        const setTxt = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.innerText = txt;
        };

        setTxt('total-stars-val', this.progress.totalStars || 0);
        setTxt('high-score-val', this.progress.highScore || 0);
        setTxt('global-lives-val', livesText);
        setTxt('lives-timer-val', timerText);
        setTxt('select-global-lives-val', livesText);
        setTxt('select-lives-timer-val', timerText);
        setTxt('modal-lives-timer', timerText);
        setTxt('hud-lives', livesText);
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
                if (!this.keys.up && this.state === 'PLAYING') {
                    this.player.jump(this.particles);
                }
                this.keys.up = true;
            }
            if (e.key === 'Escape' && this.state === 'PLAYING') this.pauseGame();
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') this.keys.up = false;
        });

        const bindTouch = (btnId, keyName) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;

            const pressKey = (e) => {
                if (e) e.preventDefault();
                btn.classList.add('pressed');
                this.keys[keyName] = true;
                if (keyName === 'up' && this.state === 'PLAYING') this.player.jump(this.particles);
            };

            const releaseKey = (e) => {
                if (e) e.preventDefault();
                btn.classList.remove('pressed');
                this.keys[keyName] = false;
            };

            btn.addEventListener('touchstart', pressKey, { passive: false });
            btn.addEventListener('touchend', releaseKey, { passive: false });
            btn.addEventListener('touchcancel', releaseKey, { passive: false });
            btn.addEventListener('mousedown', pressKey);
            btn.addEventListener('mouseup', releaseKey);
            btn.addEventListener('mouseleave', releaseKey);
        };

        bindTouch('btn-left', 'left');
        bindTouch('btn-right', 'right');
        bindTouch('btn-crouch', 'down');
        bindTouch('btn-jump', 'up');

        document.getElementById('btn-play-game').addEventListener('click', () => this.startLevel(0, 0));
        document.getElementById('btn-story-intro').addEventListener('click', () => this.showScreen('screen-story-intro'));
        document.getElementById('btn-start-adventure').addEventListener('click', () => this.startLevel(0, 0));
        document.getElementById('btn-story-back').addEventListener('click', () => this.showScreen('screen-main-menu'));
        document.getElementById('btn-character-shop').addEventListener('click', () => this.showScreen('screen-character-shop'));
        document.getElementById('btn-chapter-select').addEventListener('click', () => this.showScreen('screen-chapter-select'));
        document.getElementById('btn-back-main').addEventListener('click', () => this.showScreen('screen-main-menu'));
        document.getElementById('btn-shop-back').addEventListener('click', () => this.showScreen('screen-main-menu'));

        document.getElementById('btn-pause-hud').addEventListener('click', () => this.pauseGame());
        document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
        document.getElementById('btn-restart').addEventListener('click', () => this.restartLevel());
        document.getElementById('btn-quit').addEventListener('click', () => this.showScreen('screen-main-menu'));
        document.getElementById('btn-next-level').addEventListener('click', () => this.loadNextLevel());
        document.getElementById('btn-win-restart').addEventListener('click', () => this.restartLevel());
        document.getElementById('btn-win-levels').addEventListener('click', () => this.showScreen('screen-chapter-select'));
        document.getElementById('btn-gameover-menu').addEventListener('click', () => this.showScreen('screen-main-menu'));
        document.getElementById('btn-no-lives-menu').addEventListener('click', () => this.showScreen('screen-main-menu'));
        document.getElementById('btn-victory-main-menu')?.addEventListener('click', () => this.showScreen('screen-main-menu'));

        const watchAdFromMenu = () => {
            admob.showRewardedAd(() => {
                this.progress.globalLives = Math.min(5, (this.progress.globalLives || 0) + 1);
                this.saveProgress();
                this.updateStatsUI();
                this.showScreen('screen-main-menu');
            });
        };

        const watchAdInGameRevive = () => {
            admob.showRewardedAd(() => {
                this.progress.globalLives = Math.min(5, (this.progress.globalLives || 0) + 1);
                this.saveProgress();
                this.updateStatsUI();
                document.querySelectorAll('.ui-screen').forEach(s => s.classList.add('hidden'));

                if (this.pendingLevel) {
                    const target = this.pendingLevel;
                    this.pendingLevel = null;
                    this.startLevel(target.chapterIdx, target.levelIdx);
                } else if (this.currentChapterIdx !== undefined && this.currentLevelIdx !== undefined && (this.state === 'GAME_OVER' || this.state === 'PAUSED')) {
                    this.startLevel(this.currentChapterIdx, this.currentLevelIdx);
                } else {
                    this.showScreen('screen-main-menu');
                }
            });
        };

        document.getElementById('btn-main-free-life')?.addEventListener('click', watchAdFromMenu);
        document.getElementById('btn-no-lives-ad')?.addEventListener('click', watchAdInGameRevive);
        document.getElementById('btn-ad-revive')?.addEventListener('click', watchAdInGameRevive);

        // Language Selector Toggle
        document.getElementById('btn-lang-toggle')?.addEventListener('click', () => {
            this.lang = (this.lang === 'tr') ? 'en' : 'tr';
            localStorage.setItem('game_lang', this.lang);
            this.updateLanguageUI();
        });
        this.updateLanguageUI();
    }

    updateLanguageUI() {
        const langData = I18N[this.lang] || I18N.tr;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (langData[key]) el.innerText = langData[key];
        });
        const toggleBtn = document.getElementById('btn-lang-toggle');
        if (toggleBtn) toggleBtn.innerText = `🌐 ${this.lang.toUpperCase()} | ${this.lang === 'tr' ? 'EN' : 'TR'}`;
    }

    renderChapterChips() {
        const container = document.getElementById('chapter-scroll');
        container.innerHTML = '';
        CHAPTERS.forEach((c) => {
            const chip = document.createElement('div');
            chip.className = `chapter-chip ${c.id === 1 ? 'active' : ''}`;
            chip.innerText = c.id === 0 ? 'Ch.0 🧪' : `Ch.${c.id}`;
            chip.addEventListener('click', () => {
                document.querySelectorAll('.chapter-chip').forEach(ch => ch.classList.remove('active'));
                chip.classList.add('active');
                this.renderLevelGrid(c.id);
            });
            container.appendChild(chip);
        });
    }

    renderLevelGrid(chapterId) {
        const grid = document.getElementById('level-grid');
        grid.innerHTML = '';
        const chapter = CHAPTERS.find(c => c.id === chapterId);
        if (!chapter) return;

        const chapterIdx = CHAPTERS.findIndex(c => c.id === chapterId);

        chapter.levels.forEach((lvl, idx) => {
            const card = document.createElement('div');
            const lvlCode = `${chapterId}-${idx + 1}`;
            const stars = this.progress.levelStars[lvlCode] || 0;

            card.className = `level-card`;
            card.innerHTML = `
                <div class="level-num">Level ${idx + 1}</div>
                <div class="level-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
            `;
            card.addEventListener('click', () => this.startLevel(chapterIdx, idx));
            grid.appendChild(card);
        });
    }

    renderShopGrid() {
        const container = document.getElementById('shop-grid');
        container.innerHTML = '';

        CHARACTER_SKINS.forEach(skin => {
            const isUnlocked = this.progress.unlockedSkins.includes(skin.id);
            const isEquipped = this.progress.equippedSkin === skin.id;

            const card = document.createElement('div');
            card.className = `shop-card ${isEquipped ? 'equipped' : ''}`;
            card.innerHTML = `
                <div class="char-icon">${skin.icon}</div>
                <div class="char-name">${skin.name}</div>
                <div class="char-perk">${skin.perk}</div>
                <button class="btn btn-buy ${isEquipped ? 'btn-secondary' : 'btn-primary'}">
                    ${isEquipped ? 'EQUIPPED' : (isUnlocked ? 'EQUIP' : `UNLOCK ⭐${skin.priceStars}`)}
                </button>
            `;

            const btn = card.querySelector('button');
            btn.addEventListener('click', () => {
                if (isEquipped) return;
                if (isUnlocked) {
                    this.progress.equippedSkin = skin.id;
                    this.player.currentSkinId = skin.id;
                    this.saveProgress();
                    this.renderShopGrid();
                } else {
                    if (this.progress.totalStars >= skin.priceStars) {
                        this.progress.unlockedSkins.push(skin.id);
                        this.progress.equippedSkin = skin.id;
                        this.player.currentSkinId = skin.id;
                        this.saveProgress();
                        this.renderShopGrid();
                        this.updateStatsUI();
                    } else {
                        alert(`Bu karakter için ⭐ ${skin.priceStars} Yıldız gereklidir! Mevcut Yıldızın: ⭐ ${this.progress.totalStars}`);
                    }
                }
            });

            container.appendChild(card);
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.ui-screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('hud-overlay').classList.add('hidden');
        const target = document.getElementById(screenId);
        if (target) target.classList.remove('hidden');
        if (screenId === 'screen-main-menu') this.state = 'MENU';
        if (screenId === 'screen-chapter-select') this.state = 'CHAPTER_SELECT';
        if (screenId === 'screen-character-shop') {
            this.state = 'SHOP';
            this.renderShopGrid();
        }
    }

    requestMobileLandscape() {
        try {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
            } else if (screen.mozOrientation && screen.mozOrientation.lock) {
                screen.mozOrientation.lock('landscape').catch(() => {});
            } else if (screen.msOrientation && screen.msOrientation.lock) {
                screen.msOrientation.lock('landscape').catch(() => {});
            }
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {});
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen().catch(() => {});
            }
        } catch (e) {}
    }

    startLevel(chapterIdx, levelIdx) {
        this.requestMobileLandscape();
        this.checkHeartRegen();
        if ((this.progress.globalLives || 0) <= 0) {
            this.pendingLevel = { chapterIdx, levelIdx };
            document.querySelectorAll('.ui-screen').forEach(s => s.classList.add('hidden'));
            document.getElementById('screen-no-lives').classList.remove('hidden');
            return;
        }

        this.currentChapterIdx = chapterIdx;
        this.currentLevelIdx = levelIdx;
        
        // Reset score if starting a new chapter
        if (levelIdx === 0) {
            this.score = 0;
        }
        
        this.levelStartScore = this.score;
        this.levelTimer = 0;
        this.fruitsCollected = 0;

        this.loadLevelData();
        this.showScreen('hud-overlay');
        document.getElementById('hud-overlay').classList.remove('hidden');
        this.state = 'PLAYING';

        // Trigger Piko Story Dialogue for Chapter
        const lData = I18N[this.lang] || I18N.tr;
        const dialogues = {
            0: lData.ch0Msg,
            1: lData.ch1Msg,
            2: lData.ch2Msg,
            3: lData.ch3Msg,
            4: lData.ch4Msg,
            5: lData.ch5Msg,
            10: lData.ch10Msg
        };
        const currentCh = CHAPTERS[chapterIdx];
        const chId = currentCh ? currentCh.id : chapterIdx;
        const msg = dialogues[chId] !== undefined ? dialogues[chId] : lData.chGeneric;
        this.showPikoDialogue(msg);
    }

    showPikoDialogue(text) {
        const bubble = document.getElementById('piko-speech-bubble');
        const txtEl = document.getElementById('piko-dialogue-text');
        if (!bubble || !txtEl) return;
        txtEl.innerText = text;
        bubble.classList.remove('hidden');
        if (this.pikoDialogueTimer) clearTimeout(this.pikoDialogueTimer);
        this.pikoDialogueTimer = setTimeout(() => {
            bubble.classList.add('hidden');
        }, 6000);
    }

    loadLevelData() {
        const chapter = CHAPTERS[this.currentChapterIdx];
        const level = chapter.levels[this.currentLevelIdx];

        this.player.reset(level.playerStart.x, level.playerStart.y);
        
        this.platforms = level.platforms.map(p => ({ ...p, startX: p.x }));
        this.hazards = level.hazards ? level.hazards.map(h => ({
            ...h,
            platformRef: this.platforms.find(p => p.id === h.platformId)
        })) : [];
        this.overheadCeilings = level.overheadCeilings ? level.overheadCeilings.map(oc => ({
            ...oc,
            platformRef: this.platforms.find(p => p.id === oc.platformId)
        })) : [];
        this.bouncyPads = level.bouncyPads ? level.bouncyPads.map(b => ({ ...b, platformRef: this.platforms.find(p => p.id === b.platformId) })) : [];
        this.enemies = level.enemies.map(e => new Enemy(e.x, e.y, e.range, this.platforms.find(p => p.id === e.platformId)));
        this.portals = level.portals ? level.portals.map(p => ({
            ...p,
            entrancePlat: this.platforms.find(plat => plat.id === p.entrancePlatformId),
            exitPlat: this.platforms.find(plat => plat.id === p.exitPlatformId)
        })) : [];
        this.crates = level.crates ? level.crates.map(c => ({ ...c })) : [];
        this.fans = level.fans ? [...level.fans] : [];
        this.switches = level.switches ? level.switches.map(s => ({ ...s, activated: false })) : [];
        this.collectibles = level.collectibles.map(c => {
            const plat = this.platforms.find(p => p.id === c.platformId);
            return {
                ...c,
                collected: false,
                platformRef: plat
            };
        });
        this.particles = [];

        // Count ONLY genuine fruits for totalFruits
        const FRUIT_TYPES_LIST = ['strawberry', 'apple', 'banana', 'grapes', 'orange', 'watermelon', 'fruit'];
        this.totalFruits = this.collectibles.filter(c => FRUIT_TYPES_LIST.includes(c.type)).length;
        document.getElementById('hud-level-name').innerText = level.name;
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('hud-fruits').innerText = `${this.fruitsCollected} / ${this.totalFruits}`;
        document.getElementById('hud-star-key').innerText = `${this.player.hasGoldenKey ? 1 : 0} / 1`;
        document.getElementById('hud-timer').innerText = `${this.levelTimer.toFixed(1)}s`;
        document.getElementById('hud-lives').innerText = `${this.progress.globalLives || 0}/5`;
    }

    pauseGame() {
        this.state = 'PAUSED';
        document.getElementById('screen-pause').classList.remove('hidden');
    }

    resumeGame() {
        this.state = 'PLAYING';
        document.getElementById('screen-pause').classList.add('hidden');
    }

    restartLevel() {
        this.fruitsCollected = 0;
        this.score = this.levelStartScore;
        this.levelTimer = 0;
        this.player.hasGoldenKey = false;
        this.loadLevelData();
        document.querySelectorAll('.ui-screen').forEach(s => s.classList.add('hidden'));
        this.showScreen('hud-overlay');
        document.getElementById('hud-overlay').classList.remove('hidden');
        this.state = 'PLAYING';
    }

    loadNextLevel() {
        const chapter = CHAPTERS[this.currentChapterIdx];
        if (this.currentLevelIdx + 1 < chapter.levels.length) {
            this.startLevel(this.currentChapterIdx, this.currentLevelIdx + 1);
        } else if (this.currentChapterIdx + 1 < CHAPTERS.length) {
            this.startLevel(this.currentChapterIdx + 1, 0);
        } else {
            this.showVictoryFinale();
        }
    }

    showVictoryFinale() {
        document.querySelectorAll('.ui-screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('hud-overlay').classList.add('hidden');
        this.state = 'VICTORY';
        
        const lData = I18N[this.lang] || I18N.tr;
        const totalStarsSpan = document.getElementById('victory-total-stars');
        if (totalStarsSpan) totalStarsSpan.innerText = `${this.progress.totalStars} / 75`;
        document.getElementById('screen-game-victory')?.classList.remove('hidden');
        audio.playWin();
    }

    handleDie() {
        audio.playHurt();
        
        // Decrement global energy life
        this.progress.globalLives = Math.max(0, (this.progress.globalLives || 1) - 1);
        if (this.progress.globalLives < 5 && !this.progress.lastHeartRegenTime) {
            this.progress.lastHeartRegenTime = Date.now();
        }
        this.saveProgress();
        this.updateStatsUI();

        // Reset level attempt items
        this.fruitsCollected = 0;
        this.score = this.levelStartScore;
        this.player.hasGoldenKey = false;
        
        this.collectibles.forEach(c => {
            c.collected = false;
        });

        this.switches.forEach(s => s.activated = false);
        this.updateHUD();

        if (this.progress.globalLives <= 0) {
            audio.playGameOver();
            this.state = 'GAME_OVER';
            document.querySelectorAll('.ui-screen').forEach(s => s.classList.add('hidden'));
            document.getElementById('screen-game-over').classList.remove('hidden');
        } else {
            const level = CHAPTERS[this.currentChapterIdx].levels[this.currentLevelIdx];
            this.player.reset(level.playerStart.x, level.playerStart.y);
        }
    }

    handleWin() {
        this.state = 'WIN';
        const level = CHAPTERS[this.currentChapterIdx].levels[this.currentLevelIdx];
        const lvlCode = `${this.currentChapterIdx}-${this.currentLevelIdx + 1}`;

        const star1 = true; // Unlock & Finish Level
        const star2 = (this.totalFruits > 0 && this.fruitsCollected >= this.totalFruits); // Collect ALL Fruits 🍓
        const star3 = (this.levelTimer <= level.targetTime); // Speedrun

        let starsEarned = 1;
        if (star2) starsEarned++;
        if (star3) starsEarned++;

        if (starsEarned > (this.progress.levelStars[lvlCode] || 0)) {
            this.progress.levelStars[lvlCode] = starsEarned;
        }

        this.progress.totalStars = Object.values(this.progress.levelStars).reduce((a, b) => a + b, 0);

        this.saveProgress();

        document.getElementById('win-target-time').innerText = `${level.targetTime}s`;
        document.getElementById('win-fruits-count').innerText = `${this.fruitsCollected} / ${this.totalFruits}`;
        document.getElementById('win-time').innerText = `${this.levelTimer.toFixed(1)}s`;

        document.getElementById('req-star-1').className = `star-req-item ${star1 ? 'completed' : ''}`;
        document.getElementById('req-star-2').className = `star-req-item ${star2 ? 'completed' : ''}`;
        document.getElementById('req-star-3').className = `star-req-item ${star3 ? 'completed' : ''}`;

        document.getElementById('screen-win').classList.remove('hidden');
        admob.showInterstitialAd();
    }

    loop(timestamp) {
        this.updateStatsUI();
        if (this.state === 'PLAYING') {
            this.levelTimer += 1 / 60;
            this.updateHUD();
            this.update();
        }
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update() {
        // Moving Platforms synchronously move attached bouncy pads, collectibles, hazards & portals!
        this.platforms.forEach(p => {
            if (p.vx) {
                p.x += p.vx;
                if (Math.abs(p.x - p.startX) > p.range) p.vx *= -1;

                (this.bouncyPads || []).forEach(pad => {
                    if (pad.platformRef === p) pad.x += p.vx;
                });
                (this.collectibles || []).forEach(c => {
                    if (c.platformRef === p) c.x += p.vx;
                });
                (this.hazards || []).forEach(h => {
                    if (h.platformRef === p) h.x += p.vx;
                });
                (this.overheadCeilings || []).forEach(oc => {
                    if (oc.platformRef === p) oc.x += p.vx;
                });
                (this.portals || []).forEach(port => {
                    if (port.entrancePlat === p) port.entrance.x += p.vx;
                    if (port.exitPlat === p) port.exit.x += p.vx;
                });
            }
        });

        this.enemies.forEach(e => e.update(this.platforms));

        this.player.update(
            this.keys,
            this.platforms,
            this.hazards,
            this.bouncyPads,
            this.collectibles,
            this.particles,
            this.enemies,
            this.portals,
            this.crates,
            this.fans,
            this.switches,
            () => this.handleDie(),
            () => this.handleWin(),
            (fruit) => {
                this.fruitsCollected++;
                this.updateHUD();
            },
            (goldenKey) => {
                this.updateHUD();
                const lData = I18N[this.lang] || I18N.tr;
                this.showPikoDialogue(lData.keyFoundMsg);
            },
            this.overheadCeilings,
            () => {
                const lData = I18N[this.lang] || I18N.tr;
                this.showPikoDialogue(lData.doorLockedMsg);
            }
        );

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        // Smooth Camera X & Y tracking so Player & Map Bottom are ALWAYS 100% centered & visible!
        const targetCamX = this.player.x - this.canvas.width * 0.35;
        this.camera.x += (targetCamX - this.camera.x) * 0.12;
        if (this.camera.x < 0) this.camera.x = 0;
        if (this.camera.x > this.levelMapWidth - this.canvas.width) {
            this.camera.x = Math.max(0, this.levelMapWidth - this.canvas.width);
        }

        // Dynamic Camera Y Tracking keeps player vertically centered & ground platform visible on mobile screens!
        const targetCamY = Math.max(0, this.player.y - this.canvas.height * 0.55);
        this.camera.y += (targetCamY - this.camera.y) * 0.10;
        if (this.camera.y < 0) this.camera.y = 0;
    }

    draw() {
        const theme = CHAPTERS[this.currentChapterIdx]?.theme || CHAPTERS[0].theme;

        // Rich Atmospheric Sky Gradient
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGrad.addColorStop(0, theme.skyGradient ? theme.skyGradient[0] : theme.bg);
        skyGrad.addColorStop(1, theme.skyGradient ? theme.skyGradient[1] : "#ffffff");
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Sun / Moon Glow
        const isNight = theme.name === "Starry Night";
        const orbColor = isNight ? "#e0e7ff" : "#ffeb3b";
        const glowColor = isNight ? "rgba(224, 231, 255, 0.4)" : "rgba(255, 235, 59, 0.4)";

        this.ctx.save();
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 30;
        this.ctx.fillStyle = orbColor;
        this.ctx.beginPath();
        this.ctx.arc(850 - this.camera.x * 0.05, 85, 45, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // Atmospheric Clouds & Parallax Elements
        this.ctx.fillStyle = isNight ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.65)";
        for (let i = 0; i < 14; i++) {
            let cx = (i * 220 - this.camera.x * 0.15) % 3200;
            if (cx < -120) cx += 3200;
            let cy = 55 + (i % 4) * 32;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, 24, 0, Math.PI * 2);
            this.ctx.arc(cx + 25, cy - 12, 32, 0, Math.PI * 2);
            this.ctx.arc(cx + 52, cy, 24, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Bottom Parallax Rolling Terrain Hills ($y = 400 - 540$)
        this.ctx.save();
        this.ctx.fillStyle = theme.platformBorder;
        this.ctx.globalAlpha = 0.30;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 540);
        for (let x = 0; x <= this.canvas.width; x += 30) {
            let hillY = 445 + Math.sin((x + this.camera.x * 0.25) * 0.007) * 30;
            this.ctx.lineTo(x, hillY);
        }
        this.ctx.lineTo(this.canvas.width, 540);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();

        // Bottom Animated Liquid Wave Ocean ($y = 485 - 540$)
        const liquidColor = theme.liquidColor || "rgba(0, 180, 216, 0.45)";
        this.ctx.save();
        this.ctx.fillStyle = liquidColor;
        this.ctx.shadowColor = theme.platformColor;
        this.ctx.shadowBlur = 12;

        this.ctx.beginPath();
        this.ctx.moveTo(0, 540);
        const waveTime = Date.now() * 0.003;
        for (let x = 0; x <= this.canvas.width; x += 15) {
            let waveY = 492 + Math.sin(waveTime + x * 0.02) * 5;
            this.ctx.lineTo(x, waveY);
        }
        this.ctx.lineTo(this.canvas.width, 540);
        this.ctx.closePath();
        this.ctx.fill();

        // Wave Foam Edge Highlight
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.60)";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let x = 0; x <= this.canvas.width; x += 15) {
            let waveY = 492 + Math.sin(waveTime + x * 0.02) * 5;
            if (x === 0) this.ctx.moveTo(x, waveY);
            else this.ctx.lineTo(x, waveY);
        }
        this.ctx.stroke();
        this.ctx.restore();

        // Chapter 1 Level 1 Double Jump Tutorial Banner
        if (this.currentChapterIdx === 0 && this.currentLevelIdx === 0) {
            this.ctx.save();
            this.ctx.shadowColor = "rgba(124, 77, 255, 0.5)";
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = 'rgba(20, 24, 45, 0.90)';
            this.ctx.beginPath();
            this.ctx.roundRect(380 - this.camera.x, 170, 500, 70, 14);
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffd600';
            this.ctx.lineWidth = 2.5;
            this.ctx.stroke();

            this.ctx.fillStyle = '#00e5ff';
            this.ctx.font = '800 13px Outfit, sans-serif';
            this.ctx.fillText('⚡ TUTORIAL GUIDE ⚡', 395 - this.camera.x, 192);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '600 14px Outfit, sans-serif';
            this.ctx.fillText('Tap JUMP once to Jump, and tap JUMP again in mid-air', 395 - this.camera.x, 212);
            this.ctx.fillText('to DOUBLE JUMP across wide gaps! 🐰🚀', 395 - this.camera.x, 230);
            this.ctx.restore();
        }

        // Textured Platforms with Grass Trim & Shadows
        this.platforms.forEach(p => {
            const px = p.x - this.camera.x;
            const py = p.y - this.camera.y;

            this.ctx.save();
            // Drop shadow
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
            this.ctx.beginPath();
            this.ctx.roundRect(px + 3, py + 4, p.width, p.height, 8);
            this.ctx.fill();

            // Main body
            this.ctx.fillStyle = theme.platformColor;
            this.ctx.beginPath();
            this.ctx.roundRect(px, py, p.width, p.height, 8);
            this.ctx.fill();

            // Top Border / Grass
            this.ctx.fillStyle = theme.platformBorder;
            this.ctx.beginPath();
            this.ctx.roundRect(px, py, p.width, 7, [8, 8, 0, 0]);
            this.ctx.fill();

            // Glossy Highlight Line
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            this.ctx.fillRect(px + 4, py + 1, p.width - 8, 2);
            this.ctx.restore();
        });

        // Low Overhead Ceilings (Chapter 3+)
        (this.overheadCeilings || []).forEach(oc => {
            const cx = oc.x - this.camera.x;
            const cy = oc.y - this.camera.y;
            this.ctx.save();
            this.ctx.fillStyle = '#263238';
            this.ctx.beginPath();
            this.ctx.roundRect(cx, cy, oc.width, oc.height, 6);
            this.ctx.fill();
            this.ctx.strokeStyle = '#ff9100';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Hazard warning stripes ///
            this.ctx.fillStyle = '#ff9100';
            for (let s = 0; s < oc.width; s += 16) {
                this.ctx.beginPath();
                this.ctx.moveTo(cx + s, cy + oc.height);
                this.ctx.lineTo(cx + s + 6, cy);
                this.ctx.lineTo(cx + s + 10, cy);
                this.ctx.lineTo(cx + s + 4, cy + oc.height);
                this.ctx.fill();
            }

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '800 11px Outfit, sans-serif';
            this.ctx.shadowColor = '#000';
            this.ctx.shadowBlur = 4;
            this.ctx.fillText('DUCK! ▼', cx + (oc.width / 2) - 22, cy + 16);
            this.ctx.restore();
        });

        // Elevated 3D Metallic Hazard Spikes (Chapter 10+)
        (this.hazards || []).forEach(h => {
            const hx = h.x - this.camera.x;
            const hy = h.y - this.camera.y;

            this.ctx.save();
            // Glow shadow
            this.ctx.shadowColor = '#ff1744';
            this.ctx.shadowBlur = 10;

            const spikeGradient = this.ctx.createLinearGradient(hx, hy + h.height, hx, hy);
            spikeGradient.addColorStop(0, '#1a1a1a');
            spikeGradient.addColorStop(0.6, '#d50000');
            spikeGradient.addColorStop(1, '#ff5252');

            this.ctx.fillStyle = spikeGradient;
            this.ctx.strokeStyle = '#ffd600';
            this.ctx.lineWidth = 1.5;

            this.ctx.beginPath();
            this.ctx.moveTo(hx, hy + h.height);
            this.ctx.lineTo(hx + h.width / 2, hy);
            this.ctx.lineTo(hx + h.width, hy + h.height);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.restore();
        });

        // Bouncy Pads
        this.bouncyPads.forEach(pad => {
            this.ctx.fillStyle = '#ff4081';
            this.ctx.beginPath();
            this.ctx.roundRect(pad.x - this.camera.x, pad.y - this.camera.y, pad.width, pad.height, 6);
            this.ctx.fill();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(pad.x - this.camera.x + 8, pad.y - this.camera.y + 4, pad.width - 16, 4);
        });

        // Pushable Crates 📦
        this.crates.forEach(crate => {
            this.ctx.fillStyle = '#8d6e63';
            this.ctx.fillRect(crate.x - this.camera.x, crate.y - this.camera.y, crate.width, crate.height);
            this.ctx.strokeStyle = '#4e342e';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(crate.x - this.camera.x, crate.y - this.camera.y, crate.width, crate.height);
        });

        // Wind Fans 🌬️
        this.fans.forEach(fan => {
            this.ctx.fillStyle = '#80deea';
            this.ctx.fillRect(fan.x - this.camera.x, fan.y - this.camera.y, fan.width, fan.height);
        });

        // Portals 🔮 🌀 (Cosmic Glowing Portals)
        this.portals.forEach(p => {
            this.ctx.save();

            // Entrance - Magenta Cosmic Swirl
            const enX = p.entrance.x - this.camera.x + 15;
            const enY = p.entrance.y - this.camera.y + 22;
            this.ctx.shadowColor = '#ff007f';
            this.ctx.shadowBlur = 20;
            this.ctx.fillStyle = '#d5006d';
            this.ctx.beginPath();
            this.ctx.ellipse(enX, enY, 16, 24, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner core swirl
            this.ctx.fillStyle = '#ff80ab';
            this.ctx.beginPath();
            this.ctx.ellipse(enX, enY, 8, 14, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Exit - Electric Cyan Swirl
            const exX = p.exit.x - this.camera.x + 15;
            const exY = p.exit.y - this.camera.y + 22;
            this.ctx.shadowColor = '#00f0ff';
            this.ctx.shadowBlur = 20;
            this.ctx.fillStyle = '#0097a7';
            this.ctx.beginPath();
            this.ctx.ellipse(exX, exY, 16, 24, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner core swirl
            this.ctx.fillStyle = '#80deea';
            this.ctx.beginPath();
            this.ctx.ellipse(exX, exY, 8, 14, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });

        // Floor Switches 🔘
        this.switches.forEach(sw => {
            this.ctx.fillStyle = sw.activated ? '#76ff03' : '#ff1744';
            this.ctx.fillRect(sw.x - this.camera.x, sw.y - this.camera.y, sw.width, sw.height);
        });

        // Collectibles
        this.collectibles.forEach(c => {
            if (c.collected) return;
            this.ctx.save();
            this.ctx.translate(c.x - this.camera.x + 10, c.y - this.camera.y + 10);
            
            if (c.type === 'golden_key' || c.type === 'star_key' || c.type === 'key') {
                // 3D Glowing Golden Door Key 🔑
                this.ctx.shadowColor = '#ffd600';
                this.ctx.shadowBlur = 18;
                
                this.ctx.fillStyle = '#ffd600';
                this.ctx.strokeStyle = '#ff6d00';
                this.ctx.lineWidth = 2;

                // Key Ring Head
                this.ctx.beginPath();
                this.ctx.arc(0, -6, 8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();

                this.ctx.fillStyle = '#1a1c2e';
                this.ctx.beginPath();
                this.ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
                this.ctx.fill();

                // Key Stem & Teeth
                this.ctx.fillStyle = '#ffd600';
                this.ctx.fillRect(-2, 2, 4, 16);
                this.ctx.fillRect(2, 8, 5, 3);
                this.ctx.fillRect(2, 13, 6, 3);

                this.ctx.shadowBlur = 0;
            } else if (c.type === 'strawberry') {
                this.ctx.fillStyle = '#ff1744';
                this.ctx.beginPath(); this.ctx.arc(0, 2, 10, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.fillStyle = '#76ff03'; this.ctx.fillRect(-5, -10, 10, 5);
                this.ctx.fillStyle = '#ffeb3b'; this.ctx.fillRect(-2, 0, 2, 2); this.ctx.fillRect(3, 4, 2, 2);
            } else if (c.type === 'apple') {
                this.ctx.fillStyle = '#ff3d00';
                this.ctx.beginPath(); this.ctx.arc(0, 0, 10, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.fillStyle = '#4caf50'; this.ctx.fillRect(0, -12, 5, 4);
                this.ctx.fillStyle = '#795548'; this.ctx.fillRect(-1, -12, 2, 4);
            } else if (c.type === 'banana') {
                this.ctx.fillStyle = '#ffea00';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, 11, 5, Math.PI / 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#5d4037';
                this.ctx.fillRect(-7, 4, 3, 3);
            } else if (c.type === 'grapes') {
                this.ctx.fillStyle = '#aa00ff';
                this.ctx.beginPath();
                this.ctx.arc(-4, -2, 5, 0, Math.PI * 2);
                this.ctx.arc(4, -2, 5, 0, Math.PI * 2);
                this.ctx.arc(0, 4, 5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#64dd17'; this.ctx.fillRect(-2, -9, 4, 4);
            } else if (c.type === 'orange') {
                this.ctx.fillStyle = '#ff9100';
                this.ctx.beginPath(); this.ctx.arc(0, 0, 10, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.fillStyle = '#76ff03'; this.ctx.fillRect(0, -11, 4, 3);
            } else if (c.type === 'watermelon') {
                this.ctx.fillStyle = '#2e7d32';
                this.ctx.beginPath(); this.ctx.arc(0, 0, 11, 0, Math.PI); this.ctx.fill();
                this.ctx.fillStyle = '#ff2a6d';
                this.ctx.beginPath(); this.ctx.arc(0, -1, 8, 0, Math.PI); this.ctx.fill();
                this.ctx.fillStyle = '#000000'; this.ctx.fillRect(-3, 3, 2, 2); this.ctx.fillRect(2, 3, 2, 2);
            } else if (c.type === 'exit' || c.type === 'exit_door') {
                // Taller Exit Door (🚪🔒 / 🚪✨) Sitting 100% Flush on the Platform Surface!
                const isUnlocked = this.player.hasGoldenKey;
                const platY = c.platformRef ? c.platformRef.y : (c.y + 50);
                
                this.ctx.restore();
                this.ctx.save();
                this.ctx.translate(c.x - this.camera.x + 15, platY - this.camera.y);

                this.ctx.shadowColor = isUnlocked ? '#00f0ff' : '#ff1744';
                this.ctx.shadowBlur = 20;

                // Outer Arch Door Frame (Flush at y = 0)
                this.ctx.fillStyle = '#3e2723';
                this.ctx.beginPath();
                this.ctx.roundRect(-25, -78, 50, 78, [25, 25, 0, 0]);
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffd600';
                this.ctx.lineWidth = 3.5;
                this.ctx.stroke();

                if (isUnlocked) {
                    // Unlocked Cosmic Exit Portal 🚪✨
                    const doorGrad = this.ctx.createLinearGradient(0, -74, 0, 0);
                    doorGrad.addColorStop(0, '#00f0ff');
                    doorGrad.addColorStop(0.5, '#e040fb');
                    doorGrad.addColorStop(1, '#651fff');
                    this.ctx.fillStyle = doorGrad;
                    this.ctx.beginPath();
                    this.ctx.roundRect(-19, -72, 38, 72, [19, 19, 0, 0]);
                    this.ctx.fill();

                    // Sparkle Ring
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(0, -36, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // Locked Dark Wooden Door with Padlock 🚪🔒
                    this.ctx.fillStyle = '#211510';
                    this.ctx.beginPath();
                    this.ctx.roundRect(-19, -72, 38, 72, [19, 19, 0, 0]);
                    this.ctx.fill();

                    // Golden Padlock 🔒
                    this.ctx.fillStyle = '#ffd600';
                    this.ctx.fillRect(-8, -36, 16, 16);
                    this.ctx.strokeStyle = '#ffd600';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.arc(0, -38, 6.5, Math.PI, 0);
                    this.ctx.stroke();

                    this.ctx.fillStyle = '#1a1a1a';
                    this.ctx.beginPath();
                    this.ctx.arc(0, -28, 2.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                this.ctx.shadowBlur = 0;
            }
            this.ctx.restore();
        });

        // Enemies (Theme-matched vibrant slime colors!)
        this.enemies.forEach(e => e.draw(this.ctx, this.camera, theme.slimeColor));

        // Particles
        this.particles.forEach(p => p.draw(this.ctx, this.camera));

        // Player
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.player.draw(this.ctx, this.camera);
        }
    }
}

window.addEventListener('load', () => {
    window.gameInstance = new Game();
});
