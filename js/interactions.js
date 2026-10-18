/**
 * 3D Royal Piggy Farm - Pig-to-Pig Social Interaction System
 * Module: js/interactions.js
 */

const InteractionSystem = {
    checkInterval: 1.2,
    timer: 0.5,

    update(dt) {
        if (!PigManager || PigManager.instances.length < 2) return;

        const pigs = PigManager.instances;

        // Unconditionally decay cooldowns every single frame
        pigs.forEach(p => {
            if (p.interactionCooldown && p.interactionCooldown > 0) {
                p.interactionCooldown -= dt;
            }
        });

        this.timer -= dt;
        if (this.timer > 0) return;
        this.timer = this.checkInterval + Math.random() * 0.8;

        const n = pigs.length;

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const pigA = pigs[i];
                const pigB = pigs[j];

                if (!pigA.body || !pigB.body) continue;
                if (pigA.aiState === 'HARVEST' || pigB.aiState === 'HARVEST') continue;
                if ((pigA.interactionCooldown && pigA.interactionCooldown > 0) ||
                    (pigB.interactionCooldown && pigB.interactionCooldown > 0)) continue;

                const posA = pigA.body.position;
                const posB = pigB.body.position;
                const dist = Math.hypot(posA.x - posB.x, posA.z - posB.z);

                // If within reasonable proximity, trigger social interaction
                if (dist > 0.8 && dist < 3.8) {
                    this.triggerInteraction(pigA, pigB);
                    return;
                } else if (dist >= 3.8 && dist < 6.5 && Math.random() < 0.35) {
                    // Mutual curiosity: Pig A gently ambles toward Pig B
                    pigA.wanderTarget.set((posA.x + posB.x) * 0.5, 0, (posA.z + posB.z) * 0.5);
                    pigA.wanderTimer = 2.5;
                }
            }
        }
    },

    triggerInteraction(pigA, pigB) {
        // Set cooldowns (5-8 seconds between interactions)
        pigA.interactionCooldown = 5.0 + Math.random() * 3.5;
        pigB.interactionCooldown = 5.0 + Math.random() * 3.5;

        // Both pigs face each other
        pigA.facingAngle = Math.atan2(pigB.body.position.x - pigA.body.position.x, pigB.body.position.z - pigA.body.position.z);
        pigB.facingAngle = Math.atan2(pigA.body.position.x - pigB.body.position.x, pigA.body.position.z - pigB.body.position.z);

        const roll = Math.random();

        if (roll < 0.30) {
            // Interaction 1: Sniff & Nose Boop (貼鼻打招呼)
            pigA.showEmote('💬', 2.2);
            if (pigA.triggerSkinJiggle) pigA.triggerSkinJiggle(0.18);
            setTimeout(() => {
                if (pigB) {
                    pigB.showEmote('❤️', 2.0);
                    if (pigB.triggerSkinJiggle) pigB.triggerSkinJiggle(0.18);
                }
            }, 450);

            pigA.pigData.mood = Math.min(100, (pigA.pigData.mood || 80) + 4);
            pigB.pigData.mood = Math.min(100, (pigB.pigData.mood || 80) + 4);
            if (typeof sfx !== 'undefined' && sfx.playOink) sfx.playOink(1.1);
            if (typeof updateHUD === 'function') updateHUD();
        } else if (roll < 0.60) {
            // Interaction 2: Nuzzling / Cuddle (親密依偎)
            pigA.showEmote('💕', 2.6);
            pigB.showEmote('💕', 2.6);
            if (pigA.triggerSkinJiggle) pigA.triggerSkinJiggle(0.22);
            if (pigB.triggerSkinJiggle) pigB.triggerSkinJiggle(0.22);

            pigA.pigData.intimacy = (pigA.pigData.intimacy || 0) + 2;
            pigB.pigData.intimacy = (pigB.pigData.intimacy || 0) + 2;
            pigA.pigData.mood = Math.min(100, (pigA.pigData.mood || 80) + 6);
            pigB.pigData.mood = Math.min(100, (pigB.pigData.mood || 80) + 6);

            if (typeof spawn3DParticle === 'function') {
                const midPos = pigA.root.position.clone().add(pigB.root.position).multiplyScalar(0.5).add(new THREE.Vector3(0, 1.8, 0));
                spawn3DParticle('HEART', midPos);
            }
            if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(540);
            if (typeof updateHUD === 'function') updateHUD();
        } else if (roll < 0.82) {
            // Interaction 3: Playful Chase (互追嬉鬧)
            pigA.showEmote('🏃', 2.0);
            pigB.showEmote('✨', 2.0);

            const fleeAngle = Math.random() * Math.PI * 2;
            pigA.wanderTarget.set(Math.cos(fleeAngle) * 4.0, 0, Math.sin(fleeAngle) * 4.0);
            pigA.wanderTimer = 2.5;

            setTimeout(() => {
                if (pigB && pigA.body) {
                    pigB.wanderTarget.copy(pigA.body.position);
                    pigB.wanderTimer = 2.2;
                }
            }, 300);

            pigA.pigData.energy = Math.min(100, (pigA.pigData.energy || 80) + 5);
            pigB.pigData.energy = Math.min(100, (pigB.pigData.energy || 80) + 5);
            if (typeof sfx !== 'undefined' && sfx.playOink) sfx.playOink(1.25);
        } else {
            // Interaction 4: Synchronized Joyful Hop (結伴共舞小跳步)
            pigA.showEmote('⭐', 2.4);
            pigB.showEmote('⭐', 2.4);
            pigA.body.velocity.y = 2.6;
            setTimeout(() => {
                if (pigB && pigB.body) pigB.body.velocity.y = 2.6;
            }, 150);

            if (typeof spawnFloatingText === 'function') {
                spawnFloatingText('小豬夥伴共鳴 +10 金幣', pigA.root.position.clone().add(new THREE.Vector3(0, 2.4, 0)), '#facc15');
            }
            if (typeof gameState !== 'undefined') {
                gameState.coins += 10;
            }
            if (typeof sfx !== 'undefined' && sfx.playChime) sfx.playChime();
            if (typeof updateHUD === 'function') updateHUD();
        }
    }
};

if (typeof window !== 'undefined') {
    window.InteractionSystem = InteractionSystem;
}
if (typeof global !== 'undefined') {
    global.InteractionSystem = InteractionSystem;
}

