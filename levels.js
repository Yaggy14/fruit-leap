// 25 Chapters Level Generator with Boss Arenas & Strategic Power-up Drops

const CHAPTER_THEMES = [
    // World 1 (Ch 1-5): 🌸 Emerald Meadow (Soft Sky Blue, Lush Mint Green, Crystal River)
    { name: "Emerald Meadow", nameTr: "Zümrüt Çayır", bg: "#3a7bd5", skyGradient: ["#3a7bd5", "#a1c4fd"], platformColor: "#2e7d32", platformBorder: "#66bb6a", hazardColor: "#e53935", liquidColor: "rgba(58, 123, 213, 0.40)", slimeColor: { start: "#ec407a", mid: "#ab47bc", end: "#6a1b9a", glow: "#ec407a", horn: "#ffd54f" } },
    
    // World 2 (Ch 6-10): 🌋 Magma Caverns (Volcanic Twilight Dusk, Basalt Rock, Lava Glow)
    { name: "Magma Caverns", nameTr: "Magma Mağaraları", bg: "#210909", skyGradient: ["#210909", "#4a1515", "#7f2b1d"], platformColor: "#263238", platformBorder: "#e65100", hazardColor: "#ff3d00", liquidColor: "rgba(230, 81, 0, 0.50)", slimeColor: { start: "#ff9800", mid: "#f57c00", end: "#d84315", glow: "#ff9800", horn: "#ffff00" } },
    
    // World 3 (Ch 11-15): ❄️ Glacial Frost (Buzul Diyarı - Glacial Cyan, Frost Blue, Diamond Icicles)
    { name: "Glacial Frost", nameTr: "Buzul Diyarı", bg: "#041527", skyGradient: ["#020b14", "#0a2540", "#004b7a"], platformColor: "#03284c", platformBorder: "#00f5ff", hazardColor: "#d500f9", liquidColor: "rgba(0, 245, 255, 0.40)", slimeColor: { start: "#00f5ff", mid: "#00b0ff", end: "#2979ff", glow: "#00f5ff", horn: "#ffffff" } },
    
    // World 4 (Ch 16-20): 🤖 Cyber Metropolis (Midnight Steel, Titanium Slate, Neon Electric Teal)
    { name: "Cyber Metropolis", nameTr: "Siber Metropol", bg: "#0f172a", skyGradient: ["#0f172a", "#1e293b", "#0f3460"], platformColor: "#1e293b", platformBorder: "#00f5d4", hazardColor: "#ff1744", liquidColor: "rgba(0, 245, 212, 0.40)", slimeColor: { start: "#00f5d4", mid: "#00bbf9", end: "#7000ff", glow: "#00f5d4", horn: "#fee440" } },
    
    // World 5 (Ch 21-25): 🌌 Cosmic Galaxy (Deep Celestial Space, Nebula Quartz, Starlight Gold)
    { name: "Cosmic Galaxy", nameTr: "Kozmik Galaksi", bg: "#050114", skyGradient: ["#050114", "#130533", "#2a0845"], platformColor: "#4a148c", platformBorder: "#ffd700", hazardColor: "#ff4081", liquidColor: "rgba(255, 215, 0, 0.35)", slimeColor: { start: "#ffd700", mid: "#f06292", end: "#7b1fa2", glow: "#ffd700", horn: "#00e5ff" } }
];

const BOSS_THEMES = {
    5: {
        // 👑 Boss 1: King Slime - Royal Palace Courtyard (Ch 5)
        name: "Royal Palace Courtyard",
        nameTr: "Kraliyet Sarayı Avlusu",
        bg: "#1a0826",
        skyGradient: ["#1e0836", "#4a1259", "#8e24aa"],
        platformColor: "#38004d",
        platformBorder: "#ffd700", // Gilded Royal Gold
        hazardColor: "#ff1744",
        liquidColor: "rgba(142, 36, 170, 0.45)",
        slimeColor: { start: "#ff4081", mid: "#ab47bc", end: "#6a1b9a", glow: "#ffd700", horn: "#ffd54f" }
    },
    10: {
        // 🌋 Boss 2: Magma Golem - Inferno Caldera (Ch 10)
        name: "Inferno Caldera",
        nameTr: "Cehennem Krateri",
        bg: "#100000",
        skyGradient: ["#0d0000", "#3d0a00", "#b71c1c"],
        platformColor: "#1a120b",
        platformBorder: "#ff3d00", // Blazing Magma Edge
        hazardColor: "#ff3d00",
        liquidColor: "rgba(255, 61, 0, 0.55)",
        slimeColor: { start: "#ff9800", mid: "#f57c00", end: "#d84315", glow: "#ff3d00", horn: "#ffff00" }
    },
    15: {
        // 👻 Boss 3: Shadow Phantom - Spectral Sanctum (Ch 15)
        name: "Spectral Sanctum",
        nameTr: "Ruhlar Mabedi",
        bg: "#02020d",
        skyGradient: ["#02020f", "#090526", "#00284d"],
        platformColor: "#0d0221",
        platformBorder: "#00f0ff", // Ethereal Cyan Edge
        hazardColor: "#d500f9",
        liquidColor: "rgba(0, 240, 255, 0.40)",
        slimeColor: { start: "#00f0ff", mid: "#3d5afe", end: "#12005e", glow: "#00f0ff", horn: "#e040fb" }
    },
    20: {
        // 🤖 Boss 4: Cyber Mecha - Cyber Core Matrix (Ch 20)
        name: "Cyber Core Matrix",
        nameTr: "Sibernetik Çekirdek Laboratuvarı",
        bg: "#010810",
        skyGradient: ["#020b14", "#0a192f", "#023e8a"],
        platformColor: "#051622",
        platformBorder: "#00f5d4", // Electric Neon Cyan Edge
        hazardColor: "#ff1744",
        liquidColor: "rgba(0, 245, 212, 0.45)",
        slimeColor: { start: "#00f5d4", mid: "#00bbf9", end: "#7000ff", glow: "#00ffcc", horn: "#fee440" }
    },
    25: {
        // 🌌 Boss 5: Cosmic Titan - Supernova Celestial Throne (Ch 25)
        name: "Cosmic Supernova Throne",
        nameTr: "Kozmik Süpernova Tahtı",
        bg: "#04000d",
        skyGradient: ["#050014", "#240046", "#7b1fa2"],
        platformColor: "#15002a",
        platformBorder: "#ffd700", // Radiant Celestial Gold Edge
        hazardColor: "#ff4081",
        liquidColor: "rgba(255, 215, 0, 0.45)",
        slimeColor: { start: "#ffd700", mid: "#f06292", end: "#7b1fa2", glow: "#ffd700", horn: "#00e5ff" }
    }
};

const FRUIT_TYPES = ['strawberry', 'apple', 'banana', 'grapes', 'orange', 'watermelon'];

function createSeededRandom(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function generate25Chapters() {
    const chapters = [];

    for (let c = 1; c <= 25; c++) {
        const themeIdx = Math.min(CHAPTER_THEMES.length - 1, Math.floor((c - 1) / 5));
        const themeObj = CHAPTER_THEMES[themeIdx];
        const isBossChapter = (c % 5 === 0);

        const levels = [];
        for (let l = 1; l <= 3; l++) {
            const isBossLevel = isBossChapter && (l === 3);
            const levelSeed = c * 99999 + l * 123456 + (c + l) * 777;
            const rng = createSeededRandom(levelSeed);

            // Progressive Map Length Scaling across Chapters (Chapter 1: ~2400px, Chapter 25: ~8500px!)
            const baseMapWidth = 2200 + (c * 230) + (l * 240) + Math.round(rng() * 300);
            const mapWidth = isBossLevel ? Math.round(baseMapWidth * 1.35 + 1200) : baseMapWidth; 
            const targetTimeSeconds = isBossLevel ? (60 + c * 3) : Math.round(24 + (mapWidth / 85));

            const platforms = [
                { id: 0, x: 0, y: 420, width: 380, height: 120 }
            ];

            let curX = 380;
            let platformIndex = 1;
            const fruitCollectibles = [];
            const enemies = [];
            const bouncyPads = [];
            const portals = [];
            const crates = [];
            const fans = [];
            const switches = [];
            const hazards = [];
            const overheadCeilings = [];

            let portalCount = 0;
            let ceilingCount = 0;
            let bouncyCount = 0;
            let powerupCount = 0;
            const maxPowerups = 2;
            let starPlaced = false;
            let bossObj = null;

            // Progressive quotas per chapter (Rich presence across all subsequent chapters!)
            const targetPortals = (c >= 12) ? 3 : (c >= 6 ? 2 : (c >= 2 ? 1 : 0));
            const maxCeilings = (c >= 14) ? 5 : (c >= 8 ? 4 : (c >= 5 ? 3 : (c >= 3 ? 2 : 0)));
            const maxBouncy = (c >= 2) ? Math.min(6, 2 + Math.floor(c / 4) + l) : 0; // Starts Ch 2, scales up to 6 trampolines!

            // Portal checkpoints along the map to ensure portals appear reliably
            const portalCheckpoints = (targetPortals === 1) ? [0.45] :
                                      (targetPortals === 2) ? [0.32, 0.68] :
                                      (targetPortals === 3) ? [0.25, 0.52, 0.78] : [];

            // 🧱 Arcade Platform Types Scope:
            // - Crumbling in Worlds 1 & 2 (Chapters 3-10)
            // - ❄️ 50% Icy Platforms exclusively in Ice-Themed World 3 (Chapters 11-15: Buzul Diyarı!)
            const isCrumblingWorld = (c >= 3 && c <= 10);
            const isIceThemeWorld = (c >= 11 && c <= 15);
            const icyChance = isIceThemeWorld ? 0.50 : 0.0;
            let consecutiveSpikes = 0;

            // NOTE: Starting platform (id 0) has NO FRUITS as requested by user.

            while (curX < mapWidth - (isBossLevel ? 1200 : 520)) {
                // World-specific gap scaling (Gentler in World 1, agile in higher worlds)
                const baseGap = (c <= 5) ? 45 : (c <= 15 ? 52 : 58);
                const gap = baseGap + Math.round(rng() * 38);
                let pWidth = 225 + Math.round(rng() * 150); // Comfortable baseline width
                
                // 🏔️ Upward Vertical Map Progression: Level climbs steadily upwards towards the sky/summit!
                const mapProgress = Math.min(1.0, curX / mapWidth);
                const targetSlopeY = 390 - (mapProgress * 210); // Smooth climb from Y=390 up to Y=180
                const heightVariation = (l === 2) ? 35 : (l === 3 ? 45 : 25);
                const pY = Math.max(150, Math.min(420, Math.round(targetSlopeY + (rng() - 0.5) * heightVariation))); 

                // ❄️ 50% Icy Platforms in Glacial Frost (World 3) - ALWAYS strictly NO spikes & long platform length!
                let isIcy = (isIceThemeWorld && rng() < icyChance);

                const hasEnemy = (c >= 3) && (rng() < Math.min(0.70, 0.32 + c * 0.015));
                // ⏰ Balanced Spikes: Only from Ch 5+, strictly NO spikes on icy or enemy platforms, with spacing cooldown!
                const canHaveSpikes = (c >= 5) && !hasEnemy && !isIcy && (consecutiveSpikes === 0);
                const hasSpikes = canHaveSpikes && (rng() < Math.min(0.28, 0.16 + c * 0.006));

                if (hasSpikes) {
                    consecutiveSpikes = 2; // Guarantee at least 2 safe non-spike platforms afterwards
                    pWidth = Math.max(320, Math.round(pWidth * 1.50));
                } else {
                    if (consecutiveSpikes > 0) consecutiveSpikes--;
                }

                if (hasEnemy) {
                    pWidth = Math.round(pWidth * 1.60);
                }

                // ❄️ Icy Platforms are comfortably LONG and spacious (290px - 400px) with NO spikes for smooth sliding!
                if (isIcy) {
                    pWidth = Math.max(pWidth, 290 + Math.round(rng() * 110));
                }

                const isMoving = c >= 3 && (rng() < Math.min(0.65, 0.18 + c * 0.02 + l * 0.03)) && platformIndex > 1;
                
                let isCrumbling = false;

                if (isCrumblingWorld && !isMoving && !hasEnemy && !hasSpikes && !isIcy && platformIndex > 1 && rng() < 0.28) {
                    isCrumbling = true;
                }

                // 🌟 SHORT & AGILE CRUMBLING PLATFORMS (110px - 145px)
                // Short enough so player jumps cleanly across without falling into the pit!
                if (isCrumbling) {
                    pWidth = 115 + Math.round(rng() * 30); // 115px - 145px
                }

                // 🚀 MOVING PLATFORMS: Clear Dedicate Air Buffer to NEVER overlap/collide with neighbors!
                let moveRange = 0;
                let actualGap = gap;
                if (isMoving) {
                    moveRange = 35 + Math.min(30, l * 5 + c * 1.0);
                    actualGap = gap + moveRange + 25; // Extra left clearance
                }

                const platformObj = {
                    id: platformIndex++,
                    x: curX + actualGap,
                    startX: curX + actualGap,
                    y: pY,
                    width: pWidth,
                    height: 24,
                    ...(isMoving ? { vx: 0.35 + (c * 0.012), range: moveRange } : {}),
                    ...(isCrumbling ? { isCrumbling: true, crumbleTimer: 68, maxCrumble: 68, respawnTimer: 0, isBroken: false } : {}),
                    ...(isIcy ? { isIcy: true } : {})
                };
                platforms.push(platformObj);

                // Advance curX past rightmost moving swing
                curX = platformObj.x + platformObj.width + (isMoving ? (moveRange + 25) : 0);

                // 🪜 VERTICAL TIERED JUMPING PLATFORMS (Zıplayarak Çıkılan Yüksek Basamak Adaları)
                let hasTieredLedge = false;
                if (!isMoving && !isCrumbling && !hasEnemy && !hasSpikes && rng() > 0.32) {
                    hasTieredLedge = true;
                    const stepY = Math.max(110, pY - 75 - Math.round(rng() * 25));
                    const stepIsIcy = (isIceThemeWorld && rng() < icyChance);
                    const stepWidth = stepIsIcy ? (190 + Math.round(rng() * 60)) : (145 + Math.round(rng() * 60));
                    const stepPlat = {
                        id: platformIndex++,
                        x: platformObj.x + Math.round(pWidth * 0.28),
                        y: stepY,
                        width: stepWidth,
                        height: 24,
                        ...(stepIsIcy ? { isIcy: true } : {})
                    };
                    platforms.push(stepPlat);

                    // 2-3 Fruits on high tiered ledge
                    const numStepFruits = (stepWidth > 175) ? 3 : 2;
                    for (let sfi = 0; sfi < numStepFruits; sfi++) {
                        const fType = FRUIT_TYPES[Math.floor(rng() * FRUIT_TYPES.length)];
                        fruitCollectibles.push({
                            type: fType,
                            x: stepPlat.x + 28 + sfi * 44,
                            y: stepY - 32,
                            width: 24,
                            height: 24,
                            platformId: stepPlat.id,
                            offsetX: 28 + sfi * 44
                        });
                    }
                }

                // 🔮 PORTALS: Guaranteed starting from Chapter 2 and scaling with chapters
                let hasPortalOnThisPlatform = false;
                const nextCheckpoint = portalCheckpoints[portalCount];
                const shouldSpawnPortal = (targetPortals > 0 && portalCount < targetPortals && nextCheckpoint !== undefined && mapProgress >= nextCheckpoint);

                if (shouldSpawnPortal && !isMoving && !isCrumbling) {
                    hasPortalOnThisPlatform = true;
                    const portExitX = curX + 130 + Math.round(rng() * 50);
                    const portExitY = Math.max(150, pY - 80 - Math.round(rng() * 25));
                    
                    // Sturdy portal destination island
                    const portIsIcy = (isIceThemeWorld && rng() < icyChance);
                    const portWidth = portIsIcy ? 260 : 210;
                    const portPlat = {
                        id: platformIndex++,
                        x: portExitX,
                        y: portExitY,
                        width: portWidth,
                        height: 24,
                        ...(portIsIcy ? { isIcy: true } : {})
                    };
                    platforms.push(portPlat);

                    portals.push({
                        entrancePlatformId: platformObj.id,
                        exitPlatformId: portPlat.id,
                        entrance: { x: platformObj.x + pWidth - 55, y: pY - 45, width: 30, height: 45, offsetX: pWidth - 55, offsetY: -45 },
                        exit: { x: portPlat.x + 35, y: portPlat.y - 45, width: 30, height: 45, offsetX: 35, offsetY: -45 }
                    });

                    portalCount++;
                    curX = Math.max(curX, portPlat.x + portPlat.width);
                }

                // 🔽 DUCK CROUCHING CEILINGS (Platform length is guaranteed to be 2X the duck ceiling length!)
                let hasDuckCeilingOnThisPlatform = false;

                if (c >= 3 && !hasEnemy && !hasSpikes && !hasPortalOnThisPlatform && !isCrumbling && !hasTieredLedge && ceilingCount < maxCeilings && rng() > 0.40) {
                    const ceilingWidth = 90;
                    // Ground platform length is at least 2x the duck ceiling length (180px+)
                    const requiredPlatWidth = ceilingWidth * 2;
                    if (platformObj.width < requiredPlatWidth) {
                        platformObj.width = requiredPlatWidth;
                        curX = platformObj.x + platformObj.width;
                    }
                    
                    const ceilingOffsetX = Math.round((platformObj.width - ceilingWidth) / 2);
                    overheadCeilings.push({
                        id: platformIndex++,
                        x: platformObj.x + ceilingOffsetX,
                        y: pY - 48,
                        width: ceilingWidth,
                        height: 24,
                        platformId: platformObj.id,
                        offsetX: ceilingOffsetX
                    });
                    ceilingCount++;
                    hasDuckCeilingOnThisPlatform = true;
                    // Never allow crumbling platforms beneath a DUCK ceiling!
                    delete platformObj.isCrumbling;
                    delete platformObj.crumbleTimer;
                    delete platformObj.maxCrumble;
                    delete platformObj.respawnTimer;
                    delete platformObj.isBroken;
                }

                // 🦘 TRAMPOLINES: Only spawn if there is NO duck ceiling, NO tiered ledge, and NOT crumbling on this platform!
                if (!hasDuckCeilingOnThisPlatform && !hasEnemy && !hasSpikes && !hasPortalOnThisPlatform && !isCrumbling && !hasTieredLedge && bouncyCount < maxBouncy && rng() > 0.25) {
                    const highY = Math.max(120, pY - 130 - Math.round(rng() * 25));
                    const highIsIcy = (isIceThemeWorld && rng() < icyChance);
                    const highWidth = highIsIcy ? 260 : 210;
                    const highPlat = {
                        id: platformIndex++,
                        x: platformObj.x + 120,
                        y: highY,
                        width: highWidth,
                        height: 24,
                        ...(highIsIcy ? { isIcy: true } : {})
                    };
                    platforms.push(highPlat);

                    bouncyPads.push({
                        id: platformIndex++,
                        x: platformObj.x + 20,
                        y: pY - 12,
                        width: 45,
                        height: 12,
                        platformId: platformObj.id
                    });
                    bouncyCount++;

                    // 2 to 3 Fruits on trampoline bonus platform
                    for (let tf = 0; tf < 3; tf++) {
                        const fruitType1 = FRUIT_TYPES[Math.floor(rng() * FRUIT_TYPES.length)];
                        fruitCollectibles.push({
                            type: fruitType1,
                            x: highPlat.x + 30 + tf * 55,
                            y: highY - 26,
                            width: 24,
                            height: 24,
                            platformId: highPlat.id,
                            offsetX: 30 + tf * 55
                        });
                    }
                }

                // ⏰ Spikes (Multi-Plate Timed Retractable Spikes with Balanced Spacing & Safe Landings!)
                if (hasSpikes) {
                    const isTimed = (c === 0) || (c >= 2 && rng() < 0.90); // 90% are rhythmic timed retractable traps!
                    const baseCycle = 280;
                    const basePhase = Math.floor(rng() * baseCycle);

                    if (pWidth >= 480) {
                        // 2 distinct timed spike trap plates with wide jumping clearance
                        const plateWidth = 44; // 2 spikes each
                        const positions = [0.30, 0.70];
                        positions.forEach((posRatio, pIdx) => {
                            const offX = Math.round(pWidth * posRatio - plateWidth / 2);
                            hazards.push({
                                x: platformObj.x + offX,
                                y: pY - 18,
                                width: plateWidth,
                                height: 18,
                                platformId: platformObj.id,
                                offsetX: offX,
                                isRetractable: isTimed,
                                cycleTicks: baseCycle,
                                phaseOffset: (basePhase + pIdx * 140) % baseCycle,
                                state: 'EXTENDED',
                                extensionRatio: 1.0
                            });
                        });
                    } else {
                        // 1 spike plate in center with wide safe margins on sides
                        const numSpikes = 2;
                        const spikeClusterWidth = numSpikes * 22;
                        const offX = Math.round(pWidth * 0.5 - spikeClusterWidth / 2);
                        hazards.push({
                            x: platformObj.x + offX,
                            y: pY - 18,
                            width: spikeClusterWidth,
                            height: 18,
                            platformId: platformObj.id,
                            offsetX: offX,
                            isRetractable: isTimed,
                            cycleTicks: baseCycle,
                            phaseOffset: basePhase,
                            state: 'EXTENDED',
                            extensionRatio: 1.0
                        });
                    }
                }

                // ⚡ Power-up Spawning (🧲 Mıknatıs, 🫧 Kalkan, ⚡ Hız İksiri - DAİMA LEVEL BAŞLARINDA: %10 - %38 aralığında!)
                const isEarlyMapSection = (mapProgress >= 0.10 && mapProgress <= 0.38);
                const powerChance = rng();
                let hasPowerup = false;
                if (!hasSpikes && !hasEnemy && !isCrumbling && powerupCount < maxPowerups && isEarlyMapSection && powerChance > 0.55) {
                    let pType = 'powerup_magnet';
                    if (powerChance > 0.82) {
                        pType = 'powerup_boost'; // ⚡ Early Speed Boost for exciting level-wide speedrun!
                    } else if (powerChance > 0.68) {
                        // Shield in boss/enemy worlds, magnet otherwise
                        pType = (isBossLevel || hasEnemy || c >= 3) ? 'powerup_shield' : 'powerup_magnet';
                    }

                    fruitCollectibles.push({
                        type: pType,
                        x: platformObj.x + Math.round(pWidth * 0.5 - 13),
                        y: pY - 36,
                        width: 26,
                        height: 26,
                        platformId: platformObj.id,
                        offsetX: Math.round(pWidth * 0.5 - 13)
                    });
                    powerupCount++;
                    hasPowerup = true;
                }

                // Fruit Spawning (Only if NO powerup and NO spikes to avoid clutter and overlap!)
                if (!hasSpikes && !hasPowerup) {
                    if (isCrumbling) {
                        // 1 single centered fruit on crumbling stepping stones for agile single-jump collection
                        const fType = FRUIT_TYPES[Math.floor(rng() * FRUIT_TYPES.length)];
                        fruitCollectibles.push({
                            type: fType,
                            x: platformObj.x + Math.round(pWidth * 0.5 - 12),
                            y: pY - 32,
                            width: 24,
                            height: 24,
                            platformId: platformObj.id,
                            offsetX: Math.round(pWidth * 0.5 - 12)
                        });
                    } else {
                        const numFruits = Math.max(2, Math.min(4, Math.floor(pWidth / 75)));
                        const spacing = pWidth / (numFruits + 1);
                        for (let fi = 1; fi <= numFruits; fi++) {
                            const fType = FRUIT_TYPES[Math.floor(rng() * FRUIT_TYPES.length)];
                            const fx = platformObj.x + Math.round(spacing * fi - 12);
                            fruitCollectibles.push({
                                type: fType,
                                x: fx,
                                y: pY - 32,
                                width: 24,
                                height: 24,
                                platformId: platformObj.id,
                                offsetX: Math.round(spacing * fi - 12)
                            });
                        }
                    }
                }

                // Enemy (Unique Creature per World Theme 🍄, 🦀, 👻, 🤖, 👾)
                if (hasEnemy) {
                    enemies.push({
                        x: platformObj.x + pWidth - 60,
                        y: pY - 24,
                        range: pWidth - 70,
                        platformId: platformObj.id,
                        worldType: Math.floor((c - 1) / 5) + 1
                    });
                }
            }

            // 👑 Exit Platform & Boss Arena Setup: Positioned high up at the celestial summit!
            const exitPlatY = isBossLevel ? 260 : 180; // High in altitude compared to start (Y=420)
            const exitPlatWidth = isBossLevel ? 980 : 450;
            const exitPlat = { id: platformIndex++, x: curX + 80, y: exitPlatY, width: exitPlatWidth, height: 120 };
            platforms.push(exitPlat);

            // Door at the very end of the final elevated summit platform
            fruitCollectibles.push({ 
                type: 'exit', 
                x: exitPlat.x + exitPlatWidth - 90, 
                y: exitPlatY - 70, 
                width: 36, 
                height: 70, 
                platformId: exitPlat.id, 
                offsetX: exitPlatWidth - 90 
            });

            // NOTE: Boss arena platform (exitPlat) has NO FRUITS as requested by user.

            // Mid-Map Star Key: ONLY on regular levels! On boss levels, boss drops the key upon defeat!
            if (!isBossLevel && platforms.length > 2) {
                // Pick middle intermediate platform (excluding start [0] and exit [last])
                const midIdx = Math.floor(platforms.length / 2);
                const midPlat = platforms[midIdx];
                
                // STRICT SAFETY: Completely clear ALL hazards/spikes, enemies, ceilings, and other items from key platform!
                for (let hi = hazards.length - 1; hi >= 0; hi--) {
                    if (hazards[hi].platformId === midPlat.id) hazards.splice(hi, 1);
                }
                for (let ei = enemies.length - 1; ei >= 0; ei--) {
                    if (enemies[ei].platformId === midPlat.id) enemies.splice(ei, 1);
                }
                for (let oi = overheadCeilings.length - 1; oi >= 0; oi--) {
                    if (overheadCeilings[oi].platformId === midPlat.id) overheadCeilings.splice(oi, 1);
                }
                for (let bi = bouncyPads.length - 1; bi >= 0; bi--) {
                    if (bouncyPads[bi].platformId === midPlat.id) bouncyPads.splice(bi, 1);
                }
                for (let ci = fruitCollectibles.length - 1; ci >= 0; ci--) {
                    if (fruitCollectibles[ci].platformId === midPlat.id) fruitCollectibles.splice(ci, 1);
                }
                
                fruitCollectibles.push({ 
                    type: 'star_key', 
                    x: midPlat.x + Math.round(midPlat.width * 0.5 - 13), 
                    y: midPlat.y - 35, 
                    width: 26, 
                    height: 26, 
                    platformId: midPlat.id, 
                    offsetX: Math.round(midPlat.width * 0.5 - 13) 
                });
            }

            // 🍓 HER HARİTADA EN AZ 15 MEYVE: Üstte Zıplanarak Çıkılan Yeni Basamak Adacıkları ile!
            let realFruitsCount = fruitCollectibles.filter(f => FRUIT_TYPES.includes(f.type)).length;
            let platWalkIdx = 1;
            let loopSafety = 0;
            while (realFruitsCount < 15 && platforms.length > 2 && loopSafety < 35) {
                loopSafety++;
                const basePlat = platforms[platWalkIdx % (platforms.length - 1)];
                platWalkIdx++;
                if (basePlat && basePlat.id !== 0 && basePlat.id !== exitPlat.id && !basePlat.isCrumbling) {
                    // Check if basePlat has any spikes/hazards
                    const hasSpikeOnBase = hazards.some(h => h.platformId === basePlat.id);
                    if (!hasSpikeOnBase) {
                        const extraStepY = Math.max(110, basePlat.y - 75 - Math.round(rng() * 20));
                        const extraStepIsIcy = (isIceThemeWorld && rng() < icyChance);
                        const extraStepW = extraStepIsIcy ? 190 : 145;
                        const extraPlat = {
                            id: platformIndex++,
                            x: basePlat.x + Math.round(basePlat.width * 0.25),
                            y: extraStepY,
                            width: extraStepW,
                            height: 24,
                            ...(extraStepIsIcy ? { isIcy: true } : {})
                        };
                        platforms.push(extraPlat);

                        // Place 2 fruits on this new clean elevated stepping platform
                        for (let efi = 0; efi < 2 && realFruitsCount < 15; efi++) {
                            const fType = FRUIT_TYPES[Math.floor(rng() * FRUIT_TYPES.length)];
                            fruitCollectibles.push({
                                type: fType,
                                x: extraPlat.x + 32 + efi * 50,
                                y: extraStepY - 32,
                                width: 24,
                                height: 24,
                                platformId: extraPlat.id,
                                offsetX: 32 + efi * 50
                            });
                            realFruitsCount++;
                        }
                    }
                }
            }

            // Boss Placement (Positioned in the arena of the platform with bossType)
            if (isBossLevel) {
                bossObj = {
                    x: exitPlat.x + 350,
                    y: exitPlat.y - 54,
                    platformId: exitPlat.id,
                    bossType: c
                };
            }

            const levelTheme = isBossLevel ? (BOSS_THEMES[c] || themeObj) : themeObj;

            levels.push({
                name: isBossLevel ? `${c}-${l}: 👑 ${levelTheme.name}` : `${c}-${l}: ${themeObj.name}`,
                isBossLevel: isBossLevel,
                boss: bossObj,
                theme: levelTheme,
                targetTime: targetTimeSeconds,
                mapWidth: exitPlat.x + exitPlat.width + 200,
                playerStart: { x: 50, y: 350 },
                platforms: platforms,
                hazards: hazards,
                overheadCeilings: overheadCeilings,
                bouncyPads: bouncyPads,
                enemies: enemies,
                portals: portals,
                crates: crates,
                fans: fans,
                switches: switches,
                collectibles: fruitCollectibles
            });
        }

        chapters.push({
            id: c,
            title: `Chapter ${c}: ${themeObj.name} ${isBossChapter ? '👑' : '⭐'}`,
            theme: themeObj,
            levels: levels
        });
    }

    return chapters;
}

const CHAPTERS = generate25Chapters();
