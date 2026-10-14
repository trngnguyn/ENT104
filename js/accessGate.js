/**
 * Màn hình nhập mật khẩu dùng chung cho các tab cần mật khẩu (Writing, Tenses).
 * Mật khẩu được máy chủ kiểm tra (WritingService.unlock); nhập đúng một lần là mở mọi tab.
 */
(function (global) {
    'use strict';

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    /** Cần mật khẩu khi máy chủ yêu cầu và trình duyệt chưa lưu mật khẩu đúng. */
    function isLocked(status, service) {
        return !!(status && status.accessRequired && !service.accessCode);
    }

    /** Vẽ form mật khẩu vào container (một lần) và gọi onUnlock() khi mật khẩu đúng. */
    function mount(container, { service, title, description, onUnlock }) {
        if (container.querySelector('[data-gate-form]')) return;
        container.innerHTML = `<div class="card max-w-md mx-auto p-6 sm:p-8 text-center">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl"><i class="fa-solid fa-lock"></i></div>
            <h3 class="mt-4 text-lg font-bold text-slate-900">${esc(title)}</h3>
            <p class="mt-1 text-sm text-slate-500">${esc(description)}</p>
            <form data-gate-form class="mt-5 flex flex-col gap-3" autocomplete="off">
                <input data-gate-input type="password" class="field text-center tracking-widest" placeholder="Mật khẩu" aria-label="Mật khẩu">
                <p data-gate-error class="hidden text-xs text-rose-600"></p>
                <button data-gate-submit type="submit" class="btn-primary justify-center"><i class="fa-solid fa-unlock"></i> <span>Mở khoá</span></button>
            </form>
        </div>`;
        const form = container.querySelector('[data-gate-form]');
        const input = container.querySelector('[data-gate-input]');
        const btn = container.querySelector('[data-gate-submit]');
        form.addEventListener('submit', async e => {
            e.preventDefault();
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang kiểm tra…</span>';
            try {
                await service.unlock(input.value);
                container.innerHTML = '';
                onUnlock();
            } catch (err) {
                showError(container, err.message);
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-unlock"></i> <span>Mở khoá</span>';
                input.select();
            }
        });
        setTimeout(() => input.focus(), 50);
    }

    function showError(container, message) {
        const el = container.querySelector('[data-gate-error]');
        if (!el) return;
        el.textContent = message;
        el.classList.remove('hidden');
    }

    global.AccessGate = { isLocked, mount, showError };
})(typeof window !== 'undefined' ? window : globalThis);
