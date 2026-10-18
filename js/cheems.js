/**
 * 3D Royal Piggy Farm - Cheems Frog Warrior Stress-Relief Arena
 * Module: js/cheems.js
 */

const CheemsArena = {
    group: null,
    cheemsModel: null,
    cheemsBasePos: new THREE.Vector3(0, 0.45, 0),
    cheemsScale: new THREE.Vector3(0.75, 0.75, 0.75),
    recoilVel: new THREE.Vector3(),
    recoilRot: new THREE.Euler(),
    rotVel: new THREE.Vector3(),
    squishScale: new THREE.Vector3(1, 1, 1),
    squishVel: new THREE.Vector3(),

    currentWeaponId: 'spiked_club',
    weaponMesh: null,
    weaponSwingTimer: 0,
    weaponOrigin: new THREE.Vector3(1.2, 1.2, 1.2),

    pigsAssaultActive: false,
    pigsAssaultTimer: 0,

    bubbleSprite: null,
    bubbleCanvas: null,
    bubbleCtx: null,
    bubbleTex: null,
    bubbleTimer: 0,

    hitCount: 0,
    totalCoinsEarned: 0,

    init() {
        this.group = new THREE.Group();
        this.group.name = 'CheemsArenaScene';
        this.group.visible = false;
        scene.add(this.group);

        this.buildArenaDecorations();
        this.buildMemeSpeechBubble();
        this.loadCheemsGLB();
        this.equipWeapon(this.currentWeaponId);
    },

    loadCheemsGLB() {
        if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') return;

        const loader = new THREE.GLTFLoader();
        const resolveModelUrl = () => {
            try {
                let base = window.location.origin + window.location.pathname;
                if (!base.endsWith('/')) {
                    if (base.match(/\.[a-zA-Z0-9]+$/)) {
                        base = base.substring(0, base.lastIndexOf('/') + 1);
                    } else {
                        base += '/';
                    }
                }
                return base + 'cheems_frog_warrior.glb';
            } catch (e) {
                return 'cheems_frog_warrior.glb';
            }
        };

        const targetUrl = resolveModelUrl();
        const tryLoad = (url, fallbackUrl = null) => {
            loader.load(
                url,
                gltf => {
                    this.cheemsModel = gltf.scene;
                    this.cheemsModel.position.copy(this.cheemsBasePos);
                    this.cheemsModel.scale.copy(this.cheemsScale);
                    this.cheemsModel.traverse(c => {
                        if (c.isMesh) {
                            c.castShadow = true;
                            c.receiveShadow = true;
                            c.userData = { interactType: 'CHEEMS_TARGET', ref: this };
                        }
                    });
                    this.group.add(this.cheemsModel);
                    console.log('[CheemsArena] 成功載入 cheems_frog_warrior.glb 梗圖模型');
                },
                undefined,
                err => {
                    if (fallbackUrl) {
                        tryLoad(fallbackUrl, null);
                    } else {
                        console.warn('[CheemsArena] 無法載入 cheems_frog_warrior.glb，使用程序化目標:', err);
                        this.buildProceduralCheemsFallback();
                    }
                }
            );
        };

        tryLoad(targetUrl, './cheems_frog_warrior.glb');
    },

    buildProceduralCheemsFallback() {
        const fallbackGroup = new THREE.Group();
        const bodyMat = createOrganicSurfaceMaterial(0xeab308, 0.7);
        const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 1.8, 18), bodyMat);
        bodyMesh.position.y = 0.9;
        bodyMesh.castShadow = true;
        fallbackGroup.add(bodyMesh);

        const headMat = createOrganicSurfaceMaterial(0xca8a04, 0.65);
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.75, 18, 16), headMat);
        headMesh.position.set(0, 1.85, 0.2);
        fallbackGroup.add(headMesh);

        this.cheemsModel = fallbackGroup;
        this.cheemsModel.position.copy(this.cheemsBasePos);
        this.group.add(this.cheemsModel);
    },

    buildArenaDecorations() {
        // Wooden Tatami Dojo Platform
        const platMat = createOrganicSurfaceMaterial(0x78350f, 0.85);
        const matMat = createMatteMaterial(0xd97706, 0.9);
        const plat = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.0, 0.45, 32), platMat);
        plat.position.set(0, 0.22, 0);
        plat.receiveShadow = true;
        this.group.add(plat);

        const innerRing = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 5.8, 0.48, 32), matMat);
        innerRing.position.set(0, 0.23, 0);
        innerRing.receiveShadow = true;
        this.group.add(innerRing);

        // 4 Corner Paper Lanterns
        const lanternMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
        [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]].forEach(([lx, lz]) => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), platMat);
            pole.position.set(lx, 1.6, lz);
            pole.castShadow = true;
            this.group.add(pole);

            const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.75, 12), lanternMat);
            lantern.position.set(lx, 2.8, lz);
            this.group.add(lantern);

            const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), glowMat);
            core.position.set(lx, 2.8, lz);
            this.group.add(core);
        });
    },

    buildMemeSpeechBubble() {
        this.bubbleCanvas = document.createElement('canvas');
        this.bubbleCanvas.width = 256;
        this.bubbleCanvas.height = 128;
        this.bubbleCtx = this.bubbleCanvas.getContext('2d');
        this.bubbleTex = new THREE.CanvasTexture(this.bubbleCanvas);

        const mat = new THREE.SpriteMaterial({ map: this.bubbleTex, transparent: true, depthTest: false });
        this.bubbleSprite = new THREE.Sprite(mat);
        this.bubbleSprite.scale.set(2.8, 1.4, 1);
        this.bubbleSprite.position.set(0, 2.9, 0.2);
        this.bubbleSprite.visible = false;
        this.group.add(this.bubbleSprite);
    },

    showMemeBubble(text, duration = 1.8) {
        if (!this.bubbleCtx) return;
        const ctx = this.bubbleCtx;
        ctx.clearRect(0, 0, 256, 128);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
        ctx.beginPath();
        ctx.roundRect(14, 12, 228, 86, 24);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 55);

        this.bubbleTex.needsUpdate = true;
        this.bubbleSprite.visible = true;
        this.bubbleTimer = duration;
    },

    equipWeapon(weaponId) {
        this.currentWeaponId = weaponId;
        if (this.weaponMesh) {
            this.group.remove(this.weaponMesh);
            this.weaponMesh = null;
        }

        const catalog = (typeof CHEEMS_WEAPONS !== 'undefined') ? CHEEMS_WEAPONS : (window.CHEEMS_WEAPONS || window.CHEEEMS_WEAPONS || []);
        const wData = catalog.find(w => w.id === weaponId) || catalog[0] || { power: 30, color: 0xef4444 };
        const wGroup = new THREE.Group();

        // Build specialized 3D toy model
        const primaryMat = new THREE.MeshStandardMaterial({ color: wData.color || 0xef4444, roughness: 0.35, metalness: 0.1 });
        const woodMat = createOrganicSurfaceMaterial(0x78350f, 0.85);
        const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.25 });

        if (weaponId === 'spiked_club') {
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 10), woodMat);
            const head = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.8, 12), woodMat);
            head.position.y = 0.55;
            wGroup.add(handle, head);
        } else if (weaponId === 'inflat_axe') {
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 10), woodMat);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.18), primaryMat);
            blade.position.set(0.24, 0.45, 0);
            wGroup.add(handle, blade);
        } else if (weaponId === 'salted_fish') {
            const fish = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.45, 12), primaryMat);
            fish.rotation.z = Math.PI / 2;
            const tail = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.05), primaryMat);
            tail.position.x = -0.75;
            wGroup.add(fish, tail);
        } else if (weaponId === 'frying_pan') {
            const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 20), steelMat);
            pan.rotation.x = Math.PI / 2;
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 8), woodMat);
            handle.position.set(0, -0.65, 0);
            wGroup.add(pan, handle);
        } else if (weaponId === 'roast_chicken') {
            const meat = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), primaryMat);
            meat.scale.set(1.4, 1.0, 1.0);
            const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8), createMatteMaterial(0xffffff));
            bone.position.x = -0.42;
            bone.rotation.z = Math.PI / 2;
            wGroup.add(meat, bone);
        } else if (weaponId === 'squeaky_hammer') {
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), woodMat);
            const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.75, 16), primaryMat);
            drum.rotation.z = Math.PI / 2;
            drum.position.y = 0.55;
            wGroup.add(handle, drum);
        } else if (weaponId === 'boxing_spring') {
            const glove = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 14), primaryMat);
            glove.scale.set(1.2, 1.1, 1.3);
            const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.65, 12), steelMat);
            spring.position.z = -0.55;
            spring.rotation.x = Math.PI / 2;
            wGroup.add(glove, spring);
        } else {
            // General high-quality stylized club/wand model
            const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.2, 10), woodMat);
            const topper = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), primaryMat);
            topper.position.y = 0.62;
            wGroup.add(handle, topper);
        }

        wGroup.position.copy(this.weaponOrigin);
        wGroup.scale.set(0.9, 0.9, 0.9);
        this.weaponMesh = wGroup;
        this.group.add(this.weaponMesh);
    },

    strikeCheems(customStrength = 1.0) {
        const catalog = (typeof CHEEMS_WEAPONS !== 'undefined') ? CHEEMS_WEAPONS : (window.CHEEMS_WEAPONS || window.CHEEEMS_WEAPONS || []);
        const wData = catalog.find(w => w.id === this.currentWeaponId) || catalog[0] || { power: 30 };
        const basePwr = wData.power || 30;
        const dmg = Math.round((basePwr * customStrength) * (1 + Math.random() * 0.4));
        const coinDrop = Math.max(2, Math.round(dmg * 0.45));

        this.hitCount++;
        this.totalCoinsEarned += coinDrop;
        if (typeof gameState !== 'undefined') {
            gameState.coins += coinDrop;
        }

        // Trigger violent funny ragdoll spring recoil & tilt
        this.recoilVel.x += (Math.random() - 0.5) * 4.5;
        this.recoilVel.y += 2.2 + Math.random() * 1.5;
        this.recoilVel.z -= 4.5 + Math.random() * 2.0;

        this.rotVel.x += -12.0 - Math.random() * 8.0;
        this.rotVel.y += (Math.random() - 0.5) * 16.0;
        this.rotVel.z += (Math.random() - 0.5) * 12.0;

        // Squish deformation
        this.squishVel.y -= 7.5;
        this.squishVel.x += 4.5;
        this.squishVel.z += 4.5;

        // Visual Weapon Swing
        this.weaponSwingTimer = 0.28;

        // Audio and floating effects
        if (typeof sfx !== 'undefined') {
            if (sfx.playHit) sfx.playHit();
            if (sfx.playCoinDing) sfx.playCoinDing();
        }

        const hitPos = this.cheemsBasePos.clone().add(new THREE.Vector3(0, 1.8, 0));
        if (typeof spawnFloatingText === 'function') {
            const texts = [`BONK! -${dmg}`, `💥 暴擊 -${dmg}`, `啪！+${coinDrop}金幣`, `哭哭！ -${dmg}`];
            const chosen = texts[Math.floor(Math.random() * texts.length)];
            spawnFloatingText(chosen, hitPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.2, 0.5, 0)), '#f43f5e');
        }
        if (typeof spawn3DParticle === 'function') {
            spawn3DParticle('SPARKLE', hitPos);
            spawn3DParticle('STAR', hitPos.clone().add(new THREE.Vector3(0, 0.3, 0)));
        }

        // Cheems meme line
        const memeQuotes = [
            'BONK！痛痛！', 'No hurt doge！', '救命啊！', '別打臉！',
            '我是一隻無辜的蛙蛙！', 'Doge dizzy...', '不要拿那個打我！', '小豬救我！'
        ];
        if (Math.random() < 0.6) {
            this.showMemeBubble(memeQuotes[Math.floor(Math.random() * memeQuotes.length)], 1.5);
        }

        if (typeof updateHUD === 'function') updateHUD();
        this.updateArenaUI();
    },

    summonPigsAssault() {
        if (!PigManager || PigManager.instances.length === 0) return;
        this.pigsAssaultActive = true;
        this.pigsAssaultTimer = 4.5;

        PigManager.instances.forEach((pigInst, idx) => {
            pigInst.showEmote('⚔️', 3.0);
            const ang = (idx / Math.max(1, PigManager.instances.length)) * Math.PI * 2;
            pigInst.wanderTarget.set(Math.cos(ang) * 1.2, 0, Math.sin(ang) * 1.2);
            pigInst.wanderTimer = 3.5;
        });

        if (typeof spawnFloatingText === 'function') {
            spawnFloatingText('🐷 牧場群豬全員衝鋒圍攻！', new THREE.Vector3(0, 2.6, 0), '#fbbf24');
        }
    },

    update(dt) {
        if (!this.group || !this.group.visible) return;

        // Weapon swing lerp
        if (this.weaponSwingTimer > 0) {
            this.weaponSwingTimer -= dt;
            const progress = 1 - (this.weaponSwingTimer / 0.28);
            if (this.weaponMesh) {
                this.weaponMesh.position.x = this.weaponOrigin.x - Math.sin(progress * Math.PI) * 1.4;
                this.weaponMesh.position.y = this.weaponOrigin.y + Math.sin(progress * Math.PI) * 0.4;
                this.weaponMesh.position.z = this.weaponOrigin.z - Math.sin(progress * Math.PI) * 1.5;
                this.weaponMesh.rotation.z = Math.sin(progress * Math.PI) * -1.8;
                this.weaponMesh.rotation.x = Math.sin(progress * Math.PI) * 1.2;
            }
        } else if (this.weaponMesh) {
            this.weaponMesh.position.lerp(this.weaponOrigin, Math.min(1, dt * 10.0));
            this.weaponMesh.rotation.set(0, 0, 0);
        }

        // Cheems Ragdoll Spring Physics
        if (this.cheemsModel) {
            const springPosK = 95.0;
            const springPosD = 8.5;
            const springRotK = 110.0;
            const springRotD = 9.5;

            // Position spring back to cheemsBasePos
            const pDiff = this.cheemsBasePos.clone().sub(this.cheemsModel.position);
            this.recoilVel.addScaledVector(pDiff, springPosK * dt);
            this.recoilVel.multiplyScalar(Math.max(0, 1 - springPosD * dt));
            this.cheemsModel.position.addScaledVector(this.recoilVel, dt);

            // Rotation spring back to 0
            this.rotVel.x += (-this.cheemsModel.rotation.x * springRotK - this.rotVel.x * springRotD) * dt;
            this.rotVel.y += (-this.cheemsModel.rotation.y * springRotK - this.rotVel.y * springRotD) * dt;
            this.rotVel.z += (-this.cheemsModel.rotation.z * springRotK - this.rotVel.z * springRotD) * dt;
            this.cheemsModel.rotation.x += this.rotVel.x * dt;
            this.cheemsModel.rotation.y += this.rotVel.y * dt;
            this.cheemsModel.rotation.z += this.rotVel.z * dt;

            // Soft squish spring
            const sqK = 140.0;
            const sqD = 13.0;
            this.squishVel.x += ((1.0 - this.squishScale.x) * sqK - this.squishVel.x * sqD) * dt;
            this.squishVel.y += ((1.0 - this.squishScale.y) * sqK - this.squishVel.y * sqD) * dt;
            this.squishVel.z += ((1.0 - this.squishScale.z) * sqK - this.squishVel.z * sqD) * dt;
            this.squishScale.addScaledVector(this.squishVel, dt);

            this.cheemsModel.scale.set(
                this.cheemsScale.x * this.squishScale.x,
                this.cheemsScale.y * this.squishScale.y,
                this.cheemsScale.z * this.squishScale.z
            );
        }

        // Meme Bubble timer
        if (this.bubbleTimer > 0) {
            this.bubbleTimer -= dt;
            if (this.bubbleTimer <= 0 && this.bubbleSprite) {
                this.bubbleSprite.visible = false;
            }
        }

        // Pigs continuous swarm attack
        if (this.pigsAssaultActive) {
            this.pigsAssaultTimer -= dt;
            if (Math.random() < 0.22) {
                this.strikeCheems(0.75);
            }
            if (this.pigsAssaultTimer <= 0) {
                this.pigsAssaultActive = false;
            }
        }
    },

    updateArenaUI() {
        const countEl = document.getElementById('cheems-bonk-count');
        const coinEl = document.getElementById('cheems-coin-earned');
        if (countEl) countEl.innerText = this.hitCount;
        if (coinEl) coinEl.innerText = this.totalCoinsEarned;
    }
};

if (typeof window !== 'undefined') window.CheemsArena = CheemsArena;
