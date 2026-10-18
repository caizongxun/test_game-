/**
 * 3D Royal Piggy Farm - Dedicated Farmland Agriculture Plateau Scene & Tools System
 * Module: js/farm.js
 */

const FarmSystem = {
    // 3D Scene Group
    farmGroup: null,
    plotsGroup: null,
    toolsGroup: null,
    decorationsGroup: null,
    sprinklerGroup: null,
    harvesterCartGroup: null,

    // Plots & meshes tracking
    plotMeshes: [],
    expandSignMesh: null,
    activeTool: 'WATER', // 'SEED', 'WATER', 'SCYTHE', 'FERTILIZE'
    selectedSeedId: 'seed_A',

    // Automation timers & states
    autoSowerTimer: 0,
    autoSprinklerTimer: 0,
    autoHarvesterTimer: 0,
    sprinklerRotation: 0,
    isFarmSceneActive: false,

    init() {
        this.buildFarmland3DScene();
        this.syncAllPlots3D();
        this.updateFarmHUD();
    },

    buildFarmland3DScene() {
        if (this.farmGroup) {
            scene.remove(this.farmGroup);
        }

        this.farmGroup = new THREE.Group();
        this.farmGroup.name = 'DedicatedFarmPlateauScene';
        this.farmGroup.visible = false;
        scene.add(this.farmGroup);

        // 1. Lush Farmland Terrace Ground (Expansive Plateau)
        const groundGeo = new THREE.BoxGeometry(46, 1.2, 46);
        const groundMat = createOrganicSurfaceMaterial(0x2d5a27, 0.85); // Rich meadow grass
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = -0.6;
        ground.receiveShadow = true;
        this.farmGroup.add(ground);

        // Plateau Soil Layer in center
        const soilTerraceGeo = new THREE.BoxGeometry(32, 0.25, 32);
        const soilTerraceMat = createOrganicSurfaceMaterial(0x603813, 0.95);
        const soilTerrace = new THREE.Mesh(soilTerraceGeo, soilTerraceMat);
        soilTerrace.position.set(0, 0.05, 0);
        soilTerrace.receiveShadow = true;
        this.farmGroup.add(soilTerrace);

        // 2. Decorative Rustic Farmhouse, Windmill & Wooden Fences
        this.buildFarmEnvironmentDecorations();

        // 3. Dynamic Expandable Soil Plots Group
        this.plotsGroup = new THREE.Group();
        this.plotsGroup.position.set(0, 0.12, 0);
        this.farmGroup.add(this.plotsGroup);

        // 4. 3D Tools Rack / Dock in the field
        this.build3DToolDock();

        // 5. Automation Visuals (Sprinkler & Harvester)
        this.buildAutomationVisuals();

        // Build plot meshes for current unlocked + available plots
        this.rebuildPlotMeshes();
    },

    buildFarmEnvironmentDecorations() {
        this.decorationsGroup = new THREE.Group();
        this.farmGroup.add(this.decorationsGroup);

        const woodMat = createOrganicSurfaceMaterial(0x8b5a2b, 0.85);
        const roofMat = createOrganicSurfaceMaterial(0xb91c1c, 0.75);
        const stoneMat = createOrganicSurfaceMaterial(0x64748b, 0.9);

        // A. Rustic Farmhouse (Corner -12, 0, -12)
        const barn = new THREE.Group();
        barn.position.set(-11, 0, -11);

        const barnBody = new THREE.Mesh(new THREE.BoxGeometry(5.5, 4.2, 5.5), woodMat);
        barnBody.position.y = 2.1;
        barnBody.castShadow = true;
        barnBody.receiveShadow = true;
        barn.add(barnBody);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(4.5, 2.5, 4), roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 5.2;
        roof.castShadow = true;
        barn.add(roof);

        // Barn Door
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.15), createOrganicSurfaceMaterial(0x3e2723, 0.9));
        door.position.set(0, 1.3, 2.8);
        barn.add(door);
        this.decorationsGroup.add(barn);

        // B. Windmill (Corner 11, 0, -11)
        const windmill = new THREE.Group();
        windmill.position.set(11, 0, -11);
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 6.5, 10), stoneMat);
        tower.position.y = 3.25;
        tower.castShadow = true;
        windmill.add(tower);

        const wDome = new THREE.Mesh(new THREE.SphereGeometry(1.45, 10, 8), roofMat);
        wDome.position.y = 6.5;
        windmill.add(wDome);

        // Windmill Blades
        const bladeHub = new THREE.Group();
        bladeHub.position.set(0, 6.4, 1.45);
        for (let b = 0; b < 4; b++) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.2, 0.08), woodMat);
            blade.position.y = 1.6;
            blade.rotation.z = (b * Math.PI) / 2;
            const pivot = new THREE.Group();
            pivot.rotation.z = (b * Math.PI) / 2;
            pivot.add(blade);
            bladeHub.add(pivot);
        }
        windmill.add(bladeHub);
        this.windmillBlades = bladeHub;
        this.decorationsGroup.add(windmill);

        // C. Water Well (Corner -11, 0, 11)
        const well = new THREE.Group();
        well.position.set(-11, 0, 10);
        const wellRim = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 12, 1, true), stoneMat);
        wellRim.position.y = 0.4;
        wellRim.castShadow = true;
        well.add(wellRim);
        const wellWater = new THREE.Mesh(new THREE.CircleGeometry(1.15, 12), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        wellWater.rotation.x = -Math.PI / 2;
        wellWater.position.y = 0.65;
        well.add(wellWater);
        this.decorationsGroup.add(well);

        // D. Perimeter Wooden Rail Fences
        const fenceMat = createOrganicSurfaceMaterial(0x78350f, 0.9);
        const fencePostGeo = new THREE.CylinderGeometry(0.08, 0.09, 1.1, 6);
        const fenceRailGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.8, 6);

        [-15, 15].forEach(fx => {
            for (let fz = -14; fz <= 14; fz += 3.8) {
                const post = new THREE.Mesh(fencePostGeo, fenceMat);
                post.position.set(fx, 0.55, fz);
                this.decorationsGroup.add(post);

                const rail1 = new THREE.Mesh(fenceRailGeo, fenceMat);
                rail1.rotation.x = Math.PI / 2;
                rail1.position.set(fx, 0.75, fz + 1.9);
                this.decorationsGroup.add(rail1);

                const rail2 = new THREE.Mesh(fenceRailGeo, fenceMat);
                rail2.rotation.x = Math.PI / 2;
                rail2.position.set(fx, 0.4, fz + 1.9);
                this.decorationsGroup.add(rail2);
            }
        });
    },

    build3DToolDock() {
        this.toolsGroup = new THREE.Group();
        this.toolsGroup.position.set(0, 0.15, 9.8);
        this.farmGroup.add(this.toolsGroup);

        // Wooden tool table
        const tableGeo = new THREE.BoxGeometry(6.5, 0.45, 1.4);
        const tableMat = createOrganicSurfaceMaterial(0x8b5a2b, 0.85);
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.y = 0.22;
        table.castShadow = true;
        table.receiveShadow = true;
        this.toolsGroup.add(table);

        // 1. Tool: Seed Pouch (Position -2.0)
        const seedGroup = new THREE.Group();
        seedGroup.position.set(-2.0, 0.5, 0);
        const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), createOrganicSurfaceMaterial(0xd97706, 0.8));
        pouch.scale.set(1.0, 1.25, 1.0);
        seedGroup.add(pouch);
        seedGroup.userData = { interactType: 'FARM_TOOL', toolId: 'SEED' };
        seedGroup.traverse(c => { c.userData = seedGroup.userData; });
        this.toolsGroup.add(seedGroup);

        // 2. Tool: Watering Can (Position -0.7)
        const waterGroup = new THREE.Group();
        waterGroup.position.set(-0.7, 0.5, 0);
        const canBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.5, 12), createOrganicSurfaceMaterial(0x0284c7, 0.5));
        waterGroup.add(canBody);
        const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.4, 8), createOrganicSurfaceMaterial(0x0369a1, 0.5));
        spout.rotation.z = Math.PI / 3;
        spout.position.set(0.32, 0.22, 0);
        waterGroup.add(spout);
        waterGroup.userData = { interactType: 'FARM_TOOL', toolId: 'WATER' };
        waterGroup.traverse(c => { c.userData = waterGroup.userData; });
        this.toolsGroup.add(waterGroup);

        // 3. Tool: Scythe / 鐮刀 (Position 0.7)
        const scytheGroup = new THREE.Group();
        scytheGroup.position.set(0.7, 0.55, 0);
        const scytheHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), createOrganicSurfaceMaterial(0x78350f, 0.9));
        scytheHandle.rotation.z = Math.PI / 4;
        scytheGroup.add(scytheHandle);
        const bladeGeo = new THREE.TorusGeometry(0.32, 0.04, 6, 16, Math.PI * 0.7);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
        const scytheBlade = new THREE.Mesh(bladeGeo, bladeMat);
        scytheBlade.position.set(0.3, 0.3, 0);
        scytheBlade.rotation.z = -Math.PI / 3;
        scytheGroup.add(scytheBlade);
        scytheGroup.userData = { interactType: 'FARM_TOOL', toolId: 'SCYTHE' };
        scytheGroup.traverse(c => { c.userData = scytheGroup.userData; });
        this.toolsGroup.add(scytheGroup);

        // 4. Tool: Golden Fertilizer (Position 2.0)
        const fertGroup = new THREE.Group();
        fertGroup.position.set(2.0, 0.5, 0);
        const fertMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.3), createOrganicSurfaceMaterial(0xf59e0b, 0.5));
        fertGroup.add(fertMesh);
        fertGroup.userData = { interactType: 'FARM_TOOL', toolId: 'FERTILIZE' };
        fertGroup.traverse(c => { c.userData = fertGroup.userData; });
        this.toolsGroup.add(fertGroup);
    },

    buildAutomationVisuals() {
        // Sprinkler in middle of field
        this.sprinklerGroup = new THREE.Group();
        this.sprinklerGroup.position.set(0, 0.12, 0);
        this.sprinklerGroup.visible = false;

        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.8, 8), createOrganicSurfaceMaterial(0x475569, 0.6));
        stand.position.y = 0.4;
        this.sprinklerGroup.add(stand);

        const sprinklerHead = new THREE.Group();
        sprinklerHead.position.y = 0.82;
        const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), createOrganicSurfaceMaterial(0x38bdf8, 0.3));
        arm1.rotation.z = Math.PI / 2;
        sprinklerHead.add(arm1);
        this.sprinklerGroup.add(sprinklerHead);
        this.sprinklerHead = sprinklerHead;
        this.farmGroup.add(this.sprinklerGroup);

        // Pig Harvester Cart (Automated Helper)
        this.harvesterCartGroup = new THREE.Group();
        this.harvesterCartGroup.position.set(-6, 0.12, 6);
        this.harvesterCartGroup.visible = false;

        const cartBox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.8), createOrganicSurfaceMaterial(0x92400e, 0.8));
        cartBox.position.y = 0.5;
        this.harvesterCartGroup.add(cartBox);

        // Tiny mechanical pig driver
        const driverPig = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), createOrganicSurfaceMaterial(0xffb6c1, 0.7));
        driverPig.position.set(0, 0.95, -0.4);
        this.harvesterCartGroup.add(driverPig);

        // Turning harvester blades in front
        const bladeWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.4, 8), createOrganicSurfaceMaterial(0x94a3b8, 0.4));
        bladeWheel.rotation.z = Math.PI / 2;
        bladeWheel.position.set(0, 0.4, 1.1);
        this.harvesterCartGroup.add(bladeWheel);
        this.harvesterBlade = bladeWheel;
        this.farmGroup.add(this.harvesterCartGroup);
    },

    rebuildPlotMeshes() {
        while (this.plotsGroup.children.length > 0) {
            this.plotsGroup.remove(this.plotsGroup.children[0]);
        }
        this.plotMeshes = [];

        const totalPlots = Math.max(6, (gameState.farmland.unlockedCount || 2) + 1);
        while (gameState.farmland.plots.length < totalPlots) {
            gameState.farmland.plots.push({
                id: gameState.farmland.plots.length,
                status: 'EMPTY',
                cropId: null,
                plantTime: 0,
                totalSec: 0,
                watered: false
            });
        }

        const soilGeo = new THREE.BoxGeometry(2.2, 0.24, 2.2);
        const drySoilMat = createOrganicSurfaceMaterial(0x78350f, 0.92);
        const borderMat = createOrganicSurfaceMaterial(0x451a03, 0.95);

        const cols = 3;
        const spacingX = 2.8;
        const spacingZ = 2.8;
        const startZ = -4.5;

        for (let idx = 0; idx < totalPlots; idx++) {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const px = (col - 1) * spacingX;
            const pz = startZ + row * spacingZ;

            const plotRoot = new THREE.Group();
            plotRoot.position.set(px, 0.12, pz);

            // Soil Bed
            const soilMesh = new THREE.Mesh(soilGeo, drySoilMat.clone());
            soilMesh.castShadow = true;
            soilMesh.receiveShadow = true;
            soilMesh.userData = { interactType: 'FARM_PLOT', plotIndex: idx, ref: this };
            plotRoot.add(soilMesh);

            // Wooden border logs
            const logX = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.35, 8), borderMat);
            logX.rotation.z = Math.PI / 2;
            logX.position.set(0, 0.14, -1.1);
            plotRoot.add(logX);
            const logX2 = logX.clone();
            logX2.position.set(0, 0.14, 1.1);
            plotRoot.add(logX2);

            const logZ = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.35, 8), borderMat);
            logZ.rotation.x = Math.PI / 2;
            logZ.position.set(-1.1, 0.14, 0);
            plotRoot.add(logZ);
            const logZ2 = logZ.clone();
            logZ2.position.set(1.1, 0.14, 0);
            plotRoot.add(logZ2);

            // Crop container
            const cropContainer = new THREE.Group();
            cropContainer.position.set(0, 0.15, 0);
            plotRoot.add(cropContainer);

            // Status Badge Billboard
            const badgeCanvas = document.createElement('canvas');
            badgeCanvas.width = 160;
            badgeCanvas.height = 72;
            const badgeTex = new THREE.CanvasTexture(badgeCanvas);
            const badgeSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex, transparent: true, depthTest: false }));
            badgeSprite.scale.set(1.5, 0.72, 1);
            badgeSprite.position.set(0, 1.45, 0);
            plotRoot.add(badgeSprite);

            this.plotsGroup.add(plotRoot);
            this.plotMeshes.push({
                root: plotRoot,
                soil: soilMesh,
                cropContainer,
                badgeSprite,
                badgeCanvas,
                badgeTex,
                index: idx
            });
        }

        // Add 3D "➕ 開墾新土地" sign right after last plot
        const nextIdx = gameState.farmland.unlockedCount || 2;
        const col = nextIdx % cols;
        const row = Math.floor(nextIdx / cols);
        const signPx = (col - 1) * spacingX;
        const signPz = startZ + row * spacingZ;

        const signGroup = new THREE.Group();
        signGroup.position.set(signPx, 0.12, signPz);

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 8), createOrganicSurfaceMaterial(0x78350f, 0.9));
        post.position.y = 0.7;
        signGroup.add(post);

        const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.12), createOrganicSurfaceMaterial(0xf59e0b, 0.6));
        board.position.y = 1.15;
        board.userData = { interactType: 'FARM_EXPAND_SIGN' };
        signGroup.add(board);

        const signCanvas = document.createElement('canvas');
        signCanvas.width = 160;
        signCanvas.height = 80;
        const sCtx = signCanvas.getContext('2d');
        sCtx.fillStyle = '#f59e0b';
        sCtx.fillRect(0, 0, 160, 80);
        sCtx.font = 'bold 22px sans-serif';
        sCtx.fillStyle = '#0f172a';
        sCtx.textAlign = 'center';
        sCtx.fillText('➕ 開墾地塊', 80, 36);
        const cost = this.getNextPlotCost();
        sCtx.font = 'bold 16px sans-serif';
        sCtx.fillText(`${cost} 金幣`, 80, 62);
        const signTex = new THREE.CanvasTexture(signCanvas);
        const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTex, transparent: true }));
        signSprite.scale.set(1.4, 0.7, 1);
        signSprite.position.set(0, 1.15, 0.1);
        signGroup.add(signSprite);

        signGroup.userData = { interactType: 'FARM_EXPAND_SIGN' };
        signGroup.traverse(c => { c.userData = signGroup.userData; });
        this.plotsGroup.add(signGroup);
        this.expandSignMesh = signGroup;
    },

    getNextPlotCost() {
        const cur = gameState.farmland.unlockedCount || 2;
        return Math.floor(500 + Math.pow(cur, 1.45) * 280);
    },

    syncAllPlots3D() {
        const unlockedCount = gameState.farmland.unlockedCount || 2;

        gameState.farmland.plots.forEach((p, idx) => {
            const meshInfo = this.plotMeshes[idx];
            if (!meshInfo) return;

            const isUnlocked = idx < unlockedCount;
            if (!isUnlocked) {
                meshInfo.soil.material.color.set(0x334155); // Locked slate
                const cost = this.getNextPlotCost();
                this.updatePlotBadge(idx, `🔒 待開墾\n${cost}c`, '#94a3b8');
                while (meshInfo.cropContainer.children.length > 0) {
                    meshInfo.cropContainer.remove(meshInfo.cropContainer.children[0]);
                }
                return;
            }

            // Unlocked soil color
            meshInfo.soil.material.color.set(p.watered ? 0x271406 : 0x78350f);

            if (p.status === 'EMPTY') {
                this.updatePlotBadge(idx, '🌱 點擊/拖曳播種', '#38bdf8');
                while (meshInfo.cropContainer.children.length > 0) {
                    meshInfo.cropContainer.remove(meshInfo.cropContainer.children[0]);
                }
            } else if (p.status === 'GROWING') {
                const crop = FARM_CROPS_CATALOG.find(c => c.id === p.cropId);
                const pct = Math.min(100, Math.floor(((p.elapsedSec || 0) / Math.max(1, p.totalSec)) * 100));
                this.updatePlotBadge(idx, `${crop ? crop.icon : '🌱'} ${pct}%${p.watered ? ' 💧' : ''}`, p.watered ? '#38bdf8' : '#fbbf24');
                this.renderGrowingCrop3D(meshInfo.cropContainer, crop, pct);
            } else if (p.status === 'RIPE') {
                const crop = FARM_CROPS_CATALOG.find(c => c.id === p.cropId);
                this.updatePlotBadge(idx, `✨ ${crop ? crop.icon : ''} 鐮刀收割！`, '#22c55e');
                this.renderRipeCrop3D(meshInfo.cropContainer, crop);
            }
        });

        // Sync automation visuals visibility
        const auto = gameState.farmland.automation || {};
        if (this.sprinklerGroup) this.sprinklerGroup.visible = !!auto.autoSprinkler;
        if (this.harvesterCartGroup) this.harvesterCartGroup.visible = !!auto.autoHarvester;
    },

    updatePlotBadge(plotIndex, text, textColor = '#ffffff') {
        const meshInfo = this.plotMeshes[plotIndex];
        if (!meshInfo || !meshInfo.badgeCanvas) return;
        const ctx = meshInfo.badgeCanvas.getContext('2d');
        ctx.clearRect(0, 0, 160, 72);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        if (ctx.roundRect) ctx.roundRect(4, 4, 152, 64, 14);
        else ctx.rect(4, 4, 152, 64);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 18px "Noto Sans TC", sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = text.split('\n');
        if (lines.length > 1) {
            ctx.fillText(lines[0], 80, 26);
            ctx.font = 'bold 14px "Noto Sans TC", sans-serif';
            ctx.fillText(lines[1], 80, 48);
        } else {
            ctx.fillText(text, 80, 36);
        }

        meshInfo.badgeTex.needsUpdate = true;
    },

    renderGrowingCrop3D(container, crop, pct) {
        if (container.children.length === 0 || container.userData.lastPct !== Math.floor(pct / 20)) {
            while (container.children.length > 0) container.remove(container.children[0]);
            container.userData.lastPct = Math.floor(pct / 20);

            const sproutMat = createOrganicSurfaceMaterial(0x22c55e, 0.65);
            const scale = 0.35 + (pct / 100) * 0.65;

            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.05 * scale, 0.5 * scale, 8), sproutMat);
            stem.position.y = 0.25 * scale;
            container.add(stem);

            const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.14 * scale, 8, 8), sproutMat);
            leaf1.scale.set(1.5, 0.3, 0.8);
            leaf1.position.set(0.14 * scale, 0.45 * scale, 0);
            leaf1.rotation.z = -0.4;
            container.add(leaf1);

            const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.14 * scale, 8, 8), sproutMat);
            leaf2.scale.set(1.5, 0.3, 0.8);
            leaf2.position.set(-0.14 * scale, 0.42 * scale, 0);
            leaf2.rotation.z = 0.4;
            container.add(leaf2);
        }
    },

    renderRipeCrop3D(container, crop) {
        if (container.userData.isRipeRendered) return;
        while (container.children.length > 0) container.remove(container.children[0]);
        container.userData.isRipeRendered = true;

        const ingCode = crop ? crop.ingCode : 'A';

        // Load Real GLB Model from chibi_ingredients_glb_10pack/
        if (typeof IngredientGLBLoader !== 'undefined' && INGREDIENT_GLB_MAP[ingCode]) {
            IngredientGLBLoader.load(ingCode, glbScene => {
                while (container.children.length > 0) container.remove(container.children[0]);
                const model = glbScene.clone();
                model.scale.set(0.55, 0.55, 0.55);
                model.position.set(0, 0.35, 0);
                model.traverse(ch => {
                    if (ch.isMesh) {
                        ch.castShadow = true;
                        ch.receiveShadow = true;
                    }
                });
                container.add(model);
            });
            return;
        }

        // Procedural fallback
        const cropColor = new THREE.Color(crop ? crop.color : 0xf97316);
        const cropMat = createOrganicSurfaceMaterial(cropColor, 0.60);
        const fallbackMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), cropMat);
        fallbackMesh.position.y = 0.45;
        container.add(fallbackMesh);
    },

    handlePlotInteraction(plotIndex) {
        const unlockedCount = gameState.farmland.unlockedCount || 2;
        if (plotIndex >= unlockedCount) {
            this.buyNextPlot();
            return;
        }

        const plot = gameState.farmland.plots[plotIndex];
        if (!plot) return;

        // Based on active tool or plot state
        if (plot.status === 'EMPTY') {
            this.plantSeed(plotIndex, this.selectedSeedId);
        } else if (plot.status === 'GROWING') {
            if (this.activeTool === 'FERTILIZE') {
                this.speedUpPlot(plotIndex);
            } else {
                this.waterPlot(plotIndex);
            }
        } else if (plot.status === 'RIPE') {
            this.executeHarvest(plotIndex, false);
        }
    },

    setActiveTool(toolId) {
        this.activeTool = toolId;
        const toolNames = {
            SEED: '🌰 種子袋',
            WATER: '💧 澆水壺',
            SCYTHE: '🌾 收割鐮刀',
            FERTILIZE: '⚡ 金幣催熟劑'
        };
        if (typeof showHUDToast === 'function') {
            showHUDToast(`已切換農具：【${toolNames[toolId] || toolId}】`);
        }
        this.updateFarmHUD();
    },

    buyNextPlot() {
        const cost = this.getNextPlotCost();
        if (gameState.coins < cost) {
            if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！開墾新地塊需 ${cost} 金幣`);
            return false;
        }

        gameState.coins -= cost;
        gameState.farmland.unlockedCount = (gameState.farmland.unlockedCount || 2) + 1;
        saveGameState();

        this.rebuildPlotMeshes();
        this.syncAllPlots3D();
        this.updateFarmHUD();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof sfx !== 'undefined' && sfx.playCoinDing) sfx.playCoinDing();
        if (typeof showHUDToast === 'function') showHUDToast(`🎉 成功開墾第 ${gameState.farmland.unlockedCount} 塊皇家土地！`);
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
        this.updateFarmHUD();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(460);

        if (typeof spawn3DParticle === 'function') {
            const pos = new THREE.Vector3();
            if (meshInfo) meshInfo.root.getWorldPosition(pos);
            spawn3DParticle('SPARKLE', pos.add(new THREE.Vector3(0, 0.6, 0)));
        }
        return true;
    },

    waterPlot(plotIndex) {
        const plot = gameState.farmland.plots[plotIndex];
        if (!plot || plot.status !== 'GROWING' || plot.watered) return;
        plot.watered = true;
        saveGameState();
        this.syncAllPlots3D();
        this.updateFarmHUD();
        if (typeof sfx !== 'undefined' && sfx.playSplash) sfx.playSplash();

        if (typeof spawn3DParticle === 'function') {
            const meshInfo = this.plotMeshes[plotIndex];
            const pos = new THREE.Vector3();
            if (meshInfo) meshInfo.root.getWorldPosition(pos);
            spawn3DParticle('SPLASH', pos.add(new THREE.Vector3(0, 0.8, 0)));
        }
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
        this.updateFarmHUD();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(720);
        if (typeof spawn3DParticle === 'function') {
            const meshInfo = this.plotMeshes[plotIndex];
            const p = new THREE.Vector3();
            if (meshInfo) meshInfo.root.getWorldPosition(p);
            spawn3DParticle('STAR', p.add(new THREE.Vector3(0, 1.2, 0)));
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
        this.updateFarmHUD();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof syncTroughRecipeUI === 'function') syncTroughRecipeUI();

        const toast = byPig
            ? `🐷 小豬收割車採集了 ${yieldAmt} 份【${crop ? crop.name : '農作物'}】！`
            : `🌾 鐮刀揮舞！成功收割 ${yieldAmt} 份【${crop ? crop.name : '農作物'}】！已存入食材庫！`;
        if (typeof showHUDToast === 'function') showHUDToast(toast);
        if (typeof sfx !== 'undefined' && sfx.playSlash) sfx.playSlash();
    },

    buyAutomation(type) {
        if (!gameState.farmland.automation) {
            gameState.farmland.automation = {};
        }

        const costs = {
            autoSower: 2500,
            autoSprinkler: 3800,
            autoHarvester: 5500
        };
        const names = {
            autoSower: '🤖 自動播種機',
            autoSprinkler: '🌧️ 旋轉噴灌系統',
            autoHarvester: '🚜 小豬自動收割推車'
        };

        const cost = costs[type];
        if (gameState.coins < cost) {
            if (typeof showHUDToast === 'function') showHUDToast(`金幣不足！購買【${names[type]}】需 ${cost} 金幣`);
            return;
        }

        gameState.coins -= cost;
        gameState.farmland.automation[type] = true;
        saveGameState();
        this.syncAllPlots3D();
        this.updateFarmHUD();
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof sfx !== 'undefined' && sfx.playVictoryFanfare) sfx.playVictoryFanfare();
        if (typeof showHUDToast === 'function') showHUDToast(`🎉 成功安裝【${names[type]}】！農田進入全自動時代！`);
    },

    update(dt) {
        if (!gameState.farmland || !gameState.farmland.plots) return;

        // Windmill spin
        if (this.windmillBlades) {
            this.windmillBlades.rotation.z += dt * 0.8;
        }

        // Sprinkler rotation
        if (this.sprinklerHead && this.sprinklerGroup.visible) {
            this.sprinklerHead.rotation.y += dt * 3.5;
        }

        // Harvester cart blade rotation
        if (this.harvesterBlade && this.harvesterCartGroup.visible) {
            this.harvesterBlade.rotation.x += dt * 4.0;
        }

        let needsSync = false;
        const unlockedCount = gameState.farmland.unlockedCount || 2;

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

        // Automation 1: Auto Sprinkler (every 4s)
        const auto = gameState.farmland.automation || {};
        if (auto.autoSprinkler) {
            this.autoSprinklerTimer -= dt;
            if (this.autoSprinklerTimer <= 0) {
                this.autoSprinklerTimer = 4.0;
                let wateredAny = false;
                gameState.farmland.plots.forEach((p, idx) => {
                    if (idx < unlockedCount && p.status === 'GROWING' && !p.watered) {
                        p.watered = true;
                        wateredAny = true;
                    }
                });
                if (wateredAny) {
                    needsSync = true;
                    if (typeof sfx !== 'undefined' && sfx.playSplash) sfx.playSplash();
                }
            }
        }

        // Automation 2: Auto Sower (every 3s)
        if (auto.autoSower) {
            this.autoSowerTimer -= dt;
            if (this.autoSowerTimer <= 0) {
                this.autoSowerTimer = 3.0;
                const emptyIdx = gameState.farmland.plots.findIndex((p, idx) => idx < unlockedCount && p.status === 'EMPTY');
                if (emptyIdx !== -1) {
                    this.plantSeed(emptyIdx, this.selectedSeedId);
                }
            }
        }

        // Automation 3: Auto Harvester (every 3s)
        if (auto.autoHarvester) {
            this.autoHarvesterTimer -= dt;
            if (this.autoHarvesterTimer <= 0) {
                this.autoHarvesterTimer = 3.0;
                const ripeIdx = gameState.farmland.plots.findIndex((p, idx) => idx < unlockedCount && p.status === 'RIPE' && !p.isBeingHarvested);
                if (ripeIdx !== -1) {
                    this.executeHarvest(ripeIdx, true);
                }
            }
        }

        if (needsSync) {
            this.syncAllPlots3D();
            this.updateFarmHUD();
        }
    },

    enterFarmScene() {
        this.isFarmSceneActive = true;
        this.farmGroup.visible = true;

        // Reposition camera for expansive Farm Plateau
        if (typeof camera !== 'undefined' && typeof controls !== 'undefined') {
            camera.position.set(0, 16, 20);
            controls.target.set(0, 1, 0);
            controls.update();
        }

        // Show Farm Overlay HUD
        const overlay = document.getElementById('farm-scene-overlay');
        if (overlay) overlay.classList.remove('hidden');

        this.syncAllPlots3D();
        this.updateFarmHUD();
    },

    leaveFarmScene() {
        this.isFarmSceneActive = false;
        this.farmGroup.visible = false;

        // Restore Ranch Camera
        if (typeof camera !== 'undefined' && typeof controls !== 'undefined') {
            camera.position.set(0, 10.5, 14.5);
            controls.target.set(0, 1.2, 0);
            controls.update();
        }

        // Hide Farm Overlay HUD
        const overlay = document.getElementById('farm-scene-overlay');
        if (overlay) overlay.classList.add('hidden');
    },

    updateFarmHUD() {
        const cost = this.getNextPlotCost();
        const costEl = document.getElementById('farm-hud-next-cost');
        if (costEl) costEl.textContent = `${cost}c`;

        const plotCountEl = document.getElementById('farm-hud-plot-count');
        if (plotCountEl) plotCountEl.textContent = `${gameState.farmland.unlockedCount || 2} 塊`;

        // Update auto device statuses
        const auto = gameState.farmland.automation || {};
        const sowerBtn = document.getElementById('btn-buy-auto-sower');
        if (sowerBtn) {
            sowerBtn.textContent = auto.autoSower ? '✅ 播種機已就緒' : '🤖 自動播種機 (2500c)';
            sowerBtn.disabled = !!auto.autoSower;
        }
        const sprinklerBtn = document.getElementById('btn-buy-auto-sprinkler');
        if (sprinklerBtn) {
            sprinklerBtn.textContent = auto.autoSprinkler ? '✅ 噴水系統運行中' : '🌧️ 噴灌系統 (3800c)';
            sprinklerBtn.disabled = !!auto.autoSprinkler;
        }
        const cartBtn = document.getElementById('btn-buy-auto-harvester');
        if (cartBtn) {
            cartBtn.textContent = auto.autoHarvester ? '✅ 收割車巡邏中' : '🚜 小豬收割車 (5500c)';
            cartBtn.disabled = !!auto.autoHarvester;
        }
    },

    sellIngredientsForCoins(code, amt) {
        const ing = INGREDIENTS.find(x => x.code === code);
        if (!ing || !gameState.ingStock[code] || gameState.ingStock[code] < amt) return;

        const earn = Math.round(ing.price * 1.6) * amt;
        gameState.ingStock[code] -= amt;
        gameState.coins += earn;

        saveGameState();
        this.updateFarmHUD();
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
                const sellCount = stock - 2;
                const earn = Math.round(ing.price * 1.6) * sellCount;
                gameState.ingStock[ing.code] = 2;
                totalCoins += earn;
            }
        });

        if (totalCoins > 0) {
            gameState.coins += totalCoins;
            saveGameState();
            this.updateFarmHUD();
            if (typeof updateHUD === 'function') updateHUD();
            if (typeof syncTroughRecipeUI === 'function') syncTroughRecipeUI();
            if (typeof showHUDToast === 'function') showHUDToast(`💰 莊園豐收！全部盈餘農產品已賣出，進帳 +${totalCoins} 金幣！`);
            if (typeof sfx !== 'undefined' && sfx.playCoinDing) sfx.playCoinDing();
        } else {
            if (typeof showHUDToast === 'function') showHUDToast(`目前庫存量適中，無多餘盈餘作物可批發賣出。`);
        }
    }
};

if (typeof window !== 'undefined') window.FarmSystem = FarmSystem;
if (typeof global !== 'undefined') global.FarmSystem = FarmSystem;
