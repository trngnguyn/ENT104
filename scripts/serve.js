'use strict';

/**
 * Chạy ứng dụng (không cần cài thêm gói):
 *   node scripts/serve.js            → http://localhost:8080
 *   PORT=3000 node scripts/serve.js  → cổng khác
 * Cấu hình AI cho tính năng Writing đặt trong file .env (xem .env.example).
 * Mặc định chỉ nghe trên 127.0.0.1; đặt HOST=0.0.0.0 nếu muốn máy khác trong mạng truy cập.
 */

const path = require('path');
const { loadEnvFile, getConfig } = require('../server/env');
const { createApp, ROOT } = require('../server/app');
const { loadTasks } = require('../server/load-tasks');

loadEnvFile(path.join(ROOT, '.env'));
const config = getConfig();

let tasks;
try {
    tasks = loadTasks();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}

const server = createApp({ config, tasks });
server.listen(config.port, config.host, () => {
    const shown = ['0.0.0.0', '::', '127.0.0.1'].includes(config.host) ? 'localhost' : config.host;
    console.log(`Đang chạy tại http://${shown}:${server.address().port}  (Ctrl+C để dừng)`);
    const ai = config.ai;
    if (!ai.enabled) console.log(`Writing: chưa bật chấm bằng AI – ${ai.message}`);
    else if (ai.provider === 'mock') console.log('Writing: chế độ DEMO (AI_PROVIDER=mock) – phản hồi mẫu, không phải chấm bằng AI.');
    else console.log(`Writing: chấm bằng ${ai.model} qua ${new URL(ai.baseUrl).host}.`);
    if (typeof fetch !== 'function') console.log('Cảnh báo: cần Node.js ≥ 18 để gọi AI.');
});
