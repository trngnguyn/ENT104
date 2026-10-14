'use strict';

/**
 * Gọi API dạng OpenAI Chat Completions (`POST {AI_BASE_URL}/chat/completions`).
 * Dùng được với OpenAI và các dịch vụ có endpoint tương thích (Google Gemini, OpenRouter, Groq, Ollama…).
 */

class AiError extends Error {
    constructor(code, message, detail) {
        super(message);
        this.code = code;
        this.detail = detail;
    }
}

/** Lấy object JSON từ nội dung model trả về (chấp nhận cả khi bị bọc trong ```json … ```). */
function extractJson(content) {
    const text = String(content || '').trim();
    const candidates = [text];
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) candidates.push(fenced[1]);
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first >= 0 && last > first) candidates.push(text.slice(first, last + 1));
    for (const c of candidates) {
        try {
            const value = JSON.parse(c);
            if (value && typeof value === 'object' && !Array.isArray(value)) return value;
        } catch (e) { /* thử ứng viên tiếp theo */ }
    }
    throw new AiError('invalid_output', 'AI trả về dữ liệu không đúng định dạng JSON.', text.slice(0, 300));
}

/** Lỗi tạm thời (quá tải, mạng, JSON hỏng…) → thử lại; model không tồn tại → chuyển model dự phòng. */
const RETRYABLE = new Set(['upstream_overloaded', 'upstream_rate_limit', 'upstream', 'network', 'timeout', 'invalid_output', 'truncated']);
/** Thử lại cùng model thường vô ích với các lỗi này → chuyển ngay sang model dự phòng. */
const NEXT_MODEL = new Set(['model_not_found', 'timeout', 'upstream_overloaded']);
const MAX_ATTEMPTS = 4;

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Gọi model chính, lỗi tạm thời thì thử lại một lần rồi chuyển sang các model dự phòng (AI_FALLBACK_MODELS).
 * Tối đa MAX_ATTEMPTS lượt gọi cho một bài.
 */
async function chatJson({ ai, messages, fetchImpl = globalThis.fetch }) {
    if (typeof fetchImpl !== 'function') throw new AiError('unsupported', 'Node.js ≥ 18 là bắt buộc để gọi AI (cần fetch).');
    const models = [ai.model, ...(ai.fallbackModels || [])].filter((m, i, a) => m && a.indexOf(m) === i);
    const delay = ai.retryDelayMs === undefined ? 800 : ai.retryDelayMs;
    let attempts = 0;
    let lastError = null;
    for (const model of models) {
        for (let round = 0; round < 2 && attempts < MAX_ATTEMPTS; round++) {
            if (attempts > 0 && delay) await sleep(delay * attempts);
            attempts += 1;
            try {
                return await requestOnce({ ai, model, messages, fetchImpl });
            } catch (e) {
                if (!(e instanceof AiError)) throw e;
                lastError = e;
                if (e.code === 'auth') throw e;
                if (NEXT_MODEL.has(e.code) || !RETRYABLE.has(e.code)) break;
            }
        }
    }
    throw lastError;
}

async function requestOnce({ ai, model, messages, fetchImpl }) {
    const body = { model, messages };
    if (ai.temperature !== null && ai.temperature !== undefined) body.temperature = ai.temperature;
    if (ai.maxTokensField !== 'none') body[ai.maxTokensField] = ai.maxTokens;
    if (ai.jsonMode) body.response_format = { type: 'json_object' };
    if (ai.reasoningEffort) body.reasoning_effort = ai.reasoningEffort;

    const headers = { 'Content-Type': 'application/json' };
    if (ai.apiKey) headers.Authorization = `Bearer ${ai.apiKey}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ai.timeoutMs);
    let res;
    try {
        res = await fetchImpl(`${ai.baseUrl}/chat/completions`, {
            method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal,
        });
    } catch (e) {
        if (e && e.name === 'AbortError') throw new AiError('timeout', 'AI phản hồi quá lâu.');
        throw new AiError('network', 'Không kết nối được dịch vụ AI.', e && e.message);
    } finally {
        clearTimeout(timer);
    }

    const raw = await res.text();
    if (!res.ok) {
        const code = {
            400: 'bad_request', 401: 'auth', 403: 'auth', 404: 'model_not_found', 429: 'upstream_rate_limit', 503: 'upstream_overloaded',
        }[res.status] || 'upstream';
        throw new AiError(code, `Dịch vụ AI trả lỗi HTTP ${res.status} (model ${model}).`, raw.slice(0, 500));
    }
    let data;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        throw new AiError('upstream', 'Dịch vụ AI trả dữ liệu không hợp lệ.', raw.slice(0, 300));
    }
    const choice = data && Array.isArray(data.choices) ? data.choices[0] : null;
    const content = choice && choice.message ? choice.message.content : null;
    if (choice && choice.finish_reason === 'length') throw new AiError('truncated', 'Phản hồi của AI bị cắt do quá dài (tăng AI_MAX_TOKENS).');
    if (typeof content !== 'string' || !content.trim()) throw new AiError('invalid_output', 'AI không trả về nội dung.');
    return { json: extractJson(content), model: data.model || model, usage: data.usage || null };
}

module.exports = { AiError, chatJson, extractJson };
