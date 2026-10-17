/**
 * 3D Royal Piggy Farm - Pig-to-Pig Social Interaction System
 * Module: js/interactions.js
 */

const InteractionSystem = {
    checkInterval: 2.0,
    timer: 1.0,

    update(dt) {
        if (!PigManager || PigManager.instances.length < 2) return;

        this.timer -= dt;
        if (this.timer > 0) return;
        this.timer = this.checkInterval + Math.random() * 1.5;

        const pigs = PigManager.instances;
        const n = pigs.length;

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const pigA = pigs[i];
                const pigB = pigs[j];

                if (!pigA.body || !pigB.body) continue;
                if (pigA.aiState === 'HARVEST' || pigB.aiState === 'HARVEST') continue;
                if (pigA.interactionCooldown > 0 || pigB.interactionCooldown > 0) continue;

                const posA = pigA.body.position;
                const posB = pigB.body.position;
                const dist = Math.hypot(posA.x - posB.x, posA.z - posB.z);

                if (dist > 1.2 && dist < 3.2) {
                    this.triggerInteraction(pigA, pigB);
                    return; // Trigger one interaction per cycle to keep pacing natural
                }
            }
        }

        // Decay cooldowns
        pigs.forEach(p => {
            if (p.interactionCooldown && p.interactionCooldown > 0) {
                p.interactionCooldown -= dt;
            }
        });
    },

    triggerInteraction(pigA, pigB) {
        // Set cooldowns (8-14 seconds between interactions)
        pigA.interactionCooldown = 9.0 + Math.random() * 5.0;
        pigB.interactionCooldown = 9.0 + Math.random() * 5.0;

        const roll = Math.random();

        if (roll < 0.35) {
            // Interaction 1: Sniff & Greet
            pigA.facingAngle = Math.atan2(pigB.body.position.x - pigA.body.position.x, pigB.body.position.z - pigA.body.position.z);
            pigB.facingAngle = Math.atan2(pigA.body.position.x - pigB.body.position.x, pigA.body.position.z - pigB.body.position.z);

            pigA.showEmote('💬', 2.5);
            setTimeout(() => {
                if (pigB) pigB.showEmote('❤️', 2.0);
            }, 600);

            pigA.pigData.mood = Math.min(100, (pigA.pigData.mood || 80) + 3);
            pigB.pigData.mood = Math.min(100, (pigB.pigData.mood || 80) + 3);
            if (typeof sfx !== 'undefined' && sfx.playOink) sfx.playOink(1.1);

            if (typeof updateHUD === 'function') updateHUD();
        } else if (roll < 0.70) {
            // Interaction 2: Nuzzling / Cuddle
            pigA.showEmote('💕', 2.8);
            pigB.showEmote('💕', 2.8);

            pigA.pigData.intimacy = (pigA.pigData.intimacy || 0) + 1;
            pigB.pigData.intimacy = (pigB.pigData.intimacy || 0) + 1;
            pigA.pigData.mood = Math.min(100, (pigA.pigData.mood || 80) + 5);
            pigB.pigData.mood = Math.min(100, (pigB.pigData.mood || 80) + 5);

            if (typeof spawn3DParticle === 'function') {
                const midPos = pigA.root.position.clone().add(pigB.root.position).multiplyScalar(0.5).add(new THREE.Vector3(0, 1.8, 0));
                spawn3DParticle('HEART', midPos);
            }
            if (typeof sfx !== 'undefined' && sfx.playSoftTouch) sfx.playSoftTouch(540);
            if (typeof updateHUD === 'function') updateHUD();
        } else {
            // Interaction 3: Playful Tag / Chase
            pigA.showEmote('🏃', 2.2);
            pigB.showEmote('⭐', 2.2);

            // Pig A bounds in one direction, Pig B follows
            const fleeAngle = Math.random() * Math.PI * 2;
            pigA.wanderTarget.set(Math.cos(fleeAngle) * 4.5, 0, Math.sin(fleeAngle) * 4.5);
            pigA.wanderTimer = 3.0;

            setTimeout(() => {
                if (pigB && pigA.body) {
                    pigB.wanderTarget.copy(pigA.body.position);
                    pigB.wanderTimer = 2.8;
                }
            }, 400);

            pigA.pigData.energy = Math.min(100, (pigA.pigData.energy || 80) + 4);
            pigB.pigData.energy = Math.min(100, (pigB.pigData.energy || 80) + 4);
            if (typeof sfx !== 'undefined' && sfx.playOink) sfx.playOink(1.25);
        }
    }
};

if (typeof window !== 'undefined') {
    window.InteractionSystem = InteractionSystem;
}
if (typeof global !== 'undefined') {
    global.InteractionSystem = InteractionSystem;
}

