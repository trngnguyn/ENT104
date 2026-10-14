'use strict';

/**
 * Nạp file .env cho máy chủ Node. Khoá API chỉ tồn tại trong tiến trình Node – không bao giờ được gửi xuống trình duyệt.
 */

const fs = require('fs');
const { getConfig, isLocalUrl } = require('./config');

/** Nạp file .env dạng KEY=VALUE. Biến đã có sẵn trong môi trường được ưu tiên, không bị ghi đè. */
function loadEnvFile(file, env = process.env) {
    if (!fs.existsSync(file)) return false;
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (const line of lines) {
        const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        let value = m[2];
        const quoted = value.match(/^(['"])([\s\S]*)\1$/);
        if (quoted) value = quoted[2];
        else value = value.replace(/\s+#.*$/, '').trim();
        if (env[m[1]] === undefined) env[m[1]] = value;
    }
    return true;
}

module.exports = { loadEnvFile, getConfig: (env = process.env) => getConfig(env), isLocalUrl };
