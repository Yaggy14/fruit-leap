// Player & Entities Physics Engine with Matched Callback Signatures & Strict Collision Handling

const CHARACTER_SKINS = [
    { id: 'bunny', name: 'Fluffy Bunny', icon: '🐰', bodyColor: '#ffffff', earColor: '#ff80ab', priceStars: 0, baseSpeed: 3.2, speed: '3.2', perk: 'Double Jump' },
    { id: 'kitty', name: 'Cute Kitty', icon: '🐱', bodyColor: '#ffa726', earColor: '#ffb300', priceStars: 35, baseSpeed: 3.5, speed: '3.5', perk: 'Agile Steps' },
    { id: 'bear', name: 'Teddy Bear', icon: '🐻', bodyColor: '#8d6e63', earColor: '#5d4037', priceStars: 75, baseSpeed: 3.8, speed: '3.8', perk: 'High Power' },
    { id: 'fox', name: 'Foxy Hero', icon: '🦊', bodyColor: '#ff5722', earColor: '#d84315', priceStars: 120, baseSpeed: 4.0, speed: '4.0', perk: 'Super Sprint' },
    { id: 'panda', name: 'Panda Pal', icon: '🐼', bodyColor: '#ffffff', earColor: '#212121', priceStars: 165, baseSpeed: 4.2, speed: '4.2', perk: 'High Leap' },
    { id: 'unicorn', name: 'Magic Unicorn', icon: '🦄', bodyColor: '#f5f3ff', earColor: '#ea80fc', priceStars: 210, baseSpeed: 4.5, speed: '4.5', perk: 'Star Glide' }
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
        this.jumpForce = -14.2;
        this.gravity = 0.98;

        this.grounded = false;
        this.canDoubleJump = true;
        this.isCrouching = false;
        this.facing = 'right';
        this.invincibleTimer = 0;
        this.teleportCooldown = 0;
        this.currentSkinId = 'bunny';
        this.hasGoldenKey = false;
        this.isDead = false;
        this.deathTimer = 0;

        // Power-ups
        this.hasBubbleShield = false;
        this.hasMagnet = false;
        this.hasSpeedBoost = false;
        this.lastSafeX = x;
        this.lastSafeY = y;
        this.lastSafeX = x;
        this.lastSafeY = y;
    }

    get speed() {
        const skin = CHARACTER_SKINS.find(s => s.id === this.currentSkinId) || CHARACTER_SKINS[0];
        const base = skin.baseSpeed || 3.2;
        return this.hasSpeedBoost ? base * 1.45 : base;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.canDoubleJump = true;
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
        this.lastSafeX = x;
        this.lastSafeY = y;
        this.lastSafeX = x;
        this.lastSafeY = y;
    }

    triggerDeath(cause, onDie, particles, floatingTexts = null, triggerShake = null) {
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
            audio.playHurt();
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

    jump(particles) {
        if (this.isDead || this.isEnteringDoor || this.isCrouching) return;
        if (this.grounded) {
            this.vy = this.jumpForce;
            this.grounded = false;
            this.canDoubleJump = true;
            audio.playJump();
            this.createDust(particles, 6, '#ffb74d');
        } else if (this.canDoubleJump) {
            this.vy = this.jumpForce * 0.92;
            this.canDoubleJump = false;
            audio.playJump();
            this.createDust(particles, 8, '#81d4fa');
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
            targetVx *= 0.45;
        }

        this.vx = targetVx;
        this.x += this.vx;

        if (this.hasSpeedBoost && Math.abs(this.vx) > 1 && Math.random() < 0.35) {
            const colors = ['#00e5ff', '#e040fb', '#ffd600'];
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

        for (let p of platforms) {
            if (this.checkCollision(this, p)) {
                if (this.vx > 0) this.x = p.x - this.width;
                else if (this.vx < 0) this.x = p.x + p.width;
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

        // Smooth, realistic gravity with apex hangtime & gradual acceleration
        let appliedGravity = this.gravity;
        if (Math.abs(this.vy) < 2.8 && !this.grounded) {
            // Apex floatiness - gentle hangtime at the peak of the jump
            appliedGravity = this.gravity * 0.60;
        } else if (this.vy > 0) {
            // Gradual fall acceleration - starts gentle and smoothly accelerates
            const fallProgress = Math.min(1.0, this.vy / 8.0);
            appliedGravity = this.gravity * (0.85 + fallProgress * 0.35);
        }
        
        this.vy += appliedGravity;
        if (this.vy > 13.5) this.vy = 13.5; // Smooth terminal velocity (no sudden slamming)
        this.y += this.vy;

        this.grounded = false;

        for (let p of platforms) {
            if (this.checkCollision(this, p)) {
                if (this.vy > 0) {
                    this.y = p.y - this.height;
                    this.vy = 0;
                    this.grounded = true;
                    this.canDoubleJump = true;
                    if (!p.vx) {
                        this.lastSafeX = this.x;
                        this.lastSafeY = this.y;
                    }
                    if (p.vx) this.x += p.vx;
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
                } else if (this.vy > 0) {
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
                    audio.playJump();
                    if (triggerShake) triggerShake(3, 0.1);
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
            if (this.checkCollision(this, enemy)) {
                if (this.vy > 0 && (this.y + this.height - this.vy) <= (enemy.y + 14)) {
                    enemy.isDead = true;
                    this.y = enemy.y - this.height;
                    this.vy = -12.5;
                    audio.playJump();
                    if (triggerShake) triggerShake(4, 0.12);
                    if (floatingTexts) {
                        floatingTexts.push(new FloatingText(enemy.x + 13, enemy.y - 14, 'STOMP! 👾 +300', '#ff4081', 30));
                    }
                    for (let p = 0; p < 12; p++) {
                        particles.push(new Particle(enemy.x + 13, enemy.y + 12, '#e040fb', 3.5, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 20));
                    }
                } else if (this.invincibleTimer <= 0) {
                    this.triggerDeath('enemy', onDie, particles, floatingTexts, triggerShake);
                    return;
                }
            }
        }

        if (boss && !boss.isDead && boss.state !== 'FALLING_DEAD' && boss.state !== 'DYING') {
            if (this.checkCollision(this, boss)) {
                if (this.vy > 0 && (this.y + this.height - this.vy) <= (boss.y + 24)) {
                    boss.takeDamage(1, particles, floatingTexts, triggerShake, collectibles);
                    this.y = boss.y - this.height;
                    this.vy = -14.0;
                    audio.playJump();
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
            if (this.checkCollision(this, hazard)) {
                this.triggerDeath('hazard', onDie, particles, floatingTexts, triggerShake);
                return;
            }
        }

        if (this.hasMagnet) {
            const playerCenterX = this.x + this.width / 2;
            const playerCenterY = this.y + this.height / 2;
            for (let item of collectibles) {
                if (!item.collected && (item.type !== 'exit' && item.type !== 'exit_door')) {
                    const dx = playerCenterX - (item.x + 12);
                    const dy = playerCenterY - (item.y + 12);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 220) {
                        item.x += (dx / dist) * 7.5;
                        item.y += (dy / dist) * 7.5;
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
                        audio.playWin();
                        if (triggerShake) triggerShake(4, 0.2);
                        if (floatingTexts) {
                            floatingTexts.push(new FloatingText(item.x + 12, item.y - 20, 'LEVEL CLEAR! ✨', '#76ff03', 20));
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
                    audio.playCoin();
                    if (floatingTexts) {
                        floatingTexts.push(new FloatingText(item.x + 12, item.y - 14, '+100', '#ffd600', 28));
                    }
                    if (onCollectFruit) onCollectFruit(item);
                }

                if (item.collected) {
                    for (let p = 0; p < 8; p++) {
                        particles.push(new Particle(item.x + 12, item.y + 12, '#ffd600', 3, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 20));
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
        if (!this.grounded) {
            if (this.vy < 0) { scaleX = 0.88; scaleY = 1.12; }
            else { scaleX = 1.10; scaleY = 0.90; }
        } else if (Math.abs(this.vx) > 0.5) {
            scaleX = 1 + Math.sin(Date.now() * 0.02) * 0.06;
            scaleY = 1 - Math.sin(Date.now() * 0.02) * 0.06;
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
    constructor(x, y, range, platformRef) {
        this.x = x;
        this.y = y;
        this.width = 26;
        this.height = 24;
        this.vx = 0.6;
        this.isDead = false;
        this.platformRef = platformRef;
        if (platformRef) {
            this.localX = Math.max(4, Math.min(x - platformRef.x, platformRef.width - this.width - 4));
        } else {
            this.localX = 0;
            this.startX = x;
        }
    }

    update(platforms) {
        if (this.isDead) return;
        if (this.platformRef) {
            this.localX += this.vx;
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
            this.y = this.platformRef.y - this.height;
        } else {
            this.x += this.vx;
            if (Math.abs(this.x - this.startX) > 100) this.vx *= -1;
        }
    }

    draw(ctx, camera, themeSlime = null) {
        if (this.isDead) return;
        ctx.save();
        const ex = this.x - camera.x;
        const ey = this.y - camera.y;
        
        ctx.translate(ex + 13, ey + 12);

        const squish = Math.sin(Date.now() * 0.008) * 1.5;
        const scaleX = 1 + squish * 0.05;
        const scaleY = 1 - squish * 0.05;
        ctx.scale(scaleX, scaleY);

        const sColor = themeSlime || { start: "#ff007f", mid: "#e040fb", end: "#7c4dff", glow: "#ff007f", horn: "#76ff03" };

        ctx.shadowColor = sColor.glow || '#d500f9';
        ctx.shadowBlur = 16;

        const slimeGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, 14);
        slimeGrad.addColorStop(0, sColor.start || '#ff4081');
        slimeGrad.addColorStop(0.5, sColor.mid || '#e040fb');
        slimeGrad.addColorStop(1, sColor.end || '#651fff');

        ctx.fillStyle = slimeGrad;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.bezierCurveTo(14, -14, 15, 6, 14, 11);
        ctx.bezierCurveTo(10, 14, -10, 14, -14, 11);
        ctx.bezierCurveTo(-15, 6, -14, -14, 0, -14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = sColor.horn || '#76ff03';
        ctx.beginPath();
        ctx.arc(0, -14, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(-5, -6, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        const eyeOffset = this.vx > 0 ? 2 : -2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a237e';
        ctx.beginPath();
        ctx.arc(-4 + eyeOffset * 1.3, -2, 2.2, 0, Math.PI * 2);
        ctx.arc(6 + eyeOffset * 1.3, -2, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5 + eyeOffset * 1.3, -3, 0.8, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffset * 1.3, -3, 0.8, 0, Math.PI * 2);
        ctx.fill();

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

    takeDamage(amount, particles, floatingTexts, triggerShake, collectibles = null) {
        if (this.hurtTimer > 0 || this.isDead || this.state === 'FALLING_DEAD' || !this.isAwake) return;
        this.hp -= amount;
        this.hurtTimer = 120;
        this.state = 'HURT';
        this.stateTimer = 45;
        audio.playBossHit();
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
                audio.playBossRoar();
                if (triggerShake) triggerShake(7, 0.4);
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
                    audio.playBossRoar();
                } else if (bType === 15) {
                    this.state = 'PHANTOM_TELEPORT';
                    this.stateTimer = 30;
                } else if (bType === 20) {
                    this.state = 'MECHA_HOVER';
                    this.stateTimer = 50;
                    this.vy = -17.5;
                    this.vx = (player.x > this.x ? 2.5 : -2.5);
                    audio.playBossJump();
                } else if (bType === 25) {
                    this.state = 'COSMIC_LEAP';
                    this.stateTimer = 60;
                    this.vy = -18.0;
                    this.vx = (player.x > this.x ? 2.0 : -2.0);
                    audio.playBossJump();
                } else {
                    this.state = 'PREPARE_JUMP';
                    this.stateTimer = 40;
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
                audio.playBossHit();
                if (triggerShake) triggerShake(8, 0.3);
                for (let d = 0; d < 20; d++) {
                    particles.push(new Particle(this.x + this.width / 2, this.y + this.height, '#00ffcc', 3, (Math.random()-0.5)*8, -Math.random()*4, 25));
                }
            }
        } else if (this.state === 'COSMIC_LEAP') {
            this.vy += 0.42;
            this.y += this.vy;
            this.x += this.vx;
            particles.push(new Particle(this.x + Math.random() * this.width, this.y + Math.random() * this.height, '#ffd700', 2.5, 0, 1, 20));

            if (this.y >= baseGroundY) {
                this.y = baseGroundY;
                this.vy = 0;
                this.state = 'PATROL';
                this.jumpCooldown = 160;
                this.vx = (this.vx > 0 ? 1.3 : -1.3);
                audio.playBossHit();
                if (triggerShake) triggerShake(8, 0.35);
                for (let d = 0; d < 22; d++) {
                    particles.push(new Particle(this.x + this.width / 2, this.y + this.height, '#ffd700', 3.5, (Math.random()-0.5)*9, -Math.random()*4, 30));
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
                audio.playBossHit();
                if (triggerShake) triggerShake(6, 0.2);
                for (let d = 0; d < 14; d++) {
                    particles.push(new Particle(this.x + (d % 2 === 0 ? 0 : this.width), this.y + this.height, '#ffd700', 3, (Math.random()-0.5)*5, -Math.random()*3, 20));
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
            ctx.shadowColor = '#ff3d00';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 38 : 26;

            const magmaGrad = ctx.createRadialGradient(-8, -10, 4, 0, 0, 36);
            if (this.hp <= 1) {
                magmaGrad.addColorStop(0, '#ffff55');
                magmaGrad.addColorStop(0.3, '#ff3d00');
                magmaGrad.addColorStop(0.7, '#d50000');
                magmaGrad.addColorStop(1, '#3e0000');
            } else {
                magmaGrad.addColorStop(0, '#ffe57f');
                magmaGrad.addColorStop(0.35, '#ff5722');
                magmaGrad.addColorStop(0.7, '#b71c1c');
                magmaGrad.addColorStop(1, '#1b0000');
            }

            ctx.fillStyle = magmaGrad;
            ctx.beginPath();
            ctx.moveTo(-18, -26);
            ctx.lineTo(18, -26);
            ctx.lineTo(34, -4);
            ctx.lineTo(30, 24);
            ctx.lineTo(-30, 24);
            ctx.lineTo(-34, -4);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#263238';
            ctx.beginPath();
            ctx.moveTo(-34, -4); ctx.lineTo(-24, -20); ctx.lineTo(-14, -6); ctx.closePath();
            ctx.moveTo(34, -4); ctx.lineTo(24, -20); ctx.lineTo(14, -6); ctx.closePath();
            ctx.fill();

            ctx.save();
            const pulse = (Math.sin(time * 0.007) + 1) * 0.5;
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 10 + pulse * 6;
            ctx.strokeStyle = `rgba(255, 214, 0, ${0.75 + pulse * 0.25})`;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(-20, -10); ctx.lineTo(-10, -4); ctx.lineTo(-14, 12); ctx.lineTo(-4, 18);
            ctx.moveTo(18, -12); ctx.lineTo(8, 0); ctx.lineTo(14, 14); ctx.lineTo(4, 18);
            ctx.moveTo(-2, -18); ctx.lineTo(0, -6); ctx.lineTo(-4, 4);
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.moveTo(-18, -26); ctx.lineTo(-14, -46); ctx.lineTo(-6, -28);
            ctx.lineTo(0, -50);
            ctx.lineTo(6, -28); ctx.lineTo(14, -46); ctx.lineTo(18, -26);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffd600';
            ctx.beginPath();
            ctx.arc(0, -44, 4, 0, Math.PI * 2);
            ctx.arc(-14, -40, 3, 0, Math.PI * 2);
            ctx.arc(14, -40, 3, 0, Math.PI * 2);
            ctx.fill();

        } else if (bType === 15) {
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 42 : 28;

            const voidGrad = ctx.createRadialGradient(-6, -8, 4, 0, 0, 36);
            if (this.hp <= 1) {
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

            const wispWobble = Math.sin(time * 0.008) * 4;
            ctx.fillStyle = voidGrad;
            ctx.beginPath();
            ctx.moveTo(0, -28);
            ctx.bezierCurveTo(30, -28, 36, 4, 28, 18);
            ctx.bezierCurveTo(18, 28, 8, 34 + wispWobble, 0, 38 + wispWobble);
            ctx.bezierCurveTo(-8, 34 + wispWobble, -18, 28, -28, 18);
            ctx.bezierCurveTo(-36, 4, -30, -28, 0, -28);
            ctx.closePath();
            ctx.fill();

            const handFloat = Math.sin(time * 0.006) * 3;
            ctx.fillStyle = '#304ffe';
            ctx.beginPath();
            ctx.arc(-34, 4 + handFloat, 6, 0, Math.PI * 2);
            ctx.arc(34, 4 - handFloat, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(-34, 4 + handFloat, 3, 0, Math.PI * 2);
            ctx.arc(34, 4 - handFloat, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1a0033';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-16, -26); ctx.quadraticCurveTo(-26, -50, -10, -46); ctx.lineTo(-6, -28);
            ctx.moveTo(16, -26); ctx.quadraticCurveTo(26, -50, 10, -46); ctx.lineTo(6, -28);
            ctx.fill();
            ctx.stroke();

        } else if (bType === 20) {
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 40 : 28;

            const mechGrad = ctx.createLinearGradient(-30, -28, 30, 26);
            if (this.hp <= 1) {
                mechGrad.addColorStop(0, '#ff5252');
                mechGrad.addColorStop(0.5, '#d32f2f');
                mechGrad.addColorStop(1, '#263238');
            } else {
                mechGrad.addColorStop(0, '#80deea');
                mechGrad.addColorStop(0.35, '#00b4d8');
                mechGrad.addColorStop(0.75, '#0077b6');
                mechGrad.addColorStop(1, '#02182b');
            }

            ctx.fillStyle = mechGrad;
            ctx.beginPath();
            ctx.moveTo(-18, -26);
            ctx.lineTo(18, -26);
            ctx.lineTo(32, -10);
            ctx.lineTo(32, 16);
            ctx.lineTo(20, 26);
            ctx.lineTo(-20, 26);
            ctx.lineTo(-32, 16);
            ctx.lineTo(-32, -10);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#80deea';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#cfd8dc';
            [[-18, -20], [18, -20], [-26, 16], [26, 16]].forEach(([rx, ry]) => {
                ctx.beginPath(); ctx.arc(rx, ry, 2, 0, Math.PI * 2); ctx.fill();
            });

            ctx.fillStyle = '#455a64';
            ctx.fillRect(-22, 24, 10, 8);
            ctx.fillRect(12, 24, 10, 8);

            ctx.strokeStyle = '#78909c';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(-13, -26); ctx.lineTo(-16, -44);
            ctx.moveTo(13, -26); ctx.lineTo(16, -44);
            ctx.stroke();
            const isStrobe = Math.floor(time / 200) % 2 === 0;
            ctx.fillStyle = isStrobe ? '#00ffcc' : '#ff1744';
            ctx.beginPath();
            ctx.arc(-16, -44, 4.5, 0, Math.PI * 2);
            ctx.arc(16, -44, 4.5, 0, Math.PI * 2);
            ctx.fill();

        } else if (bType === 25) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 44 : 32;

            const titanGrad = ctx.createRadialGradient(0, -6, 2, 0, 0, 36);
            if (this.hp <= 1) {
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

            ctx.fillStyle = titanGrad;
            ctx.beginPath();
            ctx.moveTo(0, -32);
            ctx.lineTo(34, -4);
            ctx.lineTo(24, 26);
            ctx.lineTo(-24, 26);
            ctx.lineTo(-34, -4);
            ctx.closePath();
            ctx.fill();

            const shardRot = time * 0.003;
            ctx.fillStyle = '#ffd700';
            for (let s = 0; s < 3; s++) {
                const sAngle = shardRot + (s * (Math.PI * 2 / 3));
                const sx = Math.cos(sAngle) * 36;
                const sy = Math.sin(sAngle) * 16;
                ctx.beginPath();
                ctx.arc(sx, sy, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.ellipse(0, -40, 24, 8, 0, 0, Math.PI * 2);
            ctx.stroke();

        } else {
            ctx.shadowColor = this.hp <= 1 ? '#ff1744' : '#ffd600';
            ctx.shadowBlur = (this.state === 'AWAKENING') ? 36 : 24;

            const bossGrad = ctx.createRadialGradient(-8, -10, 4, 0, 0, 36);
            if (this.hp <= 1) {
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

            ctx.fillStyle = bossGrad;
            ctx.beginPath();
            ctx.moveTo(0, -28);
            ctx.bezierCurveTo(34, -28, 37, 12, 34, 25);
            ctx.bezierCurveTo(24, 31, -24, 31, -34, 25);
            ctx.bezierCurveTo(-37, 12, -34, -28, 0, -28);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 64, 129, 0.35)';
            ctx.beginPath();
            ctx.ellipse(-18, 6, 5, 3, 0, 0, Math.PI * 2);
            ctx.ellipse(18, 6, 5, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 16;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(-18, -26); ctx.lineTo(-20, -44); ctx.lineTo(-10, -32);
            ctx.lineTo(0, -48);
            ctx.lineTo(10, -32); ctx.lineTo(20, -44); ctx.lineTo(18, -26);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ff1744';
            ctx.beginPath(); ctx.arc(0, -33, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#00e5ff';
            ctx.beginPath(); ctx.arc(-11, -31, 2.5, 0, Math.PI * 2); ctx.arc(11, -31, 2.5, 0, Math.PI * 2); ctx.fill();
        }

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
            ctx.save();
            ctx.fillStyle = '#0a192f';
            ctx.fillRect(-20, -7, 40, 11);
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-20, -7, 40, 11);

            const scanX = Math.sin(time * 0.008) * 13;
            ctx.fillStyle = '#00ffcc';
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 10;
            ctx.fillRect(scanX - 4, -6, 8, 9);
            ctx.restore();
        } else {
            const eyeX = this.vx > 0 ? 4 : -4;
            ctx.fillStyle = (bType === 10) ? '#ffeb3b' : (bType === 15 ? '#00f0ff' : '#ffffff');
            ctx.beginPath();
            ctx.arc(-10 + eyeX, -2, 8, 0, Math.PI * 2);
            ctx.arc(10 + eyeX, -2, 8, 0, Math.PI * 2);
            ctx.fill();

            const pupilColor = (bType === 10) ? '#b71c1c' : (bType === 15 ? '#001040' : (bType === 25 ? '#ffd700' : (this.hp === 1 ? '#b71c1c' : '#1a237e')));
            ctx.fillStyle = pupilColor;
            ctx.beginPath();
            ctx.arc(-8 + eyeX * 1.4, -2, 4.5, 0, Math.PI * 2);
            ctx.arc(12 + eyeX * 1.4, -2, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-10 + eyeX * 1.4, -4, 2, 0, Math.PI * 2);
            ctx.arc(10 + eyeX * 1.4, -4, 2, 0, Math.PI * 2);
            ctx.fill();

            if (bType === 25) {
                const thirdEyePulse = (Math.sin(time * 0.009) + 1) * 0.5;
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 10 + thirdEyePulse * 8;
                ctx.beginPath();
                ctx.arc(0, -13, 4 + thirdEyePulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, -13, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}
