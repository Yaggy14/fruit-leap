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
        dailySpin: "🎁 GÜNLÜK ÇARK",
        freeLife: "📺 ÜCRETSİZ CAN (+1 ❤️)",
        settings: "⚙️ Ayarlar",
        studioPresents: "GURURLA SUNAR",
        tapToStart: "BAŞLAMAK İÇİN DOKUNUN",

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
        score: "PUAN",
        best: "EN İYİ",
        newRecord: "🔥 YENİ REKOR!",

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
        close: "✔ Kapat",

        // Lucky Spin Modal
        dailySpinTitle: "🎁 GÜNLÜK ŞANS ÇARKI",
        dailySpinDesc: "Her 24 saatte bir ücretsiz çarkı çevir, sürpriz ödülleri topla!",
        spinWheelBtn: "🎡 ÇARK'I ÇEVİR!",
        spinWheelFreeBtn: "🎡 ÇARKI ÇEVİR (ÜCRETSİZ!)",
        spinCooldownBtn: "⏳ BEKLEMEDE",
        spinNextIn: "Sonraki Çevirme:",
        spinCloseBtn: "KAPAT",
        spinPrizeStars: "⭐ Tebrikler! +{val} YILDIZ KAZANDIN!",
        spinPrizeLife: "❤️ Harika! +{val} EKSTRA CAN KAZANDIN!",
        spinPrizePower: "🎁 BÜYÜLÜ ÖDÜL! +30 Yıldız Kazandın!"
    },
    en: {
        stars: "STARS",
        playGame: "▶ PLAY GAME",
        storyQuest: "📖 STORY & QUEST",
        chapters: "🗺️ CHAPTERS",
        shop: "🛍️ CHARACTER SHOP",
        dailySpin: "🎁 LUCKY SPIN",
        freeLife: "📺 FREE LIFE (+1 ❤️)",
        settings: "⚙️ Settings",
        studioPresents: "PROUDLY PRESENTS",
        tapToStart: "TAP TO START",

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
        score: "SCORE",
        best: "BEST",
        newRecord: "🔥 NEW RECORD!",

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
        close: "✔ Close",

        // Lucky Spin Modal
        dailySpinTitle: "🎁 DAILY LUCKY SPIN",
        dailySpinDesc: "Spin the wheel for free every 24 hours to collect awesome rewards!",
        spinWheelBtn: "🎡 SPIN THE WHEEL!",
        spinWheelFreeBtn: "🎡 SPIN WHEEL (FREE!)",
        spinCooldownBtn: "⏳ ON COOLDOWN",
        spinNextIn: "Next Free Spin in:",
        spinCloseBtn: "CLOSE",
        spinPrizeStars: "⭐ Congratulations! +{val} STARS WON!",
        spinPrizeLife: "❤️ Awesome! +{val} EXTRA LIFE WON!",
        spinPrizePower: "🎁 MAGIC REWARD! +30 Stars Won!"
    }
};

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => setTimeout(() => this.resizeCanvas(), 150));

        this.lang = localStorage.getItem('game_lang') || 'tr';
        this.state = 'MENU';
        this.currentChapterIdx = 0;
        this.currentLevelIdx = 0;

        this.score = 0;
        this.levelStartScore = 0;
        this.lives = 3;
        this.levelTimer = 0;
        this.fruitsCollected = 0;
        this.floatingTexts = [];
        this.confettiParticles = [];
        this.screenShakeTimer = 0;
        this.screenShakeIntensity = 0;
        this.activePowerUp = null;
        this.activePowerUpTimer = 0;
        if (this.player) {
            this.player.hasBubbleShield = false;
            this.player.hasMagnet = false;
            this.player.hasSpeedBoost = false;
        }
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
        this.ambientParticles = [];

        this.init();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const aspect = window.innerWidth / Math.max(1, window.innerHeight);
        this.canvas.height = 540;
        // Calculate width to match exact screen aspect ratio (min 960 up to 1350 for ultra-widescreen)
        this.canvas.width = Math.round(540 * Math.max(16 / 9, Math.min(22 / 9, aspect)));
        
        // Reset gradient cache so gradients scale perfectly to new width
        if (this.cache && this.cache.gradients) {
            this.cache.gradients = {};
        }
    }

    init() {
        this.resizeCanvas();
        this.bindEvents();
        this.updateStatsUI();
        this.renderChapterChips();
        this.renderLevelGrid(1);
        this.renderShopGrid();
        this.initSplashScreen();

        requestAnimationFrame((t) => this.loop(t));
    }

    initSplashScreen() {
        const splashScreen = document.getElementById('screen-splash');
        if (!splashScreen) {
            this.showScreen('screen-main-menu');
            return;
        }

        const barFill = document.getElementById('splash-bar-fill');
        const percentText = document.getElementById('splash-percent-val');
        const loadingText = document.getElementById('splash-loading-text');
        const tapContainer = document.getElementById('splash-tap-container');
        const barOuter = document.getElementById('splash-bar-outer');
        const btnStart = document.getElementById('btn-splash-start');

        const isTr = (this.lang === 'tr');
        const tips = isTr ? [
            "SETOGI dünyasına hoş geldiniz...",
            "Tavşan Piko havuçları topluyor...",
            "25 Yıldız Anahtarı boyut portallarına yerleştiriliyor...",
            "Sesler ve seviyeler optimize ediliyor...",
            "Macera başlamak üzere! Hazır ol..."
        ] : [
            "Welcome to the SETOGI universe...",
            "Bunny Piko is gathering carrots...",
            "25 Star Keys placed in dimensional portals...",
            "Optimizing sound effects and level worlds...",
            "Adventure is about to begin! Get ready..."
        ];

        let progress = 0;
        let tipIdx = 0;

        // Try playing splash intro audio if permitted
        setTimeout(() => {
            try { audio.playSplashIntro(); } catch (e) {}
        }, 150);

        const interval = setInterval(() => {
            // Smooth natural progress increment
            progress += Math.floor(Math.random() * 5) + 3;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }

            if (barFill) barFill.style.width = `${progress}%`;
            if (percentText) percentText.innerText = `${progress}%`;

            // Cycle dynamic tips
            const targetTipIdx = Math.min(tips.length - 1, Math.floor((progress / 100) * tips.length));
            if (targetTipIdx !== tipIdx && loadingText) {
                tipIdx = targetTipIdx;
                loadingText.style.opacity = '0';
                setTimeout(() => {
                    if (loadingText) {
                        loadingText.innerText = tips[tipIdx];
                        loadingText.style.opacity = '1';
                    }
                }, 120);
            }

            if (progress >= 100) {
                setTimeout(() => {
                    if (barOuter) barOuter.classList.add('hidden');
                    if (tapContainer) tapContainer.classList.remove('hidden');
                }, 280);
            }
        }, 40);

        // Tap to Enter Game & Play BGM
        let entered = false;
        const enterGame = () => {
            if (entered) return;
            entered = true;
            try { audio.playSplashTap(); } catch (e) {}
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.classList.add('hidden');
                this.showScreen('screen-main-menu');
                try { audio.playBGM('menu'); } catch (e) {}
            }, 450);
        };

        if (btnStart) {
            btnStart.addEventListener('click', (e) => {
                e.stopPropagation();
                enterGame();
            });
            btnStart.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                enterGame();
            }, { passive: true });
        }

        splashScreen.addEventListener('click', () => {
            if (progress >= 100) enterGame();
        });
        splashScreen.addEventListener('touchstart', () => {
            if (progress >= 100) enterGame();
        }, { passive: true });
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
        document.getElementById('btn-daily-spin')?.addEventListener('click', () => {
            this.showScreen('screen-daily-spin');
            this.initDailySpin();
        });
        document.getElementById('btn-close-daily-spin')?.addEventListener('click', () => this.showScreen('screen-main-menu'));
        document.getElementById('btn-spin-wheel')?.addEventListener('click', () => this.spinDailyWheel());

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

        // Death Choice Modal Buttons
        document.getElementById('btn-death-revive-ad')?.addEventListener('click', () => {
            admob.showRewardedAd(() => {
                this.revivePlayerFromDeath();
            });
        });
        document.getElementById('btn-death-retry')?.addEventListener('click', () => {
            // Decrement 1 life and restart from beginning
            this.progress.globalLives = Math.max(0, (this.progress.globalLives || 1) - 1);
            if (this.progress.globalLives < 5 && !this.progress.lastHeartRegenTime) {
                this.progress.lastHeartRegenTime = Date.now();
            }
            this.saveProgress();
            this.updateStatsUI();
            document.getElementById('screen-death-choice')?.classList.add('hidden');
            this.restartLevel();
        });
        document.getElementById('btn-death-menu')?.addEventListener('click', () => {
            this.progress.globalLives = Math.max(0, (this.progress.globalLives || 1) - 1);
            if (this.progress.globalLives < 5 && !this.progress.lastHeartRegenTime) {
                this.progress.lastHeartRegenTime = Date.now();
            }
            this.saveProgress();
            this.updateStatsUI();
            this.showScreen('screen-main-menu');
        });

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
        
        this.initDailySpin();
        this.checkDailySpinStatus();
    }

    renderChapterChips() {
        const container = document.getElementById('chapter-scroll');
        if (!container) return;
        container.innerHTML = '';

        const starsSpan = document.getElementById('select-total-stars-val');
        if (starsSpan) starsSpan.innerText = this.progress.totalStars || 0;

        CHAPTERS.forEach((c) => {
            const chip = document.createElement('div');
            const isFinal = (c.id === 25);
            const isActive = c.id === (this.currentChapterIdx + 1 || 1);
            chip.className = `chapter-chip ${isActive ? 'active' : ''} ${isFinal ? 'chip-final' : ''}`;
            
            let label = `Ch.${c.id}`;
            if (c.id === 0) label = 'Ch.0 🧪';
            else if (isFinal) label = 'Ch.25 👑 FINAL';
            
            chip.innerText = label;
            chip.addEventListener('click', () => {
                document.querySelectorAll('.chapter-chip').forEach(ch => ch.classList.remove('active'));
                chip.classList.add('active');
                chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                audio.playJump();
                this.renderLevelGrid(c.id);
            });
            container.appendChild(chip);
        });

        // Initial render for active chapter
        this.renderLevelGrid(this.currentChapterIdx + 1 || 1);
    }

    renderLevelGrid(chapterId) {
        const grid = document.getElementById('level-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const chapter = CHAPTERS.find(c => c.id === chapterId);
        if (!chapter) return;

        const chapterIdx = CHAPTERS.findIndex(c => c.id === chapterId);
        const isTr = (this.lang === 'tr');

        // Update active Chapter Info Banner
        const bannerText = document.getElementById('chapter-title-text');
        if (bannerText) {
            bannerText.innerText = `${chapter.title || `Chapter ${chapterId}: ${chapter.theme.name}`}`;
        }

        const playText = isTr ? 'OYNA' : 'PLAY';

        chapter.levels.forEach((lvl, idx) => {
            const card = document.createElement('div');
            const lvlCode = `${chapterId}-${idx + 1}`;
            const stars = this.progress.levelStars[lvlCode] || 0;
            const highScore = (this.progress.highScores && this.progress.highScores[lvlCode]) ? this.progress.highScores[lvlCode] : 0;
            const scoreLabel = highScore > 0 ? `🏆 ${highScore.toLocaleString()}` : `<span style="opacity:0.45;">🏆 ---</span>`;
            const isBoss = !!lvl.isBossLevel;

            card.className = `level-card ${isBoss ? 'boss-card' : ''}`;
            
            let bossTagHtml = isBoss ? `<div class="level-boss-tag">👑 BOSS</div>` : '';

            card.innerHTML = `
                ${bossTagHtml}
                <div class="level-num">${isBoss ? '👑 Boss' : `Level ${idx + 1}`}</div>
                <div class="level-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
                <div class="level-score-badge">${scoreLabel}</div>
                <div class="level-play-btn">${playText}</div>
            `;
            card.addEventListener('click', () => {
                audio.playJump();
                this.startLevel(chapterIdx, idx);
            });
            grid.appendChild(card);
        });
    }

    renderShopGrid() {
        const container = document.getElementById('shop-grid');
        if (!container) return;
        container.innerHTML = '';

        const starsSpan = document.getElementById('shop-total-stars');
        if (starsSpan) starsSpan.innerText = this.progress.totalStars || 0;

        const isTr = (this.lang === 'tr');

        CHARACTER_SKINS.forEach(skin => {
            const isUnlocked = this.progress.unlockedSkins.includes(skin.id);
            const isEquipped = this.progress.equippedSkin === skin.id;

            const card = document.createElement('div');
            card.className = `shop-card ${isEquipped ? 'equipped' : (isUnlocked ? 'unlocked' : 'locked')}`;

            let btnMarkup = '';
            if (isEquipped) {
                btnMarkup = `<button class="btn btn-shop-action btn-equipped" disabled>✓ ${isTr ? 'SEÇİLİ' : 'EQUIPPED'}</button>`;
            } else if (isUnlocked) {
                btnMarkup = `<button class="btn btn-shop-action btn-equip">${isTr ? 'SEÇ' : 'SELECT'}</button>`;
            } else {
                btnMarkup = `<button class="btn btn-shop-action btn-buy-star">⭐ ${skin.priceStars}</button>`;
            }

            card.innerHTML = `
                <div class="char-icon">${skin.icon}</div>
                <div class="char-name">${skin.name}</div>
                <div class="char-perk">⚡ ${skin.speed} • ${skin.perk}</div>
                ${btnMarkup}
            `;

            const actionBtn = card.querySelector('.btn-shop-action');
            if (actionBtn && !isEquipped) {
                actionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isUnlocked) {
                        this.progress.equippedSkin = skin.id;
                        this.player.currentSkinId = skin.id;
                        this.saveProgress();
                        audio.playCoin();
                        this.renderShopGrid();
                    } else {
                        if (this.progress.totalStars >= skin.priceStars) {
                            this.progress.totalStars -= skin.priceStars;
                            this.progress.unlockedSkins.push(skin.id);
                            this.progress.equippedSkin = skin.id;
                            this.player.currentSkinId = skin.id;
                            this.saveProgress();
                            audio.playWin();
                            this.renderShopGrid();
                            this.updateStatsUI();
                            this.showToast(isTr ? `🎉 ${skin.name} Açıldı!` : `🎉 ${skin.name} Unlocked!`);
                        } else {
                            audio.playHurt();
                            const need = skin.priceStars - (this.progress.totalStars || 0);
                            const msg = isTr ? `⭐ ${need} Yıldız daha gerekiyor!` : `⭐ Need ${need} more Stars!`;
                            this.showToast(msg);
                        }
                    }
                });
            }

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
            this.checkDailySpinStatus();
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
        
        // Reset score for each level so each level has its own clean score
        this.score = 0;
        this.levelStartScore = 0;
        this.levelTimer = 0;
        this.fruitsCollected = 0;
        this.floatingTexts = [];
        this.confettiParticles = [];
        this.screenShakeTimer = 0;
        this.screenShakeIntensity = 0;
        this.clearActivePowerUp();

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
        let maxX = 800;
        this.platforms.forEach(p => { if (p.x + p.width > maxX) maxX = p.x + p.width; });
        this.levelMapWidth = maxX + 400;
        this.hazards = level.hazards ? level.hazards.map(h => ({
            ...h,
            platformRef: this.platforms.find(p => p.id === h.platformId)
        })) : [];
        this.overheadCeilings = level.overheadCeilings ? level.overheadCeilings.map(oc => ({
            ...oc,
            platformRef: this.platforms.find(p => p.id === oc.platformId)
        })) : [];
        this.bouncyPads = level.bouncyPads ? level.bouncyPads.map(b => ({ ...b, platformRef: this.platforms.find(p => p.id === b.platformId) })) : [];
        this.enemies = level.enemies ? level.enemies.map(e => new Enemy(e.x, e.y, e.range, this.platforms.find(p => p.id === e.platformId))) : [];
        if (level.boss) {
            const bossPlat = this.platforms.find(p => p.id === level.boss.platformId);
            this.boss = new BossEnemy(level.boss.x, level.boss.y, bossPlat, level.boss.bossType || 5);
            this.updateBossHUD();
        } else {
            this.boss = null;
            this.updateBossHUD();
        }
        this.portals = level.portals ? level.portals.map(p => ({
            ...p,
            entrance: { ...p.entrance },
            exit: { ...p.exit },
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
        const hudScoreEl = document.getElementById('hud-score');
        if (hudScoreEl) hudScoreEl.innerText = (this.score || 0).toLocaleString();
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
        this.floatingTexts = [];
        this.confettiParticles = [];
        this.screenShakeTimer = 0;
        this.screenShakeIntensity = 0;
        this.clearActivePowerUp();
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

        if ((this.progress.globalLives || 0) <= 0) {
            audio.playBGM(null);
            audio.playGameOver();
            this.state = 'GAME_OVER';
            document.querySelectorAll('.ui-screen').forEach(s => s.classList.add('hidden'));
            document.getElementById('screen-game-over').classList.remove('hidden');
            document.getElementById('touch-controls')?.classList.add('hidden');
            return;
        }

        // Show Death Choice Modal (Revive with Ad / Retry / Main Menu)
        this.state = 'DEATH_CHOICE';
        document.getElementById('touch-controls')?.classList.add('hidden');
        
        const livesSpan = document.getElementById('death-modal-lives');
        if (livesSpan) livesSpan.innerText = `${this.progress.globalLives}/5`;

        const modal = document.getElementById('screen-death-choice');
        if (modal) modal.classList.remove('hidden');
    }

    revivePlayerFromDeath() {
        // Hide Death Choice Modal
        document.getElementById('screen-death-choice')?.classList.add('hidden');
        
        // Reposition player on last safe platform (or level start if none)
        const level = CHAPTERS[this.currentChapterIdx].levels[this.currentLevelIdx];
        const respawnX = this.player.lastSafeX || level.playerStart.x;
        const respawnY = this.player.lastSafeY || level.playerStart.y;
        
        this.player.x = respawnX;
        this.player.y = respawnY;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.grounded = true;
        this.player.isDead = false;
        this.player.deathTimer = 0;
        this.player.invincibleTimer = 180; // 3 seconds invincibility after revive

        // Run 3-2-1 Animated Countdown before resuming gameplay
        this.startReviveCountdown();
    }

    startReviveCountdown() {
        const overlay = document.getElementById('countdown-overlay');
        const numEl = document.getElementById('countdown-number');
        if (!overlay || !numEl) {
            this.state = 'PLAYING';
            document.getElementById('touch-controls')?.classList.remove('hidden');
            return;
        }

        overlay.classList.remove('hidden');
        let count = 3;
        numEl.innerText = count;
        audio.playJump();

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                numEl.innerText = count;
                // Re-trigger CSS animation
                numEl.style.animation = 'none';
                void numEl.offsetWidth;
                numEl.style.animation = 'countdownPop 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                audio.playJump();
            } else if (count === 0) {
                const isTr = (this.lang === 'tr');
                numEl.innerText = isTr ? 'BAŞLA!' : 'GO!';
                numEl.style.color = '#76ff03';
                numEl.style.animation = 'none';
                void numEl.offsetWidth;
                numEl.style.animation = 'countdownPop 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                audio.playStar();
            } else {
                clearInterval(timer);
                overlay.classList.add('hidden');
                numEl.style.color = '#ffd600'; // Reset color
                this.state = 'PLAYING';
                document.getElementById('touch-controls')?.classList.remove('hidden');
            }
        }, 850);
    }

    handleWin() {
        audio.playBGM(null); // Stop BGM to hear the win fanfare
        this.clearActivePowerUp();
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

        // Score Calculation per Level
        const fruitScore = this.fruitsCollected * 100;
        const timeBonus = Math.max(0, Math.round((level.targetTime - this.levelTimer) * 25));
        const bossBonus = level.isBossLevel ? 1000 : 0;
        const currentLevelScore = fruitScore + timeBonus + bossBonus;

        this.progress.highScores = this.progress.highScores || {};
        const previousBest = this.progress.highScores[lvlCode] || 0;
        const isNewRecord = currentLevelScore > previousBest;

        if (isNewRecord) {
            this.progress.highScores[lvlCode] = currentLevelScore;
        }

        this.progress.highScore = Object.values(this.progress.highScores).reduce((a, b) => a + b, 0);

        this.saveProgress();

        document.getElementById('win-target-time').innerText = `${level.targetTime}s`;
        document.getElementById('win-fruits-count').innerText = `${this.fruitsCollected} / ${this.totalFruits}`;
        document.getElementById('win-time').innerText = `${this.levelTimer.toFixed(1)}s`;
        
        const winScoreEl = document.getElementById('win-score-val');
        if (winScoreEl) winScoreEl.innerText = currentLevelScore.toLocaleString();
        const winBestScoreEl = document.getElementById('win-best-score-val');
        if (winBestScoreEl) winBestScoreEl.innerText = Math.max(previousBest, currentLevelScore).toLocaleString();

        const newRecordBadge = document.getElementById('win-new-record-badge');
        if (newRecordBadge) {
            if (isNewRecord && previousBest > 0) {
                newRecordBadge.classList.remove('hidden');
            } else {
                newRecordBadge.classList.add('hidden');
            }
        }

        document.getElementById('req-star-1').className = 'star-req-item';
        document.getElementById('req-star-2').className = 'star-req-item';
        document.getElementById('req-star-3').className = 'star-req-item';
        
        document.querySelector('#req-star-1 .req-check').innerText = star1 ? '✅' : '⬜';
        document.querySelector('#req-star-2 .req-check').innerText = star2 ? '✅' : '⬜';
        document.querySelector('#req-star-3 .req-check').innerText = star3 ? '✅' : '⬜';

        document.getElementById('arch-star-1').className = 'arch-star';
        document.getElementById('arch-star-2').className = 'arch-star';
        document.getElementById('arch-star-3').className = 'arch-star';

        const theme = level.theme || CHAPTERS[this.currentChapterIdx]?.theme || CHAPTERS[0].theme;
        const screenWinEl = document.getElementById('screen-win');
        const winModalEl = document.querySelector('.win-modal');
        if (screenWinEl) {
            screenWinEl.style.background = 'rgba(0, 0, 0, 0.45)';
            screenWinEl.style.backdropFilter = 'blur(4px)';
        }
        if (winModalEl && theme.platformBorder) {
            winModalEl.style.borderColor = theme.platformBorder;
            winModalEl.style.boxShadow = `0 0 35px ${theme.platformBorder}88`;
        }

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

    triggerScreenShake(intensity = 4, duration = 0.15) {
        this.screenShakeIntensity = intensity;
        this.screenShakeTimer = duration;
    }


    updateAmbientWeather(theme) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const worldIdx = Math.floor((this.currentChapterIdx || 0) / 5);

        // Pre-populate subtly if empty (max 8 gentle, peaceful particles)
        if (this.ambientParticles.length < 5) {
            for (let k = 0; k < 2; k++) {
                this.spawnSingleAmbientParticle(w, h, worldIdx, true);
            }
        }

        // Slow, graceful spawn (max 8 particles total on screen)
        if (this.ambientParticles.length < 8 && Math.random() < 0.20) {
            this.spawnSingleAmbientParticle(w, h, worldIdx, false);
        }

        // Render ambient particles with delicate, soft transparency
        this.ctx.save();
        for (let i = this.ambientParticles.length - 1; i >= 0; i--) {
            const p = this.ambientParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rotSpeed;
            p.life--;

            if (p.type === 'sakura') {
                // Gentle pink sakura petal 🌸
                p.x += Math.sin(Date.now() * 0.0025 + p.y * 0.03) * 0.5;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rot);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = Math.min(0.70, p.life / 50);
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, p.size * 1.1, p.size * 0.65, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            } else if (p.type === 'ember') {
                // Subtle rising magma spark 🌋
                p.x += Math.sin(Date.now() * 0.003 + p.y * 0.02) * 0.4;
                this.ctx.save();
                this.ctx.fillStyle = p.color;
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 6;
                this.ctx.globalAlpha = Math.min(0.75, p.life / 40);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            } else if (p.type === 'wisp' || p.type === 'cyber') {
                // Floating subtle wisp ✨
                this.ctx.save();
                this.ctx.fillStyle = p.color;
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 6;
                this.ctx.globalAlpha = Math.min(0.65, p.life / 40);
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
                this.ctx.restore();
            } else {
                // Tiny star sparkle
                this.ctx.save();
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = Math.min(0.75, p.life / 50);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }

            if (p.life <= 0 || p.y > h + 20 || p.y < -20 || p.x > w + 40 || p.x < -40) {
                this.ambientParticles.splice(i, 1);
            }
        }
        this.ctx.restore();
    }

    spawnSingleAmbientParticle(w, h, worldIdx, randomY = false) {
        const startY = randomY ? Math.random() * h : (worldIdx === 1 ? (h + 10) : -10);
        if (worldIdx === 0) {
            this.ambientParticles.push({
                x: Math.random() * (w + 60) - 30,
                y: startY,
                vx: 0.4 + Math.random() * 0.5,
                vy: 0.5 + Math.random() * 0.5,
                size: 3.5 + Math.random() * 2.0,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.04,
                color: '#ff80ab',
                type: 'sakura',
                life: 400
            });
        } else if (worldIdx === 1) {
            this.ambientParticles.push({
                x: Math.random() * w,
                y: startY,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -(0.9 + Math.random() * 1.1),
                size: 2.0 + Math.random() * 2.0,
                rot: 0,
                rotSpeed: 0,
                color: Math.random() > 0.4 ? '#ffd600' : '#ff5722',
                type: 'ember',
                life: 300
            });
        } else if (worldIdx === 2) {
            this.ambientParticles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -0.3 - Math.random() * 0.3,
                size: 2.2 + Math.random() * 2.0,
                rot: 0,
                rotSpeed: 0,
                color: '#00f5ff',
                type: 'wisp',
                life: 250
            });
        } else if (worldIdx === 3) {
            this.ambientParticles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.8,
                vy: -0.6 - Math.random() * 0.6,
                size: 2.0 + Math.random() * 1.5,
                rot: 0,
                rotSpeed: 0,
                color: Math.random() > 0.5 ? '#00f5d4' : '#ff007f',
                type: 'cyber',
                life: 220
            });
        } else {
            this.ambientParticles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: 2.0 + Math.random() * 2.0,
                rot: 0,
                rotSpeed: 0.02,
                color: '#ffd700',
                type: 'star',
                life: 320
            });
        }
    }

    clearActivePowerUp() {
        this.activePowerUp = null;
        this.activePowerUpTimer = 0;
        this.activePowerUpMaxTimer = 0;
        if (this.player) {
            this.player.hasBubbleShield = false;
            this.player.hasMagnet = false;
            this.player.hasSpeedBoost = false;
        }
        const powerBar = document.getElementById('hud-powerup-bar');
        if (powerBar) powerBar.classList.add('hidden');
    }

    activatePowerUp(type, duration = 10) {
        this.activePowerUp = type;
        this.activePowerUpTimer = duration;
        this.activePowerUpMaxTimer = duration;

        if (type === 'powerup_magnet') this.player.hasMagnet = true;
        if (type === 'powerup_shield') this.player.hasBubbleShield = true;
        if (type === 'powerup_boost') this.player.hasSpeedBoost = true;

        const powerBar = document.getElementById('hud-powerup-bar');
        const iconEl = document.getElementById('powerup-icon');
        const nameEl = document.getElementById('powerup-name');

        if (powerBar && iconEl && nameEl) {
            powerBar.classList.remove('hidden');
            if (type === 'powerup_magnet') { iconEl.innerText = '🧲'; nameEl.innerText = 'MAGNET'; }
            else if (type === 'powerup_shield') { iconEl.innerText = '🫧'; nameEl.innerText = 'SHIELD'; }
            else if (type === 'powerup_boost') { iconEl.innerText = '⚡'; nameEl.innerText = 'SPEED BOOST'; }
        }
    }

    updatePowerUp(deltaTime) {
        if (!this.activePowerUp) return;

        // If shield powerup but shield was broken by enemy/hazard
        if (this.activePowerUp === 'powerup_shield' && this.player && !this.player.hasBubbleShield) {
            this.clearActivePowerUp();
            return;
        }

        this.activePowerUpTimer -= deltaTime;

        const fillEl = document.getElementById('powerup-fill');
        if (fillEl && this.activePowerUpMaxTimer > 0) {
            const pct = Math.max(0, (this.activePowerUpTimer / this.activePowerUpMaxTimer) * 100);
            fillEl.style.width = `${pct}%`;
        }

        if (this.activePowerUpTimer <= 0) {
            this.clearActivePowerUp();
        }
    }

    updateBossHUD() {
        const bossBar = document.getElementById('hud-boss-bar');
        const bossTitle = document.getElementById('boss-title');
        const heartsContainer = document.getElementById('boss-hearts');
        if (!bossBar || !heartsContainer) return;

        // Show Boss HUD ONLY when boss is awake and alive!
        if (!this.boss || !this.boss.isAwake || this.boss.isDead || this.boss.state === 'FALLING_DEAD') {
            bossBar.classList.add('hidden');
            return;
        }

        const bossNames = {
            5: { tr: "👑 KRAL SLIME", en: "👑 KING SLIME" },
            10: { tr: "🌋 LAV CANAVARI", en: "🌋 MAGMA GOLEM" },
            15: { tr: "👻 GÖLGE LORDU", en: "👻 SHADOW PHANTOM" },
            20: { tr: "🤖 SİBER MECHA SLIME", en: "🤖 CYBER MECHA SLIME" },
            25: { tr: "🌌 KOZMİK TİTAN", en: "🌌 COSMIC TITAN" }
        };

        const bInfo = bossNames[this.boss.bossType] || bossNames[5];
        if (bossTitle) {
            bossTitle.innerText = this.lang === 'en' ? bInfo.en : bInfo.tr;
        }

        bossBar.classList.remove('hidden');
        let html = '';
        for (let h = 0; h < this.boss.maxHp; h++) {
            if (h < this.boss.hp) html += '<span class="boss-heart">❤️</span>';
            else html += '<span class="boss-heart lost">🖤</span>';
        }
        heartsContainer.innerHTML = html;
    }

    popHUDItem(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.parentElement?.classList.remove('hud-pop');
            void el.offsetWidth;
            el.parentElement?.classList.add('hud-pop');
        }
    }

    initDailySpin() {
        const canvas = document.getElementById('wheel-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const isEn = (this.lang === 'en');
        const prizes = [
            { label: '+10 ⭐', color: '#ff4081', type: 'stars', val: 10 },
            { label: '+1 ❤️', color: '#00e5ff', type: 'life', val: 1 },
            { label: isEn ? '🧲 MAGNET' : '🧲 MIKNATIS', color: '#ffd600', type: 'power', val: 'powerup_magnet' },
            { label: '+25 ⭐', color: '#76ff03', type: 'stars', val: 25 },
            { label: isEn ? '🫧 SHIELD' : '🫧 KALKAN', color: '#e040fb', type: 'power', val: 'powerup_shield' },
            { label: '+2 ❤️', color: '#ff6d00', type: 'life', val: 2 },
            { label: '+50 ⭐', color: '#00b0ff', type: 'stars', val: 50 },
            { label: '⭐ JACKPOT', color: '#ffd700', type: 'stars', val: 100 }
        ];

        this.wheelPrizes = prizes;
        const numSlices = prizes.length;
        const sliceAngle = (Math.PI * 2) / numSlices;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = cx - 6;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        prizes.forEach((p, i) => {
            const startA = i * sliceAngle;
            const endA = startA + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startA, endA);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Label Text
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(startA + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 13px "Fredoka One", "Nunito", sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(p.label, radius - 16, 5);
            ctx.restore();
        });

        this.checkDailySpinStatus();
    }

    checkDailySpinStatus() {
        const lastSpin = parseInt(localStorage.getItem('fruit_leap_last_daily_spin') || '0');
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;
        const diff = now - lastSpin;

        const lData = I18N[this.lang] || I18N.tr;
        const spinBtn = document.getElementById('btn-spin-wheel');
        const notifyEl = document.getElementById('spin-notify');
        const cdDisplay = document.getElementById('spin-cooldown-display');
        const timerVal = document.getElementById('spin-timer-val');

        if (diff >= cooldown) {
            // Free Spin Ready!
            if (spinBtn) { spinBtn.disabled = false; spinBtn.innerText = lData.spinWheelFreeBtn || '🎡 ÇARKI ÇEVİR (ÜCRETSİZ!)'; }
            if (notifyEl) notifyEl.classList.remove('hidden');
            if (cdDisplay) cdDisplay.classList.add('hidden');
        } else {
            // On Cooldown
            const remainingMs = cooldown - diff;
            const hours = Math.floor(remainingMs / (1000 * 60 * 60));
            const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
            const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

            if (spinBtn) { spinBtn.disabled = true; spinBtn.innerText = lData.spinCooldownBtn || '⏳ BEKLEMEDE'; }
            if (notifyEl) notifyEl.classList.add('hidden');
            if (cdDisplay) cdDisplay.classList.remove('hidden');
            if (timerVal) timerVal.innerText = timeStr;
        }
    }

    spinDailyWheel() {
        if (this.isSpinning) return;
        const lastSpin = parseInt(localStorage.getItem('fruit_leap_last_daily_spin') || '0');
        const now = Date.now();
        if (now - lastSpin < 24 * 60 * 60 * 1000) return;

        this.isSpinning = true;
        const spinBtn = document.getElementById('btn-spin-wheel');
        if (spinBtn) spinBtn.disabled = true;

        const prizeIdx = Math.floor(Math.random() * this.wheelPrizes.length);
        const prize = this.wheelPrizes[prizeIdx];
        const numSlices = this.wheelPrizes.length;
        const sliceAngle = (360 / numSlices);

        // Calculate rotation so top pointer lands on prizeIdx
        // Ticker is at 270 deg (top)
        const targetDeg = (360 * 5) + (270 - (prizeIdx * sliceAngle + sliceAngle / 2));
        this.wheelRotation = (this.wheelRotation || 0) + targetDeg;

        const canvas = document.getElementById('wheel-canvas');
        if (canvas) {
            canvas.style.transform = `rotate(${this.wheelRotation}deg)`;
        }

        audio.playCoin();

        setTimeout(() => {
            this.isSpinning = false;
            localStorage.setItem('fruit_leap_last_daily_spin', Date.now().toString());

            const lData = I18N[this.lang] || I18N.tr;
            let prizeMsg = '';
            if (prize.type === 'stars') {
                this.progress.totalStars = (this.progress.totalStars || 0) + prize.val;
                prizeMsg = (lData.spinPrizeStars || '⭐ +{val} YILDIZ!').replace('{val}', prize.val);
            } else if (prize.type === 'life') {
                this.progress.globalLives = Math.min(5, (this.progress.globalLives || 0) + prize.val);
                prizeMsg = (lData.spinPrizeLife || '❤️ +{val} CAN!').replace('{val}', prize.val);
            } else if (prize.type === 'power') {
                this.progress.totalStars = (this.progress.totalStars || 0) + 30;
                prizeMsg = lData.spinPrizePower || '🎁 BÜYÜLÜ ÖDÜL! +30 Yıldız!';
            }

            this.saveProgress();
            this.updateStatsUI();

            const prizeEl = document.getElementById('spin-prize-display');
            if (prizeEl) {
                prizeEl.innerText = prizeMsg;
                prizeEl.classList.remove('hidden');
            }

            audio.playWin();
            this.checkDailySpinStatus();
        }, 4700);
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
        const w = this.canvas.width;
        const h = this.canvas.height;
        const time = Date.now() / 1000;

        // 1. Sky Gradient - Bright, Vibrant Daytime Sunset
        const skyGradient = this.getCachedGradient('menu_sky_v2', (ctx) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#38bdf8'); // Sky blue
            g.addColorStop(0.35, '#818cf8'); // Soft indigo
            g.addColorStop(0.65, '#f472b6'); // Warm rose
            g.addColorStop(1, '#fde047'); // Bright golden yellow
            return g;
        });
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, w, h);

        // 2. Soft Drifting Clouds
        const drawCloud = (cx, cy, scale, alpha) => {
            this.ctx.save();
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
            this.ctx.arc(cx + 20 * scale, cy - 14 * scale, 28 * scale, 0, Math.PI * 2);
            this.ctx.arc(cx + 46 * scale, cy - 10 * scale, 24 * scale, 0, Math.PI * 2);
            this.ctx.arc(cx + 64 * scale, cy, 20 * scale, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        };

        // Distant high clouds
        for (let i = 0; i < 4; i++) {
            let cx = (i * 260 + time * 10) % (w + 200) - 100;
            let cy = 45 + (i % 2) * 35;
            drawCloud(cx, cy, 0.9, 0.45);
        }
        // Closer mid clouds
        for (let i = 0; i < 3; i++) {
            let cx = (i * 380 + time * 18) % (w + 220) - 110;
            let cy = 90 + (i % 3) * 25;
            drawCloud(cx, cy, 1.2, 0.65);
        }

        // 3. Glowing Radiant Sun
        const sunX = w * 0.82;
        const sunY = h * 0.32 + Math.sin(time * 0.6) * 8;
        
        const sunGlow = this.getCachedGradient('menu_sun_glow_v2', (ctx) => {
            const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 110);
            g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            g.addColorStop(0.3, 'rgba(254, 240, 138, 0.7)');
            g.addColorStop(0.7, 'rgba(251, 146, 60, 0.25)');
            g.addColorStop(1, 'rgba(251, 146, 60, 0)');
            return g;
        });
        this.ctx.save();
        this.ctx.translate(sunX, sunY);
        this.ctx.fillStyle = sunGlow;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 110, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 32, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // 4. Distant Pastel Mountain Ridges
        this.ctx.fillStyle = '#a78bfa';
        this.ctx.beginPath();
        this.ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 25) {
            const my = h - 210 + Math.sin((x + time * 6) * 0.006) * 50 + Math.cos((x + time * 6) * 0.014) * 25;
            this.ctx.lineTo(x, my);
        }
        this.ctx.lineTo(w, h);
        this.ctx.fill();

        // Warm Horizon Haze
        const haze = this.getCachedGradient('menu_haze_v2', (ctx) => {
            const g = ctx.createLinearGradient(0, h - 230, 0, h);
            g.addColorStop(0, 'rgba(253, 224, 71, 0)');
            g.addColorStop(1, 'rgba(253, 224, 71, 0.35)');
            return g;
        });
        this.ctx.fillStyle = haze;
        this.ctx.fillRect(0, h - 230, w, 230);

        // 5. Mid-layer Lush Rolling Green Hills
        this.ctx.fillStyle = '#059669'; // Emerald hill base
        this.ctx.beginPath();
        this.ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 15) {
            const hy = h - 135 + Math.sin((x + time * 14) * 0.007 + 1.2) * 35;
            this.ctx.lineTo(x, hy);
        }
        this.ctx.lineTo(w, h);
        this.ctx.fill();

        // Mid-layer Cute Round Stylized Trees / Bushes
        for (let i = 0; i < 7; i++) {
            const bx = (i * 180 + time * 14) % (w + 100) - 50;
            const by = h - 135 + Math.sin((bx + time * 14) * 0.007 + 1.2) * 35;
            
            // Soft tree trunk
            this.ctx.fillStyle = '#78350f';
            this.ctx.fillRect(bx - 3, by - 6, 6, 12);
            
            // Lush round foliage
            this.ctx.fillStyle = '#047857';
            this.ctx.beginPath();
            this.ctx.arc(bx, by - 16, 18, 0, Math.PI * 2);
            this.ctx.arc(bx - 10, by - 10, 14, 0, Math.PI * 2);
            this.ctx.arc(bx + 10, by - 10, 14, 0, Math.PI * 2);
            this.ctx.fill();

            // Highlight on foliage
            this.ctx.fillStyle = '#10b981';
            this.ctx.beginPath();
            this.ctx.arc(bx - 3, by - 19, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 6. Foreground Smooth Lush Meadow
        this.ctx.fillStyle = '#10b981'; // Vibrant emerald
        this.ctx.beginPath();
        this.ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 10) {
            const gy = h - 70 + Math.sin((x + time * 28) * 0.009 + 2.5) * 16;
            this.ctx.lineTo(x, gy);
        }
        this.ctx.lineTo(w, h);
        this.ctx.fill();

        // Bright Grass Top Trim
        this.ctx.strokeStyle = '#34d399';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
            const gy = h - 70 + Math.sin((x + time * 28) * 0.009 + 2.5) * 16;
            if (x === 0) this.ctx.moveTo(x, gy);
            else this.ctx.lineTo(x, gy);
        }
        this.ctx.stroke();

        // Cute Foreground Bush Clusters & Blooming Flowers
        for (let i = 0; i < 12; i++) {
            const fx = (i * 110 + time * 28) % (w + 100) - 50;
            const fy = h - 70 + Math.sin((fx + time * 28) * 0.009 + 2.5) * 16;
            
            // Lush Clover Bush
            if (i % 2 === 0) {
                this.ctx.fillStyle = '#059669';
                this.ctx.beginPath();
                this.ctx.arc(fx, fy - 4, 11, Math.PI * 0.9, Math.PI * 2.1);
                this.ctx.fill();
                this.ctx.fillStyle = '#34d399';
                this.ctx.beginPath();
                this.ctx.arc(fx - 2, fy - 7, 6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Morning Dew Glimmers ✨
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                this.ctx.beginPath();
                this.ctx.arc(fx - 3, fy - 6, 1.5, 0, Math.PI * 2);
                this.ctx.arc(fx + 3, fy - 5, 1.2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Pretty animated swaying flower (Daisy / Tulip)
                const sway = Math.sin(time * 3 + i) * 3;
                this.ctx.strokeStyle = '#047857';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(fx, fy);
                this.ctx.quadraticCurveTo(fx + sway * 0.5, fy - 9, fx + sway, fy - 16);
                this.ctx.stroke();

                // Petals
                const flowerColors = ['#f43f5e', '#fbbf24', '#ffffff', '#ec4899', '#a855f7'];
                const fCol = flowerColors[i % flowerColors.length];
                this.ctx.fillStyle = fCol;
                for (let p = 0; p < 5; p++) {
                    const ang = (p * Math.PI * 2) / 5;
                    this.ctx.beginPath();
                    this.ctx.arc(fx + sway + Math.cos(ang) * 4.5, fy - 16 + Math.sin(ang) * 4.5, 3.2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                // Center
                this.ctx.fillStyle = '#fde047';
                this.ctx.beginPath();
                this.ctx.arc(fx + sway, fy - 16, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // 7. Ambient Glowing Magic Spores / Fireflies
        this.ctx.save();
        for (let sp = 0; sp < 14; sp++) {
            const spX = (sp * 80 + time * (16 + sp * 2)) % (w + 40) - 20;
            const spY = h - 110 + Math.sin(time * 2.5 + sp) * 35 - ((time * 12 + sp * 18) % 130);
            const spAlpha = 0.35 + (Math.sin(time * 4 + sp) * 0.5 + 0.5) * 0.55;
            
            this.ctx.fillStyle = sp % 2 === 0 ? `rgba(253, 224, 71, ${spAlpha})` : `rgba(167, 243, 208, ${spAlpha})`;
            this.ctx.shadowColor = sp % 2 === 0 ? '#fde047' : '#6ee7b7';
            this.ctx.shadowBlur = 8;
            
            this.ctx.beginPath();
            this.ctx.arc(spX, spY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();

        // 8. Main Characters Running & Bouncing across the Meadow!
        // We render Fluffy Bunny (the Hero with Cape), Foxy, and Kitty!
        const heroList = [
            { type: 'bunny', bodyColor: '#ffffff', earColor: '#ff80ab', cape: true, offset: 0, speed: 50 },
            { type: 'fox', bodyColor: '#ff5722', earColor: '#d84315', cape: true, offset: 110, speed: 50 },
            { type: 'kitty', bodyColor: '#ffa726', earColor: '#ffb300', cape: false, offset: 220, speed: 50 }
        ];

        heroList.forEach((hero, index) => {
            let hx = (w + 120 - (time * hero.speed + hero.offset) % (w + 240));
            const groundY = h - 70 + Math.sin((hx + time * 28) * 0.009 + 2.5) * 16;
            
            // Cute running hop animation
            const hopTime = time * 12 + index * 1.5;
            const bounce = Math.abs(Math.sin(hopTime));
            const squash = 1 - bounce * 0.18;
            const stretch = 1 + bounce * 0.18;
            const hy = groundY - 14 - (bounce * 28);
            
            this.ctx.save();
            this.ctx.translate(hx, hy);
            this.ctx.scale(squash, stretch);

            const isRight = false; // running leftwards across screen
            const tMs = Date.now();

            // Cape for Bunny and Fox
            if (hero.cape) {
                const capeWave = Math.sin(tMs * 0.018 + index) * 6;
                this.ctx.fillStyle = '#ff1744';
                this.ctx.beginPath();
                this.ctx.moveTo(6, -2);
                this.ctx.lineTo(24, 6 + capeWave);
                this.ctx.lineTo(26, -6 + capeWave);
                this.ctx.lineTo(6, -8);
                this.ctx.closePath();
                this.ctx.fill();
            }

            // Tails for Fox and Kitty
            if (hero.type === 'fox') {
                const tailWave = Math.sin(tMs * 0.015) * 5;
                this.ctx.fillStyle = '#ff5722';
                this.ctx.beginPath();
                this.ctx.ellipse(14, 4 + tailWave, 10, 6, 0.4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.ellipse(20, 4 + tailWave, 5, 4, 0.4, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'kitty') {
                const tailWave = Math.sin(tMs * 0.018) * 6;
                this.ctx.strokeStyle = '#ffa726';
                this.ctx.lineWidth = 4;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(10, 4);
                this.ctx.quadraticCurveTo(18, -2 + tailWave, 16, -10 + tailWave);
                this.ctx.stroke();
            }

            // Ears
            if (hero.type === 'bunny') {
                // Long Cute Bunny Ears
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.ellipse(-4, -22, 5, 13, -0.15, 0, Math.PI * 2);
                this.ctx.ellipse(5, -23, 5, 14, 0.12, 0, Math.PI * 2);
                this.ctx.fill();
                // Pink inner ear
                this.ctx.fillStyle = '#ff80ab';
                this.ctx.beginPath();
                this.ctx.ellipse(-4, -22, 2.8, 9, -0.15, 0, Math.PI * 2);
                this.ctx.ellipse(5, -23, 2.8, 10, 0.12, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'fox') {
                this.ctx.fillStyle = '#ff5722';
                this.ctx.beginPath();
                this.ctx.moveTo(-12, -6); this.ctx.lineTo(-10, -22); this.ctx.lineTo(-2, -10); this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.moveTo(2, -10); this.ctx.lineTo(10, -22); this.ctx.lineTo(12, -6); this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.moveTo(-9, -9); this.ctx.lineTo(-8, -16); this.ctx.lineTo(-4, -10); this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.moveTo(4, -10); this.ctx.lineTo(8, -16); this.ctx.lineTo(9, -9); this.ctx.fill();
            } else if (hero.type === 'kitty') {
                this.ctx.fillStyle = '#ffa726';
                this.ctx.beginPath();
                this.ctx.moveTo(-12, -6); this.ctx.lineTo(-10, -20); this.ctx.lineTo(-2, -10); this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.moveTo(2, -10); this.ctx.lineTo(10, -20); this.ctx.lineTo(12, -6); this.ctx.fill();
                this.ctx.fillStyle = '#ff80ab';
                this.ctx.beginPath();
                this.ctx.moveTo(-10, -8); this.ctx.lineTo(-9, -16); this.ctx.lineTo(-4, -10); this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.moveTo(4, -10); this.ctx.lineTo(9, -16); this.ctx.lineTo(10, -8); this.ctx.fill();
            }

            // Main Body Round
            this.ctx.fillStyle = hero.bodyColor;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 14.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Muzzle / Tummy details
            if (hero.type === 'bunny') {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 4, 8.5, 7.5, 0, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'fox') {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.ellipse(-5, 4, 5, 5, 0, 0, Math.PI * 2);
                this.ctx.ellipse(5, 4, 5, 5, 0, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'kitty') {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 4, 7, 5, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Cute Pink Blush Cheeks
            this.ctx.fillStyle = 'rgba(255, 64, 129, 0.45)';
            this.ctx.beginPath();
            this.ctx.arc(-8, 3.5, 3, 0, Math.PI * 2);
            this.ctx.arc(8, 3.5, 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Expressive Big Eyes (Looking left)
            this.ctx.fillStyle = '#212121';
            this.ctx.beginPath();
            this.ctx.ellipse(-5, -2, 3.2, 4.2, 0, 0, Math.PI * 2);
            this.ctx.ellipse(4, -2, 3.2, 4.2, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Eye Highlights
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(-6, -3.5, 1.4, 0, Math.PI * 2);
            this.ctx.arc(3, -3.5, 1.4, 0, Math.PI * 2);
            this.ctx.arc(-4, -0.8, 0.8, 0, Math.PI * 2);
            this.ctx.arc(5, -0.8, 0.8, 0, Math.PI * 2);
            this.ctx.fill();

            // Cute Nose
            this.ctx.fillStyle = hero.type === 'fox' ? '#212121' : '#ff4081';
            this.ctx.beginPath();
            this.ctx.ellipse(-1, 2, 1.8, 1.3, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Running Cute Feet!
            const footColor = (hero.type === 'fox') ? '#212121' : hero.bodyColor;
            this.ctx.fillStyle = footColor;
            
            const footCycle = Math.sin(tMs * 0.02 + index);
            const lFootY = 12.5 + footCycle * 3;
            const rFootY = 12.5 - footCycle * 3;
            const lFootX = -6 - footCycle * 2;
            const rFootX = 6 + footCycle * 2;

            this.ctx.beginPath();
            this.ctx.ellipse(lFootX, lFootY, 4.5, 3, 0, 0, Math.PI * 2);
            this.ctx.ellipse(rFootX, rFootY, 4.5, 3, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Outline for feet if white
            if (footColor === '#ffffff') {
                this.ctx.strokeStyle = '#e0e0e0';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }

            this.ctx.restore();
        });






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
        } else if (this.state === 'PAUSED' || this.state === 'WIN') {
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
            (item) => {
                if (item.type === 'powerup_magnet') {
                    this.activatePowerUp('powerup_magnet', 10);
                } else if (item.type === 'powerup_shield') {
                    this.activatePowerUp('powerup_shield', 30);
                } else if (item.type === 'powerup_boost') {
                    this.activatePowerUp('powerup_boost', 8);
                } else {
                    this.fruitsCollected++;
                    this.score = (this.score || 0) + 100;
                    this.updateHUD();
                    this.popHUDItem('hud-fruits');
                }
            },
            (goldenKey) => {
                this.score = (this.score || 0) + 250;
                this.updateHUD();
                this.popHUDItem('hud-star-key');
                const lData = I18N[this.lang] || I18N.tr;
                this.showPikoDialogue(lData.keyFoundMsg);
            },
            this.overheadCeilings,
            () => {
                const lData = I18N[this.lang] || I18N.tr;
                this.showPikoDialogue(lData.doorLockedMsg);
            },
            this.floatingTexts,
            (intensity, duration) => this.triggerScreenShake(intensity, duration),
            this.boss
        );

        // Update Boss
        if (this.boss && this.boss.y < 1500) {
            this.boss.update(this.platforms, this.player, this.particles, (i, d) => this.triggerScreenShake(i, d));
            this.updateBossHUD();
        }

        // Update Active Power-up Timer
        this.updatePowerUp(this.fixedStep);

        // Update Floating Texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            this.floatingTexts[i].update();
            if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
        }

        // Update Confetti Particles (Capped for mobile performance)
        if (this.confettiParticles.length > 60) this.confettiParticles.splice(0, this.confettiParticles.length - 60);
        for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
            this.confettiParticles[i].update();
            if (this.confettiParticles[i].life <= 0) this.confettiParticles.splice(i, 1);
        }

        // Update In-Game Particles (Capped for mobile performance)
        if (this.particles.length > 50) this.particles.splice(0, this.particles.length - 50);
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
        const currentLevel = CHAPTERS[this.currentChapterIdx]?.levels[this.currentLevelIdx];
        const theme = currentLevel?.theme || CHAPTERS[this.currentChapterIdx]?.theme || CHAPTERS[0].theme;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const time = Date.now() * 0.001;

        // 1. Rich Atmospheric Sky Gradient
        const themeKey = theme.name || 'default';
        const skyGrad = this.getCachedGradient('sky_' + themeKey, (ctx) => {
            const g = ctx.createLinearGradient(0, 0, 0, 540);
            if (theme.skyGradient) {
                theme.skyGradient.forEach((c, idx) => {
                    g.addColorStop(idx / (theme.skyGradient.length - 1), c);
                });
            } else {
                g.addColorStop(0, theme.bg);
                g.addColorStop(1, "#ffffff");
            }
            return g;
        });
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, w, h);

        // 2. Theme-Accurate Celestial Body (Smooth Parallax Gliding without Teleportation!)
        const isVolcano = theme.name === "Magma Caverns";
        const isSpectral = theme.name === "Spectral Void";
        const isCyber = theme.name === "Cyber Metropolis";
        const isCosmic = theme.name === "Cosmic Galaxy";

        // Smoothly glide with camera panning (distant parallax scale: 0.025x)
        const celestialX = (w * 0.82) - (this.camera.x * 0.025);
        const celestialY = 82;

        this.ctx.save();
        this.ctx.translate(celestialX, celestialY);

        if (isSpectral) {
            // 🌙 World 3 (Spectral Void): Mystic Crescent Moon with Silver/Cyan Aura
            this.ctx.shadowColor = '#00f5ff';
            this.ctx.shadowBlur = 24;

            // Outer Moon Glow
            this.ctx.fillStyle = '#00f5ff';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 32, 0, Math.PI * 2);
            this.ctx.fill();

            // Crescent Cutout
            this.ctx.fillStyle = skyGrad;
            this.ctx.beginPath();
            this.ctx.arc(10, -6, 26, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner Silver Crescent Rim
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(-2, 2, 28, Math.PI * 0.5, Math.PI * 1.8);
            this.ctx.closePath();
            this.ctx.fill();
        } else if (isVolcano) {
            // 🌑 World 2 (Magma Caverns): Eclipsed Blood Moon with Solar Flare Halo
            this.ctx.shadowColor = '#ff3d00';
            this.ctx.shadowBlur = 28;

            // Fiery Solar Eclipse Corona
            const corona = this.ctx.createRadialGradient(0, 0, 22, 0, 0, 42);
            corona.addColorStop(0, '#ff9100');
            corona.addColorStop(0.6, '#ff3d00');
            corona.addColorStop(1, 'rgba(255, 61, 0, 0)');
            this.ctx.fillStyle = corona;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 42, 0, Math.PI * 2);
            this.ctx.fill();

            // Dark Volcanic Eclipse Moon Core
            this.ctx.fillStyle = '#1c0a0a';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#ff6d00';
            this.ctx.lineWidth = 2.5;
            this.ctx.stroke();
        } else if (isCyber) {
            // 🏙️ World 4 (Cyber Metropolis): Digital Holographic Cyber Moon
            this.ctx.shadowColor = '#00f5d4';
            this.ctx.shadowBlur = 24;

            const cyberGrad = this.ctx.createLinearGradient(-30, -30, 30, 30);
            cyberGrad.addColorStop(0, '#00f5d4');
            cyberGrad.addColorStop(1, '#0f3460');
            this.ctx.fillStyle = cyberGrad;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 32, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Hologram Horizontal Latitude Scanlines
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            this.ctx.lineWidth = 1.5;
            for (let y = -22; y <= 22; y += 10) {
                const rx = Math.sqrt(Math.max(0, 30*30 - y*y));
                this.ctx.beginPath();
                this.ctx.moveTo(-rx, y);
                this.ctx.lineTo(rx, y);
                this.ctx.stroke();
            }
        } else if (isCosmic) {
            // 🪐 World 5 (Cosmic Galaxy): Giant Radiant Ringed Planet (Saturn-like)
            this.ctx.shadowColor = '#ffd700';
            this.ctx.shadowBlur = 28;

            // Planet Body
            const planetGrad = this.ctx.createLinearGradient(-26, -26, 26, 26);
            planetGrad.addColorStop(0, '#ffd700');
            planetGrad.addColorStop(0.5, '#e040fb');
            planetGrad.addColorStop(1, '#311b92');
            this.ctx.fillStyle = planetGrad;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 28, 0, Math.PI * 2);
            this.ctx.fill();

            // Tilted Glowing Cosmic Nebula Rings
            this.ctx.save();
            this.ctx.rotate(-0.35);
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
            this.ctx.lineWidth = 3.5;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 48, 12, 0, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.strokeStyle = 'rgba(0, 245, 255, 0.65)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 54, 15, 0, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        } else {
            // ☀️ World 1 (Emerald Meadow - Day): Luminous Golden Sun with Soft Corona
            this.ctx.shadowColor = '#ffd600';
            this.ctx.shadowBlur = 32;

            // Warm Radiant Corona
            const sunCorona = this.ctx.createRadialGradient(0, 0, 20, 0, 0, 46);
            sunCorona.addColorStop(0, '#ffffff');
            sunCorona.addColorStop(0.4, '#ffd600');
            sunCorona.addColorStop(0.8, '#ff9100');
            sunCorona.addColorStop(1, 'rgba(255, 145, 0, 0)');
            this.ctx.fillStyle = sunCorona;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 46, 0, Math.PI * 2);
            this.ctx.fill();

            // Core Sun Sphere
            this.ctx.fillStyle = '#fff9c4';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 28, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();

        // 3. Multi-Layer Parallax Background
        if (isCosmic || isSpectral) {
            // Space / Void Sparkling Stars
            this.ctx.save();
            this.ctx.fillStyle = "#ffffff";
            for (let s = 0; s < 45; s++) {
                const sx = (s * 97 - this.camera.x * 0.08) % (w + 40);
                const sy = 25 + (s * 37) % 320;
                const sSize = 1.2 + Math.sin(time * 3 + s) * 0.8;
                this.ctx.globalAlpha = 0.4 + Math.sin(time * 2 + s) * 0.4;
                this.ctx.beginPath();
                this.ctx.arc(sx < 0 ? sx + w + 40 : sx, sy, Math.max(0.6, sSize), 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        } else if (isCyber) {
            // Cyber Metropolis Neon Skyline
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
            for (let i = 0; i < 8; i++) {
                const bx = (i * 150 - this.camera.x * 0.12) % (w + 200) - 60;
                const bw = 90;
                const bh = 200 + (i % 4) * 45;
                this.ctx.fillRect(bx, 460 - bh, bw, bh);
                this.ctx.fillStyle = (i % 2 === 0) ? 'rgba(0, 245, 212, 0.25)' : 'rgba(255, 0, 127, 0.25)';
                for (let wx = bx + 10; wx < bx + bw - 10; wx += 16) {
                    for (let wy = 460 - bh + 15; wy < 440; wy += 22) {
                        this.ctx.fillRect(wx, wy, 6, 9);
                    }
                }
                this.ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
            }
        } else {
            // Distant Mountains & Clouds
            this.ctx.fillStyle = isVolcano ? 'rgba(40, 10, 10, 0.65)' : 'rgba(46, 125, 50, 0.25)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, 480);
            for (let x = 0; x <= w + 80; x += 40) {
                let my = 310 + Math.sin((x + this.camera.x * 0.12) * 0.006) * 45;
                this.ctx.lineTo(x, my);
            }
            this.ctx.lineTo(w, 480);
            this.ctx.fill();

            // Clouds
            this.ctx.fillStyle = isVolcano ? "rgba(255, 100, 50, 0.2)" : "rgba(255, 255, 255, 0.45)";
            for (let i = 0; i < 6; i++) {
                let cx = (i * 240 - this.camera.x * 0.16 + time * 10) % (w + 250) - 80;
                let cy = 55 + (i % 3) * 35;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, 22, 0, Math.PI * 2);
                this.ctx.arc(cx + 22, cy - 10, 28, 0, Math.PI * 2);
                this.ctx.arc(cx + 46, cy, 22, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // 4. Mid Foothills ($y = 430 - 540$)
        this.ctx.save();
        this.ctx.fillStyle = theme.platformBorder;
        this.ctx.globalAlpha = 0.32;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 540);
        for (let x = 0; x <= w + 40; x += 25) {
            let hillY = 440 + Math.sin((x + this.camera.x * 0.28) * 0.008) * 26;
            this.ctx.lineTo(x, hillY);
        }
        this.ctx.lineTo(w, 540);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();

        // 5. Liquid Wave Ocean ($y = 488 - 540$)
        const liquidColor = theme.liquidColor || "rgba(0, 180, 216, 0.45)";
        this.ctx.save();
        this.ctx.fillStyle = liquidColor;
        this.ctx.shadowColor = theme.platformBorder || '#00e5ff';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 540);
        for (let x = 0; x <= w + 15; x += 15) {
            let waveY = 490 + Math.sin(time * 3.2 + x * 0.022) * 6;
            this.ctx.lineTo(x, waveY);
        }
        this.ctx.lineTo(w, 540);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let x = 0; x <= w + 15; x += 15) {
            let waveY = 490 + Math.sin(time * 3.2 + x * 0.022) * 6;
            if (x === 0) this.ctx.moveTo(x, waveY);
            else this.ctx.lineTo(x, waveY);
        }
        this.ctx.stroke();
        this.ctx.restore();

        // 6. Real-time Ambient Weather & Atmospheric Particles! (🌸 Sakura / 🌋 Embers / 🔮 Wisps / 🏙️ Cyber / 🌌 Stardust)
        this.updateAmbientWeather(theme);

        if (this.state === 'PAUSED') {
            this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
            this.ctx.fillRect(0, 0, w, h);
        }





        // Ornate Thematic Platforms with Foliage, Inlays & Highlights
        const worldIdx = Math.floor((this.currentChapterIdx || 0) / 5);

        this.platforms.forEach(p => {
            const px = p.x - this.camera.x;
            const py = p.y - this.camera.y;

            this.ctx.save();
            // Drop shadow
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
            this.ctx.beginPath();
            this.ctx.roundRect(px + 3, py + 5, p.width, p.height, 8);
            this.ctx.fill();

            // Platform Main Body
            this.ctx.fillStyle = theme.platformColor;
            this.ctx.beginPath();
            this.ctx.roundRect(px, py, p.width, p.height, 8);
            this.ctx.fill();

            // Top Trim Border
            this.ctx.fillStyle = theme.platformBorder;
            this.ctx.beginPath();
            this.ctx.roundRect(px, py, p.width, 7, [8, 8, 0, 0]);
            this.ctx.fill();

            // Glossy Top Highlight Line
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.40)";
            this.ctx.fillRect(px + 4, py + 1, p.width - 8, 2);

            // Thematic Edge Accents & Foliage (Clean Emerald Scallops & Tiny Golden Flowers)
            if (worldIdx === 0) {
                this.ctx.fillStyle = theme.platformBorder;
                for (let gx = px + 12; gx < px + p.width - 15; gx += 18) {
                    this.ctx.beginPath();
                    this.ctx.arc(gx, py + 7, 3.2, 0, Math.PI);
                    this.ctx.fill();
                }
            } else if (worldIdx === 1) {
                // World 2: Glowing Magma Veins
                this.ctx.fillStyle = '#ff3d00';
                for (let mx = px + 16; mx < px + p.width - 20; mx += 35) {
                    this.ctx.fillRect(mx, py + 6, 8, 2);
                }
            } else if (worldIdx === 3) {
                // World 4: Cyber LED Corner Bolts
                this.ctx.fillStyle = '#00f5d4';
                this.ctx.fillRect(px + 3, py + 3, 3, 3);
                this.ctx.fillRect(px + p.width - 6, py + 3, 3, 3);
            }
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

            const singleSpikeW = 22;
            const count = Math.max(1, Math.round(h.width / singleSpikeW));
            for (let s = 0; s < count; s++) {
                const sx = s * singleSpikeW;
                this.ctx.beginPath();
                this.ctx.moveTo(sx, h.height);
                this.ctx.lineTo(sx + singleSpikeW / 2, 0);
                this.ctx.lineTo(sx + singleSpikeW, h.height);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }
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
            
            if (!p.entry && !p.entrance) {
                // Boss Portal
                const enX = p.x - this.camera.x + 25;
                const enY = p.y - this.camera.y + 35;
                this.ctx.shadowColor = (this.boss && !this.boss.isDead) ? '#ff1744' : '#76ff03';
                this.ctx.shadowBlur = 25;
                this.ctx.fillStyle = (this.boss && !this.boss.isDead) ? '#b71c1c' : '#64dd17';
                this.ctx.beginPath();
                this.ctx.ellipse(enX, enY, 20, 35, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                return;
            }

            // Entrance - Magenta Cosmic Swirl
            const entryObj = p.entry || p.entrance;
            const enX = entryObj.x - this.camera.x + 15;
            const enY = entryObj.y - this.camera.y + 22;
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

        // 5. Sci-Fi Pressure Floor Switches 🔘
        this.switches.forEach(sw => {
            const sx = sw.x - this.camera.x;
            const sy = sw.y - this.camera.y;
            this.ctx.save();

            // Heavy Metal Base Housing
            this.ctx.fillStyle = '#1e293b';
            this.ctx.fillRect(sx, sy + 3, sw.width, sw.height - 3);
            this.ctx.strokeStyle = '#475569';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(sx, sy + 3, sw.width, sw.height - 3);

            // Depressed or Raised Pressure Plate
            const btnHeight = sw.activated ? 3 : 6;
            const btnY = sw.activated ? (sy + sw.height - 3) : (sy);
            
            this.ctx.fillStyle = sw.activated ? '#00e676' : '#ff1744';
            this.ctx.shadowColor = sw.activated ? '#00e676' : '#ff1744';
            this.ctx.shadowBlur = 12;
            this.ctx.beginPath();
            this.ctx.roundRect(sx + 3, btnY, sw.width - 6, btnHeight, 2);
            this.ctx.fill();

            // Top Status LED Glint
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(sx + sw.width / 2 - 2, btnY + 1, 4, 1.5);
            this.ctx.restore();
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

                // Orbiting Magic Star Halo ✨
                const kTime = Date.now() * 0.004;
                this.ctx.fillStyle = '#ffffff';
                for (let s = 0; s < 3; s++) {
                    const sAngle = kTime + (s * Math.PI * 2 / 3);
                    const sx = Math.cos(sAngle) * 15;
                    const sy = -6 + Math.sin(sAngle) * 8;
                    this.ctx.beginPath();
                    this.ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }

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
                this.ctx.shadowColor = isUnlocked ? (theme.platformBorder || '#00f0ff') : '#ffab00';
                this.ctx.shadowBlur = isUnlocked ? 24 : 12;

                // 1. Theme-Fitted Pillars Arch Frame
                this.ctx.fillStyle = theme.platformColor || '#1e1b4b';
                this.ctx.beginPath();
                this.ctx.roundRect(-27, -80, 54, 80, [27, 27, 0, 0]);
                this.ctx.fill();

                // Ornate Theme Arch Border
                this.ctx.strokeStyle = theme.platformBorder || '#ffd700';
                this.ctx.lineWidth = 3.5;
                this.ctx.stroke();

                // Inner Arch Inlay
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.roundRect(-23, -76, 46, 76, [23, 23, 0, 0]);
                this.ctx.stroke();

                // 2. Apex Keystone Gem (Pulsing Theme Crystal 💎)
                this.ctx.save();
                const gemGlow = isUnlocked ? (theme.platformBorder || '#00f0ff') : '#ffd600';
                this.ctx.shadowColor = gemGlow;
                this.ctx.shadowBlur = 14;
                this.ctx.fillStyle = isUnlocked ? (theme.slimeColor?.start || '#00e5ff') : '#ff9100';
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

                // 3. Inner Theme Portal Void
                const portalGradKey = 'portal_void_' + (theme.name || 'default');
                const doorGrad = this.getCachedGradient(portalGradKey, (ctx) => {
                    const g = ctx.createLinearGradient(0, -74, 0, 0);
                    g.addColorStop(0, theme.skyGradient ? theme.skyGradient[0] : '#00f0ff');
                    g.addColorStop(0.5, theme.platformBorder || '#e040fb');
                    g.addColorStop(1, '#050014');
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
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, -36, 14, 22, rot, 0, Math.PI * 2);
                    this.ctx.stroke();

                    this.ctx.strokeStyle = theme.platformBorder || '#e040fb';
                    this.ctx.lineWidth = 1.5;
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

                // Fantasy Panels with Theme Filigree
                this.ctx.fillStyle = theme.platformColor || '#0f172a';
                
                // Left Panel
                this.ctx.beginPath();
                this.ctx.roundRect(-20 - slideDist, -73, 20, 73, [20, 0, 0, 0]);
                this.ctx.fill();
                this.ctx.strokeStyle = theme.platformBorder || '#ffd700';
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();

                // Left Filigree Arc
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                this.ctx.beginPath();
                this.ctx.arc(-10 - slideDist, -36, 6, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Right Panel
                this.ctx.fillStyle = theme.platformColor || '#0f172a';
                this.ctx.beginPath();
                this.ctx.roundRect(0 + slideDist, -73, 20, 73, [0, 20, 0, 0]);
                this.ctx.fill();
                this.ctx.strokeStyle = theme.platformBorder || '#ffd700';
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();

                // Right Filigree Arc
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
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
        // Power-up Orbs rendering (🧲, 🫧, ⚡)
        this.collectibles.forEach(c => {
            if (c.collected) return;
            if (c.type === 'powerup_magnet' || c.type === 'powerup_shield' || c.type === 'powerup_boost') {
                this.ctx.save();
                const cx = c.x - this.camera.x + 13;
                const cy = c.y - this.camera.y + 13;
                const pulse = Math.sin(Date.now() * 0.008) * 3;
                
                this.ctx.translate(cx, cy);
                this.ctx.shadowColor = c.type === 'powerup_boost' ? '#ffd600' : '#00e5ff';
                this.ctx.shadowBlur = 16;

                // Outer Glowing Orb
                this.ctx.fillStyle = c.type === 'powerup_boost' ? 'rgba(255, 214, 0, 0.3)' : 'rgba(0, 229, 255, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 16 + pulse, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                // Icon
                this.ctx.font = '16px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                const icon = c.type === 'powerup_magnet' ? '🧲' : (c.type === 'powerup_shield' ? '🫧' : '⚡');
                this.ctx.fillText(icon, 0, 0);
                this.ctx.restore();
            }
        });

        // Boss Enemy
        if (this.boss) {
            this.boss.draw(this.ctx, this.camera);
        }

        // Floating Scores & Popups
        this.floatingTexts.forEach(ft => ft.draw(this.ctx, this.camera));

        // Confetti Particles
        this.confettiParticles.forEach(cp => cp.draw(this.ctx, this.camera));

        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.player.draw(this.ctx, this.camera);
        }
    }
}

window.addEventListener('load', () => {
    window.gameInstance = new Game();
});
