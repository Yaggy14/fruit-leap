// Player & Entities Physics Engine with Matched Callback Signatures & Strict Collision Handling

const CHARACTER_SKINS = [
    { id: 'bunny', name: 'Fluffy Bunny', nameTr: 'Pufuduk Tavşan', icon: '🐰', bodyColor: '#ffffff', earColor: '#ff80ab', priceStars: 0, perkEn: 'Double Jump & Float', perkTr: '2x Zıplama & Yumuşak İniş', speed: '3.4' },
    { id: 'kitty', name: 'Cute Kitty', nameTr: 'Sevimli Kedi', icon: '🐱', bodyColor: '#ffa726', earColor: '#ffb300', priceStars: 40, perkEn: '3x Triple Jump & Crawl', perkTr: '3x Zıplama & Çevik Sürünme', speed: '3.8' },
    { id: 'bear', name: 'Teddy Bear', nameTr: 'Ayıcık', icon: '🐻', bodyColor: '#8d6e63', earColor: '#5d4037', priceStars: 80, perkEn: 'Ground Slam & Shockwave', perkTr: 'Yere Vuruş & Şok Dalgası', speed: '3.5' },
    { id: 'fox', name: 'Foxy Hero', nameTr: 'Tilki Kahraman', icon: '🦊', bodyColor: '#ff5722', earColor: '#d84315', priceStars: 130, perkEn: 'Fast Sprint & Fire Trail', perkTr: 'Hızlı Koşu & Ateş İzi', speed: '4.1' },
    { id: 'panda', name: 'Panda Pal', nameTr: 'Panda Pal', icon: '🐼', bodyColor: '#ffffff', earColor: '#212121', priceStars: 190, perkEn: 'Mega High Leap (+35%)', perkTr: 'Mega Yüksek Zıplama', speed: '3.6' },
    { id: 'unicorn', name: 'Magic Unicorn', nameTr: 'Sihirli Tekboynuz', icon: '🦄', bodyColor: '#f5f3ff', earColor: '#ea80fc', priceStars: 260, perkEn: 'Star Glide & Soft Flutter', perkTr: 'Yıldız Süzülmesi & Kanat Çırpma', speed: '4.0' }
];

class Particle {
    constructor(x, y, color, size, vx, vy, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life--;
    }

    draw(ctx, camera) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class FloatingText {
    constructor(x, y, text, color = '#ffd600', fontSize = 26, life = 50) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
        this.life = life;
        this.maxLife = life;
        this.vy = -2.0;
    }

    update() {
        this.y += this.vy;
        this.vy *= 0.93;
        this.life--;
    }

    draw(ctx, camera) {
        if (this.life <= 0) return;
        ctx.save();
        const alpha = Math.min(1, this.life / (this.maxLife * 0.3));
        const popProgress = 1 - (this.life / this.maxLife);
        const scale = popProgress < 0.25 ? 1 + popProgress * 1.5 : 1.35 - (popProgress - 0.25) * 0.35;
        ctx.globalAlpha = alpha;
        ctx.font = `900 ${Math.round(this.fontSize * scale)}px "Fredoka One", "Nunito", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const px = this.x - camera.x;
        const py = this.y - camera.y;

        // Punchy Black Stroke Outline for crisp readability
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4.2;
        ctx.lineJoin = 'round';
        ctx.strokeText(this.text, px, py);

        // Radiant Glowing Colored Text
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillText(this.text, px, py);
        ctx.restore();
    }
}

class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const colors = ['#ff4081', '#00e5ff', '#ffd600', '#76ff03', '#e040fb', '#ff9100'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = -Math.random() * 8 - 4;
        this.size = Math.random() * 5 + 4;
        this.life = Math.floor(Math.random() * 40) + 50;
        this.maxLife = this.life;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.25;
        this.vx *= 0.98;
        this.rotation += this.rotSpeed;
        this.life--;
    }

    draw(ctx, camera) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        ctx.restore();
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 36;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.98;

        this.grounded = false;
        this.groundY = y;
        this.jumpCount = 0;
        this.canDoubleJump = true;
        this.isCrouching = false;
        this.isGroundPounding = false;
        this.isGliding = false;
        this.facing = 'right';
        this.invincibleTimer = 0;
        this.teleportCooldown = 0;
        this.currentSkinId = 'bunny';
        this.hasGoldenKey = false;
        this.isDead = false;
        this.deathTimer = 0;

        // Arcade Juiciness & Mechanics
        this.isOnIce = false;
        this.fruitComboCount = 0;
        this.fruitComboTimer = 0;

        // Power-ups
        this.hasBubbleShield = false;
        this.hasMagnet = false;
        this.hasSpeedBoost = false;
        this.lastSafeX = x;
        this.lastSafeY = y;
    }

    get skin() {
        return CHARACTER_SKINS.find(s => s.id === this.currentSkinId) || CHARACTER_SKINS[0];
    }

    get maxJumps() {
        if (this.currentSkinId === 'kitty') return 3; // Cute Kitty: Agile Triple Jump!
        return 2; // Standard: Double Jump
    }

    get jumpForce() {
        if (this.currentSkinId === 'panda') return -16.8; // Panda Pal: Mega High Leap!
        if (this.currentSkinId === 'bunny') return -15.0; // Fluffy Bunny: Springy Leap
        if (this.currentSkinId === 'unicorn') return -14.6; // Magic Unicorn: Starlight Leap
        if (this.currentSkinId === 'fox') return -14.3; // Foxy Hero: Nimble Leap
        if (this.currentSkinId === 'bear') return -13.8; // Teddy Bear: Heavy Leap
        if (this.currentSkinId === 'kitty') return -14.0; // Cute Kitty: Agile Leap
        return -14.2;
    }

    get speed() {
        let base = 3.4;
        if (this.currentSkinId === 'fox') base = 4.1; // Foxy Hero: Fast & Responsive!
        else if (this.currentSkinId === 'unicorn') base = 4.0;
        else if (this.currentSkinId === 'kitty') base = 3.8;
        else if (this.currentSkinId === 'panda') base = 3.6;
        else if (this.currentSkinId === 'bear') base = 3.5;
        else if (this.currentSkinId === 'bunny') base = 3.4;

        return this.hasSpeedBoost ? base * 1.45 : base;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.groundY = y;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.jumpCount = 0;
        this.canDoubleJump = true;
        this.isGroundPounding = false;
        this.isGliding = false;
        this.isCrouching = false;
        this.height = 36;
        this.invincibleTimer = 0;
        this.teleportCooldown = 0;
        this.hasGoldenKey = false;
        this.isDead = false;
        this.deathTimer = 0;
        this.isEnteringDoor = false;
        this.hasBubbleShield = false;
        this.hasMagnet = false;
        this.hasSpeedBoost = false;
        this.isOnIce = false;
        this.fruitComboCount = 0;
        this.fruitComboTimer = 0;
        this.lastSafeX = x;
        this.lastSafeY = y;
    }

    triggerDeath(cause, onDie, particles, floatingTexts = null, triggerShake = null, enemyWorldType = null) {
        if (this.hasBubbleShield) {
            this.hasBubbleShield = false;
            this.invincibleTimer = 90;
            audio.playStar();
            if (triggerShake) triggerShake(5, 0.2);
            if (floatingTexts) {
                floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 10, 'SHIELD BROKEN! 🫧', '#00f0ff', 18));
            }
            for (let i = 0; i < 16; i++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    '#00f0ff',
                    Math.random() * 3.5 + 2,
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5,
                    30
                ));
            }
            return;
        }

        if (!this.isDead) {
            this.isDead = true;
            this.deathTimer = 1.2;
            this.vx = 0;
            this.vy = -2.0;
            if (cause === 'enemy') {
                audio.playEnemyDeathSFX(enemyWorldType || 1);
            } else {
                audio.playHurt();
            }
            if (triggerShake) triggerShake(4, 0.15);
            
            const starColors = ['#ffd600', '#ffeb3b', '#ffffff', '#80d8ff'];
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 3,
                    starColors[i % starColors.length],
                    Math.random() * 3 + 2,
                    (Math.random() - 0.5) * 3.5,
                    (Math.random() - 0.5) * 3.5,
                    25
                ));
            }
        }
    }

    jump(particles, floatingTexts = null) {
        if (this.isDead || this.isEnteringDoor || this.isCrouching) return;
        
        // Grounded Jump OR Coyote Time Jump (Allows jumping within 8 frames after walking off ledge!)
        const canGroundJump = this.grounded || ((this.coyoteTimer || 0) > 0 && this.jumpCount === 0);

        if (canGroundJump) {
            this.vy = this.jumpForce;
            this.grounded = false;
            this.coyoteTimer = 0;
            this.jumpCount = 1;
            this.isGroundPounding = false;
            this.jumpSquashStretch = 1.25;
            audio.playJump();

            if (this.currentSkinId === 'panda') {
                this.createDust(particles, 12, '#a7f3d0');
            } else if (this.currentSkinId === 'fox') {
                this.createDust(particles, 10, '#ff5722');
            } else if (this.currentSkinId === 'unicorn') {
                this.createDust(particles, 10, '#ea80fc');
            } else {
                this.createDust(particles, 6, '#ffb74d');
            }
        } else if (this.jumpCount < this.maxJumps) {
            this.jumpCount++;
            this.vy = this.jumpForce * 0.92;
            this.isGroundPounding = false;
            this.jumpSquashStretch = 1.20;
            audio.playJump();

            if (this.currentSkinId === 'kitty' && this.jumpCount === 3) {
                this.createDust(particles, 12, '#ffd54f');
                if (floatingTexts) {
                    floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 14, 'TRIPLE JUMP! 🐱✨', '#ffd54f', 24));
                }
            } else if (this.currentSkinId === 'unicorn') {
                this.createDust(particles, 10, '#00e5ff');
            } else if (this.currentSkinId === 'panda') {
                this.createDust(particles, 10, '#34d399');
            } else {
                this.createDust(particles, 8, '#81d4fa');
            }
        } else {
            // Buffer jump if pressed just before touching the ground
            this.jumpBufferTimer = 8;
        }
    }

    createDust(particles, count, color = '#ffffff') {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height,
                color,
                Math.random() * 3 + 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.8) * 1.5,
                18
            ));
        }
    }

    isUnderOverheadCeiling(platforms, overheadCeilings = []) {
        const testBox = {
            x: this.x,
            y: this.y - 18,
            width: this.width,
            height: 18
        };
        for (let p of platforms) {
            if (this.checkCollision(testBox, p)) return true;
        }
        for (let oc of overheadCeilings) {
            if (this.checkCollision(testBox, oc)) return true;
        }
        return false;
    }

    update(keys, platforms, hazards, bouncyPads, collectibles, particles, enemies, portals, crates, fans, switches, onDie, onWin, onCollectFruit, onCollectStarKey, overheadCeilings = [], onDoorLocked = null, floatingTexts = [], triggerShake = null, boss = null) {
        if (this.isDead) {
            this.deathTimer -= 1 / 60;
            this.vx = 0;
            this.vy += this.gravity * 0.12;
            this.y += this.vy;

            if (Math.random() < 0.15) {
                particles.push(new Particle(
                    this.x + this.width / 2 + (Math.random() - 0.5) * 16,
                    this.y + 6,
                    '#ffd600',
                    Math.random() * 2 + 1.5,
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 1.5,
                    15
                ));
            }

            if (this.deathTimer <= 0) {
                this.isDead = false;
                this.deathTimer = 0;
                this.vy = 0;
                if (onDie) onDie();
            }
            return;
        }

        if (this.isEnteringDoor) {
            this.x = this.doorTargetX;
            this.vx = 0;
            this.vy = 0;
            if (!this.entryTimer) this.entryTimer = 25;
            this.entryTimer--;
            if (this.entryTimer <= 0) {
                this.isEnteringDoor = false;
                this.entryTimer = 0;
                if (this.onWinCallback) this.onWinCallback();
                return;
            }
            return;
        }

        if (this.fruitComboTimer > 0) {
            this.fruitComboTimer--;
            if (this.fruitComboTimer <= 0) {
                this.fruitComboCount = 0;
            }
        }

        let simKeys = { ...keys };

        if (simKeys.down && this.grounded && !this.isEnteringDoor) {
            if (!this.isCrouching) {
                this.isCrouching = true;
                this.height = 20;
                this.y += 16;
            }
        } else if (this.isCrouching) {
            if (!this.isUnderOverheadCeiling(platforms, overheadCeilings)) {
                this.isCrouching = false;
                this.height = 36;
                this.y -= 16;
            }
        }

        let targetVx = 0;
        if (simKeys.left) {
            targetVx = -this.speed;
            this.facing = 'left';
        } else if (simKeys.right) {
            targetVx = this.speed;
            this.facing = 'right';
        }

        if (this.isCrouching) {
            targetVx *= (this.currentSkinId === 'kitty' ? 0.80 : 0.45);
        }

        if (this.isOnIce && this.grounded) {
            // 🧊 REALISTIC ARCADE ICY PLATFORM DRIFT & SLIPPERY TRACTION
            const maxIceSpeed = this.speed * 1.25;
            if (targetVx !== 0) {
                // Low-traction smooth acceleration (takes a moment to grip and slides into fast speed)
                const clampedTarget = Math.sign(targetVx) * maxIceSpeed;
                this.vx += (clampedTarget - this.vx) * 0.085;
            } else {
                // Super slippery glide & slide deceleration (slides gracefully across the ice!)
                this.vx *= 0.984;
                if (Math.abs(this.vx) < 0.12) this.vx = 0;
            }

            // Crystal Ice spray and frost shimmer trails while sliding on ice
            if (Math.abs(this.vx) > 0.4 && particles && Math.random() < 0.65) {
                particles.push(new Particle(
                    this.x + (this.facing === 'right' ? -3 : this.width + 3),
                    this.y + this.height - 3,
                    '#00f5ff',
                    Math.random() * 2.5 + 1.5,
                    -this.vx * 0.3 + (Math.random() - 0.5) * 1.5,
                    -Math.random() * 2.2,
                    16
                ));
            }
        } else {
            this.vx = targetVx;
            this.isOnIce = false;
        }

        this.x += this.vx;

        if ((this.hasSpeedBoost || this.currentSkinId === 'fox') && Math.abs(this.vx) > 1.5 && Math.random() < 0.4) {
            const colors = this.currentSkinId === 'fox' ? ['#ff5722', '#ff9800', '#ffeb3b'] : ['#00e5ff', '#e040fb', '#ffd600'];
            particles.push(new Particle(
                this.x + (this.facing === 'right' ? -4 : this.width + 4),
                this.y + this.height - 8,
                colors[Math.floor(Math.random() * colors.length)],
                Math.random() * 3 + 2,
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 1.5,
                16
            ));
        }

        // Unicorn Star Glide & Feather Flutter (Hold UP/Jump while falling downwards)
        this.isGliding = false;
        if (this.currentSkinId === 'unicorn' && simKeys.up && !this.grounded && this.vy > 0.5) {
            this.isGliding = true;
            this.glideFallTimer = 18; // Soft fall buffer ticks
            // Always glide downwards at a gentle, smooth descent rate
            this.vy = 1.6;
            if (Math.random() < 0.45) {
                const colors = ['#ea80fc', '#00e5ff', '#ffd600', '#ffffff'];
                particles.push(new Particle(
                    this.x + this.width / 2 + (Math.random() - 0.5) * 14,
                    this.y + 8,
                    colors[Math.floor(Math.random() * colors.length)],
                    Math.random() * 2.5 + 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    20
                ));
            }
        } else if (this.currentSkinId === 'unicorn' && !this.grounded && (this.glideFallTimer || 0) > 0) {
            // Smooth soft-landing decay when releasing glide - doesn't instantly plummet!
            this.glideFallTimer--;
            this.vy = Math.min(this.vy, 4.2);
        } else if (this.grounded) {
            this.glideFallTimer = 0;
        }

        // Bear Ground Pound (Press DOWN while in air)
        if (this.currentSkinId === 'bear' && simKeys.down && !this.grounded && !this.isGroundPounding && this.vy > -2) {
            this.isGroundPounding = true;
            this.vy = 16.0;
            if (floatingTexts) {
                floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 12, 'BEAR SLAM! 🐻⚡', '#ffd600', 22));
            }
        }

        for (let p of platforms) {
            if (p.isBroken) continue;
            if (this.checkCollision(this, p)) {
                if (this.vx > 0) this.x = p.x - this.width;
                else if (this.vx < 0) this.x = p.x + p.width;
                this.vx = 0;
            }
        }

        // 🦆 Overhead Duck Ceilings: If player is standing upright, block horizontal movement (must crouch to crawl under!)
        for (let oc of (overheadCeilings || [])) {
            if (this.checkCollision(this, oc)) {
                if (this.vx > 0) this.x = oc.x - this.width;
                else if (this.vx < 0) this.x = oc.x + oc.width;
                this.vx = 0;
            }
        }

        for (let crate of crates) {
            if (this.checkCollision(this, crate)) {
                if (this.vx > 0) {
                    crate.x += 1.5;
                    this.x = crate.x - this.width;
                } else if (this.vx < 0) {
                    crate.x -= 1.5;
                    this.x = crate.x + crate.width;
                }
            }
        }

        // 🍃 Smooth, realistic gravity with apex hangtime & gradual acceleration (Tüm karakterler için)
        let appliedGravity = this.gravity;
        if (this.isGliding) {
            appliedGravity = 0; // Handled by glide clamp
        } else if (Math.abs(this.vy) < 3.2 && !this.grounded) {
            // Apex floatiness - gentle hangtime at the peak of the jump
            appliedGravity = this.gravity * 0.45;
        } else if (this.vy > 0) {
            // Gradual fall acceleration - starts gentle (0.60) and smoothly accelerates downwards as it falls!
            const fallProgress = Math.min(1.0, this.vy / 9.5);
            appliedGravity = this.gravity * (0.60 + fallProgress * 0.40);
        }
        
        this.vy += appliedGravity;
        if (this.vy > 12.0 && !this.isGroundPounding) this.vy = 12.0; // Smooth terminal velocity
        this.y += this.vy;

        this.grounded = false;

        for (let p of platforms) {
            if (p.isBroken) continue; // Broken crumbling platform is non-solid
            if (this.checkCollision(this, p)) {
                if (this.vy > 0) {
                    const wasPounding = this.isGroundPounding;
                    const fallVel = this.vy;
                    this.y = p.y - this.height;
                    this.vy = 0;
                    this.grounded = true;
                    this.jumpCount = 0;
                    this.isGroundPounding = false;
                    this.canDoubleJump = true;
                    this.coyoteTimer = 8;

                    // Landing compression squash & landing dust
                    if (fallVel > 3.0) {
                        this.landingSquashTimer = Math.min(10, Math.floor(fallVel * 1.3));
                        if (fallVel > 6.0 && particles) {
                            this.createDust(particles, 4, '#e2e8f0');
                        }
                    }

                    // Execute buffered jump if pressed just before landing!
                    if ((this.jumpBufferTimer || 0) > 0) {
                        this.jumpBufferTimer = 0;
                        this.jump(particles, floatingTexts);
                    }

                    if (p.isIcy) {
                        this.isOnIce = true;
                    }
                    if (p.isCrumbling && !p.isBroken) {
                        p.isSteppedOn = true;
                    }

                    if (!p.vx && !p.isCrumbling) {
                        this.lastSafeX = this.x;
                        this.lastSafeY = this.y;
                    }
                    if (p.vx) this.x += p.vx;

                    // Bear Heavy Slam Shockwave (Triggered ONLY on intentional ground pound slam)
                    if (this.currentSkinId === 'bear' && wasPounding) {
                        if (triggerShake) triggerShake(3, 0.12);
                        if (particles) {
                            for (let sp = 0; sp < 6; sp++) {
                                particles.push(new Particle(this.x + this.width / 2, this.y + this.height, '#ffd600', 3.5, (Math.random() - 0.5) * 5, -Math.random() * 2.5, 16));
                            }
                        }
                        for (let enemy of enemies) {
                            if (!enemy.isDead && Math.abs((enemy.x + 16) - (this.x + this.width / 2)) < 80 && Math.abs(enemy.y - this.y) < 35) {
                                enemy.isDead = true;
                                audio.playEnemyStompSFX(enemy.worldType || 1);
                                if (floatingTexts) floatingTexts.push(new FloatingText(enemy.x + 16, enemy.y - 14, 'SLAM! 🐻💥 +500', '#ffd600', 24));
                                if (particles) {
                                    for (let p = 0; p < 6; p++) {
                                        particles.push(new Particle(enemy.x + 16, enemy.y + 14, '#ffd600', 3, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 18));
                                    }
                                }
                            }
                        }
                    }
                } else if (this.vy < 0) {
                    this.y = p.y + p.height;
                    this.vy = 0;
                }
            }
        }

        for (let oc of overheadCeilings) {
            if (this.checkCollision(this, oc)) {
                if (this.vy < 0) {
                    this.y = oc.y + oc.height;
                    this.vy = 0;
                } else if (this.vy > 0 && (this.y + this.height - this.vy) <= oc.y + 6) {
                    this.y = oc.y - this.height;
                    this.vy = 0;
                    this.grounded = true;
                }
            }
        }

        for (let crate of crates) {
            if (this.checkCollision(this, crate)) {
                if (this.vy > 0) {
                    this.y = crate.y - this.height;
                    this.vy = 0;
                    this.grounded = true;
                    this.canDoubleJump = true;
                } else if (this.vy < 0) {
                    this.y = crate.y + crate.height;
                    this.vy = 0;
                }
            }
        }

        if (this.grounded) {
            this.groundY = this.y;
        } else if (this.y > this.groundY + 110) {
            this.groundY = this.y - 110;
        }

        if (this.teleportCooldown > 0) this.teleportCooldown--;
        if (this.teleportCooldown === 0) {
            for (let portal of portals) {
                const entryBox = portal.entrance || portal.entry;
                if (entryBox && portal.exit) {
                    if (this.checkCollision(this, entryBox)) {
                        this.x = portal.exit.x + 4;
                        this.y = portal.exit.y;
                        this.teleportCooldown = 45;
                        audio.playPortal();
                        if (triggerShake) triggerShake(3, 0.1);
                        for (let p = 0; p < 16; p++) {
                            particles.push(new Particle(portal.exit.x + 15, portal.exit.y + 20, '#00f0ff', 4, (Math.random()-0.5)*5, (Math.random()-0.5)*5, 25));
                        }
                        break;
                    }
                } else if (!portal.entry) {
                    // Boss Portal Logic (ONLY OPEN IF BOSS IS DEAD)
                    if (this.checkCollision(this, portal)) {
                        if (boss && !boss.isDead) {
                            // Boss not dead yet, door is locked
                            if (onDoorLocked && this.y >= portal.y + portal.height - 20) {
                                onDoorLocked();
                            }
                        } else {
                            // Win level!
                            this.isEnteringDoor = true;
                            this.doorTargetX = portal.x + (portal.width / 2) - (this.width / 2);
                            this.onWinCallback = onWin;
                            audio.playWin();
                            if (triggerShake) triggerShake(4, 0.2);
                        }
                    }
                }
            }
        }

        for (let sw of switches) {
            if (!sw.activated && this.checkCollision(this, sw)) {
                sw.activated = true;
                audio.playCoin();
                if (floatingTexts) floatingTexts.push(new FloatingText(sw.x + 12, sw.y - 12, 'SWITCH ON! ⚡', '#76ff03', 16));
                if (sw.targetWall) sw.targetWall.y += 150;
            }
        }

        for (let pad of bouncyPads) {
            if (this.checkCollision(this, pad)) {
                if (this.vy >= 0) {
                    this.y = pad.y - this.height;
                    this.vy = -24.5;
                    this.grounded = false;
                    this.canDoubleJump = true;
                    audio.playBoing();
                    if (triggerShake) triggerShake(4, 0.15);
                    if (floatingTexts) floatingTexts.push(new FloatingText(pad.x + 15, pad.y - 10, 'BOING! 👟', '#00f0ff', 16));
                    this.createDust(particles, 12, '#ff4081');
                }
            }
        }

        for (let fan of fans) {
            if (this.x < fan.x + fan.width + 20 &&
                this.x + this.width > fan.x - 20 &&
                this.y < fan.y &&
                this.y > fan.y - 180) {
                this.vy = -6.5;
                this.createDust(particles, 2, '#e0f7fa');
            }
        }

        if (this.invincibleTimer > 0) this.invincibleTimer--;

        for (let i = enemies.length - 1; i >= 0; i--) {
            let enemy = enemies[i];
            if (enemy.isDead) continue;

            // 🤖 Check Cyber Drone Active Laser Beam Hitbox (Long-Range 220px Beam)
            if (enemy.worldType === 4 && enemy.laserState === 'FIRING') {
                const droneDir = enemy.vx > 0 ? 1 : -1;
                const laserBox = {
                    x: droneDir > 0 ? (enemy.x + enemy.width) : (enemy.x - 220),
                    y: enemy.y + (enemy.floatY || 0) + 6,
                    width: 220,
                    height: 12
                };
                if (this.invincibleTimer <= 0 && this.checkCollision(this, laserBox)) {
                    this.triggerDeath('enemy', onDie, particles, floatingTexts, triggerShake, 4);
                    return;
                }
            }

            // ⭐ World 5 Star Shield Forcefield Protection
            if (enemy.worldType === 5 && enemy.isStarShielded) {
                if (this.checkCollision(this, enemy)) {
                    if (this.vy > 0 && (this.y + this.height - this.vy) <= (enemy.y + 16)) {
                        // Bounced off forcefield safely without dying!
                        this.y = enemy.y - this.height - 4;
                        this.vy = -14.5;
                        audio.playJump();
                        if (triggerShake) triggerShake(4, 0.14);
                        if (floatingTexts) {
                            floatingTexts.push(new FloatingText(enemy.x + 16, enemy.y - 20, '✨ SHIELD BLOCKED!', '#ffd700', 20));
                        }
                        if (particles) {
                            for (let p = 0; p < 12; p++) {
                                particles.push(new Particle(enemy.x + 16, enemy.y + 14, '#ffd700', 3.5, (Math.random()-0.5)*6, -Math.random()*4, 20));
                            }
                        }
                    } else if (this.invincibleTimer <= 0) {
                        this.triggerDeath('enemy', onDie, particles, floatingTexts, triggerShake, 5);
                        return;
                    }
                }
                continue;
            }

            if (this.checkCollision(this, enemy)) {
                if (this.vy > 0 && (this.y + this.height - this.vy) <= (enemy.y + 16)) {
                    enemy.isDead = true;
                    this.y = enemy.y - this.height;
                    this.vy = -12.8;
                    audio.playEnemyStompSFX(enemy.worldType || 1);
                    if (triggerShake) triggerShake(4, 0.12);
                    
                    const enemyLabels = {
                        1: 'SHROOM POP! 🍄 +300',
                        2: 'CRAB CRUNCH! 🦀 +300',
                        3: 'PHANTOM PURGE! 👻 +300',
                        4: 'DRONE SMASH! 🤖 +300',
                        5: 'STAR BURST! 👾 +300'
                    };
                    const enemyPColors = {
                        1: '#f44336',
                        2: '#ff5722',
                        3: '#00f0ff',
                        4: '#00f5d4',
                        5: '#ffd700'
                    };
                    const textLabel = enemyLabels[enemy.worldType || 1] || 'STOMP! 👾 +300';
                    const pColor = enemyPColors[enemy.worldType || 1] || '#e040fb';

                    if (floatingTexts) {
                        floatingTexts.push(new FloatingText(enemy.x + 16, enemy.y - 14, textLabel, pColor, 30));
                    }
                    if (particles) {
                        for (let p = 0; p < 8; p++) {
                            particles.push(new Particle(enemy.x + 16, enemy.y + 14, pColor, 3.5, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 18));
                        }
                    }
                } else if (this.invincibleTimer <= 0) {
                    this.triggerDeath('enemy', onDie, particles, floatingTexts, triggerShake, enemy.worldType || 1);
                    return;
                }
            }
        }

        if (boss && !boss.isDead && boss.state !== 'FALLING_DEAD' && boss.state !== 'DYING') {
            if (this.checkCollision(this, boss)) {
                if (this.vy > 0 && (this.y + this.height - this.vy) <= (boss.y + 24)) {
                    boss.takeDamage(1, particles, floatingTexts, triggerShake, collectibles, enemies);
                    this.y = boss.y - this.height;
                    this.vy = -14.0;
                    audio.playStomp();
                } else if (this.invincibleTimer <= 0 && boss.state !== 'HURT') {
                    this.triggerDeath('boss', onDie, particles, floatingTexts, triggerShake);
                    return;
                }
            }
        }

        if (this.y > 520) {
            this.triggerDeath('pit', onDie, particles, floatingTexts, triggerShake);
            return;
        }
        for (let hazard of hazards) {
            // ⏰ Timed Retractable Spikes: 100% safe to walk on when retracted inside the floor!
            if (hazard.isRetractable && (hazard.extensionRatio === undefined || hazard.extensionRatio < 0.35)) {
                continue;
            }
            if (this.checkCollision(this, hazard)) {
                this.triggerDeath('hazard', onDie, particles, floatingTexts, triggerShake);
                return;
            }
        }

        // Magnet Power-up Fruit Pull
        if (this.hasMagnet) {
            const playerCenterX = this.x + this.width / 2;
            const playerCenterY = this.y + this.height / 2;
            const magRadius = 220;
            const magSpeed = 7.5;
            for (let item of collectibles) {
                if (!item.collected && (item.type !== 'exit' && item.type !== 'exit_door')) {
                    const dx = playerCenterX - (item.x + 12);
                    const dy = playerCenterY - (item.y + 12);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < magRadius) {
                        item.x += (dx / dist) * magSpeed;
                        item.y += (dy / dist) * magSpeed;
                    }
                }
            }
        }

        for (let i = collectibles.length - 1; i >= 0; i--) {
            let item = collectibles[i];
            if (!item.collected && this.checkCollision(this, item)) {
                if (item.type === 'exit' || item.type === 'exit_door') {
                    if (!this.hasGoldenKey) {
                        if (this.facing === 'right') this.x = item.x - this.width - 2;
                        else this.x = item.x + item.width + 2;
                        this.vx = 0;
                        if (onDoorLocked) onDoorLocked();
                    } else {
                        item.collected = true;
                        item.doorOpen = true;
                        this.isEnteringDoor = true;
                        this.doorTargetX = item.x + (item.width / 2) - (this.width / 2);
                        this.onWinCallback = onWin;
                        audio.playFanfare();
                        audio.playWin();
                        if (triggerShake) triggerShake(4, 0.2);
                        if (floatingTexts) {
                            floatingTexts.push(new FloatingText(item.x + 12, item.y - 20, 'LEVEL CLEAR! ✨', '#76ff03', 22));
                        }
                    }
                } else if (item.type === 'golden_key' || item.type === 'star_key' || item.type === 'key') {
                    item.collected = true;
                    this.hasGoldenKey = true;
                    audio.playStar();
                    if (triggerShake) triggerShake(3, 0.15);
                    if (floatingTexts) {
                        floatingTexts.push(new FloatingText(item.x + 12, item.y - 12, 'KEY GET! 🔑', '#00f0ff', 18));
                    }
                    if (onCollectStarKey) onCollectStarKey(item);
                } else if (item.type === 'powerup_magnet') {
                    item.collected = true;
                    audio.playStar();
                    if (floatingTexts) floatingTexts.push(new FloatingText(item.x + 12, item.y - 12, 'MAGNET! 🧲', '#00e5ff', 18));
                    if (onCollectFruit) onCollectFruit(item);
                } else if (item.type === 'powerup_shield') {
                    item.collected = true;
                    this.hasBubbleShield = true;
                    audio.playStar();
                    if (floatingTexts) floatingTexts.push(new FloatingText(item.x + 12, item.y - 12, 'SHIELD UP! 🫧', '#00f0ff', 18));
                    if (onCollectFruit) onCollectFruit(item);
                } else if (item.type === 'powerup_boost') {
                    item.collected = true;
                    audio.playStar();
                    if (floatingTexts) floatingTexts.push(new FloatingText(item.x + 12, item.y - 12, 'SPEED BOOST! ⚡', '#ffd600', 18));
                    if (onCollectFruit) onCollectFruit(item);
                } else {
                    item.collected = true;
                    this.fruitComboCount++;
                    this.fruitComboTimer = 90; // ~1.5s combo chain window
                    audio.playFruitCombo(this.fruitComboCount);

                    const comboColors = ['#ffd600', '#00e5ff', '#ff4081', '#76ff03', '#e040fb', '#ffd700'];
                    const comboColor = comboColors[(this.fruitComboCount - 1) % comboColors.length];
                    const label = this.fruitComboCount > 1 
                        ? `+${100 * Math.min(3, this.fruitComboCount)} (${this.fruitComboCount}x COMBO!)` 
                        : '+100';

                    if (floatingTexts) {
                        floatingTexts.push(new FloatingText(item.x + 12, item.y - 14, label, comboColor, this.fruitComboCount >= 4 ? 28 : 22));
                    }
                    if (onCollectFruit) onCollectFruit(item, this.fruitComboCount);
                }

                if (item.collected) {
                    const burstColor = (this.fruitComboCount > 1) ? '#ff4081' : '#ffd600';
                    for (let p = 0; p < 8; p++) {
                        particles.push(new Particle(item.x + 12, item.y + 12, burstColor, 3, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 20));
                    }
                }
            }
        }
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    draw(ctx, camera) {
        const skin = CHARACTER_SKINS.find(s => s.id === this.currentSkinId) || CHARACTER_SKINS[0];
        
        ctx.save();
        const px = this.x - camera.x + this.width / 2;
        const py = this.y - camera.y + this.height / 2;

        ctx.translate(px, py);

        // Sinematic shrink & swirl into light portal when clearing level
        if (this.isEnteringDoor && this.entryTimer > 0) {
            const progress = this.entryTimer / 40; // 1 down to 0
            ctx.scale(Math.max(0, progress), Math.max(0, progress));
            ctx.rotate((1 - progress) * Math.PI * 4);
            ctx.globalAlpha = Math.max(0, progress);
        }

        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        let tilt = 0;
        if (Math.abs(this.vx) > 0.5) tilt = (this.facing === 'right' ? 0.12 : -0.12);
        if (!this.grounded) tilt += (this.facing === 'right' ? 0.08 : -0.08);
        ctx.rotate(tilt);

        let scaleX = 1;
        let scaleY = 1;
        if ((this.landingSquashTimer || 0) > 0) {
            const squashRatio = (this.landingSquashTimer / 10) * 0.22;
            scaleX = 1 + squashRatio;
            scaleY = 1 - squashRatio;
            this.landingSquashTimer--;
        } else if (!this.grounded) {
            if (this.vy < 0) { 
                scaleX = 0.86; 
                scaleY = 1.15 * (this.jumpSquashStretch || 1.0); 
                if (this.jumpSquashStretch > 1.0) this.jumpSquashStretch -= 0.03;
            } else { 
                scaleX = 1.08; 
                scaleY = 0.92; 
            }
        } else if (Math.abs(this.vx) > 0.5) {
            scaleX = 1 + Math.sin(Date.now() * 0.022) * 0.07;
            scaleY = 1 - Math.sin(Date.now() * 0.022) * 0.07;
        } else {
            // Idle cute breathing when standing still
            const breathe = Math.sin(Date.now() * 0.004) * 0.03;
            scaleX = 1 - breathe;
            scaleY = 1 + breathe;
        }
        ctx.scale(scaleX, scaleY);

        const isRight = this.facing === 'right';
        const time = Date.now();

        if (skin.id === 'fox') {
            const tailX = isRight ? -14 : 14;
            const tailWave = Math.sin(time * 0.012) * 4;
            ctx.fillStyle = '#ff5722';
            ctx.beginPath();
            ctx.ellipse(tailX, 4 + tailWave, 10, 6, isRight ? -0.4 : 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(tailX - (isRight ? 6 : -6), 4 + tailWave, 5, 4, isRight ? -0.4 : 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'kitty') {
            const tailX = isRight ? -12 : 12;
            const tailWave = Math.sin(time * 0.015) * 5;
            ctx.strokeStyle = '#ffa726';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tailX, 6);
            ctx.quadraticCurveTo(tailX - (isRight ? 10 : -10), 0 + tailWave, tailX - (isRight ? 8 : -8), -8 + tailWave);
            ctx.stroke();
        } else if (skin.id === 'bunny') {
            const tailX = isRight ? -13 : 13;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(tailX, 6, 4.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            const tailX = isRight ? -13 : 13;
            ctx.fillStyle = '#6d4c41';
            ctx.beginPath();
            ctx.arc(tailX, 7, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        if (skin.id === 'bunny' || skin.id === 'fox') {
            const capeOffset = isRight ? -12 : 12;
            const capeWave = Math.sin(time * 0.015) * 4;
            ctx.fillStyle = '#ff1744';
            ctx.beginPath();
            ctx.moveTo(capeOffset / 2, -2);
            ctx.lineTo(capeOffset - (isRight ? 14 : -14), 12 + capeWave);
            ctx.lineTo(capeOffset - (isRight ? 18 : -18), 4 + capeWave);
            ctx.lineTo(capeOffset / 2, -8);
            ctx.closePath();
            ctx.fill();
        } else if (skin.id === 'bear') {
            ctx.fillStyle = '#d32f2f';
            ctx.beginPath();
            ctx.roundRect(-10, 4, 20, 5, 2.5);
            ctx.fill();
            ctx.fillStyle = '#ffd600';
            ctx.beginPath();
            ctx.arc(0, 9, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        if (skin.id === 'bunny') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(isRight ? -4 : 4, -22, 5, 13, (isRight ? -0.15 : 0.15), 0, Math.PI * 2);
            ctx.ellipse(isRight ? 6 : -6, -24, 5, 14, (isRight ? 0.12 : -0.12), 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.ellipse(isRight ? -4 : 4, -22, 2.8, 9, (isRight ? -0.15 : 0.15), 0, Math.PI * 2);
            ctx.ellipse(isRight ? 6 : -6, -24, 2.8, 10, (isRight ? 0.12 : -0.12), 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            ctx.fillStyle = '#8d6e63';
            ctx.beginPath();
            ctx.arc(-11, -13, 7, 0, Math.PI * 2);
            ctx.arc(11, -13, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#d7ccc8';
            ctx.beginPath();
            ctx.arc(-11, -13, 4, 0, Math.PI * 2);
            ctx.arc(11, -13, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'kitty') {
            ctx.fillStyle = '#ffa726';
            ctx.beginPath();
            ctx.moveTo(-13, -6); ctx.lineTo(-11, -22); ctx.lineTo(-2, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(2, -10); ctx.lineTo(11, -22); ctx.lineTo(13, -6); ctx.fill();
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.moveTo(-11, -8); ctx.lineTo(-10, -18); ctx.lineTo(-4, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(4, -10); ctx.lineTo(10, -18); ctx.lineTo(11, -8); ctx.fill();
        } else if (skin.id === 'fox') {
            ctx.fillStyle = '#ff5722';
            ctx.beginPath();
            ctx.moveTo(-13, -6); ctx.lineTo(-11, -24); ctx.lineTo(-2, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(2, -10); ctx.lineTo(11, -24); ctx.lineTo(13, -6); ctx.fill();
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.moveTo(-11, -17); ctx.lineTo(-11, -24); ctx.lineTo(-6, -15); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, -15); ctx.lineTo(11, -24); ctx.lineTo(11, -17); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-9, -9); ctx.lineTo(-8, -16); ctx.lineTo(-4, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(4, -10); ctx.lineTo(8, -16); ctx.lineTo(9, -9); ctx.fill();
        } else if (skin.id === 'panda') {
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(-11, -13, 7.5, 0, Math.PI * 2);
            ctx.arc(11, -13, 7.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'unicorn') {
            // 🪽 Cute Compact White Wing with Gentle Calm Glide (Küçük ve Zarif Beyaz Kanat)
            const wingSide = isRight ? -4 : 4;
            const wingY = 3.0; // Arm / shoulder flank
            const wingFlap = this.isGliding ? Math.sin(time * 0.006) * 0.08 : (this.grounded ? 0 : Math.sin(time * 0.01) * 0.05);
            const wingScale = this.isGliding ? 0.95 : 0.78;
            const wingAngle = this.isGliding ? (isRight ? -0.38 + wingFlap : 0.38 - wingFlap) : (isRight ? 0.25 : -0.25);

            ctx.save();
            ctx.translate(wingSide, wingY);
            ctx.rotate(wingAngle);
            ctx.scale(isRight ? -wingScale : wingScale, wingScale);
            
            ctx.shadowColor = 'rgba(0, 229, 255, 0.35)';
            ctx.shadowBlur = this.isGliding ? 8 : 2;

            // 1. Primary Outer Feather (Pure Snowy White)
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.ellipse(-9, -4, 11, 4.2, -0.38, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 2. Secondary Mid Feather (Soft White)
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.ellipse(-7, -1, 9, 3.6, -0.20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 3. Small Fluffy Shoulder Feather
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(-4, 1, 6.5, 3.0, -0.08, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();

            const maneWave = Math.sin(time * 0.012) * 3;
            ctx.fillStyle = '#ff4081';
            ctx.beginPath();
            ctx.ellipse(isRight ? -10 : 10, -14 + maneWave, 5, 10, isRight ? 0.3 : -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.ellipse(isRight ? -14 : 14, -6 + maneWave, 5, 9, isRight ? 0.4 : -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.ellipse(isRight ? -12 : 12, 4 + maneWave, 4, 8, isRight ? 0.5 : -0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 14;
            const hornGrad = ctx.createLinearGradient(0, -28, 0, -10);
            hornGrad.addColorStop(0, '#00e5ff');
            hornGrad.addColorStop(0.5, '#ffd600');
            hornGrad.addColorStop(1, '#ff4081');
            ctx.fillStyle = hornGrad;
            ctx.beginPath();
            ctx.moveTo(-3, -10); ctx.lineTo(0, -30); ctx.lineTo(4, -10); ctx.fill();
            ctx.restore();
        }

        ctx.fillStyle = skin.bodyColor || '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 14.5, 0, Math.PI * 2);
        ctx.fill();

        if (skin.id === 'bunny') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 4, 8.5, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            ctx.fillStyle = '#efebe9';
            ctx.beginPath();
            ctx.ellipse(0, 3, 8, 6.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'fox') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(-7, 4, 6, 5.5, -0.3, 0, Math.PI * 2);
            ctx.ellipse(7, 4, 6, 5.5, 0.3, 0, Math.PI * 2);
            ctx.ellipse(0, 5, 6, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'kitty') {
            ctx.fillStyle = '#e65100';
            ctx.fillRect(-1.5, -13, 3, 5);
            ctx.fillRect(-6, -11, 2.5, 4);
            ctx.fillRect(3.5, -11, 2.5, 4);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 4, 7, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'panda') {
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(-11, 7, 5, 0, Math.PI * 2);
            ctx.arc(11, 7, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(255, 64, 129, 0.45)';
        ctx.beginPath();
        ctx.arc(-8, 3.5, 3, 0, Math.PI * 2);
        ctx.arc(8, 3.5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Cute Mini Running Feet 🐾
        const footColor = (skin.id === 'bear' || skin.id === 'fox' || skin.id === 'panda') ? '#212121' : (skin.bodyColor || '#ffffff');
        ctx.fillStyle = footColor;
        
        let leftFootY = 12.5;
        let rightFootY = 12.5;
        let leftFootX = -6;
        let rightFootX = 6;
        
        if (Math.abs(this.vx) > 0.4 && this.grounded) {
            const stepCycle = Math.sin(time * 0.024);
            leftFootY += stepCycle * 3;
            leftFootX += stepCycle * 4;
            rightFootY -= stepCycle * 3;
            rightFootX -= stepCycle * 4;
        } else if (!this.grounded) {
            // Tucked up in jump
            leftFootY = 10;
            rightFootY = 10;
            leftFootX = -5;
            rightFootX = 5;
        }

        // Left Foot
        ctx.beginPath();
        ctx.ellipse(leftFootX, leftFootY, 4.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right Foot
        ctx.beginPath();
        ctx.ellipse(rightFootX, rightFootY, 4.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        if (skin.id === 'panda') {
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.ellipse(-5.5, -2, 5.2, 4.2, -0.22, 0, Math.PI * 2);
            ctx.ellipse(5.5, -2, 5.2, 4.2, 0.22, 0, Math.PI * 2);
            ctx.fill();
        }

        const eyeOffset = isRight ? 2.5 : -2.5;

        if (this.isDead) {
            const drawHypnoEye = (cx, cy) => {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(cx, cy, 4.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#212121';
                ctx.lineWidth = 1.4;
                ctx.stroke();

                ctx.save();
                ctx.beginPath();
                ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
                ctx.clip();

                ctx.strokeStyle = '#4a148c';
                ctx.lineWidth = 1.3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                const spiralRot = time * 0.016;
                for (let a = 0; a < Math.PI * 5; a += 0.22) {
                    const r = a * 0.26;
                    const sx = cx + Math.cos(a + spiralRot) * r;
                    const sy = cy + Math.sin(a + spiralRot) * r;
                    if (a === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.stroke();
                ctx.restore();
            };

            drawHypnoEye(-5 + eyeOffset, -2.5);
            drawHypnoEye(5 + eyeOffset, -2.5);

            const starAngle = time * 0.007;
            for (let s = 0; s < 3; s++) {
                const sa = starAngle + (s * Math.PI * 2 / 3);
                const sx = Math.cos(sa) * 18;
                const sy = -24 + Math.sin(sa) * 6;
                const sRot = time * 0.015 + s;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(sRot);

                ctx.fillStyle = '#ffd600';
                ctx.beginPath();
                ctx.moveTo(0, -5);
                ctx.quadraticCurveTo(0, 0, 5, 0);
                ctx.quadraticCurveTo(0, 0, 0, 5);
                ctx.quadraticCurveTo(0, 0, -5, 0);
                ctx.quadraticCurveTo(0, 0, 0, -5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        } else if (skin.id === 'kitty') {
            ctx.fillStyle = '#00e676';
            ctx.beginPath();
            ctx.ellipse(-5 + eyeOffset, -2, 4.2, 5, 0, 0, Math.PI * 2);
            ctx.ellipse(5 + eyeOffset, -2, 4.2, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f3813';
            ctx.beginPath();
            ctx.ellipse(-4.5 + eyeOffset, -2, 1.6, 4.2, 0, 0, Math.PI * 2);
            ctx.ellipse(5.5 + eyeOffset, -2, 1.6, 4.2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'unicorn') {
            ctx.fillStyle = '#e040fb';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3a0066';
            ctx.beginPath();
            ctx.arc(-4 + eyeOffset, -2, 2.6, 0, Math.PI * 2);
            ctx.arc(6 + eyeOffset, -2, 2.6, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            ctx.arc(-4 + eyeOffset * 1.2, -2, 2.8, 0, Math.PI * 2);
            ctx.arc(6 + eyeOffset * 1.2, -2, 2.8, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!this.isDead) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset * 1.3, -3.5, 1.3, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset * 1.3, -3.5, 1.3, 0, Math.PI * 2);
            ctx.arc(-3 + eyeOffset * 1.3, -0.5, 0.7, 0, Math.PI * 2);
            ctx.arc(7 + eyeOffset * 1.3, -0.5, 0.7, 0, Math.PI * 2);
            ctx.fill();
        }

        if (skin.id === 'fox') {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(0 + eyeOffset * 0.5, 2.5, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            ctx.fillStyle = '#3e2723';
            ctx.beginPath();
            ctx.ellipse(0 + eyeOffset * 0.5, 2, 2.8, 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'kitty') {
            ctx.fillStyle = '#ff4081';
            ctx.beginPath();
            ctx.arc(0 + eyeOffset * 0.5, 1.8, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-7, 2); ctx.lineTo(-14, 0);
            ctx.moveTo(-7, 4); ctx.lineTo(-14, 5);
            ctx.moveTo(7, 2); ctx.lineTo(14, 0);
            ctx.moveTo(7, 4); ctx.lineTo(14, 5);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#ff4081';
            ctx.beginPath();
            ctx.arc(0 + eyeOffset * 0.5, 2, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.hasBubbleShield) {
            ctx.save();
            const bubblePulse = Math.sin(time * 0.006) * 1.5;
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 12;
            
            const shieldGrad = ctx.createRadialGradient(-4, -4, 4, 0, 0, 22 + bubblePulse);
            shieldGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            shieldGrad.addColorStop(0.6, 'rgba(0, 229, 255, 0.25)');
            shieldGrad.addColorStop(1, 'rgba(224, 64, 251, 0.45)');
            
            ctx.fillStyle = shieldGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 22 + bubblePulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.beginPath();
            ctx.ellipse(-8, -10, 6, 3, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, range, platformRef, worldType = 1) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 28;
        this.vx = 0.7;
        this.isDead = false;
        this.platformRef = platformRef;
        this.worldType = worldType || 1;
        
        // Special Mechanic State Variables per Creature
        this.actionTimer = Math.floor(Math.random() * 100);
        this.hopY = 0;
        this.hopVy = 0;
        this.floatY = 0;
        this.isCharging = false;
        this.isPhasing = false;
        this.isTurbo = false;
        this.phaseAlpha = 1.0;

        if (platformRef) {
            this.localX = Math.max(4, Math.min(x - platformRef.x, platformRef.width - this.width - 4));
        } else {
            this.localX = 0;
            this.startX = x;
        }
    }

    update(platforms, player = null, particles = null) {
        if (this.isDead) return;
        this.actionTimer++;

        let currentVx = this.vx;

        // 1. World 1 (🍄 Shroomie): Rhythmic High Spring Hop & Spore Dust
        if (this.worldType === 1) {
            if (this.hopY < 0 || this.hopVy !== 0) {
                this.hopY += this.hopVy;
                this.hopVy += 0.36; // Gravity
                if (this.hopY >= 0) {
                    this.hopY = 0;
                    this.hopVy = 0;
                    if (particles && Math.random() < 0.6) {
                        particles.push(new Particle(this.x + 16, this.y + 24, '#ff4081', 3.5, (Math.random()-0.5)*3.5, -Math.random()*2, 16));
                    }
                }
            } else if (this.actionTimer % 170 === 0) {
                this.hopVy = -8.2; // Pronounced, fun high arcade spring hop!
                if (particles) {
                    for (let sp = 0; sp < 3; sp++) {
                        particles.push(new Particle(this.x + 16, this.y + 26, '#ffd54f', 3, (Math.random()-0.5)*3.5, -Math.random()*2.5, 16));
                    }
                }
            }
        }

        // 2. World 2 (🦀 Magma Crab): Lava Snap Charge & Burning Embers
        if (this.worldType === 2) {
            const isNearPlayer = player && Math.abs(player.x - this.x) < 180 && Math.abs(player.y - this.y) < 50;
            const chargeCycle = this.actionTimer % 130;
            if (chargeCycle < 45 || isNearPlayer) {
                currentVx = this.vx * 2.2; // Aggressive burst charge!
                this.isCharging = true;
                if (particles && Math.random() < 0.45) {
                    particles.push(new Particle(this.x + 16, this.y + 20, '#ff3d00', 3, (Math.random()-0.5)*3, -Math.random()*2.5, 18));
                }
            } else {
                this.isCharging = false;
            }
        }

        // 3. World 3 (👻 Spectral Shadow Phantom): Ethereal Wave, Ghost Phase & Phantom Blink Teleport
        if (this.worldType === 3) {
            this.floatY = Math.sin(this.actionTimer * 0.055) * 8;
            const cycle = this.actionTimer % 280; // Extended calm cycle (~4.7s)

            if (cycle < 195) {
                // 1. Long Normal Ethereal Patrol (Solid, stompable & predictable)
                this.isPhasing = false;
                this.phaseAlpha = 0.95;
                currentVx = this.vx;
            } else if (cycle < 235) {
                // 2. Dissolving into Ghost Mist (Intangible & Purple Mist Warning)
                this.isPhasing = true;
                const fadeProg = (cycle - 195) / 40;
                this.phaseAlpha = Math.max(0.15, 0.95 - fadeProg * 0.80);
                currentVx = this.vx * 0.5;
                if (particles && Math.random() < 0.4) {
                    particles.push(new Particle(this.x + 16, this.y + 14, '#e040fb', 2.5, (Math.random()-0.5)*3, -Math.random()*2, 16));
                }
            } else if (cycle === 235) {
                // 3. Phantom Blink Teleport!
                const teleportDist = (this.vx > 0 ? 65 : -65);
                if (this.platformRef) {
                    const minLocal = 8;
                    const maxLocal = this.platformRef.width - this.width - 8;
                    const nextLocal = (this.localX || 0) + teleportDist;
                    if (nextLocal >= minLocal && nextLocal <= maxLocal) {
                        this.localX = nextLocal;
                    } else {
                        this.vx = -this.vx; // Reverse direction on platform bound
                        this.localX = Math.max(minLocal, Math.min(maxLocal, (this.localX || 0) - teleportDist * 0.5));
                    }
                } else {
                    this.x += teleportDist;
                }
                if (particles) {
                    for (let sp = 0; sp < 8; sp++) {
                        particles.push(new Particle(this.x + 16, this.y + 14, '#00f0ff', 3, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 20));
                    }
                }
            } else {
                // 4. Materializing Back to Solid Form
                this.isPhasing = false;
                const solidifyProg = (cycle - 235) / 45;
                this.phaseAlpha = Math.min(0.95, 0.15 + solidifyProg * 0.80);
                currentVx = this.vx;
            }
        }

        // 4. World 4 (🤖 Cyber Drone): Hover Patrol & Long-Range Targeted Plasma Laser Beam (220px)
        if (this.worldType === 4) {
            this.floatY = Math.sin(this.actionTimer * 0.055) * 5;
            const cycle = this.actionTimer % 240; // Less frequent firing (240 ticks ~4s cycle)
            const dir = this.vx > 0 ? 1 : -1;

            if (cycle < 160) {
                // 1. Long Safe Patrol (Smooth hover patrol)
                this.laserState = 'IDLE';
                currentVx = this.vx;
            } else if (cycle < 195) {
                // 2. Charging / Aiming Long-Range Laser (Clear red sight line warning)
                this.laserState = 'CHARGING';
                currentVx = 0; // Hover in place while aiming
                if (particles && Math.random() < 0.45) {
                    const muzzleX = dir > 0 ? (this.x + 32) : (this.x - 4);
                    particles.push(new Particle(muzzleX, this.y + 14, '#ff1744', 2.2, dir * (Math.random() * 2), (Math.random() - 0.5) * 2, 12));
                }
            } else if (cycle < 225) {
                // 3. Firing Mega Long-Range Plasma Laser Beam (220px)!
                this.laserState = 'FIRING';
                currentVx = 0;
                if (particles && Math.random() < 0.55) {
                    const muzzleX = dir > 0 ? (this.x + 34 + Math.random() * 180) : (this.x - Math.random() * 180);
                    particles.push(new Particle(muzzleX, this.y + 14, '#00f5d4', 2.8, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 14));
                }
            } else {
                // 4. Cooldown
                this.laserState = 'COOLDOWN';
                currentVx = 0;
            }
        }

        // 5. World 5 (⭐ Cosmic Supernova Star): Pulsar Shield Surge & Floating Celestial Glide
        if (this.worldType === 5) {
            this.floatY = Math.sin(this.actionTimer * 0.055) * 8;
            const cycle = this.actionTimer % 180;

            if (cycle < 100) {
                // 1. Normal Vulnerable State (Cute floating star, open to stomping!)
                this.isStarShielded = false;
                this.isStarWarning = false;
                currentVx = this.vx;
            } else if (cycle < 125) {
                // 2. Warning Charge State (Vibrating golden halo & warning sparks)
                this.isStarShielded = false;
                this.isStarWarning = true;
                currentVx = this.vx * 0.5;
                if (particles && Math.random() < 0.45) {
                    particles.push(new Particle(this.x + 16, this.y + 14, '#ffd700', 2.8, (Math.random()-0.5)*3, (Math.random()-0.5)*3, 14));
                }
            } else {
                // 3. Pulsar Shield Active! (Protective Golden Forcefield Ring)
                this.isStarShielded = true;
                this.isStarWarning = false;
                currentVx = this.vx * 1.35; // Swift shielded glide
                if (particles && Math.random() < 0.4) {
                    particles.push(new Particle(this.x + 16, this.y + 14, '#00e5ff', 3, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 16));
                }
            }
        }

        const effectiveHopY = (this.hopY || 0) + (this.floatY || 0);

        if (this.platformRef) {
            this.localX += currentVx;
            const minLocal = 4;
            const maxLocal = this.platformRef.width - this.width - 4;
            if (this.localX <= minLocal) {
                this.localX = minLocal;
                this.vx = Math.abs(this.vx);
            } else if (this.localX >= maxLocal) {
                this.localX = maxLocal;
                this.vx = -Math.abs(this.vx);
            }
            this.x = this.platformRef.x + this.localX;
            this.y = this.platformRef.y - this.height + effectiveHopY;
        } else {
            this.x += currentVx;
            if (Math.abs(this.x - this.startX) > 100) this.vx *= -1;
            this.y += effectiveHopY;
        }
    }

    draw(ctx, camera, themeSlime = null, worldTypeOverride = null) {
        if (this.isDead) return;
        ctx.save();
        const ex = this.x - camera.x;
        const ey = this.y - camera.y;
        const time = Date.now();
        const wType = worldTypeOverride || this.worldType || 1;

        // Ground anchor: Translate to bottom center of enemy, sitting exactly on platform top (y = 0 is floor)
        ctx.translate(ex + this.width / 2, ey + this.height);

        const eyeOffset = this.vx > 0 ? 2.5 : -2.5;

        if (wType === 1) {
            // =========================================================================
            // 🍄 WORLD 1: BOUNCY SHROOMIE (Ruby Spotted Mushroom with Bouncy Hop & Cheeks)
            // =========================================================================
            const isAirborne = this.hopY < 0;
            const squish = isAirborne ? -0.15 : (Math.sin(time * 0.01) * 0.08);
            ctx.scale(1 - squish, 1 + squish);

            // Walking cute feet (grounded at y = 0)
            const footCycle = Math.sin(time * 0.018);
            ctx.fillStyle = '#f57f17';
            ctx.beginPath();
            ctx.ellipse(-7 - footCycle * 3, -2, 4.5, 2.5, 0, 0, Math.PI * 2);
            ctx.ellipse(7 + footCycle * 3, -2, 4.5, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Stalk / Body
            ctx.fillStyle = '#fffde7';
            ctx.strokeStyle = '#fbc02d';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(-10, -18, 20, 17, [6, 6, 8, 8]);
            ctx.fill();
            ctx.stroke();

            // Mushroom Cap (Large Vibrant Ruby Dome)
            ctx.shadowColor = 'rgba(244, 67, 54, 0.6)';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#d50000';
            ctx.beginPath();
            ctx.arc(0, -17, 17, Math.PI, Math.PI * 2);
            ctx.closePath();
            ctx.fill();

            // White Spots on Cap
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -25, 3.8, 0, Math.PI * 2);
            ctx.arc(-10, -20, 2.8, 0, Math.PI * 2);
            ctx.arc(10, -20, 2.8, 0, Math.PI * 2);
            ctx.fill();

            // Cheerful Blushing Cheeks
            ctx.fillStyle = 'rgba(255, 64, 129, 0.6)';
            ctx.beginPath();
            ctx.arc(-7, -8, 2.5, 0, Math.PI * 2);
            ctx.arc(7, -8, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Cute Beady Eyes
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset, -10, 2.4, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset, -10, 2.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-5.5 + eyeOffset, -11, 0.9, 0, Math.PI * 2);
            ctx.arc(4.5 + eyeOffset, -11, 0.9, 0, Math.PI * 2);
            ctx.fill();

        } else if (wType === 2) {
            // =========================================================================
            // 🦀 WORLD 2: MAGMA ROCK-CRAB (Volcanic Basalt with Snapping Fiery Pincers)
            // =========================================================================
            const pincerAngle = Math.sin(time * 0.012) * 0.35;

            // Fiery Molten Aura
            ctx.shadowColor = '#ff3d00';
            ctx.shadowBlur = 14;

            // Spiky Rock Legs (Grounded at y = 0)
            ctx.strokeStyle = '#d84315';
            ctx.lineWidth = 2.5;
            [-12, -6, 6, 12].forEach(lx => {
                ctx.beginPath();
                ctx.moveTo(lx, -12);
                ctx.lineTo(lx > 0 ? lx + 5 : lx - 5, -1);
                ctx.stroke();
            });

            // Snapping Left Fiery Pincer
            ctx.save();
            ctx.translate(-13, -15);
            ctx.rotate(-0.4 + pincerAngle);
            ctx.fillStyle = '#ff3d00';
            ctx.beginPath();
            ctx.arc(-5, -2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffd600';
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.restore();

            // Snapping Right Fiery Pincer
            ctx.save();
            ctx.translate(13, -15);
            ctx.rotate(0.4 - pincerAngle);
            ctx.fillStyle = '#ff3d00';
            ctx.beginPath();
            ctx.arc(5, -2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffd600';
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.restore();

            // Heavy Basalt Core Shell
            const rockGrad = ctx.createRadialGradient(-3, -16, 2, 0, -12, 16);
            rockGrad.addColorStop(0, '#4e342e');
            rockGrad.addColorStop(0.7, '#1b0000');
            rockGrad.addColorStop(1, '#ff3d00');
            ctx.fillStyle = rockGrad;
            ctx.beginPath();
            ctx.roundRect(-14, -24, 28, 22, [8, 8, 10, 10]);
            ctx.fill();
            ctx.strokeStyle = '#ff6d00';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Glowing Molten Lava Vein Cracks
            ctx.strokeStyle = '#ffd600';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(-9, -16); ctx.lineTo(-2, -12); ctx.lineTo(7, -17);
            ctx.stroke();

            // Glowing Fiery Eyes
            ctx.fillStyle = '#ffd600';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset, -18, 3.5, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset, -18, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#b71c1c';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset, -18, 1.8, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset, -18, 1.8, 0, Math.PI * 2);
            ctx.fill();

        } else if (wType === 3) {
            // =========================================================================
            // 👻 WORLD 3: SPECTRAL SHADOW PHANTOM (High-Detail Ethereal Ghost & Orbiting Wisps)
            // =========================================================================
            const floatY = Math.sin(time * 0.007) * 5 - 6; // Smooth celestial hover
            ctx.translate(0, floatY);

            // Phase Alpha (Translucent during fade / teleport)
            ctx.globalAlpha = Math.max(0.2, this.phaseAlpha !== undefined ? this.phaseAlpha : 0.95);

            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 18;

            // 1. Orbiting Mini Will-o'-the-Wisps (Spirit Orbs)
            const wispAngle1 = time * 0.008;
            const wispAngle2 = time * 0.008 + Math.PI;
            const wispX1 = Math.cos(wispAngle1) * 22;
            const wispY1 = Math.sin(wispAngle1) * 9 - 14;
            const wispX2 = Math.cos(wispAngle2) * 19;
            const wispY2 = Math.sin(wispAngle2) * 8 - 14;

            // First Wisp (Cyan)
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(wispX1, wispY1, 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Second Wisp (Violet)
            ctx.fillStyle = '#e040fb';
            ctx.beginPath();
            ctx.arc(wispX2, wispY2, 2.6, 0, Math.PI * 2);
            ctx.fill();

            // 2. Flowing Cosmic Ghost Robe Body (Wavy Bezier Ribbons)
            const tailWave1 = Math.sin(time * 0.012) * 4.5;
            const tailWave2 = Math.cos(time * 0.014) * 3.5;

            const ghostGrad = ctx.createLinearGradient(0, -28, 0, 4);
            ghostGrad.addColorStop(0, '#7b1fa2');
            ghostGrad.addColorStop(0.4, '#ba68c8');
            ghostGrad.addColorStop(0.85, '#00e5ff');
            ghostGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

            ctx.fillStyle = ghostGrad;
            ctx.beginPath();
            ctx.moveTo(-14, -14);
            // Cute rounded head
            ctx.bezierCurveTo(-15, -30, 15, -30, 14, -14);
            // Left flowing tail
            ctx.lineTo(11, -2);
            ctx.quadraticCurveTo(6 + tailWave1, 4, 1 + tailWave2, -4);
            // Right flowing tail
            ctx.quadraticCurveTo(-6 - tailWave1, 4, -11, -2);
            ctx.closePath();
            ctx.fill();

            // Outer Soft Halo Rim
            ctx.strokeStyle = 'rgba(224, 64, 251, 0.65)';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Cute Little Ghost Hands / Wispy Arms
            const handWave = Math.sin(time * 0.01) * 2;
            ctx.fillStyle = '#ba68c8';
            ctx.beginPath();
            ctx.ellipse(-13, -11 + handWave, 4, 2.5, -0.4, 0, Math.PI * 2);
            ctx.ellipse(13, -11 - handWave, 4, 2.5, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Inner Glowing Luminous Heart Core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -14, 5, 0, Math.PI * 2);
            ctx.fill();

            // Rosy Pink Glowing Blush Cheeks
            ctx.fillStyle = 'rgba(255, 64, 129, 0.75)';
            ctx.beginPath();
            ctx.arc(-8 + eyeOffset, -12, 2.5, 0, Math.PI * 2);
            ctx.arc(8 + eyeOffset, -12, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Large Cute Glowing Cyan Star Eyes
            ctx.fillStyle = '#1a0933';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset, -17, 3.8, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset, -17, 3.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset, -17, 2.0, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset, -17, 2.0, 0, Math.PI * 2);
            ctx.fill();

            // Catchlight Sparkle in Eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-6 + eyeOffset, -18, 1.0, 0, Math.PI * 2);
            ctx.arc(4 + eyeOffset, -18, 1.0, 0, Math.PI * 2);
            ctx.fill();

            // Flickering Floating Amethyst Flame on Head
            const flamePulse = Math.sin(time * 0.015) * 1.5;
            ctx.fillStyle = '#e040fb';
            ctx.beginPath();
            ctx.moveTo(-3, -29);
            ctx.quadraticCurveTo(0, -35 + flamePulse, 3, -29);
            ctx.quadraticCurveTo(0, -26, -3, -29);
            ctx.fill();

        } else if (wType === 4) {
            // =========================================================================
            // 🤖 WORLD 4: CYBER DRONE BOT (High-Tech Sentry with Target Laser Beam)
            // =========================================================================
            const hoverCycle = Math.sin(time * 0.01) * 3 - 6; // Hovering 6px above floor
            ctx.translate(0, hoverCycle);

            ctx.shadowColor = '#00f5d4';
            ctx.shadowBlur = 16;

            const droneDir = this.vx > 0 ? 1 : -1;

            // 1. Plasma Laser Beam (Charging Sight or Full Blast - 220px Long Range)
            if (this.laserState === 'CHARGING') {
                // Thin Red/Amber Aiming Laser Sight (220px)
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 23, 68, 0.85)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(droneDir * 14, -14);
                ctx.lineTo(droneDir * 225, -14);
                ctx.stroke();
                // Target dot at end
                ctx.fillStyle = '#ff1744';
                ctx.beginPath();
                ctx.arc(droneDir * 225, -14, 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (this.laserState === 'FIRING') {
                // Powerful High-Tech Plasma Laser Beam (220px long, 12px thick with dual glow)
                ctx.save();
                ctx.shadowColor = '#00f5d4';
                ctx.shadowBlur = 24;

                // Outer Laser Aura
                const laserGrad = ctx.createLinearGradient(droneDir * 14, -14, droneDir * 235, -14);
                laserGrad.addColorStop(0, '#ff1744');
                laserGrad.addColorStop(0.5, '#00f5d4');
                laserGrad.addColorStop(1, 'rgba(0, 245, 212, 0)');

                ctx.fillStyle = laserGrad;
                ctx.fillRect(droneDir > 0 ? 14 : -235, -20, 221, 10);

                // Core White Energy Beam
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(droneDir > 0 ? 14 : -235, -17, 221, 4.5);

                // Muzzle Flash
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(droneDir * 14, -14, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
                // Idle Forward Scanning Pulse
                const radarAlpha = (Math.sin(time * 0.008) + 1) * 0.12 + 0.06;
                ctx.fillStyle = `rgba(0, 245, 212, ${radarAlpha})`;
                ctx.beginPath();
                ctx.moveTo(droneDir * 14, -14);
                ctx.lineTo(droneDir * 36, -24);
                ctx.lineTo(droneDir * 36, -4);
                ctx.closePath();
                ctx.fill();
            }

            // Blue Plasma Jet Thrust Flame
            const thrustH = 5 + Math.random() * 4;
            ctx.fillStyle = '#00f5d4';
            ctx.beginPath();
            ctx.moveTo(-5, -2);
            ctx.lineTo(0, -2 + thrustH);
            ctx.lineTo(5, -2);
            ctx.closePath();
            ctx.fill();

            // Titanium Sentry Chassis
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = (this.laserState === 'FIRING' || this.laserState === 'CHARGING') ? '#ff1744' : '#00f5d4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-14, -25, 28, 23, 5);
            ctx.fill();
            ctx.stroke();

            // Side Antennae / Stabilizers
            ctx.strokeStyle = '#00bbf9';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-14, -18); ctx.lineTo(-19, -24);
            ctx.moveTo(14, -18); ctx.lineTo(19, -24);
            ctx.stroke();

            // Laser Optical Sensor Visor
            ctx.fillStyle = '#000000';
            ctx.fillRect(-10, -19, 20, 9);

            // Scanning Red / Teal Laser Eye
            ctx.fillStyle = (this.laserState === 'FIRING') ? '#00f5d4' : '#ff1744';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 12;
            const scanX = (this.laserState === 'FIRING' || this.laserState === 'CHARGING') ? (droneDir * 5) : Math.sin(time * 0.01) * 6;
            ctx.fillRect(-2.5 + scanX, -18, 5, 7);

        } else {
            // =========================================================================
            // ⭐ WORLD 5: COSMIC SUPERNOVA STAR (Pulsar Shield & Starlight Gem)
            // =========================================================================
            const floatY = Math.sin(time * 0.007) * 5 - 8;
            ctx.translate(0, floatY);

            const rot = time * 0.003;
            const pulse = (Math.sin(time * 0.009) + 1) * 0.5;

            // 1. Pulsar Energy Forcefield Barrier (Active Shield)
            if (this.isStarShielded) {
                ctx.save();
                ctx.shadowColor = '#00f5ff';
                ctx.shadowBlur = 24;
                
                // Outer Hexagonal Rotating Forcefield
                const shieldAngle = time * 0.005;
                ctx.strokeStyle = 'rgba(0, 245, 255, 0.9)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                for (let h = 0; h < 6; h++) {
                    const ha = shieldAngle + h * (Math.PI / 3);
                    const hx = Math.cos(ha) * 26;
                    const hy = -15 + Math.sin(ha) * 26;
                    if (h === 0) ctx.moveTo(hx, hy);
                    else ctx.lineTo(hx, hy);
                }
                ctx.closePath();
                ctx.stroke();

                // Inner Protective Aura Fill
                const forceGrad = ctx.createRadialGradient(0, -15, 6, 0, -15, 26);
                forceGrad.addColorStop(0, 'rgba(0, 245, 255, 0.15)');
                forceGrad.addColorStop(0.7, 'rgba(255, 215, 0, 0.35)');
                forceGrad.addColorStop(1, 'rgba(0, 245, 255, 0.65)');
                ctx.fillStyle = forceGrad;
                ctx.fill();

                // Shield Spark Runes
                ctx.fillStyle = '#ffffff';
                for (let sr = 0; sr < 4; sr++) {
                    const sra = -shieldAngle * 1.5 + sr * (Math.PI / 2);
                    ctx.beginPath();
                    ctx.arc(Math.cos(sra) * 20, -15 + Math.sin(sra) * 20, 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            } else if (this.isStarWarning) {
                // Flashing Warning Halo Ring
                ctx.save();
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 18;
                ctx.strokeStyle = (Math.floor(time / 100) % 2 === 0) ? '#ffd700' : '#ff1744';
                ctx.lineWidth = 2.2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(0, -15, 24, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            ctx.shadowColor = this.isStarShielded ? '#00f5ff' : '#ffd700';
            ctx.shadowBlur = 20 + pulse * 12;

            // 2. Dual Celestial Orbiting Rings (3D Elliptical Rings)
            ctx.save();
            ctx.rotate(0.35);
            ctx.strokeStyle = this.isStarShielded ? 'rgba(0, 245, 255, 0.85)' : 'rgba(0, 229, 255, 0.75)';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.ellipse(0, -15, 26 + pulse * 4, 8, rot, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 64, 129, 0.75)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.ellipse(0, -15, 22 + pulse * 3, 6, -rot * 1.3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // 3. Solar Flare Comet Tails (3 Radiant Ribbons)
            const tWave1 = Math.sin(time * 0.014) * 5;
            const tWave2 = Math.cos(time * 0.016) * 5;
            ctx.fillStyle = this.isStarShielded ? 'rgba(0, 245, 255, 0.65)' : 'rgba(255, 215, 0, 0.6)';
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.quadraticCurveTo(-18 + tWave1, 2, -12, 10);
            ctx.quadraticCurveTo(-6, 2, -4, -8);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 64, 129, 0.6)';
            ctx.beginPath();
            ctx.moveTo(10, -10);
            ctx.quadraticCurveTo(18 + tWave2, 2, 12, 10);
            ctx.quadraticCurveTo(6, 2, 4, -8);
            ctx.fill();

            // 4. Multi-Layered 8-Pointed Star Core (Gold & Amber Radiant Star)
            const drawStarPoly = (cx, cy, spikes, outerRadius, innerRadius, fillStyle) => {
                let rotAngle = Math.PI / 2 * 3;
                let step = Math.PI / spikes;
                ctx.beginPath();
                ctx.moveTo(cx, cy - outerRadius);
                for (let i = 0; i < spikes; i++) {
                    let x = cx + Math.cos(rotAngle) * outerRadius;
                    let y = cy + Math.sin(rotAngle) * outerRadius;
                    ctx.lineTo(x, y);
                    rotAngle += step;
                    x = cx + Math.cos(rotAngle) * innerRadius;
                    y = cy + Math.sin(rotAngle) * innerRadius;
                    ctx.lineTo(x, y);
                    rotAngle += step;
                }
                ctx.lineTo(cx, cy - outerRadius);
                ctx.closePath();
                ctx.fillStyle = fillStyle;
                ctx.fill();
            };

            // Outer Radiant Star (8-point golden glow)
            drawStarPoly(0, -15, 8, 19 + pulse * 2, 9, this.isStarShielded ? '#00f5ff' : '#ff9100');
            // Inner Star (Gold)
            drawStarPoly(0, -15, 8, 16 + pulse * 1.5, 7.5, '#ffd700');
            // Core Star Gem (White Diamond)
            drawStarPoly(0, -15, 8, 9, 4.5, '#ffffff');

            // 5. Expressive Celestial Eyes with Diamond Star Pupils
            ctx.fillStyle = '#4a148c';
            ctx.beginPath();
            ctx.arc(-4.5 + eyeOffset, -15, 3.2, 0, Math.PI * 2);
            ctx.arc(4.5 + eyeOffset, -15, 3.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = this.isStarShielded ? '#00f5ff' : '#ffd700';
            ctx.beginPath();
            ctx.arc(-4.5 + eyeOffset, -15, 1.6, 0, Math.PI * 2);
            ctx.arc(4.5 + eyeOffset, -15, 1.6, 0, Math.PI * 2);
            ctx.fill();

            // Cute Sparkle on Forehead
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -23, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class BossEnemy {
    constructor(x, y, platformRef = null, bossType = 5) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 54;
        this.vx = 1.5;
        this.vy = 0;
        this.platformRef = platformRef;
        this.bossType = bossType || 5;
        this.hp = 5;
        this.maxHp = 5;
        this.isDead = false;
        this.isAwake = false;
        this.state = 'SLEEPING';
        this.stateTimer = 0;
        this.hurtTimer = 0;
        this.jumpCooldown = 180;
        this.groundY = y;
        this.rotation = 0;
        this.rotSpeed = 0;
        this.sleepZTimer = 0;
        this.attackPhase = 0;
        this.hoverY = y;
    }

    takeDamage(amount, particles, floatingTexts, triggerShake, collectibles = null, enemies = null) {
        if (this.hurtTimer > 0 || this.isDead || this.state === 'FALLING_DEAD' || !this.isAwake) return;
        this.hp -= amount;
        this.hurtTimer = 120;
        this.state = 'HURT';
        this.stateTimer = 45;
        audio.playBossDamage();
        if (triggerShake) triggerShake(8, 0.25);
        
        const bType = this.bossType || 5;
        const bLabel = (bType === 10) ? '🌋 GOLEM' : (bType === 15 ? '👻 PHANTOM' : (bType === 20 ? '🤖 MECHA' : (bType === 25 ? '🌌 TITAN' : '👑 KING')));
        if (floatingTexts) {
            floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 14, `${bLabel} HIT! (${Math.max(0, this.hp)}/${this.maxHp})`, '#ffd600', 20));
        }

        const particleColor = (bType === 10) ? '#ff3d00' : (bType === 15 ? '#00f0ff' : (bType === 20 ? '#00ffcc' : (bType === 25 ? '#ffd700' : '#ffd700')));
        for (let p = 0; p < 20; p++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                particleColor,
                Math.random() * 4 + 2,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                30
            ));
        }

        // 🚨 TÜM BOSSLAR (Ch 5, 10, 15, 20, 25): 3 CANA VE 1 CANA DÜŞTÜĞÜNDE 2 DÜŞMAN YARATIR!
        if (enemies && this.platformRef && (this.hp === 3 || this.hp === 1)) {
            const minionWorldType = (bType === 5) ? 1 : ((bType === 10) ? 2 : ((bType === 15) ? 3 : ((bType === 20) ? 4 : 5)));
            const minionText = (bType === 5) ? '🍄 2X SHROOMIE SPAWN!' :
                               (bType === 10) ? '🦀 2X MAGMA CRAB SPAWN!' :
                               (bType === 15) ? '👻 2X SPECTRAL PHANTOM SPAWN!' :
                               (bType === 20) ? '🤖 2X CYBER DRONE SPAWN!' : '⭐ 2X STAR GUARDIAN SPAWN!';
            
            if (floatingTexts) {
                floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 36, minionText, '#ff007f', 20, 65));
            }

            const pRef = this.platformRef;
            const spawnX1 = Math.max(pRef.x + 35, this.x - 120);
            const spawnX2 = Math.min(pRef.x + pRef.width - 65, this.x + this.width + 120);

            const m1 = new Enemy(spawnX1, pRef.y - 28, pRef.width - 70, pRef.id, minionWorldType);
            m1.platformRef = pRef;
            m1.localX = spawnX1 - pRef.x;
            m1.vx = -1.2;

            const m2 = new Enemy(spawnX2, pRef.y - 28, pRef.width - 70, pRef.id, minionWorldType);
            m2.platformRef = pRef;
            m2.localX = spawnX2 - pRef.x;
            m2.vx = 1.2;

            enemies.push(m1);
            enemies.push(m2);

            if (triggerShake) triggerShake(10, 0.28);
            if (particles) {
                for (let sp = 0; sp < 14; sp++) {
                    particles.push(new Particle(spawnX1 + 16, pRef.y - 14, '#ff007f', 3, (Math.random()-0.5)*6, -Math.random()*4, 25));
                    particles.push(new Particle(spawnX2 + 16, pRef.y - 14, '#ff007f', 3, (Math.random()-0.5)*6, -Math.random()*4, 25));
                }
            }
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            this.state = 'FALLING_DEAD';
            this.vy = -7.5;
            this.vx = (Math.random() - 0.5) * 4;
            this.rotSpeed = 0.12;

            if (floatingTexts) {
                floatingTexts.push(new FloatingText(this.x + this.width / 2, this.y - 30, '👑 BOSS DEFEATED! 🔑 KEY DROPPED!', '#76ff03', 22, 90));
            }
            
            if (collectibles) {
                collectibles.push({
                    type: 'star_key',
                    x: this.x + this.width / 2 - 13,
                    y: this.y - 15,
                    width: 26,
                    height: 26,
                    collected: false
                });
            }

            for (let p = 0; p < 45; p++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    p % 2 === 0 ? particleColor : '#ff007f',
                    Math.random() * 5 + 3,
                    (Math.random() - 0.5) * 9,
                    (Math.random() - 0.5) * 9,
                    50
                ));
            }
        }
    }

    update(platforms, player, particles, triggerShake) {
        if (this.state === 'FALLING_DEAD') {
            this.vy += 0.5;
            this.y += this.vy;
            this.x += this.vx;
            this.rotation += this.rotSpeed;
            return;
        }

        if (this.isDead) return;

        const bType = this.bossType || 5;

        if (this.state === 'SLEEPING') {
            const playerReached = this.platformRef 
                ? (player.x >= this.platformRef.x - 40) 
                : (player.x >= this.x - 360);

            if (playerReached) {
                this.state = 'AWAKENING';
                this.stateTimer = 55;
                this.isAwake = true;
                audio.playBossAwaken(bType);
                audio.playThematicBGM('boss'); // Switch to adrenaline Boss Battle OST!
                if (triggerShake) triggerShake(10, 0.48);
            }
            return;
        }

        if (this.state === 'AWAKENING') {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.state = 'PATROL';
            }
            return;
        }

        if (this.hurtTimer > 0) this.hurtTimer--;
        if (this.jumpCooldown > 0) this.jumpCooldown--;

        const baseGroundY = this.platformRef ? (this.platformRef.y - this.height) : this.groundY;

        if (bType === 15 && (this.state === 'PATROL' || this.state === 'HURT')) {
            const time = Date.now();
            this.y = baseGroundY - 24 + Math.sin(time * 0.005) * 14;
        }

        if (this.state === 'PATROL') {
            const moveSpeed = (this.hp === 1 ? 1.5 : 1.1);
            this.x += this.vx * moveSpeed;
            if (this.platformRef) {
                if (this.x <= this.platformRef.x + 10) {
                    this.x = this.platformRef.x + 10;
                    this.vx = Math.abs(this.vx);
                } else if (this.x + this.width >= this.platformRef.x + this.platformRef.width - 10) {
                    this.x = this.platformRef.x + this.platformRef.width - 10 - this.width;
                    this.vx = -Math.abs(this.vx);
                }
            }

            if (this.jumpCooldown <= 0) {
                this.attackPhase = (this.attackPhase + 1) % 2;

                if (bType === 10 && this.attackPhase === 1) {
                    this.state = 'MAGMA_CHARGE';
                    this.stateTimer = 40;
                    this.vx = (player.x > this.x ? 4.8 : -4.8);
                    audio.playBossAttack(10);
                } else if (bType === 15) {
                    this.state = 'PHANTOM_TELEPORT';
                    this.stateTimer = 30;
                    audio.playBossAttack(15);
                } else if (bType === 20) {
                    this.state = 'MECHA_HOVER';
                    this.stateTimer = 50;
                    this.vy = -17.5;
                    this.vx = (player.x > this.x ? 2.5 : -2.5);
                    audio.playBossAttack(20);
                } else if (bType === 25) {
                    this.state = 'COSMIC_LEAP';
                    this.stateTimer = 60;
                    this.vy = -18.0;
                    this.vx = (player.x > this.x ? 2.0 : -2.0);
                    audio.playBossAttack(25);
                } else {
                    this.state = 'PREPARE_JUMP';
                    this.stateTimer = 40;
                    audio.playBossAttack(5);
                }
            }
        } else if (this.state === 'MAGMA_CHARGE') {
            this.x += this.vx;
            this.stateTimer--;
            if (Math.random() > 0.3) {
                particles.push(new Particle(this.x + this.width / 2, this.y + this.height - 4, '#ff3d00', 3, -this.vx * 0.3, -Math.random() * 2, 18));
            }
            if (this.platformRef) {
                if (this.x <= this.platformRef.x + 10 || this.x + this.width >= this.platformRef.x + this.platformRef.width - 10) {
                    this.stateTimer = 0;
                }
            }
            if (this.stateTimer <= 0) {
                this.state = 'PREPARE_JUMP';
                this.stateTimer = 30;
            }
        } else if (this.state === 'PHANTOM_TELEPORT') {
            this.stateTimer--;
            for (let d = 0; d < 3; d++) {
                particles.push(new Particle(this.x + Math.random() * this.width, this.y + Math.random() * this.height, '#00f0ff', 2.5, (Math.random()-0.5)*3, (Math.random()-0.5)*3, 20));
            }
            if (this.stateTimer === 15) {
                if (this.platformRef) {
                    const targetX = player.x + (Math.random() > 0.5 ? 130 : -130);
                    this.x = Math.max(this.platformRef.x + 20, Math.min(this.platformRef.x + this.platformRef.width - 80, targetX));
                }
            }
            if (this.stateTimer <= 0) {
                this.state = 'JUMPING';
                this.vy = -10.0;
                this.vx = (player.x > this.x ? 3.5 : -3.5);
                audio.playBossJump();
            }
        } else if (this.state === 'MECHA_HOVER') {
            this.stateTimer--;
            this.vy += 0.4;
            this.y += this.vy;
            this.x += this.vx;
            particles.push(new Particle(this.x + 16, this.y + this.height, '#00ffcc', 3.5, (Math.random()-0.5)*2, 4, 15));
            particles.push(new Particle(this.x + this.width - 16, this.y + this.height, '#00ffcc', 3.5, (Math.random()-0.5)*2, 4, 15));
            
            if (this.y >= baseGroundY) {
                this.y = baseGroundY;
                this.vy = 0;
                this.state = 'PATROL';
                this.jumpCooldown = 150;
                this.vx = (this.vx > 0 ? 1.4 : -1.4);
                audio.playBossLand(20);
                if (triggerShake) triggerShake(10, 0.38);
                for (let d = 0; d < 22; d++) {
                    particles.push(new Particle(this.x + this.width / 2, this.y + this.height, '#00ffcc', 3, (Math.random()-0.5)*9, -Math.random()*4, 25));
                }
            }
        } else if (this.state === 'COSMIC_LEAP') {
            this.vy += 0.42;
            this.y += this.vy;
            this.x += this.vx;
            particles.push(new Particle(this.x + Math.random() * this.width, this.y + Math.random() * this.height, '#ffd700', 3.0, (Math.random()-0.5)*3, 1, 20));

            if (this.y >= baseGroundY) {
                this.y = baseGroundY;
                this.vy = 0;
                this.state = 'PATROL';
                this.jumpCooldown = 160;
                this.vx = (this.vx > 0 ? 1.3 : -1.3);
                audio.playBossLand(25);
                if (triggerShake) triggerShake(12, 0.44);
                // 🌌 Supernova Radial Starlight Flare Burst!
                for (let d = 0; d < 24; d++) {
                    const ang = (d / 24) * Math.PI * 2;
                    const pCol = (d % 2 === 0) ? '#ffd700' : '#00e5ff';
                    particles.push(new Particle(this.x + this.width / 2, this.y + this.height - 4, pCol, 4, Math.cos(ang) * 6, Math.sin(ang) * 3 - 2, 30));
                }
            }
        } else if (this.state === 'PREPARE_JUMP') {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.state = 'JUMPING';
                this.vy = (bType === 10 ? -14.5 : -16.5);
                this.vx = (player.x > this.x ? 2.5 : -2.5);
                audio.playBossJump();
            }
        } else if (this.state === 'JUMPING') {
            this.vy += 0.8;
            this.y += this.vy;
            this.x += this.vx;

            if (this.y >= baseGroundY) {
                this.y = baseGroundY;
                this.vy = 0;
                this.state = 'PATROL';
                this.jumpCooldown = 160;
                this.vx = (this.vx > 0 ? 1.4 : -1.4);
                audio.playBossLand(bType);
                if (triggerShake) triggerShake(bType === 10 ? 10 : 8, 0.35);

                // 🍄 King Slime Royal Spore Burst Shockwave!
                if (bType === 5 && particles) {
                    for (let sp = 0; sp < 18; sp++) {
                        const ang = (sp / 18) * Math.PI * 2;
                        const sporeCol = (sp % 3 === 0) ? '#ff4081' : (sp % 3 === 1 ? '#ffd600' : '#e040fb');
                        particles.push(new Particle(this.x + this.width / 2, this.y + this.height - 4, sporeCol, 4, Math.cos(ang) * 5.5, Math.sin(ang) * 3 - 2, 28));
                    }
                } else {
                    for (let d = 0; d < 16; d++) {
                        particles.push(new Particle(this.x + (d % 2 === 0 ? 0 : this.width), this.y + this.height, '#ffd700', 3, (Math.random()-0.5)*6, -Math.random()*3.5, 20));
                    }
                }
            }
        } else if (this.state === 'HURT') {
            this.stateTimer--;
            if (this.stateTimer <= 0) {
                this.state = 'PATROL';
            }
        }
    }

    draw(ctx, camera) {
        if (this.y > 1500) return;
        ctx.save();
        const bx = this.x - camera.x + this.width / 2;
        const by = this.y - camera.y + this.height / 2;

        ctx.translate(bx, by);

        if (this.rotation) {
            ctx.rotate(this.rotation);
        }

        const time = Date.now();

        if (this.state === 'FALLING_DEAD') {
            ctx.filter = 'grayscale(60%) opacity(85%)';
            ctx.scale(0.9, 0.9);
        } else if (this.state === 'SLEEPING') {
            const sleepBreathe = Math.sin(time * 0.003) * 0.04;
            ctx.scale(1 + sleepBreathe, 1 - sleepBreathe);
        } else if (this.state === 'AWAKENING') {
            const awakenPulse = Math.sin(time * 0.02) * 0.12;
            ctx.scale(1 + awakenPulse, 1 + awakenPulse);
        } else if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 4) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        let scaleX = 1, scaleY = 1;
        if (this.state === 'PREPARE_JUMP') {
            scaleX = 1.35; scaleY = 0.65;
        } else if (this.state === 'JUMPING' || this.state === 'MECHA_HOVER' || this.state === 'COSMIC_LEAP') {
            scaleX = 0.85; scaleY = 1.25;
        } else if (this.state === 'MAGMA_CHARGE') {
            scaleX = 1.2; scaleY = 0.85;
        }
        ctx.scale(scaleX, scaleY);

        const bType = this.bossType || 5;

        if (bType === 10) {
            // =========================================================================
            // 🌋 BOSS 2: MAGMA GOLEM (Volcanic Basalt Armor, Molten Veins & Flame Horns)
            // =========================================================================
            ctx.shadowColor = '#ff3d00';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 42 : (this.hp <= 2 ? 34 : 24);

            // 1. Molten Caldera Body (Radial Magma Gradient)
            const magmaGrad = ctx.createRadialGradient(-8, -10, 4, 0, 0, 38);
            if (this.hp <= 2) {
                magmaGrad.addColorStop(0, '#ffff55');
                magmaGrad.addColorStop(0.3, '#ff3d00');
                magmaGrad.addColorStop(0.7, '#d50000');
                magmaGrad.addColorStop(1, '#3e0000');
            } else {
                magmaGrad.addColorStop(0, '#ffe57f');
                magmaGrad.addColorStop(0.35, '#ff5722');
                magmaGrad.addColorStop(0.75, '#b71c1c');
                magmaGrad.addColorStop(1, '#1b0000');
            }

            ctx.fillStyle = magmaGrad;
            ctx.beginPath();
            ctx.moveTo(-22, -26);
            ctx.lineTo(22, -26);
            ctx.lineTo(36, -4);
            ctx.lineTo(32, 26);
            ctx.lineTo(-32, 26);
            ctx.lineTo(-36, -4);
            ctx.closePath();
            ctx.fill();

            // 2. Heavy Basalt Shoulder & Hip Plates
            ctx.fillStyle = '#1c1917';
            ctx.strokeStyle = '#ff5722';
            ctx.lineWidth = 1.8;
            // Left Shoulder Plate
            ctx.beginPath();
            ctx.moveTo(-36, -4); ctx.lineTo(-24, -22); ctx.lineTo(-14, -6); ctx.closePath();
            ctx.fill(); ctx.stroke();
            // Right Shoulder Plate
            ctx.beginPath();
            ctx.moveTo(36, -4); ctx.lineTo(24, -22); ctx.lineTo(14, -6); ctx.closePath();
            ctx.fill(); ctx.stroke();

            // 3. Glowing Molten Chest Core / Hearth
            const pulse = (Math.sin(time * 0.008) + 1) * 0.5;
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 14 + pulse * 8;
            ctx.beginPath();
            ctx.arc(0, 8, 8 + pulse * 2, 0, Math.PI * 2);
            ctx.fill();

            // 4. Magma Lava Vein Cracks
            ctx.strokeStyle = `rgba(255, 214, 0, ${0.8 + pulse * 0.2})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(-20, -10); ctx.lineTo(-10, -4); ctx.lineTo(-14, 12); ctx.lineTo(-4, 18);
            ctx.moveTo(18, -12); ctx.lineTo(8, 0); ctx.lineTo(14, 14); ctx.lineTo(4, 18);
            ctx.moveTo(-2, -18); ctx.lineTo(0, -6); ctx.lineTo(-4, 4);
            ctx.stroke();

            // 5. Flaming Obsidian Horns
            ctx.fillStyle = '#0c0a09';
            ctx.beginPath();
            ctx.moveTo(-20, -26); ctx.lineTo(-16, -48); ctx.lineTo(-8, -28);
            ctx.lineTo(0, -52);
            ctx.lineTo(8, -28); ctx.lineTo(16, -48); ctx.lineTo(20, -26);
            ctx.closePath();
            ctx.fill();

            // Fire Tips on Horns
            ctx.fillStyle = '#ff9100';
            ctx.beginPath();
            ctx.arc(0, -48, 4.5, 0, Math.PI * 2);
            ctx.arc(-16, -44, 3.5, 0, Math.PI * 2);
            ctx.arc(16, -44, 3.5, 0, Math.PI * 2);
            ctx.fill();

        } else if (bType === 15) {
            // =========================================================================
            // 👻 BOSS 3: SHADOW PHANTOM (Ethereal Void Cloak, Spectral Wisps & Ghost Hands)
            // =========================================================================
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 44 : (this.hp <= 2 ? 36 : 28);

            // 1. Cosmic Violet / Cyan Spectral Gradient Body
            const voidGrad = ctx.createRadialGradient(-6, -8, 4, 0, 0, 38);
            if (this.hp <= 2) {
                voidGrad.addColorStop(0, '#ff4081');
                voidGrad.addColorStop(0.45, '#7c4dff');
                voidGrad.addColorStop(0.85, '#1a0033');
                voidGrad.addColorStop(1, '#000010');
            } else {
                voidGrad.addColorStop(0, '#00f0ff');
                voidGrad.addColorStop(0.35, '#3d5afe');
                voidGrad.addColorStop(0.75, '#12005e');
                voidGrad.addColorStop(1, '#050a18');
            }

            const wispWobble = Math.sin(time * 0.008) * 5;
            ctx.fillStyle = voidGrad;
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.bezierCurveTo(32, -30, 38, 4, 30, 20);
            ctx.bezierCurveTo(20, 30, 10, 36 + wispWobble, 0, 40 + wispWobble);
            ctx.bezierCurveTo(-10, 36 + wispWobble, -20, 30, -30, 20);
            ctx.bezierCurveTo(-38, 4, -32, -30, 0, -30);
            ctx.closePath();
            ctx.fill();

            // 2. Detached Floating Phantom Hands with Energy Orbs
            const handFloat = Math.sin(time * 0.006) * 4;
            // Left Hand
            ctx.fillStyle = '#304ffe';
            ctx.beginPath(); ctx.arc(-36, 4 + handFloat, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath(); ctx.arc(-36, 4 + handFloat, 3.5, 0, Math.PI * 2); ctx.fill();
            // Right Hand
            ctx.fillStyle = '#304ffe';
            ctx.beginPath(); ctx.arc(36, 4 - handFloat, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath(); ctx.arc(36, 4 - handFloat, 3.5, 0, Math.PI * 2); ctx.fill();

            // 3. Ethereal Astral Horns / Cowl
            ctx.fillStyle = '#1a0033';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(-18, -28); ctx.quadraticCurveTo(-28, -54, -12, -48); ctx.lineTo(-6, -30);
            ctx.moveTo(18, -28); ctx.quadraticCurveTo(28, -54, 12, -48); ctx.lineTo(6, -30);
            ctx.fill();
            ctx.stroke();

        } else if (bType === 20) {
            // =========================================================================
            // 🤖 BOSS 4: CYBER MECHA SLIME (Titanium Shell, Hologram HUD & Rocket Boosters)
            // =========================================================================
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 44 : (this.hp <= 2 ? 36 : 28);

            const mechGrad = ctx.createLinearGradient(-32, -30, 32, 28);
            if (this.hp <= 2) {
                mechGrad.addColorStop(0, '#ff5252');
                mechGrad.addColorStop(0.5, '#d32f2f');
                mechGrad.addColorStop(1, '#263238');
            } else {
                mechGrad.addColorStop(0, '#80deea');
                mechGrad.addColorStop(0.35, '#00b4d8');
                mechGrad.addColorStop(0.75, '#0077b6');
                mechGrad.addColorStop(1, '#02182b');
            }

            // 1. Titanium Faceted Cyber Chassis
            ctx.fillStyle = mechGrad;
            ctx.beginPath();
            ctx.moveTo(-20, -28);
            ctx.lineTo(20, -28);
            ctx.lineTo(34, -12);
            ctx.lineTo(34, 18);
            ctx.lineTo(22, 28);
            ctx.lineTo(-22, 28);
            ctx.lineTo(-34, 18);
            ctx.lineTo(-34, -12);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#80deea';
            ctx.lineWidth = 2.2;
            ctx.stroke();

            // 2. High-Tech Rivets
            ctx.fillStyle = '#cfd8dc';
            [[-18, -22], [18, -22], [-28, 16], [28, 16]].forEach(([rx, ry]) => {
                ctx.beginPath(); ctx.arc(rx, ry, 2.2, 0, Math.PI * 2); ctx.fill();
            });

            // 3. Rocket Thruster Nozzles at Base
            ctx.fillStyle = '#37474f';
            ctx.fillRect(-24, 26, 12, 8);
            ctx.fillRect(12, 26, 12, 8);
            // Plasma Thrust Flame
            ctx.fillStyle = (this.state === 'MECHA_HOVER') ? '#ff1744' : '#00ffcc';
            ctx.beginPath();
            ctx.moveTo(-22, 34); ctx.lineTo(-18, 42); ctx.lineTo(-14, 34);
            ctx.moveTo(14, 34); ctx.lineTo(18, 42); ctx.lineTo(22, 34);
            ctx.fill();

            // 4. Dual Cyber Communication Antennas
            ctx.strokeStyle = '#78909c';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(-14, -28); ctx.lineTo(-18, -46);
            ctx.moveTo(14, -28); ctx.lineTo(18, -46);
            ctx.stroke();
            const isStrobe = Math.floor(time / 180) % 2 === 0;
            ctx.fillStyle = isStrobe ? '#00ffcc' : '#ff1744';
            ctx.beginPath();
            ctx.arc(-18, -46, 5, 0, Math.PI * 2);
            ctx.arc(18, -46, 5, 0, Math.PI * 2);
            ctx.fill();

        } else if (bType === 25) {
            // =========================================================================
            // 🌌 BOSS 5: COSMIC TITAN (Celestial Starfield Core, Orbit Rings & Supernova Halo)
            // =========================================================================
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 48 : (this.hp <= 2 ? 40 : 32);

            const titanGrad = ctx.createRadialGradient(0, -6, 2, 0, 0, 38);
            if (this.hp <= 2) {
                titanGrad.addColorStop(0, '#ff80ab');
                titanGrad.addColorStop(0.45, '#e040fb');
                titanGrad.addColorStop(0.8, '#4a148c');
                titanGrad.addColorStop(1, '#050014');
            } else {
                titanGrad.addColorStop(0, '#fff59d');
                titanGrad.addColorStop(0.3, '#ffd700');
                titanGrad.addColorStop(0.65, '#7b1fa2');
                titanGrad.addColorStop(1, '#09001f');
            }

            // 1. Celestial Star Sapphire Body
            ctx.fillStyle = titanGrad;
            ctx.beginPath();
            ctx.moveTo(0, -34);
            ctx.lineTo(36, -6);
            ctx.lineTo(26, 28);
            ctx.lineTo(-26, 28);
            ctx.lineTo(-36, -6);
            ctx.closePath();
            ctx.fill();

            // 2. Swirling Inner Starfield Constellations
            ctx.fillStyle = '#ffffff';
            for (let st = 0; st < 6; st++) {
                const sta = (time * 0.002) + st * (Math.PI / 3);
                const str = 10 + (st % 3) * 6;
                ctx.beginPath();
                ctx.arc(Math.cos(sta) * str, -6 + Math.sin(sta) * str * 0.6, 1.6, 0, Math.PI * 2);
                ctx.fill();
            }

            // 3. Orbiting Golden Celestial Shards
            const shardRot = time * 0.0035;
            ctx.fillStyle = '#ffd700';
            for (let s = 0; s < 4; s++) {
                const sAngle = shardRot + (s * (Math.PI * 2 / 4));
                const sx = Math.cos(sAngle) * 40;
                const sy = Math.sin(sAngle) * 16;
                ctx.beginPath();
                ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // 4. Glowing Supernova Halo
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.ellipse(0, -42, 26, 9, 0, 0, Math.PI * 2);
            ctx.stroke();

        } else {
            // =========================================================================
            // 👑 BOSS 1: KING SLIME (3D Jelly Body, Specular Highlights & Gemmed Crown)
            // =========================================================================
            ctx.shadowColor = this.hp <= 2 ? '#ff1744' : '#ffd600';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 40 : (this.hp <= 2 ? 32 : 24);

            const bossGrad = ctx.createRadialGradient(-8, -10, 4, 0, 0, 38);
            if (this.hp <= 2) {
                bossGrad.addColorStop(0, '#ff8a80');
                bossGrad.addColorStop(0.4, '#ff1744');
                bossGrad.addColorStop(0.8, '#b71c1c');
                bossGrad.addColorStop(1, '#3e0000');
            } else {
                bossGrad.addColorStop(0, '#f48fb1');
                bossGrad.addColorStop(0.35, '#ab47bc');
                bossGrad.addColorStop(0.75, '#6a1b9a');
                bossGrad.addColorStop(1, '#240046');
            }

            // 1. Royal Jelly Dome
            ctx.fillStyle = bossGrad;
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.bezierCurveTo(36, -30, 39, 12, 36, 26);
            ctx.bezierCurveTo(26, 32, -26, 32, -36, 26);
            ctx.bezierCurveTo(-39, 12, -36, -30, 0, -30);
            ctx.closePath();
            ctx.fill();

            // 2. Glossy Specular Glass Highlights
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.beginPath();
            ctx.ellipse(-14, -16, 12, 5, -0.4, 0, Math.PI * 2);
            ctx.fill();

            // 3. Cute Rosy Cheeks
            ctx.fillStyle = 'rgba(255, 64, 129, 0.4)';
            ctx.beginPath();
            ctx.ellipse(-20, 8, 6, 3.5, 0, 0, Math.PI * 2);
            ctx.ellipse(20, 8, 6, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 4. Deluxe Golden Royal Crown with Rubies & Sapphires
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 18;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(-20, -28); ctx.lineTo(-22, -48); ctx.lineTo(-12, -34);
            ctx.lineTo(0, -52);
            ctx.lineTo(12, -34); ctx.lineTo(22, -48); ctx.lineTo(20, -28);
            ctx.closePath();
            ctx.fill();
            // Crown Gems
            ctx.fillStyle = '#ff1744';
            ctx.beginPath(); ctx.arc(0, -35, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#00e5ff';
            ctx.beginPath(); ctx.arc(-12, -33, 3, 0, Math.PI * 2); ctx.arc(12, -33, 3, 0, Math.PI * 2); ctx.fill();
        }

        // =========================================================================
        // 👁️ BOSS FACIAL EXPRESSIONS, EYE TRACKING & VISORS
        // =========================================================================
        if (this.state === 'SLEEPING') {
            ctx.save();
            const zCycle = (time * 0.0015) % 1;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px sans-serif';
            ctx.globalAlpha = 1 - zCycle;
            ctx.fillText('z', 12 + zCycle * 10, -38 - zCycle * 20);
            ctx.font = 'bold 19px sans-serif';
            ctx.fillText('Z', 18 + zCycle * 14, -50 - zCycle * 25);
            ctx.restore();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(-10, -2, 6, 0.2, Math.PI - 0.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(10, -2, 6, 0.2, Math.PI - 0.2);
            ctx.stroke();
        } else if (this.state === 'FALLING_DEAD') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3.2;
            [-8, 8].forEach(ex => {
                ctx.beginPath();
                ctx.moveTo(ex - 4, -4); ctx.lineTo(ex + 4, 4);
                ctx.moveTo(ex + 4, -4); ctx.lineTo(ex - 4, 4);
                ctx.stroke();
            });
        } else if (bType === 20) {
            // Cyber Mecha Oscilloscope Visor
            ctx.save();
            ctx.fillStyle = '#0a192f';
            ctx.fillRect(-22, -8, 44, 12);
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 1.6;
            ctx.strokeRect(-22, -8, 44, 12);

            const scanX = Math.sin(time * 0.008) * 14;
            ctx.fillStyle = '#00ffcc';
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 12;
            ctx.fillRect(scanX - 5, -7, 10, 10);
            ctx.restore();
        } else {
            // Expressive Animated Boss Eyes with Shiny Highlights
            const eyeX = this.vx > 0 ? 4 : -4;
            ctx.fillStyle = (bType === 10) ? '#ffeb3b' : (bType === 15 ? '#00f0ff' : '#ffffff');
            ctx.beginPath();
            ctx.arc(-10 + eyeX, -2, 8, 0, Math.PI * 2);
            ctx.arc(10 + eyeX, -2, 8, 0, Math.PI * 2);
            ctx.fill();

            const pupilColor = (bType === 10) ? '#b71c1c' : (bType === 15 ? '#001040' : (bType === 25 ? '#ffd700' : (this.hp <= 2 ? '#b71c1c' : '#1a237e')));
            ctx.fillStyle = pupilColor;
            ctx.beginPath();
            ctx.arc(-8 + eyeX * 1.4, -2, 4.5, 0, Math.PI * 2);
            ctx.arc(12 + eyeX * 1.4, -2, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-10 + eyeX * 1.4, -4, 2.2, 0, Math.PI * 2);
            ctx.arc(10 + eyeX * 1.4, -4, 2.2, 0, Math.PI * 2);
            ctx.fill();

            if (bType === 25) {
                // Cosmic Titan Radiant Third Eye
                const thirdEyePulse = (Math.sin(time * 0.009) + 1) * 0.5;
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 12 + thirdEyePulse * 8;
                ctx.beginPath();
                ctx.arc(0, -13, 4.5 + thirdEyePulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, -13, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}
