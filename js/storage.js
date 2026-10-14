/**
 * Đọc/ghi localStorage an toàn (không làm hỏng ứng dụng nếu trình duyệt chặn bộ nhớ).
 */
(function (global) {
    'use strict';

    const AppStorage = {
        get(key, fallback) {
            try {
                const raw = global.localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (e) {
                return fallback;
            }
        },
        set(key, value) {
            try {
                global.localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn(`Không lưu được '${key}' vào localStorage.`, e);
                return false;
            }
        },
        remove(key) {
            try {
                global.localStorage.removeItem(key);
            } catch (e) { /* bỏ qua */ }
        },
    };

    global.AppStorage = AppStorage;
    if (typeof module === 'object' && module.exports) module.exports = AppStorage;
})(typeof window !== 'undefined' ? window : globalThis);
