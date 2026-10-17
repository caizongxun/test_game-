/**
 * 3D Royal Piggy Farm - Game State & Multi-Pig Persistence
 * Module: js/state.js
 */

const STORAGE_KEY = 'PIG_SIM_3D_SAVE_V3';

const defaultPigData = {
    id: 'pig_1',
    name: '粉紅圓圓',
    breed: 'sakura_pink',
    color: '#ffb6c1',
    weight: 15.0,
    hunger: 80,
    mood: 85,
    energy: 90,
    cleanliness: 92,
    intimacy: 12,
    intimacyLevel: 1,
    currentHat: 'sprout',
    currentOutfit: 'none',
    equippedWeapon: null,
    equippedShield: null,
    stateLabel: '閒晃中'
};

const gameState = {
    coins: 500,
    activePigIndex: 0,
    pigs: [ Object.assign({}, defaultPigData) ],
    currentBiome: 'sunny',
    unlockedBiomes: { sunny: true },
    ingStock: { A: 5, B: 5, C: 4, D: 3, E: 3, F: 2, G: 2, H: 2, I: 1, J: 1 },
    ownedToys: { soccer: true, bowling: true },
    activeToys: { soccer: true, bowling: true },
    upgradeLevels: { touch_power: 0, touch_crit: 0, auto_arm: 0, auto_ticket: 0, auto_chef: 0, auto_truffle: 0 },
    activeBuff: BUFF_TYPES[0],
    buffTimer: 0,
    troughMask: 0,
    unlockedRecipes: {},
    ownedHats: { none: true, sprout: true },
    ownedOutfits: { none: true },
    ownedEquip: {},
    estateLevels: {},
    battleStagesUnlocked: 1,
    battleWins: 0,
    forgeLevels: { weapon: 0, shield: 0 },
    battlePotions: { potion_atk: 0, potion_def: 0, potion_heal: 1, smoke_bomb: 0, revive_cross: 0 },
    farmland: {
        unlockedCount: 1,
        plots: [
            { id: 0, status: 'EMPTY', cropId: null, plantTime: 0, totalSec: 0, watered: false },
            { id: 1, status: 'EMPTY', cropId: null, plantTime: 0, totalSec: 0, watered: false },
            { id: 2, status: 'EMPTY', cropId: null, plantTime: 0, totalSec: 0, watered: false },
            { id: 3, status: 'EMPTY', cropId: null, plantTime: 0, totalSec: 0, watered: false },
            { id: 4, status: 'EMPTY', cropId: null, plantTime: 0, totalSec: 0, watered: false },
            { id: 5, status: 'EMPTY', cropId: null, plantTime: 0, totalSec: 0, watered: false }
        ]
    },
    seedInventory: { seed_A: 2, seed_B: 2, seed_C: 1, seed_D: 0, seed_E: 0, seed_F: 0, seed_G: 0, seed_H: 0, seed_I: 0, seed_J: 0 }
};

// Compatibility property getters/setters for active pig
Object.defineProperty(gameState, 'pigName', {
    get() { return this.getActivePig().name; },
    set(v) { this.getActivePig().name = v; }
});
Object.defineProperty(gameState, 'weight', {
    get() { return this.getActivePig().weight; },
    set(v) { this.getActivePig().weight = v; }
});
Object.defineProperty(gameState, 'hunger', {
    get() { return this.getActivePig().hunger; },
    set(v) { this.getActivePig().hunger = v; }
});
Object.defineProperty(gameState, 'mood', {
    get() { return this.getActivePig().mood; },
    set(v) { this.getActivePig().mood = v; }
});
Object.defineProperty(gameState, 'energy', {
    get() { return this.getActivePig().energy; },
    set(v) { this.getActivePig().energy = v; }
});
Object.defineProperty(gameState, 'cleanliness', {
    get() { return this.getActivePig().cleanliness; },
    set(v) { this.getActivePig().cleanliness = v; }
});
Object.defineProperty(gameState, 'intimacy', {
    get() { return this.getActivePig().intimacy; },
    set(v) { this.getActivePig().intimacy = v; }
});
Object.defineProperty(gameState, 'intimacyLevel', {
    get() { return this.getActivePig().intimacyLevel; },
    set(v) { this.getActivePig().intimacyLevel = v; }
});
Object.defineProperty(gameState, 'stateLabel', {
    get() { return this.getActivePig().stateLabel; },
    set(v) { this.getActivePig().stateLabel = v; }
});
Object.defineProperty(gameState, 'currentHat', {
    get() { return this.getActivePig().currentHat; },
    set(v) { this.getActivePig().currentHat = v; }
});
Object.defineProperty(gameState, 'currentOutfit', {
    get() { return this.getActivePig().currentOutfit || 'none'; },
    set(v) { this.getActivePig().currentOutfit = v; }
});
Object.defineProperty(gameState, 'equippedWeapon', {
    get() { return this.getActivePig().equippedWeapon; },
    set(v) { this.getActivePig().equippedWeapon = v; }
});
Object.defineProperty(gameState, 'equippedShield', {
    get() { return this.getActivePig().equippedShield; },
    set(v) { this.getActivePig().equippedShield = v; }
});

gameState.getActivePig = function() {
    if (!this.pigs || this.pigs.length === 0) {
        this.pigs = [ Object.assign({}, defaultPigData) ];
        this.activePigIndex = 0;
    }
    if (this.activePigIndex < 0 || this.activePigIndex >= this.pigs.length) {
        this.activePigIndex = 0;
    }
    return this.pigs[this.activePigIndex];
};

gameState.addNewPig = function(name, breedId) {
    const breed = PIG_BREEDS_CATALOG.find(b => b.id === breedId) || PIG_BREEDS_CATALOG[0];
    const newId = 'pig_' + Date.now();
    const newPig = Object.assign({}, defaultPigData, {
        id: newId,
        name: name || `${breed.name}`,
        breed: breed.id,
        color: breed.color,
        weight: 12.0 + Math.random() * 4.0,
        hunger: 85,
        mood: 90,
        energy: 95,
        cleanliness: 95,
        intimacy: 0,
        intimacyLevel: 1,
        currentHat: 'none',
        currentOutfit: 'none',
        equippedWeapon: null,
        equippedShield: null,
        stateLabel: '剛來到牧場'
    });
    this.pigs.push(newPig);
    this.activePigIndex = this.pigs.length - 1;
    saveGameState();
    return newPig;
};

gameState.getPigAdoptionCost = function() {
    const count = this.pigs.length;
    const costs = [0, 800, 2400, 6000, 15000, 35000, 80000];
    return costs[count] || Math.round(35000 * Math.pow(2.2, count - 5));
};

function getTouchCoinGain() {
    let base = 3;
    UPGRADES_CATALOG.forEach(up => {
        if (up.type === 'touch') {
            base += (gameState.upgradeLevels[up.id] || 0) * up.bonus;
        }
    });
    const curPig = gameState.getActivePig();
    if (curPig.breed === 'royal_gold') base = Math.round(base * 1.15);
    if (curPig.currentOutfit === 'festive_apron') base = Math.round(base * 1.50);
    if (gameState.estateLevels && gameState.estateLevels.fortune_windmill) {
        base = Math.round(base * 1.5);
    }
    return base;
}

function getAutoCoinPerSec() {
    let total = 0;
    UPGRADES_CATALOG.forEach(up => {
        if (up.type === 'auto') {
            total += (gameState.upgradeLevels[up.id] || 0) * up.bonus;
        }
    });
    TOYS_CATALOG.forEach(toy => {
        if (gameState.ownedToys[toy.id]) {
            total += toy.passiveCoin;
        }
    });
    ESTATE_CATALOG.forEach(est => {
        if (gameState.estateLevels && gameState.estateLevels[est.id]) {
            total += est.passiveCoin || 0;
        }
    });
    // Extra passive bonus from number of pigs happy in the pasture
    const pigBonus = (gameState.pigs.length - 1) * 2;
    total += Math.max(0, pigBonus);
    return total;
}

function getUpgradeCost(up) {
    const lv = gameState.upgradeLevels[up.id] || 0;
    return Math.round(up.baseCost * Math.pow(up.costMult, lv));
}

function loadGameState() {
    try {
        // Try V3 first
        let raw = localStorage.getItem(STORAGE_KEY);
        let isLegacy = false;
        if (!raw) {
            // Check legacy V2
            raw = localStorage.getItem('PIG_SIM_3D_SAVE_V2');
            isLegacy = true;
        }
        if (raw) {
            const data = JSON.parse(raw);
            if (typeof data.coins === 'number') gameState.coins = Math.max(0, Math.floor(data.coins));
            if (typeof data.currentBiome === 'string') gameState.currentBiome = data.currentBiome;
            if (data.unlockedBiomes) Object.assign(gameState.unlockedBiomes, data.unlockedBiomes);
            if (data.ingStock) Object.assign(gameState.ingStock, data.ingStock);
            if (data.ownedToys) Object.assign(gameState.ownedToys, data.ownedToys);
            if (data.activeToys) Object.assign(gameState.activeToys, data.activeToys);
            if (data.upgradeLevels) Object.assign(gameState.upgradeLevels, data.upgradeLevels);
            if (data.unlockedRecipes && typeof data.unlockedRecipes === 'object') {
                gameState.unlockedRecipes = data.unlockedRecipes;
            }
            if (data.ownedEquip && typeof data.ownedEquip === 'object') Object.assign(gameState.ownedEquip, data.ownedEquip);
            if (data.estateLevels && typeof data.estateLevels === 'object') Object.assign(gameState.estateLevels, data.estateLevels);
            if (typeof data.battleStagesUnlocked === 'number') gameState.battleStagesUnlocked = Math.max(1, Math.min(5, data.battleStagesUnlocked));
            if (typeof data.battleWins === 'number') gameState.battleWins = data.battleWins;
            if (data.forgeLevels) Object.assign(gameState.forgeLevels, data.forgeLevels);
            if (data.battlePotions) Object.assign(gameState.battlePotions, data.battlePotions);
            if (data.seedInventory) Object.assign(gameState.seedInventory, data.seedInventory);
            if (data.ownedHats) Object.assign(gameState.ownedHats, data.ownedHats);
            if (data.ownedOutfits) Object.assign(gameState.ownedOutfits, data.ownedOutfits);

            if (data.farmland) {
                if (typeof data.farmland.unlockedCount === 'number') {
                    gameState.farmland.unlockedCount = Math.max(1, Math.min(6, data.farmland.unlockedCount));
                }
                if (Array.isArray(data.farmland.plots)) {
                    data.farmland.plots.forEach((p, idx) => {
                        if (gameState.farmland.plots[idx]) {
                            Object.assign(gameState.farmland.plots[idx], p);
                        }
                    });
                }
            }

            // Pigs restoration
            if (Array.isArray(data.pigs) && data.pigs.length > 0) {
                gameState.pigs = data.pigs.map(p => Object.assign({}, defaultPigData, p));
                if (typeof data.activePigIndex === 'number') {
                    gameState.activePigIndex = Math.max(0, Math.min(gameState.pigs.length - 1, data.activePigIndex));
                }
            } else if (isLegacy) {
                // Migrate single legacy pig
                const legacyPig = Object.assign({}, defaultPigData);
                if (data.pigName) legacyPig.name = String(data.pigName).slice(0, 12);
                if (typeof data.weight === 'number') legacyPig.weight = data.weight;
                if (typeof data.hunger === 'number') legacyPig.hunger = data.hunger;
                if (typeof data.mood === 'number') legacyPig.mood = data.mood;
                if (typeof data.energy === 'number') legacyPig.energy = data.energy;
                if (typeof data.cleanliness === 'number') legacyPig.cleanliness = data.cleanliness;
                if (typeof data.intimacy === 'number') legacyPig.intimacy = data.intimacy;
                if (typeof data.intimacyLevel === 'number') legacyPig.intimacyLevel = data.intimacyLevel;
                if (typeof data.currentHat === 'string') legacyPig.currentHat = data.currentHat;
                if (typeof data.equippedWeapon === 'string' || data.equippedWeapon === null) legacyPig.equippedWeapon = data.equippedWeapon;
                if (typeof data.equippedShield === 'string' || data.equippedShield === null) legacyPig.equippedShield = data.equippedShield;
                gameState.pigs = [ legacyPig ];
                gameState.activePigIndex = 0;
            }
        }
    } catch (e) {
        console.warn('無法載入存檔:', e);
    }
}

function saveGameState() {
    try {
        const payload = {
            coins: Math.floor(gameState.coins),
            activePigIndex: gameState.activePigIndex,
            pigs: gameState.pigs,
            currentBiome: gameState.currentBiome,
            unlockedBiomes: gameState.unlockedBiomes,
            ingStock: gameState.ingStock,
            ownedToys: gameState.ownedToys,
            activeToys: gameState.activeToys,
            upgradeLevels: gameState.upgradeLevels,
            unlockedRecipes: gameState.unlockedRecipes,
            ownedHats: gameState.ownedHats,
            ownedOutfits: gameState.ownedOutfits,
            ownedEquip: gameState.ownedEquip,
            estateLevels: gameState.estateLevels,
            battleStagesUnlocked: gameState.battleStagesUnlocked,
            battleWins: gameState.battleWins,
            forgeLevels: gameState.forgeLevels,
            battlePotions: gameState.battlePotions,
            farmland: gameState.farmland,
            seedInventory: gameState.seedInventory
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn('無法寫入存檔:', e);
    }
}
loadGameState();

if (typeof window !== 'undefined') {
    window.gameState = gameState;
    window.defaultPigData = defaultPigData;
    window.saveGameState = saveGameState;
    window.loadGameState = loadGameState;
    window.getTouchCoinGain = getTouchCoinGain;
    window.getAutoCoinPerSec = getAutoCoinPerSec;
}
if (typeof global !== 'undefined') {
    global.gameState = gameState;
    global.defaultPigData = defaultPigData;
    global.saveGameState = saveGameState;
    global.loadGameState = loadGameState;
    global.getTouchCoinGain = getTouchCoinGain;
    global.getAutoCoinPerSec = getAutoCoinPerSec;
}

