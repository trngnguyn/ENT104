'use strict';

/**
 * Giới hạn số lần chấm bài (lưu trong bộ nhớ, đặt lại khi khởi động lại server):
 * mỗi IP tối đa `perMinute` lần / 60 giây và `perDay` lần / ngày; toàn server tối đa `globalPerDay` lần / ngày.
 * Mục đích: chặn lạm dụng làm tốn chi phí API.
 */

const MINUTE = 60 * 1000;

function createRateLimiter({ perMinute, perDay, globalPerDay, now = Date.now }) {
    const recent = new Map();
    const daily = new Map();
    let day = null;
    let globalCount = 0;

    const dayKey = t => new Date(t).toISOString().slice(0, 10);

    function rollDay(t) {
        const key = dayKey(t);
        if (key !== day) {
            day = key;
            daily.clear();
            globalCount = 0;
        }
    }

    function prune(t) {
        if (recent.size < 1000) return;
        for (const [k, list] of recent) {
            if (!list.length || t - list[list.length - 1] >= MINUTE) recent.delete(k);
        }
    }

    /** Ghi nhận một lượt nếu còn hạn mức; trả về { ok, retryAfter (giây), reason }. */
    function take(key) {
        const t = now();
        rollDay(t);
        prune(t);
        const list = (recent.get(key) || []).filter(x => t - x < MINUTE);
        if (globalCount >= globalPerDay) {
            return { ok: false, reason: 'global', retryAfter: Math.ceil((Date.parse(`${day}T00:00:00Z`) + 86400000 - t) / 1000) };
        }
        if ((daily.get(key) || 0) >= perDay) {
            return { ok: false, reason: 'day', retryAfter: Math.ceil((Date.parse(`${day}T00:00:00Z`) + 86400000 - t) / 1000) };
        }
        if (list.length >= perMinute) {
            recent.set(key, list);
            return { ok: false, reason: 'minute', retryAfter: Math.max(1, Math.ceil((list[0] + MINUTE - t) / 1000)) };
        }
        list.push(t);
        recent.set(key, list);
        daily.set(key, (daily.get(key) || 0) + 1);
        globalCount += 1;
        return { ok: true };
    }

    return { take };
}

module.exports = { createRateLimiter };
