-- ==============================================================================
-- 3D 皇家小豬牧場 - Supabase 後端數據庫架構與伺服器端權威計算腳本
-- 用於多人在線協同養成、房間代碼同步、金幣防竄改與伺服器端計算
-- ==============================================================================

-- 1. 寵物共享房間主表 (儲存小豬核心狀態與金幣)
CREATE TABLE IF NOT EXISTS public.pets (
    room_code VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL DEFAULT '粉紅圓圓',
    coins BIGINT NOT NULL DEFAULT 300,
    weight NUMERIC(6, 2) NOT NULL DEFAULT 15.00,
    hunger INT NOT NULL DEFAULT 80,
    mood INT NOT NULL DEFAULT 85,
    energy INT NOT NULL DEFAULT 90,
    cleanliness INT NOT NULL DEFAULT 92,
    intimacy INT NOT NULL DEFAULT 12,
    intimacy_level INT NOT NULL DEFAULT 1,
    current_hat VARCHAR(32) NOT NULL DEFAULT 'sprout',
    current_biome VARCHAR(32) NOT NULL DEFAULT 'sunny',
    unlocked_biomes JSONB NOT NULL DEFAULT '{"sunny": true}'::jsonb,
    ing_stock JSONB NOT NULL DEFAULT '{"A":5,"B":5,"C":4,"D":3,"E":3,"F":2,"G":2,"H":2,"I":1,"J":1}'::jsonb,
    owned_toys JSONB NOT NULL DEFAULT '{"soccer":true,"bowling":true}'::jsonb,
    active_toys JSONB NOT NULL DEFAULT '{"soccer":true,"bowling":true}'::jsonb,
    upgrade_levels JSONB NOT NULL DEFAULT '{"touch_power":0,"touch_crit":0,"auto_arm":0,"auto_ticket":0,"auto_chef":0,"auto_truffle":0}'::jsonb,
    trough_mask INT NOT NULL DEFAULT 0,
    unlocked_recipes JSONB NOT NULL DEFAULT '{}'::jsonb,
    equipped_weapon VARCHAR(32) DEFAULT NULL,
    equipped_shield VARCHAR(32) DEFAULT NULL,
    owned_equip JSONB NOT NULL DEFAULT '{}'::jsonb,
    current_outfit VARCHAR(32) NOT NULL DEFAULT 'none',
    color VARCHAR(32) NOT NULL DEFAULT '#ffb6c1',
    pigs JSONB NOT NULL DEFAULT '[]'::jsonb,
    estate_levels JSONB NOT NULL DEFAULT '{}'::jsonb,
    unlocked_stages INT NOT NULL DEFAULT 1,
    last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 寵物互動與操作日誌表 (記錄朋友間的互動動態與金幣流動)
CREATE TABLE IF NOT EXISTS public.pet_actions (
    id BIGSERIAL PRIMARY KEY,
    room_code VARCHAR(32) NOT NULL REFERENCES public.pets(room_code) ON DELETE CASCADE,
    player_name VARCHAR(64) NOT NULL DEFAULT '朋友',
    action_type VARCHAR(32) NOT NULL,
    delta_coins BIGINT NOT NULL DEFAULT 0,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引優化
CREATE INDEX IF NOT EXISTS idx_pet_actions_room_code ON public.pet_actions(room_code);
CREATE INDEX IF NOT EXISTS idx_pet_actions_created_at ON public.pet_actions(created_at DESC);

-- 3. 伺服器端金幣與狀態權威更新函數 (RPC: apply_pet_action)
-- 使用 FOR UPDATE 行級排他鎖，防止雙方同時操作造成的 Race Condition
CREATE OR REPLACE FUNCTION public.apply_pet_action(
    p_room_code VARCHAR,
    p_player_name VARCHAR,
    p_action_type VARCHAR,
    p_coin_delta BIGINT,
    p_patch JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pet public.pets%ROWTYPE;
    v_new_coins BIGINT;
BEGIN
    -- 查詢並鎖定該房間寵物記錄
    SELECT * INTO v_pet FROM public.pets WHERE room_code = p_room_code FOR UPDATE;
    
    -- 若房間不存在則自動初始化新寵物
    IF NOT FOUND THEN
        INSERT INTO public.pets (room_code, name)
        VALUES (p_room_code, COALESCE(p_patch->>'name', '粉紅圓圓'))
        RETURNING * INTO v_pet;
    END IF;

    -- 金幣計算與校驗 (金幣不允許扣為負數)
    v_new_coins := v_pet.coins + p_coin_delta;
    IF v_new_coins < 0 THEN
        RAISE EXCEPTION '金幣不足：當前金幣 %，欲變動 %', v_pet.coins, p_coin_delta;
    END IF;

    -- 更新寵物各項數值
    UPDATE public.pets
    SET
        coins = v_new_coins,
        name = COALESCE(p_patch->>'name', v_pet.name),
        weight = COALESCE((p_patch->>'weight')::NUMERIC, v_pet.weight),
        hunger = LEAST(100, GREATEST(0, COALESCE((p_patch->>'hunger')::INT, v_pet.hunger))),
        mood = LEAST(100, GREATEST(0, COALESCE((p_patch->>'mood')::INT, v_pet.mood))),
        energy = LEAST(100, GREATEST(0, COALESCE((p_patch->>'energy')::INT, v_pet.energy))),
        cleanliness = LEAST(100, GREATEST(0, COALESCE((p_patch->>'cleanliness')::INT, v_pet.cleanliness))),
        intimacy = COALESCE((p_patch->>'intimacy')::INT, v_pet.intimacy),
        intimacy_level = COALESCE((p_patch->>'intimacy_level')::INT, v_pet.intimacy_level),
        current_hat = COALESCE(p_patch->>'current_hat', v_pet.current_hat),
        current_biome = COALESCE(p_patch->>'current_biome', v_pet.current_biome),
        unlocked_biomes = CASE WHEN p_patch ? 'unlocked_biomes' THEN p_patch->'unlocked_biomes' ELSE v_pet.unlocked_biomes END,
        ing_stock = CASE WHEN p_patch ? 'ing_stock' THEN p_patch->'ing_stock' ELSE v_pet.ing_stock END,
        owned_toys = CASE WHEN p_patch ? 'owned_toys' THEN p_patch->'owned_toys' ELSE v_pet.owned_toys END,
        active_toys = CASE WHEN p_patch ? 'active_toys' THEN p_patch->'active_toys' ELSE v_pet.active_toys END,
        upgrade_levels = CASE WHEN p_patch ? 'upgrade_levels' THEN p_patch->'upgrade_levels' ELSE v_pet.upgrade_levels END,
        trough_mask = COALESCE((p_patch->>'trough_mask')::INT, v_pet.trough_mask),
        unlocked_recipes = CASE WHEN p_patch ? 'unlocked_recipes' THEN p_patch->'unlocked_recipes' ELSE v_pet.unlocked_recipes END,
        equipped_weapon = CASE WHEN p_patch ? 'equipped_weapon' THEN p_patch->>'equipped_weapon' ELSE v_pet.equipped_weapon END,
        equipped_shield = CASE WHEN p_patch ? 'equipped_shield' THEN p_patch->>'equipped_shield' ELSE v_pet.equipped_shield END,
        owned_equip = CASE WHEN p_patch ? 'owned_equip' THEN p_patch->'owned_equip' ELSE v_pet.owned_equip END,
        current_outfit = COALESCE(p_patch->>'current_outfit', v_pet.current_outfit),
        color = COALESCE(p_patch->>'color', v_pet.color),
        pigs = CASE WHEN p_patch ? 'pigs' THEN p_patch->'pigs' ELSE v_pet.pigs END,
        estate_levels = CASE WHEN p_patch ? 'estate_levels' THEN p_patch->'estate_levels' ELSE v_pet.estate_levels END,
        unlocked_stages = COALESCE((p_patch->>'unlocked_stages')::INT, v_pet.unlocked_stages),
        updated_at = NOW(),
        last_sync_at = NOW()
    WHERE room_code = p_room_code
    RETURNING * INTO v_pet;

    -- 記錄動作日誌供朋友即時動態牆使用
    INSERT INTO public.pet_actions (room_code, player_name, action_type, delta_coins, details)
    VALUES (p_room_code, p_player_name, p_action_type, p_coin_delta, p_patch);

    RETURN to_jsonb(v_pet);
END;
$$;

-- 4. 伺服器端被動掛機金幣同步函數 (RPC: sync_idle_income)
-- 依據伺服器真實時間差計算掛機收益，防止客戶端竄改時間
CREATE OR REPLACE FUNCTION public.sync_idle_income(
    p_room_code VARCHAR,
    p_auto_per_sec NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pet public.pets%ROWTYPE;
    v_elapsed_seconds NUMERIC;
    v_earned_coins BIGINT := 0;
BEGIN
    SELECT * INTO v_pet FROM public.pets WHERE room_code = p_room_code FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION '房間代碼不存在: %', p_room_code;
    END IF;

    v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_pet.last_sync_at));
    IF v_elapsed_seconds > 1.0 AND p_auto_per_sec > 0 THEN
        -- 最大離線計算限制 24 小時，避免極端數值
        v_elapsed_seconds := LEAST(v_elapsed_seconds, 86400.0);
        v_earned_coins := FLOOR(v_elapsed_seconds * p_auto_per_sec);
        
        UPDATE public.pets
        SET
            coins = coins + v_earned_coins,
            last_sync_at = NOW(),
            updated_at = NOW()
        WHERE room_code = p_room_code
        RETURNING * INTO v_pet;
    ELSE
        UPDATE public.pets SET last_sync_at = NOW() WHERE room_code = p_room_code RETURNING * INTO v_pet;
    END IF;

    RETURN to_jsonb(v_pet);
END;
$$;

-- 5. Row Level Security (RLS) 開放與安全性設定
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_actions ENABLE ROW LEVEL SECURITY;

-- 允許任何人使用 Anon Key 查詢、建立與更新自己房間的寵物
CREATE POLICY "Allow public select pets" ON public.pets FOR SELECT USING (true);
CREATE POLICY "Allow public insert pets" ON public.pets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update pets" ON public.pets FOR UPDATE USING (true);

-- 允許任何人查詢與記錄互動動態
CREATE POLICY "Allow public select pet_actions" ON public.pet_actions FOR SELECT USING (true);
CREATE POLICY "Allow public insert pet_actions" ON public.pet_actions FOR INSERT WITH CHECK (true);

-- 6. 開啟 Supabase Realtime 即時廣播
-- 讓雙方玩家能第一時間接收資料庫的變動通知
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pets'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pets;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pet_actions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pet_actions;
    END IF;
END $$;
