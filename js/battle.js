/**
 * 3D Royal Piggy Farm - Advanced Expedition Combat & Forge System
 * Module: js/battle.js
 */

const FORGE_COSTS = [150, 350, 750, 1500, 2800, 5000, 9000, 16000, 30000];

const BattleManager = {
    currentStage: null,
    inBattle: false,
    isEndless: false,
    endlessFloor: 1,

    playerHp: 100,
    playerMaxHp: 100,
    playerAtk: 15,
    playerDef: 5,
    playerCrit: 5,

    enemyHp: 100,
    enemyMaxHp: 100,
    enemyAtk: 15,
    enemyDef: 3,

    bossIntent: null,
    isGuarding: false,
    enemyStunned: false,
    turn: 'player',
    rollCooldown: 0,
    healUsesLeft: 3,

    buffAtkTurns: 0,
    buffDefTurns: 0,
    dodgeNextAttack: false,
    hasReviveCross: false,
    bleedTurns: 0,

    calcPlayerStats() {
        const curPig = gameState.getActivePig();
        let weaponAtk = 0;
        let weaponCrit = 0;
        if (curPig.equippedWeapon) {
            const w = WEAPONS_CATALOG.find(x => x.id === curPig.equippedWeapon);
            if (w) { weaponAtk = w.atkBonus || 0; weaponCrit = w.critBonus || 0; }
        }

        let shieldDef = 0;
        let shieldHp = 0;
        if (curPig.equippedShield) {
            const s = SHIELDS_CATALOG.find(x => x.id === curPig.equippedShield);
            if (s) { shieldDef = s.defBonus || 0; shieldHp = s.hpBonus || 0; }
        }

        let outfitHp = 0, outfitAtk = 0, outfitDef = 0;
        if (curPig.currentOutfit) {
            const o = OUTFITS_CATALOG.find(x => x.id === curPig.currentOutfit);
            if (o) {
                outfitHp = o.hpBonus || 0;
                outfitAtk = o.atkBonus || 0;
                outfitDef = o.defBonus || 0;
            }
        }

        // Forge Upgrade Multipliers
        const wForgeLv = gameState.forgeLevels.weapon || 0;
        const sForgeLv = gameState.forgeLevels.shield || 0;
        const forgeAtkBonus = Math.round(weaponAtk * (wForgeLv * 0.16));
        const forgeCritBonus = wForgeLv * 2;
        const forgeDefBonus = Math.round(shieldDef * (sForgeLv * 0.16));
        const forgeHpBonus = Math.round(shieldHp * (sForgeLv * 0.22));

        const hasDummy = !!(gameState.estateLevels && gameState.estateLevels.combat_dummy);
        const dummyAtk = hasDummy ? 40 : 0;
        const dummyDef = hasDummy ? 25 : 0;

        // Breed combat bonus
        let breedAtk = 0;
        let breedDef = 0;
        if (curPig.breed === 'berkshire_spotted') breedDef += 15;
        if (curPig.breed === 'caramel_boar') breedAtk += 25;

        const baseHp = 140 + Math.round(curPig.weight * 14) + shieldHp + outfitHp + forgeHpBonus;
        const baseAtk = 20 + Math.round(curPig.intimacyLevel * 8) + weaponAtk + outfitAtk + dummyAtk + forgeAtkBonus + breedAtk;
        const baseDef = 8 + Math.round(curPig.weight * 0.9) + shieldDef + outfitDef + dummyDef + forgeDefBonus + breedDef;
        const baseCrit = 6 + (curPig.intimacyLevel * 2) + weaponCrit + forgeCritBonus;

        return { maxHp: baseHp, atk: baseAtk, def: baseDef, crit: baseCrit };
    },

    openModal() {
        const modal = document.getElementById('modal-battle');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        this.renderStageSelector();
        this.renderForgePanel();
        this.renderPotionsBelt();

        const defaultStage = BATTLE_STAGES[(gameState.battleStagesUnlocked || 1) - 1] || BATTLE_STAGES[0];
        this.startBattle(defaultStage, false);
    },

    closeModal() {
        const modal = document.getElementById('modal-battle');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        this.inBattle = false;
    },

    renderStageSelector() {
        const bar = document.getElementById('battle-stage-selector-bar');
        if (!bar) return;
        bar.innerHTML = '';
        const maxUnlocked = gameState.battleStagesUnlocked || 1;

        BATTLE_STAGES.forEach(st => {
            const unlocked = st.id <= maxUnlocked;
            const isCurrent = !this.isEndless && this.currentStage && this.currentStage.id === st.id;
            const btn = document.createElement('button');
            btn.className = `px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                isCurrent
                    ? 'bg-rose-500 text-white shadow-lg'
                    : (unlocked ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-slate-900/60 text-slate-500 border border-slate-800 cursor-not-allowed')
            }`;
            btn.innerHTML = `<span>${st.icon} 第${st.id}關 · ${st.name}</span> ${!unlocked ? '🔒' : ''}`;
            if (unlocked) {
                btn.addEventListener('click', () => {
                    this.startBattle(st, false);
                    if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(460);
                });
            }
            bar.appendChild(btn);
        });

        // Endless Abyss Mode Button
        const endlessBtn = document.createElement('button');
        endlessBtn.className = `px-3.5 py-1.5 rounded-xl font-black whitespace-nowrap transition flex items-center gap-1.5 ${
            this.isEndless
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border border-purple-400'
                : 'bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-300'
        }`;
        endlessBtn.innerHTML = `<span>🌀 無盡深淵試煉 (第${this.endlessFloor}層)</span>`;
        endlessBtn.addEventListener('click', () => {
            this.startEndlessFloor(this.endlessFloor);
        });
        bar.appendChild(endlessBtn);
    },

    startBattle(stage, isEndless = false) {
        this.currentStage = stage;
        this.isEndless = isEndless;
        this.inBattle = true;

        const stats = this.calcPlayerStats();
        this.playerMaxHp = stats.maxHp;
        this.playerHp = stats.maxHp;
        this.playerAtk = stats.atk;
        this.playerDef = stats.def;
        this.playerCrit = stats.crit;

        this.enemyMaxHp = stage.hp;
        this.enemyHp = stage.hp;
        this.enemyAtk = stage.atk;
        this.enemyDef = stage.def || 4;

        this.isGuarding = false;
        this.enemyStunned = false;
        this.turn = 'player';
        this.rollCooldown = 0;
        this.healUsesLeft = 3;
        this.buffAtkTurns = 0;
        this.buffDefTurns = 0;
        this.dodgeNextAttack = false;
        this.hasReviveCross = (gameState.battlePotions.revive_cross > 0);
        this.bleedTurns = 0;

        const log = document.getElementById('b-combat-log');
        if (log) log.innerHTML = '';
        this.addLog(`⚔️ 進入【${stage.name}】！勇者小豬迎戰【${stage.boss}】！`, '#fbbf24');

        this.decideBossNextIntent();
        this.updateUI();
        this.renderStageSelector();
    },

    startEndlessFloor(floor) {
        this.endlessFloor = floor;
        const bossIcons = ['🦏', '🐅', '🦖', '👹', '👺', '👾'];
        const bossNames = ['狂暴鐵甲犀牛', '嗜血幽冥虎', '遠古霸王恐龍', '深淵赤面惡鬼', '混沌天魔大將', '星空虛空巨獸'];
        const icon = bossIcons[(floor - 1) % bossIcons.length];
        const name = `${bossNames[(floor - 1) % bossNames.length]} (Lv.${floor})`;

        const floorStage = {
            id: 999 + floor,
            name: `深淵第 ${floor} 層`,
            boss: name,
            hp: Math.round(500 * Math.pow(1.32, floor - 1)),
            atk: Math.round(25 + floor * 14),
            def: Math.round(10 + floor * 6),
            reward: Math.round(200 * Math.pow(1.25, floor - 1)),
            icon: icon,
            desc: `深淵混沌氣息環繞，敵方隨層數大幅狂暴強化！`
        };

        this.startBattle(floorStage, true);
    },

    decideBossNextIntent() {
        const intents = [
            { type: 'NORMAL', text: '⚔️ 普通衝撞攻擊', mult: 1.0, hint: '正常攻擊' },
            { type: 'HEAVY_SLAM', text: '⚡ 蓄力釋放【狂暴重擊】(250%傷害)', mult: 2.5, hint: '⚠️ 極致危險！請使用鐵壁格擋或旋轉眩暈打斷！' },
            { type: 'POISON_BITE', text: '🩸 蓄力【撕裂毒爪】(附加流血)', mult: 1.2, hint: '造成流血劇毒狀態' },
            { type: 'IRON_GUARD', text: '🛡️ 架起【堅甲壁壘】(防禦翻倍)', mult: 0.5, hint: 'Boss 下回合防禦翻倍' }
        ];

        // 35% chance for heavy slam
        const roll = Math.random();
        if (roll < 0.35) this.bossIntent = intents[1];
        else if (roll < 0.60) this.bossIntent = intents[2];
        else if (roll < 0.80) this.bossIntent = intents[3];
        else this.bossIntent = intents[0];
    },

    updateUI() {
        const curPig = gameState.getActivePig();
        const pName = document.getElementById('b-player-name');
        if (pName) pName.textContent = curPig.name;

        const w = WEAPONS_CATALOG.find(x => x.id === curPig.equippedWeapon);
        const s = SHIELDS_CATALOG.find(x => x.id === curPig.equippedShield);
        const wLv = gameState.forgeLevels.weapon || 0;
        const sLv = gameState.forgeLevels.shield || 0;

        const equipText = document.getElementById('b-player-equip-text');
        if (equipText) {
            equipText.textContent = `裝備：${w ? `${w.name}+${wLv}` : '無武器'} ｜ ${s ? `${s.name}+${sLv}` : '無護甲'}`;
        }

        let curAtk = this.playerAtk;
        let curDef = this.playerDef;
        if (this.buffAtkTurns > 0) curAtk = Math.round(curAtk * 1.5);
        if (this.buffDefTurns > 0) curDef = Math.round(curDef * 1.8);

        const atkEl = document.getElementById('b-player-atk');
        if (atkEl) atkEl.textContent = `${curAtk}${this.buffAtkTurns > 0 ? ' ⚡' : ''}`;
        const defEl = document.getElementById('b-player-def');
        if (defEl) defEl.textContent = `${curDef}${this.buffDefTurns > 0 ? ' 🛡️' : ''}`;
        const critEl = document.getElementById('b-player-crit');
        if (critEl) critEl.textContent = `${this.playerCrit}%`;

        const hpText = document.getElementById('b-player-hp-text');
        if (hpText) hpText.textContent = `${Math.max(0, this.playerHp)} / ${this.playerMaxHp}`;
        const pHpPct = Math.max(0, Math.min(100, (this.playerHp / this.playerMaxHp) * 100));
        const hpBar = document.getElementById('b-player-hp-bar');
        if (hpBar) hpBar.style.width = `${pHpPct}%`;

        if (this.currentStage) {
            const eName = document.getElementById('b-enemy-name');
            if (eName) eName.textContent = this.currentStage.boss;
            const eIcon = document.getElementById('b-enemy-icon');
            if (eIcon) eIcon.textContent = this.currentStage.icon;

            const eSub = document.getElementById('b-enemy-sub');
            if (eSub) {
                if (this.enemyStunned) {
                    eSub.textContent = '💫 處於眩暈狀態！無法行動！';
                    eSub.style.color = '#fbbf24';
                } else if (this.bossIntent) {
                    eSub.textContent = `意圖：${this.bossIntent.text}`;
                    eSub.style.color = this.bossIntent.type === 'HEAVY_SLAM' ? '#f43f5e' : '#fb923c';
                }
            }

            const eAtk = document.getElementById('b-enemy-atk');
            if (eAtk) eAtk.textContent = this.enemyAtk;
            const eDef = document.getElementById('b-enemy-def');
            if (eDef) eDef.textContent = this.enemyDef;
            const eReward = document.getElementById('b-enemy-reward');
            if (eReward) eReward.textContent = this.currentStage.reward;

            const eHpText = document.getElementById('b-enemy-hp-text');
            if (eHpText) eHpText.textContent = `${Math.max(0, this.enemyHp)} / ${this.enemyMaxHp}`;
            const eHpPct = Math.max(0, Math.min(100, (this.enemyHp / this.enemyMaxHp) * 100));
            const eHpBar = document.getElementById('b-enemy-hp-bar');
            if (eHpBar) eHpBar.style.width = `${eHpPct}%`;

            const stageBadge = document.getElementById('battle-badge-stage');
            if (stageBadge) {
                stageBadge.textContent = this.isEndless ? `深淵 ${this.endlessFloor} 層` : `第 ${this.currentStage.id} 區`;
            }
        }

        const isPlayerTurn = this.turn === 'player';
        const btnTackle = document.getElementById('btn-battle-tackle');
        const btnRoll = document.getElementById('btn-battle-roll');
        const btnGuard = document.getElementById('btn-battle-guard');
        const btnHeal = document.getElementById('btn-battle-heal');

        if (btnTackle) btnTackle.disabled = !isPlayerTurn;
        if (btnRoll) {
            btnRoll.disabled = !isPlayerTurn || this.rollCooldown > 0;
            const lbl = document.getElementById('b-btn-roll-label');
            if (lbl) lbl.textContent = this.rollCooldown > 0 ? `🌀 冷卻 (${this.rollCooldown}回)` : '🌀 肉彈戰車(眩暈)';
        }
        if (btnGuard) btnGuard.disabled = !isPlayerTurn;
        if (btnHeal) {
            btnHeal.disabled = !isPlayerTurn || this.healUsesLeft <= 0;
            const lbl = document.getElementById('b-btn-heal-label');
            if (lbl) lbl.textContent = `🍖 急救(剩${this.healUsesLeft}次)`;
        }

        const coinEl = document.getElementById('battle-modal-coins');
        if (coinEl) coinEl.textContent = Math.floor(gameState.coins);

        this.renderPotionsBelt();
        this.renderForgePanel();
    },

    renderForgePanel() {
        const wLv = gameState.forgeLevels.weapon || 0;
        const sLv = gameState.forgeLevels.shield || 0;
        const wCost = FORGE_COSTS[wLv] || 99999;
        const sCost = FORGE_COSTS[sLv] || 99999;

        const wBtn = document.getElementById('btn-forge-weapon');
        if (wBtn) {
            wBtn.innerHTML = wLv >= 10 ? '👑 王者武器 +10 (已達最高階)' : `⚔️ 重鑄武器 +${wLv + 1} (${wCost} 金幣)`;
            wBtn.disabled = wLv >= 10 || gameState.coins < wCost;
        }

        const sBtn = document.getElementById('btn-forge-shield');
        if (sBtn) {
            sBtn.innerHTML = sLv >= 10 ? '👑 聖光護盾 +10 (已達最高階)' : `🛡️ 重鑄護甲 +${sLv + 1} (${sCost} 金幣)`;
            sBtn.disabled = sLv >= 10 || gameState.coins < sCost;
        }
    },

    renderPotionsBelt() {
        const belt = document.getElementById('battle-potions-belt');
        if (!belt) return;

        belt.innerHTML = BATTLE_POTIONS_CATALOG.map(p => {
            const count = gameState.battlePotions[p.id] || 0;
            return `
                <div class="p-2 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1.5">
                        <span class="text-base">${p.icon}</span>
                        <div>
                            <div class="font-bold text-white">${p.name} <span class="text-amber-300">x${count}</span></div>
                            <div class="text-[10px] text-slate-400">${p.desc}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-300 text-xs font-bold transition" onclick="BattleManager.buyPotion('${p.id}')">
                            購買 (${p.price}c)
                        </button>
                        <button class="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition ${count <= 0 || !BattleManager.inBattle || BattleManager.turn !== 'player' ? 'opacity-40 cursor-not-allowed' : ''}" onclick="BattleManager.usePotion('${p.id}')" ${count <= 0 || !BattleManager.inBattle || BattleManager.turn !== 'player' ? 'disabled' : ''}>
                            使用
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    upgradeWeaponForge() {
        const wLv = gameState.forgeLevels.weapon || 0;
        if (wLv >= 10) return;
        const cost = FORGE_COSTS[wLv];
        if (gameState.coins < cost) {
            if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！重鑄武器需要 ${cost} 金幣`);
            return;
        }
        gameState.coins -= cost;
        gameState.forgeLevels.weapon = wLv + 1;
        saveGameState();
        this.updateUI();
        if (typeof showHUDToast === 'function') showHUDToast(`⚔️ 鍛造成功！神兵重鑄為【武器 +${wLv + 1}】！攻擊力大幅提升！`);
        if (typeof sfx !== 'undefined' && sfx.playSlash) sfx.playSlash();
    },

    upgradeShieldForge() {
        const sLv = gameState.forgeLevels.shield || 0;
        if (sLv >= 10) return;
        const cost = FORGE_COSTS[sLv];
        if (gameState.coins < cost) {
            if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！重鑄護盾需要 ${cost} 金幣`);
            return;
        }
        gameState.coins -= cost;
        gameState.forgeLevels.shield = sLv + 1;
        saveGameState();
        this.updateUI();
        if (typeof showHUDToast === 'function') showHUDToast(`🛡️ 鍛造成功！神盾重鑄為【護甲 +${sLv + 1}】！防禦力與生命值飆升！`);
        if (typeof sfx !== 'undefined' && sfx.playShieldBlock) sfx.playShieldBlock();
    },

    buyPotion(potionId) {
        const p = BATTLE_POTIONS_CATALOG.find(x => x.id === potionId);
        if (!p) return;
        if (gameState.coins < p.price) {
            if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！購買【${p.name}】需 ${p.price} 金幣`);
            return;
        }
        gameState.coins -= p.price;
        gameState.battlePotions[potionId] = (gameState.battlePotions[potionId] || 0) + 1;
        saveGameState();
        this.updateUI();
        if (typeof showHUDToast === 'function') showHUDToast(`🧪 成功購入【${p.name}】！已加入戰鬥腰帶！`);
        if (typeof sfx !== 'undefined' && sfx.playCoinDing) sfx.playCoinDing();
    },

    usePotion(potionId) {
        if (!this.inBattle || this.turn !== 'player') return;
        if (!gameState.battlePotions[potionId] || gameState.battlePotions[potionId] <= 0) return;

        gameState.battlePotions[potionId]--;
        saveGameState();

        if (potionId === 'potion_atk') {
            this.buffAtkTurns = 3;
            this.addLog(`🧪 飲用【狂暴大力藥劑】！小豬全身力量狂湧，攻擊力提升 50% (持續3回合)！`, '#fbbf24');
        } else if (potionId === 'potion_def') {
            this.buffDefTurns = 3;
            this.addLog(`🛡️ 飲用【金剛鐵壁聖水】！肌膚覆蓋神聖金剛輝光，防禦力提升 80% (持續3回合)！`, '#38bdf8');
        } else if (potionId === 'potion_heal') {
            const healAmt = 350;
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmt);
            this.spawnDamage('player', healAmt, false, true);
            this.addLog(`🍖 使用【勇者特製大補膏】！傷口瞬間癒合，恢復 +${healAmt} 生命值！`, '#34d399');
        } else if (potionId === 'smoke_bomb') {
            this.dodgeNextAttack = true;
            this.addLog(`💨 丟擲【迷幻煙霧彈】！濃烈彩煙瀰漫戰場，下回合敵方將 100% 攻擊落空！`, '#a855f7');
        } else if (potionId === 'revive_cross') {
            this.hasReviveCross = true;
            this.addLog(`✝️ 配戴【勇者重生十字架】！若不幸戰死將獲神聖救贖立即復活！`, '#e0e7ff');
        }

        this.updateUI();
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(520);
    },

    playerTackle() {
        if (!this.inBattle || this.turn !== 'player') return;

        const activePig = PigManager.getActivePigInstance();
        if (activePig) activePig.playAttackAnimation();

        let atk = this.playerAtk;
        if (this.buffAtkTurns > 0) atk = Math.round(atk * 1.5);

        const isCrit = Math.random() * 100 < this.playerCrit;
        const critMult = isCrit ? 1.9 : 1.0;
        const rawDmg = (atk * (0.9 + Math.random() * 0.25) - (this.enemyDef * 0.4)) * critMult;
        const dmg = Math.max(8, Math.round(rawDmg));

        this.enemyHp = Math.max(0, this.enemyHp - dmg);
        this.spawnDamage('enemy', dmg, isCrit);
        this.addLog(`💥 小豬施展【猛烈衝撞】！對敵方造成 ${dmg} 點傷害${isCrit ? '（🔥致命暴擊！）' : ''}！`, isCrit ? '#f59e0b' : '#f8fafc');

        this.checkCombatEnd(() => this.passTurnToEnemy());
    },

    playerRoll() {
        if (!this.inBattle || this.turn !== 'player' || this.rollCooldown > 0) return;

        const activePig = PigManager.getActivePigInstance();
        if (activePig) activePig.playAttackAnimation();

        let atk = this.playerAtk;
        if (this.buffAtkTurns > 0) atk = Math.round(atk * 1.5);

        const dmg = Math.max(12, Math.round(atk * 1.35 - (this.enemyDef * 0.3)));
        this.enemyHp = Math.max(0, this.enemyHp - dmg);
        this.spawnDamage('enemy', dmg, true);

        // 45% Stun Chance (Breaks Boss Intent!)
        const stunRoll = Math.random();
        if (stunRoll < 0.45) {
            this.enemyStunned = true;
            this.addLog(`🌀 小豬發動【肉彈戰車旋轉】！造成 ${dmg} 傷害並成功【💫眩暈】了魔物！打斷其下回合動作！`, '#38bdf8');
        } else {
            this.addLog(`🌀 小豬發動【肉彈戰車旋轉】！造成 ${dmg} 點翻滾重創！`, '#f8fafc');
        }

        this.rollCooldown = 3;
        this.checkCombatEnd(() => this.passTurnToEnemy());
    },

    playerGuard() {
        if (!this.inBattle || this.turn !== 'player') return;

        const activePig = PigManager.getActivePigInstance();
        if (activePig) activePig.playDefendAnimation();

        this.isGuarding = true;
        this.addLog(`🛡️ 小豬擺出【鐵壁格擋姿態】！本回合減免 75% 傷害並準備蓄力反擊！`, '#38bdf8');
        this.passTurnToEnemy();
    },

    playerHeal() {
        if (!this.inBattle || this.turn !== 'player' || this.healUsesLeft <= 0) return;

        this.healUsesLeft--;
        const healAmt = Math.round(this.playerMaxHp * 0.38);
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmt);
        this.spawnDamage('player', healAmt, false, true);

        this.addLog(`🍖 小豬享用隨身鮮食急救包！恢復 +${healAmt} 生命值！`, '#34d399');
        if (typeof sfx !== 'undefined' && sfx.playOink) sfx.playOink(1.1);

        this.passTurnToEnemy();
    },

    passTurnToEnemy() {
        this.turn = 'enemy';
        this.updateUI();

        if (this.rollCooldown > 0) this.rollCooldown--;
        if (this.buffAtkTurns > 0) this.buffAtkTurns--;
        if (this.buffDefTurns > 0) this.buffDefTurns--;

        setTimeout(() => {
            if (!this.inBattle) return;
            this.executeEnemyTurn();
        }, 850);
    },

    executeEnemyTurn() {
        if (this.enemyStunned) {
            this.enemyStunned = false;
            this.addLog(`💫 【${this.currentStage.boss}】眼冒金星無法動彈，跳過本次行動！`, '#fbbf24');
            this.turn = 'player';
            this.isGuarding = false;
            this.decideBossNextIntent();
            this.updateUI();
            return;
        }

        if (this.dodgeNextAttack) {
            this.dodgeNextAttack = false;
            this.addLog(`💨 煙霧迷濛！【${this.currentStage.boss}】的猛烈撲擊落空了！小豬完美閃避！`, '#a855f7');
            this.turn = 'player';
            this.isGuarding = false;
            this.decideBossNextIntent();
            this.updateUI();
            return;
        }

        let enemyMult = 1.0;
        if (this.bossIntent && this.bossIntent.type === 'HEAVY_SLAM') {
            enemyMult = 2.5;
            this.addLog(`⚠️ 魔物釋放【狂暴毀滅重擊】！威勢撼動天地！`, '#f43f5e');
        } else if (this.bossIntent && this.bossIntent.type === 'POISON_BITE') {
            this.bleedTurns = 3;
            this.addLog(`🩸 魔物使出【撕裂毒爪】！小豬陷入流血狀態 (持續3回合)！`, '#dc2626');
        }

        let def = this.playerDef;
        if (this.buffDefTurns > 0) def = Math.round(def * 1.8);

        let dmg = Math.max(5, Math.round((this.enemyAtk * enemyMult * (0.9 + Math.random() * 0.25)) - (def * 0.5)));

        if (this.isGuarding) {
            dmg = Math.max(2, Math.round(dmg * 0.25));
            const counterDmg = Math.max(10, Math.round(this.playerAtk * 0.65));
            this.enemyHp = Math.max(0, this.enemyHp - counterDmg);
            this.spawnDamage('enemy', counterDmg);
            this.addLog(`🛡️ 鐵壁格擋成功化解巨額衝擊！並順勢反擊魔物造成 ${counterDmg} 點反傷！`, '#38bdf8');
        }

        this.playerHp = Math.max(0, this.playerHp - dmg);
        this.spawnDamage('player', dmg);
        this.addLog(`💢 【${this.currentStage.boss}】發動猛襲，造成小豬 -${dmg} 點傷害！`, '#ef4444');

        // Bleed damage tick
        if (this.bleedTurns > 0) {
            this.bleedTurns--;
            const bleedDmg = 18;
            this.playerHp = Math.max(0, this.playerHp - bleedDmg);
            this.spawnDamage('player', bleedDmg);
            this.addLog(`🩸 流血效果發作，小豬額外損失 -${bleedDmg} 生命值！`, '#dc2626');
        }

        this.checkCombatEnd(() => {
            this.turn = 'player';
            this.isGuarding = false;
            this.decideBossNextIntent();
            this.updateUI();
        });
    },

    checkCombatEnd(onContinue) {
        this.updateUI();

        if (this.enemyHp <= 0) {
            // Victory
            this.inBattle = false;
            const reward = this.currentStage.reward;
            gameState.coins += reward;
            gameState.battleWins = (gameState.battleWins || 0) + 1;

            if (!this.isEndless) {
                if (this.currentStage.id >= (gameState.battleStagesUnlocked || 1) && this.currentStage.id < 5) {
                    gameState.battleStagesUnlocked = this.currentStage.id + 1;
                    this.addLog(`🔓 恭喜成功解鎖全新冒險區域【第 ${gameState.battleStagesUnlocked} 區】！`, '#fbbf24');
                }
            } else {
                this.endlessFloor++;
            }

            saveGameState();
            if (typeof updateHUD === 'function') updateHUD();
            if (typeof sfx !== 'undefined' && sfx.playVictoryFanfare) sfx.playVictoryFanfare();

            this.addLog(`🎉 戰鬥大獲全勝！討伐成功！贏取賞金 +${reward} 金幣！`, '#34d399');
            if (typeof showHUDToast === 'function') showHUDToast(`🎉 戰鬥大捷！斬獲 +${reward} 金幣賞金！`);

            if (this.isEndless) {
                setTimeout(() => {
                    this.startEndlessFloor(this.endlessFloor);
                }, 1800);
            }
            return;
        }

        if (this.playerHp <= 0) {
            // Check Revive Cross
            if (this.hasReviveCross) {
                this.hasReviveCross = false;
                this.playerHp = Math.round(this.playerMaxHp * 0.5);
                this.addLog(`✝️ 聖光降臨！【勇者重生十字架】觸發！小豬奇蹟般復活並回復 50% HP！`, '#fbbf24');
                this.spawnDamage('player', this.playerHp, false, true);
                if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(700);
                this.updateUI();
                if (onContinue) onContinue();
                return;
            }

            this.inBattle = false;
            this.addLog(`💀 體力不支...小豬勇士戰敗撤退。請前往牧場補充營養與重鑄裝備後再戰！`, '#ef4444');
            if (typeof showHUDToast === 'function') showHUDToast(`💀 探險失利...請提升小豬裝備與料理體質！`);
            return;
        }

        if (onContinue) onContinue();
    },

    addLog(text, color = '#f8fafc') {
        const log = document.getElementById('b-combat-log');
        if (!log) return;
        const row = document.createElement('div');
        row.style.color = color;
        row.textContent = `> ${text}`;
        log.appendChild(row);
        log.scrollTop = log.scrollHeight;
    },

    spawnDamage(targetType, dmg, isCrit = false, isHeal = false) {
        const card = targetType === 'player' ? document.getElementById('b-player-card') : document.getElementById('b-enemy-card');
        if (!card) return;
        const el = document.createElement('div');
        el.className = 'combat-floating-dmg';
        el.style.left = '50%';
        el.style.top = '40%';
        if (isHeal) {
            el.textContent = `+${dmg} HP`;
            el.style.color = '#34d399';
        } else if (isCrit) {
            el.textContent = `🔥 CRIT -${dmg}!`;
            el.style.color = '#fbbf24';
        } else {
            el.textContent = `-${dmg}`;
            el.style.color = '#ef4444';
        }
        card.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }
};

if (typeof window !== 'undefined') {
    window.BattleManager = BattleManager;
}
if (typeof global !== 'undefined') {
    global.BattleManager = BattleManager;
}

