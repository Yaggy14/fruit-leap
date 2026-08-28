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
        chapters: "🗺️ BÖLÜMLER",
        shop: "🛍️ KARAKTER MARKETİ",
        dailySpin: "🎁 GÜNLÜK ÇARK",
        freeLife: "📺 ÜCRETSİZ CAN (+1 ❤️)",
        settings: "⚙️ Ayarlar",
        studioPresents: "GURURLA SUNAR",
        tapToStart: "BAŞLAMAK İÇİN DOKUNUN",

        // Story Modal
        storyTitle: "✨ PİKO'NUN EFSANESİ ✨",
        storyUnlocked: "AÇILDI",
        storyPrev: "◀ Önceki",
        storyNext: "Sonraki ▶",
        storyBackToGame: "🚀 OYUNA DÖN",
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
        livesLeft: "Kalan Can",

        // Death Choice Modal
        deathTitle: "CAN KAYBEDİLDİ!",
        deathReviveAd: "🎬 Kaldığın Yerden Devam Et (Reklam)",
        deathRetry: "🔄 Baştan Başla (-1 Can)",

        // Shop
        characterShop: "Karakter Marketi",

        // Win Screen
        winLevelCleared: "BÖLÜM GEÇİLDİ!",
        winFinishLevel: "Bölümü Bitir",
        winFinishSub: "Temel Seviye Hedefi",
        winCollectFruits: "Tüm Meyveleri Topla (🍓)",
        winSpeedrun: "Hızlı Koşu",
        winYourTime: "Süren:",
        winFruitsSub: "Meyve",
        winNextLevel: "🚀 SONRAKİ BÖLÜM",
        winDoubleScore: "🎬 2X SKOR KAZAN (+⭐)",
        winDoubleScoreClaimed: "✅ 2X SKOR ALINDI!",
        winRetry: "🔄 TEKRAR DENE",
        winLevels: "🗺️ BÖLÜMLER",
        winMenu: "🏠 MENÜ",
        score: "SKOR",
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
        spinPrizePower: "🎁 BÜYÜLÜ ÖDÜL! +30 Yıldız Kazandın!",

        // SETOGI Showcase
        setogiTagline: "YARATICI BAĞIMSIZ OYUN STÜDYOSU",
        setogiDesc: "SETOGI, oyunculara yüksek tempolu, görsel açıdan zengin ve akıcı arcade platform deneyimleri sunan bağımsız bir oyun stüdyosudur.",
        setogiGiftBtn: "🎁 STÜDYO HEDİYESİ (+300 🍓)",
        setogiGiftClaimed: "✅ HEDİYE ALINDI!"
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
        storyUnlocked: "UNLOCKED",
        storyPrev: "◀ Prev",
        storyNext: "Next ▶",
        storyBackToGame: "🚀 BACK TO GAME",
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
        livesLeft: "Lives Left",

        // Death Choice Modal
        deathTitle: "LIFE LOST!",
        deathReviveAd: "🎬 Revive Here (Watch Ad)",
        deathRetry: "🔄 Restart (-1 Life)",

        // Shop
        characterShop: "Character Shop",

        // Win Screen
        winLevelCleared: "LEVEL CLEARED!",
        winFinishLevel: "Finish Level",
        winFinishSub: "Basic Level Goal",
        winCollectFruits: "Collect ALL Fruits (🍓)",
        winSpeedrun: "Speedrun",
        winYourTime: "Your Time:",
        winFruitsSub: "Fruits",
        winNextLevel: "🚀 NEXT LEVEL",
        winDoubleScore: "🎬 DOUBLE SCORE (+⭐)",
        winDoubleScoreClaimed: "✅ 2X SCORE CLAIMED!",
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
        spinPrizePower: "🎁 MAGIC REWARD! +30 Stars Won!",

        // SETOGI Showcase
        setogiTagline: "CREATIVE INDIE GAME STUDIO",
        setogiDesc: "SETOGI is an independent game studio crafting high-octane, visually rich, and smooth arcade platformer adventures.",
        setogiGiftBtn: "🎁 STUDIO GIFT (+300 🍓)",
        setogiGiftClaimed: "✅ GIFT CLAIMED!"
    }
};

const STORY_TOMES = [
    {
        id: 0,
        reqChapter: 0,
        tabTitleTr: "📜 Giriş",
        tabTitleEn: "📜 Prologue",
        titleTr: "✨ 1. Saman Yolu Ağacı & Çalınan Yıldızlar",
        titleEn: "✨ 1. The Milky Way Tree & Stolen Stars",
        icon: "🌳✨🐰",
        descTr: "Meyve Vadisi'nin neşesi ve yaşam kaynağı, gökyüzündeki Dev Saman Yolu Meyve Ağacı'ydı. Bir gece kötü Gölge Balçıkları ağacın büyülü 25 Yıldız Anahtarını ve meyvelerini çalıp boyut portallarına saçtı! Cesur Tavşan Piko pelerinini takıp vadisini kurtarmak için portallardan geçti!",
        descEn: "Fruit Valley flourished under the celestial glow of the Giant Milky Way Tree. One fateful night, Shadow Slimes stole the 25 Star Keys and scattered them across cosmic dimensions! Brave Bunny Piko donned his cape to embark on a grand quest to save his home!",
        rewardStars: 15
    },
    {
        id: 1,
        reqChapter: 5,
        bossNameTr: "👑 Kral Slime (Chapter 5)",
        bossNameEn: "👑 King Slime (Chapter 5)",
        tabTitleTr: "👑 Bölüm 1",
        tabTitleEn: "👑 Chapter 1",
        titleTr: "👑 Kral Slime'ın Düşüşü & İlk 5 Yıldız",
        titleEn: "👑 King Slime's Fall & The First 5 Stars",
        icon: "👑🌸🗝️",
        descTr: "Piko, Zümrüt Çayırları'nın efendisi dev Kral Slime'ı zekasıyla alt etti! Saray avlusundan kurtarılan ilk 5 Yıldız Anahtarı Saman Yolu Ağacı'nın ilk köklerini yeniden yeşertti. Ancak yerin altından lav sesleri yükseliyor...",
        descEn: "Piko outsmarted the colossal King Slime in the Royal Palace Courtyard! Recovering the first 5 Star Keys revived the ancient roots of the Milky Way Tree. Yet deep below, the earth rumbles with blazing magma...",
        rewardStars: 25
    },
    {
        id: 2,
        reqChapter: 10,
        bossNameTr: "🌋 Lav Golemi (Chapter 10)",
        bossNameEn: "🌋 Magma Golem (Chapter 10)",
        tabTitleTr: "🌋 Bölüm 2",
        tabTitleEn: "🌋 Chapter 2",
        titleTr: "🌋 Cehennem Krateri & Ateşin Sırrı",
        titleEn: "🌋 Inferno Caldera & The Flame Secret",
        icon: "🌋🔥🗝️",
        descTr: "Alev püskürten devasa Lav Golemi mağaranın kızgın lavlarına gömüldü! 10 Yıldız Anahtarı bir araya geldiğinde vadiyi kaplayan dumanlar dağıldı ve gizemli Hayalet Boyutu'na giden eflatun sisli geçit açıldı!",
        descEn: "The mighty Magma Golem was shattered into the glowing depths of the Caldera! With 10 Star Keys united, toxic ash cleared from the valley, unlocking the misty purple rift into the Spectral Void!",
        rewardStars: 35
    },
    {
        id: 3,
        reqChapter: 15,
        bossNameTr: "👻 Gölge Lordu (Chapter 15)",
        bossNameEn: "👻 Shadow Phantom (Chapter 15)",
        tabTitleTr: "👻 Bölüm 3",
        tabTitleEn: "👻 Chapter 3",
        titleTr: "👻 Ruhlar Diyarı & Gölge Lordunun Sonu",
        titleEn: "👻 Spectral Sanctum & Shadow's Defeat",
        icon: "👻🔮🗝️",
        descTr: "Karanlığın hükümdarı Gölge Lordu'nun kalkanı kırıldı. Piko ve dostları 15. Yıldız Anahtarı ile ruhlar aleminde hapsolmuş sihirli meyveleri kurtararak neon ışıklı Siber Şehir'e doğru yola çıktı!",
        descEn: "The elusive Shadow Phantom's spectral shield was shattered! Piko liberated the ethereal fruits trapped in the void and secured 15 Star Keys, paving the way toward the futuristic Cyber Metropolis!",
        rewardStars: 45
    },
    {
        id: 4,
        reqChapter: 20,
        bossNameTr: "🤖 Siber Mecha Slime (Chapter 20)",
        bossNameEn: "🤖 Cyber Mecha (Chapter 20)",
        tabTitleTr: "🤖 Bölüm 4",
        tabTitleEn: "🤖 Chapter 4",
        titleTr: "🤖 Çelik Şehir & Mecha Titan'ın Çöküşü",
        titleEn: "🤖 Steel Citadel & The Mecha Collapse",
        icon: "🤖⚡🗝️",
        descTr: "Lazer tarayıcılarla korunan Sibernetik Mecha Slime devre dışı bırakıldı! 20 Yıldız Anahtarının parıltısı Saman Yolu Ağacı'nı gökyüzüne kadar uzattı. Artık önlerinde tek bir engel kaldı: Evrenin sınırındaki Kozmik Titan!",
        descEn: "The high-tech Cyber Mecha Sentry was permanently offline! 20 radiant Star Keys caused the Milky Way Tree to branch straight into the cosmos. Only one final guardian remains: The Cosmic Titan!",
        rewardStars: 60
    },
    {
        id: 5,
        reqChapter: 25,
        bossNameTr: "🌌 Kozmik Titan (Chapter 25)",
        bossNameEn: "🌌 Cosmic Titan (Chapter 25)",
        tabTitleTr: "🌌 Final",
        tabTitleEn: "🌌 Finale",
        titleTr: "🌌 Final: Meyve Vadisi Ebediyen Özgür!",
        titleEn: "🌌 Finale: Fruit Valley Restored Forever!",
        icon: "🌌👑🏆",
        descTr: "Evrenin sınırındaki Dev Kozmik Titan dize getirildi! 25 Yıldız Anahtarının tamamı Dev Saman Yolu Ağacı'nın zirvesindeki yerine yerleşti. Meyve Vadisi ebedi neşe ve huzuruna kavuştu! Piko ve arkadaşları vadinin efsanevi koruyucuları oldu!",
        descEn: "The almighty Cosmic Titan was conquered at the edge of the universe! All 25 Star Keys crowned the summit of the Great Milky Way Tree. Fruit Valley rejoiced with eternal peace! Piko and his companions became legends!",
        rewardStars: 100
    }
];

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

        // Tap to Enter Game & Play BGM seamlessly with zero lag
        let entered = false;
        const enterGame = () => {
            if (entered) return;
            entered = true;
            try { audio.playSplashTap(); } catch (e) {}

            // Pre-reveal Main Menu behind the fading splash overlay
            const mainMenu = document.getElementById('screen-main-menu');
            if (mainMenu) mainMenu.classList.remove('hidden');
            this.state = 'MENU';
            this.updateStatsUI();
            this.updateLanguageUI();
            this.checkDailySpinStatus();
            try { audio.playBGM('menu'); } catch (e) {}

            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.classList.add('hidden');
            }, 360);
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
            lastHeartRegenTime: Date.now(),
            claimedStoryRewards: []
        };
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                prog = { ...prog, ...parsed };
            } catch (e) { }
        }
        if (prog.globalLives === undefined) prog.globalLives = 5;
        if (!prog.lastHeartRegenTime) prog.lastHeartRegenTime = Date.now();
        if (!prog.claimedStoryRewards) prog.claimedStoryRewards = [];
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
                    this.player.jump(this.particles, this.floatingTexts);
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
                if (keyName === 'up' && this.state === 'PLAYING') this.player.jump(this.particles, this.floatingTexts);
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
        document.getElementById('btn-story-prev')?.addEventListener('click', () => {
            if (this.activeStoryTomeIdx > 0) {
                this.activeStoryTomeIdx--;
                audio.playJump();
                this.renderStoryModal();
            }
        });
        document.getElementById('btn-story-next')?.addEventListener('click', () => {
            if (this.activeStoryTomeIdx < STORY_TOMES.length - 1) {
                this.activeStoryTomeIdx++;
                audio.playJump();
                this.renderStoryModal();
            }
        });
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
        document.getElementById('btn-win-double-score')?.addEventListener('click', () => {
            admob.showRewardedAd(() => {
                if (this.lastWinScore && this.lastLvlCode) {
                    const doubled = this.lastWinScore * 2;
                    this.progress.highScores[this.lastLvlCode] = Math.max(this.progress.highScores[this.lastLvlCode] || 0, doubled);
                    this.progress.highScore = Object.values(this.progress.highScores).reduce((a, b) => a + b, 0);
                    this.saveProgress();
                    const winScoreEl = document.getElementById('win-score-val');
                    if (winScoreEl) winScoreEl.innerText = doubled.toLocaleString();
                    const winBestScoreEl = document.getElementById('win-best-score-val');
                    if (winBestScoreEl) winBestScoreEl.innerText = (this.progress.highScores[this.lastLvlCode] || doubled).toLocaleString();
                    const btnAd = document.getElementById('btn-win-double-score');
                    if (btnAd) {
                        btnAd.disabled = true;
                        btnAd.innerText = (this.lang === 'tr') ? '✅ 2X SKOR ALINDI!' : '✅ 2X SCORE CLAIMED!';
                        btnAd.style.opacity = '0.6';
                    }
                    audio.playWin();
                    this.showToast((this.lang === 'tr') ? '🎉 2X Skor Hesabınıza Eklendi!' : '🎉 2X Score Added!');
                }
            });
        });
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
        
        this.renderChapterChips();
        this.renderLevelGrid(this.currentChapterIdx !== undefined ? (this.currentChapterIdx + 1) : 1);
        this.renderShopGrid();
        this.renderStoryModal();
        this.initDailySpin();
        this.checkDailySpinStatus();
    }

    renderChapterChips() {
        const container = document.getElementById('chapter-scroll');
        if (!container) return;
        container.innerHTML = '';

        const starsSpan = document.getElementById('select-total-stars-val');
        if (starsSpan) starsSpan.innerText = this.progress.totalStars || 0;

        const isTr = (this.lang === 'tr');
        CHAPTERS.forEach((c) => {
            const chip = document.createElement('div');
            const isFinal = (c.id === 25);
            const isActive = c.id === (this.currentChapterIdx + 1 || 1);
            chip.className = `chapter-chip ${isActive ? 'active' : ''} ${isFinal ? 'chip-final' : ''}`;
            
            let label = isTr ? `Bölüm ${c.id}` : `Ch.${c.id}`;
            if (c.id === 0) label = isTr ? 'Bölüm 0 🧪' : 'Ch.0 🧪';
            else if (isFinal) label = isTr ? 'Bölüm 25 👑 FİNAL' : 'Ch.25 👑 FINAL';
            
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
            const themeName = isTr ? (chapter.theme.nameTr || chapter.theme.name) : chapter.theme.name;
            bannerText.innerText = isTr ? `Bölüm ${chapterId}: ${themeName}` : `Chapter ${chapterId}: ${themeName}`;
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
            const lvlNumLabel = isBoss ? '👑 Boss' : (isTr ? `Seviye ${idx + 1}` : `Level ${idx + 1}`);

            card.innerHTML = `
                ${bossTagHtml}
                <div class="level-num">${lvlNumLabel}</div>
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

            const displayName = isTr ? (skin.nameTr || skin.name) : skin.name;
            const displayPerk = isTr ? (skin.perkTr || skin.perkEn) : skin.perkEn;

            card.innerHTML = `
                <div class="char-icon">${skin.icon}</div>
                <div class="char-name">${displayName}</div>
                <div class="char-perk" title="${displayPerk}">⚡ ${skin.speed} • ${displayPerk}</div>
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
        if (screenId === 'screen-story-intro') {
            this.state = 'STORY';
            audio.playBGM('menu');
            this.renderStoryModal();
        }
    }

    isStoryTomeUnlocked(tome) {
        if (!tome || tome.reqChapter === 0) return true;
        const bossLvlCode = `${tome.reqChapter}-3`;
        const altBossLvlCode = `${tome.reqChapter}-1`;
        return (this.progress.levelStars && ((this.progress.levelStars[bossLvlCode] > 0) || (this.progress.levelStars[altBossLvlCode] > 0)));
    }

    renderStoryModal() {
        const tabsNav = document.getElementById('story-tabs-nav');
        const stage = document.getElementById('story-scroll-stage');
        const countSpan = document.getElementById('story-unlocked-count');
        if (!tabsNav || !stage) return;

        const isTr = (this.lang === 'tr');
        if (this.activeStoryTomeIdx === undefined) this.activeStoryTomeIdx = 0;

        const unlockedCount = STORY_TOMES.filter(t => this.isStoryTomeUnlocked(t)).length;
        if (countSpan) countSpan.innerText = `${unlockedCount}/${STORY_TOMES.length}`;

        // 1. Render Navigation Tabs
        tabsNav.innerHTML = '';
        STORY_TOMES.forEach((tome, idx) => {
            const isUnlocked = this.isStoryTomeUnlocked(tome);
            const isActive = (idx === this.activeStoryTomeIdx);

            const chip = document.createElement('div');
            chip.className = `story-tab-chip ${isActive ? 'active' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`;

            const label = isTr ? tome.tabTitleTr : tome.tabTitleEn;
            const lockIcon = isUnlocked ? '' : ' 🔒';
            chip.innerHTML = `${label}${lockIcon}`;

            chip.addEventListener('click', () => {
                this.activeStoryTomeIdx = idx;
                audio.playJump();
                this.renderStoryModal();
            });

            tabsNav.appendChild(chip);
        });

        // 2. Render Active Tome Card
        const activeTome = STORY_TOMES[this.activeStoryTomeIdx] || STORY_TOMES[0];
        const isUnlocked = this.isStoryTomeUnlocked(activeTome);
        const isClaimed = (this.progress.claimedStoryRewards || []).includes(activeTome.id);

        stage.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'story-tome-card';

        const title = isTr ? activeTome.titleTr : activeTome.titleEn;
        const desc = isTr ? activeTome.descTr : activeTome.descEn;
        const bossName = isTr ? activeTome.bossNameTr : activeTome.bossNameEn;

        if (isUnlocked) {
            let claimBtnHtml = '';
            if (isClaimed) {
                claimBtnHtml = `<button class="btn-story-claim claimed" disabled>✓ ${isTr ? 'ÖDÜL ALINDI' : 'CLAIMED'}</button>`;
            } else {
                claimBtnHtml = `<button class="btn-story-claim" id="btn-claim-story-reward">🎁 ${isTr ? `+${activeTome.rewardStars} ⭐ ÖDÜLÜ AL` : `CLAIM +${activeTome.rewardStars} ⭐`}</button>`;
            }

            card.innerHTML = `
                <div class="story-tome-visual">
                    <div class="story-tome-icon">${activeTome.icon}</div>
                    <div class="story-tome-req">${isTr ? 'AÇILDI ✨' : 'UNLOCKED ✨'}</div>
                </div>
                <div class="story-tome-body">
                    <div class="story-tome-title">${title}</div>
                    <div class="story-tome-desc">${desc}</div>
                    <div class="story-tome-footer">
                        <span style="font-size: 0.72rem; color: #ffd600; font-weight: 800;">⭐ ${isTr ? 'Bölüm Ödülü:' : 'Chapter Reward:'} +${activeTome.rewardStars}</span>
                        ${claimBtnHtml}
                    </div>
                </div>
            `;

            const claimBtn = card.querySelector('#btn-claim-story-reward');
            if (claimBtn) {
                claimBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.claimStoryReward(activeTome);
                });
            }
        } else {
            card.innerHTML = `
                <div class="story-tome-visual">
                    <div class="story-tome-icon" style="filter: grayscale(1) opacity(0.5);">🔒</div>
                    <div class="story-tome-req" style="color: #ff5252;">${isTr ? 'KİLİTLİ' : 'LOCKED'}</div>
                </div>
                <div class="story-tome-body">
                    <div class="story-tome-title" style="color: #b0bec5;">🔒 ${title}</div>
                    <div class="story-tome-desc" style="color: #90a4ae;">
                        ${isTr ? `⚔️ Bu efsanevi hikaye parşömeninin kilidini açmak için <strong>${bossName}</strong> bossunu yenmelisin!` : `⚔️ Defeat <strong>${bossName}</strong> to unlock this legendary story tome!`}
                    </div>
                    <div class="story-tome-footer">
                        <div class="story-locked-badge">
                            <span>🔒 ${isTr ? 'Gereksinim: ' + bossName : 'Required: ' + bossName}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        stage.appendChild(card);
    }

    claimStoryReward(tome) {
        if (!tome || (this.progress.claimedStoryRewards || []).includes(tome.id)) return;
        this.progress.claimedStoryRewards = this.progress.claimedStoryRewards || [];
        this.progress.claimedStoryRewards.push(tome.id);
        this.progress.totalStars = (this.progress.totalStars || 0) + tome.rewardStars;
        this.saveProgress();
        audio.playWin();
        audio.playCoin();
        this.showToast((this.lang === 'tr') ? `🎉 +${tome.rewardStars} Yıldız Ödülü Hesabına Eklendi!` : `🎉 +${tome.rewardStars} Stars Claimed!`);
        this.renderStoryModal();
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

        const themeTrack = this.getChapterBGMTrack(this.currentChapterIdx);
        audio.playThematicBGM(themeTrack);

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

    getChapterBGMTrack(chapterIdx) {
        const chapter = CHAPTERS[chapterIdx];
        const chId = chapter ? chapter.id : (chapterIdx + 1);

        if (chId === 1 || chId === 2) return 'world1_day';
        if (chId === 3 || chId === 4) return 'world1_twilight';
        if (chId === 5) return 'world1_castle';

        if (chId === 6 || chId === 7) return 'world2_caves';
        if (chId === 8 || chId === 9) return 'world2_inferno';
        if (chId === 10) return 'world2_caldera';

        if (chId === 11 || chId === 12) return 'world3_spectral';
        if (chId === 13 || chId === 14) return 'world3_amethyst';
        if (chId === 15) return 'world3_sanctum';

        if (chId === 16 || chId === 17) return 'world4_cyber';
        if (chId === 18 || chId === 19) return 'world4_neon';
        if (chId === 20) return 'world4_matrix';

        if (chId === 21 || chId === 22) return 'world5_cosmic';
        if (chId === 23 || chId === 24) return 'world5_supernova';
        if (chId >= 25) return 'world5_throne';

        return 'world1_day';
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

        this.player.currentSkinId = this.progress.equippedSkin || 'bunny';
        this.player.reset(level.playerStart.x, level.playerStart.y);
        this.camera.x = Math.max(0, this.player.x - this.canvas.width * 0.35);
        this.camera.y = this.player.y - this.canvas.height * 0.58;
        
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
        const currentWorldType = Math.floor((this.currentChapterIdx || 0) / 5) + 1;
        this.enemies = level.enemies ? level.enemies.map(e => new Enemy(e.x, e.y, e.range, this.platforms.find(p => p.id === e.platformId), e.worldType || currentWorldType)) : [];
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
        audio.pauseBGM();
    }

    resumeGame() {
        this.state = 'PLAYING';
        document.getElementById('screen-pause').classList.add('hidden');
        document.getElementById('touch-controls')?.classList.remove('hidden');
        audio.resumeBGM();
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
        document.getElementById('hud-overlay')?.classList.remove('hidden');
        document.getElementById('touch-controls')?.classList.remove('hidden'); // Fix: Show touch buttons!
        this.state = 'PLAYING';
        const themeTrack = this.getChapterBGMTrack(this.currentChapterIdx);
        audio.playThematicBGM(themeTrack);
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
        audio.fadeBGMOut(0.45); // Smooth muffle & fade-out on death!

        if ((this.progress.globalLives || 0) <= 0) {
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
            const track = (this.boss && this.boss.isAwake && !this.boss.isDead) ? 'boss' : this.getChapterBGMTrack(this.currentChapterIdx);
            audio.playThematicBGM(track);
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

                const track = (this.boss && this.boss.isAwake && !this.boss.isDead) ? 'boss' : this.getChapterBGMTrack(this.currentChapterIdx);
                audio.playThematicBGM(track);
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
        this.clearActivePowerUp();
        this.state = 'WIN';
        audio.playWin(); // Play victory fanfare; level track continues smoothly in background!
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

        this.lastWinScore = currentLevelScore;
        this.lastLvlCode = lvlCode;

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

        // Reset requirements cards
        ['req-star-1', 'req-star-2', 'req-star-3'].forEach(id => {
            const card = document.getElementById(id);
            if (card) card.classList.remove('completed');
        });
        
        const reqIcon1 = document.querySelector('#req-star-1 .req-status-icon');
        if (reqIcon1) reqIcon1.innerText = star1 ? '✅' : '⬜';
        const reqIcon2 = document.querySelector('#req-star-2 .req-status-icon');
        if (reqIcon2) reqIcon2.innerText = star2 ? '✅' : '⬜';
        const reqIcon3 = document.querySelector('#req-star-3 .req-status-icon');
        if (reqIcon3) reqIcon3.innerText = star3 ? '✅' : '⬜';

        // Reset Chubby Arch Stars
        ['arch-star-1', 'arch-star-2', 'arch-star-3'].forEach(id => {
            const starEl = document.getElementById(id);
            if (starEl) starEl.classList.remove('earned');
        });

        // Reset 2X Ad Reward Button
        const btnAd = document.getElementById('btn-win-double-score');
        if (btnAd) {
            btnAd.disabled = false;
            btnAd.innerText = (this.lang === 'tr') ? '🎬 2X SKOR KAZAN (+⭐)' : '🎬 2X SCORE BONUS (+⭐)';
            btnAd.style.opacity = '1';
        }

        document.getElementById('screen-win')?.classList.remove('hidden');
        document.getElementById('touch-controls')?.classList.add('hidden');
        
        // Staggered Chubby 3D Star Pop Animations with Chime!
        setTimeout(() => {
            if (star1) {
                document.getElementById('arch-star-1')?.classList.add('earned');
                document.getElementById('req-star-1')?.classList.add('completed');
                audio.playStar();
            }
        }, 400);
        setTimeout(() => {
            if (star2) {
                document.getElementById('arch-star-2')?.classList.add('earned');
                document.getElementById('req-star-2')?.classList.add('completed');
                audio.playStar();
            }
        }, 950);
        setTimeout(() => {
            if (star3) {
                document.getElementById('arch-star-3')?.classList.add('earned');
                document.getElementById('req-star-3')?.classList.add('completed');
                audio.playStar();
            }
        }, 1500);

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
            { icon: '⭐', label: '+10', sub: isEn ? 'STARS' : 'YILDIZ', color: '#ec407a', darkColor: '#c2185b', type: 'stars', val: 10 },
            { icon: '❤️', label: '+1', sub: isEn ? 'LIFE' : 'CAN', color: '#00e5ff', darkColor: '#0097a7', type: 'life', val: 1 },
            { icon: '🧲', label: isEn ? 'MAGNET' : 'MIKNATIS', sub: 'GÜÇ', color: '#ffd600', darkColor: '#ff8f00', type: 'power', val: 'powerup_magnet' },
            { icon: '⭐', label: '+25', sub: isEn ? 'STARS' : 'YILDIZ', color: '#76ff03', darkColor: '#388e3c', type: 'stars', val: 25 },
            { icon: '🫧', label: isEn ? 'SHIELD' : 'KALKAN', sub: 'GÜÇ', color: '#e040fb', darkColor: '#8e24aa', type: 'power', val: 'powerup_shield' },
            { icon: '❤️', label: '+2', sub: isEn ? 'LIVES' : 'CAN', color: '#ff9100', darkColor: '#e65100', type: 'life', val: 2 },
            { icon: '⭐', label: '+50', sub: isEn ? 'STARS' : 'YILDIZ', color: '#2979ff', darkColor: '#1565c0', type: 'stars', val: 50 },
            { icon: '👑', label: '100 ⭐', sub: 'JACKPOT', color: '#ffd700', darkColor: '#ff6f00', type: 'stars', val: 100 }
        ];

        this.wheelPrizes = prizes;
        const numSlices = prizes.length;
        const sliceAngle = (Math.PI * 2) / numSlices;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = cx - 12;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        prizes.forEach((p, i) => {
            const startA = i * sliceAngle;
            const endA = startA + sliceAngle;
            const midA = startA + sliceAngle / 2;

            // Slice Gradient
            const grad = ctx.createRadialGradient(cx, cy, 30, cx + Math.cos(midA) * radius, cy + Math.sin(midA) * radius, radius);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, p.darkColor);

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startA, endA);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3.5;
            ctx.stroke();

            // Slice Content (Centered along slice ray)
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(midA);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 1. Text Label (Large & Crisp Outline)
            ctx.font = '900 24px "Fredoka One", "Nunito", sans-serif';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4.5;
            ctx.strokeText(p.label, radius * 0.58, -2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.fillText(p.label, radius * 0.58, -2);

            // 2. Icon (Large 32px)
            ctx.font = '32px sans-serif';
            ctx.shadowBlur = 4;
            ctx.fillText(p.icon, radius * 0.84, 0);

            ctx.restore();
        });

        // Golden Outer Rim with Studs
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 16 Golden Studs
        for (let s = 0; s < 16; s++) {
            const sa = s * (Math.PI * 2 / 16);
            const sx = cx + Math.cos(sa) * (radius + 1);
            const sy = cy + Math.sin(sa) * (radius + 1);
            ctx.fillStyle = (s % 2 === 0) ? '#ffffff' : '#ffd700';
            ctx.beginPath();
            ctx.arc(sx, sy, 4, 0, Math.PI * 2);
            ctx.fill();
        }

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
        const sliceAngle = 360 / numSlices;

        // Top pointer is located at 270 deg (top / 12 o'clock in standard canvas angle coordinates)
        // Center angle of slice `prizeIdx` in canvas coordinates:
        const sliceMidAngle = prizeIdx * sliceAngle + sliceAngle / 2;
        // The rotation angle R such that (sliceMidAngle + R) % 360 === 270:
        const targetOrientation = ((270 - sliceMidAngle) % 360 + 360) % 360;

        const currentRot = this.wheelRotation || 0;
        const currentRotMod = ((currentRot % 360) + 360) % 360;
        let delta = targetOrientation - currentRotMod;
        if (delta <= 0) delta += 360;

        // Spin 5 complete 360-deg rounds plus the exact delta to land dead-center on prize
        const spinRounds = 360 * 5;
        this.wheelRotation = currentRot + spinRounds + delta;

        const canvas = document.getElementById('wheel-canvas');
        if (canvas) {
            canvas.style.transform = `rotate(${this.wheelRotation}deg)`;
        }

        audio.playCoin();

        setTimeout(() => {
            this.isSpinning = false;
            localStorage.setItem('fruit_leap_last_daily_spin', Date.now().toString());

            const isEn = (this.lang === 'en');
            const lData = I18N[this.lang] || I18N.tr;
            let prizeMsg = '';
            if (prize.type === 'stars') {
                this.progress.totalStars = (this.progress.totalStars || 0) + prize.val;
                prizeMsg = (lData.spinPrizeStars || '⭐ +{val} YILDIZ!').replace('{val}', prize.val);
            } else if (prize.type === 'life') {
                this.progress.globalLives = Math.min(5, (this.progress.globalLives || 0) + prize.val);
                prizeMsg = (lData.spinPrizeLife || '❤️ +{val} CAN!').replace('{val}', prize.val);
            } else if (prize.type === 'power') {
                this.progress.totalStars = (this.progress.totalStars || 0) + 35;
                if (prize.val === 'powerup_magnet') {
                    prizeMsg = isEn ? '🧲 MAGNET POWER-UP! (+35 ⭐)' : '🧲 MIKNATIS GÜCÜ! (+35 ⭐)';
                } else if (prize.val === 'powerup_shield') {
                    prizeMsg = isEn ? '🫧 BUBBLE SHIELD! (+35 ⭐)' : '🫧 BALON KALKAN! (+35 ⭐)';
                } else {
                    prizeMsg = isEn ? '🎁 MAGIC POWER-UP! (+35 ⭐)' : '🎁 SÜRPRİZ GÜÇ! (+35 ⭐)';
                }
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

        // 2. Soft Drifting Clouds & Distant Soaring Birds
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

        // Soaring Birds in Distant Sky 🕊️
        this.ctx.strokeStyle = 'rgba(74, 20, 140, 0.35)';
        this.ctx.lineWidth = 1.8;
        this.ctx.lineCap = 'round';
        for (let b = 0; b < 3; b++) {
            const bx = (b * 220 + time * 32) % (w + 120) - 60;
            const by = 55 + b * 22 + Math.sin(time * 2 + b) * 8;
            const flap = Math.sin(time * 8 + b * 2) * 4.5;
            this.ctx.beginPath();
            this.ctx.moveTo(bx - 8, by + flap);
            this.ctx.quadraticCurveTo(bx - 4, by - 4, bx, by);
            this.ctx.quadraticCurveTo(bx + 4, by - 4, bx + 8, by + flap);
            this.ctx.stroke();
        }

        // Closer mid clouds
        for (let i = 0; i < 3; i++) {
            let cx = (i * 380 + time * 18) % (w + 220) - 110;
            let cy = 90 + (i % 3) * 25;
            drawCloud(cx, cy, 1.2, 0.65);
        }

        // 3. Glowing Radiant Sun with Sunbeams ☀️
        const sunX = w * 0.82;
        const sunY = h * 0.32 + Math.sin(time * 0.6) * 8;
        
        // Sunbeams / God-Rays
        this.ctx.save();
        this.ctx.translate(sunX, sunY);
        this.ctx.rotate(time * 0.04);
        for (let r = 0; r < 8; r++) {
            const rayAngle = (r * Math.PI * 2) / 8;
            const rayAlpha = 0.06 + Math.sin(time * 1.5 + r) * 0.03;
            this.ctx.fillStyle = `rgba(254, 240, 138, ${rayAlpha})`;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, 260, rayAngle - 0.14, rayAngle + 0.14);
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.ctx.restore();

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

        // Fluttering Colorful Meadow Butterflies 🦋
        const bFlyColors = ['#ec4899', '#00e5ff', '#ffd600'];
        for (let bf = 0; bf < 3; bf++) {
            const bfx = (bf * 260 + time * 35) % (w + 80) - 40;
            const bfy = h - 90 - bf * 20 + Math.sin(time * 3.5 + bf * 2) * 22;
            const wingFlap = Math.sin(time * 18 + bf);

            this.ctx.save();
            this.ctx.translate(bfx, bfy);
            this.ctx.fillStyle = bFlyColors[bf % bFlyColors.length];
            this.ctx.beginPath();
            this.ctx.ellipse(-3, 0, 4.5 * Math.abs(wingFlap), 6, 0.3, 0, Math.PI * 2);
            this.ctx.ellipse(3, 0, 4.5 * Math.abs(wingFlap), 6, -0.3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#212121';
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 1.2, 5, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Floating Wind-Blown Cherry Blossom Petals & Dandelion Fluff 🌸
        for (let pt = 0; pt < 8; pt++) {
            const ptx = (pt * 130 + time * (24 + pt * 3)) % (w + 40) - 20;
            const pty = 60 + ((pt * 45 + time * 35) % (h - 90)) + Math.sin(time * 2 + pt) * 14;
            const ptRot = time * 2.5 + pt;

            this.ctx.save();
            this.ctx.translate(ptx, pty);
            this.ctx.rotate(ptRot);
            this.ctx.fillStyle = pt % 2 === 0 ? 'rgba(255, 182, 193, 0.75)' : 'rgba(255, 255, 255, 0.7)';
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 4.5, 2.5, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
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

        // 8. ALL 6 PLAYABLE HEROES Running, Somersaulting & Gliding across the Meadow!
        const heroList = [
            { type: 'bunny', bodyColor: '#ffffff', earColor: '#ff80ab', cape: true, offset: 0, speed: 52, style: 'flip' },
            { type: 'fox', bodyColor: '#ff5722', earColor: '#d84315', cape: true, offset: 80, speed: 70, style: 'dash' },
            { type: 'kitty', bodyColor: '#ffa726', earColor: '#ffb300', cape: false, offset: 160, speed: 46, style: 'slide' },
            { type: 'bear', bodyColor: '#5d4037', earColor: '#8d6e63', cape: false, offset: 240, speed: 38, style: 'thump' },
            { type: 'panda', bodyColor: '#ffffff', earColor: '#212121', cape: false, offset: 320, speed: 44, style: 'roll' },
            { type: 'unicorn', bodyColor: '#f3e5f5', earColor: '#ea80fc', cape: false, offset: 400, speed: 56, style: 'glide' }
        ];

        const tMs = Date.now();

        heroList.forEach((hero, index) => {
            let hx = (w + 140 - (time * hero.speed + hero.offset) % (w + 340));
            const groundY = h - 70 + Math.sin((hx + time * 28) * 0.009 + 2.5) * 16;
            
            let hy = groundY - 14;
            let rot = 0;
            let squash = 1;
            let stretch = 1;

            if (hero.style === 'flip') {
                // 🐰 Bunny: Energetic High Jump with Somersault Spin Flip
                const cycle = (time * 2.8 + index) % Math.PI;
                const jumpPhase = Math.sin(cycle);
                const isAirborne = jumpPhase > 0.4;
                hy = groundY - 14 - (jumpPhase * 38);
                if (isAirborne) {
                    rot = -(time * 8.5) % (Math.PI * 2);
                } else {
                    squash = 1 - jumpPhase * 0.2;
                    stretch = 1 + jumpPhase * 0.2;
                }
            } else if (hero.style === 'dash') {
                // 🦊 Fox: Low Agile High-Speed Sprint with Fiery Dash Trail
                const hopTime = time * 18 + index;
                const bounce = Math.abs(Math.sin(hopTime));
                hy = groundY - 12 - (bounce * 14);
                squash = 1.15;
                stretch = 0.88;
                rot = -0.15; // Leaning aggressively forward into the sprint!

                // Fiery orange dash particles trailing behind
                if (Math.random() < 0.3) {
                    this.ctx.fillStyle = '#ff6d00';
                    this.ctx.beginPath();
                    this.ctx.arc(hx + 18 + Math.random() * 8, hy + 4 + (Math.random()-0.5)*8, 2.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            } else if (hero.style === 'slide') {
                // 🐱 Kitty: Playful Low Slide / Crawl followed by Springy Pounce
                const cycle = (time * 1.8 + index) % 4;
                if (cycle < 2) {
                    hy = groundY - 8;
                    squash = 1.35;
                    stretch = 0.70;
                    rot = 0.05;
                } else {
                    const pounceProg = (cycle - 2) / 2;
                    const pounceY = Math.sin(pounceProg * Math.PI) * 32;
                    hy = groundY - 14 - pounceY;
                    squash = 0.85;
                    stretch = 1.25;
                    rot = -0.25;
                }
            } else if (hero.style === 'thump') {
                // 🐻 Bear: Heavy Funny Stomp & Belly Flop Bounce with Mini Ground Puffs
                const hopTime = time * 7.5 + index;
                const bounce = Math.abs(Math.sin(hopTime));
                hy = groundY - 16 - (bounce * 20);
                squash = 1.18 - bounce * 0.25;
                stretch = 0.9 + bounce * 0.25;

                if (bounce < 0.08 && Math.random() < 0.4) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    this.ctx.beginPath();
                    this.ctx.arc(hx - 8, groundY + 2, 4, 0, Math.PI * 2);
                    this.ctx.arc(hx + 8, groundY + 2, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            } else if (hero.style === 'roll') {
                // 🐼 Panda: Chubby Happy Somersault Roll & Bamboo Sparkles
                const rollCycle = (time * 2.2 + index) % Math.PI;
                const isRolling = Math.sin(rollCycle) > 0.35;
                hy = groundY - 14 - Math.sin(rollCycle) * 28;
                if (isRolling) {
                    rot = -(time * 7.2) % (Math.PI * 2);
                    squash = 1.1;
                    stretch = 1.1;
                } else {
                    squash = 1.18;
                    stretch = 0.88;
                }
                if (Math.random() < 0.25) {
                    this.ctx.fillStyle = '#34d399';
                    this.ctx.beginPath();
                    this.ctx.arc(hx + 14, hy + 6, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            } else if (hero.style === 'glide') {
                // 🦄 Unicorn: Elegant Floating Air Glide with Rainbow Sparkle Trail
                const hoverWave = Math.sin(time * 3.5 + index) * 12;
                hy = groundY - 36 + hoverWave;
                squash = 0.95;
                stretch = 1.05;
                rot = Math.sin(time * 2) * 0.08;

                const rainbowColors = ['#ff4081', '#7c4dff', '#00e5ff', '#ffd600', '#69f0ae'];
                for (let r = 0; r < 2; r++) {
                    const rX = hx + 16 + r * 10 + Math.random() * 6;
                    const rY = hy + (Math.random() - 0.5) * 12;
                    this.ctx.fillStyle = rainbowColors[(Math.floor(time * 8) + r) % rainbowColors.length];
                    this.ctx.shadowColor = this.ctx.fillStyle;
                    this.ctx.shadowBlur = 6;
                    this.ctx.beginPath();
                    this.ctx.arc(rX, rY, 2.2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.save();
            this.ctx.translate(hx, hy);
            this.ctx.rotate(rot);
            this.ctx.scale(squash, stretch);

            // 1. Cape for Bunny and Fox
            if (hero.cape) {
                const capeWave = Math.sin(tMs * 0.018 + index) * 7;
                this.ctx.fillStyle = '#ff1744';
                this.ctx.beginPath();
                this.ctx.moveTo(6, -2);
                this.ctx.lineTo(24, 6 + capeWave);
                this.ctx.lineTo(26, -6 + capeWave);
                this.ctx.lineTo(6, -8);
                this.ctx.closePath();
                this.ctx.fill();
            }

            // 2. Tails
            if (hero.type === 'fox') {
                const tailWave = Math.sin(tMs * 0.02) * 6;
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
            } else if (hero.type === 'bear') {
                this.ctx.fillStyle = '#4e342e';
                this.ctx.beginPath();
                this.ctx.arc(12, 6, 4, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'panda') {
                this.ctx.fillStyle = '#212121';
                this.ctx.beginPath();
                this.ctx.arc(12, 6, 3.5, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'unicorn') {
                this.ctx.fillStyle = '#ea80fc';
                this.ctx.beginPath();
                this.ctx.ellipse(14, 2, 8, 4, -0.3, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // 3. Ears & Horn
            if (hero.type === 'bunny') {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.ellipse(-4, -22, 5, 13, -0.15, 0, Math.PI * 2);
                this.ctx.ellipse(5, -23, 5, 14, 0.12, 0, Math.PI * 2);
                this.ctx.fill();
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
            } else if (hero.type === 'bear') {
                this.ctx.fillStyle = '#5d4037';
                this.ctx.beginPath();
                this.ctx.arc(-11, -12, 6, 0, Math.PI * 2);
                this.ctx.arc(11, -12, 6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#8d6e63';
                this.ctx.beginPath();
                this.ctx.arc(-11, -12, 3.5, 0, Math.PI * 2);
                this.ctx.arc(11, -12, 3.5, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'panda') {
                this.ctx.fillStyle = '#212121';
                this.ctx.beginPath();
                this.ctx.arc(-11, -12, 6.5, 0, Math.PI * 2);
                this.ctx.arc(11, -12, 6.5, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'unicorn') {
                this.ctx.fillStyle = '#f3e5f5';
                this.ctx.beginPath();
                this.ctx.ellipse(-8, -16, 3.5, 7, -0.3, 0, Math.PI * 2);
                this.ctx.ellipse(8, -16, 3.5, 7, 0.3, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.fillStyle = '#ffd700';
                this.ctx.shadowColor = '#ffd700';
                this.ctx.shadowBlur = 8;
                this.ctx.beginPath();
                this.ctx.moveTo(-3, -13);
                this.ctx.lineTo(0, -28);
                this.ctx.lineTo(3, -13);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }

            // 4. Main Body Round
            this.ctx.fillStyle = hero.bodyColor;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, (hero.type === 'bear' || hero.type === 'panda' ? 15.5 : 14.5), 0, Math.PI * 2);
            this.ctx.fill();

            // 5. Muzzle / Tummy details
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
            } else if (hero.type === 'bear') {
                this.ctx.fillStyle = '#8d6e63';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 4, 9, 8, 0, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'panda') {
                this.ctx.fillStyle = '#212121';
                this.ctx.beginPath();
                this.ctx.arc(-11, 7, 5, 0, Math.PI * 2);
                this.ctx.arc(11, 7, 5, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (hero.type === 'unicorn') {
                this.ctx.fillStyle = '#ea80fc';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 4, 7, 5, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // 6. Cute Pink Blush Cheeks
            this.ctx.fillStyle = 'rgba(255, 64, 129, 0.45)';
            this.ctx.beginPath();
            this.ctx.arc(-8, 3.5, 3, 0, Math.PI * 2);
            this.ctx.arc(8, 3.5, 3, 0, Math.PI * 2);
            this.ctx.fill();

            // 7. Expressive Eyes
            if (hero.type === 'panda') {
                this.ctx.fillStyle = '#212121';
                this.ctx.beginPath();
                this.ctx.ellipse(-5.5, -2, 5.2, 4.2, -0.22, 0, Math.PI * 2);
                this.ctx.ellipse(5.5, -2, 5.2, 4.2, 0.22, 0, Math.PI * 2);
                this.ctx.fill();
            }

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

            // 8. Cute Nose
            this.ctx.fillStyle = (hero.type === 'fox' || hero.type === 'bear' || hero.type === 'panda') ? '#212121' : '#ff4081';
            this.ctx.beginPath();
            this.ctx.ellipse(-1, 2, 1.8, 1.3, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // 9. Running Cute Feet!
            const footColor = (hero.type === 'fox' || hero.type === 'bear' || hero.type === 'panda') ? '#212121' : (hero.type === 'unicorn' ? '#ffd700' : hero.bodyColor);
            this.ctx.fillStyle = footColor;
            
            const footCycle = Math.sin(tMs * 0.02 + index);
            const lFootY = (hero.type === 'bear' || hero.type === 'panda' ? 14 : 12.5) + footCycle * 3;
            const rFootY = (hero.type === 'bear' || hero.type === 'panda' ? 14 : 12.5) - footCycle * 3;
            const lFootX = -6 - footCycle * 2;
            const rFootX = 6 + footCycle * 2;

            this.ctx.beginPath();
            this.ctx.ellipse(lFootX, lFootY, 4.5, 3, 0, 0, Math.PI * 2);
            this.ctx.ellipse(rFootX, rFootY, 4.5, 3, 0, 0, Math.PI * 2);
            this.ctx.fill();

            if (footColor === '#ffffff' || footColor === '#f3e5f5') {
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
        } else if (this.state === 'PAUSED' || this.state === 'WIN' || this.state === 'DEATH_CHOICE' || this.state === 'COUNTDOWN') {
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

        // Update Enemies
        for (let enemy of this.enemies) {
            enemy.update(this.platforms, this.player, this.particles);
        }

        // Update Boss
        if (this.boss && this.boss.y < 1500) {
            this.boss.update(this.platforms, this.player, this.particles, (i, d) => this.triggerScreenShake(i, d));
            this.updateBossHUD();
        }

        // Update Timed Retractable Hazards (Spikes)
        for (let h of (this.hazards || [])) {
            if (h.isRetractable) {
                h.timer = (h.timer || 0) + 1;
                const totalCycle = h.cycleTicks || 280;
                const t = (h.timer + (h.phaseOffset || 0)) % totalCycle;

                // ⏰ Timed Spike State Machine:
                // 0 to 125: EXTENDED (1.0) - ~2.1s lethal spikes out
                // 125 to 145: RETRACTING (1.0 -> 0.0) - ~0.33s sinking into ground
                // 145 to 235: HIDDEN (0.0) - ~1.5s completely inside floor (SAFE)
                // 235 to 268: WARNING (shaking & spark particles) - ~0.55s pre-warning
                // 268 to 280: EXTENDING (0.0 -> 1.0) - ~0.2s snap up!

                if (t < 125) {
                    h.state = 'EXTENDED';
                    h.extensionRatio = 1.0;
                } else if (t < 145) {
                    h.state = 'RETRACTING';
                    h.extensionRatio = Math.max(0, 1.0 - ((t - 125) / 20));
                } else if (t < 235) {
                    h.state = 'HIDDEN';
                    h.extensionRatio = 0.0;
                } else if (t < 268) {
                    h.state = 'WARNING';
                    const prog = (t - 235) / 33;
                    h.extensionRatio = Math.max(0, Math.sin(prog * Math.PI * 5) * 0.15);
                    if (Math.random() < 0.35 && this.particles) {
                        const sparkX = h.x + Math.random() * h.width;
                        this.particles.push(new Particle(sparkX, h.y + h.height, '#ffd600', 2.5, (Math.random()-0.5)*3, -Math.random()*2, 14));
                    }
                } else {
                    h.state = 'EXTENDING';
                    h.extensionRatio = Math.min(1.0, (t - 268) / 12);
                }
            }
        }

        // Update Crumbling / Fragile Platforms
        for (let p of (this.platforms || [])) {
            if (p.isCrumbling) {
                if (p.isBroken) {
                    p.respawnTimer--;
                    if (p.respawnTimer <= 0) {
                        p.isBroken = false;
                        p.isSteppedOn = false;
                        p.crumbleTimer = p.maxCrumble || 68;
                        p.shakeX = 0;
                        p.shakeY = 0;
                        if (this.particles) {
                            for (let sp = 0; sp < 6; sp++) {
                                this.particles.push(new Particle(p.x + Math.random() * p.width, p.y + Math.random() * p.height, '#00e5ff', 3, (Math.random()-0.5)*3, (Math.random()-0.5)*3, 20));
                            }
                        }
                    }
                } else if (p.isSteppedOn) {
                    p.crumbleTimer--;
                    p.shakeX = (Math.random() - 0.5) * 4;
                    p.shakeY = (Math.random() - 0.5) * 3;

                    if (Math.random() < 0.35 && this.particles) {
                        this.particles.push(new Particle(p.x + Math.random() * p.width, p.y + p.height, '#8d6e63', 2.5, (Math.random()-0.5)*2, Math.random()*2, 14));
                    }

                    if (p.crumbleTimer <= 0) {
                        p.isBroken = true;
                        p.respawnTimer = 180; // 3s respawn
                        audio.playCrumble();
                        if (this.particles) {
                            for (let sp = 0; sp < 10; sp++) {
                                this.particles.push(new Particle(p.x + Math.random() * p.width, p.y + p.height, '#5d4037', 3.5, (Math.random()-0.5)*4, Math.random()*3 + 1, 24));
                            }
                        }
                    }
                }
            }
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

        // Smooth Camera X & Y tracking so Player is ALWAYS vertically and horizontally centered at consistent screen height!
        const targetCamX = this.player.x - this.canvas.width * 0.35;
        this.camera.x += (targetCamX - this.camera.x) * 0.12;
        if (this.camera.x < 0) this.camera.x = 0;
        if (this.camera.x > this.levelMapWidth - this.canvas.width) {
            this.camera.x = Math.max(0, this.levelMapWidth - this.canvas.width);
        }

        // Dynamic Camera Y Tracking follows the platform baseline (does NOT bounce when player jumps!)
        const targetCamY = (this.player.groundY !== undefined ? this.player.groundY : this.player.y) - this.canvas.height * 0.58;
        this.camera.y += (targetCamY - this.camera.y) * 0.08;
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
        const camX = Math.round(this.camera.x);
        const camY = Math.round(this.camera.y);

        this.platforms.forEach(p => {
            let px = Math.round(p.x - camX);
            let py = Math.round(p.y - camY);

            // Skip offscreen platforms
            if (px + p.width < -50 || px > w + 50) return;

            this.ctx.save();

            // 1. Broken Crumbling Platform (Ghost Respawn Indicator)
            if (p.isBroken) {
                const respawnProg = 1.0 - (p.respawnTimer / 180);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                this.ctx.lineWidth = 1.5;
                this.ctx.setLineDash([4, 4]);
                this.ctx.strokeRect(px, py, p.width, p.height);

                // Mini respawn progress ring in center
                this.ctx.beginPath();
                this.ctx.arc(px + p.width / 2, py + p.height / 2, 6, -Math.PI / 2, -Math.PI / 2 + respawnProg * Math.PI * 2);
                this.ctx.strokeStyle = '#00e5ff';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([]);
                this.ctx.stroke();

                this.ctx.restore();
                return;
            }

            // Apply Crumble Shake
            if (p.isCrumbling && p.isSteppedOn) {
                px += Math.round(p.shakeX || 0);
                py += Math.round(p.shakeY || 0);
            }

            // Drop shadow
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
            this.ctx.beginPath();
            this.ctx.roundRect(px + 3, py + 5, p.width, p.height, 8);
            this.ctx.fill();

            // Platform Main Body
            if (p.isCrumbling) {
                // Fragile Wood / Cracked Stone Tone
                this.ctx.fillStyle = (worldIdx === 1) ? '#3e2723' : (worldIdx === 2 ? '#2a1b40' : '#4e342e');
            } else if (p.isIcy) {
                // 🧊 Vibrant Glacial Crystal Ice Body (Distinct, luminous & naturally crystalline)
                const iceGrad = this.getCachedGradient('ice_plat_' + worldIdx, (ctx) => {
                    const g = ctx.createLinearGradient(0, 0, 0, 24);
                    g.addColorStop(0, '#48cae4');
                    g.addColorStop(0.35, '#0096c7');
                    g.addColorStop(1, '#023e8a');
                    return g;
                });
                this.ctx.fillStyle = iceGrad;
            } else {
                this.ctx.fillStyle = theme.platformColor;
            }

            this.ctx.beginPath();
            this.ctx.roundRect(px, py, p.width, p.height, 8);
            this.ctx.fill();

            // Distinct Ice Crystal Facet Lines (Geometric ice refraction)
            if (p.isIcy) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                this.ctx.lineWidth = 1.2;
                this.ctx.beginPath();
                for (let fx = 24; fx < p.width - 20; fx += 38) {
                    this.ctx.moveTo(px + fx, py + 4);
                    this.ctx.lineTo(px + fx + 12, py + p.height - 4);
                    this.ctx.lineTo(px + fx + 24, py + 6);
                }
                this.ctx.stroke();
            }

            // Top Trim Border
            if (p.isIcy) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.shadowColor = '#00f5ff';
                this.ctx.shadowBlur = 14;
            } else if (p.isCrumbling) {
                this.ctx.fillStyle = (worldIdx === 1) ? '#ff5722' : '#8d6e63';
                this.ctx.shadowBlur = 0;
            } else {
                this.ctx.fillStyle = theme.platformBorder;
                this.ctx.shadowBlur = 0;
            }
            this.ctx.beginPath();
            this.ctx.roundRect(px, py, p.width, 7, [8, 8, 0, 0]);
            this.ctx.fill();

            // Glossy Top Highlight Line
            this.ctx.fillStyle = p.isIcy ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.40)";
            this.ctx.fillRect(px + 4, py + 1, p.width - 8, 2);

            // Crumbling Warning Fissure Cracks
            if (p.isCrumbling && p.isSteppedOn) {
                const crackProg = 1.0 - (p.crumbleTimer / (p.maxCrumble || 68));
                this.ctx.strokeStyle = '#ffd600';
                this.ctx.lineWidth = 1.8;
                this.ctx.beginPath();
                this.ctx.moveTo(px + p.width * 0.3, py + 2);
                this.ctx.lineTo(px + p.width * 0.35, py + 12);
                this.ctx.lineTo(px + p.width * 0.32, py + 22);
                if (crackProg > 0.4) {
                    this.ctx.moveTo(px + p.width * 0.7, py + 2);
                    this.ctx.lineTo(px + p.width * 0.65, py + 14);
                    this.ctx.lineTo(px + p.width * 0.72, py + 22);
                }
                this.ctx.stroke();
            }

            // ❄️ Icy Sparkling Crystals & Hanging Icicles!
            if (p.isIcy) {
                // 1. Shimmering Starlight Sparkles on Surface
                this.ctx.fillStyle = '#ffffff';
                this.ctx.shadowColor = '#00f5ff';
                this.ctx.shadowBlur = 8;
                for (let ix = 14; ix < p.width - 14; ix += 24) {
                    const sparkle = (Math.sin(time * 3.0 + (p.id * 19 + ix * 0.12)) + 1) * 0.5;
                    this.ctx.beginPath();
                    this.ctx.arc(px + ix, py + 3.5, 1.6 * sparkle + 1.2, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // 2. Hanging Crystalline Icicles along Bottom Rim
                this.ctx.fillStyle = '#caf0f8';
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
                this.ctx.lineWidth = 1;
                for (let icx = 18; icx < p.width - 18; icx += 32) {
                    const icLen = 7 + (icx % 5) * 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(px + icx - 4, py + p.height);
                    this.ctx.lineTo(px + icx, py + p.height + icLen);
                    this.ctx.lineTo(px + icx + 4, py + p.height);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                }
                this.ctx.shadowBlur = 0;
            }

            // =========================================================================
            // 🌿 THEMATIC AMBIENT DETAILS (WORLD SPACE OSCILLATIONS - ZERO JITTER)
            // =========================================================================
            if (worldIdx === 0) {
                // 🌸 World 1 (Emerald Meadow): Lush Hanging Ivy Vines & Swaying Wildflowers
                // 1. Organic Grassy Top Fringe
                this.ctx.fillStyle = theme.platformBorder;
                for (let gx = 8; gx < p.width - 10; gx += 14) {
                    const grassWave = Math.sin(time * 2.2 + (p.id * 33 + gx * 0.1)) * 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(px + gx, py);
                    this.ctx.lineTo(px + gx + 2 + grassWave, py - 4);
                    this.ctx.lineTo(px + gx + 5, py);
                    this.ctx.fill();
                }

                // 2. High-Detail Hanging Ivy Tendrils with Paired Leaf Clusters
                for (let vx = 26; vx < p.width - 26; vx += 56) {
                    const vineSway = Math.sin(time * 1.8 + (p.id * 77 + vx * 0.08)) * 3.0;
                    const vineLen = 18 + (vx % 12);
                    const rootX = px + vx;
                    const rootY = py + p.height;
                    
                    // Main Vine Stem (Natural Curve)
                    this.ctx.strokeStyle = '#1b5e20';
                    this.ctx.lineWidth = 1.8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(rootX, rootY);
                    this.ctx.quadraticCurveTo(rootX + vineSway * 1.2, rootY + (vineLen * 0.5), rootX + vineSway, rootY + vineLen);
                    this.ctx.stroke();

                    // Paired Leaf Nodes
                    for (let step = 0.3; step <= 0.9; step += 0.3) {
                        const lx = rootX + vineSway * step;
                        const ly = rootY + (vineLen * step);
                        
                        // Left Leaf
                        this.ctx.fillStyle = '#4caf50';
                        this.ctx.beginPath();
                        this.ctx.ellipse(lx - 4, ly - 1, 3.5, 2.2, -0.6, 0, Math.PI * 2);
                        this.ctx.fill();

                        // Right Leaf (Bright Highlight)
                        this.ctx.fillStyle = '#81c784';
                        this.ctx.beginPath();
                        this.ctx.ellipse(lx + 4, ly + 1, 3.5, 2.2, 0.6, 0, Math.PI * 2);
                        this.ctx.fill();
                    }

                    // Blooming Bluebell / Buttercup at Vine Tip
                    const tipX = rootX + vineSway;
                    const tipY = rootY + vineLen;
                    this.ctx.fillStyle = (vx % 2 === 0) ? '#ff4081' : '#ffd600';
                    this.ctx.beginPath();
                    this.ctx.arc(tipX, tipY, 2.8, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // 3. Gentle Swaying Chamomile / Daisy Flowers on Top Surface
                for (let fx = 20; fx < p.width - 24; fx += 70) {
                    const sway = Math.sin(time * 2.2 + (p.id * 55 + fx * 0.1)) * 2.2;
                    const flowerBaseX = px + fx;
                    this.ctx.strokeStyle = '#2e7d32';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(flowerBaseX, py + 1);
                    this.ctx.quadraticCurveTo(flowerBaseX + sway * 0.5, py - 4, flowerBaseX + sway, py - 8);
                    this.ctx.stroke();

                    // White Flower Petals
                    this.ctx.fillStyle = '#ffffff';
                    for (let pAngle = 0; pAngle < Math.PI * 2; pAngle += Math.PI / 3) {
                        const pxF = flowerBaseX + sway + Math.cos(pAngle) * 3.2;
                        const pyF = py - 8 + Math.sin(pAngle) * 3.2;
                        this.ctx.beginPath();
                        this.ctx.arc(pxF, pyF, 1.6, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    // Yellow Center
                    this.ctx.fillStyle = '#ffd600';
                    this.ctx.beginPath();
                    this.ctx.arc(flowerBaseX + sway, py - 8, 1.8, 0, Math.PI * 2);
                    this.ctx.fill();
                }

            } else if (worldIdx === 1) {
                // 🌋 World 2 (Magma Caverns): Basalt Roots, Molten Veins & Teardrop Lava Drips
                this.ctx.fillStyle = '#ff3d00';
                for (let mx = 16; mx < p.width - 20; mx += 32) {
                    this.ctx.fillRect(px + mx, py + 6, 9, 2);
                }

                // Basalt Stalactite Mounts with Teardrop Lava Drops
                for (let lx = 30; lx < p.width - 30; lx += 48) {
                    const dropBaseX = px + lx;
                    // Dark Basalt Root Tooth
                    this.ctx.fillStyle = '#21100b';
                    this.ctx.beginPath();
                    this.ctx.moveTo(dropBaseX - 5, py + p.height);
                    this.ctx.lineTo(dropBaseX, py + p.height + 6);
                    this.ctx.lineTo(dropBaseX + 5, py + p.height);
                    this.ctx.closePath();
                    this.ctx.fill();

                    // Animated Lava Teardrop Physics
                    const dripCycle = (time * 1.2 + (p.id * 40 + lx * 0.05)) % 1;
                    const dropY = py + p.height + 6 + (dripCycle * 16);
                    const dropScale = (1 - dripCycle * 0.45);

                    // Outer Orange Glow
                    this.ctx.fillStyle = '#ff3d00';
                    this.ctx.shadowColor = '#ff1744';
                    this.ctx.shadowBlur = 8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(dropBaseX, dropY - 3 * dropScale);
                    this.ctx.quadraticCurveTo(dropBaseX + 3 * dropScale, dropY + 2, dropBaseX, dropY + 4 * dropScale);
                    this.ctx.quadraticCurveTo(dropBaseX - 3 * dropScale, dropY + 2, dropBaseX, dropY - 3 * dropScale);
                    this.ctx.fill();

                    // Inner Superheated White-Yellow Core
                    this.ctx.fillStyle = '#ffff8d';
                    this.ctx.beginPath();
                    this.ctx.arc(dropBaseX, dropY + 1, 1.4 * dropScale, 0, Math.PI * 2);
                    this.ctx.fill();
                }

            } else if (worldIdx === 2) {
                // 🔮 World 3 (Spectral Void): Multi-Faceted Amethyst Crystals & Soul Wisps
                for (let sx = 24; sx < p.width - 25; sx += 42) {
                    const cLen = 10 + (sx % 8);
                    const crystalX = px + sx;
                    
                    // Left Dark Facet
                    this.ctx.fillStyle = '#7b1fa2';
                    this.ctx.beginPath();
                    this.ctx.moveTo(crystalX - 4, py + p.height);
                    this.ctx.lineTo(crystalX, py + p.height + cLen);
                    this.ctx.lineTo(crystalX, py + p.height);
                    this.ctx.closePath();
                    this.ctx.fill();

                    // Right Luminous Specular Facet
                    this.ctx.fillStyle = '#e040fb';
                    this.ctx.shadowColor = '#d500f9';
                    this.ctx.shadowBlur = 10;
                    this.ctx.beginPath();
                    this.ctx.moveTo(crystalX, py + p.height);
                    this.ctx.lineTo(crystalX, py + p.height + cLen);
                    this.ctx.lineTo(crystalX + 4, py + p.height);
                    this.ctx.closePath();
                    this.ctx.fill();

                    // Specular Crystal Glint
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(crystalX - 0.8, py + p.height + 2, 1.6, cLen * 0.4);
                }

            } else if (worldIdx === 3) {
                // 🤖 World 4 (Cyber Metropolis): Heavy Fiber-Optic Cables & Traveling Data Packets
                this.ctx.fillStyle = '#00f5d4';
                this.ctx.fillRect(px + 3, py + 3, 3, 3);
                this.ctx.fillRect(px + p.width - 6, py + 3, 3, 3);

                // Hanging Catenary Cyber Cables with Metal Brackets
                for (let cx = 22; cx < p.width - 38; cx += 58) {
                    const cableX = px + cx;
                    // Metal Cable Mount Brackets
                    this.ctx.fillStyle = '#475569';
                    this.ctx.fillRect(cableX - 2, py + p.height, 4, 3);
                    this.ctx.fillRect(cableX + 34, py + p.height, 4, 3);

                    // Outer Dark Cable Jacket
                    this.ctx.strokeStyle = '#0f172a';
                    this.ctx.lineWidth = 3.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(cableX, py + p.height + 2);
                    this.ctx.quadraticCurveTo(cableX + 18, py + p.height + 14, cableX + 36, py + p.height + 2);
                    this.ctx.stroke();

                    // Inner Glowing Neon Fiber Wire
                    this.ctx.strokeStyle = '#00f5d4';
                    this.ctx.lineWidth = 1.6;
                    this.ctx.shadowColor = '#00f5d4';
                    this.ctx.shadowBlur = 8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(cableX, py + p.height + 2);
                    this.ctx.quadraticCurveTo(cableX + 18, py + p.height + 14, cableX + 36, py + p.height + 2);
                    this.ctx.stroke();

                    // Animated Traveling Data Packet Light
                    const dataProgress = (time * 1.4 + (p.id * 25 + cx * 0.06)) % 1;
                    const dataX = cableX + dataProgress * 36;
                    const dataY = py + p.height + 2 + Math.sin(dataProgress * Math.PI) * 12;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(dataX, dataY, 1.8, 0, Math.PI * 2);
                    this.ctx.fill();
                }

            } else if (worldIdx === 4) {
                // 🌌 World 5 (Cosmic Galaxy): Celestial Diamond Veins & Orbiting Stardust
                this.ctx.fillStyle = '#ffd700';
                this.ctx.shadowColor = '#ffd700';
                this.ctx.shadowBlur = 8;
                for (let dx = 20; dx < p.width - 25; dx += 42) {
                    const gemX = px + dx;
                    this.ctx.beginPath();
                    this.ctx.moveTo(gemX, py + 6);
                    this.ctx.lineTo(gemX + 3, py + 3);
                    this.ctx.lineTo(gemX + 6, py + 6);
                    this.ctx.lineTo(gemX + 3, py + 9);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            }

            this.ctx.restore();
        });

        // 🦆 World-Customized Low Overhead Duck Ceilings (Chapter 3+)
        (this.overheadCeilings || []).forEach(oc => {
            const cx = Math.round(oc.x - camX);
            const cy = Math.round(oc.y - camY);
            if (cx + oc.width < -30 || cx > w + 30) return;

            this.ctx.save();

            // 1. Drop shadow below ceiling
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
            this.ctx.beginPath();
            this.ctx.roundRect(cx + 2, cy + 4, oc.width, oc.height, 8);
            this.ctx.fill();

            if (worldIdx === 0) {
                // 🌸 World 1 (Emerald Meadow): Ancient Flowering Wood Canopy & Mossy Timber Bridge
                const woodGrad = this.ctx.createLinearGradient(0, cy, 0, cy + oc.height);
                woodGrad.addColorStop(0, '#5d4037');
                woodGrad.addColorStop(1, '#3e2723');
                this.ctx.fillStyle = woodGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(cx, cy, oc.width, oc.height, 8);
                this.ctx.fill();

                // Top Moss Trim
                this.ctx.fillStyle = '#4caf50';
                this.ctx.beginPath();
                this.ctx.roundRect(cx, cy, oc.width, 5, [8, 8, 0, 0]);
                this.ctx.fill();

                // Hanging Ivy Tendrils along the bottom
                this.ctx.fillStyle = '#2e7d32';
                for (let vx = 10; vx < oc.width - 10; vx += 18) {
                    this.ctx.beginPath();
                    this.ctx.arc(cx + vx, cy + oc.height + 2, 2.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // Cute Forest Badge
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '900 12px "Fredoka One", sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = '#000000';
                this.ctx.shadowBlur = 4;
                this.ctx.fillText('🌿 CRAWL ▼', cx + oc.width / 2, cy + 16);

            } else if (worldIdx === 1) {
                // 🌋 World 2 (Magma Caverns): Obsidian Basalt Arch with Glowing Molten Fissures
                const rockGrad = this.ctx.createLinearGradient(0, cy, 0, cy + oc.height);
                rockGrad.addColorStop(0, '#21100b');
                rockGrad.addColorStop(1, '#100604');
                this.ctx.fillStyle = rockGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(cx, cy, oc.width, oc.height, 8);
                this.ctx.fill();

                // Glowing Molten Lava Core Fissure
                this.ctx.strokeStyle = '#ff3d00';
                this.ctx.shadowColor = '#ff3d00';
                this.ctx.shadowBlur = 10;
                this.ctx.lineWidth = 2.2;
                this.ctx.beginPath();
                this.ctx.moveTo(cx + 8, cy + 12);
                this.ctx.lineTo(cx + oc.width * 0.45, cy + 13);
                this.ctx.lineTo(cx + oc.width * 0.55, cy + 11);
                this.ctx.lineTo(cx + oc.width - 8, cy + 12);
                this.ctx.stroke();

                // Fiery Crawl Badge
                this.ctx.fillStyle = '#ffd600';
                this.ctx.font = '900 12px "Fredoka One", sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🔥 DUCK ▼', cx + oc.width / 2, cy + 16);

            } else if (worldIdx === 2) {
                // 👻 World 3 (Spectral Void): Ethereal Astral Gate with Glowing Amethyst Crystal Trim
                const voidGrad = this.ctx.createLinearGradient(0, cy, 0, cy + oc.height);
                voidGrad.addColorStop(0, '#1a0933');
                voidGrad.addColorStop(1, '#0d0221');
                this.ctx.fillStyle = voidGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(cx, cy, oc.width, oc.height, 8);
                this.ctx.fill();

                // Luminous Astral Cyan Trim
                this.ctx.strokeStyle = '#00f5ff';
                this.ctx.shadowColor = '#00f5ff';
                this.ctx.shadowBlur = 12;
                this.ctx.lineWidth = 1.8;
                this.ctx.stroke();

                // Amethyst Gemstones
                this.ctx.fillStyle = '#e040fb';
                this.ctx.beginPath();
                this.ctx.arc(cx + 12, cy + 12, 3.5, 0, Math.PI * 2);
                this.ctx.arc(cx + oc.width - 12, cy + 12, 3.5, 0, Math.PI * 2);
                this.ctx.fill();

                // Mystic Rune Badge
                this.ctx.fillStyle = '#00f5ff';
                this.ctx.font = '900 12px "Fredoka One", sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('✨ SLIDE ▼', cx + oc.width / 2, cy + 16);

            } else if (worldIdx === 3) {
                // 🤖 World 4 (Cyber Metropolis): Holographic Laser Security Barrier
                const cyberGrad = this.ctx.createLinearGradient(0, cy, 0, cy + oc.height);
                cyberGrad.addColorStop(0, '#0f172a');
                cyberGrad.addColorStop(1, '#020617');
                this.ctx.fillStyle = cyberGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(cx, cy, oc.width, oc.height, 8);
                this.ctx.fill();

                // Neon Cyber Border & Strobe Lights
                this.ctx.strokeStyle = '#00f5d4';
                this.ctx.shadowColor = '#00f5d4';
                this.ctx.shadowBlur = 10;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                // LED Corner Blinker Dots
                this.ctx.fillStyle = '#ff007f';
                this.ctx.shadowColor = '#ff007f';
                this.ctx.beginPath();
                this.ctx.arc(cx + 8, cy + 6, 2, 0, Math.PI * 2);
                this.ctx.arc(cx + oc.width - 8, cy + 6, 2, 0, Math.PI * 2);
                this.ctx.fill();

                // Digital HUD Badge
                this.ctx.fillStyle = '#00f5d4';
                this.ctx.font = '900 10px "Press Start 2P", monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('LOW PASS ▼', cx + oc.width / 2, cy + 16);

            } else {
                // 🌌 World 5 (Cosmic Galaxy): Celestial Stardust Meteorite Tunnel
                const cosmicGrad = this.ctx.createLinearGradient(0, cy, 0, cy + oc.height);
                cosmicGrad.addColorStop(0, '#240046');
                cosmicGrad.addColorStop(1, '#0f0022');
                this.ctx.fillStyle = cosmicGrad;
                this.ctx.beginPath();
                this.ctx.roundRect(cx, cy, oc.width, oc.height, 8);
                this.ctx.fill();

                // Starlight Gold Trim & Stars
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.shadowColor = '#ffd700';
                this.ctx.shadowBlur = 12;
                this.ctx.lineWidth = 1.8;
                this.ctx.stroke();

                // Diamond Sparkles on edges
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(cx + 10, cy + 12, 2.5, 0, Math.PI * 2);
                this.ctx.arc(cx + oc.width - 10, cy + 12, 2.5, 0, Math.PI * 2);
                this.ctx.fill();

                // Cosmic Star Badge
                this.ctx.fillStyle = '#ffd700';
                this.ctx.font = '900 12px "Fredoka One", sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('⭐ GLIDE ▼', cx + oc.width / 2, cy + 16);
            }

            this.ctx.restore();
        });

        // Static & Timed Retractable Hazard Spikes
        (this.hazards || []).forEach(h => {
            const hx = Math.round(h.x - camX);
            const hy = Math.round(h.y - camY);

            this.ctx.save();
            this.ctx.translate(hx, hy);

            const singleSpikeW = 22;
            const count = Math.max(1, Math.round(h.width / singleSpikeW));

            if (h.isRetractable) {
                // ⏰ TIMED RETRACTABLE TRAP BASE
                const ext = (h.extensionRatio !== undefined) ? h.extensionRatio : 1.0;
                const isExtended = ext > 0.35;
                const isWarning = h.state === 'WARNING';
                const isHidden = ext <= 0.05;

                // 1. Trapdoor Plate Base
                this.ctx.fillStyle = '#1e293b';
                this.ctx.beginPath();
                this.ctx.roundRect(-2, h.height - 4, h.width + 4, 6, 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#475569';
                this.ctx.lineWidth = 1.2;
                this.ctx.stroke();

                // 2. LED Status Light Indicators (Left & Right)
                const ledColor = isExtended ? '#ff1744' : (isWarning ? '#ffd600' : '#00e676');
                this.ctx.shadowColor = ledColor;
                this.ctx.shadowBlur = 8;
                this.ctx.fillStyle = ledColor;
                this.ctx.beginPath();
                this.ctx.arc(1, h.height - 1, 2.2, 0, Math.PI * 2);
                this.ctx.arc(h.width - 1, h.height - 1, 2.2, 0, Math.PI * 2);
                this.ctx.fill();

                // 3. Slot Openings in Floor
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#090d16';
                for (let k = 0; k < count; k++) {
                    this.ctx.fillRect(k * singleSpikeW + 2, h.height - 3, singleSpikeW - 4, 3);
                }

                // 4. Retractable Animated Spike Teeth (Interpolated Height)
                if (ext > 0.02) {
                    for (let k = 0; k < count; k++) {
                        const sx = k * singleSpikeW;
                        const spikeTopY = (h.height - 3) - (h.height - 3) * ext;

                        // Metallic Spike Gradient
                        const spikeGrad = this.ctx.createLinearGradient(sx, spikeTopY, sx + singleSpikeW, h.height);
                        spikeGrad.addColorStop(0, '#f8fafc');
                        spikeGrad.addColorStop(0.35, '#ff1744');
                        spikeGrad.addColorStop(0.7, '#64748b');
                        spikeGrad.addColorStop(1, '#334155');

                        this.ctx.fillStyle = spikeGrad;
                        this.ctx.beginPath();
                        this.ctx.moveTo(sx + 3, h.height - 2);
                        this.ctx.lineTo(sx + singleSpikeW / 2, spikeTopY);
                        this.ctx.lineTo(sx + singleSpikeW - 3, h.height - 2);
                        this.ctx.closePath();
                        this.ctx.fill();

                        // Glowing Red Tip when active
                        if (isExtended) {
                            this.ctx.fillStyle = '#ff1744';
                            this.ctx.shadowColor = '#ff1744';
                            this.ctx.shadowBlur = 6;
                            this.ctx.beginPath();
                            this.ctx.arc(sx + singleSpikeW / 2, spikeTopY + 2, 2.0, 0, Math.PI * 2);
                            this.ctx.fill();
                            this.ctx.shadowBlur = 0;
                        }
                    }
                }
            } else {
                // Static Standard Spikes
                for (let k = 0; k < count; k++) {
                    const sx = k * singleSpikeW;
                    const spikeGrad = this.ctx.createLinearGradient(sx, 0, sx + singleSpikeW, h.height);
                    spikeGrad.addColorStop(0, '#ff1744');
                    spikeGrad.addColorStop(0.5, '#b71c1c');
                    spikeGrad.addColorStop(1, '#4a0000');

                    this.ctx.fillStyle = spikeGrad;
                    this.ctx.beginPath();
                    this.ctx.moveTo(sx + 2, h.height);
                    this.ctx.lineTo(sx + singleSpikeW / 2, 2);
                    this.ctx.lineTo(sx + singleSpikeW - 2, h.height);
                    this.ctx.closePath();
                    this.ctx.fill();

                    this.ctx.strokeStyle = '#ff8a80';
                    this.ctx.lineWidth = 1.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(sx + 4, h.height);
                    this.ctx.lineTo(sx + singleSpikeW / 2, 4);
                    this.ctx.stroke();
                }
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
                // =========================================================================
                // ⛩️ GRAND CELESTIAL STARGATE GATEWAY (Majestic Arched Dimensional Portal)
                // =========================================================================
                const isUnlocked = this.player.hasGoldenKey || c.doorOpen;
                const platY = c.platformRef ? c.platformRef.y : (c.y + 50);
                const time = Date.now();
                
                this.ctx.restore();
                this.ctx.save();
                this.ctx.translate(c.x - this.camera.x + 18, platY - this.camera.y);

                const portalGlow = isUnlocked ? (theme.platformBorder || '#00f0ff') : '#ffd600';
                this.ctx.shadowColor = portalGlow;
                this.ctx.shadowBlur = isUnlocked ? 28 : 14;

                // 1. Grand Temple Arch Outer Frame (Fluted Pillars + Gothic Pediment)
                this.ctx.fillStyle = theme.platformColor || '#0f172a';
                this.ctx.beginPath();
                this.ctx.roundRect(-30, -88, 60, 88, [30, 30, 4, 4]);
                this.ctx.fill();

                // Gilded Runic Arch Border
                this.ctx.strokeStyle = theme.platformBorder || '#ffd700';
                this.ctx.lineWidth = 4;
                this.ctx.stroke();

                // 2. Twin Fluted Temple Pillars (Left & Right)
                [-27, 21].forEach(px => {
                    this.ctx.fillStyle = '#1e293b';
                    this.ctx.fillRect(px, -62, 6, 62);
                    this.ctx.strokeStyle = theme.platformBorder || '#ffd700';
                    this.ctx.lineWidth = 1.2;
                    this.ctx.strokeRect(px, -62, 6, 62);
                    
                    // Pillar Capital & Plinth
                    this.ctx.fillStyle = '#ffd700';
                    this.ctx.fillRect(px - 1.5, -65, 9, 3.5);
                    this.ctx.fillRect(px - 1.5, -2, 9, 3.5);
                });

                // 3. Crowning Keystone Gem (Pulsing Apex Crest 💎)
                this.ctx.save();
                this.ctx.shadowColor = isUnlocked ? '#00f0ff' : '#ffd700';
                this.ctx.shadowBlur = 16;
                this.ctx.fillStyle = isUnlocked ? '#00f0ff' : '#ffd700';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -96);
                this.ctx.lineTo(8, -88);
                this.ctx.lineTo(0, -80);
                this.ctx.lineTo(-8, -88);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(0, -88, 2.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();

                // 4. Inner Stargate Void & Cosmic Warp Wormhole
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.roundRect(-21, -80, 42, 80, [21, 21, 0, 0]);
                this.ctx.clip();

                if (isUnlocked) {
                    // === ACTIVE HYPERDRIVE STARGATE ===
                    const rot = time * 0.0035;

                    // Deep Space Event Horizon Background
                    const wormholeGrad = this.ctx.createRadialGradient(0, -40, 4, 0, -40, 36);
                    wormholeGrad.addColorStop(0, '#ffffff');
                    wormholeGrad.addColorStop(0.3, theme.platformBorder || '#00f0ff');
                    wormholeGrad.addColorStop(0.7, '#6a1b9a');
                    wormholeGrad.addColorStop(1, '#050014');
                    this.ctx.fillStyle = wormholeGrad;
                    this.ctx.fillRect(-21, -80, 42, 80);

                    // Dual Counter-Rotating Galaxy Vortex Spirals
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                    this.ctx.lineWidth = 2.5;
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, -40, 16, 26, rot, 0, Math.PI * 2);
                    this.ctx.stroke();

                    this.ctx.strokeStyle = theme.platformBorder || '#00f0ff';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, -40, 11, 18, -rot * 1.6, 0, Math.PI * 2);
                    this.ctx.stroke();

                    // Inward Streaming Stardust Warp Particles
                    this.ctx.fillStyle = '#ffffff';
                    for (let sp = 0; sp < 6; sp++) {
                        const spAngle = rot * 3 + sp * (Math.PI / 3);
                        const spDist = 6 + ((time * 0.02 + sp * 5) % 18);
                        const spX = Math.cos(spAngle) * spDist * 0.7;
                        const spY = -40 + Math.sin(spAngle) * spDist;
                        this.ctx.beginPath();
                        this.ctx.arc(spX, spY, 1.2 + (sp % 2), 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                } else {
                    // === LOCKED MAGICAL CRYSTAL BARRIER ===
                    const lockGrad = this.ctx.createLinearGradient(0, -80, 0, 0);
                    lockGrad.addColorStop(0, '#1a0826');
                    lockGrad.addColorStop(0.6, '#311b92');
                    lockGrad.addColorStop(1, '#090514');
                    this.ctx.fillStyle = lockGrad;
                    this.ctx.fillRect(-21, -80, 42, 80);

                    // Hexagonal Energy Forcefield Grid Lines
                    this.ctx.strokeStyle = 'rgba(255, 214, 0, 0.35)';
                    this.ctx.lineWidth = 1.2;
                    for (let y = -70; y <= -10; y += 14) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(-18, y);
                        this.ctx.lineTo(-8, y - 5);
                        this.ctx.lineTo(8, y - 5);
                        this.ctx.lineTo(18, y);
                        this.ctx.stroke();
                    }

                    // Floating 3D Ornate Golden Star Padlock
                    const lockFloat = Math.sin(time * 0.006) * 3;
                    this.ctx.save();
                    this.ctx.translate(0, -40 + lockFloat);

                    // Padlock Steel Shackle
                    this.ctx.strokeStyle = '#ffd700';
                    this.ctx.lineWidth = 3.5;
                    this.ctx.beginPath();
                    this.ctx.arc(0, -7, 7, Math.PI, 0);
                    this.ctx.stroke();

                    // Padlock Heavy Shield Body
                    this.ctx.fillStyle = '#ffb300';
                    this.ctx.beginPath();
                    this.ctx.roundRect(-9, -2, 18, 17, 4);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#fff8e1';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();

                    // Star Keyhole
                    this.ctx.fillStyle = '#1a0033';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 3, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ffd700';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 3, 1.2, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Orbiting Lock Sigil Stars
                    for (let s = 0; s < 3; s++) {
                        const sa = (time * 0.005) + (s * Math.PI * 2 / 3);
                        const sx = Math.cos(sa) * 14;
                        const sy = Math.sin(sa) * 10;
                        this.ctx.fillStyle = '#ffd600';
                        this.ctx.beginPath();
                        this.ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    this.ctx.restore();
                }

                this.ctx.restore(); // End clipping mask
                this.ctx.restore();
            }
            this.ctx.restore();
        });

        // Enemies (Theme-matched unique procedural creatures 🍄, 🦀, 👻, 🤖, 👾!)
        const currentWorldType = Math.floor((this.currentChapterIdx || 0) / 5) + 1;
        this.enemies.forEach(e => e.draw(this.ctx, this.camera, theme.slimeColor, e.worldType || currentWorldType));

        // Particles
        this.particles.forEach(p => p.draw(this.ctx, this.camera));

        // Player
        // Standalone 3D Power-up Boosters (🧲 Super Magnet, 🫧 Guardian Shield, ⚡ Thunder Boost)
        this.collectibles.forEach(c => {
            if (c.collected) return;
            if (c.type === 'powerup_magnet' || c.type === 'powerup_shield' || c.type === 'powerup_boost') {
                this.ctx.save();
                const cx = c.x - this.camera.x + 13;
                const cy = c.y - this.camera.y + 13;
                const time = Date.now();
                const hoverY = Math.sin(time * 0.005) * 3.5;
                
                this.ctx.translate(cx, cy + hoverY);

                // Ambient Beacon Light Column underneath
                const auraColor = (c.type === 'powerup_boost') ? '#ffd600' : (c.type === 'powerup_shield' ? '#00e5ff' : '#ff1744');
                this.ctx.shadowColor = auraColor;
                this.ctx.shadowBlur = 18;

                if (c.type === 'powerup_magnet') {
                    // =========================================================================
                    // 🧲 SUPER MAGNET: 3D Horseshoe Magnet with Radiating Magnetic Flux Arcs
                    // =========================================================================
                    const mScale = 1 + Math.sin(time * 0.008) * 0.05;
                    this.ctx.scale(mScale, mScale);

                    // Pulsing Magnetic Flux Waves (Radiating out from poles)
                    const wavePhase = (time * 0.006) % 1;
                    this.ctx.strokeStyle = `rgba(0, 229, 255, ${0.8 - wavePhase * 0.7})`;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(-8, -12 - wavePhase * 8, 6 + wavePhase * 6, Math.PI * 0.8, Math.PI * 1.8);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.arc(8, -12 - wavePhase * 8, 6 + wavePhase * 6, Math.PI * 1.2, Math.PI * 2.2);
                    this.ctx.stroke();

                    // Magnet Horseshoe U-Body (Chrome Vibrant Red)
                    this.ctx.lineWidth = 6.5;
                    this.ctx.strokeStyle = '#d50000';
                    this.ctx.lineCap = 'butt';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 2, 9, 0, Math.PI);
                    this.ctx.stroke();

                    // Left & Right Arms
                    this.ctx.fillStyle = '#d50000';
                    this.ctx.fillRect(-12.5, -7, 6.5, 9);
                    this.ctx.fillRect(6, -7, 6.5, 9);

                    // Silver Magnetic Tips
                    this.ctx.fillStyle = '#eceff1';
                    this.ctx.strokeStyle = '#90a4ae';
                    this.ctx.lineWidth = 1;
                    this.ctx.fillRect(-12.5, -12, 6.5, 5);
                    this.ctx.strokeRect(-12.5, -12, 6.5, 5);
                    this.ctx.fillRect(6, -12, 6.5, 5);
                    this.ctx.strokeRect(6, -12, 6.5, 5);

                    // Pole Markers [-] [+]
                    this.ctx.fillStyle = '#0091ea';
                    this.ctx.fillRect(-10.5, -10, 2.5, 1.2);
                    this.ctx.fillStyle = '#d50000';
                    this.ctx.fillRect(8, -10, 2.5, 1.2);
                    this.ctx.fillRect(8.7, -10.7, 1.2, 2.5);

                } else if (c.type === 'powerup_shield') {
                    // =========================================================================
                    // 🫧 GUARDIAN SHIELD: 3D Iridescent Prism Shield with Orbiting Energy Orbs
                    // =========================================================================
                    const rot = time * 0.004;

                    // Orbiting Crystal Energy Orbs
                    for (let o = 0; o < 3; o++) {
                        const oAngle = rot * 1.5 + (o * Math.PI * 2 / 3);
                        const ox = Math.cos(oAngle) * 17;
                        const oy = Math.sin(oAngle) * 9;
                        this.ctx.fillStyle = '#00f0ff';
                        this.ctx.shadowColor = '#00f0ff';
                        this.ctx.shadowBlur = 10;
                        this.ctx.beginPath();
                        this.ctx.arc(ox, oy, 2.8, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.beginPath();
                        this.ctx.arc(ox, oy, 1.2, 0, Math.PI * 2);
                        this.ctx.fill();
                    }

                    // 3D Medieval Prismatic Shield Body
                    const sGrad = this.ctx.createLinearGradient(-10, -14, 10, 14);
                    sGrad.addColorStop(0, '#00f0ff');
                    sGrad.addColorStop(0.5, '#7c4dff');
                    sGrad.addColorStop(1, '#ff4081');
                    this.ctx.fillStyle = sGrad;
                    this.ctx.beginPath();
                    this.ctx.moveTo(-11, -12);
                    this.ctx.lineTo(11, -12);
                    this.ctx.lineTo(11, 2);
                    this.ctx.quadraticCurveTo(8, 14, 0, 16);
                    this.ctx.quadraticCurveTo(-8, 14, -11, 2);
                    this.ctx.closePath();
                    this.ctx.fill();

                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 1.8;
                    this.ctx.stroke();

                    // Central Crest Star
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
                    this.ctx.fill();

                } else {
                    // =========================================================================
                    // ⚡ THUNDER BOOST: 3D Golden Lightning Bolt with Dynamic Electric Sparks
                    // =========================================================================
                    // Electric Crackling Arcs
                    this.ctx.strokeStyle = '#ffd600';
                    this.ctx.lineWidth = 1.5;
                    for (let i = 0; i < 3; i++) {
                        const sa = (time * 0.008 + i * 2);
                        const sx1 = Math.cos(sa) * 10;
                        const sy1 = Math.sin(sa) * 10;
                        const sx2 = sx1 + (Math.random() - 0.5) * 8;
                        const sy2 = sy1 + (Math.random() - 0.5) * 8;
                        this.ctx.beginPath();
                        this.ctx.moveTo(sx1, sy1);
                        this.ctx.lineTo(sx2, sy2);
                        this.ctx.stroke();
                    }

                    // 3D Golden Lightning Bolt Body
                    this.ctx.fillStyle = '#ffd600';
                    this.ctx.strokeStyle = '#ff6d00';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(2, -16);
                    this.ctx.lineTo(-9, 0);
                    this.ctx.lineTo(-1, 0);
                    this.ctx.lineTo(-3, 16);
                    this.ctx.lineTo(9, -2);
                    this.ctx.lineTo(1, -2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();

                    // Core White Energy Streak
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.moveTo(1, -12);
                    this.ctx.lineTo(-5, 0);
                    this.ctx.lineTo(0, 0);
                    this.ctx.lineTo(-1, 10);
                    this.ctx.lineTo(5, -1);
                    this.ctx.lineTo(0, -1);
                    this.ctx.closePath();
                    this.ctx.fill();
                }

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

        if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'DEATH_CHOICE' || this.state === 'COUNTDOWN') {
            this.player.draw(this.ctx, this.camera);
        }
    }
}

window.addEventListener('load', () => {
    window.gameInstance = new Game();
});
