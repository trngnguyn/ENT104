(function () {
    const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const palette = name => Object.fromEntries(SHADES.map(s => [s, `rgb(var(--c-${name}-${s}) / <alpha-value>)`]));

    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                },
                // Màu lấy từ biến CSS trong css/theme.css nên tự đổi theo chế độ Sáng / Tối.
                colors: Object.fromEntries(
                    ['slate', 'blue', 'emerald', 'rose', 'amber', 'sky', 'indigo', 'red'].map(n => [n, palette(n)])),
                boxShadow: {
                    card: '0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.06)',
                },
            },
        },
    };

    // Áp dụng giao diện trước khi trang hiển thị để tránh nhấp nháy.
    let pref = 'system';
    try {
        pref = localStorage.getItem('ent104.theme') || 'system';
    } catch (e) { /* bỏ qua */ }
    const dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
})();
