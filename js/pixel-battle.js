/**
 * 3D Royal Piggy Farm - 2D Pixel-Style Action Boss Battle Minigame
 * Module: js/pixel-battle.js
 * 50-Stage Roguelike Pixel Brawler with Image Sprite Sheets & Multi-Pig Squad Trailing
 */

// ============================================================================
// 1. 10 大世界主題與 50 關卡完整資料庫
// ============================================================================
const WORLD_THEMES = [
    { world: 1, name: '櫻花蘋果牧場', icon: '🌸', skyTop: '#1e1b38', skyBot: '#3b2447', groundTop: '#4ade80', groundBot: '#3f2e21', accent: '#f472b6',
      minions: ['粉紅史萊姆', '橡果小妖', '野莓毛毛蟲', '牧場小地鼠', '甜蘋果精靈'],
      elites: ['黃金史萊姆隊長', '重甲橡果衛兵', '狂暴巨角甲蟲', '地底鑽頭鼠王', '蜜糖蘋果騎士'],
      bosses: ['巨型櫻花樹妖王', '黃金蜂后瑪格麗特', '百果叢林巨獸', '暴走風車機械人', '牧場霸主・金剛野豬王'] },
    { world: 2, name: '迷霧蘑菇森林', icon: '🍄', skyTop: '#112233', skyBot: '#1e3a3a', groundTop: '#2dd4bf', groundBot: '#1f2937', accent: '#34d399',
      minions: ['毒孢子小菇', '迷霧樹精', '森林哥布林', '夜行毒蜘蛛', '藤蔓食人花'],
      elites: ['紫晶劇毒菇王', '千年枯木長老', '哥布林狼騎兵', '八眼捕鳥巨蛛', '荊棘狂暴花妖'],
      bosses: ['幻影蘑菇大帝', '迷霧森林古樹神', '哥布林大酋長格魯', '暗夜蛛后拉克絲', '深林九頭魔花'] },
    { world: 3, name: '翡翠史萊姆沼澤', icon: '🧪', skyTop: '#0f291e', skyBot: '#1a3f29', groundTop: '#84cc16', groundBot: '#27272a', accent: '#a3e635',
      minions: ['酸液史萊姆', '沼澤毒蛙', '泥漿軟泥怪', '腐木鱷魚人', '劇毒飛蚊'],
      elites: ['巨型酸液吞噬者', '劇毒雙頭魔蛙', '硬化黑泥巨怪', '鐵顎狂暴巨鱷', '瘟疫血蚊女王'],
      bosses: ['翡翠鍊金史萊姆皇', '沼澤巨獸利維坦', '劇毒巫醫薩滿王', '深淵腐蝕巨龍', '萬毒之源・厄瑞玻斯'] },
    { world: 4, name: '黃金沙塵遺跡', icon: '🏜️', skyTop: '#2a1b12', skyBot: '#5c3a21', groundTop: '#fbbf24', groundBot: '#78350f', accent: '#f59e0b',
      minions: ['沙漠毒蠍', '木乃伊戰士', '流沙仙人掌', '遺跡石像鬼', '黃金聖甲蟲'],
      elites: ['赤紅帝王巨蠍', '法老皇家衛隊', '狂暴針刺仙人掌', '黑曜石守墓巨人', '鑽石聖甲蟲統領'],
      bosses: ['黃金蠍王阿努比', '不朽法老王圖坦', '沙漠風暴魔神', '太陽神殿巨像', '黃金金字塔主宰'] },
    { world: 5, name: '幽暗骸骨地牢', icon: '💀', skyTop: '#13111c', skyBot: '#271a38', groundTop: '#64748b', groundBot: '#1e1b2e', accent: '#a855f7',
      minions: ['骷髏步兵', '幽靈鬼火', '吸血鬼蝙蝠', '地牢鐵處女', '死靈法師學徒'],
      elites: ['重裝黑騎士骷髏', '噬魂雙刃怨靈', '鮮血貴族夜魔', '詛咒鎧甲執行官', '暗黑死靈導師'],
      bosses: ['骸骨暴君李奧瑞克', '幽冥死神鐮刀王', '真祖吸血鬼伯爵', '深淵縫合憎惡巨怪', '亡靈天災大巫妖'] },
    { world: 6, name: '熔岩紅蓮火山', icon: '🌋', skyTop: '#2b0909', skyBot: '#5c140e', groundTop: '#ef4444', groundBot: '#3b0707', accent: '#f97316',
      minions: ['火焰小鬼', '熔岩寄居蟹', '火山灰蜥蜴', '赤紅火元素', '黑曜石魔犬'],
      elites: ['烈焰爆破惡魔', '紅蓮重甲巨蟹', '雙頭噴火巨蜥', '高熱電漿火靈', '地獄三頭魔犬'],
      bosses: ['熔岩巨人拉格納', '紅蓮火鳳凰不死鳥', '火山暴龍帝王', '煉獄炎魔巴洛格', '毀滅紅龍伊格尼斯'] },
    { world: 7, name: '極光冰晶雪原', icon: '❄️', skyTop: '#0c192c', skyBot: '#163b5c', groundTop: '#38bdf8', groundBot: '#1e293b', accent: '#06b6d4',
      minions: ['雪球小精靈', '冰原白狼', '寒冰企鵝兵', '冰晶魔像', '凍土雪人'],
      elites: ['暴風雪巫女', '極光銀牙狼王', '皇家帝企鵝將軍', '永凍鑽石巨像', '狂暴巨型雪怪'],
      bosses: ['極光冰雪女王艾莎拉', '千年冰封猛獁象王', '北境冰霜泰坦', '極寒冰晶聖龍', '永冬深淵主宰'] },
    { world: 8, name: '蒸氣齒輪要塞', icon: '⚙️', skyTop: '#18181b', skyBot: '#27272a', groundTop: '#a1a1aa', groundBot: '#18181b', accent: '#eab308',
      minions: ['發條偵察兵', '蒸氣自爆蜘蛛', '齒輪飛天無人機', '鋼鐵警衛犬', '電弧工程師'],
      elites: ['重砲蒸氣坦克兵', '高壓電漿機械蠍', '鐳射殲滅者機甲', '合金裝甲戰狼', '磁暴科學怪人'],
      bosses: ['蒸氣巨神兵オメガ', '齒輪要塞核心母艦', '重武裝機械暴龍', '超電磁毀滅機神', '鋼鐵帝國總司令'] },
    { world: 9, name: '星輝浮空神殿', icon: '✨', skyTop: '#1e1b4b', skyBot: '#312e81', groundTop: '#facc15', groundBot: '#312e81', accent: '#fde047',
      minions: ['星光小天使', '天界羽翼衛士', '浮空魔導書', '白銀獨角獸', '雷雲精靈'],
      elites: ['聖堂十字軍統領', '熾天六翼神官', '禁忌奧術大法師', '破曉黃金天馬', '風暴雷神使者'],
      bosses: ['星輝大天使米迦勒', '太陽神阿波羅幻影', '星界奧術大賢者', '天空神殿守護神龍', '黃道十二宮星神王'] },
    { world: 10, name: '虛空終焉深淵', icon: '🌌', skyTop: '#090514', skyBot: '#1e0b36', groundTop: '#c084fc', groundBot: '#090514', accent: '#e879f9',
      minions: ['虛空觸手怪', '次元撕裂者', '混沌暗影兵', '星蝕寄生蟲', '深淵魔眼'],
      elites: ['虛空行者卡薩', '次元空間獵殺者', '混沌黑洞騎士', '吞星巨型魔蟲', '百眼全視審判者'],
      bosses: ['虛空恐懼大君', '次元裂隙主宰', '混沌毀滅龍皇', '終焉墮落神使', '第50關最終大魔王・混沌萬象豬魔神'] }
];

const STAGE_CATALOG = [];
for (let s = 1; s <= 50; s++) {
    const wIdx = Math.floor((s - 1) / 5);
    const subIdx = (s - 1) % 5;
    const theme = WORLD_THEMES[wIdx];
    const scaleHp = Math.round(70 * Math.pow(1.075, s - 1));
    const scaleAtk = Math.round(7 + s * 2.2);

    STAGE_CATALOG.push({
        stage: s,
        world: theme.world,
        worldName: theme.name,
        worldIcon: theme.icon,
        stageTitle: `第 ${s} 關：${theme.name} (${subIdx + 1}/5)`,
        skyTop: theme.skyTop,
        skyBot: theme.skyBot,
        groundTop: theme.groundTop,
        groundBot: theme.groundBot,
        accent: theme.accent,
        minion: {
            name: theme.minions[subIdx],
            stage: s,
            world: theme.world,
            subIdx,
            hp: scaleHp,
            atk: scaleAtk,
            speed: 65 + (s % 4) * 8,
            color: theme.accent
        },
        elite: {
            name: theme.elites[subIdx],
            stage: s,
            world: theme.world,
            subIdx,
            hp: Math.round(scaleHp * 3.2),
            atk: Math.round(scaleAtk * 1.65),
            speed: 75 + (s % 3) * 6,
            skillName: ['狂暴鐵騎衝鋒', '三連毀滅魔彈', '深淵震地裂擊', '暗影瞬步連斬', '黃金聖盾反擊'][subIdx],
            color: theme.accent
        },
        boss: {
            name: theme.bosses[subIdx],
            stage: s,
            world: theme.world,
            subIdx,
            hp: Math.round(scaleHp * 9.5),
            atk: Math.round(scaleAtk * 2.4),
            speed: 55,
            skillName: ['全屏彈幕風暴', '毀滅雷射掃射', '隕石地裂崩塌', '禁衛軍團召喚', '終焉狂暴領域'][subIdx],
            color: theme.accent
        }
    });
}

// ============================================================================
// 2. PixelBattle 主控制器
// ============================================================================
const PixelBattle = {
    canvas: null,
    ctx: null,
    isActive: false,
    animFrameId: null,
    lastTime: 0,
    animTime: 0,

    stage: 1,
    currentWave: 1, // 1: Minions, 2: Minions + Elite, 3: Boss Wave
    maxWave: 3,
    score: 0,
    coinsEarned: 0,

    // Image Spritesheets
    monstersImg: null,
    pigSheetImg: null,
    iconsImg: null,
    assetsLoaded: false,

    player: {
        x: 120,
        y: 280,
        vx: 0,
        vy: 0,
        speed: 210,
        width: 44,
        height: 44,
        facing: 1,
        hp: 250,
        maxHp: 250,
        atk: 25,
        comboStep: 0,
        comboTimer: 0,
        attackCooldown: 0,
        isAttacking: false,
        attackAnimTimer: 0,
        invincibleTimer: 0,
        // Dash / Pierce Skill [K]
        skillCdK: 0,
        dashTimer: 0,
        // Ground Slam Skill [L]
        skillCdL: 0,
        slamTimer: 0,
        // Ultimate Stampede Skill [;]
        skillCdSemi: 0,
        stampedeTimer: 0,
        state: 'idle'
    },

    // Companion pigs trail queue
    trailQueue: [],

    keys: {
        KeyW: false, KeyS: false, KeyA: false, KeyD: false,
        KeyJ: false, KeyK: false, KeyL: false, Semicolon: false
    },

    enemies: [],
    particles: [],
    damageNumbers: [],
    shockwaves: [],
    stampedePigs: [],
    slashes: [],
    cameraShake: 0,

    isVictory: false,
    isDefeat: false,
    victoryTimer: 0,

    init() {
        this.canvas = document.getElementById('pixel-battle-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.preloadAssets();
        this.populateStageSelectDropdown();
        this.bindInputEvents();
    },

    preloadAssets() {
        if (this.assetsLoaded) return;
        const resolveUrl = (path) => {
            try {
                let base = window.location.origin + window.location.pathname;
                if (!base.endsWith('/')) {
                    if (base.match(/\.[a-zA-Z0-9]+$/)) {
                        base = base.substring(0, base.lastIndexOf('/') + 1);
                    } else {
                        base += '/';
                    }
                }
                return base + path;
            } catch (e) {
                return path;
            }
        };

        this.monstersImg = new Image();
        this.monstersImg.src = resolveUrl('pixel_pig_game_assets_pack/monsters_50stages_sheet.png');

        this.pigSheetImg = new Image();
        this.pigSheetImg.src = resolveUrl('pixel_pig_game_assets_pack/pig_spritesheet_6states.png');

        this.iconsImg = new Image();
        this.iconsImg.src = resolveUrl('pixel_pig_game_assets_pack/weapons_skills_40_icons.png');

        let loadedCount = 0;
        const checkDone = () => {
            loadedCount++;
            if (loadedCount >= 2) {
                this.assetsLoaded = true;
                console.log('[PixelBattle] 50關卡怪獸圖集與小豬SpriteSheets載入成功');
            }
        };
        this.monstersImg.onload = checkDone;
        this.pigSheetImg.onload = checkDone;
        this.monstersImg.onerror = () => console.warn('[PixelBattle] monsters_50stages_sheet.png 載入失敗，啟用程序化備援');
        this.pigSheetImg.onerror = () => console.warn('[PixelBattle] pig_spritesheet_6states.png 載入失敗，啟用程序化備援');
    },

    populateStageSelectDropdown() {
        const select = document.getElementById('pixel-stage-select');
        if (!select) return;
        select.innerHTML = '';
        STAGE_CATALOG.forEach(st => {
            const opt = document.createElement('option');
            opt.value = st.stage;
            opt.textContent = `${st.worldIcon} 第 ${st.stage} 關：${st.worldName} (${st.boss.name})`;
            select.appendChild(opt);
        });
        select.value = this.stage;
    },

    changeStage(newStageNum) {
        this.stage = Math.max(1, Math.min(50, newStageNum || 1));
        const select = document.getElementById('pixel-stage-select');
        if (select) select.value = this.stage;
        this.startBattle(this.stage);
    },

    bindInputEvents() {
        window.addEventListener('keydown', e => {
            if (!this.isActive) return;
            const tag = (e.target && e.target.tagName) ? e.target.tagName : '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            if (this.keys[e.code] !== undefined) {
                this.keys[e.code] = true;
                e.preventDefault();
            }
            if (e.code === 'KeyJ') { e.preventDefault(); this.triggerPlayerAttack(); }
            if (e.code === 'KeyK') { e.preventDefault(); this.triggerSkillK(); }
            if (e.code === 'KeyL') { e.preventDefault(); this.triggerSkillL(); }
            if (e.code === 'Semicolon') { e.preventDefault(); this.triggerSkillSemi(); }
        });

        window.addEventListener('keyup', e => {
            if (!this.isActive) return;
            if (this.keys[e.code] !== undefined) {
                this.keys[e.code] = false;
                e.preventDefault();
            }
        });

        window.addEventListener('resize', () => {
            if (this.isActive) this.resizeCanvas();
        });
    },

    enter() {
        this.startBattle(this.stage || 1);
    },

    exit() {
        this.stopBattle();
    },

    startBattle(stageNum = 1) {
        if (!this.canvas) {
            this.init();
        }
        this.stage = Math.max(1, Math.min(50, stageNum));
        this.currentWave = 1;
        this.isActive = true;
        this.isVictory = false;
        this.isDefeat = false;
        this.victoryTimer = 0;

        const overlay = document.getElementById('pixel-battle-modal');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }

        const select = document.getElementById('pixel-stage-select');
        if (select) select.value = this.stage;

        this.resizeCanvas();
        if (!this.canvas) return;

        // Calculate player stats based on active pig & inventory
        const curPig = (typeof gameState !== 'undefined') ? gameState.getActivePig() : null;
        let weaponAtk = 30;
        const catalog = (typeof WEAPONS_CATALOG !== 'undefined') ? WEAPONS_CATALOG : (window.WEAPONS_CATALOG || []);
        if (curPig && curPig.equippedWeapon) {
            const w = catalog.find(x => x.id === curPig.equippedWeapon);
            if (w) weaponAtk = w.atkBonus || 30;
        }

        const wt = (curPig && curPig.weight) ? Number(curPig.weight) : 15;
        this.player.maxHp = Math.round(280 + wt * 15);
        this.player.hp = this.player.maxHp;
        this.player.atk = weaponAtk + Math.round(wt * 0.8);
        this.player.x = 80;
        this.player.y = this.canvas.height * 0.55;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.invincibleTimer = 0;
        this.player.skillCdK = 0;
        this.player.skillCdL = 0;
        this.player.skillCdSemi = 0;
        this.player.dashTimer = 0;
        this.player.slamTimer = 0;
        this.player.stampedeTimer = 0;

        this.trailQueue = [];
        this.enemies = [];
        this.particles = [];
        this.damageNumbers = [];
        this.shockwaves = [];
        this.stampedePigs = [];
        this.slashes = [];

        this.spawnWave(this.currentWave);

        this.lastTime = performance.now();
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        this.loopBattle();
    },

    stopBattle() {
        this.isActive = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        const overlay = document.getElementById('pixel-battle-modal');
        if (overlay) {
            overlay.classList.remove('flex');
            overlay.classList.add('hidden');
        }
    },

    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : null;
        this.canvas.width = (rect && rect.width > 0) ? Math.floor(rect.width) : (window.innerWidth || 800);
        this.canvas.height = (rect && rect.height > 0) ? Math.floor(rect.height) : (window.innerHeight ? Math.floor(window.innerHeight * 0.7) : 520);
    },

    getCurrentStageData() {
        return STAGE_CATALOG[this.stage - 1] || STAGE_CATALOG[0];
    },

    spawnWave(waveNum) {
        this.enemies = [];
        const st = this.getCurrentStageData();
        const cw = this.canvas ? this.canvas.width : 800;
        const ch = this.canvas ? this.canvas.height : 520;
        const spawnXBase = cw * 0.65;

        if (waveNum === 1) {
            // Wave 1: 3 Minions
            const count = 3 + (this.stage > 25 ? 1 : 0);
            for (let i = 0; i < count; i++) {
                this.enemies.push({
                    type: 'MINION',
                    tier: 'minion',
                    world: st.world,
                    name: st.minion.name,
                    x: spawnXBase + (i % 2) * 50 + Math.random() * 80,
                    y: 90 + ((i + 1) / (count + 1)) * (ch - 180) + (Math.random() - 0.5) * 30,
                    width: 36,
                    height: 36,
                    hp: st.minion.hp,
                    maxHp: st.minion.hp,
                    atk: st.minion.atk,
                    speed: st.minion.speed,
                    color: st.accent,
                    facing: -1,
                    attackCd: 1.0 + Math.random() * 1.5,
                    hitFlash: 0,
                    seed: Math.random() * 10
                });
            }
        } else if (waveNum === 2) {
            // Wave 2: 2 Minions + 1 Elite
            for (let i = 0; i < 2; i++) {
                this.enemies.push({
                    type: 'MINION',
                    tier: 'minion',
                    world: st.world,
                    name: st.minion.name,
                    x: spawnXBase + (Math.random() - 0.5) * 60,
                    y: 100 + i * (ch - 240) + 40,
                    width: 36,
                    height: 36,
                    hp: st.minion.hp,
                    maxHp: st.minion.hp,
                    atk: st.minion.atk,
                    speed: st.minion.speed,
                    color: st.accent,
                    facing: -1,
                    attackCd: 1.0 + Math.random(),
                    hitFlash: 0,
                    seed: Math.random() * 10
                });
            }
            this.enemies.push({
                type: 'ELITE',
                tier: 'elite',
                world: st.world,
                name: st.elite.name,
                x: spawnXBase + 70,
                y: ch * 0.5 - 24,
                width: 48,
                height: 48,
                hp: st.elite.hp,
                maxHp: st.elite.hp,
                atk: st.elite.atk,
                speed: st.elite.speed,
                skillName: st.elite.skillName,
                color: '#fbbf24',
                facing: -1,
                attackCd: 1.8,
                skillCd: 3.5,
                hitFlash: 0,
                seed: Math.random() * 10
            });
        } else if (waveNum === 3) {
            // Wave 3: The Stage Boss + 2 Minion escorts
            for (let i = 0; i < 2; i++) {
                this.enemies.push({
                    type: 'MINION',
                    tier: 'minion',
                    world: st.world,
                    name: st.minion.name,
                    x: spawnXBase - 40,
                    y: 110 + i * (ch - 240) + 30,
                    width: 36,
                    height: 36,
                    hp: Math.round(st.minion.hp * 1.2),
                    maxHp: Math.round(st.minion.hp * 1.2),
                    atk: st.minion.atk,
                    speed: st.minion.speed,
                    color: st.accent,
                    facing: -1,
                    attackCd: 1.2,
                    hitFlash: 0,
                    seed: Math.random() * 10
                });
            }
            this.enemies.push({
                type: 'BOSS',
                tier: 'boss',
                world: st.world,
                name: st.boss.name,
                x: spawnXBase + 80,
                y: ch * 0.5 - 34,
                width: 68,
                height: 68,
                hp: st.boss.hp,
                maxHp: st.boss.hp,
                atk: st.boss.atk,
                speed: st.boss.speed,
                skillName: st.boss.skillName,
                color: '#f43f5e',
                facing: -1,
                attackCd: 2.2,
                skillCd: 4.2,
                enraged: false,
                hitFlash: 0,
                seed: Math.random() * 10
            });
            this.cameraShake = 12;
            this.spawnFloatingText(`⚠️ BOSS 出現：${st.boss.name}！`, cw * 0.5, 110, '#f43f5e', 22);
        }
    },

    triggerPlayerAttack() {
        if (!this.isActive || this.player.attackCooldown > 0) return;
        const p = this.player;
        p.isAttacking = true;
        p.attackAnimTimer = 0.28;
        p.comboStep = (p.comboStep % 3) + 1;
        p.comboTimer = 0.9;
        p.attackCooldown = 0.22;

        const mult = p.comboStep === 1 ? 1.0 : (p.comboStep === 2 ? 1.3 : 2.0);
        const dmg = Math.round(p.atk * mult);

        // Slash Arc FX
        const slashX = p.facing > 0 ? p.x + p.width * 0.7 : p.x - 30;
        this.slashes.push({
            x: slashX,
            y: p.y - 10,
            facing: p.facing,
            step: p.comboStep,
            life: 0.22,
            maxLife: 0.22
        });

        // Attack hit box detection
        const hitBox = {
            x: p.facing > 0 ? p.x + 10 : p.x - 65,
            y: p.y - 20,
            width: 85,
            height: p.height + 40
        };

        this.applyHitBoxDamage(hitBox, dmg, false, p.facing * (p.comboStep === 3 ? 120 : 60));
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(p.comboStep === 3 ? 620 : 440);
    },

    triggerSkillK() {
        // [K] 狂暴突刺 (Dash & Pierce)
        if (!this.isActive || this.player.skillCdK > 0) return;
        const p = this.player;
        p.skillCdK = 3.8;
        p.dashTimer = 0.32;
        p.invincibleTimer = 0.45;
        p.vx = p.facing * 520;
        this.cameraShake = 7;

        const dmg = Math.round(p.atk * 2.6);
        const hitBox = {
            x: p.facing > 0 ? p.x : p.x - 140,
            y: p.y - 15,
            width: 170,
            height: p.height + 30
        };
        this.applyHitBoxDamage(hitBox, dmg, true, p.facing * 140);
        this.spawnSparks(p.x + p.width * 0.5, p.y + p.height * 0.5, '#38bdf8', 16);
        if (typeof sfx !== 'undefined' && sfx.playChime) sfx.playChime();
    },

    triggerSkillL() {
        // [L] 巨力震地 (Ground Slam)
        if (!this.isActive || this.player.skillCdL > 0) return;
        const p = this.player;
        p.skillCdL = 5.0;
        p.slamTimer = 0.4;
        p.vy = -180;
        this.cameraShake = 14;

        this.shockwaves.push({
            x: p.x + p.width * 0.5,
            y: p.y + p.height * 0.8,
            radius: 12,
            maxRadius: 135,
            life: 0.42,
            maxLife: 0.42
        });

        const dmg = Math.round(p.atk * 3.2);
        const hitBox = {
            x: p.x - 90,
            y: p.y - 60,
            width: 220,
            height: 140
        };
        this.applyHitBoxDamage(hitBox, dmg, true, p.facing * 80);
        this.spawnSparks(p.x + p.width * 0.5, p.y + p.height * 0.5, '#facc15', 22);
    },

    triggerSkillSemi() {
        // [;] 奧義・小豬大軍總進擊 (Ultimate Stampede)
        if (!this.isActive || this.player.skillCdSemi > 0) return;
        const p = this.player;
        p.skillCdSemi = 12.0;
        p.stampedeTimer = 2.4;
        this.cameraShake = 18;

        const cw = this.canvas ? this.canvas.width : 800;
        const ch = this.canvas ? this.canvas.height : 520;

        // Summon 8 running pixel pigs
        for (let i = 0; i < 8; i++) {
            this.stampedePigs.push({
                x: -60 - i * 45,
                y: 80 + (i / 8) * (ch - 160) + (Math.random() - 0.5) * 35,
                vx: 420 + Math.random() * 80,
                color: ['#f472b6', '#fbbf24', '#38bdf8', '#34d399', '#c084fc'][i % 5],
                scale: 0.8 + Math.random() * 0.35,
                hitCd: 0
            });
        }

        this.spawnFloatingText('⚔️ 奧義・小豬大軍總進擊！', cw * 0.5, ch * 0.35, '#ec4899', 24);
        if (typeof sfx !== 'undefined' && sfx.playVictoryFanfare) sfx.playVictoryFanfare();
    },

    applyHitBoxDamage(hitBox, damage, isHeavy = false, knockbackX = 0) {
        this.enemies.forEach(en => {
            if (en.hp <= 0) return;
            if (this.checkAABB(hitBox, en)) {
                en.hp -= damage;
                en.hitFlash = 0.18;
                en.x += knockbackX;

                this.spawnFloatingText(`-${damage}${isHeavy ? '!' : ''}`, en.x + en.width * 0.5, en.y - 12, isHeavy ? '#fbbf24' : '#ffffff', isHeavy ? 18 : 14);
                this.spawnSparks(en.x + en.width * 0.5, en.y + en.height * 0.5, isHeavy ? '#f59e0b' : '#f43f5e', isHeavy ? 10 : 5);

                if (en.hp <= 0) {
                    this.onEnemyKilled(en);
                }
            }
        });
    },

    onEnemyKilled(en) {
        const reward = en.type === 'BOSS' ? 250 : (en.type === 'ELITE' ? 90 : 30);
        this.coinsEarned += reward;
        this.score += reward * 2;

        if (typeof gameState !== 'undefined') {
            gameState.coins += reward;
        }

        this.spawnFloatingText(`+${reward} 金幣`, en.x, en.y, '#facc15', 16);
        this.spawnSparks(en.x + en.width * 0.5, en.y + en.height * 0.5, '#fde047', 16);
    },

    spawnSparks(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 60 + Math.random() * 120;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color,
                size: 2 + Math.random() * 3,
                life: 0.35,
                maxLife: 0.35
            });
        }
    },

    spawnFloatingText(text, x, y, color = '#facc15', size = 15) {
        this.damageNumbers.push({
            text, x, y,
            color,
            size,
            vy: -45,
            life: 0.75,
            maxLife: 0.75
        });
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
        this.animTime += dt;

        this.update(dt);
        this.render();

        this.animFrameId = requestAnimationFrame(() => this.loopBattle());
    },

    update(dt) {
        if (!this.isActive || !this.canvas) return;
        const p = this.player;

        // Player movement
        let moveX = 0, moveY = 0;
        if (this.keys.KeyA) moveX -= 1;
        if (this.keys.KeyD) moveX += 1;
        if (this.keys.KeyW) moveY -= 1;
        if (this.keys.KeyS) moveY += 1;

        if (p.dashTimer > 0) {
            p.dashTimer -= dt;
        } else {
            if (moveX !== 0 || moveY !== 0) {
                const len = Math.hypot(moveX, moveY);
                p.vx = THREE.MathUtils.lerp(p.vx, (moveX / len) * p.speed, Math.min(1, dt * 14));
                p.vy = THREE.MathUtils.lerp(p.vy, (moveY / len) * p.speed, Math.min(1, dt * 14));
                if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;
            } else {
                p.vx = THREE.MathUtils.lerp(p.vx, 0, Math.min(1, dt * 12));
                p.vy = THREE.MathUtils.lerp(p.vy, 0, Math.min(1, dt * 12));
            }
        }

        p.x = Math.max(20, Math.min(this.canvas.width - p.width - 20, p.x + p.vx * dt));
        p.y = Math.max(65, Math.min(this.canvas.height - p.height - 35, p.y + p.vy * dt));

        // State machine for Sprite animation
        if (p.invincibleTimer > 0) {
            p.state = 'hurt';
        } else if (p.isAttacking) {
            p.state = 'attack';
        } else if (p.dashTimer > 0 || p.slamTimer > 0) {
            p.state = 'skill';
        } else if (Math.abs(p.vy) > 35) {
            p.state = 'jump';
        } else if (Math.hypot(p.vx, p.vy) > 20) {
            p.state = 'walk';
        } else {
            p.state = 'idle';
        }

        // Push trail for squad companions
        this.trailQueue.unshift({
            x: p.x,
            y: p.y,
            facing: p.facing,
            state: p.state
        });
        if (this.trailQueue.length > 80) this.trailQueue.pop();

        // Attack & Skill timers
        if (p.attackCooldown > 0) p.attackCooldown -= dt;
        if (p.attackAnimTimer > 0) {
            p.attackAnimTimer -= dt;
            if (p.attackAnimTimer <= 0) p.isAttacking = false;
        }
        if (p.comboTimer > 0) {
            p.comboTimer -= dt;
            if (p.comboTimer <= 0) p.comboStep = 0;
        }
        if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
        if (p.skillCdK > 0) p.skillCdK -= dt;
        if (p.skillCdL > 0) p.skillCdL -= dt;
        if (p.skillCdSemi > 0) p.skillCdSemi -= dt;
        if (p.slamTimer > 0) p.slamTimer -= dt;

        // Stampede Ultimate update
        if (this.stampedePigs.length > 0) {
            this.stampedePigs.forEach(sp => {
                sp.x += sp.vx * dt;
                // Collision with enemies
                this.enemies.forEach(en => {
                    if (en.hp <= 0) return;
                    if (Math.abs(sp.x - en.x) < 45 && Math.abs(sp.y - en.y) < 35) {
                        en.hp -= Math.round(p.atk * 1.5 * dt * 15);
                        en.hitFlash = 0.1;
                        en.x += 18 * dt * 20;
                        if (en.hp <= 0) this.onEnemyKilled(en);
                    }
                });
            });
            this.stampedePigs = this.stampedePigs.filter(sp => sp.x < (this.canvas ? this.canvas.width + 120 : 1000));
        }

        // Shockwaves update
        this.shockwaves.forEach(sw => {
            sw.life -= dt;
            sw.radius = THREE.MathUtils.lerp(sw.radius, sw.maxRadius, 1 - sw.life / sw.maxLife);
        });
        this.shockwaves = this.shockwaves.filter(sw => sw.life > 0);

        // Slash FX update
        this.slashes.forEach(sl => sl.life -= dt);
        this.slashes = this.slashes.filter(sl => sl.life > 0);

        // Update enemies
        let aliveEnemies = 0;
        this.enemies.forEach(en => {
            if (en.hp <= 0) return;
            aliveEnemies++;
            if (en.hitFlash > 0) en.hitFlash -= dt;

            const dx = p.x - en.x;
            const dy = p.y - en.y;
            const dist = Math.hypot(dx, dy);

            en.facing = dx > 0 ? 1 : -1;

            // Boss enraged check
            if (en.type === 'BOSS' && en.hp / en.maxHp < 0.5) {
                en.enraged = true;
                en.speed = 75;
            }

            if (dist > 40) {
                en.x += (dx / dist) * en.speed * dt;
                en.y += (dy / dist) * en.speed * dt;
            } else {
                // Attack player
                en.attackCd -= dt;
                if (en.attackCd <= 0 && p.invincibleTimer <= 0) {
                    en.attackCd = en.type === 'BOSS' ? 1.6 : 2.0;
                    const dmg = en.atk;
                    p.hp -= dmg;
                    p.invincibleTimer = 0.6;
                    this.cameraShake = 11;
                    this.spawnFloatingText(`-${dmg}`, p.x + p.width * 0.5, p.y - 15, '#f43f5e', 18);
                    this.spawnSparks(p.x + p.width * 0.5, p.y + p.height * 0.5, '#f43f5e', 10);

                    if (p.hp <= 0) {
                        this.triggerDefeat();
                    }
                }
            }
        });

        // Wave progression check
        if (aliveEnemies === 0 && !this.isVictory && !this.isDefeat) {
            if (this.currentWave < this.maxWave) {
                this.currentWave++;
                this.spawnWave(this.currentWave);
                this.spawnFloatingText(`🚩 第 ${this.currentWave} 波魔物來襲！`, (this.canvas ? this.canvas.width : 800) * 0.5, 120, '#38bdf8', 20);
            } else {
                this.triggerVictory();
            }
        }

        // Particles update
        this.particles.forEach(pt => {
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.life -= dt;
        });
        this.particles = this.particles.filter(pt => pt.life > 0);

        // Damage numbers update
        this.damageNumbers.forEach(dn => {
            dn.y += dn.vy * dt;
            dn.life -= dt;
        });
        this.damageNumbers = this.damageNumbers.filter(dn => dn.life > 0);

        if (this.cameraShake > 0) {
            this.cameraShake -= dt * 25;
            if (this.cameraShake < 0) this.cameraShake = 0;
        }

        if (this.isVictory) {
            this.victoryTimer += dt;
        }
    },

    triggerVictory() {
        this.isVictory = true;
        this.victoryTimer = 0;
        const rewardCoins = 150 + this.stage * 45;
        const rewardXP = 60 + this.stage * 20;

        if (typeof gameState !== 'undefined') {
            gameState.coins += rewardCoins;
            gameState.intimacy += rewardXP;
            if (typeof updateHUD === 'function') updateHUD();
        }

        this.cameraShake = 15;
        this.spawnFloatingText(`🎉 關卡通關！獎勵 +${rewardCoins} 金幣`, (this.canvas ? this.canvas.width : 800) * 0.5, 150, '#facc15', 24);
        if (typeof sfx !== 'undefined' && sfx.playVictoryFanfare) sfx.playVictoryFanfare();
    },

    triggerDefeat() {
        this.isDefeat = true;
        this.player.hp = 0;
        this.cameraShake = 18;
        this.spawnFloatingText('💀 挑戰失敗！', (this.canvas ? this.canvas.width : 800) * 0.5, 150, '#ef4444', 26);
    },

    nextStage() {
        if (this.stage < 50) {
            this.stage++;
            this.changeStage(this.stage);
        } else {
            this.changeStage(1);
        }
    },

    render() {
        const ctx = this.ctx;
        if (!ctx || !this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const st = this.getCurrentStageData();

        ctx.save();
        if (this.cameraShake > 0) {
            const sx = (Math.random() - 0.5) * this.cameraShake;
            const sy = (Math.random() - 0.5) * this.cameraShake;
            ctx.translate(sx, sy);
        }

        // 1. World Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
        skyGrad.addColorStop(0, st.skyTop || '#1e1b38');
        skyGrad.addColorStop(1, st.skyBot || '#3b2447');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Distant World Silhouette Mountains
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.55);
        for (let x = 0; x <= w; x += 40) {
            const my = h * 0.5 - Math.sin(x * 0.015 + st.world) * 35;
            ctx.lineTo(x, my);
        }
        ctx.lineTo(w, h * 0.65);
        ctx.lineTo(0, h * 0.65);
        ctx.fill();

        // 2. Battle Floor Ground Gradient
        const groundGrad = ctx.createLinearGradient(0, h * 0.62, 0, h);
        groundGrad.addColorStop(0, st.groundTop || '#4ade80');
        groundGrad.addColorStop(1, st.groundBot || '#3f2e21');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, h * 0.62, w, h * 0.38);

        // Retro Floor Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        for (let y = h * 0.65; y < h; y += 32) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        for (let x = 0; x < w; x += 55) {
            ctx.beginPath(); ctx.moveTo(x, h * 0.62); ctx.lineTo(x, h); ctx.stroke();
        }

        // 3. Shockwaves Render
        this.shockwaves.forEach(sw => {
            const alpha = sw.life / sw.maxLife;
            ctx.save();
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(250, 204, 21, ${alpha * 0.85})`;
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.restore();
        });

        // 4. Stampede Mini Pigs
        this.stampedePigs.forEach(sp => {
            ctx.save();
            ctx.translate(sp.x, sp.y);
            ctx.scale(sp.scale, sp.scale);
            if (this.pigSheetImg && this.pigSheetImg.complete && this.pigSheetImg.naturalWidth > 0) {
                // Slicing walk state (frame 1, x = 64)
                ctx.drawImage(this.pigSheetImg, 64, 0, 64, 64, -22, -22, 44, 44);
            } else {
                ctx.fillStyle = sp.color;
                ctx.beginPath();
                ctx.roundRect(-16, -12, 32, 24, 8);
                ctx.fill();
            }
            ctx.restore();
        });

        // 5. Render Enemies with Monsters Sprite Sheet
        this.enemies.forEach(en => {
            if (en.hp <= 0) return;
            this.renderMonster(ctx, en);
        });

        // 6. Render Trailing Companion Pigs (Squad)
        this.renderSquadCompanions(ctx);

        // 7. Render Player Pig
        this.renderPlayer(ctx);

        // 8. Render Attack Slashes
        this.slashes.forEach(sl => {
            ctx.save();
            ctx.translate(sl.x, sl.y);
            ctx.scale(sl.facing, 1);
            ctx.strokeStyle = sl.step === 3 ? '#f43f5e' : (sl.step === 2 ? '#38bdf8' : '#fbbf24');
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(0, 0, 36, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();
            ctx.restore();
        });

        // 9. Render Particles
        this.particles.forEach(pt => {
            const alpha = pt.life / pt.maxLife;
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
            ctx.globalAlpha = 1.0;
        });

        // 10. Render Floating Damage Numbers
        this.damageNumbers.forEach(dn => {
            ctx.font = `bold ${dn.size}px sans-serif`;
            ctx.fillStyle = dn.color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText(dn.text, dn.x, dn.y);
            ctx.fillText(dn.text, dn.x, dn.y);
        });

        ctx.restore();

        // 11. Render HUD Overlays
        this.renderHUD(w, h, st);
    },

    renderMonster(ctx, en) {
        ctx.save();
        ctx.translate(en.x + en.width * 0.5, en.y + en.height * 0.5);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, en.height * 0.45, en.width * 0.48, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Elite Golden Halo / Boss Enraged Aura
        if (en.type === 'ELITE') {
            const auraRad = en.width * 0.65 + Math.sin(this.animTime * 8) * 3;
            const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, auraRad);
            grad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
            grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, auraRad, 0, Math.PI * 2);
            ctx.fill();
        } else if (en.type === 'BOSS') {
            const auraColor = en.enraged ? 'rgba(244, 63, 94, 0.55)' : 'rgba(168, 85, 247, 0.38)';
            const auraRad = en.width * 0.72 + Math.sin(this.animTime * 6) * 5;
            const grad = ctx.createRadialGradient(0, 0, 15, 0, 0, auraRad);
            grad.addColorStop(0, auraColor);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, auraRad, 0, Math.PI * 2);
            ctx.fill();
        }

        // Horizontal flip based on monster facing
        ctx.scale(en.facing < 0 ? 1 : -1, 1);

        const bob = Math.sin(this.animTime * (en.type === 'BOSS' ? 4 : 7) + en.seed) * 2.5;
        ctx.translate(0, bob);

        // Monster Spritesheet drawing (10 columns x 3 rows of 32x32px sprites)
        if (this.monstersImg && this.monstersImg.complete && this.monstersImg.naturalWidth > 0) {
            const col = (en.world - 1) % 10;
            const row = en.tier === 'minion' ? 0 : (en.tier === 'elite' ? 1 : 2);
            const sx = col * 32;
            const sy = row * 32;

            if (en.hitFlash > 0) {
                ctx.filter = 'brightness(2.2)';
            }
            ctx.drawImage(this.monstersImg, sx, sy, 32, 32, -en.width * 0.5, -en.height * 0.5, en.width, en.height);
            ctx.filter = 'none';
        } else {
            // Procedural fallback
            ctx.fillStyle = en.hitFlash > 0 ? '#ffffff' : en.color;
            ctx.beginPath();
            ctx.roundRect(-en.width * 0.5, -en.height * 0.5, en.width, en.height, 8);
            ctx.fill();
        }

        ctx.restore();

        // HP Bar and Name Tag (Not flipped)
        const hpRatio = Math.max(0, en.hp / en.maxHp);
        const barW = Math.max(en.width, 42);
        const barX = en.x + en.width * 0.5 - barW * 0.5;
        const barY = en.y - 14;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, 6);
        ctx.fillStyle = en.type === 'BOSS' ? '#f43f5e' : (en.type === 'ELITE' ? '#fbbf24' : '#ef4444');
        ctx.fillRect(barX, barY, barW * hpRatio, 4);

        // Name
        ctx.font = en.type === 'BOSS' ? 'bold 12px sans-serif' : 'bold 10px sans-serif';
        ctx.fillStyle = en.type === 'BOSS' ? '#f43f5e' : (en.type === 'ELITE' ? '#fde047' : '#cbd5e1');
        ctx.textAlign = 'center';
        ctx.fillText(en.name, en.x + en.width * 0.5, barY - 4);
        ctx.textAlign = 'start';
    },

    renderSquadCompanions(ctx) {
        if (!gameState || !gameState.pigs || gameState.pigs.length <= 1) return;
        const companionPigs = gameState.pigs.slice(1, 3); // Up to 2 trailing companions

        companionPigs.forEach((cData, idx) => {
            const frameDelay = Math.min(this.trailQueue.length - 1, (idx + 1) * 14);
            const pose = this.trailQueue[frameDelay] || this.player;

            ctx.save();
            ctx.translate(pose.x + this.player.width * 0.5, pose.y + this.player.height * 0.5);
            ctx.scale(pose.facing * 0.76, 0.76);

            if (this.pigSheetImg && this.pigSheetImg.complete && this.pigSheetImg.naturalWidth > 0) {
                const stateMap = { idle: 0, walk: 1, jump: 2, attack: 3, skill: 4, hurt: 5 };
                const frameIdx = stateMap[pose.state] !== undefined ? stateMap[pose.state] : 0;
                ctx.drawImage(this.pigSheetImg, frameIdx * 64, 0, 64, 64, -28, -28, 56, 56);
            } else {
                ctx.fillStyle = cData.color || '#ffb6c1';
                ctx.beginPath();
                ctx.roundRect(-16, -14, 32, 28, 8);
                ctx.fill();
            }
            ctx.restore();
        });
    },

    renderPlayer(ctx) {
        const p = this.player;
        ctx.save();
        ctx.translate(p.x + p.width * 0.5, p.y + p.height * 0.5);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
        ctx.beginPath();
        ctx.ellipse(0, p.height * 0.46, p.width * 0.44, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Facing direction flip
        ctx.scale(p.facing, 1);

        const bob = (p.state === 'walk') ? Math.sin(this.animTime * 14) * 2.5 : Math.sin(this.animTime * 4) * 1.5;
        ctx.translate(0, bob);

        if (this.pigSheetImg && this.pigSheetImg.complete && this.pigSheetImg.naturalWidth > 0) {
            const stateMap = { idle: 0, walk: 1, jump: 2, attack: 3, skill: 4, hurt: 5 };
            const frameIdx = stateMap[p.state] !== undefined ? stateMap[p.state] : 0;

            if (p.invincibleTimer > 0 && Math.floor(performance.now() / 90) % 2 === 0) {
                ctx.filter = 'brightness(2.0)';
            }
            ctx.drawImage(this.pigSheetImg, frameIdx * 64, 0, 64, 64, -32, -32, 64, 64);
            ctx.filter = 'none';
        } else {
            // Fallback round pig
            ctx.fillStyle = p.invincibleTimer > 0 && Math.floor(performance.now() / 80) % 2 === 0 ? '#ffffff' : '#f472b6';
            ctx.beginPath();
            ctx.roundRect(-p.width * 0.5, -p.height * 0.5, p.width, p.height, 12);
            ctx.fill();

            // Snout
            ctx.fillStyle = '#fb7185';
            ctx.beginPath();
            ctx.roundRect(0, -2, 16, 12, 4);
            ctx.fill();
        }

        ctx.restore();

        // Player HP Bar
        const barW = 54;
        const barX = p.x + p.width * 0.5 - barW * 0.5;
        const barY = p.y - 16;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, 7);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(barX, barY, barW * Math.max(0, p.hp / p.maxHp), 5);
    },

    renderHUD(w, h, st) {
        const ctx = this.ctx;

        // Top-left Stage & World info badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.roundRect(14, 12, 340, 48, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`${st.worldIcon} ${st.stageTitle}`, 24, 32);

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`波數：${this.currentWave} / ${this.maxWave}  |  收穫金幣：+${this.coinsEarned}`, 24, 49);

        // Skill Badges on Top-Right
        const badgeW = 90;
        const badgeY = 14;
        const skills = [
            { key: '[K] 突刺', cd: this.player.skillCdK, maxCd: 3.8, col: '#38bdf8' },
            { key: '[L] 震地', cd: this.player.skillCdL, maxCd: 5.0, col: '#facc15' },
            { key: '[;] 奧義', cd: this.player.skillCdSemi, maxCd: 12.0, col: '#f43f5e' }
        ];

        skills.forEach((sk, idx) => {
            const bx = w - 16 - (3 - idx) * (badgeW + 8);
            ctx.fillStyle = sk.cd <= 0 ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.9)';
            ctx.roundRect(bx, badgeY, badgeW, 44, 10);
            ctx.fill();
            ctx.strokeStyle = sk.cd <= 0 ? sk.col : 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = sk.cd <= 0 ? 2 : 1;
            ctx.stroke();

            ctx.fillStyle = sk.cd <= 0 ? sk.col : '#94a3b8';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(sk.key, bx + badgeW * 0.5, badgeY + 20);

            ctx.font = '10px sans-serif';
            ctx.fillText(sk.cd <= 0 ? '就緒' : `${sk.cd.toFixed(1)}s`, bx + badgeW * 0.5, badgeY + 35);
            ctx.textAlign = 'start';
        });

        // Victory Banner
        if (this.isVictory) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.roundRect(w * 0.5 - 190, h * 0.5 - 80, 380, 160, 20);
            ctx.fill();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 26px sans-serif';
            ctx.fillText('🏆 關卡完全通關！', w * 0.5, h * 0.5 - 32);

            ctx.fillStyle = '#f8fafc';
            ctx.font = '14px sans-serif';
            ctx.fillText(`已擊敗領主【${st.boss.name}】`, w * 0.5, h * 0.5 - 6);
            ctx.fillStyle = '#34d399';
            ctx.fillText(`通關獎勵：金幣 +${150 + this.stage * 45}  |  經驗 +${60 + this.stage * 20}`, w * 0.5, h * 0.5 + 20);

            // Next Stage / Replay hint
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('點擊下方按鈕或按 [J] 邁向下一關 ➔', w * 0.5, h * 0.5 + 56);
            ctx.textAlign = 'start';
        }

        // Defeat Banner
        if (this.isDefeat) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.roundRect(w * 0.5 - 170, h * 0.5 - 70, 340, 140, 20);
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('💀 體力耗盡，挑戰失敗', w * 0.5, h * 0.5 - 24);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '13px sans-serif';
            ctx.fillText('可以換上更強的裝備，或餵飽小豬後重試！', w * 0.5, h * 0.5 + 4);

            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('點擊 [J] 重新挑戰此關卡', w * 0.5, h * 0.5 + 42);
            ctx.textAlign = 'start';
        }
    }
};

// Global export for vanilla HTML script loading
if (typeof window !== 'undefined') {
    window.PixelBattle = PixelBattle;
    window.STAGE_CATALOG = STAGE_CATALOG;
    window.WORLD_THEMES = WORLD_THEMES;
}
