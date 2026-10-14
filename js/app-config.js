/**
 * Cấu hình phía trình duyệt (không chứa bí mật – file này ai cũng xem được).
 * writingApiBase: địa chỉ backend chấm Writing, kết thúc bằng "/".
 *   - '' khi chạy bằng `npm start` (API nằm cùng máy chủ).
 *   - Trên GitHub Pages: URL Cloudflare Worker (domain Pages phải có trong ALLOWED_ORIGINS của Worker).
 */
window.APP_CONFIG = {
    writingApiBase: /\.github\.io$/.test(location.hostname)
        ? 'https://ent104-writing.super-heart-6433.workers.dev/'
        : '',
};
