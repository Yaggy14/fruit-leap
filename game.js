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
        settings: "⚙️ Ayarlar",

        // Story Modal
        storyTitle: "✨ PİKO'NUN EFSANESİ ✨",
        storyCard1Title: "1. Meyve Vadisi",
        storyCard1Text: "Meyve Vadisi'nin neşesi ve yaşam kaynağı, gökyüzündeki Dev Saman Yolu Meyve Ağacı'ydı...",
        storyCard2Title: "2. Çalınan Yıldızlar",
        storyCard2Text: "Bir gece kötü Gölge Balçıkları (Slime'lar) ağacın büyülü 25 Yıldız Anahtarını ve meyvelerini çalıp boyut portallarına saçtı!",
        storyCard3Title: "3. Cesur Tavşan Piko",
        storyCard3Text: "Tavşan Piko pelerinini taktı! Portallardan geçip 25 Yıldız Anahtarını toplamak ve vadisini kurtarmak için yola çıkıyor!",
        startAdventure: "🚀 MACERAYA BAŞLA!",
        mainMenu: "🏠 Ana Menü",

        // Pause Modal
        paused: "DURDURULDU",
        resume: "▶ DEVAM ET",
        restartLevel: "🔄 YENİDEN BAŞLAT",
        pauseSettings: "⚙️ AYARLAR",
        pauseMenu: "🏠 MENÜ",

        // Chapter Select
        selectChapter: "Bölüm Seç",
        backToMenu: "Ana Menüye Dön",

        // Out of Lives
        outOfLivesTitle: "CANIN BİTTİ! ❤️",
        outOfLivesDesc: "Oynamak için en az 1 Canın olmalı. Canlar her 30 dakikada 1 yenilenir!",
        nextLifeIn: "Sıradaki Can:",
        watchAdLife: "📺 Reklam İzle (+1 Can)",

        // Shop
        characterShop: "Karakter Marketi",

        // Win Screen
        winLevelCleared: "BÖLÜM GEÇİLDİ!",
        winFinishLevel: "Bölümü Bitir",
        winCollectFruits: "TÜM Meyveleri Topla (🍓)",
        winSpeedrun: "Hızlı Koşu",
        winNextLevel: "🚀 SONRAKİ BÖLÜM",
        winRetry: "🔄 TEKRAR DENE",
        winLevels: "🗺️ BÖLÜMLER",
        winMenu: "🏠 MENÜ",

        // Game Over
        gameOverTitle: "CANIN TÜKENDİ!",
        gameOverDesc: "Bu deneme için tüm canların bitti!",
        adRevive: "📺 Reklam İzle (+1 Can)",

        // Gameplay Dialogues
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
        
        // Victory
        victoryTitle: "🎉 TEBRİKLER! MEYVE VADİSİ KURTULDU! 🎉",
        victorySubtitle: "Mükemmel Başarı! Tüm Seviyeleri Tamamladın!",
        victoryStoryText: "Piko ve cesur arkadaşları 25 Yıldız Anahtarını ve çalınan tüm sihirli meyveleri toplayıp Dev Saman Yolu Ağacı'na geri koydu! Gölge Balçıkları vadiyi terk etti ve Meyve Vadisi sonsuza dek eski neşe ve huzuruna kavuştu! 🌳✨🐰🏆",
        victoryMainMenu: "🏠 ANA MENÜYE DÖN",
        
        // Settings
        settingsTitle: "⚙️ AYARLAR",
        masterVolume: "🔊 Genel Ses",
        musicVolume: "🎵 Müzik Sesi",
        controlsSize: "🕹️ Tuş Boyutu",
        language: "🌐 Dil",
        sizeSmall: "Küçük",
        sizeMedium: "Orta",
        sizeLarge: "Büyük",
        close: "✔ Kapat"
    },
    en: {
        stars: "STARS",
        playGame: "▶ PLAY GAME",
        storyQuest: "📖 STORY & QUEST",
        chapters: "🗺️ CHAPTERS",
        shop: "🛍️ CHARACTER SHOP",
        freeLife: "📺 FREE LIFE (+1 ❤️)",
        settings: "⚙️ Settings",

        // Story Modal
        storyTitle: "✨ THE LEGEND OF PIKO ✨",
        storyCard1Title: "1. Fruit Valley",
        storyCard1Text: "The joy and life source of Fruit Valley was the Giant Milky Way Tree in the sky...",
        storyCard2Title: "2. The Stolen Stars",
        storyCard2Text: "One night, the evil Shadow Slimes stole the 25 Star Keys and magic fruits, scattering them into portals!",
        storyCard3Title: "3. Brave Bunny Piko",
        storyCard3Text: "Bunny Piko wore his cape! He embarks on a quest through portals to collect all 25 Star Keys and save his valley!",
        startAdventure: "🚀 START ADVENTURE!",
        mainMenu: "🏠 Main Menu",

        // Pause Modal
        paused: "PAUSED",
        resume: "▶ RESUME",
        restartLevel: "🔄 RESTART LEVEL",
        pauseSettings: "⚙️ SETTINGS",
        pauseMenu: "🏠 MENU",

        // Chapter Select
        selectChapter: "Select Chapter",
        backToMenu: "Back to Menu",

        // Out of Lives
        outOfLivesTitle: "OUT OF LIVES! ❤️",
        outOfLivesDesc: "You need at least 1 Life to play. Lives regenerate 1 every 30 minutes!",
        nextLifeIn: "Next Life In:",
        watchAdLife: "📺 Watch Ad (+1 Life)",

        // Shop
        characterShop: "Character Shop",

        // Win Screen
        winLevelCleared: "LEVEL CLEARED!",
        winFinishLevel: "Finish Level",
        winCollectFruits: "Collect ALL Fruits (🍓)",
        winSpeedrun: "Speedrun",
        winNextLevel: "🚀 NEXT LEVEL",
        winRetry: "🔄 RETRY",
        winLevels: "🗺️ LEVELS",
        winMenu: "🏠 MENU",

        // Game Over
        gameOverTitle: "OUT OF LIVES!",
        gameOverDesc: "You ran out of lives for this run!",
        adRevive: "📺 Watch Ad (+1 Life)",

        // Gameplay Dialogues
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

        // Victory
        victoryTitle: "🎉 CONGRATULATIONS! FRUIT VALLEY IS SAVED! 🎉",
        victorySubtitle: "Outstanding Heroism! You Completed All Chapters!",
        victoryStoryText: "Piko and his brave friends collected all 25 Golden Keys and stolen magic fruits, placing them back on the Great Milky Way Tree! The Shadow Slimes fled and Fruit Valley is restored forever! 🌳✨🐰🏆",
        victoryMainMenu: "🏠 RETURN TO MAIN MENU",

        // Settings
        settingsTitle: "⚙️ SETTINGS",
        masterVolume: "🔊 Master Volume",
        musicVolume: "🎵 Music Volume",
        controlsSize: "🕹️ Controls Size",
        language: "🌐 Language",
        sizeSmall: "Small",
        sizeMedium: "Medium",
        sizeLarge: "Large",
        close: "✔ Close"
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

        // Fixed timestep physics properties (60Hz target)
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedStep = 1 / 60;

        this.progress = this.loadProgress();

        // High-Performance Zero-Allocation Rendering Cache
        this.cache = {
            gradients: {}
        };

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

        // Autoplay policy workaround: play menu BGM on first interaction if we're in a menu state
        const startInitialBGM = () => {
            if (this.state === 'MENU' || this.state === 'SHOP' || this.state === 'CHAPTER_SELECT') {
                audio.playBGM('menu');
            }
            document.removeEventListener('click', startInitialBGM);
            document.removeEventListener('touchstart', startInitialBGM);
        };
        document.addEventListener('click', startInitialBGM);
        document.addEventListener('touchstart', startInitialBGM);

        requestAnimationFrame((t) => this.loop(t));
    }

    getCachedGradient(key, factory) {
        if (!this.cache.gradients[key]) {
            this.cache.gradients[key] = factory(this.ctx);
        }
        return this.cache.gradients[key];
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

        document.getElementById('btn-play-game').addEventListener('click', () => this.resumeGamePlay());
        document.getElementById('btn-story-intro').addEventListener('click', () => this.showScreen('screen-story-intro'));
        document.getElementById('btn-start-adventure').addEventListener('click', () => this.resumeGamePlay());
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
        document.getElementById('btn-win-main-menu')?.addEventListener('click', () => this.showScreen('screen-main-menu'));
        document.getElementById('btn-gameover-menu').addEventListener('click', () => this.showScreen('screen-main-menu'));
        document.getElementById('btn-no-lives-menu').addEventListener('click', () => this.showScreen('screen-main-menu'));
        document.getElementById('btn-victory-main-menu')?.addEventListener('click', () => this.showScreen('screen-main-menu'));

        const watchAdFromMenu = () => {
            if ((this.progress.globalLives || 0) >= 5) {
                const msg = (this.lang === 'tr') 
                    ? '❤️ Canınız zaten dolu! (5/5)' 
                    : '❤️ Lives are already full! (5/5)';
                this.showToast(msg);
                return;
            }
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

        // Settings Menu Logic
        document.getElementById('btn-settings-main')?.addEventListener('click', () => this.showScreen('screen-settings'));
        
        document.getElementById('btn-settings-pause')?.addEventListener('click', () => {
            document.getElementById('screen-pause').classList.add('hidden');
            document.getElementById('screen-settings').classList.remove('hidden');
        });

        document.getElementById('btn-settings-close')?.addEventListener('click', () => {
            if (this.state === 'PAUSED') {
                document.getElementById('screen-settings').classList.add('hidden');
                document.getElementById('screen-pause').classList.remove('hidden');
            } else {
                this.showScreen('screen-main-menu');
            }
        });

        const volSlider = document.getElementById('volume-slider');
        if (volSlider) {
            volSlider.value = audio.globalVolume;
            volSlider.addEventListener('input', (e) => {
                audio.setVolume(parseFloat(e.target.value));
            });
        }

        const bgmSlider = document.getElementById('bgm-volume-slider');
        if (bgmSlider) {
            bgmSlider.value = audio.musicVolume;
            bgmSlider.addEventListener('input', (e) => {
                audio.setMusicVolume(parseFloat(e.target.value));
            });
        }

        // Size Buttons
        const savedSize = localStorage.getItem('game_controls_size') || 'medium';
        this.applyControlsSize(savedSize);
        document.querySelectorAll('.size-btn').forEach(btn => {
            if (btn.dataset.size === savedSize) btn.classList.add('btn-active');
            else btn.classList.add('btn-inactive');
            
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.size-btn').forEach(b => {
                    b.classList.remove('btn-active');
                    b.classList.add('btn-inactive');
                });
                const selectedBtn = e.target;
                selectedBtn.classList.remove('btn-inactive');
                selectedBtn.classList.add('btn-active');
                
                const newSize = selectedBtn.dataset.size;
                localStorage.setItem('game_controls_size', newSize);
                this.applyControlsSize(newSize);
            });
        });

        // Language Buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.dataset.lang === this.lang) btn.classList.add('btn-active');
            else btn.classList.add('btn-inactive');
            
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.lang-btn').forEach(b => {
                    b.classList.remove('btn-active');
                    b.classList.add('btn-inactive');
                });
                const selectedBtn = e.target;
                selectedBtn.classList.remove('btn-inactive');
                selectedBtn.classList.add('btn-active');
                
                this.lang = selectedBtn.dataset.lang;
                localStorage.setItem('game_lang', this.lang);
                this.updateLanguageUI();
            });
        });

        this.updateLanguageUI();
    }

    applyControlsSize(size) {
        const dpadBtns = document.querySelectorAll('.dpad-btn');
        const jumpBtns = document.querySelectorAll('.action-jump-btn');
        const crouchBtns = document.querySelectorAll('.action-crouch-btn');
        
        let scale = 1.35;
        if (size === 'small') scale = 1.0;
        else if (size === 'medium') scale = 1.35;
        else if (size === 'large') scale = 1.75;
        
        dpadBtns.forEach(btn => {
            btn.style.width = `${Math.round(64 * scale)}px`;
            btn.style.height = `${Math.round(64 * scale)}px`;
            btn.style.fontSize = `${Math.round(24 * scale)}px`;
        });
        
        jumpBtns.forEach(btn => {
            btn.style.width = `${Math.round(76 * scale)}px`;
            btn.style.height = `${Math.round(76 * scale)}px`;
            const icon = btn.querySelector('.btn-sub-icon');
            const txt = btn.querySelector('.btn-sub-text');
            if (icon) icon.style.fontSize = `${(1.05 * scale).toFixed(2)}rem`;
            if (txt) txt.style.fontSize = `${(0.68 * scale).toFixed(2)}rem`;
        });

        crouchBtns.forEach(btn => {
            btn.style.width = `${Math.round(70 * scale)}px`;
            btn.style.height = `${Math.round(70 * scale)}px`;
            const icon = btn.querySelector('.btn-sub-icon');
            const txt = btn.querySelector('.btn-sub-text');
            if (icon) icon.style.fontSize = `${(1.05 * scale).toFixed(2)}rem`;
            if (txt) txt.style.fontSize = `${(0.68 * scale).toFixed(2)}rem`;
        });
    }

    updateLanguageUI() {
        const langData = I18N[this.lang] || I18N.tr;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (langData[key]) el.innerText = langData[key];
        });
        const toggleBtn = document.getElementById('btn-lang-toggle');
        if (toggleBtn) toggleBtn.innerText = `🌐 ${this.lang.toUpperCase()} | ${this.lang === 'tr' ? 'EN' : 'TR'}`;
        
        const langSelect = document.getElementById('settings-lang-select');
        if (langSelect) {
            langSelect.querySelectorAll('.lang-btn').forEach(btn => {
                if (btn.dataset.lang === this.lang) {
                    btn.classList.add('btn-active');
                    btn.classList.remove('btn-inactive');
                } else {
                    btn.classList.remove('btn-active');
                    btn.classList.add('btn-inactive');
                }
            });
        }
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
        document.getElementById('touch-controls')?.classList.add('hidden'); // HIDE TOUCH CONTROLS ON MENUS!

        const target = document.getElementById(screenId);
        if (target) target.classList.remove('hidden');
        if (screenId === 'screen-main-menu') {
            this.state = 'MENU';
            audio.playBGM('menu');
        }
        if (screenId === 'screen-chapter-select') {
            this.state = 'CHAPTER_SELECT';
            audio.playBGM('menu');
            this.renderChapterChips();
            this.renderLevelGrid(1);
        }
        if (screenId === 'screen-character-shop') {
            this.state = 'SHOP';
            audio.playBGM('menu');
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

    resumeGamePlay() {
        let nextChapterIdx = 0;
        let nextLevelIdx = 0;
        
        let foundCompleted = false;
        for (let c = CHAPTERS.length - 1; c >= 0; c--) {
            const chap = CHAPTERS[c];
            for (let l = chap.levels.length - 1; l >= 0; l--) {
                const lvlCode = `${chap.id}-${l + 1}`;
                const buggedCode = `${c}-${l + 1}`;
                if (this.progress.levelStars[lvlCode] > 0 || this.progress.levelStars[buggedCode] > 0) {
                    nextChapterIdx = c;
                    nextLevelIdx = l + 1;
                    if (nextLevelIdx >= chap.levels.length) {
                        nextChapterIdx = c + 1;
                        nextLevelIdx = 0;
                    }
                    foundCompleted = true;
                    break;
                }
            }
            if (foundCompleted) break;
        }

        if (nextChapterIdx >= CHAPTERS.length) {
            nextChapterIdx = CHAPTERS.length - 1;
            nextLevelIdx = CHAPTERS[nextChapterIdx].levels.length - 1;
        }
        
        this.startLevel(nextChapterIdx, nextLevelIdx);
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

        // Pre-fill accumulator for frame 1 physics execution
        this.lastTime = performance.now();
        this.accumulator = this.fixedStep;

        this.loadLevelData();
        this.showScreen('hud-overlay');
        document.getElementById('hud-overlay').classList.remove('hidden');
        document.getElementById('touch-controls')?.classList.remove('hidden'); // SHOW TOUCH CONTROLS IN GAME!
        this.state = 'PLAYING';
        audio.playBGM('game');

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
        document.getElementById('touch-controls')?.classList.add('hidden');
    }

    resumeGame() {
        this.state = 'PLAYING';
        document.getElementById('screen-pause').classList.add('hidden');
        document.getElementById('touch-controls')?.classList.remove('hidden');
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
            audio.playBGM(null); // Stop BGM for game over
            audio.playGameOver();
            this.state = 'GAME_OVER';
            document.querySelectorAll('.ui-screen').forEach(s => s.classList.add('hidden'));
            document.getElementById('screen-game-over').classList.remove('hidden');
            document.getElementById('touch-controls')?.classList.add('hidden');
        } else {
            const level = CHAPTERS[this.currentChapterIdx].levels[this.currentLevelIdx];
            this.player.reset(level.playerStart.x, level.playerStart.y);
        }
    }

    handleWin() {
        audio.playBGM(null); // Stop BGM to hear the win fanfare
        this.state = 'WIN';
        const level = CHAPTERS[this.currentChapterIdx].levels[this.currentLevelIdx];
        const lvlCode = `${CHAPTERS[this.currentChapterIdx].id}-${this.currentLevelIdx + 1}`;

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

        document.getElementById('req-star-1').className = 'star-req-item';
        document.getElementById('req-star-2').className = 'star-req-item';
        document.getElementById('req-star-3').className = 'star-req-item';
        
        document.querySelector('#req-star-1 .req-check').innerText = star1 ? '✅' : '⬜';
        document.querySelector('#req-star-2 .req-check').innerText = star2 ? '✅' : '⬜';
        document.querySelector('#req-star-3 .req-check').innerText = star3 ? '✅' : '⬜';

        document.getElementById('arch-star-1').className = 'arch-star';
        document.getElementById('arch-star-2').className = 'arch-star';
        document.getElementById('arch-star-3').className = 'arch-star';

        document.getElementById('screen-win').classList.remove('hidden');
        document.getElementById('touch-controls')?.classList.add('hidden');
        
        // Staggered Arch Star Animation
        setTimeout(() => {
            if (star1) {
                document.getElementById('arch-star-1').classList.add('earned');
                document.getElementById('req-star-1').classList.add('completed');
                audio.playStar();
            }
        }, 500);
        setTimeout(() => {
            if (star2) {
                document.getElementById('arch-star-2').classList.add('earned');
                document.getElementById('req-star-2').classList.add('completed');
                audio.playStar();
            }
        }, 1100);
        setTimeout(() => {
            if (star3) {
                document.getElementById('arch-star-3').classList.add('earned');
                document.getElementById('req-star-3').classList.add('completed');
                audio.playStar();
            }
        }, 1700);

        admob.showInterstitialAd();
    }

    showToast(msg) {
        let toast = document.getElementById('game-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'game-toast';
            toast.className = 'game-toast';
            const container = document.getElementById('game-container') || document.body;
            container.appendChild(toast);
        }
        toast.innerText = msg;
        toast.classList.remove('show');
        void toast.offsetWidth; // trigger reflow
        toast.classList.add('show');
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    drawMenuBackground() {
        const time = Date.now() * 0.002;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // 1. Vibrant Sunny Sky Gradient (Azure Blue -> Sky Blue -> Meadow Mint)
        const skyGrad = this.getCachedGradient('menu_sky_grad', (ctx) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#0284c7'); // Deep Azure Blue
            g.addColorStop(0.5, '#38bdf8'); // Bright Sky Blue
            g.addColorStop(1, '#a7f3d0'); // Soft Meadow Mint
            return g;
        });
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, w, h);

        // 2. Bright Golden Sun with Rotating Radiant Rays ☀️
        const sunX = w * 0.86;
        const sunY = 72;

        // Rotating Sunbeams
        this.ctx.save();
        this.ctx.translate(sunX, sunY);
        this.ctx.rotate(time * 0.15);
        this.ctx.fillStyle = 'rgba(254, 240, 138, 0.18)';
        for (let r = 0; r < 8; r++) {
            this.ctx.rotate(Math.PI / 4);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(-14, 90);
            this.ctx.lineTo(14, 90);
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.ctx.restore();

        // Sun Glow Halo
        const sunGlow = this.getCachedGradient('menu_sun_glow', (ctx) => {
            const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 65);
            g.addColorStop(0, 'rgba(255, 235, 59, 0.9)');
            g.addColorStop(0.5, 'rgba(255, 214, 0, 0.35)');
            g.addColorStop(1, 'rgba(255, 214, 0, 0)');
            return g;
        });
        this.ctx.save();
        this.ctx.translate(sunX, sunY);
        this.ctx.fillStyle = sunGlow;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 65, 0, Math.PI * 2);
        this.ctx.fill();
        // Golden Sun Core
        this.ctx.fillStyle = '#fde047';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 36, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // 3. Layered Parallax Clouds ☁️
        // Distant slow clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        for (let i = 0; i < 4; i++) {
            let cx = (i * 240 + time * 12) % (w + 140) - 70;
            let cy = 35 + (i % 2) * 25;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, 18, 0, Math.PI * 2);
            this.ctx.arc(cx + 18, cy - 8, 22, 0, Math.PI * 2);
            this.ctx.arc(cx + 38, cy, 18, 0, Math.PI * 2);
            this.ctx.fill();
        }
        // Near fluffy clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        for (let i = 0; i < 5; i++) {
            let cx = (i * 190 + time * 24) % (w + 130) - 65;
            let cy = 55 + (i % 3) * 26;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, 22, 0, Math.PI * 2);
            this.ctx.arc(cx + 22, cy - 10, 28, 0, Math.PI * 2);
            this.ctx.arc(cx + 48, cy, 22, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 4. Distant Azure Mountains 🏔️
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.beginPath();
        this.ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 30) {
            const my = h - 160 + Math.sin(x * 0.004) * 45 + Math.cos(x * 0.008) * 25;
            this.ctx.lineTo(x, my);
        }
        this.ctx.lineTo(w, h);
        this.ctx.fill();

        // 5. Parallax Mid Rolling Hills (#059669)
        this.ctx.fillStyle = '#059669';
        this.ctx.beginPath();
        this.ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 15) {
            const hy = h - 118 + Math.sin(time * 0.4 + x * 0.006) * 26;
            this.ctx.lineTo(x, hy);
        }
        this.ctx.lineTo(w, h);
        this.ctx.fill();

        // 6. Parallax Front Lush Green Meadow (#10b981)
        this.ctx.fillStyle = '#10b981';
        this.ctx.beginPath();
        this.ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 15) {
            const hy = h - 75 + Math.sin(time * 0.8 + x * 0.01 + 1.5) * 18;
            this.ctx.lineTo(x, hy);
        }
        this.ctx.lineTo(w, h);
        this.ctx.fill();

        // 7. Ground-Integrated Blooming Flowers & Grass Tufts 🌸🌼🌷
        const flowerPalette = [
            { petal: '#f43f5e', center: '#fde047', type: 'rose' },
            { petal: '#ffffff', center: '#eab308', type: 'daisy' },
            { petal: '#a855f7', center: '#facc15', type: 'violet' },
            { petal: '#fb923c', center: '#713f12', type: 'sunflower' },
            { petal: '#ec4899', center: '#fef08a', type: 'tulip' }
        ];

        for (let fl = 0; fl < 16; fl++) {
            const flX = 25 + fl * 60;
            const groundY = h - 75 + Math.sin(time * 0.8 + flX * 0.01 + 1.5) * 18;
            const fInfo = flowerPalette[fl % flowerPalette.length];
            const stemH = 14 + (fl % 3) * 4;
            const sway = Math.sin(time * 2.2 + fl * 0.8) * 3;

            this.ctx.save();
            
            // Grass tuft at the base
            this.ctx.strokeStyle = '#059669';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(flX - 4, groundY + 2);
            this.ctx.lineTo(flX - 8, groundY - 7);
            this.ctx.moveTo(flX + 4, groundY + 2);
            this.ctx.lineTo(flX + 8, groundY - 7);
            this.ctx.stroke();

            // Stem rising from the ground
            this.ctx.strokeStyle = '#15803d';
            this.ctx.lineWidth = 2.2;
            this.ctx.beginPath();
            this.ctx.moveTo(flX, groundY + 1);
            this.ctx.quadraticCurveTo(flX + sway * 0.5, groundY - stemH * 0.5, flX + sway, groundY - stemH);
            this.ctx.stroke();

            // Little green leaves
            this.ctx.fillStyle = '#22c55e';
            this.ctx.beginPath();
            this.ctx.ellipse(flX + sway * 0.4 - 4, groundY - stemH * 0.45, 4, 2, -Math.PI / 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.ellipse(flX + sway * 0.4 + 4, groundY - stemH * 0.45, 4, 2, Math.PI * 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Flower Head
            const headX = flX + sway;
            const headY = groundY - stemH;

            // Petals
            this.ctx.fillStyle = fInfo.petal;
            for (let p = 0; p < 5; p++) {
                const angle = (p * Math.PI * 2) / 5 + time * 0.5;
                const px = headX + Math.cos(angle) * 5.5;
                const py = headY + Math.sin(angle) * 5.5;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Flower Center
            this.ctx.fillStyle = fInfo.center;
            this.ctx.beginPath();
            this.ctx.arc(headX, headY, 3.5, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        }

        // 8. Animated Butterflies 🦋 Fluttering Playfully
        for (let b = 0; b < 3; b++) {
            const bx = (b * 280 + time * 38) % (w + 60) - 30;
            const by = h - 110 + Math.sin(time * 3 + b * 2) * 22;
            const flap = Math.sin(time * 12 + b * 3) * 0.7;
            this.ctx.save();
            this.ctx.translate(bx, by);
            this.ctx.fillStyle = b === 0 ? '#ff4081' : (b === 1 ? '#00e5ff' : '#ffd600');
            // Left Wing
            this.ctx.beginPath();
            this.ctx.ellipse(-3, 0, 4 * Math.abs(flap), 6, -0.3, 0, Math.PI * 2);
            this.ctx.fill();
            // Right Wing
            this.ctx.beginPath();
            this.ctx.ellipse(3, 0, 4 * Math.abs(flap), 6, 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            // Body
            this.ctx.fillStyle = '#212121';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 9. Animated Equipped Hero Bouncing Happily on the Meadow!
        const heroX = w * 0.14;
        const jumpY = Math.abs(Math.sin(time * 3.5)) * 26;
        const groundY = h - 75 + Math.sin(time * 0.8 + heroX * 0.01 + 1.5) * 18;
        const heroY = groundY - 20 - jumpY;

        // Shadow on ground
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        this.ctx.beginPath();
        this.ctx.ellipse(heroX, groundY + 4, 18 - jumpY * 0.2, 5.5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Render the equipped character using Player.draw!
        if (this.player) {
            const origX = this.player.x, origY = this.player.y, origFacing = this.player.facing, origSkin = this.player.currentSkinId;
            this.player.x = heroX - this.player.width / 2;
            this.player.y = heroY - this.player.height / 2;
            this.player.facing = 'right';
            this.player.currentSkinId = this.progress.equippedSkin || 'bunny';
            this.player.draw(this.ctx, { x: 0, y: 0 });
            this.player.x = origX;
            this.player.y = origY;
            this.player.facing = origFacing;
            this.player.currentSkinId = origSkin;
        }
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        let deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Cap deltaTime to prevent spiral of death on lag spikes
        if (deltaTime > 0.25) deltaTime = 0.25;

        this.updateStatsUI();
        if (this.state === 'PLAYING') {
            this.accumulator += deltaTime;

            // Run update multiple times if running on low Hz display,
            // or fewer times (skipping frames) on high Hz displays (90Hz, 120Hz)
            while (this.accumulator >= this.fixedStep) {
                this.levelTimer += this.fixedStep;
                this.update();
                this.accumulator -= this.fixedStep;
            }

            this.updateHUD();
            this.draw();
        } else {
            this.drawMenuBackground();
        }
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

        // Rich Atmospheric Sky Gradient (Cached per theme)
        const themeKey = theme.name || 'default';
        const skyGrad = this.getCachedGradient('sky_' + themeKey, (ctx) => {
            const g = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            g.addColorStop(0, theme.skyGradient ? theme.skyGradient[0] : theme.bg);
            g.addColorStop(1, theme.skyGradient ? theme.skyGradient[1] : "#ffffff");
            return g;
        });
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
            this.ctx.translate(hx, hy);
            // Glow shadow
            this.ctx.shadowColor = '#ff1744';
            this.ctx.shadowBlur = 10;

            const spikeGradient = this.getCachedGradient('spike_metal_grad', (ctx) => {
                const g = ctx.createLinearGradient(0, 18, 0, 0);
                g.addColorStop(0, '#1a1a1a');
                g.addColorStop(0.6, '#d50000');
                g.addColorStop(1, '#ff5252');
                return g;
            });

            this.ctx.fillStyle = spikeGradient;
            this.ctx.strokeStyle = '#ffd600';
            this.ctx.lineWidth = 1.5;

            this.ctx.beginPath();
            this.ctx.moveTo(0, h.height);
            this.ctx.lineTo(h.width / 2, 0);
            this.ctx.lineTo(h.width, h.height);
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
            if (c.collected && c.type !== 'exit' && c.type !== 'exit_door') return;
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
                const grad = this.getCachedGradient('strawberry_grad', (ctx) => {
                    const g = ctx.createRadialGradient(-3, -1, 2, 0, 2, 10);
                    g.addColorStop(0, '#ff4d6d');
                    g.addColorStop(0.7, '#d90429');
                    g.addColorStop(1, '#800f2f');
                    return g;
                });
                this.ctx.fillStyle = grad;
                this.ctx.beginPath(); this.ctx.arc(0, 2, 10, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.fillStyle = '#ffeb3b';
                this.ctx.fillRect(-3, -2, 1.5, 1.5); this.ctx.fillRect(3, 1, 1.5, 1.5); this.ctx.fillRect(-1, 5, 1.5, 1.5);
                this.ctx.fillStyle = '#55a630';
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0); this.ctx.lineTo(-6, -8); this.ctx.lineTo(-2, -5); this.ctx.lineTo(0, -9); this.ctx.lineTo(2, -5); this.ctx.lineTo(6, -8);
                this.ctx.fill();
            } else if (c.type === 'apple') {
                const grad = this.getCachedGradient('apple_grad', (ctx) => {
                    const g = ctx.createRadialGradient(-2, -2, 2, 0, 0, 10);
                    g.addColorStop(0, '#ff5252');
                    g.addColorStop(0.7, '#d50000');
                    g.addColorStop(1, '#8e0000');
                    return g;
                });
                this.ctx.fillStyle = grad;
                this.ctx.beginPath(); this.ctx.arc(0, 0, 10, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.strokeStyle = '#5d4037';
                this.ctx.beginPath(); this.ctx.moveTo(0, -9); this.ctx.quadraticCurveTo(3, -13, 2, -14); this.ctx.lineWidth=2; this.ctx.stroke();
                this.ctx.fillStyle = '#64dd17';
                this.ctx.beginPath(); this.ctx.ellipse(3, -11, 4, 2, Math.PI/4, 0, Math.PI * 2); this.ctx.fill();
            } else if (c.type === 'banana') {
                // 1. Banana Body Gradient (Bright vivid golden yellow)
                const grad = this.getCachedGradient('banana_grad', (ctx) => {
                    const g = ctx.createLinearGradient(-9, -9, 9, 9);
                    g.addColorStop(0, '#fffb7d');
                    g.addColorStop(0.35, '#ffea00');
                    g.addColorStop(0.85, '#ffd600');
                    g.addColorStop(1, '#ffab00');
                    return g;
                });
                
                // Banana Crescent Arch Path
                this.ctx.beginPath();
                this.ctx.moveTo(-10, -5);
                this.ctx.bezierCurveTo(-4, -12, 6, -8, 12, 4); // outer curve
                this.ctx.quadraticCurveTo(13, 7, 10, 7);       // bottom tip curve
                this.ctx.bezierCurveTo(4, -1, -3, -4, -9, -3); // inner crescent curve
                this.ctx.closePath();
                this.ctx.fillStyle = grad;
                this.ctx.fill();

                // 2. Glossy Highlight Streak
                this.ctx.beginPath();
                this.ctx.moveTo(-7, -7);
                this.ctx.bezierCurveTo(-2, -9.5, 4, -6.5, 8, 2);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
                this.ctx.lineWidth = 1.6;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();

                // 3. Green-Yellow Base & Dark Brown Stem
                this.ctx.fillStyle = '#c0ca33'; // greenish base
                this.ctx.fillRect(-11, -6, 2.5, 3);
                this.ctx.fillStyle = '#4e342e'; // dark stem
                this.ctx.fillRect(-13, -7.5, 2.5, 2.5);

                // 4. Dark Bottom Tip
                this.ctx.fillStyle = '#3e2723';
                this.ctx.beginPath();
                this.ctx.arc(11.5, 5.5, 1.2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (c.type === 'grapes') {
                const grapeGrad = this.getCachedGradient('grape_grad', (ctx) => {
                    const g = ctx.createRadialGradient(-1, -1, 1, 0, 0, 4);
                    g.addColorStop(0, '#e040fb');
                    g.addColorStop(0.7, '#aa00ff');
                    g.addColorStop(1, '#4a148c');
                    return g;
                });
                const drawGrape = (gx, gy) => {
                    this.ctx.save();
                    this.ctx.translate(gx, gy);
                    this.ctx.fillStyle = grapeGrad;
                    this.ctx.beginPath(); this.ctx.arc(0, 0, 4, 0, Math.PI * 2); this.ctx.fill();
                    this.ctx.restore();
                };
                drawGrape(0, -6); drawGrape(-4, -2); drawGrape(4, -2); drawGrape(-2, 3); drawGrape(2, 3); drawGrape(0, 7);
                this.ctx.fillStyle = '#64dd17';
                this.ctx.beginPath(); this.ctx.ellipse(0, -10, 4, 2, 0, 0, Math.PI*2); this.ctx.fill();
                this.ctx.fillStyle = '#5d4037';
                this.ctx.fillRect(-1, -11, 2, 3);
            } else if (c.type === 'orange') {
                const grad = this.getCachedGradient('orange_grad', (ctx) => {
                    const g = ctx.createRadialGradient(-3, -3, 2, 0, 0, 10);
                    g.addColorStop(0, '#ffab40');
                    g.addColorStop(0.7, '#ff6d00');
                    g.addColorStop(1, '#e65100');
                    return g;
                });
                this.ctx.fillStyle = grad;
                this.ctx.beginPath(); this.ctx.arc(0, 0, 10, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.fillStyle = '#e65100';
                this.ctx.beginPath(); this.ctx.arc(-2, 2, 0.5, 0, Math.PI*2); this.ctx.fill();
                this.ctx.beginPath(); this.ctx.arc(3, 1, 0.5, 0, Math.PI*2); this.ctx.fill();
                this.ctx.beginPath(); this.ctx.arc(1, 4, 0.5, 0, Math.PI*2); this.ctx.fill();
                this.ctx.fillStyle = '#64dd17';
                this.ctx.beginPath(); this.ctx.ellipse(0, -10, 4, 2, -Math.PI/6, 0, Math.PI*2); this.ctx.fill();
            } else if (c.type === 'watermelon') {
                const grad = this.getCachedGradient('watermelon_grad', (ctx) => {
                    const g = ctx.createLinearGradient(0, -11, 0, 0);
                    g.addColorStop(0, '#2e7d32');
                    g.addColorStop(0.5, '#4caf50');
                    g.addColorStop(1, '#a5d6a7');
                    return g;
                });
                this.ctx.fillStyle = grad;
                this.ctx.beginPath(); this.ctx.arc(0, 0, 11, 0, Math.PI); this.ctx.fill();
                this.ctx.fillStyle = '#ff1744';
                this.ctx.beginPath(); this.ctx.arc(0, -1, 8, 0, Math.PI); this.ctx.fill();
                this.ctx.fillStyle = '#212121';
                this.ctx.beginPath(); this.ctx.ellipse(-3, -3, 1.5, 2, Math.PI/6, 0, Math.PI*2); this.ctx.fill();
                this.ctx.beginPath(); this.ctx.ellipse(3, -3, 1.5, 2, -Math.PI/6, 0, Math.PI*2); this.ctx.fill();
                this.ctx.beginPath(); this.ctx.ellipse(0, -6, 1.5, 2, 0, 0, Math.PI*2); this.ctx.fill();
            } else if (c.type === 'exit' || c.type === 'exit_door') {
                // 🚪✨ Theme-Fitted Magical Kingdom Star Gate Portal Door!
                const isUnlocked = this.player.hasGoldenKey || c.doorOpen;
                const platY = c.platformRef ? c.platformRef.y : (c.y + 50);
                const time = Date.now();
                
                this.ctx.restore();
                this.ctx.save();
                this.ctx.translate(c.x - this.camera.x + 15, platY - this.camera.y);

                // Portal Aura Glow
                this.ctx.shadowColor = isUnlocked ? '#00f0ff' : '#ffab00';
                this.ctx.shadowBlur = isUnlocked ? 24 : 12;

                // 1. Royal Stone Pillars Arch Frame (Amethyst & Gold)
                this.ctx.fillStyle = '#1e1b4b'; // Royal Midnight Stone
                this.ctx.beginPath();
                this.ctx.roundRect(-27, -80, 54, 80, [27, 27, 0, 0]);
                this.ctx.fill();

                // Ornate Golden Arch Border
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.lineWidth = 3.5;
                this.ctx.stroke();

                // Inner Arch Gold Inlay
                this.ctx.strokeStyle = 'rgba(255, 214, 0, 0.4)';
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.roundRect(-23, -76, 46, 76, [23, 23, 0, 0]);
                this.ctx.stroke();

                // 2. Apex Keystone Gem (Pulsing Star Crystal 💎)
                this.ctx.save();
                const gemGlow = isUnlocked ? '#00f0ff' : '#ffd600';
                this.ctx.shadowColor = gemGlow;
                this.ctx.shadowBlur = 12;
                this.ctx.fillStyle = isUnlocked ? '#00e5ff' : '#ff9100';
                this.ctx.beginPath();
                // 4-point Diamond Crystal at Top Apex
                this.ctx.moveTo(0, -84);
                this.ctx.lineTo(6, -78);
                this.ctx.lineTo(0, -72);
                this.ctx.lineTo(-6, -78);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(0, -78, 1.8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();

                // 3. Inner Cosmic Portal Void
                const doorGrad = this.getCachedGradient('magical_door_portal_grad', (ctx) => {
                    const g = ctx.createLinearGradient(0, -74, 0, 0);
                    g.addColorStop(0, '#00f0ff');
                    g.addColorStop(0.4, '#e040fb');
                    g.addColorStop(0.8, '#7c4dff');
                    g.addColorStop(1, '#1a0033');
                    return g;
                });
                this.ctx.fillStyle = doorGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(-20, -73, 40, 73, [20, 20, 0, 0]);
                this.ctx.fill();

                // Swirling Cosmic Vortex Rings inside portal
                if (isUnlocked) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.roundRect(-20, -73, 40, 73, [20, 20, 0, 0]);
                    this.ctx.clip();

                    // Swirling Nebula Rings
                    const rot = time * 0.003;
                    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, -36, 14, 22, rot, 0, Math.PI * 2);
                    this.ctx.stroke();

                    this.ctx.strokeStyle = 'rgba(224, 64, 251, 0.45)';
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, -36, 10, 16, -rot * 1.3, 0, Math.PI * 2);
                    this.ctx.stroke();

                    // Sparkling Stardust Particles
                    this.ctx.fillStyle = '#ffffff';
                    for (let sp = 0; sp < 4; sp++) {
                        const spA = rot * 2 + sp * (Math.PI / 2);
                        const spX = Math.cos(spA) * (6 + sp * 2.5);
                        const spY = -36 + Math.sin(spA) * (10 + sp * 3);
                        this.ctx.beginPath();
                        this.ctx.arc(spX, spY, 1.2 + (sp % 2) * 0.8, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    this.ctx.restore();
                }

                // 4. Sliding Fantasy Doors Progress (0 to 1)
                let openProgress = 0;
                if (c.doorOpen && this.player.entryTimer) {
                    openProgress = 1 - (this.player.entryTimer / 30);
                }

                // Apply clipping mask for door panels
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.roundRect(-20, -73, 40, 73, [20, 20, 0, 0]);
                this.ctx.clip();

                const slideDist = 20 * openProgress; // slides up to 20px left and right

                // Midnight Indigo Fantasy Panels with Golden Filigree
                this.ctx.fillStyle = '#0f172a';
                
                // Left Panel
                this.ctx.beginPath();
                this.ctx.roundRect(-20 - slideDist, -73, 20, 73, [20, 0, 0, 0]);
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();

                // Left Filigree Arc
                this.ctx.strokeStyle = 'rgba(255, 214, 0, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(-10 - slideDist, -36, 6, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Right Panel
                this.ctx.fillStyle = '#0f172a';
                this.ctx.beginPath();
                this.ctx.roundRect(0 + slideDist, -73, 20, 73, [0, 20, 0, 0]);
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();

                // Right Filigree Arc
                this.ctx.strokeStyle = 'rgba(255, 214, 0, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(10 + slideDist, -36, 6, 0, Math.PI * 2);
                this.ctx.stroke();
                
                this.ctx.restore(); // Remove clipping mask

                // 5. Golden Star Emblem Lock Badge (When not opened)
                if (!c.doorOpen) {
                    this.ctx.save();
                    this.ctx.translate(0, -36);

                    if (isUnlocked) {
                        // Unlocked: Glowing Cyan Star Sigil 🌟
                        this.ctx.shadowColor = '#00f0ff';
                        this.ctx.shadowBlur = 14;
                        this.ctx.fillStyle = '#00f0ff';
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, 7, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else {
                        // Locked: Golden Star Padlock 🔒✨
                        this.ctx.shadowColor = '#ffd600';
                        this.ctx.shadowBlur = 10;

                        // Padlock Shackle
                        this.ctx.strokeStyle = '#ffd600';
                        this.ctx.lineWidth = 3;
                        this.ctx.beginPath();
                        this.ctx.arc(0, -6, 6, Math.PI, 0);
                        this.ctx.stroke();

                        // Padlock Body (Golden Star Shield)
                        this.ctx.fillStyle = '#ffb300';
                        this.ctx.beginPath();
                        this.ctx.roundRect(-8, -2, 16, 15, 4);
                        this.ctx.fill();
                        this.ctx.strokeStyle = '#ffe082';
                        this.ctx.lineWidth = 1.5;
                        this.ctx.stroke();

                        // Glowing Ruby Keyhole Center
                        this.ctx.fillStyle = '#ff1744';
                        this.ctx.beginPath();
                        this.ctx.arc(0, 4, 2.5, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    this.ctx.restore();
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
