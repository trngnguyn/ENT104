'use strict';

/**
 * Dựng cấu hình máy chủ từ một object biến môi trường (process.env trên Node, `env` trên Cloudflare Worker).
 * Không dùng API riêng của Node để chạy được ở cả hai nơi.
 */

const num = (value, fallback, min = 0) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= min ? n : fallback;
};

function isLocalUrl(url) {
    try {
        const { hostname } = new URL(url);
        return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);
    } catch (e) {
        return false;
    }
}

/** "https://a.github.io, http://localhost:8080" → ['https://a.github.io', 'http://localhost:8080'] (chỉ giữ origin hợp lệ). */
function parseOrigins(value) {
    return String(value || '').split(',').map(s => s.trim()).filter(Boolean).map(s => {
        try {
            const u = new URL(s);
            return /^https?:$/.test(u.protocol) ? u.origin : null;
        } catch (e) {
            return null;
        }
    }).filter(Boolean);
}

function getConfig(env = {}) {
    const str = key => (typeof env[key] === 'string' ? env[key].trim() : '');
    const provider = (str('AI_PROVIDER') || 'openai').toLowerCase();
    const baseUrl = (str('AI_BASE_URL') || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const apiKey = str('AI_API_KEY');
    const model = str('AI_MODEL');
    const ai = {
        provider,
        baseUrl,
        apiKey,
        model,
        jsonMode: env.AI_JSON_MODE !== 'false',
        timeoutMs: num(env.AI_TIMEOUT_MS, 60000, 1000),
        maxTokens: num(env.AI_MAX_TOKENS, 6000, 256),
        maxTokensField: ['max_tokens', 'max_completion_tokens', 'none'].includes(env.AI_MAX_TOKENS_FIELD)
            ? env.AI_MAX_TOKENS_FIELD : 'max_tokens',
        temperature: env.AI_TEMPERATURE === undefined || env.AI_TEMPERATURE === '' ? null : num(env.AI_TEMPERATURE, null),
        fallbackModels: str('AI_FALLBACK_MODELS').split(',').map(s => s.trim()).filter(Boolean),
        retryDelayMs: num(env.AI_RETRY_DELAY_MS, 800, 0),
        reasoningEffort: ['none', 'minimal', 'low', 'medium', 'high'].includes(str('AI_REASONING_EFFORT')) ? str('AI_REASONING_EFFORT') : null,
    };

    let enabled = false;
    let message = '';
    if (provider === 'mock') {
        enabled = true;
        message = 'Chế độ DEMO: phản hồi được tạo bằng quy tắc đơn giản, không phải chấm bằng AI.';
    } else if (provider !== 'openai') {
        message = `AI_PROVIDER "${provider}" không được hỗ trợ (dùng "openai" hoặc "mock").`;
    } else if (!/^https?:\/\//.test(baseUrl)) {
        message = 'AI_BASE_URL không hợp lệ.';
    } else if (!model) {
        message = 'Chưa cấu hình AI_MODEL.';
    } else if (!apiKey && !isLocalUrl(baseUrl)) {
        message = 'Chưa cấu hình AI_API_KEY.';
    } else {
        enabled = true;
    }
    ai.enabled = enabled;
    ai.message = message;

    return {
        host: str('HOST') || '127.0.0.1',
        port: num(env.PORT, 8080, 0),
        trustProxy: env.TRUST_PROXY === 'true',
        allowedOrigins: parseOrigins(env.ALLOWED_ORIGINS),
        ai,
        limits: {
            perMinute: num(env.WRITING_RATE_PER_MINUTE, 5, 1),
            perDay: num(env.WRITING_RATE_PER_DAY, 50, 1),
            globalPerDay: num(env.WRITING_GLOBAL_DAILY_LIMIT, 500, 1),
            maxConcurrent: num(env.WRITING_MAX_CONCURRENT, 4, 1),
        },
    };
}

module.exports = { getConfig, isLocalUrl, parseOrigins };
