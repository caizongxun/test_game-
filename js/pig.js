/**
 * 3D Royal Piggy Farm - Multi-Pig Entity, 3D Softbody & Outfits
 * Module: js/pig.js
 */

const PigGLBLoader = {
    cachedScene: null,
    isLoading: false,
    callbacks: [],

    load(onReady) {
        if (this.cachedScene) {
            onReady(this.cachedScene.clone(true));
            return;
        }
        this.callbacks.push(onReady);
        if (this.isLoading) return;
        this.isLoading = true;

        if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined') {
            const loader = new THREE.GLTFLoader();
            loader.load(
                'chibi-pink-pig.glb',
                gltf => {
                    this.cachedScene = gltf.scene;
                    this.isLoading = false;
                    while (this.callbacks.length > 0) {
                        const cb = this.callbacks.shift();
                        try { cb(this.cachedScene.clone(true)); } catch (e) { console.error('GLTF load callback error:', e); }
                    }
                },
                undefined,
                err => {
                    console.warn('無法載入 chibi-pink-pig.glb，使用程序化模型降級:', err);
                    this.isLoading = false;
                }
            );
        } else {
            console.warn('THREE.GLTFLoader 尚未就緒');
        }
    }
};

class PerVertexSoftBodyPig {
    constructor(pigData, initialPos = null) {
        this.pigData = pigData || gameState.getActivePig();
        this.id = this.pigData.id || ('pig_' + Math.random().toString(36).substr(2, 6));

        this.root = new THREE.Group();
        this.visualGroup = new THREE.Group();
        this.root.add(this.visualGroup);
        scene.add(this.root);

        this.proceduralPigGroup = new THREE.Group();
        this.visualGroup.add(this.proceduralPigGroup);

        this.radius = 1.25;
        this.body = new CANNON.Body({
            mass: 5.0,
            material: (typeof pigPhysMat !== 'undefined') ? pigPhysMat : undefined,
            shape: new CANNON.Sphere(this.radius),
            linearDamping: 0.55,
            angularDamping: 0.9
        });

        const startX = initialPos ? initialPos.x : (Math.random() * 4 - 2);
        const startZ = initialPos ? initialPos.z : (Math.random() * 4 - 2);
        this.body.position.set(startX, 1.5, startZ);
        this.body.fixedRotation = true;
        this.body.updateMassProperties();
        world.addBody(this.body);

        this.prevVelocity = new THREE.Vector3();
        this.facingAngle = Math.random() * Math.PI * 2;
        this.targetZone = null;
        this.aiState = 'WANDER';
        this.wanderTarget = new THREE.Vector3(startX, 0, startZ);
        this.wanderTimer = 1.5 + Math.random() * 2.5;
        this.walkCycle = Math.random() * 10;
        this.happyTimer = 0;
        this.eatTimer = 0;
        this.blinkTimer = 2.0 + Math.random() * 2.0;
        this.isBlinking = false;
        this.activePinch = null;
        this.harvestTarget = null;
        this.harvestTimer = 0;
        this.onHarvestDone = null;

        this.buildSculptedSoftBodyMesh();
        this.buildExpressiveFeaturesAndLimbs();
        this.buildOutfitMount();
        this.buildCombatEquipMounts();
        this.build3DNameplate();
        this.build3DEmoteBubble();

        this.loadGLBModel();

        // Apply visual customizations
        this.setSkinColor(this.pigData.color || '#ffb6c1');
        this.setHat(this.pigData.currentHat || 'sprout');
        this.setOutfit(this.pigData.currentOutfit || 'none');
        this.setWeapon(this.pigData.equippedWeapon || null);
        this.setShield(this.pigData.equippedShield || null);
    }

    buildSculptedSoftBodyMesh() {
        const uSegs = 48;
        const vSegs = 36;
        const geo = new THREE.SphereGeometry(this.radius, uSegs, vSegs);
        const posAttr = geo.attributes.position;
        this.vCount = posAttr.count;

        this.restPos = new Float32Array(this.vCount * 3);
        this.currPos = new Float32Array(this.vCount * 3);
        this.vel = new Float32Array(this.vCount * 3);
        this.softness = new Float32Array(this.vCount);
        this.baseColors = new Float32Array(this.vCount * 3);
        this.liveColors = new Float32Array(this.vCount * 3);

        const v = new THREE.Vector3();
        const tmpCol = new THREE.Color();
        const cSkinBase = new THREE.Color(this.pigData.color || 0xffb6c1);
        const cBellySoft = new THREE.Color(0xffd1dc);
        const cBackWarm = new THREE.Color(0xf472b6);
        const cCheekRosy = new THREE.Color(0xfb7185);
        const cSnoutTip = new THREE.Color(0xf43f5e);
        const cNostrilDeep = new THREE.Color(0x881337);

        for (let i = 0; i < this.vCount; i++) {
            v.fromBufferAttribute(posAttr, i);
            v.x *= 1.08;
            v.y *= 0.94;
            v.z *= 1.22;

            if (v.y < -0.15) {
                const bellyFactor = Math.pow(-v.y, 1.45) * 0.42;
                v.y -= bellyFactor * 0.65;
                v.x *= 1.0 + bellyFactor * 0.42;
                v.z *= 1.0 + bellyFactor * 0.28;
            }

            const cheekDist = Math.hypot(Math.abs(v.x) - 0.72, v.y + 0.08, v.z - 0.72);
            const cheekFactor = Math.max(0, 1 - cheekDist / 0.62);
            v.x += Math.sign(v.x) * Math.pow(cheekFactor, 2) * 0.26;
            v.y += Math.pow(cheekFactor, 2) * 0.12;

            const snoutDist = Math.hypot(v.x, (v.y - 0.04) * 1.25, v.z - 1.28);
            const snoutFactor = Math.max(0, 1 - snoutDist / 0.72);
            if (snoutFactor > 0) {
                const snoutCurve = Math.pow(snoutFactor, 1.8);
                v.z += snoutCurve * 0.46;
                v.x *= 1 - snoutCurve * 0.15;
                v.y = v.y * (1 - snoutCurve * 0.22) + snoutCurve * 0.06;
            }

            const nostrilLeft = Math.hypot(v.x - 0.14, v.y + 0.02, v.z - 1.66);
            const nostrilRight = Math.hypot(v.x + 0.14, v.y + 0.02, v.z - 1.66);
            const nostrilDepth = Math.max(0, 1 - Math.min(nostrilLeft, nostrilRight) / 0.16);
            if (nostrilDepth > 0) {
                v.z -= Math.pow(nostrilDepth, 2) * 0.09;
            }

            posAttr.setXYZ(i, v.x, v.y, v.z);
            this.restPos[i * 3]     = v.x;
            this.restPos[i * 3 + 1] = v.y;
            this.restPos[i * 3 + 2] = v.z;
            this.currPos[i * 3]     = v.x;
            this.currPos[i * 3 + 1] = v.y;
            this.currPos[i * 3 + 2] = v.z;

            let soft = 0.55;
            if (v.y < -0.1) soft += 0.35;
            if (cheekFactor > 0.1) soft += cheekFactor * 0.52;
            if (v.z < -0.8) soft += 0.35;
            if (snoutFactor > 0.2) soft = 0.68;
            this.softness[i] = soft;

            tmpCol.copy(cSkinBase);
            if (v.y > 0.35) tmpCol.lerp(cBackWarm, Math.min(0.45, (v.y - 0.35) * 0.65));
            if (v.y < -0.15) tmpCol.lerp(cBellySoft, Math.min(1, (-v.y - 0.15) * 1.45));
            if (cheekFactor > 0.05) tmpCol.lerp(cCheekRosy, Math.min(0.78, cheekFactor * 1.15));
            if (snoutFactor > 0.15) tmpCol.lerp(cSnoutTip, Math.min(0.68, snoutFactor * 0.85));
            if (nostrilDepth > 0.1) tmpCol.lerp(cNostrilDeep, Math.min(0.95, nostrilDepth * 1.35));

            this.baseColors[i * 3]     = tmpCol.r;
            this.baseColors[i * 3 + 1] = tmpCol.g;
            this.baseColors[i * 3 + 2] = tmpCol.b;
            this.liveColors[i * 3]     = tmpCol.r;
            this.liveColors[i * 3 + 1] = tmpCol.g;
            this.liveColors[i * 3 + 2] = tmpCol.b;
        }

        geo.setAttribute('color', new THREE.BufferAttribute(this.liveColors, 3));
        geo.computeVertexNormals();

        this.buildVertexNeighborGraph(geo);

        this.skinMat = new THREE.MeshPhysicalMaterial({
            vertexColors: true,
            roughness: 0.55,
            metalness: 0.02,
            clearcoat: 0.32,
            clearcoatRoughness: 0.16,
            reflectivity: 0.22,
            sheen: new THREE.Color(0xfb7185)
        });

        this.bodyMesh = new THREE.Mesh(geo, this.skinMat);
        this.bodyMesh.position.y = 1.08;
        this.bodyMesh.castShadow = true;
        this.bodyMesh.receiveShadow = true;
        this.bodyMesh.userData = { interactType: 'PIG_SOFTBODY', pigInstance: this };
        this.proceduralPigGroup.add(this.bodyMesh);
    }

    setSkinColor(hexColor) {
        if (!hexColor) hexColor = '#ffb6c1';
        this.pigData.color = hexColor;
        const cSkinBase = new THREE.Color(hexColor);
        const cBellySoft = cSkinBase.clone().offsetHSL(0, -0.1, 0.12);
        const cBackWarm = cSkinBase.clone().offsetHSL(0, 0.1, -0.08);
        const cCheekRosy = new THREE.Color(0xfb7185);
        const cSnoutTip = cSkinBase.clone().offsetHSL(0, 0.15, -0.15);
        const cNostrilDeep = new THREE.Color(0x881337);

        const v = new THREE.Vector3();
        const tmpCol = new THREE.Color();
        for (let i = 0; i < this.vCount; i++) {
            v.set(this.restPos[i * 3], this.restPos[i * 3 + 1], this.restPos[i * 3 + 2]);
            const cheekDist = Math.hypot(Math.abs(v.x) - 0.72, v.y + 0.08, v.z - 0.72);
            const cheekFactor = Math.max(0, 1 - cheekDist / 0.62);
            const snoutDist = Math.hypot(v.x, (v.y - 0.04) * 1.25, v.z - 1.28);
            const snoutFactor = Math.max(0, 1 - snoutDist / 0.72);

            tmpCol.copy(cSkinBase);
            if (v.y > 0.35) tmpCol.lerp(cBackWarm, Math.min(0.45, (v.y - 0.35) * 0.65));
            if (v.y < -0.15) tmpCol.lerp(cBellySoft, Math.min(1, (-v.y - 0.15) * 1.45));
            if (cheekFactor > 0.05) tmpCol.lerp(cCheekRosy, Math.min(0.78, cheekFactor * 1.15));
            if (snoutFactor > 0.15) tmpCol.lerp(cSnoutTip, Math.min(0.68, snoutFactor * 0.85));

            this.baseColors[i * 3]     = tmpCol.r;
            this.baseColors[i * 3 + 1] = tmpCol.g;
            this.baseColors[i * 3 + 2] = tmpCol.b;
            this.liveColors[i * 3]     = tmpCol.r;
            this.liveColors[i * 3 + 1] = tmpCol.g;
            this.liveColors[i * 3 + 2] = tmpCol.b;
        }
        if (this.bodyMesh && this.bodyMesh.geometry) {
            this.bodyMesh.geometry.attributes.color.needsUpdate = true;
        }
        if (this.skinPartMat) {
            this.skinPartMat.color.set(hexColor);
        }
        if (this.glbRoot) {
            this.glbRoot.traverse(child => {
                if (child.isMesh && child.material) {
                    const mName = child.material.name || '';
                    if (mName === 'PigBodyPink' || child.name.includes('Torso') || child.name.includes('Head') || child.name.includes('Ear_Flap')) {
                        child.material.color.set(hexColor);
                        if (child.material.emissive) child.material.emissive.set(hexColor).multiplyScalar(0.12);
                    } else if (mName === 'PigSnoutPink' || child.name.includes('Snout_Main')) {
                        const snoutCol = cSkinBase.clone().offsetHSL(0, 0.1, -0.1);
                        child.material.color.copy(snoutCol);
                    }
                }
            });
        }
        this.updateNameplate();
    }

    buildVertexNeighborGraph(geo) {
        const n = this.vCount;
        const adjSets = Array.from({ length: n }, () => new Set());
        const indexAttr = geo.index;
        if (indexAttr) {
            const arr = indexAttr.array;
            for (let i = 0; i < arr.length; i += 3) {
                const a = arr[i], b = arr[i + 1], c = arr[i + 2];
                adjSets[a].add(b); adjSets[a].add(c);
                adjSets[b].add(a); adjSets[b].add(c);
                adjSets[c].add(a); adjSets[c].add(b);
            }
        }
        const seamBuckets = new Map();
        this.seamGroups = [];
        const bucketGroupMap = new Map();
        for (let i = 0; i < n; i++) {
            const kx = Math.round(this.restPos[i * 3] * 200);
            const ky = Math.round(this.restPos[i * 3 + 1] * 200);
            const kz = Math.round(this.restPos[i * 3 + 2] * 200);
            const key = `${kx}_${ky}_${kz}`;
            if (seamBuckets.has(key)) {
                const firstIdx = seamBuckets.get(key);
                adjSets[i].add(firstIdx);
                adjSets[firstIdx].add(i);
                if (!bucketGroupMap.has(key)) {
                    const grp = [firstIdx, i];
                    bucketGroupMap.set(key, grp);
                    this.seamGroups.push(grp);
                } else {
                    bucketGroupMap.get(key).push(i);
                }
            } else {
                seamBuckets.set(key, i);
            }
        }
        this.neighbors = adjSets.map(s => Int32Array.from(s));
    }

    buildExpressiveFeaturesAndLimbs() {
        this.skinPartMat = createOrganicSurfaceMaterial(new THREE.Color(this.pigData.color || 0xffb3c1), 0.72);
        const innerEarMat = createOrganicSurfaceMaterial(0xfb7185, 0.76);
        const hoofMat = createMatteMaterial(0x4a2c1d, 0.80);
        const scleraMat = createMatteMaterial(0xffffff, 0.30);
        const irisMat = createMatteMaterial(0x3b2314, 0.28);
        const pupilMat = createMatteMaterial(0x0f172a, 0.20);

        this.leftEyeGroup = new THREE.Group();
        this.rightEyeGroup = new THREE.Group();
        [this.leftEyeGroup, this.rightEyeGroup].forEach((eg, idx) => {
            const side = idx === 0 ? 1 : -1;
            eg.position.set(side * 0.41, 1.39, 1.16);
            eg.rotation.y = side * 0.27;

            const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.138, 20, 16), scleraMat);
            sclera.scale.set(1, 1.08, 0.78);
            eg.add(sclera);

            const iris = new THREE.Mesh(new THREE.SphereGeometry(0.096, 18, 14), irisMat);
            iris.scale.set(1, 1.05, 0.65);
            iris.position.set(0, 0, 0.068);
            eg.add(iris);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 12), pupilMat);
            pupil.scale.set(1, 1.05, 0.65);
            pupil.position.set(0, 0, 0.092);
            eg.add(pupil);

            const catchLightMain = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            catchLightMain.position.set(0.032, 0.038, 0.142);
            eg.add(catchLightMain);

            const eyelid = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56), this.skinPartMat);
            eyelid.rotation.x = -Math.PI * 0.56;
            eg.add(eyelid);
            if (idx === 0) this.leftEyelid = eyelid; else this.rightEyelid = eyelid;

            const browMat = createMatteMaterial(0x9d174d, 0.45);
            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.024, 0.03), browMat);
            brow.position.set(0, 0.175, 0.05);
            brow.rotation.z = -side * 0.16;
            eg.add(brow);
            if (idx === 0) this.leftBrow = brow; else this.rightBrow = brow;

            this.proceduralPigGroup.add(eg);
        });

        this.leftEar = new THREE.Group();
        this.rightEar = new THREE.Group();
        [this.leftEar, this.rightEar].forEach((earGrp, idx) => {
            const side = idx === 0 ? 1 : -1;
            earGrp.position.set(side * 0.56, 1.78, 0.78);
            const outerEarGeo = deformBufferGeometry(new THREE.SphereGeometry(0.33, 24, 18), (v) => {
                v.x *= 0.86; v.y *= 1.42; v.z *= 0.26;
                if (v.y > 0) { v.x *= 1 - v.y * 0.48; v.z += Math.pow(v.y, 2) * 0.28; }
            });
            const outerEar = new THREE.Mesh(outerEarGeo, this.skinPartMat);
            outerEar.position.set(side * 0.14, 0.13, 0.05);
            outerEar.rotation.z = -side * 0.52;
            outerEar.rotation.x = 0.40;
            outerEar.castShadow = true;
            earGrp.add(outerEar);

            const innerEar = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 12), innerEarMat);
            innerEar.scale.set(0.72, 1.18, 0.18);
            innerEar.position.set(side * 0.14, 0.11, 0.09);
            innerEar.rotation.z = -side * 0.52;
            innerEar.rotation.x = 0.40;
            earGrp.add(innerEar);

            this.proceduralPigGroup.add(earGrp);
        });

        this.legs = [];
        const legPositions = [ [0.52, 0.48, 0.68], [-0.52, 0.48, 0.68], [0.54, 0.48, -0.68], [-0.54, 0.48, -0.68] ];
        legPositions.forEach(([lx, ly, lz]) => {
            const legGrp = new THREE.Group();
            legGrp.position.set(lx, ly, lz);

            const upperGeo = deformBufferGeometry(new THREE.CylinderGeometry(0.24, 0.175, 0.50, 18, 8), (v) => {
                if (v.y > 0) v.x *= 1 + v.y * 0.25;
            });
            const upper = new THREE.Mesh(upperGeo, this.skinPartMat);
            upper.position.y = -0.15;
            upper.castShadow = true;
            legGrp.add(upper);

            const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), this.skinPartMat);
            ankle.position.y = -0.36;
            legGrp.add(ankle);

            [-0.058, 0.058].forEach(toeX => {
                const toeGeo = deformBufferGeometry(new THREE.CylinderGeometry(0.075, 0.095, 0.17, 12), (v) => {
                    if (v.z > 0) v.z *= 1.28;
                });
                const toe = new THREE.Mesh(toeGeo, hoofMat);
                toe.position.set(toeX, -0.43, 0.025);
                toe.castShadow = true;
                legGrp.add(toe);
            });

            this.proceduralPigGroup.add(legGrp);
            this.legs.push(legGrp);
        });

        this.tailGroup = new THREE.Group();
        this.tailGroup.position.set(0, 1.18, -1.36);
        const curvePts = [];
        for (let t = 0; t <= 28; t++) {
            const u = t / 28;
            const ang = u * Math.PI * 3.4;
            const r = 0.145 * (1 - u * 0.35);
            curvePts.push(new THREE.Vector3(Math.cos(ang) * r, Math.sin(ang) * r + u * 0.17, -u * 0.38));
        }
        const tailCurve = new THREE.CatmullRomCurve3(curvePts);
        const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 32, 0.054, 10, false), this.skinPartMat);
        tailMesh.castShadow = true;
        this.tailGroup.add(tailMesh);
        this.proceduralPigGroup.add(this.tailGroup);

        const wetSnoutMat = new THREE.MeshPhysicalMaterial({ color: 0xfb7185, roughness: 0.18, clearcoat: 0.85 });
        this.snoutTipMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.06, 24), wetSnoutMat);
        this.snoutTipMesh.rotation.x = Math.PI / 2 + 0.05;
        this.snoutTipMesh.position.set(0, 1.06, 1.48);
        this.snoutTipMesh.scale.set(1.15, 0.85, 1);
        this.proceduralPigGroup.add(this.snoutTipMesh);

        this.hatMount = new THREE.Group();
        this.hatMount.position.set(0, 1.98, 0.72);
        this.visualGroup.add(this.hatMount);

        this.visualGroup.traverse(ch => {
            if (ch.isMesh && !ch.userData.interactType) {
                ch.userData = { interactType: 'PIG_SOFTBODY', pigInstance: this };
            }
        });
    }

    loadGLBModel() {
        PigGLBLoader.load(clonedScene => {
            if (!this.root || !this.visualGroup) return;
            this.applyGLBModel(clonedScene);
        });
    }

    applyGLBModel(glbScene) {
        if (this.proceduralPigGroup) {
            this.proceduralPigGroup.visible = false;
        }

        this.glbRoot = glbScene;
        this.glbRoot.scale.set(1.0, 1.0, 1.0);
        this.glbRoot.position.set(0, 1.05, 0);
        this.visualGroup.add(this.glbRoot);

        this.glbRoot.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material = child.material.clone();
                }
                if (!child.userData.interactType) {
                    child.userData = { interactType: 'PIG_SOFTBODY', pigInstance: this };
                }
            }
        });

        this.glbLegFL = this.glbRoot.getObjectByName('Front_Left_Leg_Group');
        this.glbLegFR = this.glbRoot.getObjectByName('Front_Right_Leg_Group');
        this.glbLegBL = this.glbRoot.getObjectByName('Back_Left_Leg_Group');
        this.glbLegBR = this.glbRoot.getObjectByName('Back_Right_Leg_Group');
        this.glbEarL  = this.glbRoot.getObjectByName('Left_Ear_Group');
        this.glbEarR  = this.glbRoot.getObjectByName('Right_Ear_Group');
        this.glbEyeL  = this.glbRoot.getObjectByName('Left_Eye');
        this.glbEyeR  = this.glbRoot.getObjectByName('Right_Eye');
        this.glbTail  = this.glbRoot.getObjectByName('Curly_Tail_Group');
        this.glbSnout = this.glbRoot.getObjectByName('Snout_Group');

        this.glbBaseRot = {
            fl: this.glbLegFL ? this.glbLegFL.rotation.clone() : new THREE.Euler(),
            fr: this.glbLegFR ? this.glbLegFR.rotation.clone() : new THREE.Euler(),
            bl: this.glbLegBL ? this.glbLegBL.rotation.clone() : new THREE.Euler(),
            br: this.glbLegBR ? this.glbLegBR.rotation.clone() : new THREE.Euler(),
            earL: this.glbEarL ? this.glbEarL.rotation.clone() : new THREE.Euler(),
            earR: this.glbEarR ? this.glbEarR.rotation.clone() : new THREE.Euler(),
            tail: this.glbTail ? this.glbTail.rotation.clone() : new THREE.Euler()
        };
        this.glbBasePos = {
            snout: this.glbSnout ? this.glbSnout.position.clone() : new THREE.Vector3()
        };

        this.setSkinColor(this.pigData.color || '#ffb6c1');
    }

    buildOutfitMount() {
        this.outfitMount = new THREE.Group();
        this.outfitMount.position.set(0, 1.08, 0);
        this.visualGroup.add(this.outfitMount);
    }

    setOutfit(outfitId) {
        this.pigData.currentOutfit = outfitId || 'none';
        while (this.outfitMount.children.length > 0) {
            this.outfitMount.remove(this.outfitMount.children[0]);
        }
        if (!outfitId || outfitId === 'none') return;

        const outfit = OUTFITS_CATALOG.find(o => o.id === outfitId);
        const outColor = outfit ? outfit.color : '#dc2626';

        if (outfitId === 'bib') {
            // Cute baby carrot bib
            const bibMat = createOrganicSurfaceMaterial(0xf97316, 0.75);
            const bibMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 0.55, 16, 1, true, -Math.PI / 3, (Math.PI * 2) / 3), bibMat);
            bibMesh.position.set(0, 0.1, 0.65);
            bibMesh.rotation.x = 0.25;
            this.outfitMount.add(bibMesh);
            // Embroidered little carrot patch
            const patch = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 8), createOrganicSurfaceMaterial(0xea580c, 0.6));
            patch.rotation.z = Math.PI;
            patch.position.set(0, 0.08, 1.25);
            this.outfitMount.add(patch);
        } else if (outfitId === 'tuxedo') {
            // Elegant gentleman vest & bow tie
            const vestMat = createMatteMaterial(0x1e293b, 0.65);
            const vest = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.32, 0.85, 24, 1, true), vestMat);
            vest.position.set(0, 0.05, 0.05);
            this.outfitMount.add(vest);
            // Red Bowtie
            const bowMat = createOrganicSurfaceMaterial(0xdc2626, 0.6);
            const bowC = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), bowMat);
            bowC.position.set(0, 0.38, 1.28);
            this.outfitMount.add(bowC);
            [-0.1, 0.1].forEach(bx => {
                const wing = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.15, 8), bowMat);
                wing.rotation.z = bx > 0 ? -Math.PI / 2 : Math.PI / 2;
                wing.position.set(bx, 0.38, 1.28);
                this.outfitMount.add(wing);
            });
        } else if (outfitId === 'royal_cape') {
            // Flowing velvet royal cape with gold trim
            const capeMat = createOrganicSurfaceMaterial(0xdc2626, 0.7);
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.25 });
            const cape = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.5, 1.35, 16, 1, true, Math.PI * 0.45, Math.PI * 1.1), capeMat);
            cape.position.set(0, 0.1, -0.2);
            cape.rotation.x = -0.15;
            this.outfitMount.add(cape);
            const goldBrooch = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), goldMat);
            goldBrooch.position.set(0, 0.72, 0.95);
            this.outfitMount.add(goldBrooch);
        } else if (outfitId === 'pirate_vest') {
            // Brown weathered leather vest
            const leatherMat = createOrganicSurfaceMaterial(0x78350f, 0.8);
            const vest = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.34, 0.9, 24, 1, true), leatherMat);
            vest.position.set(0, 0.05, 0.05);
            this.outfitMount.add(vest);
        } else if (outfitId === 'wizard_robe') {
            // Starry wizard robe
            const robeMat = createOrganicSurfaceMaterial(0x6b21a8, 0.65);
            const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.3 });
            const robe = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.48, 1.1, 24, 1, true), robeMat);
            robe.position.set(0, -0.05, 0.05);
            this.outfitMount.add(robe);
        } else if (outfitId === 'festive_apron') {
            // Red festive "招財" apron
            const redMat = createOrganicSurfaceMaterial(0xef4444, 0.7);
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 });
            const apron = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.05), redMat);
            apron.rotation.z = Math.PI / 4;
            apron.position.set(0, -0.05, 1.25);
            this.outfitMount.add(apron);
            const ingot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 0.12, 12), goldMat);
            ingot.rotation.x = Math.PI / 2;
            ingot.position.set(0, -0.05, 1.30);
            this.outfitMount.add(ingot);
        } else if (outfitId === 'cyber_mecha') {
            // High-tech cyber armor saddle with twin glowing thrusters
            const mechaMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
            const cyanGlow = new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.85 });
            const saddle = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.4), mechaMat);
            saddle.position.set(0, 0.75, 0);
            this.outfitMount.add(saddle);
            [-0.75, 0.75].forEach(tx => {
                const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.65, 16), mechaMat);
                thruster.rotation.x = Math.PI / 2;
                thruster.position.set(tx, 0.7, -0.8);
                this.outfitMount.add(thruster);
                const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.1, 16), cyanGlow);
                nozzle.rotation.x = Math.PI / 2;
                nozzle.position.set(tx, 0.7, -1.15);
                this.outfitMount.add(nozzle);
            });
        }
    }

    buildCombatEquipMounts() {
        this.weaponMount = new THREE.Group();
        this.weaponMount.position.set(1.15, 1.28, 0.65);
        this.visualGroup.add(this.weaponMount);

        this.shieldMount = new THREE.Group();
        this.shieldMount.position.set(-1.15, 1.28, 0.65);
        this.visualGroup.add(this.shieldMount);
    }

    setWeapon(weaponId) {
        while (this.weaponMount.children.length > 0) {
            this.weaponMount.remove(this.weaponMount.children[0]);
        }
        this.pigData.equippedWeapon = weaponId;
        if (!weaponId) return;

        if (weaponId === 'wood_sword') {
            const woodMat = createOrganicSurfaceMaterial(0xa16207, 0.75);
            const handleMat = createMatteMaterial(0x451a03, 0.9);
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.035, 0.22, 10), handleMat);
            hilt.position.y = -0.11;
            this.weaponMount.add(hilt);
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.045, 0.06), woodMat);
            guard.position.y = 0.01;
            this.weaponMount.add(guard);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, 0.025), woodMat);
            blade.position.y = 0.34;
            this.weaponMount.add(blade);
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.12, 4), woodMat);
            tip.position.y = 0.72;
            tip.rotation.y = Math.PI / 4;
            this.weaponMount.add(tip);
        } else if (weaponId === 'boxing_gloves') {
            const redGloveMat = new THREE.MeshPhysicalMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.05, clearcoat: 0.6 });
            const strapMat = createMatteMaterial(0xffffff, 0.7);
            const gloveBody = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 14), redGloveMat);
            gloveBody.scale.set(1.1, 1.25, 1.35);
            gloveBody.position.set(0, 0.15, 0.1);
            this.weaponMount.add(gloveBody);
            const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), redGloveMat);
            thumb.position.set(-0.16, 0.12, 0.18);
            this.weaponMount.add(thumb);
            const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.12, 16), strapMat);
            wrist.position.set(0, -0.06, 0.05);
            this.weaponMount.add(wrist);
        } else if (weaponId === 'knight_lance') {
            const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.85 });
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.7 });
            const lanceBody = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.11, 1.35, 16), steelMat);
            lanceBody.position.y = 0.55;
            this.weaponMount.add(lanceBody);
            const guardBowl = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.18, 16, 1, true), goldMat);
            guardBowl.rotation.x = Math.PI;
            guardBowl.position.y = -0.08;
            this.weaponMount.add(guardBowl);
            const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 12), goldMat);
            grip.position.y = -0.22;
            this.weaponMount.add(grip);
        } else if (weaponId === 'excalibur') {
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.8 });
            const holyBladeMat = new THREE.MeshPhysicalMaterial({
                color: 0x38bdf8,
                emissive: 0x0284c7,
                emissiveIntensity: 0.75,
                roughness: 0.15,
                metalness: 0.3,
                clearcoat: 1.0
            });
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.08), goldMat);
            guard.position.y = 0.02;
            this.weaponMount.add(guard);
            const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), goldMat);
            pommel.position.y = -0.26;
            this.weaponMount.add(pommel);
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 12), createMatteMaterial(0x0f172a, 0.9));
            hilt.position.y = -0.12;
            this.weaponMount.add(hilt);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.82, 0.03), holyBladeMat);
            blade.position.y = 0.44;
            this.weaponMount.add(blade);
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), holyBladeMat);
            tip.position.y = 0.92;
            tip.rotation.y = Math.PI / 4;
            this.weaponMount.add(tip);
        }
        this.weaponMount.rotation.set(0.15, 0, -0.15);
    }

    setShield(shieldId) {
        while (this.shieldMount.children.length > 0) {
            this.shieldMount.remove(this.shieldMount.children[0]);
        }
        this.pigData.equippedShield = shieldId;
        if (!shieldId) return;

        if (shieldId === 'linen_cape') {
            const capeMat = createOrganicSurfaceMaterial(0x3b82f6, 0.8);
            const cape = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 0.65, 12, 1, true, 0, Math.PI), capeMat);
            cape.rotation.y = -Math.PI / 2;
            cape.rotation.z = -0.2;
            cape.position.set(-0.05, -0.15, -0.1);
            this.shieldMount.add(cape);
        } else if (shieldId === 'oak_buckler') {
            const woodMat = createOrganicSurfaceMaterial(0x78350f, 0.85);
            const ironMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.7 });
            const shieldBody = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.045, 24), woodMat);
            shieldBody.rotation.x = Math.PI / 2;
            shieldBody.rotation.y = 0.3;
            this.shieldMount.add(shieldBody);
            const boss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), ironMat);
            boss.position.set(0, 0, 0.035);
            shieldBody.add(boss);
            const rim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 10, 24), ironMat);
            rim.position.z = 0.02;
            shieldBody.add(rim);
        } else if (shieldId === 'mithril_armor') {
            const mithrilMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.2, metalness: 0.85 });
            const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14, 0, Math.PI * 2, 0, Math.PI / 2), mithrilMat);
            pauldron.scale.set(1.1, 0.9, 1.25);
            pauldron.position.set(-0.05, 0.1, 0);
            this.shieldMount.add(pauldron);
            const plate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.06), mithrilMat);
            plate.rotation.y = -0.4;
            plate.position.set(0, -0.18, 0.08);
            this.shieldMount.add(plate);
        } else if (shieldId === 'holy_aegis') {
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.85 });
            const holyMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1, clearcoat: 0.9 });
            const kiteGeo = deformBufferGeometry(new THREE.BoxGeometry(0.46, 0.75, 0.05), (v) => {
                if (v.y < 0) v.x *= Math.max(0.2, 1.0 + v.y * 1.5);
            });
            const aegis = new THREE.Mesh(kiteGeo, holyMat);
            aegis.rotation.y = 0.4;
            this.shieldMount.add(aegis);
            const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 0.06), goldMat);
            crossV.position.z = 0.015;
            aegis.add(crossV);
            const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.06), goldMat);
            crossH.position.set(0, 0.12, 0.015);
            aegis.add(crossH);
        }
        this.shieldMount.rotation.set(0.12, 0, 0.15);
    }

    setHat(hatId) {
        while (this.hatMount.children.length > 0) {
            this.hatMount.remove(this.hatMount.children[0]);
        }
        this.pigData.currentHat = hatId || 'none';
        if (!hatId || hatId === 'none') return;

        if (hatId === 'sprout') {
            const stemMat = createOrganicSurfaceMaterial(0x16a34a, 0.65);
            const leafMat = createOrganicSurfaceMaterial(0x22c55e, 0.60);
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.28, 8), stemMat);
            stem.position.y = 0.14;
            this.hatMount.add(stem);
            const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), leafMat);
            leaf1.scale.set(1.4, 0.35, 0.75);
            leaf1.position.set(0.11, 0.26, 0);
            leaf1.rotation.z = -0.35;
            this.hatMount.add(leaf1);
            const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), leafMat);
            leaf2.scale.set(1.3, 0.32, 0.70);
            leaf2.position.set(-0.10, 0.24, 0);
            leaf2.rotation.z = 0.40;
            this.hatMount.add(leaf2);
        } else if (hatId === 'chef') {
            const hatWhite = createMatteMaterial(0xffffff, 0.7);
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.36, 0.18, 18), hatWhite);
            base.position.y = 0.09;
            this.hatMount.add(base);
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.36, 0.42, 18), hatWhite);
            top.position.y = 0.34;
            this.hatMount.add(top);
        } else if (hatId === 'crown') {
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 });
            const circlet = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.18, 16, 1, true), goldMat);
            circlet.position.y = 0.09;
            this.hatMount.add(circlet);
            for (let i = 0; i < 5; i++) {
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 6), goldMat);
                const a = (i / 5) * Math.PI * 2;
                spike.position.set(Math.cos(a) * 0.4, 0.26, Math.sin(a) * 0.4);
                this.hatMount.add(spike);
            }
        } else if (hatId === 'pirate') {
            const hatMat = createMatteMaterial(0x0f172a, 0.85);
            const triHat = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.32, 3), hatMat);
            triHat.position.y = 0.16;
            this.hatMount.add(triHat);
        } else if (hatId === 'tophat') {
            const blackMat = createMatteMaterial(0x1e293b, 0.8);
            const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.05, 20), blackMat);
            brim.position.y = 0.03;
            this.hatMount.add(brim);
            const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.45, 20), blackMat);
            crown.position.y = 0.26;
            this.hatMount.add(crown);
        } else if (hatId === 'wizard') {
            const wizMat = createOrganicSurfaceMaterial(0x4338ca, 0.7);
            const cone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.75, 18), wizMat);
            cone.position.y = 0.36;
            cone.rotation.z = -0.15;
            this.hatMount.add(cone);
        } else if (hatId === 'samurai') {
            const redMat = createOrganicSurfaceMaterial(0xdc2626, 0.6);
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.25 });
            const helm = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
            helm.position.y = 0.12;
            this.hatMount.add(helm);
            const crest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.04), goldMat);
            crest.position.set(0, 0.42, 0.38);
            crest.rotation.x = -0.3;
            this.hatMount.add(crest);
        } else if (hatId === 'gold_ingot') {
            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.15 });
            const ingot = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.22, 0.24, 16), goldMat);
            ingot.position.y = 0.14;
            this.hatMount.add(ingot);
        }
    }

    build3DNameplate() {
        this.nameCanvas = document.createElement('canvas');
        this.nameCanvas.width = 384;
        this.nameCanvas.height = 88;
        this.nameCtx = this.nameCanvas.getContext('2d');
        this.nameTex = new THREE.CanvasTexture(this.nameCanvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.nameTex, transparent: true, depthTest: false }));
        sprite.scale.set(3.1, 0.72, 1);
        sprite.position.set(0, 2.85, 0.25);
        this.visualGroup.add(sprite);
        this.updateNameplate();
    }

    updateNameplate() {
        if (!this.nameCtx) return;
        const ctx = this.nameCtx;
        ctx.clearRect(0, 0, 384, 88);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
        ctx.strokeStyle = this.pigData.color || '#f472b6';
        ctx.lineWidth = 4;

        if (ctx.roundRect) ctx.roundRect(10, 10, 364, 68, 22);
        else ctx.rect(10, 10, 364, 68);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 30px "Noto Sans TC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayName = this.pigData.name || '粉紅圓圓';
        ctx.fillText(displayName, 192, 44);
        if (this.nameTex) this.nameTex.needsUpdate = true;
    }

    build3DEmoteBubble() {
        this.emoteCanvas = document.createElement('canvas');
        this.emoteCanvas.width = 160;
        this.emoteCanvas.height = 160;
        this.emoteCtx = this.emoteCanvas.getContext('2d');
        this.emoteTex = new THREE.CanvasTexture(this.emoteCanvas);
        this.emoteSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.emoteTex, transparent: true, depthTest: false }));
        this.emoteSprite.scale.set(1.5, 1.5, 1);
        this.emoteSprite.position.set(0, 3.65, 0.25);
        this.emoteSprite.visible = false;
        this.visualGroup.add(this.emoteSprite);
        this.emoteTimer = 0;
    }

    showEmote(emojiStr, duration = 2.2) {
        if (!this.emoteCtx) return;
        const ctx = this.emoteCtx;
        ctx.clearRect(0, 0, 160, 160);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(80, 75, 62, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Speech pointer
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.moveTo(70, 134);
        ctx.lineTo(80, 155);
        ctx.lineTo(95, 134);
        ctx.fill();

        ctx.font = '54px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emojiStr, 80, 75);

        if (this.emoteTex) this.emoteTex.needsUpdate = true;
        this.emoteSprite.visible = true;
        this.emoteTimer = duration;
    }

    harvestCrop(plotPos, onHarvestDone) {
        this.aiState = 'HARVEST';
        this.harvestTarget = plotPos.clone();
        this.harvestTimer = 0;
        this.onHarvestDone = onHarvestDone;
        this.showEmote('🌾', 3.0);
    }

    playAttackAnimation() {
        this.body.velocity.z = 3.6;
        this.body.velocity.y = 2.4;
        this.weaponSwingTimer = 0.38;
        if (typeof sfx !== 'undefined' && sfx.playSlash) sfx.playSlash();
        if (typeof spawn3DParticle !== 'undefined') {
            spawn3DParticle('SPARKLE', this.root.position.clone().add(new THREE.Vector3(0.5, 1.2, 1.2)));
        }
    }

    playDefendAnimation() {
        this.defendBarrierTimer = 0.45;
        if (typeof sfx !== 'undefined' && sfx.playShieldBlock) sfx.playShieldBlock();
        if (typeof spawn3DParticle !== 'undefined') {
            spawn3DParticle('STAR', this.root.position.clone().add(new THREE.Vector3(-0.4, 1.2, 0.9)));
        }
    }

    pokeAtWorldPoint(worldPoint, worldNormal, strength = 0.36, tangentVel = null) {
        const localPt = this.bodyMesh.worldToLocal(worldPoint.clone());
        const invQuat = this.root.quaternion.clone().invert();
        const localNormal = worldNormal.clone().applyQuaternion(invQuat).normalize();
        const localTangent = tangentVel ? tangentVel.clone().applyQuaternion(invQuat) : null;

        const radius = 0.65;
        for (let i = 0; i < this.vCount; i++) {
            const rx = this.restPos[i * 3] - localPt.x;
            const ry = this.restPos[i * 3 + 1] - localPt.y;
            const rz = this.restPos[i * 3 + 2] - localPt.z;
            const d = Math.hypot(rx, ry, rz);

            if (d < radius) {
                const u = d / radius;
                const profile = u < 0.55
                    ? -Math.cos((u / 0.55) * Math.PI * 0.5)
                    : 0.30 * Math.sin(((u - 0.55) / 0.45) * Math.PI);
                const imp = profile * strength * this.softness[i] * 14.5;

                this.vel[i * 3]     += localNormal.x * imp;
                this.vel[i * 3 + 1] += localNormal.y * imp;
                this.vel[i * 3 + 2] += localNormal.z * imp;

                if (localTangent) {
                    const shear = Math.cos(u * Math.PI * 0.5) * this.softness[i] * 5.2;
                    this.vel[i * 3]     += localTangent.x * shear;
                    this.vel[i * 3 + 1] += localTangent.y * shear;
                    this.vel[i * 3 + 2] += localTangent.z * shear;
                }
            }
        }
    }

    update(dt) {
        if (!this.body) return;

        // Position synchronization
        this.root.position.copy(this.body.position);
        this.updateAIAndAnimation(dt);
        this.updateSoftBodySimulation(dt);

        if (this.emoteTimer > 0) {
            this.emoteTimer -= dt;
            if (this.emoteTimer <= 0) {
                this.emoteSprite.visible = false;
            }
        }
    }

    updateAIAndAnimation(dt) {
        const vel = this.body.velocity;
        const horizSpeed = Math.hypot(vel.x, vel.z);

        // State Machine
        if (this.aiState === 'HARVEST' && this.harvestTarget) {
            const toCrop = new THREE.Vector2(this.harvestTarget.x - this.body.position.x, this.harvestTarget.z - this.body.position.z);
            const dist = toCrop.length();
            if (dist > 1.2) {
                toCrop.normalize();
                this.body.velocity.x = toCrop.x * 2.8;
                this.body.velocity.z = toCrop.y * 2.8;
                this.facingAngle = Math.atan2(toCrop.x, toCrop.y);
            } else {
                this.body.velocity.x = 0;
                this.body.velocity.z = 0;
                this.harvestTimer += dt;
                // Foraging snout rooting animation
                this.snoutTipMesh.position.y = 1.06 + Math.sin(this.harvestTimer * 12) * 0.12;
                if (this.glbSnout && this.glbBasePos) {
                    this.glbSnout.position.y = this.glbBasePos.snout.y + Math.sin(this.harvestTimer * 12) * 0.08;
                }
                if (this.harvestTimer >= 1.6) {
                    if (this.onHarvestDone) this.onHarvestDone();
                    this.aiState = 'WANDER';
                    this.harvestTarget = null;
                    this.onHarvestDone = null;
                    this.showEmote('💕', 2.0);
                }
            }
        } else if (this.targetZone) {
            const toZone = new THREE.Vector2(this.targetZone.x - this.body.position.x, this.targetZone.z - this.body.position.z);
            const dist = toZone.length();
            if (dist > 1.4) {
                toZone.normalize();
                this.body.velocity.x = toZone.x * 2.4;
                this.body.velocity.z = toZone.y * 2.4;
                this.facingAngle = Math.atan2(toZone.x, toZone.y);
            } else {
                this.targetZone = null;
            }
        } else {
            this.wanderTimer -= dt;
            if (this.wanderTimer <= 0) {
                this.wanderTimer = 2.0 + Math.random() * 3.5;
                const r = 2.5 + Math.random() * 4.5;
                const a = Math.random() * Math.PI * 2;
                this.wanderTarget.set(Math.cos(a) * r, 0, Math.sin(a) * r);
            }
            const toWander = new THREE.Vector2(this.wanderTarget.x - this.body.position.x, this.wanderTarget.z - this.body.position.z);
            if (toWander.length() > 0.8) {
                toWander.normalize();
                this.body.velocity.x = toWander.x * 1.35;
                this.body.velocity.z = toWander.y * 1.35;
                this.facingAngle = Math.atan2(toWander.x, toWander.y);
            }
        }

        // Smooth rotation
        let angleDiff = this.facingAngle - this.root.rotation.y;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.root.rotation.y += angleDiff * Math.min(1, dt * 7.5);

        // Trot leg cycle
        if (horizSpeed > 0.3) {
            this.walkCycle += dt * horizSpeed * 4.8;
            this.legs[0].rotation.x = Math.sin(this.walkCycle) * 0.35;
            this.legs[1].rotation.x = -Math.sin(this.walkCycle) * 0.35;
            this.legs[2].rotation.x = -Math.sin(this.walkCycle) * 0.35;
            this.legs[3].rotation.x = Math.sin(this.walkCycle) * 0.35;

            if (this.glbLegFL && this.glbLegFR && this.glbLegBL && this.glbLegBR) {
                this.glbLegFL.rotation.x = this.glbBaseRot.fl.x + Math.sin(this.walkCycle) * 0.45;
                this.glbLegFR.rotation.x = this.glbBaseRot.fr.x - Math.sin(this.walkCycle) * 0.45;
                this.glbLegBL.rotation.x = this.glbBaseRot.bl.x - Math.sin(this.walkCycle) * 0.45;
                this.glbLegBR.rotation.x = this.glbBaseRot.br.x + Math.sin(this.walkCycle) * 0.45;
                this.visualGroup.position.y = Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;
            }
        } else {
            this.legs.forEach(l => { l.rotation.x *= 0.85; });
            if (this.glbLegFL && this.glbLegFR && this.glbLegBL && this.glbLegBR) {
                this.glbLegFL.rotation.x = this.glbBaseRot.fl.x;
                this.glbLegFR.rotation.x = this.glbBaseRot.fr.x;
                this.glbLegBL.rotation.x = this.glbBaseRot.bl.x;
                this.glbLegBR.rotation.x = this.glbBaseRot.br.x;
                this.visualGroup.position.y = 0;
            }
        }

        // Tail wag
        this.tailGroup.rotation.y = Math.sin(Date.now() * 0.007) * 0.32;
        this.tailGroup.rotation.z = Math.cos(Date.now() * 0.005) * 0.18;
        if (this.glbTail && this.glbBaseRot) {
            this.glbTail.rotation.y = this.glbBaseRot.tail.y + Math.sin(Date.now() * 0.008) * 0.35;
        }

        // Ear wiggles
        if (this.glbEarL && this.glbEarR && this.glbBaseRot) {
            const earSway = Math.sin(Date.now() * 0.004) * 0.08;
            this.glbEarL.rotation.z = this.glbBaseRot.earL.z + earSway;
            this.glbEarR.rotation.z = this.glbBaseRot.earR.z - earSway;
        }

        // Blinking
        this.blinkTimer -= dt;
        if (this.blinkTimer <= 0) {
            this.isBlinking = true;
            this.leftEyelid.rotation.x = 0;
            this.rightEyelid.rotation.x = 0;
            if (this.glbEyeL) this.glbEyeL.scale.y = 0.1;
            if (this.glbEyeR) this.glbEyeR.scale.y = 0.1;
            if (this.blinkTimer < -0.14) {
                this.isBlinking = false;
                this.leftEyelid.rotation.x = -Math.PI * 0.56;
                this.rightEyelid.rotation.x = -Math.PI * 0.56;
                if (this.glbEyeL) this.glbEyeL.scale.y = 1.0;
                if (this.glbEyeR) this.glbEyeR.scale.y = 1.0;
                this.blinkTimer = 2.5 + Math.random() * 3.5;
            }
        }

        // Combat weapon/shield animations
        if (this.weaponSwingTimer && this.weaponSwingTimer > 0) {
            this.weaponSwingTimer -= dt;
            this.weaponMount.rotation.x = 0.15 + Math.sin((1 - this.weaponSwingTimer / 0.38) * Math.PI) * 1.25;
            this.weaponMount.rotation.z = -0.15 - Math.sin((1 - this.weaponSwingTimer / 0.38) * Math.PI) * 0.85;
        } else {
            this.weaponMount.rotation.set(0.15 + Math.sin(Date.now() * 0.003) * 0.04, 0, -0.15);
        }

        if (this.defendBarrierTimer && this.defendBarrierTimer > 0) {
            this.defendBarrierTimer -= dt;
            this.shieldMount.position.x = -0.75;
            this.shieldMount.rotation.y = 0.85;
        } else {
            this.shieldMount.position.x = -1.15;
            this.shieldMount.rotation.set(0.12, 0, 0.15 + Math.cos(Date.now() * 0.003) * 0.04);
        }
    }

    updateSoftBodySimulation(dt) {
        const subSteps = 2;
        const subDt = dt / subSteps;
        const stiffness = 85.0;
        const damping = 0.94;

        for (let step = 0; step < subSteps; step++) {
            for (let i = 0; i < this.vCount; i++) {
                const i3 = i * 3;
                const rx = this.restPos[i3], ry = this.restPos[i3 + 1], rz = this.restPos[i3 + 2];
                let cx = this.currPos[i3], cy = this.currPos[i3 + 1], cz = this.currPos[i3 + 2];
                let vx = this.vel[i3], vy = this.vel[i3 + 1], vz = this.vel[i3 + 2];

                const fx = (rx - cx) * stiffness;
                const fy = (ry - cy) * stiffness;
                const fz = (rz - cz) * stiffness;

                vx = (vx + fx * subDt) * damping;
                vy = (vy + fy * subDt) * damping;
                vz = (vz + fz * subDt) * damping;

                cx += vx * subDt;
                cy += vy * subDt;
                cz += vz * subDt;

                this.currPos[i3] = cx;
                this.currPos[i3 + 1] = cy;
                this.currPos[i3 + 2] = cz;
                this.vel[i3] = vx;
                this.vel[i3 + 1] = vy;
                this.vel[i3 + 2] = vz;
            }
        }

        const posAttr = this.bodyMesh.geometry.attributes.position;
        posAttr.copyArray(this.currPos);
        posAttr.needsUpdate = true;
    }

    destroy() {
        if (this.body && world) {
            world.remove(this.body);
        }
        if (this.root && scene) {
            scene.remove(this.root);
        }
    }
}

/**
 * PigManager: Manages all pig instances in the 3D scene
 */
const PigManager = {
    instances: [],

    init(pigsData) {
        this.clearAll();
        pigsData.forEach((pData, idx) => {
            const angle = (idx / Math.max(1, pigsData.length)) * Math.PI * 2;
            const dist = idx === 0 ? 0 : 2.5 + (idx * 0.8);
            const initPos = new THREE.Vector3(Math.cos(angle) * dist, 1.5, Math.sin(angle) * dist);
            const pigInst = new PerVertexSoftBodyPig(pData, initPos);
            this.instances.push(pigInst);
        });
    },

    clearAll() {
        this.instances.forEach(inst => inst.destroy());
        this.instances.length = 0;
    },

    getActivePigInstance() {
        return this.instances[gameState.activePigIndex] || this.instances[0] || null;
    },

    addPig(newPigData) {
        const count = this.instances.length;
        const angle = Math.random() * Math.PI * 2;
        const dist = 2.5 + Math.random() * 2.0;
        const initPos = new THREE.Vector3(Math.cos(angle) * dist, 1.5, Math.sin(angle) * dist);
        const newInst = new PerVertexSoftBodyPig(newPigData, initPos);
        this.instances.push(newInst);
        newInst.showEmote('✨', 3.0);
        return newInst;
    },

    update(dt) {
        this.instances.forEach(inst => inst.update(dt));
    },

    syncFromGameState(pigsData) {
        if (!pigsData || !Array.isArray(pigsData)) return;
        if (pigsData.length !== this.instances.length) {
            this.init(pigsData);
        } else {
            pigsData.forEach((pData, idx) => {
                const inst = this.instances[idx];
                if (inst) {
                    inst.pigData = pData;
                    if (pData.name) inst.updateNameplate();
                    if (pData.color) inst.setSkinColor(pData.color);
                    if (pData.currentHat) inst.setHat(pData.currentHat);
                    if (pData.currentOutfit) inst.setOutfit(pData.currentOutfit);
                    if (pData.equippedWeapon !== undefined) inst.setWeapon(pData.equippedWeapon);
                    if (pData.equippedShield !== undefined) inst.setShield(pData.equippedShield);
                }
            });
        }
    }
};

if (typeof window !== 'undefined') {
    window.PerVertexSoftBodyPig = PerVertexSoftBodyPig;
    window.PigManager = PigManager;
}
if (typeof global !== 'undefined') {
    global.PerVertexSoftBodyPig = PerVertexSoftBodyPig;
    global.PigManager = PigManager;
}

