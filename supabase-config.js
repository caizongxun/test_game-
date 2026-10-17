/**
 * Supabase 伺服器配置設定模組
 * 可於網頁端「多人在線共養中心」介面直接填寫專屬 Supabase 專案網址與金鑰，
 * 亦可直接在本檔案中填入預設值。
 */

const SUPABASE_STORAGE_KEY = 'PIG_SIM_SUPABASE_CONFIG_V1';

// 預設配置 (請填入您的 Supabase 專案設定，或於遊戲內設定視窗直接輸入保存)
const DEFAULT_SUPABASE_CONFIG = {
    // 依據使用者的 Supabase 專案自動設定，所有玩家進入遊戲均自動連線，免手動輸入
    supabaseUrl: 'https://onbuzgtvbpvptpocwzdb.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYnV6Z3R2YnB2cHRwb2N3emRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMzI2NjYsImV4cCI6MjEwNzgwODY2Nn0.eWf2CAQwVw1k3FGPsfVIjzrPtgeh8xGTnuiNb_YspJs'
};

function getStoredSupabaseConfig() {
    try {
        const stored = localStorage.getItem(SUPABASE_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                supabaseUrl: (parsed.supabaseUrl || DEFAULT_SUPABASE_CONFIG.supabaseUrl).trim(),
                supabaseAnonKey: (parsed.supabaseAnonKey || DEFAULT_SUPABASE_CONFIG.supabaseAnonKey).trim()
            };
        }
    } catch (e) {
        console.warn('讀取 Supabase 配置失敗:', e);
    }
    return { ...DEFAULT_SUPABASE_CONFIG };
}

function saveStoredSupabaseConfig(url, key) {
    const config = {
        supabaseUrl: (url || '').trim(),
        supabaseAnonKey: (key || '').trim()
    };
    try {
        localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.warn('寫入 Supabase 配置失敗:', e);
    }
    return config;
}

function isSupabaseConfigured() {
    const cfg = getStoredSupabaseConfig();
    return !!(cfg.supabaseUrl && cfg.supabaseAnonKey && cfg.supabaseUrl.startsWith('http'));
}

window.SupabaseConfig = {
    get: getStoredSupabaseConfig,
    save: saveStoredSupabaseConfig,
    isConfigured: isSupabaseConfigured,
    STORAGE_KEY: SUPABASE_STORAGE_KEY
};
