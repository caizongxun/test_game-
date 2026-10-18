/**
 * 3D 皇家小豬牧場 - Supabase 多人在線協同與即時同步引擎
 * 支援：房間代碼加入、金幣伺服器端同步計算、實時在線 Presence、動作日誌與離線無縫降級
 */

(function () {
    const LOCAL_ROOM_KEY = 'PIG_SIM_LAST_ROOM_CODE_V1';
    const LOCAL_PLAYER_NAME_KEY = 'PIG_SIM_PLAYER_NAME_V1';

    let supabaseClient = null;
    let currentRoomCode = null;
    let playerName = localStorage.getItem(LOCAL_PLAYER_NAME_KEY) || ('玩家_' + Math.floor(1000 + Math.random() * 9000));
    let roomSubscription = null;
    let presenceChannel = null;
    let connectionStatus = 'DISCONNECTED'; // 'CONNECTED' | 'CONNECTING' | 'LOCAL_OFFLINE' | 'DISCONNECTED'
    let onlineUsersCount = 1;
    let lastSyncedCoins = 300;
    let rpcAvailable = true;

    // 事件回調清單
    const listeners = {
        stateUpdated: [],
        actionReceived: [],
        presenceUpdated: [],
        connectionChanged: [],
        pigPositionReceived: []
    };

    function notify(event, data) {
        if (listeners[event]) {
            listeners[event].forEach(cb => {
                try { cb(data); } catch (e) { console.error(`[Multiplayer] 事件回調異常 (${event}):`, e); }
            });
        }
    }

    function setStatus(status, detail) {
        connectionStatus = status;
        notify('connectionChanged', { status, detail, roomCode: currentRoomCode });
    }

    function generateRoomCode() {
        const prefix = 'PIG';
        const num = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${num}`;
    }

    function getRoomCodeFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('room') || params.get('code') || null;
    }

    function updateUrlRoomCode(code) {
        try {
            const url = new URL(window.location.href);
            if (code) {
                url.searchParams.set('room', code);
            } else {
                url.searchParams.delete('room');
                url.searchParams.delete('code');
            }
            window.history.replaceState({}, '', url.toString());
        } catch (e) {
            console.warn('更新 URL 參數失敗:', e);
        }
    }

    function getPlayerName() {
        return playerName;
    }

    function setPlayerName(name) {
        if (!name || !name.trim()) return;
        playerName = name.trim().slice(0, 16);
        localStorage.setItem(LOCAL_PLAYER_NAME_KEY, playerName);
        if (presenceChannel && connectionStatus === 'CONNECTED') {
            presenceChannel.track({ player_name: playerName, online_at: new Date().toISOString() });
        }
    }

    function unpackPetData(dbRow) {
        if (!dbRow) return null;
        const meta = (dbRow.unlocked_recipes && dbRow.unlocked_recipes.__meta) ? dbRow.unlocked_recipes.__meta : {};
        return {
            ...dbRow,
            current_outfit: meta.current_outfit || dbRow.current_outfit || 'none',
            color: meta.color || dbRow.color || '#ffb6c1',
            pigs: meta.pigs || dbRow.pigs || null,
            equipped_weapon: meta.equipped_weapon || dbRow.equipped_weapon || null,
            equipped_shield: meta.equipped_shield || dbRow.equipped_shield || null,
            owned_equip: meta.owned_equip || dbRow.owned_equip || null,
            estate_levels: meta.estate_levels || dbRow.estate_levels || null,
            unlocked_stages: meta.unlocked_stages || dbRow.unlocked_stages || 1,
            farm: meta.farm || dbRow.farm || null,
            pixel_battle: meta.pixel_battle || dbRow.pixel_battle || null
        };
    }

    // 初始化 Supabase 客戶端
    function initClient() {
        const config = window.SupabaseConfig ? window.SupabaseConfig.get() : { supabaseUrl: '', supabaseAnonKey: '' };
        if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
            supabaseClient = null;
            return false;
        }
        try {
            supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
                auth: { persistSession: false },
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            });
            return true;
        } catch (e) {
            console.error('[Multiplayer] Supabase 初始化失敗:', e);
            supabaseClient = null;
            return false;
        }
    }

    // 建立或加入房間
    async function joinOrCreateRoom(targetRoomCode, initialFallbackState) {
        const roomCode = (targetRoomCode || getRoomCodeFromUrl() || localStorage.getItem(LOCAL_ROOM_KEY) || generateRoomCode()).toUpperCase().trim();
        currentRoomCode = roomCode;
        localStorage.setItem(LOCAL_ROOM_KEY, roomCode);
        updateUrlRoomCode(roomCode);

        const hasClient = initClient();
        if (!hasClient) {
            setStatus('LOCAL_OFFLINE', '尚未設定 Supabase 金鑰，目前為單機共養模擬模式');
            return {
                mode: 'LOCAL_OFFLINE',
                roomCode,
                petData: null
            };
        }

        setStatus('CONNECTING', `正在連線至房間 ${roomCode}...`);

        try {
            // 1. 查詢資料庫中是否存在該房間寵物
            const { data: pet, error } = await supabaseClient
                .from('pets')
                .select('*')
                .eq('room_code', roomCode)
                .maybeSingle();

            if (error) {
                console.warn('[Multiplayer] 查詢房間失敗，嘗試降級或重試:', error);
            }

            let activePet = pet;

            // 2. 若房間不存在，則以此客戶端狀態建立新房間
            if (!activePet) {
                const initPayload = {
                    room_code: roomCode,
                    name: (initialFallbackState && initialFallbackState.pigName) || '粉紅圓圓',
                    coins: (initialFallbackState && initialFallbackState.coins) || 300,
                    weight: (initialFallbackState && initialFallbackState.weight) || 15.00,
                    hunger: (initialFallbackState && initialFallbackState.hunger) || 80,
                    mood: (initialFallbackState && initialFallbackState.mood) || 85,
                    energy: (initialFallbackState && initialFallbackState.energy) || 90,
                    cleanliness: (initialFallbackState && initialFallbackState.cleanliness) || 92,
                    intimacy: (initialFallbackState && initialFallbackState.intimacy) || 12,
                    intimacy_level: (initialFallbackState && initialFallbackState.intimacyLevel) || 1,
                    current_hat: (initialFallbackState && initialFallbackState.currentHat) || 'sprout',
                    current_biome: (initialFallbackState && initialFallbackState.currentBiome) || 'sunny',
                    unlocked_biomes: (initialFallbackState && initialFallbackState.unlockedBiomes) || { sunny: true },
                    ing_stock: (initialFallbackState && initialFallbackState.ingStock) || { A:5,B:5,C:4,D:3,E:3,F:2,G:2,H:2,I:1,J:1 },
                    owned_toys: (initialFallbackState && initialFallbackState.ownedToys) || { soccer: true, bowling: true },
                    active_toys: (initialFallbackState && initialFallbackState.activeToys) || { soccer: true, bowling: true },
                    upgrade_levels: (initialFallbackState && initialFallbackState.upgradeLevels) || { touch_power: 0, touch_crit: 0, auto_arm: 0, auto_ticket: 0, auto_chef: 0, auto_truffle: 0 },
                    trough_mask: (initialFallbackState && initialFallbackState.troughMask) || 0,
                    unlocked_recipes: (initialFallbackState && initialFallbackState.unlockedRecipes) || {},
                    equipped_weapon: (initialFallbackState && initialFallbackState.equippedWeapon) || null,
                    equipped_shield: (initialFallbackState && initialFallbackState.equippedShield) || null,
                    owned_equip: (initialFallbackState && initialFallbackState.ownedEquip) || {},
                    estate_levels: (initialFallbackState && initialFallbackState.estateLevels) || {},
                    unlocked_stages: (initialFallbackState && initialFallbackState.battleStagesUnlocked) || 1,
                    last_sync_at: new Date().toISOString()
                };

                const insertRes = await supabaseClient.from('pets').insert(initPayload).select().maybeSingle();
                if (insertRes.data) {
                    activePet = insertRes.data;
                } else {
                    activePet = initPayload;
                }
            }

            if (activePet) {
                lastSyncedCoins = activePet.coins;
            }

            // 3. 綁定 Supabase Realtime 訂閱
            setupRealtimeSubscriptions(roomCode);

            setStatus('CONNECTED', `已連線至房間【${roomCode}】`);

            return {
                mode: 'CONNECTED',
                roomCode,
                petData: unpackPetData(activePet)
            };
        } catch (err) {
            console.error('[Multiplayer] 連線遭遇異常:', err);
            setStatus('LOCAL_OFFLINE', '連線失敗，已切換至單機共養模式');
            return {
                mode: 'LOCAL_OFFLINE',
                roomCode,
                petData: null
            };
        }
    }

    // 建立 Realtime 監聽
    function setupRealtimeSubscriptions(roomCode) {
        if (!supabaseClient) return;

        // 清理前次監聽
        cleanupSubscriptions();

        // 1. 監聽寵物主表變動
        roomSubscription = supabaseClient
            .channel(`realtime:pet:${roomCode}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'pets',
                    filter: `room_code=eq.${roomCode}`
                },
                payload => {
                    if (payload.new) {
                        const unpacked = unpackPetData(payload.new);
                        lastSyncedCoins = unpacked.coins;
                        notify('stateUpdated', unpacked);
                    }
                }
            )
            // 2. 監聽互動動作日誌 (餵食、換裝、撫摸)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'pet_actions',
                    filter: `room_code=eq.${roomCode}`
                },
                payload => {
                    if (payload.new) {
                        notify('actionReceived', payload.new);
                    }
                }
            )
            // 3. 廣播通道即時廣播 (無需等待 DB 寫入，毫秒級動作同步)
            .on('broadcast', { event: 'PET_INTERACTION' }, payload => {
                if (payload.payload && payload.payload.sender !== playerName) {
                    const action = payload.payload;
                    action.player_name = action.player_name || action.sender;
                    notify('actionReceived', action);
                }
            })
            // 即時小豬座標與目標導航同步
            .on('broadcast', { event: 'PIG_SYNC' }, payload => {
                if (payload.payload && payload.payload.sender !== playerName) {
                    notify('pigPositionReceived', payload.payload);
                }
            })
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Multiplayer] Realtime 通道已訂閱: ${roomCode}`);
                }
            });

        // 4. Presence 監聽線上夥伴人數
        presenceChannel = supabaseClient.channel(`presence:room:${roomCode}`);
        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                const users = [];
                Object.values(state).forEach(arr => {
                    arr.forEach(u => users.push(u));
                });
                onlineUsersCount = Math.max(1, users.length);
                notify('presenceUpdated', { count: onlineUsersCount, users });
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                notify('presenceUpdated', { count: onlineUsersCount + 1, joined: newPresences });
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                notify('presenceUpdated', { count: Math.max(1, onlineUsersCount - 1), left: leftPresences });
            })
            .subscribe(async status => {
                if (status === 'SUBSCRIBED') {
                    await presenceChannel.track({
                        player_name: playerName,
                        online_at: new Date().toISOString()
                    });
                }
            });
    }

    function cleanupSubscriptions() {
        if (roomSubscription && supabaseClient) {
            supabaseClient.removeChannel(roomSubscription);
            roomSubscription = null;
        }
        if (presenceChannel && supabaseClient) {
            supabaseClient.removeChannel(presenceChannel);
            presenceChannel = null;
        }
    }

    // 核心伺服器權威動作：變更金幣與狀態 (RPC / 安全寫入)
    async function recordAction(actionType, deltaCoins = 0, patchData = {}) {
        const payload = {
            room_code: currentRoomCode,
            player_name: playerName,
            action_type: actionType,
            delta_coins: deltaCoins,
            details: patchData,
            timestamp: Date.now()
        };

        // 即時透過 Broadcast 廣播給同房間的好友，毫秒級觸發動畫
        if (roomSubscription && connectionStatus === 'CONNECTED') {
            try {
                roomSubscription.send({
                    type: 'broadcast',
                    event: 'PET_INTERACTION',
                    payload: {
                        sender: playerName,
                        player_name: playerName,
                        action_type: actionType,
                        delta_coins: deltaCoins,
                        details: patchData
                    }
                });
            } catch (e) {
                console.warn('廣播動作失敗:', e);
            }
        }

        // 若尚未連線 Supabase，在本地模擬運算
        if (!supabaseClient || connectionStatus !== 'CONNECTED') {
            return {
                success: true,
                simulated: true,
                deltaCoins,
                patchData
            };
        }

        try {
            // 嘗試呼叫 PostgreSQL 安全交易 RPC: apply_pet_action（若已知未創建則直接跳過避免 400 報錯）
            if (rpcAvailable) {
                const { data, error } = await supabaseClient.rpc('apply_pet_action', {
                    p_room_code: currentRoomCode,
                    p_player_name: playerName,
                    p_action_type: actionType,
                    p_coin_delta: Math.round(deltaCoins),
                    p_patch: patchData
                });

                if (!error && data) {
                    lastSyncedCoins = data.coins;
                    return { success: true, serverPet: data };
                } else if (error) {
                    rpcAvailable = false; // 標記為未部署，後續操作直接走原子 Update 回退，徹底消除 Console 400 警報
                }
            }

            // 若直接安全 Update 表格
            const DB_ALLOWED_COLUMNS = new Set([
                'coins', 'name', 'weight', 'hunger', 'mood', 'energy', 'cleanliness',
                'intimacy', 'intimacy_level', 'current_hat', 'current_biome',
                'unlocked_biomes', 'ing_stock', 'owned_toys', 'active_toys',
                'upgrade_levels', 'trough_mask', 'unlocked_recipes', 'updated_at'
            ]);
            const META_KEYS = new Set([
                'pigs', 'color', 'current_outfit', 'equipped_weapon', 'equipped_shield',
                'owned_equip', 'estate_levels', 'unlocked_stages', 'farm', 'pixel_battle'
            ]);

            const directPatch = { updated_at: new Date().toISOString() };
            const metaUpdates = {};

            for (const key in patchData) {
                if (DB_ALLOWED_COLUMNS.has(key)) {
                    directPatch[key] = patchData[key];
                } else if (META_KEYS.has(key)) {
                    metaUpdates[key] = patchData[key];
                }
            }

            if (Object.keys(metaUpdates).length > 0) {
                let recipes = directPatch.unlocked_recipes;
                if (!recipes) {
                    try {
                        const { data: curR } = await supabaseClient.from('pets').select('unlocked_recipes').eq('room_code', currentRoomCode).maybeSingle();
                        recipes = (curR && curR.unlocked_recipes) ? { ...curR.unlocked_recipes } : {};
                    } catch (e) {
                        recipes = {};
                    }
                } else {
                    recipes = { ...recipes };
                }
                recipes.__meta = Object.assign({}, recipes.__meta || {}, metaUpdates);
                directPatch.unlocked_recipes = recipes;
            }

            if (deltaCoins !== 0) {
                try {
                    const { data: cur } = await supabaseClient.from('pets').select('coins').eq('room_code', currentRoomCode).maybeSingle();
                    if (cur) {
                        directPatch.coins = Math.max(0, cur.coins + deltaCoins);
                    }
                } catch (e) {}
            }

            const updateRes = await supabaseClient.from('pets').update(directPatch).eq('room_code', currentRoomCode).select().maybeSingle();
            try {
                await supabaseClient.from('pet_actions').insert({
                    room_code: currentRoomCode,
                    player_name: playerName,
                    action_type: actionType,
                    delta_coins: deltaCoins,
                    details: patchData
                });
            } catch (e) {}

            const unpacked = unpackPetData(updateRes.data);
            if (unpacked && unpacked.coins !== undefined) {
                lastSyncedCoins = unpacked.coins;
            }
            return { success: true, serverPet: unpacked };
        } catch (err) {
            console.error('[Multiplayer] 執行伺服器同步動作失敗:', err);
            return { success: false, error: err };
        }
    }

    // 實時小豬位置廣播 (頻率節流，毫秒級流暢同步)
    let lastPigBroadcastTime = 0;
    function broadcastPigPosition(posData) {
        const now = performance.now();
        if (now - lastPigBroadcastTime < 180) return; // 限制約 5 次/秒，符合 Realtime 配額
        lastPigBroadcastTime = now;

        if (roomSubscription && connectionStatus === 'CONNECTED') {
            try {
                roomSubscription.send({
                    type: 'broadcast',
                    event: 'PIG_SYNC',
                    payload: {
                        sender: playerName,
                        player_name: playerName,
                        ...posData
                    }
                });
            } catch (e) {
                // 靜默
            }
        }
    }

    // 伺服器端被動收益同步 (防客戶端竄改時間)
    async function syncIdleIncome(autoPerSec) {
        if (!supabaseClient || connectionStatus !== 'CONNECTED' || !currentRoomCode || autoPerSec <= 0) {
            return null;
        }

        try {
            const { data, error } = await supabaseClient.rpc('sync_idle_income', {
                p_room_code: currentRoomCode,
                p_auto_per_sec: autoPerSec
            });

            if (!error && data) {
                lastSyncedCoins = data.coins;
                notify('stateUpdated', data);
                return data;
            }
        } catch (e) {
            // 靜默捕捉，不影響前台流暢
        }
        return null;
    }

    // 取得最近 15 筆共養動態
    async function fetchRecentActions(limit = 15) {
        if (!supabaseClient || connectionStatus !== 'CONNECTED' || !currentRoomCode) {
            return [];
        }
        try {
            const { data, error } = await supabaseClient
                .from('pet_actions')
                .select('*')
                .eq('room_code', currentRoomCode)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (!error && data) return data;
        } catch (e) {
            console.warn('載入動態日誌失敗:', e);
        }
        return [];
    }

    // 註冊監聽器
    function on(event, callback) {
        if (listeners[event]) {
            listeners[event].push(callback);
        }
    }

    // 導出全局實例
    window.MultiplayerSync = {
        joinOrCreateRoom,
        recordAction,
        broadcastPigPosition,
        syncIdleIncome,
        fetchRecentActions,
        generateRoomCode,
        getCurrentRoomCode: () => currentRoomCode,
        getPlayerName,
        setPlayerName,
        getConnectionStatus: () => connectionStatus,
        getOnlineUsersCount: () => onlineUsersCount,
        getLastSyncedCoins: () => lastSyncedCoins,
        on
    };
})();
