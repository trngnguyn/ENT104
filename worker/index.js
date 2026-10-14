/**
 * Cloudflare Worker: backend chấm Writing cho bản web tĩnh (GitHub Pages).
 * Dùng chung mã với máy chủ Node (server/writing-api.js); đề bài lấy từ data/writing-tasks.json lúc build.
 * Khoá AI đặt bằng `wrangler secret put AI_API_KEY` – không nằm trong mã nguồn hay wrangler.toml.
 */
import writingApi from '../server/writing-api.js';
import configModule from '../server/config.js';
import feedbackModule from '../server/writing-feedback.js';
import taskList from '../data/writing-tasks.json' with { type: 'json' };

const { createWritingApi, MAX_BODY_BYTES } = writingApi;
const { getConfig } = configModule;
const { parseTasks } = feedbackModule;

let api = null;

async function readBody(request) {
    const declared = Number(request.headers.get('content-length'));
    if (declared > MAX_BODY_BYTES) throw tooLarge();
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) throw tooLarge();
    return text;
}

function tooLarge() {
    return new writingApi.HttpError(413, 'too_large', 'Dữ liệu gửi lên quá lớn.');
}

export default {
    async fetch(request, env) {
        if (!api) {
            api = createWritingApi({
                config: getConfig(env),
                tasks: parseTasks(taskList),
                fetchImpl: (...args) => fetch(...args),
                log: console,
            });
        }
        const url = new URL(request.url);
        const headers = Object.fromEntries([...request.headers].map(([k, v]) => [k.toLowerCase(), v]));
        const out = await api.handle({
            method: request.method,
            pathname: url.pathname,
            headers,
            readBody: () => readBody(request),
            clientIp: request.headers.get('cf-connecting-ip') || 'unknown',
        });
        return new Response(out.status === 204 ? null : out.body, { status: out.status, headers: out.headers });
    },
};
