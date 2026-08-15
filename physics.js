// Player & Entities Physics Engine with Matched Callback Signatures & Strict Collision Handling

const CHARACTER_SKINS = [
    { id: 'bunny', name: 'Fluffy Bunny', icon: '🐰', bodyColor: '#ff80ab', earColor: '#ff4081', priceStars: 0, perk: 'Speed 4.8', baseSpeed: 4.8 },
    { id: 'bear', name: 'Teddy Bear', icon: '🐻', bodyColor: '#8d6e63', earColor: '#5d4037', priceStars: 5, perk: 'Speed 5.0', baseSpeed: 5.0 },
    { id: 'kitty', name: 'Cute Kitty', icon: '🐱', bodyColor: '#ffe082', earColor: '#ffb300', priceStars: 15, perk: 'Speed 5.4', baseSpeed: 5.4 },
    { id: 'fox', name: 'Foxy Hero', icon: '🦊', bodyColor: '#ff7043', earColor: '#d84315', priceStars: 30, perk: 'Speed 5.8', baseSpeed: 5.8 },
    { id: 'panda', name: 'Panda Pal', icon: '🐼', bodyColor: '#f5f5f5', earColor: '#212121', priceStars: 45, perk: 'Speed 6.2', baseSpeed: 6.2 },
    { id: 'unicorn', name: 'Magic Unicorn', icon: '🦄', bodyColor: '#f8bbd0', earColor: '#ea80fc', priceStars: 60, perk: 'Speed 6.8', baseSpeed: 6.8 }
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

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 36;
        this.vx = 0;
        this.vy = 0;
        this.jumpForce = -14.2; // Snappy jump force
        this.gravity = 0.95; // Stronger gravity for tight non-floaty landing

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
    }

    get speed() {
        const skin = CHARACTER_SKINS.find(s => s.id === this.currentSkinId) || CHARACTER_SKINS[0];
        return skin.baseSpeed || 1.8;
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
    }

    triggerDeath(cause, onDie, particles) {
        if (!this.isDead) {
            this.isDead = true;
            this.deathTimer = 2.5; // ~2.5 - 3 seconds hurt freeze!
            this.vx = 0;
            this.vy = -2.5; // Defeat hop
            audio.playHurt();
            for (let i = 0; i < 16; i++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    '#ff1744',
                    Math.random() * 4 + 2,
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5,
                    30
                ));
            }
        }
    }

    jump(particles) {
        if (this.isCrouching) return;
        if (this.grounded) {
            this.vy = this.jumpForce;
            this.grounded = false;
            this.canDoubleJump = true;
            audio.playJump();
            this.createDust(particles, 6, '#ffb74d');
        } else if (this.canDoubleJump) {
            this.vy = this.jumpForce * 1.15;
            this.canDoubleJump = false;
            audio.playJump();
            this.createDust(particles, 10, '#81d4fa');
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

    update(keys, platforms, hazards, bouncyPads, collectibles, particles, enemies, portals, crates, fans, switches, onDie, onWin, onCollectFruit, onCollectStarKey, overheadCeilings = [], onDoorLocked = null) {
        if (this.isDead) {
            this.deathTimer -= 1 / 60;
            this.vx = 0;
            this.vy += this.gravity * 0.3; // Slow defeat fall
            this.y += this.vy;

            // Spawn hurt particle effects
            if (Math.random() < 0.3) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    '#ff1744',
                    Math.random() * 3 + 2,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 3,
                    20
                ));
            }

            if (this.deathTimer <= 0) {
                this.isDead = false;
                if (onDie) onDie();
            }
            return; // Freeze player inputs during 2.5-3s death timer!
        }

        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.teleportCooldown > 0) this.teleportCooldown--;

        const underCeiling = this.isUnderOverheadCeiling(platforms, overheadCeilings);

        if (keys.down && this.grounded) {
            if (!this.isCrouching) {
                this.isCrouching = true;
                this.y += 14;
                this.height = 22;
            }
            this.vx *= 0.60;
        } else if (underCeiling) {
            this.isCrouching = true;
            this.height = 22;
            this.vx = 0;
        } else if (this.isCrouching) {
            this.isCrouching = false;
            this.y -= 14;
            this.height = 36;
        }

        if (!underCeiling || keys.down) {
            if (keys.left) {
                this.vx = -this.speed;
                this.facing = 'left';
            } else if (keys.right) {
                this.vx = this.speed;
                this.facing = 'right';
            } else {
                this.vx *= 0.65;
            }
        }

        this.vy += this.gravity;
        if (this.vy > 9.5) this.vy = 9.5;

        // Pushable Crates Physics
        for (let crate of crates) {
            if (this.checkCollision(this, crate)) {
                if (this.vx > 0) {
                    crate.x += 1.2;
                    this.x = crate.x - this.width;
                } else if (this.vx < 0) {
                    crate.x -= 1.2;
                    this.x = crate.x + crate.width;
                }
            }
        }

        // Horizontal Movement & Collisions
        this.x += this.vx;
        for (let platform of platforms) {
            if (this.checkCollision(this, platform)) {
                if (this.vx > 0) this.x = platform.x - this.width;
                else if (this.vx < 0) this.x = platform.x + platform.width;
                this.vx = 0;
            }
        }

        // Vertical Movement & Collisions
        this.y += this.vy;
        this.grounded = false;
        for (let platform of platforms) {
            if (this.checkCollision(this, platform)) {
                if (this.vy > 0) {
                    const prevBottom = this.y - this.vy + this.height;
                    if (prevBottom <= platform.y + 16) {
                        this.y = platform.y - this.height;
                        this.vy = 0;
                        this.grounded = true;
                        this.canDoubleJump = true;
                        if (platform.vx) this.x += platform.vx;
                    }
                } else if (this.vy < 0) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
            }
        }

        // Crates Solid Ground
        for (let crate of crates) {
            if (this.checkCollision(this, crate)) {
                if (this.vy > 0) {
                    this.y = crate.y - this.height;
                    this.vy = 0;
                    this.grounded = true;
                    this.canDoubleJump = true;
                }
            }
        }

        // Bouncy Pads (Trampolines - Instant High Bounce!)
        for (let pad of bouncyPads) {
            if (this.checkCollision(this, pad)) {
                if (this.vy >= 0) {
                    this.y = pad.y - this.height;
                    this.vy = -16.5; // Powerful spring bounce!
                    this.grounded = false;
                    this.canDoubleJump = true;
                    audio.playJump();
                    this.createDust(particles, 12, '#ff4081');
                }
            }
        }

        // Wind Fans
        for (let fan of fans) {
            if (this.x < fan.x + fan.width + 20 &&
                this.x + this.width > fan.x - 20 &&
                this.y < fan.y &&
                this.y > fan.y - 180) {
                this.vy = -6.5;
                this.createDust(particles, 2, '#e0f7fa');
            }
        }

        // Teleport Portals
        if (this.teleportCooldown <= 0) {
            for (let portal of portals) {
                if (this.checkCollision(this, portal.entrance)) {
                    this.x = portal.exit.x;
                    this.y = portal.exit.y - 10;
                    this.teleportCooldown = 45;
                    audio.playStar();
                    for (let p = 0; p < 12; p++) {
                        particles.push(new Particle(portal.exit.x, portal.exit.y, '#ea80fc', 4, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 25));
                    }
                    break;
                }
            }
        }

        // Floor Switches
        for (let sw of switches) {
            if (!sw.activated && this.checkCollision(this, sw)) {
                sw.activated = true;
                audio.playCoin();
                if (sw.targetWall) sw.targetWall.y += 150;
            }
        }

        // Enemy Damage
        if (this.invincibleTimer <= 0) {
            for (let enemy of enemies) {
                if (this.checkCollision(this, enemy)) {
                    this.triggerDeath('enemy', onDie, particles);
                    return;
                }
            }
        }

        // Void Pitfall & Hazards Detection
        if (this.y > 520) { // Pitfall below bottom platforms!
            this.triggerDeath('pit', onDie, particles);
            return;
        }
        for (let hazard of hazards) {
            if (this.checkCollision(this, hazard)) {
                this.triggerDeath('hazard', onDie, particles);
                return;
            }
        }

        // Collectibles Handling
        for (let i = collectibles.length - 1; i >= 0; i--) {
            let item = collectibles[i];
            if (!item.collected && this.checkCollision(this, item)) {
                if (item.type === 'exit' || item.type === 'exit_door') {
                    if (!this.hasGoldenKey) {
                        // Door is Locked 🔒! Push player back slightly and trigger locked callback
                        if (this.facing === 'right') this.x = item.x - this.width - 2;
                        else this.x = item.x + item.width + 2;
                        this.vx = 0;
                        if (onDoorLocked) onDoorLocked();
                    } else {
                        item.collected = true;
                        audio.playWin();
                        if (onWin) onWin();
                    }
                } else if (item.type === 'golden_key' || item.type === 'star_key' || item.type === 'key') {
                    item.collected = true;
                    this.hasGoldenKey = true;
                    audio.playStar();
                    if (onCollectStarKey) onCollectStarKey(item);
                } else {
                    item.collected = true;
                    audio.playCoin();
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

        // Flashing Invincibility / Hurt Flicker Effect
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        // Running & Jumping Body Tilt
        let tilt = 0;
        if (Math.abs(this.vx) > 0.5) tilt = (this.facing === 'right' ? 0.12 : -0.12);
        if (!this.grounded) tilt += (this.facing === 'right' ? 0.08 : -0.08);
        ctx.rotate(tilt);

        // Squish & Stretch animation
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

        // 1. Hero Cape / Scarf (Fluttering behind)
        if (skin.id === 'bunny' || skin.id === 'fox') {
            const capeOffset = isRight ? -12 : 12;
            const capeWave = Math.sin(Date.now() * 0.015) * 4;
            ctx.fillStyle = '#ff1744';
            ctx.beginPath();
            ctx.moveTo(capeOffset / 2, -2);
            ctx.lineTo(capeOffset - (isRight ? 14 : -14), 12 + capeWave);
            ctx.lineTo(capeOffset - (isRight ? 18 : -18), 4 + capeWave);
            ctx.lineTo(capeOffset / 2, -8);
            ctx.closePath();
            ctx.fill();
        }

        // 2. Main Animal Ears (Drawn behind body)
        if (skin.id === 'bunny') {
            ctx.fillStyle = skin.bodyColor;
            ctx.beginPath();
            ctx.ellipse(isRight ? -3 : 3, -22, 4.5, 12, (isRight ? -0.2 : 0.2), 0, Math.PI * 2);
            ctx.ellipse(isRight ? 5 : -5, -24, 4.5, 13, (isRight ? 0.1 : -0.1), 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.ellipse(isRight ? -3 : 3, -22, 2.5, 8, (isRight ? -0.2 : 0.2), 0, Math.PI * 2);
            ctx.ellipse(isRight ? 5 : -5, -24, 2.5, 9, (isRight ? 0.1 : -0.1), 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            ctx.fillStyle = skin.bodyColor;
            ctx.beginPath();
            ctx.arc(-10, -14, 6.5, 0, Math.PI * 2);
            ctx.arc(10, -14, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#d7ccc8';
            ctx.beginPath();
            ctx.arc(-10, -14, 3.5, 0, Math.PI * 2);
            ctx.arc(10, -14, 3.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'kitty') {
            ctx.fillStyle = skin.bodyColor;
            ctx.beginPath();
            ctx.moveTo(-12, -8); ctx.lineTo(-10, -22); ctx.lineTo(-2, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(2, -10); ctx.lineTo(10, -22); ctx.lineTo(12, -8); ctx.fill();
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.moveTo(-10, -9); ctx.lineTo(-9, -19); ctx.lineTo(-4, -11); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(4, -11); ctx.lineTo(9, -19); ctx.lineTo(10, -9); ctx.fill();
        } else if (skin.id === 'fox') {
            ctx.fillStyle = skin.bodyColor;
            ctx.beginPath();
            ctx.moveTo(-12, -8); ctx.lineTo(-10, -23); ctx.lineTo(-2, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(2, -10); ctx.lineTo(10, -23); ctx.lineTo(12, -8); ctx.fill();
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.moveTo(-10, -17); ctx.lineTo(-10, -23); ctx.lineTo(-6, -15); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, -15); ctx.lineTo(10, -23); ctx.lineTo(10, -17); ctx.fill();
        } else if (skin.id === 'panda') {
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(-10, -14, 6.5, 0, Math.PI * 2);
            ctx.arc(10, -14, 6.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'unicorn') {
            ctx.save();
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 14;
            const hornGrad = ctx.createLinearGradient(0, -26, 0, -10);
            hornGrad.addColorStop(0, '#00e5ff');
            hornGrad.addColorStop(0.5, '#ffd600');
            hornGrad.addColorStop(1, '#ff4081');
            ctx.fillStyle = hornGrad;
            ctx.beginPath();
            ctx.moveTo(-3, -10); ctx.lineTo(0, -28); ctx.lineTo(4, -10); ctx.fill();
            ctx.restore();
        }

        // 3. Main Round Character Body
        ctx.fillStyle = skin.bodyColor;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Soft Belly Patch / Muzzle
        if (skin.id === 'bunny') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 4, 8, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            ctx.fillStyle = '#d7ccc8';
            ctx.beginPath();
            ctx.ellipse(0, 3, 7, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'fox') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 4, 7, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rosy Cheeks
        ctx.fillStyle = 'rgba(255, 64, 129, 0.45)';
        ctx.beginPath();
        ctx.arc(-8, 3, 3, 0, Math.PI * 2);
        ctx.arc(8, 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Panda Eye Patches
        if (skin.id === 'panda') {
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.ellipse(-5, -2, 5, 4, -0.2, 0, Math.PI * 2);
            ctx.ellipse(5, -2, 5, 4, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 4. Big Shiny Anime Eyes (or Dizzy KO Eyes 😵 when dead)
        const eyeOffset = isRight ? 2.5 : -2.5;

        if (this.isDead) {
            // Dizzy KO Cross Eyes (X X) 😵
            ctx.strokeStyle = '#ff1744';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            // Left Eye X
            ctx.moveTo(-7 + eyeOffset, -5); ctx.lineTo(-2 + eyeOffset, 0);
            ctx.moveTo(-2 + eyeOffset, -5); ctx.lineTo(-7 + eyeOffset, 0);
            // Right Eye X
            ctx.moveTo(3 + eyeOffset, -5); ctx.lineTo(8 + eyeOffset, 0);
            ctx.moveTo(8 + eyeOffset, -5); ctx.lineTo(3 + eyeOffset, 0);
            ctx.stroke();

            // Spinning Dizzy Stars around Head 💫
            ctx.fillStyle = '#ffeb3b';
            const starAngle = Date.now() * 0.008;
            for (let s = 0; s < 3; s++) {
                const sa = starAngle + (s * Math.PI * 2 / 3);
                const sx = Math.cos(sa) * 16;
                const sy = -22 + Math.sin(sa) * 5;
                ctx.beginPath();
                ctx.arc(sx, sy, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (skin.id !== 'unicorn' && skin.id !== 'kitty') {
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
        } else if (skin.id === 'kitty') {
            ctx.fillStyle = '#00e676';
            ctx.beginPath();
            ctx.ellipse(-5 + eyeOffset, -2, 4, 5, 0, 0, Math.PI * 2);
            ctx.ellipse(5 + eyeOffset, -2, 4, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1b5e20';
            ctx.beginPath();
            ctx.ellipse(-4 + eyeOffset, -2, 1.8, 4, 0, 0, Math.PI * 2);
            ctx.ellipse(6 + eyeOffset, -2, 1.8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'unicorn') {
            ctx.fillStyle = '#e040fb';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3a0066';
            ctx.beginPath();
            ctx.arc(-4 + eyeOffset, -2, 2.5, 0, Math.PI * 2);
            ctx.arc(6 + eyeOffset, -2, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dual Sparkle Eye Highlights ✨
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5 + eyeOffset * 1.3, -3.5, 1.2, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffset * 1.3, -3.5, 1.2, 0, Math.PI * 2);
        ctx.arc(-3 + eyeOffset * 1.3, -0.5, 0.7, 0, Math.PI * 2);
        ctx.arc(7 + eyeOffset * 1.3, -0.5, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // 5. Cute Nose
        ctx.fillStyle = skin.id === 'fox' ? '#000000' : '#ff4081';
        ctx.beginPath();
        ctx.arc(0 + eyeOffset * 0.5, 2, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Ground-bound Enemy
class Enemy {
    constructor(x, y, range, platformRef) {
        this.x = x;
        this.y = y;
        this.width = 26;
        this.height = 24;
        this.vx = 0.6;
        this.platformRef = platformRef;
        if (platformRef) {
            this.localX = Math.max(4, Math.min(x - platformRef.x, platformRef.width - this.width - 4));
        } else {
            this.localX = 0;
            this.startX = x;
        }
    }

    update(platforms) {
        if (this.platformRef) {
            // Patrol relative to the platform's current position
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
        ctx.save();
        const ex = this.x - camera.x;
        const ey = this.y - camera.y;
        
        ctx.translate(ex + 13, ey + 12);

        // Bouncy squish animation
        const squish = Math.sin(Date.now() * 0.008) * 1.5;
        const scaleX = 1 + squish * 0.05;
        const scaleY = 1 - squish * 0.05;
        ctx.scale(scaleX, scaleY);

        const sColor = themeSlime || { start: "#ff007f", mid: "#e040fb", end: "#7c4dff", glow: "#ff007f", horn: "#76ff03" };

        // Slime Glow Shadow
        ctx.shadowColor = sColor.glow || '#d500f9';
        ctx.shadowBlur = 16;

        // Slime Body Gradient
        const slimeGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, 14);
        slimeGrad.addColorStop(0, sColor.start || '#ff4081');
        slimeGrad.addColorStop(0.5, sColor.mid || '#e040fb');
        slimeGrad.addColorStop(1, sColor.end || '#651fff');

        ctx.fillStyle = slimeGrad;
        ctx.beginPath();
        // Squishy organic slime blob shape
        ctx.moveTo(0, -14);
        ctx.bezierCurveTo(14, -14, 15, 6, 14, 11);
        ctx.bezierCurveTo(10, 14, -10, 14, -14, 11);
        ctx.bezierCurveTo(-15, 6, -14, -14, 0, -14);
        ctx.closePath();
        ctx.fill();

        // Cute Slime Horn / Antenna
        ctx.fillStyle = sColor.horn || '#76ff03';
        ctx.beginPath();
        ctx.arc(0, -14, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Glossy Reflection Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(-5, -6, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Expressive Eyes (Follows Direction)
        const eyeOffset = this.vx > 0 ? 2 : -2;
        
        // Eye Whites
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffset, -2, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye Pupils
        ctx.fillStyle = '#1a237e';
        ctx.beginPath();
        ctx.arc(-4 + eyeOffset * 1.3, -2, 2.2, 0, Math.PI * 2);
        ctx.arc(6 + eyeOffset * 1.3, -2, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Eye Sparkles
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5 + eyeOffset * 1.3, -3, 0.8, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffset * 1.3, -3, 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
