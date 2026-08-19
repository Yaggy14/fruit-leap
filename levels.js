// 25 Chapters Level Generator + Chapter 0 Test Playground, Double Spikes, Moving Attached Portals & Crouching Ceilings

const CHAPTER_THEMES = [
    { name: "Sunny Meadow", bg: "#00b4d8", skyGradient: ["#0077b6", "#a0ecff"], platformColor: "#38ef7d", platformBorder: "#11998e", hazardColor: "#ff4d4d", liquidColor: "rgba(0, 180, 216, 0.45)", slimeColor: { start: "#ff007f", mid: "#e040fb", end: "#7c4dff", glow: "#ff007f", horn: "#76ff03" } },
    { name: "Candy Kingdom", bg: "#ec407a", skyGradient: ["#ad1457", "#ff80ab"], platformColor: "#ffb74d", platformBorder: "#f57c00", hazardColor: "#ff1744", liquidColor: "rgba(236, 64, 122, 0.45)", slimeColor: { start: "#00f0ff", mid: "#00b0ff", end: "#3d5afe", glow: "#00f0ff", horn: "#ffd600" } },
    { name: "Cloud Paradise", bg: "#7e57c2", skyGradient: ["#4527a0", "#d1c4e9"], platformColor: "#29b6f6", platformBorder: "#0288d1", hazardColor: "#ff3d00", liquidColor: "rgba(126, 87, 194, 0.45)", slimeColor: { start: "#ffd600", mid: "#ffab00", end: "#ff6d00", glow: "#ffd600", horn: "#e040fb" } },
    { name: "Rainbow Hills", bg: "#ff7043", skyGradient: ["#d84315", "#ffe082"], platformColor: "#ffca28", platformBorder: "#ff8f00", hazardColor: "#e91e63", liquidColor: "rgba(255, 112, 67, 0.45)", slimeColor: { start: "#a855f7", mid: "#7c4dff", end: "#651fff", glow: "#a855f7", horn: "#76ff03" } },
    { name: "Starry Night", bg: "#1e1b4b", skyGradient: ["#0f172a", "#312e81"], platformColor: "#a855f7", platformBorder: "#7e22ce", hazardColor: "#ff1744", liquidColor: "rgba(168, 85, 247, 0.45)", slimeColor: { start: "#ff4081", mid: "#ff80ab", end: "#f50057", glow: "#ff4081", horn: "#00e5ff" } }
];

const FRUIT_TYPES = ['strawberry', 'apple', 'banana', 'grapes', 'orange', 'watermelon'];

// Deterministic Seeded PRNG (Mulberry32)
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

    // --- CHAPTERS 1 TO 25 ---
    for (let c = 1; c <= 25; c++) {
        const themeIdx = (c - 1) % CHAPTER_THEMES.length;
        const themeObj = CHAPTER_THEMES[themeIdx];

        const levels = [];
        for (let l = 1; l <= 3; l++) {
            const levelSeed = c * 99999 + l * 123456 + (c + l) * 777;
            const rng = createSeededRandom(levelSeed);

            const mapWidth = 2400 + c * 140 + l * 350 + Math.round(rng() * 400); 
            const targetTimeSeconds = Math.round(26 + (mapWidth / 90));

            const platforms = [
                { id: 0, x: 0, y: 420, width: 380, height: 120 } // Starting Platform
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
            let starPlaced = false;

            while (curX < mapWidth - 500) {
                const gap = 55 + Math.round(rng() * 45);
                let pWidth = 170 + Math.round(rng() * 160); 
                
                const heightRange = (l === 2) ? 40 : (l === 3 ? 55 : 25);
                const pY = 330 + Math.round((rng() - 0.5) * heightRange); 

                // Slime enemy (👾) spawns on platform -> 2x width!
                const hasEnemy = (c >= 5) && (rng() > 0.45);
                
                // Spikes (Chapter 10+): 2x width platform!
                const hasSpikes = (c >= 10) && (rng() > 0.55) && !hasEnemy;

                if (hasEnemy || hasSpikes) {
                    pWidth = Math.round(pWidth * 2.0);
                }

                const isMoving = c >= 4 && rng() > (0.65 - l * 0.05) && platformIndex > 1;
                
                const platformObj = {
                    id: platformIndex++,
                    x: curX + gap,
                    y: pY,
                    width: pWidth,
                    height: 24,
                    ...(isMoving ? { vx: 0.35 + (c * 0.01), range: 40 + l * 5 } : {})
                };
                platforms.push(platformObj);

                curX = platformObj.x + platformObj.width;

                // Portals (🔮🌀) attached to moving platform ends
                let hasPortalOnThisPlatform = false;
                const canSpawnPortal = (c >= 2) && (portalCount < (c >= 5 ? 2 : 1)) && (curX > mapWidth * (0.2 + l * 0.1));
                if (canSpawnPortal && rng() > 0.35) {
                    hasPortalOnThisPlatform = true;
                    const portExitX = curX + 130 + Math.round(rng() * 60);
                    const portExitY = pY - 110 - Math.round(rng() * 40);
                    
                    const portPlat = { id: platformIndex++, x: portExitX, y: portExitY, width: 150, height: 24 };
                    platforms.push(portPlat);

                    portals.push({
                        entrancePlatformId: platformObj.id,
                        exitPlatformId: portPlat.id,
                        entrance: { x: platformObj.x + pWidth - 45, y: pY - 45, width: 30, height: 45 },
                        exit: { x: portPlat.x + (portPlat.width / 2) - 15, y: portPlat.y - 45, width: 30, height: 45 }
                    });

                    portalCount++;
                    curX = Math.max(curX, portPlat.x + portPlat.width);
                }

                // Ducking / Crouching Overhead Low Ceilings starting from Chapter 3+
                if (c >= 3 && !hasEnemy && !hasSpikes && !hasPortalOnThisPlatform && rng() > 0.6) {
                    overheadCeilings.push({
                        id: platformIndex++,
                        x: platformObj.x + 35,
                        y: pY - 48,
                        width: Math.min(110, pWidth - 70),
                        height: 24,
                        platformId: platformObj.id,
                        offsetX: 35
                    });
                }

                // Trampolines (🌸 Spring Pads) placed purposefully! High Platform is offset to the RIGHT so player launches freely into air!
                if (!hasEnemy && !hasSpikes && !hasPortalOnThisPlatform && bouncyPads.length < 2 && rng() > 0.50) {
                    const highY = pY - 145 - Math.round(rng() * 25);
                    const highPlat = {
                        id: platformIndex++,
                        x: platformObj.x + 130, // Offset 130px to the RIGHT of trampoline!
                        y: highY,
                        width: 160,
                        height: 24
                    };
                    platforms.push(highPlat);

                    // Place Trampoline at x: platformObj.x + 20 on main platform!
                    bouncyPads.push({
                        id: platformIndex++,
                        x: platformObj.x + 20,
                        y: pY - 12,
                        width: 45,
                        height: 12,
                        platformId: platformObj.id
                    });

                    // Place bonus fruits on top of the high trampoline platform!
                    const fruitType1 = FRUIT_TYPES[Math.floor(rng() * FRUIT_TYPES.length)];
                    const fruitType2 = FRUIT_TYPES[Math.floor(rng() * FRUIT_TYPES.length)];
                    fruitCollectibles.push({
                        type: fruitType1,
                        x: highPlat.x + 35,
                        y: highY - 26,
                        width: 24,
                        height: 24,
                        platformId: highPlat.id,
                        offsetX: 35
                    });
                    fruitCollectibles.push({
                        type: fruitType2,
                        x: highPlat.x + 95,
                        y: highY - 26,
                        width: 24,
                        height: 24,
                        platformId: highPlat.id,
                        offsetX: 95
                    });
                }

                // REQ 1: DOUBLE SPIKE HAZARDS (2 spikes spaced out per 2x platform!)
                if (hasSpikes) {
                    const spikeWidth = 22;
                    const spOffX1 = Math.round(pWidth * 0.3 - 11);
                    const spOffX2 = Math.round(pWidth * 0.7 - 11);

                    hazards.push({
                        x: platformObj.x + spOffX1,
                        y: pY - 18,
                        width: spikeWidth,
                        height: 18,
                        platformId: platformObj.id,
                        offsetX: spOffX1
                    });
                    hazards.push({
                        x: platformObj.x + spOffX2,
                        y: pY - 18,
                        width: spikeWidth,
                        height: 18,
                        platformId: platformObj.id,
                        offsetX: spOffX2
                    });
                }

                // Golden Star placed near the MIDDLE of the map
                if (!starPlaced && curX >= mapWidth * 0.40 && curX <= mapWidth * 0.65) {
                    const starTowerX = curX + 60;
                    const starTowerY = pY - 110;
                    const starTower = { id: platformIndex++, x: starTowerX, y: starTowerY, width: 110, height: 24, ...(isMoving ? { vx: platformObj.vx, range: platformObj.range } : {}) };
                    platforms.push(starTower);
                    fruitCollectibles.push({ 
                        type: 'star_key', 
                        x: starTower.x + (starTower.width / 2) - 13, 
                        y: starTower.y - 34, 
                        width: 26, 
                        height: 26, 
                        platformId: starTower.id, 
                        offsetX: (starTower.width / 2) - 13 
                    });
                    starPlaced = true;
                    curX = Math.max(curX, starTower.x + starTower.width);
                }

                // NO FRUITS ON PORTAL PLATFORMS
                if (!hasPortalOnThisPlatform) {
                    let fruitOffsets = [];
                    if (pWidth >= 320) {
                        fruitOffsets = [30, Math.round((pWidth - 24) / 2), pWidth - 54];
                    } else if (pWidth >= 180) {
                        fruitOffsets = [35, pWidth - 59];
                    } else {
                        fruitOffsets = [Math.round((pWidth - 24) / 2)];
                    }

                    fruitOffsets.forEach((offX) => {
                        const fType = FRUIT_TYPES[Math.floor(rng() * FRUIT_TYPES.length)];
                        fruitCollectibles.push({
                            type: fType,
                            x: platformObj.x + offX,
                            y: pY - 32,
                            width: 24,
                            height: 24,
                            platformId: platformObj.id,
                            offsetX: offX
                        });
                    });
                }

                // Enemy (slime 👾) patrolling across 2x wide platform
                if (hasEnemy) {
                    enemies.push({
                        x: platformObj.x + pWidth - 60,
                        y: pY - 24,
                        range: pWidth - 70,
                        platformId: platformObj.id
                    });
                }
            }

            // Final Exit Goal (Elevated higher than start for climbing feel)
            const exitPlat = { id: platformIndex++, x: curX + 100, y: 340, width: 450, height: 120 };
            platforms.push(exitPlat);
            fruitCollectibles.push({ type: 'exit', x: exitPlat.x + 200, y: 270, width: 36, height: 70, platformId: exitPlat.id, offsetX: 200 });

            // Fallback Mid-Map Star Key if missing
            if (!starPlaced) {
                const midPlat = platforms[Math.floor(platforms.length / 2)];
                fruitCollectibles.push({ 
                    type: 'star_key', 
                    x: midPlat.x + (midPlat.width / 2) - 13, 
                    y: midPlat.y - 35, 
                    width: 26, 
                    height: 26, 
                    platformId: midPlat.id, 
                    offsetX: (midPlat.width / 2) - 13 
                });
            }

            levels.push({
                name: `${c}-${l}: ${themeObj.name}`,
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
            title: `Chapter ${c}: ${themeObj.name} ${c >= 5 ? '👾' : '⭐'}`,
            theme: themeObj,
            levels: levels
        });
    }

    return chapters;
}

const CHAPTERS = generate25Chapters();
