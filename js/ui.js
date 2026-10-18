/**
 * 3D Royal Piggy Farm - Multi-Pig UI, Wardrobe & Controls Manager
 * Module: js/ui.js
 */

const UIManager = {
    init() {
        this.renderPigRoster();
        this.bindEvents();
    },

    renderPigRoster() {
        const rosterBar = document.getElementById('pig-roster-bar');
        if (!rosterBar) return;
        rosterBar.innerHTML = '';

        const countBadge = document.getElementById('pig-count-badge');
        if (countBadge) countBadge.textContent = `${gameState.pigs.length} 頭`;

        gameState.pigs.forEach((p, idx) => {
            const isActive = idx === gameState.activePigIndex;
            const itemContainer = document.createElement('div');
            itemContainer.className = 'relative flex items-center shrink-0 group';

            const btn = document.createElement('button');
            btn.className = `w-9 h-9 rounded-full flex items-center justify-center text-sm transition border ${
                isActive
                    ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900 scale-110 shadow-lg border-white/40 z-10'
                    : 'border-slate-700/80 hover:border-slate-400 opacity-80 hover:opacity-100 hover:scale-105'
            }`;
            const wt = (p.weight != null && !isNaN(p.weight)) ? Number(p.weight).toFixed(1) : '15.0';
            const lv = p.intimacyLevel != null ? p.intimacyLevel : 1;
            btn.title = `【${p.name || '小豬'}】Lv.${lv} · ${wt}kg (點擊選取)`;
            btn.innerHTML = `<span class="drop-shadow">🐷</span>`;

            btn.addEventListener('click', () => {
                this.selectActivePig(idx);
            });
            itemContainer.appendChild(btn);

            // Delete / Release button (only if more than 1 pig exists)
            if (gameState.pigs.length > 1) {
                const delBtn = document.createElement('button');
                delBtn.className = 'absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg border border-rose-300 opacity-0 group-hover:opacity-100 transition z-20';
                delBtn.title = `歡送【${p.name}】前往綠洲`;
                delBtn.innerHTML = '✕';
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`確定要將小豬【${p.name}】歡送前往皇家綠洲度假嗎？`)) {
                        if (typeof PigManager !== 'undefined') {
                            PigManager.removePig(idx);
                        }
                    }
                });
                itemContainer.appendChild(delBtn);
            }

            rosterBar.appendChild(itemContainer);
        });

        // Add Pig Button (Compact Circular)
        const addBtn = document.createElement('button');
        const nextCost = gameState.getPigAdoptionCost();
        addBtn.className = 'w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow transition shrink-0 hover:scale-105 border border-amber-300/60';
        addBtn.title = `領養新小豬 (費用：${nextCost} 金幣)`;
        addBtn.innerHTML = `<span>➕</span>`;
        addBtn.addEventListener('click', () => {
            this.openAdoptModal();
        });
        rosterBar.appendChild(addBtn);
    },

    selectActivePig(idx) {
        if (idx < 0 || idx >= gameState.pigs.length) return;
        gameState.activePigIndex = idx;
        const curPig = gameState.getActivePig();

        // Sync inputs
        const nameInput = document.getElementById('pig-name-input');
        const nameInputMob = document.getElementById('pig-name-input-mobile');
        if (nameInput) nameInput.value = curPig.name;
        if (nameInputMob) nameInputMob.value = curPig.name;

        this.renderPigRoster();
        if (typeof updateHUD === 'function') updateHUD();

        // Focus camera on new active pig
        if (typeof CameraManager !== 'undefined') {
            CameraManager.focusActivePig();
        }

        const activeInst = PigManager.getActivePigInstance();
        if (activeInst) activeInst.showEmote('❤️', 2.0);
        if (typeof sfx !== 'undefined' && sfx.playOink) sfx.playOink(1.15);
    },

    openAdoptModal() {
        const modal = document.getElementById('modal-adopt');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        const cost = gameState.getPigAdoptionCost();
        const costEl = document.getElementById('adopt-cost-display');
        if (costEl) costEl.textContent = `${cost} 金幣`;

        const breedsList = document.getElementById('adopt-breeds-list');
        if (breedsList) {
            breedsList.innerHTML = PIG_BREEDS_CATALOG.map((b, i) => `
                <label class="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between cursor-pointer hover:border-amber-400 transition">
                    <div class="flex items-center gap-2">
                        <input type="radio" name="adopt-breed" value="${b.id}" ${i === 0 ? 'checked' : ''} class="text-amber-400 focus:ring-0" />
                        <div class="w-6 h-6 rounded-lg border border-white/20" style="background-color: ${b.color}"></div>
                        <div>
                            <div class="text-xs font-black text-white">${b.name}</div>
                            <div class="text-[10px] text-slate-400">${b.desc}</div>
                        </div>
                    </div>
                </label>
            `).join('');
        }
    },

    closeAdoptModal() {
        const modal = document.getElementById('modal-adopt');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    },

    confirmAdopt() {
        const cost = gameState.getPigAdoptionCost();
        if (gameState.coins < cost) {
            if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！領養需 ${cost} 金幣`);
            return;
        }

        const nameInp = document.getElementById('input-adopt-pig-name');
        const name = (nameInp && nameInp.value.trim()) || '可愛福豬';

        const checkedRadio = document.querySelector('input[name="adopt-breed"]:checked');
        const breedId = checkedRadio ? checkedRadio.value : 'sakura_pink';

        gameState.coins -= cost;
        const newPig = gameState.addNewPig(name, breedId);

        if (PigManager) {
            PigManager.addPig(newPig);
        }

        this.closeAdoptModal();
        this.renderPigRoster();
        this.selectActivePig(gameState.pigs.length - 1);

        if (typeof showHUDToast === 'function') showHUDToast(`🎉 恭喜！新小豬【${name}】已成功加入牧場家族！`);
        if (typeof sfx !== 'undefined' && sfx.playVictoryFanfare) sfx.playVictoryFanfare();
        if (typeof MultiplayerSync !== 'undefined') {
            MultiplayerSync.recordAction('ADOPT_PIG', -cost, {
                pigs: gameState.pigs
            });
        }
    },

    renderWardrobeModal() {
        const curPig = gameState.getActivePig();

        // 1. Outfits Catalog
        const outfitList = document.getElementById('wardrobe-outfits-list');
        if (outfitList) {
            outfitList.innerHTML = OUTFITS_CATALOG.map(o => {
                const owned = gameState.ownedOutfits && gameState.ownedOutfits[o.id];
                const isEquipped = curPig.currentOutfit === o.id;
                return `
                    <div class="p-3 rounded-2xl bg-slate-900/80 border ${isEquipped ? 'border-rose-400' : 'border-slate-700/80'} flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between">
                                <span class="font-black text-xs text-white">${o.name}</span>
                                <span class="text-[10px] font-bold ${isEquipped ? 'text-rose-400' : 'text-slate-400'}">${isEquipped ? '已穿著' : (owned ? '已擁有' : `${o.price}c`)}</span>
                            </div>
                            <div class="text-[11px] text-slate-300 mt-1">${o.desc}</div>
                            <div class="text-[10px] text-emerald-300 mt-0.5">加成：生命+${o.hpBonus} 攻+${o.atkBonus} 防+${o.defBonus}</div>
                        </div>
                        <div class="mt-2.5 pt-1.5 border-t border-slate-800">
                            ${
                                isEquipped
                                    ? `<button class="w-full py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold" onclick="UIManager.unequipOutfit()">脫下服裝</button>`
                                    : (owned
                                        ? `<button class="w-full py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black" onclick="UIManager.equipOutfit('${o.id}')">穿上</button>`
                                        : `<button class="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black" onclick="UIManager.buyOutfit('${o.id}')">購買 (${o.price}c)</button>`)
                            }
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 2. Color Dye Workshop
        const dyeList = document.getElementById('wardrobe-dyes-list');
        if (dyeList) {
            dyeList.innerHTML = PIG_COLOR_PRESETS.map(c => `
                <button class="p-2.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-amber-400 transition flex items-center gap-2 text-xs font-bold text-white" onclick="UIManager.applyPigColor('${c.hex}')">
                    <span class="w-6 h-6 rounded-xl border border-white/30 shrink-0" style="background-color: ${c.hex}"></span>
                    <span>${c.name}</span>
                </button>
            `).join('');
        }
    },

    equipOutfit(outfitId) {
        const curPig = gameState.getActivePig();
        curPig.currentOutfit = outfitId;
        const inst = PigManager.getActivePigInstance();
        if (inst) inst.setOutfit(outfitId);
        saveGameState();
        this.renderWardrobeModal();
        if (typeof showHUDToast === 'function') showHUDToast(`👗 已為【${curPig.name}】換上新服裝！`);
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(480);
        if (typeof MultiplayerSync !== 'undefined') {
            MultiplayerSync.recordAction('CHANGE_OUTFIT', 0, {
                current_outfit: outfitId,
                owned_outfits: gameState.ownedOutfits
            });
        }
    },

    unequipOutfit() {
        const curPig = gameState.getActivePig();
        curPig.currentOutfit = 'none';
        const inst = PigManager.getActivePigInstance();
        if (inst) inst.setOutfit('none');
        saveGameState();
        this.renderWardrobeModal();
        if (typeof MultiplayerSync !== 'undefined') {
            MultiplayerSync.recordAction('CHANGE_OUTFIT', 0, {
                current_outfit: 'none',
                owned_outfits: gameState.ownedOutfits
            });
        }
    },

    buyOutfit(outfitId) {
        const outfit = OUTFITS_CATALOG.find(o => o.id === outfitId);
        if (!outfit) return;
        if (gameState.coins < outfit.price) {
            if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！購買需 ${outfit.price} 金幣`);
            return;
        }
        gameState.coins -= outfit.price;
        if (!gameState.ownedOutfits) gameState.ownedOutfits = {};
        gameState.ownedOutfits[outfitId] = true;
        this.equipOutfit(outfitId);
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof sfx !== 'undefined' && sfx.playCoinDing) sfx.playCoinDing();
    },

    applyPigColor(hexColor) {
        const curPig = gameState.getActivePig();
        curPig.color = hexColor;
        const inst = PigManager.getActivePigInstance();
        if (inst) inst.setSkinColor(hexColor);
        saveGameState();
        this.renderPigRoster();
        if (typeof showHUDToast === 'function') showHUDToast(`🎨 已將【${curPig.name}】毛色重新染色！`);
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(540);
        if (typeof MultiplayerSync !== 'undefined') {
            MultiplayerSync.recordAction('CHANGE_COLOR', 0, {
                color: hexColor
            });
        }
    },

    bindEvents() {
        // Confirm Adopt Button
        const btnConfirmAdopt = document.getElementById('btn-confirm-adopt');
        if (btnConfirmAdopt) btnConfirmAdopt.addEventListener('click', () => this.confirmAdopt());
        const btnCloseAdopt = document.getElementById('btn-close-adopt');
        if (btnCloseAdopt) btnCloseAdopt.addEventListener('click', () => this.closeAdoptModal());

        // Camera D-Pad Navigation Buttons
        const camUp = document.getElementById('btn-cam-pan-up');
        if (camUp) camUp.addEventListener('click', () => CameraManager.pan(0, 3.2));
        const camDown = document.getElementById('btn-cam-pan-down');
        if (camDown) camDown.addEventListener('click', () => CameraManager.pan(0, -3.2));
        const camLeft = document.getElementById('btn-cam-pan-left');
        if (camLeft) camLeft.addEventListener('click', () => CameraManager.pan(-3.2, 0));
        const camRight = document.getElementById('btn-cam-pan-right');
        if (camRight) camRight.addEventListener('click', () => CameraManager.pan(3.2, 0));
        const camFocus = document.getElementById('btn-cam-focus-pig');
        if (camFocus) camFocus.addEventListener('click', () => CameraManager.focusActivePig());
        const camReset = document.getElementById('btn-cam-reset-overview');
        if (camReset) camReset.addEventListener('click', () => CameraManager.resetOverview());

        // Farmland Triggers
        const btnFarmDesk = document.getElementById('btn-open-farm-desktop');
        if (btnFarmDesk) btnFarmDesk.addEventListener('click', () => FarmSystem.openModal());
        const btnCloseFarm = document.getElementById('btn-close-farm');
        if (btnCloseFarm) btnCloseFarm.addEventListener('click', () => FarmSystem.closeModal());
        const btnSellAll = document.getElementById('btn-farm-sell-all');
        if (btnSellAll) btnSellAll.addEventListener('click', () => FarmSystem.sellAllSurplusProduce());

        // Battle Forge Buttons
        const btnForgeW = document.getElementById('btn-forge-weapon');
        if (btnForgeW) btnForgeW.addEventListener('click', () => BattleManager.upgradeWeaponForge());
        const btnForgeS = document.getElementById('btn-forge-shield');
        if (btnForgeS) btnForgeS.addEventListener('click', () => BattleManager.upgradeShieldForge());
    }
};

if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
if (typeof global !== 'undefined') {
    global.UIManager = UIManager;
}

