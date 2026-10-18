/**
 * 3D Royal Piggy Farm - 2D Pixel-Style Action Boss Battle Minigame
 * Module: js/pixel-battle.js
 */

const PixelBattle = {
    canvas: null,
    ctx: null,
    isActive: false,
    animFrameId: null,

    stage: 1,
    loop: 1, // 1 = 一周目, 2 = 二周目 (NG+), etc.
    score: 0,
    coinsEarned: 0,

    player: {
        x: 120,
        y: 280,
        vx: 0,
        vy: 0,
        speed: 180,
        width: 38,
        height: 38,
        facing: 1,
        hp: 200,
        maxHp: 200,
        atk: 25,
        comboStep: 0,
        comboTimer: 0,
        attackCooldown: 0,
        isAttacking: false,
        invincibleTimer: 0,
        // Skill Cooldowns
        skillCdK: 0,
        skillCdL: 0,
        skillCdSemi: 0
    },

    keys: {
        KeyW: false, KeyS: false, KeyA: false, KeyD: false,
        KeyJ: false, KeyK: false, KeyL: false, Semicolon: false
    },

    enemies: [],
    boss: null,
    particles: [],
    damageNumbers: [],
    cameraShake: 0,

    remoteAllies: new Map(), // Other co-op players in the room

    init() {
        this.canvas = document.getElementById('pixel-battle-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.bindInputEvents();
    },

    bindInputEvents() {
        window.addEventListener('keydown', e => {
            if (!this.isActive) return;
            if (this.keys[e.code] !== undefined) {
                this.keys[e.code] = true;
                e.preventDefault();
            }
            if (e.code === 'KeyJ') this.triggerPlayerAttack();
            if (e.code === 'KeyK') this.triggerSkillK();
            if (e.code === 'KeyL') this.triggerSkillL();
            if (e.code === 'Semicolon') this.triggerSkillSemi();
        });

        window.addEventListener('keyup', e => {
            if (!this.isActive) return;
            if (this.keys[e.code] !== undefined) {
                this.keys[e.code] = false;
                e.preventDefault();
            }
        });
    },

    startBattle(stageNum = 1) {
        this.stage = Math.max(1, Math.min(10, stageNum));
        this.isActive = true;

        const overlay = document.getElementById('pixel-battle-modal');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }

        this.resizeCanvas();

        // Calculate player stats from equipped gear & pig roster
        const curPig = (typeof gameState !== 'undefined') ? gameState.getActivePig() : null;
        let weaponAtk = 25;
        if (curPig && curPig.equippedWeapon) {
            const w = WEAPONS_CATALOG.find(x => x.id === curPig.equippedWeapon);
            if (w) weaponAtk = w.atkBonus || 25;
        }

        const loopMult = 1 + (this.loop - 1) * 0.85;
        this.player.maxHp = 220 + (curPig ? Math.round(curPig.weight * 12) : 50);
        this.player.hp = this.player.maxHp;
        this.player.atk = weaponAtk;
        this.player.x = 100;
        this.player.y = this.canvas.height * 0.5;
        this.player.vx = 0;
        this.player.vy = 0;

        this.enemies = [];
        this.particles = [];
        this.damageNumbers = [];
        this.spawnStageEnemies();

        this.lastTime = performance.now();
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        this.loopBattle();
    },

    stopBattle() {
        this.isActive = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        const overlay = document.getElementById('pixel-battle-modal');
        if (overlay) {
            overlay.classList.remove('flex');
            overlay.classList.add('hidden');
        }
    },

    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width || 800;
        this.canvas.height = rect.height || 500;
    },

    spawnStageEnemies() {
        const loopScale = 1 + (this.loop - 1) * 0.95;
        const stageDiff = this.stage;

        const enemyNames = [
            ['泥沼跳跳豬', '狂暴沼澤野豬', '泥巴巨酋王'],
            ['枯木小樹精', '荊棘撕裂樹妖', '遠古腐化巨樹靈'],
            ['劇毒酸液史萊姆', '毒針洞穴蝙蝠', '深淵毒尾巨蠍'],
            ['極地雪原幼狼', '狂霜冰暴雪人', '極霜破風巨狼王'],
            ['熔岩地獄小鬼', '赤焰重甲魔像', '炎獄焚天魔神領主'],
            ['天界雷鳴飛鷹', '風暴泰坦魔像', '遠古遺忘泰坦神尊'],
            ['古堡幽影怨靈', '亡骨暗夜死騎', '血夜永生血族大公'],
            ['烈風雙頭巨鳥', '狂嵐風暴奇美拉', '裂天疾風神鷹王'],
            ['深淵黑炎幼龍', '熔心狂暴龍人', '滅世黑炎始祖巨龍'],
            ['虛空幻界收割者', '無面混沌神侍', '創世終焉混沌天尊']
        ];

        const [minionName, eliteName, bossName] = enemyNames[this.stage - 1] || enemyNames[0];

        // 4 Minions
        for (let i = 0; i < 4 + stageDiff; i++) {
            this.enemies.push({
                type: 'MINION',
                name: minionName,
                x: this.canvas.width * 0.5 + Math.random() * (this.canvas.width * 0.4),
                y: 80 + Math.random() * (this.canvas.height - 160),
                width: 32,
                height: 32,
                hp: Math.round((45 + stageDiff * 25) * loopScale),
                maxHp: Math.round((45 + stageDiff * 25) * loopScale),
                atk: Math.round((12 + stageDiff * 4) * loopScale),
                speed: 65 + Math.random() * 25,
                color: '#f97316',
                facing: -1,
                attackCd: Math.random() * 2.0
            });
        }

        // 1 Elite
        this.enemies.push({
            type: 'ELITE',
            name: eliteName,
            x: this.canvas.width * 0.75,
            y: this.canvas.height * 0.5,
            width: 46,
            height: 46,
            hp: Math.round((220 + stageDiff * 80) * loopScale),
            maxHp: Math.round((220 + stageDiff * 80) * loopScale),
            atk: Math.round((28 + stageDiff * 9) * loopScale),
            speed: 80,
            color: '#dc2626',
            facing: -1,
            attackCd: 1.5
        });

        // 1 Epic Stage Boss
        this.boss = {
            type: 'BOSS',
            name: `👑 ${bossName}`,
            x: this.canvas.width * 0.85,
            y: this.canvas.height * 0.5,
            width: 72,
            height: 72,
            hp: Math.round((600 + stageDiff * 350) * loopScale),
            maxHp: Math.round((600 + stageDiff * 350) * loopScale),
            atk: Math.round((45 + stageDiff * 16) * loopScale),
            speed: 55,
            color: '#7c3aed',
            facing: -1,
            attackCd: 2.0,
            specialCd: 5.0
        };
        this.enemies.push(this.boss);
    },

    triggerPlayerAttack() {
        if (this.player.attackCooldown > 0) return;
        this.player.isAttacking = true;
        this.player.comboStep = (this.player.comboStep % 3) + 1;
        this.player.comboTimer = 0.85;
        this.player.attackCooldown = 0.22;

        const p = this.player;
        const attackBox = {
            x: p.facing > 0 ? p.x + p.width * 0.5 : p.x - 48,
            y: p.y - 12,
            width: 60,
            height: 60
        };

        const mult = p.comboStep === 3 ? 2.2 : (p.comboStep === 2 ? 1.4 : 1.0);
        const dmg = Math.round(p.atk * mult * (0.9 + Math.random() * 0.25));

        // Spawn combo visual slash particles
        this.spawnSlashParticle(attackBox.x + 30, attackBox.y + 30, p.facing, p.comboStep);
        this.cameraShake = p.comboStep === 3 ? 8 : 4;

        if (typeof sfx !== 'undefined' && sfx.playSlash) sfx.playSlash();

        // Hit detection on enemies
        this.enemies.forEach(en => {
            if (en.hp <= 0) return;
            if (this.checkAABB(attackBox, en)) {
                this.hitEnemy(en, dmg, p.comboStep === 3);
            }
        });

        this.broadcastCoopAction('ATTACK', { combo: p.comboStep, dmg });
    },

    triggerSkillK() {
        // Skill 1: 旋風突刺 (Dash & Pierce)
        if (this.player.skillCdK > 0) return;
        this.player.skillCdK = 2.5;
        const p = this.player;
        p.vx = p.facing * 420;
        p.invincibleTimer = 0.4;
        this.cameraShake = 6;

        const dmg = Math.round(p.atk * 1.8);
        for (let i = 0; i < 18; i++) {
            this.particles.push({
                x: p.x + (Math.random() - 0.5) * 30,
                y: p.y + (Math.random() - 0.5) * 30,
                vx: -p.facing * (80 + Math.random() * 120),
                vy: (Math.random() - 0.5) * 60,
                color: '#38bdf8',
                size: 5,
                life: 0.35,
                maxLife: 0.35
            });
        }

        this.enemies.forEach(en => {
            if (en.hp <= 0) return;
            if (Math.hypot(en.x - p.x, en.y - p.y) < 95) {
                this.hitEnemy(en, dmg, true);
            }
        });
        if (typeof sfx !== 'undefined' && sfx.playSlash) sfx.playSlash();
    },

    triggerSkillL() {
        // Skill 2: 聖光震地 (Holy Ground Slam)
        if (this.player.skillCdL > 0) return;
        this.player.skillCdL = 5.0;
        this.cameraShake = 12;
        const p = this.player;
        const dmg = Math.round(p.atk * 2.8);

        for (let i = 0; i < 36; i++) {
            const ang = (i / 36) * Math.PI * 2;
            this.particles.push({
                x: p.x + p.width * 0.5,
                y: p.y + p.height * 0.5,
                vx: Math.cos(ang) * 160,
                vy: Math.sin(ang) * 160,
                color: '#facc15',
                size: 6,
                life: 0.5,
                maxLife: 0.5
            });
        }

        this.enemies.forEach(en => {
            if (en.hp <= 0) return;
            if (Math.hypot(en.x - p.x, en.y - p.y) < 140) {
                this.hitEnemy(en, dmg, true);
            }
        });
        if (typeof sfx !== 'undefined' && sfx.playHit) sfx.playHit();
    },

    triggerSkillSemi() {
        // Skill 3: 終焉流星天降 (Meteor Shower Ultimate)
        if (this.player.skillCdSemi > 0) return;
        this.player.skillCdSemi = 10.0;
        this.cameraShake = 18;
        const dmg = Math.round(p => p.atk * 4.5)(this.player);

        for (let k = 0; k < 6; k++) {
            setTimeout(() => {
                const rx = 80 + Math.random() * (this.canvas.width - 160);
                const ry = 80 + Math.random() * (this.canvas.height - 160);
                for (let i = 0; i < 28; i++) {
                    const ang = Math.random() * Math.PI * 2;
                    this.particles.push({
                        x: rx,
                        y: ry,
                        vx: Math.cos(ang) * (80 + Math.random() * 180),
                        vy: Math.sin(ang) * (80 + Math.random() * 180),
                        color: '#f43f5e',
                        size: 7,
                        life: 0.6,
                        maxLife: 0.6
                    });
                }
                this.enemies.forEach(en => {
                    if (en.hp <= 0) return;
                    if (Math.hypot(en.x - rx, en.y - ry) < 110) {
                        this.hitEnemy(en, Math.round(this.player.atk * 1.5), true);
                    }
                });
            }, k * 180);
        }
    },

    hitEnemy(en, dmg, isCrit = false) {
        en.hp -= dmg;
        this.score += dmg;

        // Knockback
        const dir = this.player.facing;
        en.x += dir * (isCrit ? 35 : 18);

        this.damageNumbers.push({
            x: en.x + (Math.random() - 0.5) * 20,
            y: en.y - 12,
            text: isCrit ? `CRIT! -${dmg}` : `-${dmg}`,
            color: isCrit ? '#facc15' : '#ffffff',
            life: 0.8,
            maxLife: 0.8
        });

        if (en.hp <= 0) {
            this.killEnemy(en);
        }
    },

    killEnemy(en) {
        const dropCoins = en.type === 'BOSS' ? 250 * this.stage * this.loop : (en.type === 'ELITE' ? 60 * this.loop : 12 * this.loop);
        this.coinsEarned += dropCoins;
        if (typeof gameState !== 'undefined') {
            gameState.coins += dropCoins;
        }

        // Particle explosion
        for (let i = 0; i < 24; i++) {
            const ang = Math.random() * Math.PI * 2;
            this.particles.push({
                x: en.x,
                y: en.y,
                vx: Math.cos(ang) * (60 + Math.random() * 140),
                vy: Math.sin(ang) * (60 + Math.random() * 140),
                color: en.type === 'BOSS' ? '#fbbf24' : '#f97316',
                size: 6,
                life: 0.7,
                maxLife: 0.7
            });
        }

        // Check stage clear if Boss is defeated
        if (en.type === 'BOSS') {
            this.onStageCleared();
        }
    },

    onStageCleared() {
        this.cameraShake = 22;
        if (typeof sfx !== 'undefined' && sfx.playVictoryFanfare) sfx.playVictoryFanfare();

        setTimeout(() => {
            if (this.stage < 10) {
                this.stage++;
                this.spawnStageEnemies();
            } else {
                // Clear 10 stages -> Trigger NG+ (二周目)
                this.loop++;
                this.stage = 1;
                this.spawnStageEnemies();
                alert(`🎉 恭喜通關全部 10 大關卡！\n已正式開啟【第 ${this.loop} 周目】全新輪迴！\n敵人血量、攻擊力與通關賞金已全面升級！`);
            }
        }, 1600);
    },

    spawnSlashParticle(x, y, facing, step) {
        for (let i = 0; i < 14; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: facing * (120 + Math.random() * 140),
                vy: (Math.random() - 0.5) * 80,
                color: step === 3 ? '#ec4899' : (step === 2 ? '#38bdf8' : '#ffffff'),
                size: 4 + Math.random() * 4,
                life: 0.28,
                maxLife: 0.28
            });
        }
    },

    checkAABB(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    },

    loopBattle() {
        if (!this.isActive) return;
        const now = performance.now();
        const dt = Math.min(0.08, (now - this.lastTime) / 1000);
        this.lastTime = now;

        this.update(dt);
        this.render();

        this.animFrameId = requestAnimationFrame(() => this.loopBattle());
    },

    update(dt) {
        const p = this.player;

        // Player movement
        let moveX = 0, moveY = 0;
        if (this.keys.KeyA) moveX -= 1;
        if (this.keys.KeyD) moveX += 1;
        if (this.keys.KeyW) moveY -= 1;
        if (this.keys.KeyS) moveY += 1;

        if (moveX !== 0 || moveY !== 0) {
            const len = Math.hypot(moveX, moveY);
            p.vx = THREE.MathUtils.lerp(p.vx, (moveX / len) * p.speed, Math.min(1, dt * 14));
            p.vy = THREE.MathUtils.lerp(p.vy, (moveY / len) * p.speed, Math.min(1, dt * 14));
            if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;
        } else {
            p.vx = THREE.MathUtils.lerp(p.vx, 0, Math.min(1, dt * 12));
            p.vy = THREE.MathUtils.lerp(p.vy, 0, Math.min(1, dt * 12));
        }

        p.x = Math.max(20, Math.min(this.canvas.width - p.width - 20, p.x + p.vx * dt));
        p.y = Math.max(50, Math.min(this.canvas.height - p.height - 30, p.y + p.vy * dt));

        // Timers
        if (p.attackCooldown > 0) p.attackCooldown -= dt;
        if (p.comboTimer > 0) {
            p.comboTimer -= dt;
            if (p.comboTimer <= 0) p.comboStep = 0;
        }
        if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
        if (p.skillCdK > 0) p.skillCdK -= dt;
        if (p.skillCdL > 0) p.skillCdL -= dt;
        if (p.skillCdSemi > 0) p.skillCdSemi -= dt;

        // Update enemies
        this.enemies.forEach(en => {
            if (en.hp <= 0) return;
            const dx = p.x - en.x;
            const dy = p.y - en.y;
            const dist = Math.hypot(dx, dy);

            en.facing = dx > 0 ? 1 : -1;

            if (dist > 35) {
                en.x += (dx / dist) * en.speed * dt;
                en.y += (dy / dist) * en.speed * dt;
            } else {
                // Attack player
                en.attackCd -= dt;
                if (en.attackCd <= 0 && p.invincibleTimer <= 0) {
                    en.attackCd = en.type === 'BOSS' ? 1.8 : 2.2;
                    p.hp -= en.atk;
                    p.invincibleTimer = 0.5;
                    this.cameraShake = 9;
                    this.damageNumbers.push({
                        x: p.x,
                        y: p.y - 15,
                        text: `-${en.atk}`,
                        color: '#ef4444',
                        life: 0.8,
                        maxLife: 0.8
                    });
                    if (typeof sfx !== 'undefined' && sfx.playHit) sfx.playHit();
                    if (p.hp <= 0) {
                        alert('小豬體力耗盡！關卡冒險失敗，回程整備中。');
                        this.stopBattle();
                    }
                }
            }
        });

        // Filter dead enemies
        this.enemies = this.enemies.filter(en => en.hp > 0);

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.life -= dt;
            if (pt.life <= 0) this.particles.splice(i, 1);
        }

        // Update damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dn = this.damageNumbers[i];
            dn.y -= dt * 38;
            dn.life -= dt;
            if (dn.life <= 0) this.damageNumbers.splice(i, 1);
        }

        // Camera shake decay
        if (this.cameraShake > 0) {
            this.cameraShake = Math.max(0, this.cameraShake - dt * 25);
        }
    },

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.save();
        if (this.cameraShake > 0) {
            const sx = (Math.random() - 0.5) * this.cameraShake;
            const sy = (Math.random() - 0.5) * this.cameraShake;
            ctx.translate(sx, sy);
        }

        // Retro Pixel Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Ground Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Render Enemies
        this.enemies.forEach(en => {
            ctx.fillStyle = en.color;
            ctx.fillRect(en.x, en.y, en.width, en.height);

            // Eyes
            ctx.fillStyle = '#ffffff';
            const eyeX = en.facing > 0 ? en.x + en.width * 0.65 : en.x + en.width * 0.15;
            ctx.fillRect(eyeX, en.y + en.height * 0.25, en.width * 0.2, en.height * 0.2);

            // HP Bar
            const hpRatio = Math.max(0, en.hp / en.maxHp);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(en.x, en.y - 12, en.width, 6);
            ctx.fillStyle = en.type === 'BOSS' ? '#f59e0b' : '#ef4444';
            ctx.fillRect(en.x, en.y - 12, en.width * hpRatio, 6);

            // Name
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(en.name, en.x, en.y - 16);
        });

        // Render Player (Chibi Pink Piggy)
        const p = this.player;
        ctx.fillStyle = p.invincibleTimer > 0 && Math.floor(performance.now() / 80) % 2 === 0 ? '#ffffff' : '#f472b6';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 12);
        ctx.fill();

        // Pig Snout
        ctx.fillStyle = '#fb7185';
        const snoutX = p.facing > 0 ? p.x + p.width * 0.55 : p.x + 4;
        ctx.beginPath();
        ctx.roundRect(snoutX, p.y + p.height * 0.35, p.width * 0.42, p.height * 0.32, 6);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#1e293b';
        const eyePx = p.facing > 0 ? p.x + p.width * 0.6 : p.x + p.width * 0.2;
        ctx.fillRect(eyePx, p.y + p.height * 0.2, 5, 5);

        // Player HP Bar
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(p.x, p.y - 14, p.width, 5);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(p.x, p.y - 14, p.width * (p.hp / p.maxHp), 5);

        // Render Particles
        this.particles.forEach(pt => {
            const alpha = pt.life / pt.maxLife;
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
            ctx.globalAlpha = 1.0;
        });

        // Render Damage Numbers
        ctx.font = 'bold 16px sans-serif';
        this.damageNumbers.forEach(dn => {
            ctx.fillStyle = dn.color;
            ctx.fillText(dn.text, dn.x, dn.y);
        });

        ctx.restore();

        // Render HUD Info Overlays
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`關卡：第 ${this.stage} 關（第 ${this.loop} 周目） | 金幣收穫：+${this.coinsEarned}`, 20, 28);

        // Skill Icons HUD
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = this.player.skillCdK <= 0 ? '#38bdf8' : '#64748b';
        ctx.fillText(`[K] 突刺 ${this.player.skillCdK > 0 ? this.player.skillCdK.toFixed(1) + 's' : '就緒'}`, w - 240, 28);
        ctx.fillStyle = this.player.skillCdL <= 0 ? '#facc15' : '#64748b';
        ctx.fillText(`[L] 震地 ${this.player.skillCdL > 0 ? this.player.skillCdL.toFixed(1) + 's' : '就緒'}`, w - 160, 28);
        ctx.fillStyle = this.player.skillCdSemi <= 0 ? '#f43f5e' : '#64748b';
        ctx.fillText(`[;] 奧義 ${this.player.skillCdSemi > 0 ? this.player.skillCdSemi.toFixed(1) + 's' : '就緒'}`, w - 80, 28);
    },

    broadcastCoopAction(type, data) {
        if (typeof MultiplayerSync !== 'undefined' && MultiplayerSync.roomSubscription) {
            try {
                MultiplayerSync.roomSubscription.send({
                    type: 'broadcast',
                    event: 'PIXEL_COOP_ACTION',
                    payload: {
                        sender: MultiplayerSync.getPlayerName(),
                        action: type,
                        stage: this.stage,
                        loop: this.loop,
                        data
                    }
                });
            } catch (e) {}
        }
    }
};

if (typeof window !== 'undefined') window.PixelBattle = PixelBattle;
