/**
 * Chế độ giao diện Sáng / Tối / Theo hệ thống.
 * Lớp `dark` trên <html> được đặt sớm trong js/tailwind-config.js; file này xử lý menu chọn và lưu lựa chọn.
 */
(function () {
    'use strict';

    const KEY = 'ent104.theme';
    const OPTIONS = ['light', 'dark', 'system'];
    const ICONS = {
        light: 'fa-regular fa-sun',
        dark: 'fa-regular fa-moon',
        system: 'fa-solid fa-circle-half-stroke',
    };
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function preference() {
        try {
            const value = localStorage.getItem(KEY);
            return OPTIONS.includes(value) ? value : 'system';
        } catch (e) {
            return 'system';
        }
    }

    function apply(pref) {
        const root = document.documentElement;
        const dark = pref === 'dark' || (pref === 'system' && media.matches);
        if (root.classList.contains('dark') !== dark) {
            // Tắt hiệu ứng chuyển màu trong lúc đổi giao diện để không bị lẫn màu sáng / tối.
            root.classList.add('theme-switching');
            root.classList.toggle('dark', dark);
            requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
        }
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = ICONS[pref];
        document.querySelectorAll('[data-theme-option]').forEach(btn => {
            btn.setAttribute('aria-checked', String(btn.dataset.themeOption === pref));
        });
    }

    function choose(pref) {
        try {
            localStorage.setItem(KEY, pref);
        } catch (e) { /* bỏ qua */ }
        apply(pref);
    }

    media.addEventListener('change', () => {
        if (preference() === 'system') apply('system');
    });

    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('theme-btn');
        const menu = document.getElementById('theme-menu');
        const setOpen = open => {
            menu.classList.toggle('hidden', !open);
            btn.setAttribute('aria-expanded', String(open));
        };

        btn.addEventListener('click', e => {
            e.stopPropagation();
            setOpen(menu.classList.contains('hidden'));
        });
        menu.addEventListener('click', e => {
            const option = e.target.closest('[data-theme-option]');
            if (!option) return;
            choose(option.dataset.themeOption);
            setOpen(false);
        });
        document.addEventListener('click', e => {
            if (!menu.contains(e.target)) setOpen(false);
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') setOpen(false);
        });

        apply(preference());
    });
})();
