/**
 * 3D Royal Piggy Farm - Game Constants & Data Catalogs
 * Module: js/constants.js
 */

const INGREDIENTS = [
    { code: 'A', bit: 1,   name: '紅富士蘋果', short: '蘋果',   price: 10,  color: '#ef4444', accent: '#22c55e', hunger: 12, mood: 8,  energy: 6,  weight: 0.25, flavor: '果香清甜' },
    { code: 'B', bit: 2,   name: '鮮嫩胡蘿蔔', short: '胡蘿蔔', price: 12,  color: '#f97316', accent: '#16a34a', hunger: 14, mood: 6,  energy: 9,  weight: 0.22, flavor: '爽脆甘甜' },
    { code: 'C', bit: 4,   name: '黃金甜玉米', short: '甜玉米', price: 18,  color: '#facc15', accent: '#65a30d', hunger: 18, mood: 9,  energy: 11, weight: 0.38, flavor: '濃郁穀香' },
    { code: 'D', bit: 8,   name: '栗子奶油南瓜', short: '南瓜', price: 24,  color: '#ea580c', accent: '#a16207', hunger: 22, mood: 10, energy: 8,  weight: 0.48, flavor: '綿密奶香' },
    { code: 'E', bit: 16,  name: '森林紅傘菇', short: '紅傘菇', price: 28,  color: '#dc2626', accent: '#fef08a', hunger: 11, mood: 14, energy: 15, weight: 0.18, flavor: '山林鮮味' },
    { code: 'F', bit: 32,  name: '橡木果實',   short: '橡實',   price: 35,  color: '#92400e', accent: '#d97706', hunger: 19, mood: 11, energy: 14, weight: 0.42, flavor: '堅果醇厚' },
    { code: 'G', bit: 64,  name: '翠綠西瓜切片', short: '西瓜', price: 42,  color: '#f43f5e', accent: '#16a34a', hunger: 15, mood: 18, energy: 12, weight: 0.30, flavor: '冰涼多汁' },
    { code: 'H', bit: 128, name: '紫心蜜番薯', short: '紫番薯', price: 50,  color: '#9333ea', accent: '#f59e0b', hunger: 24, mood: 9,  energy: 10, weight: 0.52, flavor: '鬆軟蜜香' },
    { code: 'I', bit: 256, name: '青綠花椰菜', short: '花椰菜', price: 65,  color: '#15803d', accent: '#86efac', hunger: 13, mood: 7,  energy: 18, weight: 0.15, flavor: '翠綠高纖' },
    { code: 'J', bit: 512, name: '頂級黑松露', short: '黑松露', price: 110, color: '#334155', accent: '#fbbf24', hunger: 20, mood: 26, energy: 22, weight: 0.45, flavor: '皇家鑽香' }
];

const TOYS_CATALOG = [
    { id: 'soccer',        name: '經典綠茵足球',     price: 0,    passiveCoin: 1,  desc: '預設牧場彈力球，小豬最愛頂著跑' },
    { id: 'bowling',       name: '皇家木製保齡球瓶', price: 60,   passiveCoin: 2,  desc: '圓潤白紅相間球瓶，撞倒可獲額外喝采' },
    { id: 'beachball',     name: '六彩海灘充氣球',   price: 90,   passiveCoin: 2,  desc: '輕盈高彈性的彩色條紋大球' },
    { id: 'ducky',         name: '巨型黃色洗澡鴨',   price: 130,  passiveCoin: 3,  desc: '圓滾滾的療癒小鴨玩偶' },
    { id: 'stacker',       name: '彩虹木製疊疊塔',   price: 180,  passiveCoin: 4,  desc: '五層繽紛圓環套柱木玩' },
    { id: 'pinecone',      name: '森林巨型松果滾筒', price: 240,  passiveCoin: 5,  desc: '散發木質香氣的多層鱗片松果' },
    { id: 'cheese',        name: '瑞士氣孔大起司輪', price: 310,  passiveCoin: 6,  desc: '金黃濃郁的立體起司滾輪玩具' },
    { id: 'strawberry',    name: '絨毛紅草莓抱枕',   price: 390,  passiveCoin: 8,  desc: '柔軟帶綠蒂與果籽的巨型草莓墊' },
    { id: 'lollipop',      name: '雙色螺旋大棒棒糖', price: 480,  passiveCoin: 9,  desc: '粉白相間的夢幻甜點模型玩具' },
    { id: 'dumbbell',      name: '大力士雙球啞鈴',   price: 580,  passiveCoin: 11, desc: '鍛鍊小豬肩胛肌肉的重量級玩具' },
    { id: 'xylophone',     name: '彩色八音敲擊木琴', price: 700,  passiveCoin: 13, desc: '五彩木鍵琴架，碰觸時清脆悅耳' },
    { id: 'rocking_horse', name: '復古紅白搖搖木馬', price: 850,  passiveCoin: 16, desc: '帶弧形底座的精緻木雕小馬' },
    { id: 'train',         name: '牧場蒸汽小火車頭', price: 1020, passiveCoin: 19, desc: '附煙囪與四輪的經典木造火車' },
    { id: 'chess_king',    name: '皇家西洋棋國王',   price: 1200, passiveCoin: 22, desc: '高聳雕刻王冠十字的巨型棋子' },
    { id: 'cake',          name: '雙層奶油生日蛋糕', price: 1450, passiveCoin: 26, desc: '點綴鮮紅草莓與蠟燭的慶典模型' },
    { id: 'saxophone',     name: '黃金爵士薩克斯風', price: 1750, passiveCoin: 31, desc: '彎管喇叭造型的閃耀音樂玩具' },
    { id: 'treasure',      name: '海盜黃金寶藏木箱', price: 2100, passiveCoin: 37, desc: '鑲有金邊與鎖扣的圓頂尋寶箱' },
    { id: 'gramophone',    name: '古典銅號留聲機',   price: 2500, passiveCoin: 44, desc: '胡桃木底座搭配金色喇叭號角' },
    { id: 'rocket',        name: '紅白星際探險火箭', price: 3000, passiveCoin: 52, desc: '流線鼻錐與三翼推進尾翼模型' },
    { id: 'crystal_ball',  name: '星象占卜紫水晶球', price: 3600, passiveCoin: 62, desc: '底座鑲金的神秘剔透能量球' },
    { id: 'carousel',      name: '皇家迷你旋轉木馬', price: 4400, passiveCoin: 75, desc: '華麗圓頂帳篷與三柱旋轉座' },
    { id: 'mecha_pig',     name: '純金發條機械小豬', price: 5400, passiveCoin: 90, desc: '背部附大型發條鑰匙的精密金豬' },
    { id: 'jade_cabbage',  name: '翠玉白菜珍寶擺件', price: 6800, passiveCoin: 115, desc: '潔白菜梗與翠綠葉簇的皇家奇珍' },
    { id: 'gold_statue',   name: '至尊純金招財豬尊', price: 9200, passiveCoin: 160, desc: '大理石基座上的頂級黃金小豬聖像' }
];

const UPGRADES_CATALOG = [
    { id: 'touch_power', name: '絲絨按摩手套',     baseCost: 50,   costMult: 1.55, type: 'touch', bonus: 2,  desc: '每次滑動撫摸小豬獲得的金幣 +2' },
    { id: 'touch_crit',  name: '皇家精油推拿術',   baseCost: 140,  costMult: 1.65, type: 'touch', bonus: 5,  desc: '深層放鬆肌肉，每次撫摸獲得的金幣 +5' },
    { id: 'auto_arm',    name: '自動搔癢機械臂',   baseCost: 80,   costMult: 1.50, type: 'auto',  bonus: 3,  desc: '自動輕撫小豬，每秒自動產出 +3 金幣' },
    { id: 'auto_ticket', name: '牧場觀光門票亭',   baseCost: 260,  costMult: 1.58, type: 'auto',  bonus: 9,  desc: '吸引遊客觀賞小豬，每秒自動產出 +9 金幣' },
    { id: 'auto_chef',   name: '米其林食神俱樂部', baseCost: 750,  costMult: 1.65, type: 'auto',  bonus: 24, desc: '美食評鑑贊助，每秒自動產出 +24 金幣' },
    { id: 'auto_truffle',name: '皇家松露尋寶獵犬', baseCost: 2200, costMult: 1.72, type: 'auto',  bonus: 68, desc: '全天候挖掘珍寶，每秒自動產出 +68 金幣' }
];

const BIOMES_CATALOG = [
    {
        id: 'sunny', name: '暖陽田園牧場', price: 0,
        desc: '和煦午後陽光與翠綠草坡的經典鄉村牧場',
        sky: 0xa6d8f7, groundOuter: 0x699855, turfLight: 0x82b366, turfDeep: 0x63914c, dirt: 0x9c8260,
        hill1: 0x5b8a47, hill2: 0x4e7a3d, leaf1: 0x3f6e36, leaf2: 0x4f8242, sunColor: 0xfff1d6, sunInt: 0.95
    },
    {
        id: 'sakura', name: '櫻吹雪春日庭園', price: 600,
        desc: '漫山粉紅櫻花林與溫柔春風的浪漫莊園',
        sky: 0xfce7f3, groundOuter: 0x76a068, turfLight: 0x9bc484, turfDeep: 0x7ba368, dirt: 0xb89984,
        hill1: 0x6e9960, hill2: 0x5d8750, leaf1: 0xf472b6, leaf2: 0xfbcfe8, sunColor: 0xfff0f5, sunInt: 0.92
    },
    {
        id: 'autumn', name: '暮光楓紅莊園', price: 1200,
        desc: '金黃銀杏與火紅楓葉交織的秋日豐收牧場',
        sky: 0xfed7aa, groundOuter: 0x9a7b3e, turfLight: 0xc29b48, turfDeep: 0x9c7832, dirt: 0x8c6239,
        hill1: 0x8f5e2c, hill2: 0x754a21, leaf1: 0xd97706, leaf2: 0xdc2626, sunColor: 0xffedd5, sunInt: 0.96
    },
    {
        id: 'night', name: '星夜螢火蟲森林', price: 2200,
        desc: '靜謐靛藍星空下閃爍溫暖燈火的奇幻森林',
        sky: 0x1e293b, groundOuter: 0x264636, turfLight: 0x345e48, turfDeep: 0x224031, dirt: 0x4a3f35,
        hill1: 0x1e3a2f, hill2: 0x162b22, leaf1: 0x155e63, leaf2: 0x0f766e, sunColor: 0x93c5fd, sunInt: 0.65
    },
    {
        id: 'snow', name: '靄靄瑞雪溫泉鄉', price: 3800,
        desc: '銀白雪松與粉雪覆蓋的冬日溫泉渡假村',
        sky: 0xdbeafe, groundOuter: 0xcbd5e1, turfLight: 0xf1f5f9, turfDeep: 0xdbeafe, dirt: 0x94a3b8,
        hill1: 0xe2e8f0, hill2: 0xcbd5e1, leaf1: 0x94a3b8, leaf2: 0xe2e8f0, sunColor: 0xffffff, sunInt: 0.90
    },
    {
        id: 'palace', name: '雲端黃金皇宮', price: 8800,
        desc: '純白玉石草坪與黃金神木環繞的皇家聖域',
        sky: 0xfef9c3, groundOuter: 0xd6d3d1, turfLight: 0xfef3c7, turfDeep: 0xfde68a, dirt: 0xf59e0b,
        hill1: 0xe7e5e4, hill2: 0xd6d3d1, leaf1: 0xf59e0b, leaf2: 0xfacc15, sunColor: 0xfffbeb, sunInt: 0.98
    }
];

const WEAPONS_CATALOG = [
    { id: 'wood_sword',        name: '鍛造木劍',           price: 180,    atkBonus: 18,  critBonus: 0,  desc: '結實堅固的橡木短劍，小豬勇士的啟蒙之刃' },
    { id: 'iron_dagger',       name: '冒險者鐵短刃',       price: 280,    atkBonus: 28,  critBonus: 4,  desc: '精鋼鍛造的敏捷短匕，出招迅捷靈動' },
    { id: 'boxing_gloves',     name: '熱血冠軍拳套',       price: 420,    atkBonus: 40,  critBonus: 8,  desc: '火紅皮革拳擊手套，出拳自帶破空聲與暴擊加成' },
    { id: 'silver_rapier',     name: '純銀貴族西洋劍',     price: 650,    atkBonus: 62,  critBonus: 10, desc: '優雅鋒利的純銀刺劍，點刺破防能力極強' },
    { id: 'knight_lance',      name: '皇家騎士長槍',       price: 950,    atkBonus: 90,  critBonus: 12, desc: '純銀精鑄騎士長矛，配備黃金護手碗與穿甲衝刺力' },
    { id: 'battle_axe',        name: '狂暴雙刃巨斧',       price: 1400,   atkBonus: 135, critBonus: 15, desc: '沉重鋒利的雙刃戰斧，揮砍威力驚天動地' },
    { id: 'excalibur',         name: '誓約勝利王者之劍',   price: 2200,   atkBonus: 200, critBonus: 25, desc: '金光閃耀的神聖王劍，劍刃散發神聖蔚藍輝光' },
    { id: 'scythe_death',      name: '冥界暗黑死神鐮刀',   price: 3500,   atkBonus: 280, critBonus: 30, desc: '漆黑幽冥之鐮，普通攻擊附加範圍撕裂暗炎' },
    { id: 'flame_greatsword',  name: '熔岩熾焰大劍',       price: 5200,   atkBonus: 380, critBonus: 32, desc: '由火山核心鍛造的赤紅重劍，自帶灼燒暴擊' },
    { id: 'frost_staff',       name: '永恆極地冰霜法杖',   price: 7500,   atkBonus: 490, critBonus: 35, desc: '鑲嵌冰龍眼球的法杖，揮舞召喚極寒碎冰' },
    { id: 'thunder_hammer',    name: '雷霆裂地巨錘',       price: 10500,  atkBonus: 640, critBonus: 38, desc: '雷神祝福的重鐵重錘，震擊地面產生連鎖電弧' },
    { id: 'dragon_slayer',     name: '滅龍龍骨巨刃',       price: 14500,  atkBonus: 820, critBonus: 40, desc: '遠古巨龍獠牙雕琢而成，揮砍伴隨震撼龍吟' },
    { id: 'lightsaber',        name: '賽博電漿光劍',       price: 20000,  atkBonus: 1050,critBonus: 42, desc: '高能粒子束流凝聚劍刃，削鐵如泥無堅不摧' },
    { id: 'void_dual_blades',  name: '虛空折疊雙刀',       price: 28000,  atkBonus: 1350,critBonus: 45, desc: '穿梭次元裂隙的雙持利刃，攻速翻倍連擊如風' },
    { id: 'phoenix_fan',       name: '鳳凰涅槃羽扇',       price: 38000,  atkBonus: 1750,critBonus: 48, desc: '神鳥尾羽編織，扇出火鳳狂嵐席捲全場' },
    { id: 'blood_katana',      name: '嗜血妖刀村雨',       price: 50000,  atkBonus: 2250,critBonus: 50, desc: '飲血越甚鋒芒越盛，擊殺敵人立即恢復生命' },
    { id: 'titan_mace',        name: '泰坦重裝流星鎚',     price: 68000,  atkBonus: 2900,critBonus: 52, desc: '百噸星核鐵鑄成，普通攻擊即具備全螢幕震退' },
    { id: 'mecha_drill',       name: '鑽地機械破壞鑽',     price: 90000,  atkBonus: 3700,critBonus: 55, desc: '渦輪增壓超合金巨鑽，以不可阻擋之勢粉碎護甲' },
    { id: 'celestial_trident', name: '蒼穹神聖三叉戟',     price: 120000, atkBonus: 4800,critBonus: 60, desc: '海神與天帝共鑄神兵，召喚天雷狂濤轟炸全圖' },
    { id: 'genesis_blade',     name: '創世神輝終焉之劍',   price: 200000, atkBonus: 8888,critBonus: 88, desc: '宇宙誕生最初的星芒，普攻化為毀滅萬物的光之洪流' }
];

const SHIELDS_CATALOG = [
    { id: 'linen_cape',    name: '冒險者亞麻斗篷',     price: 150,  defBonus: 12,  hpBonus: 60,  desc: '輕盈防風的旅行斗篷，減免森林魔物抓傷' },
    { id: 'oak_buckler',   name: '橡木精鋼小圓盾',     price: 380,  defBonus: 30,  hpBonus: 150, desc: '沉重橡木鑲嵌鋼釘圓盾，可穩健格擋衝擊' },
    { id: 'mithril_armor', name: '秘銀重裝騎士護甲',   price: 880,  defBonus: 70,  hpBonus: 350, desc: '精靈秘銀精工鍛造，極大幅度強化小豬體魄硬度' },
    { id: 'holy_aegis',    name: '聖光庇護神之巨盾',   price: 1980, defBonus: 150, hpBonus: 800, desc: '銘刻守護盧恩符文的聖白巨盾，具有堅不可摧神力' }
];

const HATS_CATALOG = [
    { id: 'none',        name: '不戴帽子',         price: 0,    desc: '展現純天然圓潤小豬耳朵' },
    { id: 'sprout',      name: '萌芽小草苗',       price: 0,    desc: '頭頂生長一抹清新的綠色小草苗' },
    { id: 'chef',        name: '米其林主廚高帽',   price: 120,  desc: '純白專業摺疊高帽，料理熱情滿滿' },
    { id: 'crown',       name: '皇家純金皇冠',     price: 450,  desc: '鑲嵌紅藍寶石的閃耀純金王冠' },
    { id: 'pirate',      name: '加勒比海盜黑帽',   price: 280,  desc: '骷髏印記的三角海盜黑帽' },
    { id: 'tophat',      name: '英倫紳士圓頂高帽', price: 350,  desc: '配有絲綢飾帶的古典紳士高帽' },
    { id: 'wizard',      name: '星辰大魔導尖帽',   price: 600,  desc: '點綴金色星宿圖紋的深紫尖頂巫師帽' },
    { id: 'samurai',     name: '戰國赤紅武士兜盔', price: 980,  desc: '附黃金鍬形前立的厚重武士頭盔' },
    { id: 'reindeer',    name: '歡慶聖誕麋鹿角',   price: 220,  desc: '溫馨紅鼻與毛絨鹿角裝飾' },
    { id: 'gold_ingot',  name: '招財發財金元寶帽', price: 1500, desc: '頭頂巨大黃金元寶，財運亨通' }
];

const OUTFITS_CATALOG = [
    { id: 'none',             name: '純天然小豬',         price: 0,     color: '#ffffff', hpBonus: 0,    atkBonus: 0,   defBonus: 0,   desc: '不穿衣服，享受微風吹拂' },
    { id: 'bib',              name: '純棉胡蘿蔔圍兜',     price: 180,   color: '#f97316', hpBonus: 60,   atkBonus: 0,   defBonus: 8,   desc: '繡有可愛胡蘿蔔的柔軟圍兜，吃飯不易弄髒' },
    { id: 'tuxedo',           name: '英倫紳士領結馬甲',   price: 450,   color: '#1e293b', hpBonus: 120,  atkBonus: 10,  defBonus: 18,  desc: '深藍西裝馬甲配亮紅領結，極致優雅氣派' },
    { id: 'pirate_vest',      name: '海盜仿舊皮背心',     price: 750,   color: '#78350f', hpBonus: 160,  atkBonus: 35,  defBonus: 15,  desc: '仿舊皮革繫繩背心，野性勇敢' },
    { id: 'royal_cape',       name: '皇家天鵝絨紅披風',   price: 950,   color: '#dc2626', hpBonus: 220,  atkBonus: 25,  defBonus: 28,  desc: '金線鑲邊天鵝絨披風，彰顯帝王風範' },
    { id: 'wizard_robe',      name: '星光大魔導長袍',     price: 1600,  color: '#7c3aed', hpBonus: 320,  atkBonus: 55,  defBonus: 30,  desc: '繡滿秘術符文的長袍，自帶魔力護盾' },
    { id: 'festive_apron',    name: '招財進寶紅包肚兜',   price: 2200,  color: '#ef4444', hpBonus: 400,  atkBonus: 40,  defBonus: 40,  desc: '金蔥福字傳統大紅肚兜，撫摸金幣 +50%' },
    { id: 'cyber_mecha',      name: '賽博外骨骼機甲鞍座', price: 4500,  color: '#06b6d4', hpBonus: 750,  atkBonus: 95,  defBonus: 70,  desc: '鈦合金複合裝甲鞍座，推進噴嘴與全息光效' },
    { id: 'ninja_suit',       name: '影之暗忍夜行衣',     price: 6000,  color: '#0f172a', hpBonus: 900,  atkBonus: 130, defBonus: 65,  desc: '純黑無聲布料，附背負手裏劍與敏捷加成' },
    { id: 'astronaut_suit',   name: '星際太空充氣裝',     price: 8500,  color: '#f8fafc', hpBonus: 1200, atkBonus: 110, defBonus: 120, desc: '抗高壓航天服，頭戴全透明魚眼泡泡面罩' },
    { id: 'chef_jacket',      name: '米其林主廚雙排扣',   price: 11000, color: '#f1f5f9', hpBonus: 1400, atkBonus: 150, defBonus: 100, desc: '紅領巾專業主廚白袍，料理成功獲得雙倍收益' },
    { id: 'reindeer_sweater', name: '暖心聖誕編織毛衣',   price: 14000, color: '#b91c1c', hpBonus: 1700, atkBonus: 140, defBonus: 135, desc: '紅綠針織雪花圖紋，冬日帶來溫馨被動自癒' },
    { id: 'pharaoh_robe',     name: '法老黃金神聖法袍',   price: 18000, color: '#fbbf24', hpBonus: 2100, atkBonus: 220, defBonus: 160, desc: '古王國黃金鑲嵌天青石，帶來無盡財運庇佑' },
    { id: 'panda_onesie',     name: '憨萌熊貓絨毛皮套',   price: 23000, color: '#18181b', hpBonus: 2600, atkBonus: 190, defBonus: 210, desc: '黑白分明軟萌熊貓連身衣，摔倒彈力 +100%' },
    { id: 'steampunk_coat',   name: '蒸氣龐克黃銅風衣',   price: 29000, color: '#92400e', hpBonus: 3200, atkBonus: 300, defBonus: 220, desc: '掛載精密黃銅齒輪與壓力錶，自帶微型蒸氣噴射' },
    { id: 'emperor_armor',    name: '至尊金龍九五重鎧',   price: 36000, color: '#f59e0b', hpBonus: 4000, atkBonus: 380, defBonus: 320, desc: '龍紋鏤空重裝金鎧，登臨霸業無敵氣場' },
    { id: 'hawaiian_shirt',   name: '熱帶度假夏威夷花襯衫',price: 45000, color: '#10b981', hpBonus: 4800, atkBonus: 420, defBonus: 300, desc: '南洋椰林花卉襯衫配墨鏡，小豬心情永不衰減' },
    { id: 'iron_suit',        name: '鋼鐵小豬納米裝甲',   price: 60000, color: '#b91c1c', hpBonus: 6000, atkBonus: 560, defBonus: 450, desc: '胸口裝備弧光反應爐，攻擊附加高壓離子光束' },
    { id: 'dino_costume',     name: '霸王龍綠皮搞笑套裝', price: 80000, color: '#15803d', hpBonus: 7500, atkBonus: 700, defBonus: 550, desc: '自帶短小龍爪與巨齒頭套，走路自帶轟鳴音效' },
    { id: 'angel_feather_robe',name: '創世六翼天神羽衣',  price: 120000,color: '#fdf4ff', hpBonus: 11111,atkBonus: 1200,defBonus: 999, desc: '背生閃爍六羽光翼，每秒自動恢復生命並免疫負面狀態' }
];

// 24 款 Cheems 蛙蛙紓壓專屬物理小玩具
const CHEEMS_WEAPONS = [
    { id: 'spiked_club',    name: '狼牙大棒棒',   icon: '🪵', color: '#92400e', power: 25,  bonkSound: 'wood', desc: '結實粗糙的木棒，上面長滿小木刺' },
    { id: 'inflat_axe',     name: '充氣大戰斧',   icon: '🪓', color: '#ef4444', power: 15,  bonkSound: 'squeak', desc: '打人會發出超大聲嗶嗶叫的充氣斧頭' },
    { id: 'salted_fish',    name: '冰凍鹹魚',     icon: '🐟', color: '#38bdf8', power: 30,  bonkSound: 'slap', desc: '硬邦邦的鹹魚，甩在臉上啪啪作響' },
    { id: 'frying_pan',     name: '黃金平底鍋',   icon: '🍳', color: '#f59e0b', power: 45,  bonkSound: 'pan', desc: '吃雞專用神級平底鍋，當頭一聲脆響！' },
    { id: 'roast_chicken',  name: '噴射大烤雞腿', icon: '🍗', color: '#ea580c', power: 35,  bonkSound: 'squish', desc: '金黃流油的巨大烤雞，香氣與打擊感兼具' },
    { id: 'magic_broom',    name: '除塵大掃帚',   icon: '🧹', color: '#a16207', power: 20,  bonkSound: 'whoosh', desc: '把煩惱和蛙蛙像灰塵一樣掃出十萬八千里' },
    { id: 'giant_carrot',   name: '超巨大蘿蔔棒', icon: '🥕', color: '#f97316', power: 28,  bonkSound: 'crunch', desc: '小豬從菜田拔出的百年蘿蔔王，份量十足' },
    { id: 'squeaky_hammer', name: 'BB叫雷神鎚',   icon: '🔨', color: '#dc2626', power: 38,  bonkSound: 'squeak', desc: '塑料玩具鎚，砸下必出刺耳可愛尖叫聲' },
    { id: 'boxing_spring',  name: '彈力拳擊手套', icon: '🥊', color: '#ef4444', power: 50,  bonkSound: 'punch', desc: '帶有彈簧的整人拳套，一拳打出表情包！' },
    { id: 'holy_plunger',   name: '神聖馬桶吸把', icon: '🪠', color: '#f43f5e', power: 22,  bonkSound: 'suction', desc: '吸住蛙蛙的大光頭，拔開伴隨響亮啵一聲' },
    { id: 'giant_banana',   name: '巨型滑溜香蕉', icon: '🍌', color: '#facc15', power: 18,  bonkSound: 'slip', desc: '又黃又彎的巨香蕉，打中必定引發跌倒旋轉' },
    { id: 'pizza_frisbee',  name: '起司披薩飛盤', icon: '🍕', color: '#ea580c', power: 32,  bonkSound: 'splat', desc: '熱騰騰牽絲披薩，直接糊臉上' },
    { id: 'tennis_racket',  name: '雷電網球拍',   icon: '🎾', color: '#84cc16', power: 40,  bonkSound: 'twang', desc: '專業拍面網線，一記暴扣扣殺蛙蛙！' },
    { id: 'toy_chainsaw',   name: '橡膠玩具電鋸', icon: '🪚', color: '#f97316', power: 55,  bonkSound: 'buzz', desc: '嗡嗡作響的無害兒童電鋸，視覺震撼滿分' },
    { id: 'karaoke_mic',    name: '破音大麥克風', icon: '🎤', color: '#6366f1', power: 36,  bonkSound: 'screech', desc: '對著耳邊怒吼飆高音，精神與物理雙重打擊' },
    { id: 'pink_stiletto',  name: '粉紅高跟拖鞋', icon: '👠', color: '#ec4899', power: 48,  bonkSound: 'slap', desc: '傳說中媽媽的必殺技！十米開外百發百中！' },
    { id: 'cat_paw',        name: '絨毛貓爪肉墊', icon: '🐾', color: '#f472b6', power: 12,  bonkSound: 'soft', desc: '超軟萌粉紅肉球，打人如同給予最高獎賞' },
    { id: 'boomerang',      name: '袋鼠迴力鏢',   icon: '🪃', color: '#78350f', power: 34,  bonkSound: 'spin', desc: '丟出去痛揍一拳後還會旋轉飛回手中' },
    { id: 'hard_baguette',  name: '百年法式長棍', icon: '🥖', color: '#d97706', power: 42,  bonkSound: 'clang', desc: '比鋼筋水泥還硬的長棍麵包，防身最佳選擇' },
    { id: 'electric_guitar',name: '重金屬電吉他', icon: '🎸', color: '#7c3aed', power: 52,  bonkSound: 'riff', desc: '當頭砸下伴隨狂暴失真破音電吉他SOLO！' },
    { id: 'cartoon_bomb',   name: '卡通大黑引信彈',icon: '💣', color: '#0f172a', power: 75,  bonkSound: 'boom', desc: '引信滋滋作響，點燃引發蘑菇雲卡通大爆炸！' },
    { id: 'icecream_cone',  name: '雙球草莓甜筒', icon: '🍦', color: '#f472b6', power: 16,  bonkSound: 'squish', desc: '冰涼黏膩的冰淇淋，直接印在鼻子上' },
    { id: 'tp_blaster',     name: '衛生紙發射槍', icon: '🧻', color: '#f8fafc', power: 26,  bonkSound: 'shoot', desc: '全自動連續射出整卷衛生紙，將蛙蛙包成木乃伊' },
    { id: 'cupid_arrow',    name: '愛心邱比特箭', icon: '🏹', color: '#ec4899', power: 60,  bonkSound: 'ding', desc: '射中心臟冒出漫天粉紅愛心與大哭特效' }
];

// 2D 像素動作冒險技能庫
const PIXEL_SKILLS = [
    { key: 'K', name: '旋風野豬突刺', cd: 2.5, desc: '向前高速旋轉突進，擊飛路徑上的所有小怪與破甲' },
    { key: 'L', name: '皇家聖光震地', cd: 5.0, desc: '猛烈躍起震碎地面，召喚全螢幕金色衝擊波' },
    { key: ';', name: '終焉流星天降', cd: 10.0, desc: '召喚無數巨大火燒蘿蔔流星雨狂轟敵陣' }
];

const PIG_BREEDS_CATALOG = [
    { id: 'sakura_pink',       name: '粉嫩櫻花豬', price: 0,     color: '#ffb6c1', desc: '牧場經典品種，活潑親人好照顧' },
    { id: 'royal_gold',        name: '皇家金光豬', price: 800,   color: '#facc15', desc: '金燦燦的珍貴福豬，產幣收益額外提升 15%' },
    { id: 'berkshire_spotted', name: '黑斑伯克夏', price: 2400,  color: '#475569', desc: '體格強壯的英國名種，基礎生命與防禦提升 25%' },
    { id: 'matcha_mint',       name: '抹茶青檸豬', price: 6000,  color: '#86efac', desc: '清新怡人的綠意小豬，飽足度消耗速度減少 35%' },
    { id: 'lavender_fairy',    name: '薰衣草仙境豬', price: 15000, color: '#c084fc', desc: '夢幻紫調小精靈，親密度升級速度 2 倍' },
    { id: 'caramel_boar',      name: '焦糖黑巧野豬', price: 35000, color: '#78350f', desc: '剽悍勇猛的山林王者，戰鬥技能傷害永久 +40%' }
];

const PIG_COLOR_PRESETS = [
    { name: '經典櫻花粉', hex: '#ffb6c1' },
    { name: '皇家純金黃', hex: '#facc15' },
    { name: '深炭伯克夏', hex: '#475569' },
    { name: '抹茶嫩葉綠', hex: '#86efac' },
    { name: '幻夜薰衣紫', hex: '#c084fc' },
    { name: '香醇黑巧棕', hex: '#78350f' },
    { name: '冬日銀雪白', hex: '#f8fafc' },
    { name: '狂暴烈焰紅', hex: '#f87171' },
    { name: '晴空冰晶藍', hex: '#7dd3fc' }
];

const ESTATE_CATALOG = [
    { id: 'auto_feeder',      name: '自動補料投餵機',   price: 1200, passiveCoin: 0,  desc: '當小豬飽足低於25%時自動餵食零食，飽足上限提升至120%' },
    { id: 'hydro_spa',        name: '皇家泥漿水療溫泉', price: 1800, passiveCoin: 4,  desc: '清潔與心情衰減速度減少50%，每秒自動產出 +4 金幣' },
    { id: 'fortune_windmill', name: '幸運黃金風車',     price: 3500, passiveCoin: 8,  desc: '撫摸與戰鬥收益獲得 1.5x 加乘，每秒自動產出 +8 金幣' },
    { id: 'combat_dummy',     name: '戰鬥修煉假人',     price: 4800, passiveCoin: 0,  desc: '小豬專屬特訓假人，永久使戰鬥攻擊 +40、防禦 +25' },
    { id: 'golden_statue',    name: '至尊純金小豬雕像', price: 10000, passiveCoin: 20, desc: '象徵至高財富的紀念碑，每秒產出 +20 金幣並解鎖小豬環繞金光' }
];

const BATTLE_STAGES = [
    { id: 1, name: '蘿蔔森林',     boss: '蹦跳野兔長老',     hp: 160,  atk: 14, def: 4,  reward: 70,   icon: '🥕', desc: '守護巨大胡蘿蔔的野兔族長，敏捷迅速' },
    { id: 2, name: '泥沼礦坑',     boss: '暴躁地鼠礦工',     hp: 350,  atk: 28, def: 10, reward: 160,  icon: '⛏️', desc: '霸佔地底金礦的暴躁地鼠，揮動十字鎬威力兇猛' },
    { id: 3, name: '荊棘平原',     boss: '刺蝟狂戰士',       hp: 720,  atk: 48, def: 22, reward: 350,  icon: '🦔', desc: '鋼針般尖刺的狂暴刺蝟，防守極為棘手' },
    { id: 4, name: '熔岩南瓜谷',   boss: '熔岩南瓜巨靈',     hp: 1350, atk: 82, def: 38, reward: 750,  icon: '🎃', desc: '吸收地底熔岩而甦醒的魔像巨靈，每次震撼大地' },
    { id: 5, name: '黑暗松露神殿', boss: '暗黑魔龍神豬',     hp: 2600, atk: 135, def: 55, reward: 1800, icon: '🐉', desc: '盤踞於松露世界之巔的終極霸主，討伐贏取海量金幣！' }
];

const BATTLE_POTIONS_CATALOG = [
    { id: 'potion_atk',    name: '狂暴大力藥劑',   price: 120, icon: '🧪', desc: '飲用後 3 回合內提升 50% 攻擊力' },
    { id: 'potion_def',    name: '金剛鐵壁聖水',   price: 150, icon: '🛡️', desc: '飲用後 3 回合內提升 80% 防禦力' },
    { id: 'potion_heal',   name: '勇者特製大補膏', price: 180, icon: '🍖', desc: '立即恢復 350 點生命值' },
    { id: 'smoke_bomb',    name: '迷幻煙霧彈',     price: 100, icon: '💨', desc: '丟擲後下回合 100% 閃避敵方攻擊' },
    { id: 'revive_cross',  name: '勇者重生十字架', price: 300, icon: '✝️', desc: '生命值歸零時自動復活並回復 50% HP (限用一次)' }
];

const FARM_CROPS_CATALOG = [
    { id: 'seed_A', ingCode: 'A', name: '紅富士蘋果苗',   price: 15,  growSec: 35,  yieldMin: 2, yieldMax: 4, sellPrice: 40,  icon: '🍎', color: '#ef4444' },
    { id: 'seed_B', ingCode: 'B', name: '鮮嫩胡蘿蔔種子', price: 20,  growSec: 45,  yieldMin: 2, yieldMax: 4, sellPrice: 50,  icon: '🥕', color: '#f97316' },
    { id: 'seed_C', ingCode: 'C', name: '黃金甜玉米種子', price: 30,  growSec: 55,  yieldMin: 2, yieldMax: 4, sellPrice: 75,  icon: '🌽', color: '#facc15' },
    { id: 'seed_D', ingCode: 'D', name: '栗子奶油南瓜種', price: 45,  growSec: 70,  yieldMin: 2, yieldMax: 4, sellPrice: 110, icon: '🎃', color: '#ea580c' },
    { id: 'seed_E', ingCode: 'E', name: '森林紅傘菇菌絲', price: 65,  growSec: 90,  yieldMin: 2, yieldMax: 4, sellPrice: 160, icon: '🍄', color: '#dc2626' },
    { id: 'seed_F', ingCode: 'F', name: '百年橡樹種苗',   price: 90,  growSec: 110, yieldMin: 2, yieldMax: 4, sellPrice: 220, icon: '🌰', color: '#92400e' },
    { id: 'seed_G', ingCode: 'G', name: '翠綠西瓜種子',   price: 125, growSec: 140, yieldMin: 2, yieldMax: 4, sellPrice: 310, icon: '🍉', color: '#f43f5e' },
    { id: 'seed_H', ingCode: 'H', name: '紫心蜜番薯幼苗', price: 170, growSec: 170, yieldMin: 2, yieldMax: 4, sellPrice: 420, icon: '🍠', color: '#9333ea' },
    { id: 'seed_I', ingCode: 'I', name: '青綠花椰菜種子', price: 230, growSec: 210, yieldMin: 2, yieldMax: 4, sellPrice: 580, icon: '🥦', color: '#15803d' },
    { id: 'seed_J', ingCode: 'J', name: '皇家黑松露菌核', price: 380, growSec: 260, yieldMin: 1, yieldMax: 3, sellPrice: 950, icon: '🪙', color: '#334155' }
];

const FARMLAND_UNLOCK_COSTS = [0, 600, 1800, 4800, 12000, 28000];

const TIER_INFO = {
    1:  { name: '鮮採單品',       multiplier: 1.0,  cooking: ['鮮切', '原味', '朝露', '牧場風', '陽光', '脆口', '田園', '初摘', '純粹', '甘露'] },
    2:  { name: '雙拼小菜',       multiplier: 1.15, cooking: ['雙重奏', '佐味盤', '輕拌皿', '雙鮮盅', '風味疊', '相伴盤', '小炒', '和風皿'] },
    3:  { name: '三鮮風味拼盤',   multiplier: 1.28, cooking: ['三鮮匯', '三重奏', '什錦盤', '溫沙拉', '烘烤盤', '田園匯', '香草盅', '彩蔬盤'] },
    4:  { name: '四時田園燉菜',   multiplier: 1.42, cooking: ['濃湯燉鍋', '奶油焗盅', '陶鍋慢燉', '四季煲', '鄉村燉菜', '黃金濃湯', '鮮蔬湯鍋'] },
    5:  { name: '五味平衡盛宴',   multiplier: 1.58, cooking: ['五味御膳', '五行薈萃', '豐收盛皿', '主廚特餐', '森林饗宴', '極味拼盤', '百果燉盅'] },
    6:  { name: '六合精選御膳',   multiplier: 1.75, cooking: ['六合珍饈', '莊園御品', '宮廷慢煨', '六味金盅', '皇家盛饌', '醇香大盤'] },
    7:  { name: '七星珍饈煲',     multiplier: 1.95, cooking: ['七星連珠煲', '北斗珍味鍋', '虹彩琉璃膳', '七彩慶典煲', '晶鑽御膳鍋'] },
    8:  { name: '八珍極品大餐',   multiplier: 2.20, cooking: ['八珍玉食席', '八方豐登宴', '金玉滿堂鍋', '御廚八寶膳'] },
    9:  { name: '九轉至尊滿漢席', multiplier: 2.55, cooking: ['九轉金丹宴', '九重天極品席', '至尊九珍皇膳'] },
    10: { name: '傳奇十全大補神饌', multiplier: 3.20, cooking: ['傳奇十全大補神饌'] }
};

const BUFF_TYPES = [
    { id: 'normal',  label: '營養均衡（體態健康）', color: '#94a3b8' },
    { id: 'bouncy',  label: 'Q彈果凍肌（彈性提升）', color: '#f472b6' },
    { id: 'speedy',  label: '活力疾風步（步伐輕快）', color: '#34d399' },
    { id: 'growth',  label: '暴風成長（增重加速）', color: '#fb923c' },
    { id: 'golden',  label: '皇家金光（心情常駐滿載）', color: '#fbbf24' }
];

const RECIPES_DB = new Array(1024);
function buildAll1023Recipes() {
    for (let mask = 1; mask <= 1023; mask++) {
        const activeIngs = [];
        let rawHunger = 0, rawMood = 0, rawEnergy = 0, rawWeight = 0;

        for (let i = 0; i < 10; i++) {
            if (mask & (1 << i)) {
                const ing = INGREDIENTS[i];
                activeIngs.push(ing);
                rawHunger += ing.hunger;
                rawMood += ing.mood;
                rawEnergy += ing.energy;
                rawWeight += ing.weight;
            }
        }

        const count = activeIngs.length;
        const tier = TIER_INFO[count];
        const mult = tier.multiplier;
        const styleList = tier.cooking;
        const styleWord = styleList[mask % styleList.length];

        let dishName = '';
        if (count === 1) {
            dishName = `${styleWord}${activeIngs[0].name}`;
        } else if (count === 2) {
            dishName = `${activeIngs[0].short}佐${activeIngs[1].short}${styleWord}`;
        } else if (count === 3) {
            dishName = `${activeIngs[0].short}${activeIngs[1].short}燴${activeIngs[2].short}${styleWord}`;
        } else if (count === 4) {
            dishName = `${activeIngs[0].short}${activeIngs[1].short}${activeIngs[2].short}伴${activeIngs[3].short}${styleWord}`;
        } else if (count === 10) {
            dishName = `傳奇十全大補皇家神饌`;
        } else if (count === 9) {
            const missing = INGREDIENTS.find(ing => !(mask & ing.bit));
            dishName = `${styleWord}（九珍無${missing.short}特仕）`;
        } else {
            const leadA = activeIngs[0].short;
            const leadB = activeIngs[Math.floor(count / 2)].short;
            const leadC = activeIngs[count - 1].short;
            dishName = `${leadA}${leadB}佐${leadC}${styleWord}`;
        }

        let buff = BUFF_TYPES[0];
        if (mask === 1023 || (mask & 512)) {
            buff = BUFF_TYPES[4];
        } else if (count >= 6) {
            buff = BUFF_TYPES[3];
        } else if (mask & 64 || mask & 16) {
            buff = BUFF_TYPES[1];
        } else if (mask & 256 || mask & 2) {
            buff = BUFF_TYPES[2];
        }

        RECIPES_DB[mask] = {
            id: mask,
            ingNames: activeIngs.map(x => x.short).join('、'),
            count,
            tierName: tier.name,
            name: dishName,
            hunger: Math.min(100, Math.round(rawHunger * mult * 0.48)),
            mood: Math.min(100, Math.round(rawMood * mult * 0.52)),
            energy: Math.min(100, Math.round(rawEnergy * mult * 0.45)),
            weightGain: Number((rawWeight * mult * 0.45).toFixed(2)),
            coinReward: Math.round((rawHunger + rawMood) * mult * 0.85),
            buff
        };
    }
}
buildAll1023Recipes();

if (typeof window !== 'undefined') {
    window.INGREDIENTS = INGREDIENTS;
    window.TOYS_CATALOG = TOYS_CATALOG;
    window.UPGRADES_CATALOG = UPGRADES_CATALOG;
    window.BIOMES_CATALOG = BIOMES_CATALOG;
    window.WEAPONS_CATALOG = WEAPONS_CATALOG;
    window.SHIELDS_CATALOG = SHIELDS_CATALOG;
    window.HATS_CATALOG = HATS_CATALOG;
    window.OUTFITS_CATALOG = OUTFITS_CATALOG;
    window.PIG_BREEDS_CATALOG = PIG_BREEDS_CATALOG;
    window.PIG_COLOR_PRESETS = PIG_COLOR_PRESETS;
    window.ESTATE_CATALOG = ESTATE_CATALOG;
    window.BATTLE_STAGES = BATTLE_STAGES;
    window.BATTLE_POTIONS_CATALOG = BATTLE_POTIONS_CATALOG;
    window.FARM_CROPS_CATALOG = FARM_CROPS_CATALOG;
    window.BUFF_TYPES = BUFF_TYPES;
    window.RECIPES_DB = RECIPES_DB;
}
if (typeof global !== 'undefined') {
    global.INGREDIENTS = INGREDIENTS;
    global.TOYS_CATALOG = TOYS_CATALOG;
    global.UPGRADES_CATALOG = UPGRADES_CATALOG;
    global.BIOMES_CATALOG = BIOMES_CATALOG;
    global.WEAPONS_CATALOG = WEAPONS_CATALOG;
    global.SHIELDS_CATALOG = SHIELDS_CATALOG;
    global.HATS_CATALOG = HATS_CATALOG;
    global.OUTFITS_CATALOG = OUTFITS_CATALOG;
    global.PIG_BREEDS_CATALOG = PIG_BREEDS_CATALOG;
    global.PIG_COLOR_PRESETS = PIG_COLOR_PRESETS;
    global.ESTATE_CATALOG = ESTATE_CATALOG;
    global.BATTLE_STAGES = BATTLE_STAGES;
    global.BATTLE_POTIONS_CATALOG = BATTLE_POTIONS_CATALOG;
    global.FARM_CROPS_CATALOG = FARM_CROPS_CATALOG;
    global.BUFF_TYPES = BUFF_TYPES;
    global.RECIPES_DB = RECIPES_DB;
}

const INGREDIENT_GLB_MAP = {
    'A': 'apple.glb',
    'B': 'carrot.glb',
    'C': 'sweet_corn.glb',
    'D': 'pumpkin.glb',
    'E': 'red_mushroom.glb',
    'F': 'acorn.glb',
    'G': 'watermelon.glb',
    'H': 'purple_sweet_potato.glb',
    'I': 'broccoli.glb',
    'J': 'black_truffle.glb'
};

const IngredientGLBLoader = {
    cache: {},
    loading: {},
    callbacks: {},

    resolveUrl(filename) {
        try {
            let base = window.location.origin + window.location.pathname;
            if (!base.endsWith('/')) {
                if (base.match(/\.[a-zA-Z0-9]+$/)) {
                    base = base.substring(0, base.lastIndexOf('/') + 1);
                } else {
                    base += '/';
                }
            }
            return base + 'chibi_ingredients_glb_10pack/' + filename;
        } catch (e) {
            return 'chibi_ingredients_glb_10pack/' + filename;
        }
    },

    load(code, onReady) {
        const filename = INGREDIENT_GLB_MAP[code];
        if (!filename) return onReady(null);

        if (this.cache[code]) {
            return onReady(this.cache[code].clone(true));
        }

        if (!this.callbacks[code]) this.callbacks[code] = [];
        this.callbacks[code].push(onReady);

        if (this.loading[code]) return;
        this.loading[code] = true;

        if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined') {
            const loader = new THREE.GLTFLoader();
            const targetUrl = this.resolveUrl(filename);

            const tryLoad = (url, fallbackUrl = null) => {
                loader.load(
                    url,
                    gltf => {
                        this.cache[code] = gltf.scene;
                        this.loading[code] = false;
                        const cbs = this.callbacks[code] || [];
                        this.callbacks[code] = [];
                        cbs.forEach(cb => {
                            try { cb(this.cache[code].clone(true)); } catch (e) {}
                        });
                    },
                    undefined,
                    err => {
                        if (fallbackUrl) {
                            tryLoad(fallbackUrl, null);
                        } else {
                            this.loading[code] = false;
                            const cbs = this.callbacks[code] || [];
                            this.callbacks[code] = [];
                            cbs.forEach(cb => {
                                try { cb(null); } catch (e) {}
                            });
                        }
                    }
                );
            };

            tryLoad(targetUrl, './chibi_ingredients_glb_10pack/' + filename);
        }
    }
};

if (typeof window !== 'undefined') {
    window.INGREDIENT_GLB_MAP = INGREDIENT_GLB_MAP;
    window.IngredientGLBLoader = IngredientGLBLoader;
    window.CHEEMS_WEAPONS = CHEEMS_WEAPONS;
    window.CHEEEMS_WEAPONS = CHEEMS_WEAPONS;
    window.PIXEL_SKILLS = PIXEL_SKILLS;
}
if (typeof global !== 'undefined') {
    global.INGREDIENT_GLB_MAP = INGREDIENT_GLB_MAP;
    global.IngredientGLBLoader = IngredientGLBLoader;
    global.CHEEMS_WEAPONS = CHEEMS_WEAPONS;
    global.CHEEEMS_WEAPONS = CHEEMS_WEAPONS;
    global.PIXEL_SKILLS = PIXEL_SKILLS;
}


