'use strict';

/**
 * API Writing độc lập nền tảng – dùng chung cho máy chủ Node (server/app.js) và Cloudflare Worker (worker/index.js):
 *   GET  /api/writing/status
 *   POST /api/writing/feedback   { taskId, text }
 * Trang khác domain chỉ gọi được khi origin nằm trong ALLOWED_ORIGINS (vd. trang GitHub Pages).
 */

const W = require('../js/writingService');
const { AiError } = require('./ai-client');
const { assessWriting } = require('./writing-feedback');
const { createRateLimiter } = require('./rate-limit');

const MAX_BODY_BYTES = 16 * 1024;
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
};
const AI_ERROR_RESPONSES = {
    timeout: [504, 'Dịch vụ AI phản hồi quá lâu. Vui lòng thử lại sau.'],
    auth: [502, 'Máy chủ chưa kết nối được dịch vụ AI (khoá API không hợp lệ). Hãy báo giáo viên / người quản trị.'],
    upstream_rate_limit: [503, 'Dịch vụ AI đang quá tải hoặc hết hạn mức miễn phí. Vui lòng thử lại sau ít phút.'],
    upstream_overloaded: [503, 'Dịch vụ AI đang quá tải. Vui lòng thử lại sau ít phút.'],
    model_not_found: [502, 'Model AI đang cấu hình không còn khả dụng. Hãy báo giáo viên / người quản trị.'],
    truncated: [502, 'Phản hồi của AI bị cắt giữa chừng. Vui lòng thử lại.'],
    invalid_output: [502, 'AI trả kết quả không hợp lệ. Vui lòng thử lại.'],
    unsupported: [500, 'Máy chủ cần Node.js 18 trở lên để gọi AI.'],
};

class HttpError extends Error {
    constructor(status, code, message, headers) {
        super(message);
        this.status = status;
        this.code = code;
        this.headers = headers;
    }
}

function createWritingApi({ config, tasks, fetchImpl = globalThis.fetch, log = console, now = Date.now }) {
    const limiter = createRateLimiter({ ...config.limits, now });
    const allowList = new Set(config.allowedOrigins || []);
    let active = 0;

    /** 'same' | 'allowed' | 'none' (không có Origin) | 'denied'. */
    function originKind(headers) {
        const origin = headers.origin;
        if (!origin) return 'none';
        if (allowList.has(origin)) return 'allowed';
        try {
            if (new URL(origin).host === headers.host) return 'same';
        } catch (e) { /* origin hỏng */ }
        return 'denied';
    }

    function corsHeaders(headers) {
        return originKind(headers) === 'allowed' ? { 'Access-Control-Allow-Origin': headers.origin, Vary: 'Origin' } : { Vary: 'Origin' };
    }

    function json(status, body, headers, extra = {}) {
        return {
            status,
            headers: { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...corsHeaders(headers), ...extra },
            body: JSON.stringify(body),
        };
    }

    function status() {
        const ai = config.ai;
        return {
            enabled: ai.enabled,
            provider: ai.enabled ? (ai.provider === 'mock' ? 'mock' : 'openai-compatible') : null,
            model: ai.enabled && ai.provider !== 'mock' ? ai.model : null,
            message: ai.message || null,
            limits: { ...W.LIMITS, perMinute: config.limits.perMinute, perDay: config.limits.perDay },
        };
    }

    /** Chặn trang web lạ dùng trình duyệt của người học để gọi API (CSRF / lạm dụng hạn mức). */
    function assertOrigin(headers) {
        const kind = originKind(headers);
        if (kind === 'denied') throw new HttpError(403, 'forbidden', 'Yêu cầu không hợp lệ.');
        const site = headers['sec-fetch-site'];
        if (site && !['same-origin', 'none'].includes(site) && kind !== 'allowed') {
            throw new HttpError(403, 'forbidden', 'Yêu cầu không hợp lệ.');
        }
    }

    async function feedback(req) {
        const { headers } = req;
        assertOrigin(headers);
        if (!/^application\/json\b/i.test(headers['content-type'] || '')) {
            throw new HttpError(415, 'unsupported_media_type', 'Yêu cầu phải gửi dạng JSON.');
        }
        const raw = await req.readBody();
        let body;
        try {
            body = JSON.parse(raw);
        } catch (e) {
            throw new HttpError(400, 'bad_json', 'Dữ liệu gửi lên không phải JSON hợp lệ.');
        }
        if (!body || typeof body !== 'object') throw new HttpError(400, 'bad_request', 'Thiếu dữ liệu bài viết.');
        const task = typeof body.taskId === 'string' ? tasks.get(body.taskId) : null;
        if (!task) throw new HttpError(400, 'unknown_task', 'Đề bài không tồn tại.');
        if (typeof body.text !== 'string') throw new HttpError(400, 'bad_request', 'Thiếu nội dung bài viết.');
        const text = body.text.replace(/\r\n?/g, '\n').trim();
        const check = W.checkSubmission(task, text);
        if (!check.ok) throw new HttpError(400, 'invalid_text', check.error);

        if (!config.ai.enabled) {
            throw new HttpError(503, 'not_configured', `Tính năng chấm Writing chưa được bật trên máy chủ. ${config.ai.message}`.trim());
        }
        if (active >= config.limits.maxConcurrent) {
            throw new HttpError(503, 'busy', 'Máy chủ đang chấm nhiều bài cùng lúc. Vui lòng thử lại sau ít giây.', { 'Retry-After': '5' });
        }
        const quota = limiter.take(req.clientIp || 'unknown');
        if (!quota.ok) {
            const msg = {
                minute: `Bạn gửi bài quá nhanh. Vui lòng chờ ${quota.retryAfter} giây.`,
                day: 'Bạn đã dùng hết lượt chấm của hôm nay. Vui lòng quay lại vào ngày mai.',
                global: 'Máy chủ đã dùng hết lượt chấm của hôm nay. Vui lòng quay lại vào ngày mai.',
            }[quota.reason];
            throw new HttpError(429, 'rate_limited', msg, { 'Retry-After': String(quota.retryAfter) });
        }

        active += 1;
        const started = now();
        try {
            const result = await assessWriting({ task, text, ai: config.ai, fetchImpl });
            log.info(`[writing] ${task.id} ${check.words} từ → ${result.score}/${result.maxScore} (${now() - started} ms)`);
            return json(200, { feedback: result }, headers);
        } catch (e) {
            if (e instanceof AiError) {
                log.error(`[writing] ${task.id} lỗi AI (${e.code}): ${e.message}${e.detail ? ` – ${String(e.detail).slice(0, 300)}` : ''}`);
                const [code, message] = AI_ERROR_RESPONSES[e.code] || [502, 'Không chấm được bài lúc này. Vui lòng thử lại sau.'];
                throw new HttpError(code, `ai_${e.code}`, message);
            }
            throw e;
        } finally {
            active -= 1;
        }
    }

    async function route(req) {
        const { method, pathname, headers } = req;
        if (method === 'OPTIONS') {
            if (originKind(headers) !== 'allowed') throw new HttpError(403, 'forbidden', 'Yêu cầu không hợp lệ.');
            return {
                status: 204,
                headers: {
                    ...SECURITY_HEADERS,
                    ...corsHeaders(headers),
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '86400',
                },
                body: '',
            };
        }
        if (pathname === '/api/writing/status') {
            if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Phương thức không được hỗ trợ.', { Allow: 'GET' });
            return json(200, status(), headers);
        }
        if (pathname === '/api/writing/feedback') {
            if (method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Phương thức không được hỗ trợ.', { Allow: 'POST' });
            return feedback(req);
        }
        throw new HttpError(404, 'not_found', 'Không tìm thấy API.');
    }

    /**
     * req = { method, pathname, headers (tên viết thường), readBody: () => Promise<string>, clientIp }
     * → { status, headers, body }
     */
    async function handle(req) {
        try {
            return await route(req);
        } catch (e) {
            if (e instanceof HttpError) return json(e.status, { error: { code: e.code, message: e.message } }, req.headers, e.headers);
            log.error('[writing] lỗi không mong muốn:', e);
            return json(500, { error: { code: 'internal', message: 'Lỗi máy chủ.' } }, req.headers);
        }
    }

    return { handle };
}

module.exports = { createWritingApi, HttpError, MAX_BODY_BYTES, SECURITY_HEADERS };
