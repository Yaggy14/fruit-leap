// 25 Chapters Level Generator with Boss Arenas & Strategic Power-up Drops

const CHAPTER_THEMES = [
    // World 1 (Ch 1-5): 🌸 Emerald Meadow (Soft Sky Blue, Lush Mint Green, Crystal River)
    { name: "Emerald Meadow", bg: "#3a7bd5", skyGradient: ["#3a7bd5", "#a1c4fd"], platformColor: "#2e7d32", platformBorder: "#66bb6a", hazardColor: "#e53935", liquidColor: "rgba(58, 123, 213, 0.40)", slimeColor: { start: "#ec407a", mid: "#ab47bc", end: "#6a1b9a", glow: "#ec407a", horn: "#ffd54f" } },
    
    // World 2 (Ch 6-10): 🌋 Magma Caverns (Volcanic Twilight Dusk, Basalt Rock, Lava Glow)
    { name: "Magma Caverns", bg: "#210909", skyGradient: ["#210909", "#4a1515", "#7f2b1d"], platformColor: "#263238", platformBorder: "#e65100", hazardColor: "#ff3d00", liquidColor: "rgba(230, 81, 0, 0.50)", slimeColor: { start: "#ff9800", mid: "#f57c00", end: "#d84315", glow: "#ff9800", horn: "#ffff00" } },
    
    // World 3 (Ch 11-15): 👻 Spectral Void (Mystical Violet Night, Midnight Amethyst, Spectral Cyan)
    { name: "Spectral Void", bg: "#0d0826", skyGradient: ["#0d0826", "#1c1145", "#301b70"], platformColor: "#311b92", platformBorder: "#00e5ff", hazardColor: "#d500f9", liquidColor: "rgba(0, 229, 255, 0.35)", slimeColor: { start: "#00e5ff", mid: "#00b0ff", end: "#2979ff", glow: "#00e5ff", horn: "#e040fb" } },
    
    // World 4 (Ch 16-20): 🤖 Cyber Metropolis (Midnight Steel, Titanium Slate, Neon Electric Teal)
    { name: "Cyber Metropolis", bg: "#0f172a", skyGradient: ["#0f172a", "#1e293b", "#0f3460"], platformColor: "#1e293b", platformBorder: "#00f5d4", hazardColor: "#ff1744", liquidColor: "rgba(0, 245, 212, 0.40)", slimeColor: { start: "#00f5d4", mid: "#00bbf9", end: "#7000ff", glow: "#00f5d4", horn: "#fee440" } },
    
    // World 5 (Ch 21-25): 🌌 Cosmic Galaxy (Deep Celestial Space, Nebula Quartz, Starlight Gold)
    { name: "Cosmic Galaxy", bg: "#050114", skyGradient: ["#050114", "#130533", "#2a0845"], platformColor: "#4a148c", platformBorder: "#ffd700", hazardColor: "#ff4081", liquidColor: "rgba(255, 215, 0, 0.35)", slimeColor: { start: "#ffd700", mid: "#f06292", end: "#7b1fa2", glow: "#ffd700", horn: "#00e5ff" } }
];

const BOSS_THEMES = {
    5: {
        // 👑 Boss 1: King Slime - Royal Palace Courtyard (Ch 5)
        name: "Royal Palace Courtyard",
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
        const themeIdx = (c - 1) % CHAPTER_THEMES.length;
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

            // Progressive quotas per chapter
            const targetPortals = (c >= 14) ? 3 : (c >= 6 ? 2 : (c >= 2 ? 1 : 0));
            const maxCeilings = (c >= 16) ? 5 : (c >= 10 ? 4 : (c >= 5 ? 3 : (c >= 3 ? 2 : 0)));
            const maxBouncy = (c >= 15) ? 4 : (c >= 8 ? 3 : (c >= 3 ? 2 : 1));

            // Portal checkpoints along the map to ensure portals appear reliably
            const portalCheckpoints = (targetPortals === 1) ? [0.45] :
                                      (targetPortals === 2) ? [0.32, 0.68] :
                                      (targetPortals === 3) ? [0.25, 0.52, 0.78] : [];

            // NOTE: Starting platform (id 0) has NO FRUITS as requested by user.

            while (curX < mapWidth - (isBossLevel ? 1200 : 520)) {
                const gap = 55 + Math.round(rng() * 45);
                let pWidth = 170 + Math.round(rng() * 160); 
                
                const heightRange = (l === 2) ? 40 : (l === 3 ? 55 : 25);
                const pY = 330 + Math.round((rng() - 0.5) * heightRange); 

                const hasEnemy = (c >= 3) && (rng() < Math.min(0.70, 0.35 + c * 0.015));
                const hasSpikes = (c >= 6) && (rng() < Math.min(0.60, 0.28 + c * 0.014)) && !hasEnemy;

                if (hasEnemy || hasSpikes) {
                    pWidth = Math.round(pWidth * 1.85);
                }

                const isMoving = c >= 3 && (rng() < Math.min(0.65, 0.20 + c * 0.02 + l * 0.03)) && platformIndex > 1;
                
                const platformObj = {
                    id: platformIndex++,
                    x: curX + gap,
                    y: pY,
                    width: pWidth,
                    height: 24,
                    ...(isMoving ? { vx: 0.35 + (c * 0.012), range: 40 + l * 6 + (c * 1.5) } : {})
                };
                platforms.push(platformObj);

                curX = platformObj.x + platformObj.width;

                // 🔮 PORTALS: Guaranteed starting from Chapter 2 and scaling with chapters
                let hasPortalOnThisPlatform = false;
                const mapProgress = curX / mapWidth;
                const nextCheckpoint = portalCheckpoints[portalCount];
                const shouldSpawnPortal = (targetPortals > 0 && portalCount < targetPortals && nextCheckpoint !== undefined && mapProgress >= nextCheckpoint);

                if (shouldSpawnPortal && !isMoving) {
                    hasPortalOnThisPlatform = true;
                    const portExitX = curX + 130 + Math.round(rng() * 50);
                    const portExitY = Math.max(160, pY - 95 - Math.round(rng() * 30));
                    
                    // Sturdy portal destination island
                    const portPlat = { id: platformIndex++, x: portExitX, y: portExitY, width: 180, height: 24 };
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

                // 🔽 DUCK CROUCHING CEILINGS vs 🦘 TRAMPOLINES (Strict Mutually Exclusive Check!)
                let hasDuckCeilingOnThisPlatform = false;

                if (c >= 3 && !hasEnemy && !hasSpikes && !hasPortalOnThisPlatform && ceilingCount < maxCeilings && rng() > 0.45) {
                    overheadCeilings.push({
                        id: platformIndex++,
                        x: platformObj.x + 35,
                        y: pY - 48,
                        width: Math.min(120, pWidth - 65),
                        height: 24,
                        platformId: platformObj.id,
                        offsetX: 35
                    });
                    ceilingCount++;
                    hasDuckCeilingOnThisPlatform = true;
                }

                // 🦘 TRAMPOLINES: Only spawn if there is NO duck ceiling on this platform!
                if (!hasDuckCeilingOnThisPlatform && !hasEnemy && !hasSpikes && !hasPortalOnThisPlatform && bouncyCount < maxBouncy && rng() > 0.45) {
                    const highY = pY - 145 - Math.round(rng() * 25);
                    const highPlat = {
                        id: platformIndex++,
                        x: platformObj.x + 130,
                        y: highY,
                        width: 165,
                        height: 24
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

                    // 2 Fruits on trampoline bonus platform
                    for (let tf = 0; tf < 2; tf++) {
                        const fruitType1 = FRUIT_TYPES[Math.floor(rng() * FRUIT_TYPES.length)];
                        fruitCollectibles.push({
                            type: fruitType1,
                            x: highPlat.x + 25 + tf * 55,
                            y: highY - 26,
                            width: 24,
                            height: 24,
                            platformId: highPlat.id,
                            offsetX: 25 + tf * 55
                        });
                    }
                }

                // Spikes (Increased count to 2-3 in a row!)
                if (hasSpikes) {
                    const numSpikes = pWidth > 260 ? 3 : 2;
                    const spikeClusterWidth = numSpikes * 22;
                    hazards.push({
                        x: platformObj.x + Math.round(pWidth * 0.5 - spikeClusterWidth / 2),
                        y: pY - 18,
                        width: spikeClusterWidth,
                        height: 18,
                        platformId: platformObj.id,
                        offsetX: Math.round(pWidth * 0.5 - spikeClusterWidth / 2)
                    });
                }

                // Power-up Spawning (🧲 Mıknatıs, 🫧 Kalkan, ⚡ Hız İksiri - MAX 2 PER MAP!)
                const powerChance = rng();
                let hasPowerup = false;
                if (!hasSpikes && !hasEnemy && powerupCount < maxPowerups && powerChance > 0.82) {
                    let pType = 'powerup_magnet';
                    if (powerChance > 0.94) {
                        pType = 'powerup_boost';
                    } else if (powerChance > 0.88) {
                        // Shield ONLY spawns in boss levels or levels with slime enemies
                        if (isBossLevel || hasEnemy || c >= 3) {
                            pType = 'powerup_shield';
                        } else {
                            pType = 'powerup_magnet';
                        }
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

                // Enemy (Slime 👾)
                if (hasEnemy) {
                    enemies.push({
                        x: platformObj.x + pWidth - 60,
                        y: pY - 24,
                        range: pWidth - 70,
                        platformId: platformObj.id
                    });
                }
            }

            // Exit Platform & Boss Arena Setup
            // Normal levels: 450, Boss levels: arena platform (980)
            const exitPlatWidth = isBossLevel ? 980 : 450;
            const exitPlat = { id: platformIndex++, x: curX + 80, y: 360, width: exitPlatWidth, height: 120 };
            platforms.push(exitPlat);

            // Door at the very end of the final platform
            fruitCollectibles.push({ 
                type: 'exit', 
                x: exitPlat.x + exitPlatWidth - 90, 
                y: 290, 
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
