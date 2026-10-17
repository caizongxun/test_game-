/**
 * 3D Royal Piggy Farm - Farmland Agriculture System
 * Module: js/farm.js
 */

const FarmSystem = {
    plotMeshes: [],
    cropMeshes: [],
    plotsGroup: null,

    init() {
        this.buildFarmland3D();
        this.syncAllPlots3D();
    },

    buildFarmland3D() {
        this.plotsGroup = new THREE.Group();
        this.plotsGroup.position.set(9.8, 0.05, 0);
        scene.add(this.plotsGroup);

        const soilGeo = new THREE.BoxGeometry(2.1, 0.22, 2.1);
        const drySoilMat = createOrganicSurfaceMaterial(0x854d0e, 0.88);
        const borderMat = createOrganicSurfaceMaterial(0x54361c, 0.92);

        // 6 plots arranged in 2 rows of 3
        const plotOffsets = [
            [-2.4, -1.8], [0, -1.8], [2.4, -1.8],
            [-2.4,  1.8], [0,  1.8], [2.4,  1.8]
        ];

        this.plotMeshes = [];
        this.cropMeshes = [];

        plotOffsets.forEach(([px, pz], idx) => {
            const plotRoot = new THREE.Group();
            plotRoot.position.set(px, 0.11, pz);

            // Soil Bed
            const soilMesh = new THREE.Mesh(soilGeo, drySoilMat.clone());
            soilMesh.castShadow = true;
            soilMesh.receiveShadow = true;
            soilMesh.userData = { interactType: 'FARM_PLOT', plotIndex: idx };
            plotRoot.add(soilMesh);

            // Wooden Plot Border Logs
            const logGeoX = new THREE.CylinderGeometry(0.08, 0.08, 2.3, 8);
            const logGeoZ = new THREE.CylinderGeometry(0.08, 0.08, 2.3, 8);
            [ [0, -1.05, 0], [0, 1.05, 0] ].forEach(([lx, lz, rot]) => {
                const log = new THREE.Mesh(logGeoX, borderMat);
                log.rotation.z = Math.PI / 2;
                log.position.set(0, 0.12, lz);
                plotRoot.add(log);
            });
            [ [-1.05, 0], [1.05, 0] ].forEach(([lx, lz]) => {
                const log = new THREE.Mesh(logGeoZ, borderMat);
                log.rotation.x = Math.PI / 2;
                log.position.set(lx, 0.12, 0);
                plotRoot.add(log);
            });

            // Crop container
            const cropContainer = new THREE.Group();
            cropContainer.position.set(0, 0.15, 0);
            plotRoot.add(cropContainer);

            // Status Badge Billboard
            const badgeCanvas = document.createElement('canvas');
            badgeCanvas.width = 128;
            badgeCanvas.height = 64;
            const badgeTex = new THREE.CanvasTexture(badgeCanvas);
            const badgeSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex, transparent: true, depthTest: false }));
            badgeSprite.scale.set(1.4, 0.7, 1);
            badgeSprite.position.set(0, 1.45, 0);
            plotRoot.add(badgeSprite);

            this.plotsGroup.add(plotRoot);
            this.plotMeshes.push({ root: plotRoot, soil: soilMesh, cropContainer, badgeSprite, badgeCanvas, badgeTex });
        });
    },

    syncAllPlots3D() {
        const unlockedCount = gameState.farmland.unlockedCount || 1;
        gameState.farmland.plots.forEach((p, idx) => {
            const meshInfo = this.plotMeshes[idx];
            if (!meshInfo) return;

            const isUnlocked = idx < unlockedCount;
            if (!isUnlocked) {
                meshInfo.soil.material.color.set(0x475569); // Locked slate tone
                this.updatePlotBadge(idx, '🔒 待開墾');
                while (meshInfo.cropContainer.children.length > 0) {
                    meshInfo.cropContainer.remove(meshInfo.cropContainer.children[0]);
                }
                return;
            }

            // Unlocked plot soil color (dry vs watered)
            meshInfo.soil.material.color.set(p.watered ? 0x3b220c : 0x854d0e);

            if (p.status === 'EMPTY') {
                this.updatePlotBadge(idx, '🌱 點擊播種');
                while (meshInfo.cropContainer.children.length > 0) {
                    meshInfo.cropContainer.remove(meshInfo.cropContainer.children[0]);
                }
            } else if (p.status === 'GROWING') {
                const crop = FARM_CROPS_CATALOG.find(c => c.id === p.cropId);
                const pct = Math.min(100, Math.floor(((p.elapsedSec || 0) / Math.max(1, p.totalSec)) * 100));
                this.updatePlotBadge(idx, `${crop ? crop.icon : ''} ${pct}%${p.watered ? ' 💧' : ''}`);
                this.renderGrowingCrop3D(meshInfo.cropContainer, crop, pct);
            } else if (p.status === 'RIPE') {
                const crop = FARM_CROPS_CATALOG.find(c => c.id === p.cropId);
                this.updatePlotBadge(idx, `✨ ${crop ? crop.icon : ''} 可收割！`);
                this.renderRipeCrop3D(meshInfo.cropContainer, crop);
            }
        });
    },

    updatePlotBadge(plotIndex, text) {
        const meshInfo = this.plotMeshes[plotIndex];
        if (!meshInfo || !meshInfo.badgeCanvas) return;
        const ctx = meshInfo.badgeCanvas.getContext('2d');
        ctx.clearRect(0, 0, 128, 64);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        if (ctx.roundRect) ctx.roundRect(4, 4, 120, 56, 12);
        else ctx.rect(4, 4, 120, 56);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 18px "Noto Sans TC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 32);

        meshInfo.badgeTex.needsUpdate = true;
    },

    renderGrowingCrop3D(container, crop, pct) {
        if (container.children.length === 0 || container.userData.lastPct !== Math.floor(pct / 20)) {
            while (container.children.length > 0) container.remove(container.children[0]);
            container.userData.lastPct = Math.floor(pct / 20);

            const sproutMat = createOrganicSurfaceMaterial(0x22c55e, 0.65);
            const scale = 0.35 + (pct / 100) * 0.55;

            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.05 * scale, 0.45 * scale, 8), sproutMat);
            stem.position.y = 0.22 * scale;
            container.add(stem);

            const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 8, 8), sproutMat);
            leaf1.scale.set(1.5, 0.3, 0.8);
            leaf1.position.set(0.12 * scale, 0.4 * scale, 0);
            leaf1.rotation.z = -0.4;
            container.add(leaf1);

            const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 8, 8), sproutMat);
            leaf2.scale.set(1.5, 0.3, 0.8);
            leaf2.position.set(-0.12 * scale, 0.38 * scale, 0);
            leaf2.rotation.z = 0.4;
            container.add(leaf2);
        }
    },

    renderRipeCrop3D(container, crop) {
        if (container.userData.isRipeRendered) return;
        while (container.children.length > 0) container.remove(container.children[0]);
        container.userData.isRipeRendered = true;

        const cropColor = new THREE.Color(crop ? crop.color : 0xf97316);
        const cropMat = createOrganicSurfaceMaterial(cropColor, 0.60);

        if (!crop || crop.ingCode === 'B') {
            // Carrot
            const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.72, 16), cropMat);
            carrot.rotation.z = Math.PI;
            carrot.position.y = 0.45;
            container.add(carrot);
            const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.32, 8), createOrganicSurfaceMaterial(0x16a34a, 0.65));
            foliage.position.y = 0.78;
            container.add(foliage);
        } else if (crop.ingCode === 'D' || crop.ingCode === 'G') {
            // Pumpkin / Watermelon
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), cropMat);
            sphere.scale.set(1.15, 0.9, 1.15);
            sphere.position.y = 0.36;
            container.add(sphere);
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8), createOrganicSurfaceMaterial(0x15803d, 0.7));
            stem.position.set(0, 0.72, 0);
            container.add(stem);
        } else if (crop.ingCode === 'C') {
            // Corn
            const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.68, 16), cropMat);
            cob.position.y = 0.42;
            container.add(cob);
            const husk = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.38, 8), createOrganicSurfaceMaterial(0x84cc16, 0.65));
            husk.position.y = 0.18;
            container.add(husk);
        } else {
            // General fruit/mushroom/truffle
            const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 14), cropMat);
            fruit.position.y = 0.38;
            container.add(fruit);
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), createOrganicSurfaceMaterial(0x22c55e, 0.6));
            leaf.scale.set(1.4, 0.3, 0.8);
            leaf.position.set(0.12, 0.72, 0);
            container.add(leaf);
        }
    },

    update(dt) {
        if (!gameState.farmland || !gameState.farmland.plots) return;

        let needsSync = false;
        const unlockedCount = gameState.farmland.unlockedCount || 1;

        gameState.farmland.plots.forEach((p, idx) => {
            if (idx >= unlockedCount) return;

            if (p.status === 'GROWING') {
                const speedMult = p.watered ? 1.6 : 1.0;
                p.elapsedSec = (p.elapsedSec || 0) + dt * speedMult;

                if (p.elapsedSec >= p.totalSec) {
                    p.status = 'RIPE';
                    needsSync = true;
                    if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(580);
                }
            }
        });

        // Autonomous pig harvesting check (every 2.5s)
        this.harvestCheckTimer = (this.harvestCheckTimer || 0) - dt;
        if (this.harvestCheckTimer <= 0) {
            this.harvestCheckTimer = 2.5;
            this.checkAutonomousHarvest();
        }

        if (needsSync) {
            this.syncAllPlots3D();
            this.renderModalIfOpen();
        }
    },

    checkAutonomousHarvest() {
        const ripePlotIdx = gameState.farmland.plots.findIndex((p, idx) => idx < gameState.farmland.unlockedCount && p.status === 'RIPE' && !p.isBeingHarvested);
        if (ripePlotIdx === -1) return;

        const ripePlot = gameState.farmland.plots[ripePlotIdx];
        if (!PigManager || PigManager.instances.length === 0) return;

        // Find idle pig
        const idlePig = PigManager.instances.find(p => p.aiState === 'WANDER');
        if (!idlePig) return;

        ripePlot.isBeingHarvested = true;
        const meshInfo = this.plotMeshes[ripePlotIdx];
        const worldPos = new THREE.Vector3();
        meshInfo.root.getWorldPosition(worldPos);

        idlePig.harvestCrop(worldPos, () => {
            this.executeHarvest(ripePlotIdx, true);
        });
    },

    unlockPlot(plotIndex) {
        const cost = FARMLAND_UNLOCK_COSTS[plotIndex] || 2000;
        if (gameState.coins < cost) {
            if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！需要 ${cost} 金幣開墾新土地`);
            return false;
        }
        gameState.coins -= cost;
        gameState.farmland.unlockedCount = Math.max(gameState.farmland.unlockedCount || 1, plotIndex + 1);
        saveGameState();
        this.syncAllPlots3D();
        this.renderModalIfOpen();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(640);
        return true;
    },

    plantSeed(plotIndex, seedId) {
        const crop = FARM_CROPS_CATALOG.find(c => c.id === seedId);
        if (!crop) return false;

        const hasInventory = (gameState.seedInventory && gameState.seedInventory[seedId] > 0);
        if (!hasInventory) {
            if (gameState.coins < crop.price) {
                if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！購買種子需 ${crop.price} 金幣`);
                return false;
            }
            gameState.coins -= crop.price;
        } else {
            gameState.seedInventory[seedId]--;
        }

        const plot = gameState.farmland.plots[plotIndex];
        plot.status = 'GROWING';
        plot.cropId = seedId;
        plot.elapsedSec = 0;
        plot.totalSec = crop.growSec;
        plot.watered = false;
        plot.isBeingHarvested = false;

        const meshInfo = this.plotMeshes[plotIndex];
        if (meshInfo) meshInfo.cropContainer.userData.isRipeRendered = false;

        saveGameState();
        this.syncAllPlots3D();
        this.renderModalIfOpen();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(460);
        return true;
    },

    waterPlot(plotIndex) {
        const plot = gameState.farmland.plots[plotIndex];
        if (!plot || plot.status !== 'GROWING' || plot.watered) return;
        plot.watered = true;
        saveGameState();
        this.syncAllPlots3D();
        this.renderModalIfOpen();
        if (typeof sfx !== 'undefined' && sfx.playSplash) sfx.playSplash();
    },

    speedUpPlot(plotIndex) {
        const plot = gameState.farmland.plots[plotIndex];
        if (!plot || plot.status !== 'GROWING') return;

        const remainingSec = Math.max(0, plot.totalSec - (plot.elapsedSec || 0));
        const coinCost = Math.max(15, Math.ceil(remainingSec * 0.8));

        if (gameState.coins < coinCost) {
            if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！催熟需要 ${coinCost} 金幣`);
            return;
        }

        gameState.coins -= coinCost;
        plot.elapsedSec = plot.totalSec;
        plot.status = 'RIPE';

        saveGameState();
        this.syncAllPlots3D();
        this.renderModalIfOpen();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(720);
        if (typeof spawn3DParticle === 'function') {
            const meshInfo = this.plotMeshes[plotIndex];
            const p = new THREE.Vector3();
            meshInfo.root.getWorldPosition(p);
            spawn3DParticle('SPARKLE', p.add(new THREE.Vector3(0, 1.2, 0)));
        }
    },

    executeHarvest(plotIndex, byPig = false) {
        const plot = gameState.farmland.plots[plotIndex];
        if (!plot || plot.status !== 'RIPE') return;

        const crop = FARM_CROPS_CATALOG.find(c => c.id === plot.cropId);
        const yieldAmt = crop ? Math.floor(crop.yieldMin + Math.random() * (crop.yieldMax - crop.yieldMin + 1)) : 2;

        if (crop) {
            gameState.ingStock[crop.ingCode] = (gameState.ingStock[crop.ingCode] || 0) + yieldAmt;
        }

        plot.status = 'EMPTY';
        plot.cropId = null;
        plot.elapsedSec = 0;
        plot.totalSec = 0;
        plot.watered = false;
        plot.isBeingHarvested = false;

        const meshInfo = this.plotMeshes[plotIndex];
        if (meshInfo) meshInfo.cropContainer.userData.isRipeRendered = false;

        saveGameState();
        this.syncAllPlots3D();
        this.renderModalIfOpen();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof syncTroughRecipeUI === 'function') syncTroughRecipeUI();

        const toast = byPig
            ? `🐷 小豬勤快收割了 ${yieldAmt} 份【${crop ? crop.name : '農作物'}】！已自動入庫！`
            : `🌾 成功收割了 ${yieldAmt} 份【${crop ? crop.name : '農作物'}】！已存入食材庫！`;
        if (typeof showHUDToast === 'function') showHUDToast(toast);
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(620);
    },

    sellIngredientsForCoins(code, amt) {
        const ing = INGREDIENTS.find(x => x.code === code);
        if (!ing || !gameState.ingStock[code] || gameState.ingStock[code] < amt) return;

        const earn = Math.round(ing.price * 1.6) * amt;
        gameState.ingStock[code] -= amt;
        gameState.coins += earn;

        saveGameState();
        this.renderModalIfOpen();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof syncTroughRecipeUI === 'function') syncTroughRecipeUI();
        if (typeof showHUDToast === 'function') showHUDToast(`💰 賣出 ${amt} 份【${ing.name}】，獲得 +${earn} 金幣！`);
        if (typeof sfx !== 'undefined' && sfx.playCoinDing) sfx.playCoinDing();
    },

    sellAllSurplusProduce() {
        let totalCoins = 0;
        INGREDIENTS.forEach(ing => {
            const stock = gameState.ingStock[ing.code] || 0;
            if (stock > 2) {
                const sellCount = stock - 2; // Keep 2 for cooking
                const earn = Math.round(ing.price * 1.6) * sellCount;
                gameState.ingStock[ing.code] = 2;
                totalCoins += earn;
            }
        });

        if (totalCoins > 0) {
            gameState.coins += totalCoins;
            saveGameState();
            this.renderModalIfOpen();
            if (typeof updateHUD === 'function') updateHUD();
            if (typeof syncTroughRecipeUI === 'function') syncTroughRecipeUI();
            if (typeof showHUDToast === 'function') showHUDToast(`💰 農場豐收大促銷！全部盈餘農產品已賣出，進帳 +${totalCoins} 金幣！`);
            if (typeof sfx !== 'undefined' && sfx.playCoinDing) sfx.playCoinDing();
        } else {
            if (typeof showHUDToast === 'function') showHUDToast(`目前庫存量適中，無多餘盈餘作物可批發賣出。`);
        }
    },

    openModal() {
        const modal = document.getElementById('modal-farm');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        this.renderModalUI();
    },

    closeModal() {
        const modal = document.getElementById('modal-farm');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    },

    renderModalIfOpen() {
        const modal = document.getElementById('modal-farm');
        if (modal && !modal.classList.contains('hidden')) {
            this.renderModalUI();
        }
    },

    renderModalUI() {
        const container = document.getElementById('farm-plots-container');
        if (!container) return;
        container.innerHTML = '';

        const unlockedCount = gameState.farmland.unlockedCount || 1;

        gameState.farmland.plots.forEach((p, idx) => {
            const isUnlocked = idx < unlockedCount;
            const cost = FARMLAND_UNLOCK_COSTS[idx] || 2000;
            const card = document.createElement('div');
            card.className = `p-3.5 rounded-2xl border flex flex-col justify-between transition ${
                !isUnlocked
                    ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                    : (p.status === 'RIPE' ? 'bg-amber-950/40 border-amber-400 shadow-lg' : 'bg-slate-900/80 border-slate-700/80')
            }`;

            if (!isUnlocked) {
                card.innerHTML = `
                    <div class="text-center py-5 space-y-2">
                        <div class="text-3xl">🔒</div>
                        <div class="font-black text-slate-400 text-sm">農田地塊 #${idx + 1}</div>
                        <div class="text-xs text-amber-300 font-bold">開墾費用：${cost} 金幣</div>
                        <button class="mt-2 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow" onclick="FarmSystem.unlockPlot(${idx})">
                            立即開墾
                        </button>
                    </div>
                `;
            } else if (p.status === 'EMPTY') {
                card.innerHTML = `
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-xs font-bold text-slate-300">
                            <span>農田地塊 #${idx + 1}</span>
                            <span class="text-emerald-400">土壤肥沃</span>
                        </div>
                        <div class="text-center py-4 text-slate-400 text-xs">
                            尚未種植作物
                        </div>
                        <div class="pt-2 border-t border-slate-800">
                            <label class="text-[10px] text-slate-400 block mb-1">選擇種子：</label>
                            <select id="sel-seed-${idx}" class="w-full bg-slate-950 border border-slate-700 text-xs rounded-xl p-1.5 text-white mb-2">
                                ${FARM_CROPS_CATALOG.map(c => `<option value="${c.id}">${c.icon} ${c.name} (${c.price}c · ${c.growSec}s)</option>`).join('')}
                            </select>
                            <button class="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs transition shadow" onclick="FarmSystem.plantSeed(${idx}, document.getElementById('sel-seed-${idx}').value)">
                                播種下田
                            </button>
                        </div>
                    </div>
                `;
            } else if (p.status === 'GROWING') {
                const crop = FARM_CROPS_CATALOG.find(c => c.id === p.cropId);
                const remaining = Math.max(0, Math.ceil(p.totalSec - (p.elapsedSec || 0)));
                const speedCost = Math.max(15, Math.ceil(remaining * 0.8));
                const pct = Math.min(100, Math.floor(((p.elapsedSec || 0) / p.totalSec) * 100));

                card.innerHTML = `
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-xs font-bold text-white">
                            <span>#${idx + 1} ${crop ? crop.icon : ''} ${crop ? crop.name : '作物'}</span>
                            <span class="${p.watered ? 'text-sky-300' : 'text-amber-400'}">${p.watered ? '💧 已澆水 (+60%)' : '缺水中'}</span>
                        </div>
                        <div class="space-y-1">
                            <div class="flex justify-between text-[11px] text-slate-300">
                                <span>生長進度 (${pct}%)</span>
                                <span>剩餘 ${remaining} 秒</span>
                            </div>
                            <div class="w-full h-2.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style="width: ${pct}%"></div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                            <button class="py-1.5 px-2 rounded-xl ${p.watered ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-sky-500/25 border border-sky-400/50 hover:bg-sky-500/40 text-sky-200'} text-xs font-bold transition" onclick="FarmSystem.waterPlot(${idx})" ${p.watered ? 'disabled' : ''}>
                                💧 澆水加速
                            </button>
                            <button class="py-1.5 px-2 rounded-xl bg-amber-500/25 border border-amber-400/50 hover:bg-amber-500/40 text-amber-200 text-xs font-bold transition" onclick="FarmSystem.speedUpPlot(${idx})">
                                ⚡ ${speedCost}c 催熟
                            </button>
                        </div>
                    </div>
                `;
            } else if (p.status === 'RIPE') {
                const crop = FARM_CROPS_CATALOG.find(c => c.id === p.cropId);
                card.innerHTML = `
                    <div class="space-y-2 text-center py-2">
                        <div class="text-4xl animate-bounce">${crop ? crop.icon : '🌾'}</div>
                        <div class="font-black text-amber-300 text-sm">【${crop ? crop.name : '作物'}】大豐收！</div>
                        <p class="text-[11px] text-slate-300">預計可採集 ${crop ? crop.yieldMin + '-' + crop.yieldMax : '2-4'} 份食材！小豬亦會自行前往採集！</p>
                        <button class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 text-slate-950 font-black text-xs transition shadow-lg animate-pulse" onclick="FarmSystem.executeHarvest(${idx}, false)">
                            🌾 立即手動收割入庫
                        </button>
                    </div>
                `;
            }

            container.appendChild(card);
        });

        // Update warehouse wholesale table
        const stockEl = document.getElementById('farm-stock-summary');
        if (stockEl) {
            stockEl.innerHTML = INGREDIENTS.map(ing => {
                const count = gameState.ingStock[ing.code] || 0;
                const sellPrice = Math.round(ing.price * 1.6);
                return `
                    <div class="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                        <span class="font-bold text-slate-200">${ing.short}：<span class="text-amber-300">${count}</span></span>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[10px] text-slate-400">${sellPrice}c/個</span>
                            <button class="px-2 py-0.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold ${count <= 0 ? 'opacity-50 cursor-not-allowed' : ''}" onclick="FarmSystem.sellIngredientsForCoins('${ing.code}', 1)" ${count <= 0 ? 'disabled' : ''}>
                                賣 1 個
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
};

if (typeof window !== 'undefined') {
    window.FarmSystem = FarmSystem;
}
if (typeof global !== 'undefined') {
    global.FarmSystem = FarmSystem;
}

