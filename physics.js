// Player & Entities Physics Engine with Matched Callback Signatures & Strict Collision Handling

const CHARACTER_SKINS = [
    { id: 'bunny', name: 'Fluffy Bunny', icon: '🐰', bodyColor: '#ffffff', earColor: '#ff80ab', priceStars: 0, perk: 'Speed 3.2', baseSpeed: 3.2 },
    { id: 'bear', name: 'Teddy Bear', icon: '🐻', bodyColor: '#8d6e63', earColor: '#5d4037', priceStars: 5, perk: 'Speed 3.4', baseSpeed: 3.4 },
    { id: 'kitty', name: 'Cute Kitty', icon: '🐱', bodyColor: '#ffa726', earColor: '#ffb300', priceStars: 15, perk: 'Speed 3.6', baseSpeed: 3.6 },
    { id: 'fox', name: 'Foxy Hero', icon: '🦊', bodyColor: '#ff5722', earColor: '#d84315', priceStars: 30, perk: 'Speed 3.8', baseSpeed: 3.8 },
    { id: 'panda', name: 'Panda Pal', icon: '🐼', bodyColor: '#ffffff', earColor: '#212121', priceStars: 45, perk: 'Speed 4.1', baseSpeed: 4.1 },
    { id: 'unicorn', name: 'Magic Unicorn', icon: '🦄', bodyColor: '#f5f3ff', earColor: '#ea80fc', priceStars: 60, perk: 'Speed 4.4', baseSpeed: 4.4 }
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
        this.jumpForce = -16.0; // Slightly stronger to compensate for increased gravity
        this.gravity = 1.35; // Stronger gravity for snappier non-floaty jumps

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
        this.isEnteringDoor = false;
    }

    triggerDeath(cause, onDie, particles) {
        if (!this.isDead) {
            this.isDead = true;
            this.deathTimer = 1.2; // Halved defeat freeze (~1.2 seconds)
            this.vx = 0;
            this.vy = -2.0; // Gentle defeat hop
            audio.playHurt();
            
            // Cute cartoon dizziness star dust ✨
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
            this.vy += this.gravity * 0.12; // Gentle, floaty defeat fall (doesn't plunge off screen)
            this.y += this.vy;

            // Occasional tiny cartoon dizziness twinkle
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
            return; // Freeze player inputs during short 1.2s death timer
        }

        let simKeys = { ...keys };
        if (this.isEnteringDoor) {
            simKeys = { left: false, right: false, up: false, down: false };
            const dir = Math.sign(this.doorTargetX - this.x);
            if (Math.abs(this.x - this.doorTargetX) > 2) {
                if (dir < 0) simKeys.left = true;
                if (dir > 0) simKeys.right = true;
            } else {
                this.x = this.doorTargetX;
                this.vx = 0;
                if (!this.entryTimer) this.entryTimer = 30;
                
                this.entryTimer--;
                const oldH = this.height;
                const oldW = this.width;
                this.width *= 0.92; // shrink faster
                this.height *= 0.92;
                this.y += (oldH - this.height);
                this.x += (oldW - this.width) / 2;

                if (this.entryTimer <= 0) {
                    this.isEnteringDoor = false;
                    this.entryTimer = 30;
                    if (this.onWinCallback) this.onWinCallback();
                }
            }
        }

        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.teleportCooldown > 0) this.teleportCooldown--;

        const underCeiling = this.isUnderOverheadCeiling(platforms, overheadCeilings);

        if (simKeys.down && this.grounded) {
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

        if (!underCeiling || simKeys.down) {
            if (simKeys.left) {
                this.vx = -this.speed;
                this.facing = 'left';
            } else if (simKeys.right) {
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
                    this.vy = -24.5; // Balanced high spring bounce!
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
                        // Start door entering sequence instead of instant win
                        item.collected = true;
                        item.doorOpen = true; // For renderer
                        this.isEnteringDoor = true;
                        this.doorTargetX = item.x + (item.width / 2) - (this.width / 2);
                        this.onWinCallback = onWin;
                        audio.playWin();
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
        const time = Date.now();

        // 1. ANIMAL TAILS (Rendered behind body)
        if (skin.id === 'fox') {
            // Big Lush Bushy Fox Tail with White Tip 🦊
            const tailX = isRight ? -14 : 14;
            const tailWave = Math.sin(time * 0.012) * 4;
            ctx.fillStyle = '#ff5722';
            ctx.beginPath();
            ctx.ellipse(tailX, 4 + tailWave, 10, 6, isRight ? -0.4 : 0.4, 0, Math.PI * 2);
            ctx.fill();
            // Fluffy white tail tip
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(tailX - (isRight ? 6 : -6), 4 + tailWave, 5, 4, isRight ? -0.4 : 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'kitty') {
            // Curving Animated Kitty Tail 🐱
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
            // Fluffy White Cotton Bunny Tail 🐰
            const tailX = isRight ? -13 : 13;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(tailX, 6, 4.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            // Cute Round Teddy Bear Tail 🐻
            const tailX = isRight ? -13 : 13;
            ctx.fillStyle = '#6d4c41';
            ctx.beginPath();
            ctx.arc(tailX, 7, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. HERO CAPE / SCARF (Fluttering behind)
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
            // Red cozy collar / scarf
            ctx.fillStyle = '#d32f2f';
            ctx.beginPath();
            ctx.roundRect(-10, 4, 20, 5, 2.5);
            ctx.fill();
            // Golden Bell on Scarf
            ctx.fillStyle = '#ffd600';
            ctx.beginPath();
            ctx.arc(0, 9, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // 3. ANIMAL EARS (Drawn behind/atop body)
        if (skin.id === 'bunny') {
            // Tall Upright Bunny Ears 🐰
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(isRight ? -4 : 4, -22, 5, 13, (isRight ? -0.15 : 0.15), 0, Math.PI * 2);
            ctx.ellipse(isRight ? 6 : -6, -24, 5, 14, (isRight ? 0.12 : -0.12), 0, Math.PI * 2);
            ctx.fill();
            // Inner Pink Ear Pads
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.ellipse(isRight ? -4 : 4, -22, 2.8, 9, (isRight ? -0.15 : 0.15), 0, Math.PI * 2);
            ctx.ellipse(isRight ? 6 : -6, -24, 2.8, 10, (isRight ? 0.12 : -0.12), 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            // Round Teddy Bear Ears 🐻
            ctx.fillStyle = '#8d6e63';
            ctx.beginPath();
            ctx.arc(-11, -13, 7, 0, Math.PI * 2);
            ctx.arc(11, -13, 7, 0, Math.PI * 2);
            ctx.fill();
            // Inner Tan Ear Pads
            ctx.fillStyle = '#d7ccc8';
            ctx.beginPath();
            ctx.arc(-11, -13, 4, 0, Math.PI * 2);
            ctx.arc(11, -13, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'kitty') {
            // Sharp Triangular Cat Ears 🐱
            ctx.fillStyle = '#ffa726';
            ctx.beginPath();
            ctx.moveTo(-13, -6); ctx.lineTo(-11, -22); ctx.lineTo(-2, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(2, -10); ctx.lineTo(11, -22); ctx.lineTo(13, -6); ctx.fill();
            // Inner Pink Tufts
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.moveTo(-11, -8); ctx.lineTo(-10, -18); ctx.lineTo(-4, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(4, -10); ctx.lineTo(10, -18); ctx.lineTo(11, -8); ctx.fill();
        } else if (skin.id === 'fox') {
            // Pointed Fox Ears with Black Tips 🦊
            ctx.fillStyle = '#ff5722';
            ctx.beginPath();
            ctx.moveTo(-13, -6); ctx.lineTo(-11, -24); ctx.lineTo(-2, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(2, -10); ctx.lineTo(11, -24); ctx.lineTo(13, -6); ctx.fill();
            // Black Ear Tips
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.moveTo(-11, -17); ctx.lineTo(-11, -24); ctx.lineTo(-6, -15); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, -15); ctx.lineTo(11, -24); ctx.lineTo(11, -17); ctx.fill();
            // White Inner Ear Fur
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-9, -9); ctx.lineTo(-8, -16); ctx.lineTo(-4, -10); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(4, -10); ctx.lineTo(8, -16); ctx.lineTo(9, -9); ctx.fill();
        } else if (skin.id === 'panda') {
            // Big Bold Black Panda Ears 🐼
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(-11, -13, 7.5, 0, Math.PI * 2);
            ctx.arc(11, -13, 7.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'unicorn') {
            // Flowing Pastel Rainbow Mane 🦄
            const maneWave = Math.sin(time * 0.012) * 3;
            ctx.fillStyle = '#ff4081'; // Pink strand
            ctx.beginPath();
            ctx.ellipse(isRight ? -10 : 10, -14 + maneWave, 5, 10, isRight ? 0.3 : -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#a855f7'; // Purple strand
            ctx.beginPath();
            ctx.ellipse(isRight ? -14 : 14, -6 + maneWave, 5, 9, isRight ? 0.4 : -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#00f0ff'; // Cyan strand
            ctx.beginPath();
            ctx.ellipse(isRight ? -12 : 12, 4 + maneWave, 4, 8, isRight ? 0.5 : -0.5, 0, Math.PI * 2);
            ctx.fill();

            // Glowing Rainbow Horn
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

        // 4. MAIN CHARACTER BODY
        ctx.fillStyle = skin.bodyColor || '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 14.5, 0, Math.PI * 2);
        ctx.fill();

        // 5. MUZZLE / BELLY / MASKS
        if (skin.id === 'bunny') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 4, 8.5, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            // Creamy Bear Muzzle
            ctx.fillStyle = '#efebe9';
            ctx.beginPath();
            ctx.ellipse(0, 3, 8, 6.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'fox') {
            // White Fox Cheek Fur Mask
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(-7, 4, 6, 5.5, -0.3, 0, Math.PI * 2);
            ctx.ellipse(7, 4, 6, 5.5, 0.3, 0, Math.PI * 2);
            ctx.ellipse(0, 5, 6, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'kitty') {
            // Cat Forehead Stripes
            ctx.fillStyle = '#e65100';
            ctx.fillRect(-1.5, -13, 3, 5);
            ctx.fillRect(-6, -11, 2.5, 4);
            ctx.fillRect(3.5, -11, 2.5, 4);
            // Cute White Muzzle
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 4, 7, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'panda') {
            // Panda Black Vest Shoulders
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(-11, 7, 5, 0, Math.PI * 2);
            ctx.arc(11, 7, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rosy Cheeks
        ctx.fillStyle = 'rgba(255, 64, 129, 0.45)';
        ctx.beginPath();
        ctx.arc(-8, 3.5, 3, 0, Math.PI * 2);
        ctx.arc(8, 3.5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Panda Eye Patches 🐼
        if (skin.id === 'panda') {
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.ellipse(-5.5, -2, 5.2, 4.2, -0.22, 0, Math.PI * 2);
            ctx.ellipse(5.5, -2, 5.2, 4.2, 0.22, 0, Math.PI * 2);
            ctx.fill();
        }

        // 6. EYES & EXPRESSIONS
        const eyeOffset = isRight ? 2.5 : -2.5;

        if (this.isDead) {
            // Animated Hypnosis Spiral Eyes 🌀😵
            const drawHypnoEye = (cx, cy) => {
                // Eye white background disk
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(cx, cy, 4.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#212121';
                ctx.lineWidth = 1.4;
                ctx.stroke();

                // Hypnotic Spinning Spiral
                ctx.save();
                ctx.beginPath();
                ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
                ctx.clip();

                ctx.strokeStyle = '#4a148c'; // Deep hypnotic purple
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

            // 💫 Beautiful Spinning Cartoon Knockout Stars Orbiting Head!
            const starAngle = time * 0.007;
            for (let s = 0; s < 3; s++) {
                const sa = starAngle + (s * Math.PI * 2 / 3);
                const sx = Math.cos(sa) * 18;
                const sy = -24 + Math.sin(sa) * 6;
                const sRot = time * 0.015 + s;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(sRot);

                // Golden 4-point Star Shape
                ctx.fillStyle = '#ffd600';
                ctx.beginPath();
                ctx.moveTo(0, -5);
                ctx.quadraticCurveTo(0, 0, 5, 0);
                ctx.quadraticCurveTo(0, 0, 0, 5);
                ctx.quadraticCurveTo(0, 0, -5, 0);
                ctx.quadraticCurveTo(0, 0, 0, -5);
                ctx.closePath();
                ctx.fill();

                // Sparkle Core
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        } else if (skin.id === 'kitty') {
            // Emerald Cat Eyes 🐱
            ctx.fillStyle = '#00e676';
            ctx.beginPath();
            ctx.ellipse(-5 + eyeOffset, -2, 4.2, 5, 0, 0, Math.PI * 2);
            ctx.ellipse(5 + eyeOffset, -2, 4.2, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cat Vertical Pupils
            ctx.fillStyle = '#0f3813';
            ctx.beginPath();
            ctx.ellipse(-4.5 + eyeOffset, -2, 1.6, 4.2, 0, 0, Math.PI * 2);
            ctx.ellipse(5.5 + eyeOffset, -2, 1.6, 4.2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'unicorn') {
            // Magical Starry Violet Eyes 🦄
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
            // Expressive Shiny Cartoon Eyes
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

        // Dual Sparkle Eye Highlights ✨
        if (!this.isDead) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-5 + eyeOffset * 1.3, -3.5, 1.3, 0, Math.PI * 2);
            ctx.arc(5 + eyeOffset * 1.3, -3.5, 1.3, 0, Math.PI * 2);
            ctx.arc(-3 + eyeOffset * 1.3, -0.5, 0.7, 0, Math.PI * 2);
            ctx.arc(7 + eyeOffset * 1.3, -0.5, 0.7, 0, Math.PI * 2);
            ctx.fill();
        }

        // 7. CUTE NOSE & WHISKERS
        if (skin.id === 'fox') {
            // Fox Pointy Black Nose
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(0 + eyeOffset * 0.5, 2.5, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'bear') {
            // Big Round Bear Nose
            ctx.fillStyle = '#3e2723';
            ctx.beginPath();
            ctx.ellipse(0 + eyeOffset * 0.5, 2, 2.8, 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (skin.id === 'kitty') {
            // Tiny Pink Cat Nose & Whiskers
            ctx.fillStyle = '#ff4081';
            ctx.beginPath();
            ctx.arc(0 + eyeOffset * 0.5, 1.8, 1.5, 0, Math.PI * 2);
            ctx.fill();
            // Whiskers
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-7, 2); ctx.lineTo(-14, 0);
            ctx.moveTo(-7, 4); ctx.lineTo(-14, 5);
            ctx.moveTo(7, 2); ctx.lineTo(14, 0);
            ctx.moveTo(7, 4); ctx.lineTo(14, 5);
            ctx.stroke();
        } else {
            // Pink Cute Animal Nose
            ctx.fillStyle = '#ff4081';
            ctx.beginPath();
            ctx.arc(0 + eyeOffset * 0.5, 2, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

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
