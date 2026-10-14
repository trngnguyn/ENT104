/**
 * Giao diện Writing: chọn đề (đoạn văn miêu tả / kể chuyện ~150 từ), viết bài, gửi chấm qua backend,
 * xem kết quả chia hai cột: bài của học sinh (bản gốc tô lỗi / bản đã sửa) và nhận xét của AI
 * (4 tiêu chí, lỗi ngữ pháp, lỗi từ vựng, gợi ý cải thiện, bài sửa hoàn chỉnh, bài tham khảo).
 * Mọi nội dung do AI trả về đều được escape trước khi hiển thị.
 */
(function (global) {
    'use strict';

    const W = global.WritingService;
    const LEVEL_FILTERS = ['all', ...W.LEVELS];
    const TYPE_ICON = { descriptive: 'fa-image', narrative: 'fa-book' };
    const TYPE_STYLE = {
        descriptive: 'bg-sky-50 text-sky-700',
        narrative: 'bg-amber-50 text-amber-700',
    };
    const CORRECTION_STYLE = {
        grammar: 'bg-rose-50 text-rose-700',
        vocabulary: 'bg-indigo-50 text-indigo-700',
        spelling: 'bg-amber-50 text-amber-700',
        punctuation: 'bg-sky-50 text-sky-700',
        word_order: 'bg-blue-50 text-blue-700',
        style: 'bg-slate-100 text-slate-600',
    };

    const $ = id => document.getElementById(id);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmtDate = ts => new Date(ts).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    const fmtScore = n => (typeof n === 'number' ? String(n).replace('.', ',') : '—');
    const scoreTone = n => (n >= 8 ? 'emerald' : n >= 5 ? 'amber' : 'rose');

    function create({ service }) {
        const s = {
            loaded: false,
            loading: false,
            loadError: null,
            status: null,
            level: 'all',
            taskId: null,
            submitting: false,
            viewing: null,
            focus: null,
            textMode: 'original',
        };
        let bound = false;
        let draftTimer = null;
        let flashTimer = null;

        const task = () => service.byId.get(s.taskId) || null;

        function flash(message, type = 'error') {
            const el = $('w-flash');
            const tone = {
                success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                error: 'bg-rose-50 border-rose-200 text-rose-800',
                info: 'bg-blue-50 border-blue-200 text-blue-800',
            }[type];
            el.className = `mb-4 text-sm rounded-xl border px-4 py-3 ${tone}`;
            el.textContent = message;
            clearTimeout(flashTimer);
            if (type !== 'error') flashTimer = setTimeout(() => el.classList.add('hidden'), 5000);
        }

        async function ensureLoaded() {
            if (s.loaded || s.loading) return;
            s.loading = true;
            if (service.offline) {
                s.loadError = 'Tính năng Writing cần máy chủ: chạy "npm start" rồi mở http://localhost:8080 (không mở trực tiếp file index.html).';
            } else {
                try {
                    const [, status] = await Promise.all([service.loadTasks(), service.status()]);
                    s.status = status;
                } catch (e) {
                    console.error(e);
                    s.loadError = `Không tải được đề Writing: ${e.message}`;
                }
            }
            s.loading = false;
            s.loaded = true;
            const ui = service.ui();
            if (LEVEL_FILTERS.includes(ui.level)) s.level = ui.level;
            s.taskId = service.byId.has(ui.taskId) ? ui.taskId : (service.tasks[0] && service.tasks[0].id) || null;
            const last = s.taskId ? service.attempts(s.taskId)[0] : null;
            s.viewing = last || null;
            render();
        }

        // ------------------------------------------------------------ render

        function render() {
            bind();
            if (!s.loaded) {
                ensureLoaded();
                $('w-main').innerHTML = '<div class="card p-10 text-center text-slate-500 text-sm"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải đề Writing...</div>';
                return;
            }
            const locked = isLocked();
            $('w-lock').classList.toggle('hidden', !locked);
            $('w-body').classList.toggle('hidden', locked);
            renderStatus();
            if (locked) return renderLock();
            renderTaskList();
            renderSummary();
            if (s.loadError) {
                $('w-main').innerHTML = `<div class="card !border-rose-200 p-8 text-sm text-rose-700"><i class="fa-solid fa-triangle-exclamation mr-1"></i> ${esc(s.loadError)}</div>`;
                $('w-feedback').innerHTML = '';
                return;
            }
            renderMain();
        }

        const isLocked = () => !!(s.status && s.status.accessRequired && !service.accessCode);

        function renderLock() {
            if ($('w-lock-form')) return;
            $('w-lock').innerHTML = `<div class="card max-w-md mx-auto p-6 sm:p-8 text-center">
                <div class="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl"><i class="fa-solid fa-lock"></i></div>
                <h3 class="mt-4 text-lg font-bold text-slate-900">Nhập mật khẩu để vào Writing</h3>
                <p class="mt-1 text-sm text-slate-500">Phần luyện viết có AI chấm chỉ dành cho học sinh trong lớp. Hỏi giáo viên nếu bạn chưa có mật khẩu.</p>
                <form id="w-lock-form" class="mt-5 flex flex-col gap-3" autocomplete="off">
                    <input id="w-lock-input" type="password" class="field text-center tracking-widest" placeholder="Mật khẩu" aria-label="Mật khẩu Writing">
                    <p id="w-lock-error" class="hidden text-xs text-rose-600"></p>
                    <button id="w-lock-submit" type="submit" class="btn-primary justify-center"><i class="fa-solid fa-unlock"></i> <span>Mở khoá</span></button>
                </form>
            </div>`;
            setTimeout(() => { const i = $('w-lock-input'); if (i) i.focus(); }, 50);
        }

        async function unlock(e) {
            e.preventDefault();
            const input = $('w-lock-input');
            const btn = $('w-lock-submit');
            const error = $('w-lock-error');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang kiểm tra…</span>';
            try {
                await service.unlock(input.value);
                $('w-lock').innerHTML = '';
                render();
            } catch (err) {
                error.textContent = err.message;
                error.classList.remove('hidden');
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-unlock"></i> <span>Mở khoá</span>';
                input.select();
            }
        }

        function renderStatus() {
            const st = s.status;
            let html;
            if (!st) {
                html = '<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">AI: không xác định</span>';
            } else if (st.enabled && st.provider === 'mock') {
                html = '<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200" title="Phản hồi mẫu, không phải chấm bằng AI"><i class="fa-solid fa-flask mr-1"></i>Chế độ DEMO</span>';
            } else if (st.enabled) {
                html = `<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><i class="fa-solid fa-circle-check mr-1"></i>AI sẵn sàng${st.model ? ` • ${esc(st.model)}` : ''}</span>`;
            } else {
                html = `<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200" title="${esc(st.message || '')}"><i class="fa-solid fa-plug-circle-xmark mr-1"></i>Chưa bật chấm AI</span>`;
            }
            $('w-status').innerHTML = html;
        }

        function renderTaskList() {
            const counts = W.LEVELS.reduce((acc, l) => ({ ...acc, [l]: service.filter(l).length }), { all: service.tasks.length });
            $('w-levels').innerHTML = LEVEL_FILTERS.map(l => {
                const active = s.level === l;
                return `<button data-w-level="${l}" class="py-1.5 rounded-lg text-xs font-semibold border transition-colors ${active
                    ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}">
                    ${l === 'all' ? 'All' : l}<span class="block text-[10px] font-medium opacity-70">${counts[l]}</span></button>`;
            }).join('');

            const list = service.filter(s.level);
            $('w-task-list').innerHTML = list.length ? list.map(t => {
                const active = t.id === s.taskId;
                const best = service.bestScore(t.id);
                return `<button data-w-task="${esc(t.id)}" class="w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${active
                    ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-slate-50'}">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-semibold ${active ? 'text-blue-800' : 'text-slate-800'} truncate">${esc(t.title)}</span>
                        ${best === null ? '' : `<span class="flex-shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-${scoreTone(best)}-50 text-${scoreTone(best)}-700 tabular-nums">${fmtScore(best)}</span>`}
                    </div>
                    <div class="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <span class="font-semibold text-indigo-700">${t.level}</span>•
                        <i class="fa-solid ${TYPE_ICON[t.type]} text-[10px]"></i>${t.type === 'descriptive' ? 'Miêu tả' : 'Kể chuyện'} •
                        ~${t.targetWords} từ
                    </div>
                </button>`;
            }).join('') : '<p class="text-xs text-slate-400 px-1">Không có đề nào.</p>';
        }

        function renderSummary() {
            const sum = service.summary();
            $('w-summary').innerHTML = `
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="bg-slate-50 py-2 rounded-xl border border-slate-200/70"><span class="block font-bold text-slate-800 tabular-nums">${sum.tasksDone}/${service.tasks.length}</span><span class="text-[11px] text-slate-500">Đề đã viết</span></div>
                    <div class="bg-slate-50 py-2 rounded-xl border border-slate-200/70"><span class="block font-bold text-slate-800 tabular-nums">${sum.attempts}</span><span class="text-[11px] text-slate-500">Lần chấm</span></div>
                    <div class="bg-blue-50 py-2 rounded-xl border border-blue-100"><span class="block font-bold text-blue-600 tabular-nums">${sum.average === null ? '—' : fmtScore(sum.average)}</span><span class="text-[11px] text-blue-600">Điểm TB</span></div>
                </div>
                ${sum.attempts ? '<button data-w-clear-all class="mt-3 w-full text-[11px] font-medium text-slate-500 hover:text-rose-600"><i class="fa-regular fa-trash-can mr-1"></i>Xoá toàn bộ lịch sử Writing</button>' : ''}`;
        }

        function renderMain() {
            const t = task();
            if (!t) {
                $('w-main').innerHTML = '<div class="card p-10 text-center text-sm text-slate-500">Chọn một đề ở cột bên trái.</div>';
                $('w-feedback').innerHTML = '';
                return;
            }
            const draft = service.draft(t.id);
            $('w-main').innerHTML = `
                ${taskCard(t)}
                <div class="card p-5 sm:p-6">
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <label for="w-text" class="eyebrow">Bài viết của bạn – một đoạn văn</label>
                        <span id="w-count" class="text-xs font-semibold tabular-nums"></span>
                    </div>
                    <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3"><div id="w-count-bar" class="h-full rounded-full transition-all"></div></div>
                    <textarea id="w-text" rows="11" spellcheck="false" maxlength="${W.LIMITS.maxChars}"
                        class="field !text-[15px] leading-relaxed custom-scrollbar resize-y" placeholder="Write your paragraph here (about ${t.targetWords} words)…">${esc(draft)}</textarea>
                    <div id="w-check" class="mt-2 space-y-1"></div>
                    <div class="flex flex-wrap items-center justify-between gap-2 mt-4">
                        <p class="text-[11px] text-slate-400">Bản nháp được lưu tự động trên trình duyệt này • <kbd>Ctrl</kbd> + <kbd>Enter</kbd> để gửi</p>
                        <div class="flex gap-2">
                            <button id="w-clear" class="btn-secondary !py-2 !text-xs"><i class="fa-solid fa-eraser"></i> Xoá bài</button>
                            <button id="w-submit" class="btn-primary !py-2"><i class="fa-solid fa-wand-magic-sparkles"></i> <span>Chấm bài</span></button>
                        </div>
                    </div>
                </div>
                <div id="w-history"></div>`;
            updateCounter();
            renderFeedback();
            renderHistory();
        }

        function taskCard(t) {
            return `<div class="card p-5 sm:p-6">
                <div class="flex flex-wrap items-center gap-2 mb-3">
                    <span class="px-2 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg">${t.level}</span>
                    <span class="px-2 py-1 font-medium text-xs rounded-lg ${TYPE_STYLE[t.type]}"><i class="fa-solid ${TYPE_ICON[t.type]} mr-1"></i>${esc(W.TYPES[t.type])}</span>
                    <span class="px-2 py-1 bg-slate-100 text-slate-600 font-medium text-xs rounded-lg">~${t.targetWords} từ (${t.minWords}–${t.maxWords})</span>
                    <span class="ml-auto text-[11px] font-mono text-slate-400">${esc(t.id)}</span>
                </div>
                <h2 class="text-xl font-bold tracking-tight text-slate-900">${esc(t.title)}</h2>
                <p class="mt-2 text-[15px] text-slate-800">${esc(t.prompt)} Write about <b>${t.targetWords} words</b> in <b>one paragraph</b>.</p>
                <p class="mt-1 text-sm text-slate-500">${esc(t.promptVi)} Viết <b>một đoạn văn</b> khoảng <b>${t.targetWords} từ</b>.</p>
                <div class="mt-4">
                    <p class="eyebrow mb-2">Bài viết cần có</p>
                    <ul class="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-700">
                        ${t.requirements.map(r => `<li class="flex gap-2"><i class="fa-regular fa-square-check text-blue-600 mt-1 text-xs"></i><span>${esc(r)}</span></li>`).join('')}
                    </ul>
                </div>
                <details class="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/60">
                    <summary class="cursor-pointer px-4 py-2.5 text-sm font-semibold text-slate-700"><i class="fa-regular fa-lightbulb text-amber-500 mr-1.5"></i>Gợi ý cách viết</summary>
                    <ul class="px-4 pb-3 space-y-1.5 text-sm text-slate-600 list-disc list-inside">
                        <li>${t.type === 'descriptive'
                            ? 'Cấu trúc: câu chủ đề giới thiệu đối tượng → các câu miêu tả chi tiết (theo không gian / đặc điểm) → câu kết nêu cảm nhận.'
                            : 'Cấu trúc: câu mở đầu nêu bối cảnh (ai, khi nào, ở đâu) → các sự việc theo thứ tự thời gian → cao trào → câu kết (kết quả / cảm xúc / bài học).'}</li>
                        ${t.tips.map(x => `<li>${esc(x)}</li>`).join('')}
                    </ul>
                </details>
            </div>`;
        }

        function updateCounter() {
            const t = task();
            const area = $('w-text');
            if (!t || !area) return;
            const check = W.checkSubmission(t, area.value);
            const words = check.words;
            const inRange = words >= t.minWords && words <= t.maxWords;
            const tone = words > W.LIMITS.maxWords ? 'rose' : inRange ? 'emerald' : words ? 'amber' : 'slate';
            $('w-count').className = `text-xs font-semibold tabular-nums text-${tone}-600`;
            $('w-count').textContent = `${words} / ~${t.targetWords} từ`;
            const bar = $('w-count-bar');
            bar.style.width = `${Math.min(100, (words * 100) / t.targetWords)}%`;
            bar.className = `h-full rounded-full transition-all bg-${tone === 'slate' ? 'slate-300' : `${tone}-500`}`;
            const messages = check.error && area.value.trim() ? [check.error, ...check.warnings] : check.warnings;
            $('w-check').innerHTML = messages.map(m => `<p class="text-[11px] text-amber-700"><i class="fa-solid fa-circle-info mr-1"></i>${esc(m)}</p>`).join('');
            const st = s.status;
            const submit = $('w-submit');
            submit.disabled = s.submitting || !check.ok || !(st && st.enabled);
            submit.title = !(st && st.enabled) ? ((st && st.message) || 'Máy chủ chưa bật chấm AI.') : (check.error || '');
            submit.innerHTML = s.submitting
                ? '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang chấm…</span>'
                : '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Chấm bài</span>';
            area.readOnly = s.submitting;
        }

        function renderFeedback() {
            const box = $('w-feedback');
            if (!box) return;
            const st = s.status;
            if (!s.viewing) {
                box.innerHTML = st && !st.enabled ? `<div class="card p-5 text-sm text-slate-600 bg-amber-50/40">
                    <p class="font-semibold text-amber-800 mb-1"><i class="fa-solid fa-plug-circle-xmark mr-1"></i>Chức năng chấm bài tạm thời chưa dùng được</p>
                    <p>${esc(st.message || '')} Bạn vẫn có thể viết bài – bản nháp được lưu trên trình duyệt này; hãy báo giáo viên nếu lỗi kéo dài.</p>
                    <p class="mt-2 text-xs text-slate-500">Người quản trị: xem mục “Triển khai Writing” trong README (cấu hình <code>.env</code> khi chạy <code>npm start</code>, hoặc Cloudflare Worker + <code>js/app-config.js</code> khi đăng trên GitHub Pages).</p>
                </div>` : '';
                return;
            }
            const { text, feedback: f, createdAt } = s.viewing;
            const located = W.locateCorrections(text, f.corrections || [])
                .filter(c => c.start !== null)
                .sort((a, b) => a.start - b.start)
                .map((c, i) => ({ ...c, i, group: W.correctionGroup(c.type) }));
            const groups = {
                grammar: located.filter(c => c.group === 'grammar'),
                vocabulary: located.filter(c => c.group === 'vocabulary'),
            };
            box.innerHTML = `<div class="grid gap-6 lg:grid-cols-2 items-start">
                ${studentPane(text, f, located, groups)}
                ${botPane(f, groups, createdAt)}
            </div>`;
        }

        /** Cột trái: bài của học sinh – xem bản gốc (tô lỗi) hoặc bản đã sửa (gạch lỗi, chèn phần sửa). */
        function studentPane(text, f, located, groups) {
            const mode = s.textMode;
            const body = W.segments(text, located).map(seg => {
                if (seg.index === null) return esc(seg.text);
                const c = located[seg.index];
                const cls = `${c.group === 'vocabulary' ? ' w-v' : ''}${s.focus === c.i ? ' is-focus' : ''}`;
                const attrs = `data-w-corr="${c.i}" title="${esc(`${c.i + 1}. ${W.CORRECTION_TYPES[c.type] || c.type}: ${c.original} → ${c.corrected || '(bỏ)'}`)}"`;
                return mode === 'corrected'
                    ? `<span class="w-fix${cls}" ${attrs}><del>${esc(seg.text)}</del>${c.corrected ? `<ins>${esc(c.corrected)}</ins>` : ''}<sup>${c.i + 1}</sup></span>`
                    : `<mark class="w-err${cls}" ${attrs}>${esc(seg.text)}<sup>${c.i + 1}</sup></mark>`;
            }).join('');
            const tab = (key, label, icon) => `<button data-w-mode="${key}" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${mode === key
                ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"><i class="fa-solid ${icon} mr-1"></i>${label}</button>`;
            return `<div class="card overflow-hidden flex flex-col lg:sticky lg:top-[5.25rem] lg:max-h-[calc(100vh-6.5rem)]">
                <div class="px-5 py-3.5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <h3 class="font-semibold text-slate-900"><i class="fa-solid fa-user-pen text-blue-600 mr-1.5"></i>Bài làm của bạn</h3>
                    <div class="flex p-1 rounded-xl bg-slate-100">${tab('original', 'Bài gốc', 'fa-highlighter')}${tab('corrected', 'Bài đã sửa', 'fa-spell-check')}</div>
                </div>
                <div class="px-5 pt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span><span class="inline-block w-2.5 h-2.5 rounded-sm bg-rose-200 mr-1 align-[-1px]"></span>Ngữ pháp (${groups.grammar.length})</span>
                    <span><span class="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-200 mr-1 align-[-1px]"></span>Từ vựng (${groups.vocabulary.length})</span>
                    ${mode === 'corrected' ? '<span><del class="text-rose-600">lỗi</del> → <ins class="no-underline font-semibold text-emerald-700">sửa</ins></span>' : ''}
                    <span class="ml-auto tabular-nums">${f.wordCount} từ</span>
                </div>
                <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-5 py-4">
                    <div class="text-[15px] leading-loose text-slate-800 whitespace-pre-wrap">${body}</div>
                    ${located.length ? '' : '<p class="text-xs text-emerald-700 mt-3"><i class="fa-solid fa-check mr-1"></i>Không phát hiện lỗi cần sửa.</p>'}
                </div>
                <div class="px-5 py-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <p class="text-[11px] text-slate-400">${located.length ? 'Bấm vào chỗ được đánh dấu để xem giải thích.' : ''}</p>
                    <button data-w-use="mine" class="btn-secondary !py-1.5 !text-xs"><i class="fa-solid fa-rotate-left"></i> Sửa tiếp bài này</button>
                </div>
            </div>`;
        }

        /** Cột phải: nhận xét và bài sửa của AI, theo 5 mục. */
        function botPane(f, groups, createdAt) {
            const tone = scoreTone(f.score);
            const demo = f.meta && f.meta.demo;
            const sug = f.suggestions || { grammar: [], vocabulary: [] };
            const sections = [
                ['overview', 'Tổng quan 4 tiêu chí'],
                ['grammar', `Lỗi ngữ pháp & sửa sai (${groups.grammar.length})`],
                ['vocabulary', `Lỗi từ vựng & sửa sai (${groups.vocabulary.length})`],
                ['tips', 'Ngữ pháp & từ vựng gợi ý'],
                ['final', 'Bài sửa hoàn chỉnh'],
            ];
            const head = id => {
                const n = sections.findIndex(x => x[0] === id);
                return `<h4 class="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                    <span class="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs flex items-center justify-center">${n + 1}</span>${esc(sections[n][1])}</h4>`;
            };
            const section = (id, content) => `<section id="w-sec-${id}" class="scroll-mt-24${id === 'overview' ? '' : ' border-t border-slate-200/70 pt-5'}">${head(id)}${content}</section>`;

            return `<div class="card overflow-hidden">
                <div class="px-5 py-3.5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <h3 class="font-semibold text-slate-900"><i class="fa-solid fa-robot text-blue-600 mr-1.5"></i>Nhận xét & bài sửa của AI</h3>
                    <span class="text-[11px] text-slate-400">${fmtDate(createdAt)}${f.meta && f.meta.model ? ` • ${esc(f.meta.model)}` : ''}</span>
                </div>
                <nav class="px-5 pt-3 flex flex-wrap gap-1.5">${sections.map(([id, title], n) => `<button data-w-jump="w-sec-${id}"
                    class="text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">${n + 1}. ${esc(title.replace(/ \(\d+\)$/, ''))}</button>`).join('')}</nav>
                <div class="p-5 flex flex-col gap-5">
                    ${demo ? '<p class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3"><i class="fa-solid fa-flask mr-1"></i><b>DEMO:</b> phản hồi tạo bằng quy tắc đơn giản để thử giao diện, không phải chấm bằng AI.</p>' : ''}
                    ${section('overview', `
                        <div class="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)] items-start">
                            <div class="text-center rounded-2xl bg-${tone}-50 border border-${tone}-100 py-3">
                                <span class="eyebrow">Điểm tổng</span>
                                <span class="block font-extrabold text-3xl text-${tone}-600 tabular-nums mt-1">${fmtScore(f.score)}<span class="text-base text-slate-400">/${f.maxScore}</span></span>
                                <span class="text-[11px] text-slate-500">${f.wordCount} từ</span>
                            </div>
                            <div class="space-y-3">${W.CRITERIA.map(c => criterionRow(c, f.criteria[c.key], f)).join('')}</div>
                        </div>
                        ${f.summary ? `<p class="mt-4 text-sm text-slate-700 leading-relaxed">${esc(f.summary)}</p>` : ''}
                        ${f.lengthCapped ? `<p class="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3"><i class="fa-solid fa-ruler-horizontal mr-1"></i>Đoạn văn có ${f.wordCount} từ, chưa đạt yêu cầu khoảng ${f.targetWords} từ nên điểm "Hoàn thành yêu cầu" bị giới hạn tối đa ${f.lengthCap}/${f.maxScore}.</p>` : ''}
                        ${f.strengths.length ? `<div class="mt-3">${listBlock('Điểm tốt', 'fa-thumbs-up', 'emerald', f.strengths)}</div>` : ''}`)}
                    ${section('grammar', correctionList(groups.grammar, 'grammar'))}
                    ${section('vocabulary', correctionList(groups.vocabulary, 'vocabulary'))}
                    ${section('tips', tipsBlock(sug, f.improvements))}
                    ${section('final', f.correctedText ? `
                        <div class="text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">${esc(f.correctedText)}</div>
                        <div class="flex flex-wrap items-center justify-between gap-2 mt-2">
                            <p class="text-[11px] text-slate-400">${W.countWords(f.correctedText)} từ • giữ nguyên ý của bạn, chỉ sửa lỗi</p>
                            <button data-w-use="corrected" class="btn-secondary !py-1.5 !text-xs"><i class="fa-solid fa-pen"></i> Viết lại từ bài sửa</button>
                        </div>` : '<p class="text-sm text-slate-500">AI chưa trả về bài sửa hoàn chỉnh – xem chế độ "Bài đã sửa" ở cột bên trái.</p>')}
                    ${f.modelAnswer ? `<details class="rounded-xl border border-indigo-100 bg-indigo-50/30">
                        <summary class="cursor-pointer px-4 py-2.5 text-sm font-semibold text-slate-700"><i class="fa-solid fa-feather-pointed text-indigo-600 mr-1.5"></i>Bài viết tham khảo (${f.modelAnswerWords} từ)</summary>
                        <div class="px-4 pb-4">
                            <p class="text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">${esc(f.modelAnswer)}</p>
                            <p class="text-[11px] text-slate-400 mt-2">Do AI viết mới${f.modelAnswerInRange ? '' : ' (độ dài chưa đúng yêu cầu)'} – để tham khảo cách diễn đạt, không phải đáp án duy nhất.</p>
                        </div>
                    </details>` : ''}
                    ${f.meta && f.meta.unmatchedCorrections ? `<p class="text-[11px] text-slate-400">Đã bỏ ${f.meta.unmatchedCorrections} góp ý của AI vì không khớp nguyên văn với bài viết.</p>` : ''}
                    <p class="text-[11px] text-slate-400 leading-relaxed border-t border-slate-200/70 pt-3">
                        Điểm do AI ước lượng theo thang tham khảo của ứng dụng (4 tiêu chí, mỗi tiêu chí 0–10; điểm tổng là trung bình). Đây không phải tiêu chí hay điểm chính thức của học phần ENT104.
                        AI có thể chấm hoặc sửa chưa chính xác – hãy hỏi giáo viên khi chưa chắc chắn.
                    </p>
                </div>
            </div>`;
        }

        function correctionList(list, group) {
            if (!list.length) {
                return `<p class="text-sm text-emerald-700"><i class="fa-solid fa-check mr-1"></i>Không phát hiện ${group === 'grammar' ? 'lỗi ngữ pháp' : 'lỗi từ vựng'} đáng kể.</p>`;
            }
            const badge = group === 'vocabulary' ? 'bg-indigo-600' : 'bg-rose-600';
            return `<ol class="space-y-2">${list.map(c => `<li id="w-corr-${c.i}" data-w-corr="${c.i}" class="w-item${s.focus === c.i ? ' is-focus' : ''} cursor-pointer rounded-xl border border-slate-200/70 px-4 py-3 text-sm transition-colors hover:bg-slate-50">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="w-5 h-5 rounded-full ${badge} text-white text-[10px] font-bold flex items-center justify-center">${c.i + 1}</span>
                    <span class="text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${CORRECTION_STYLE[c.type] || CORRECTION_STYLE.style}">${esc(W.CORRECTION_TYPES[c.type] || c.type)}</span>
                    <del class="text-rose-600">${esc(c.original)}</del><i class="fa-solid fa-arrow-right text-[10px] text-slate-400"></i><ins class="no-underline font-semibold text-emerald-700">${esc(c.corrected || '(bỏ)')}</ins>
                </div>
                <p class="mt-1.5 text-slate-600">${esc(c.explanation)}</p>
            </li>`).join('')}</ol>`;
        }

        function tipsBlock(sug, improvements) {
            const grammar = sug.grammar.length ? `<ul class="space-y-2">${sug.grammar.map(g => `<li class="rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm">
                    <p class="font-semibold text-slate-900">${esc(g.point)}</p>
                    ${g.example ? `<p class="mt-1 italic text-slate-700">“${esc(g.example)}”</p>` : ''}
                    ${g.note ? `<p class="mt-1 text-xs text-slate-500">${esc(g.note)}</p>` : ''}
                </li>`).join('')}</ul>` : '';
            const vocabulary = sug.vocabulary.length ? `<div class="grid sm:grid-cols-2 gap-2">${sug.vocabulary.map(v => `<div class="rounded-xl border border-indigo-100 bg-indigo-50/40 px-3 py-2.5 text-sm">
                    <p><b class="text-indigo-700">${esc(v.item)}</b>${v.meaning ? ` <span class="text-slate-600">– ${esc(v.meaning)}</span>` : ''}</p>
                    ${v.example ? `<p class="mt-1 text-xs italic text-slate-500">“${esc(v.example)}”</p>` : ''}
                </div>`).join('')}</div>` : '';
            return `<div class="flex flex-col gap-4">
                ${improvements.length ? listBlock('Cần cải thiện', 'fa-arrow-trend-up', 'amber', improvements) : ''}
                ${grammar ? `<div><p class="eyebrow mb-2"><i class="fa-solid fa-language text-rose-600 mr-1"></i>Cấu trúc ngữ pháp nên dùng</p>${grammar}</div>` : ''}
                ${vocabulary ? `<div><p class="eyebrow mb-2"><i class="fa-solid fa-book-open text-indigo-600 mr-1"></i>Từ vựng nên dùng</p>${vocabulary}</div>` : ''}
                ${grammar || vocabulary ? '' : '<p class="text-xs text-slate-500">Lần chấm này chưa có gợi ý ngữ pháp & từ vựng – chấm lại bài để nhận gợi ý.</p>'}
            </div>`;
        }

        function criterionRow(c, v, f) {
            const tone = scoreTone(v.score);
            const capped = c.key === 'task' && f.lengthCapped;
            return `<div>
                <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-semibold text-slate-700">${esc(c.label)} <span class="font-normal text-slate-400">(${esc(c.en)})</span>${capped ? ' <i class="fa-solid fa-ruler-horizontal text-amber-600" title="Bị giới hạn do thiếu độ dài"></i>' : ''}</span>
                    <span class="font-bold text-${tone}-600 tabular-nums">${v.score}/${f.maxScore}</span>
                </div>
                <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full bg-${tone}-500" style="width:${v.score * 10}%"></div></div>
                ${v.comment ? `<p class="text-xs text-slate-500 mt-1">${esc(v.comment)}</p>` : ''}
            </div>`;
        }

        function listBlock(title, icon, tone, items) {
            if (!items.length) return '<div></div>';
            return `<div class="rounded-xl border border-${tone}-100 bg-${tone}-50/50 p-4">
                <p class="text-xs font-bold text-${tone}-700 mb-2"><i class="fa-solid ${icon} mr-1"></i>${title}</p>
                <ul class="space-y-1.5 text-sm text-slate-700 list-disc list-inside">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
            </div>`;
        }

        function renderHistory() {
            const box = $('w-history');
            if (!box) return;
            const list = service.attempts(s.taskId);
            if (!list.length) {
                box.innerHTML = '';
                return;
            }
            box.innerHTML = `<div class="card p-5">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="eyebrow">Các lần chấm đề này (${list.length})</h3>
                    <button data-w-clear-task class="text-[11px] font-medium text-slate-500 hover:text-rose-600"><i class="fa-regular fa-trash-can mr-1"></i>Xoá</button>
                </div>
                <div class="divide-y divide-slate-100">${list.map(a => {
                    const active = s.viewing && s.viewing.id === a.id;
                    const tone = scoreTone(a.feedback.score);
                    return `<button data-w-attempt="${esc(a.id)}" class="w-full flex items-center justify-between gap-3 py-2 px-2 rounded-lg text-left text-xs ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}">
                        <span class="text-slate-600">${fmtDate(a.createdAt)} • ${a.feedback.wordCount} từ${a.feedback.meta && a.feedback.meta.demo ? ' • <span class="text-amber-700">demo</span>' : ''}</span>
                        <span class="font-bold text-${tone}-600 tabular-nums">${fmtScore(a.feedback.score)}/${a.feedback.maxScore}</span>
                    </button>`;
                }).join('')}</div>
                <p class="text-[11px] text-slate-400 mt-2">Lưu tối đa 5 lần gần nhất cho mỗi đề, chỉ trên trình duyệt này.</p>
            </div>`;
        }

        // ------------------------------------------------------------ actions

        function selectTask(id) {
            if (!service.byId.has(id) || id === s.taskId) return;
            saveDraftNow();
            s.taskId = id;
            s.viewing = service.attempts(id)[0] || null;
            s.focus = null;
            service.ui({ taskId: id });
            render();
            if (window.innerWidth < 1024) $('w-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function saveDraftNow() {
            clearTimeout(draftTimer);
            const area = $('w-text');
            if (area && s.taskId) service.saveDraft(s.taskId, area.value);
        }

        async function submit() {
            const t = task();
            const area = $('w-text');
            if (!t || !area || s.submitting) return;
            const text = area.value.trim();
            const check = W.checkSubmission(t, text);
            if (!check.ok) return flash(check.error);
            if (check.words < t.minWords
                && !confirm(`Đoạn văn mới có ${check.words} từ (yêu cầu khoảng ${t.targetWords} từ). Điểm "Hoàn thành yêu cầu" sẽ bị giới hạn tối đa ${W.lengthCap(t, check.words)}/10. Vẫn gửi chấm?`)) return;
            saveDraftNow();
            s.submitting = true;
            $('w-flash').classList.add('hidden');
            updateCounter();
            try {
                const feedback = await service.requestFeedback(t.id, text);
                const attempt = service.addAttempt(t.id, text, feedback);
                if (s.taskId === t.id) {
                    s.viewing = attempt;
                    s.focus = null;
                }
                s.submitting = false;
                render();
                const box = $('w-feedback');
                if (box && s.taskId === t.id) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) {
                s.submitting = false;
                if (e.locked) {
                    saveDraftNow();
                    render();
                    const error = $('w-lock-error');
                    if (error) {
                        error.textContent = 'Mật khẩu đã thay đổi – hãy nhập lại (bài đang viết vẫn được lưu).';
                        error.classList.remove('hidden');
                    }
                    return;
                }
                updateCounter();
                flash(e.message);
                if (/chưa được bật|not_configured/.test(e.message)) {
                    s.status = await service.status();
                    render();
                }
            }
        }

        /** Đánh dấu lỗi i ở cả hai cột (không vẽ lại để giữ vị trí cuộn) và cuộn tới cột còn lại. */
        function focusCorrection(i, scroll) {
            s.focus = i;
            document.querySelectorAll('#w-feedback [data-w-corr]').forEach(el => el.classList.toggle('is-focus', Number(el.dataset.wCorr) === i));
            const target = scroll === 'list' ? $(`w-corr-${i}`) : document.querySelector(`#w-feedback :is(mark, .w-fix)[data-w-corr="${i}"]`);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function bind() {
            if (bound) return;
            bound = true;
            $('w-lock').addEventListener('submit', unlock);
            $('w-levels').addEventListener('click', e => {
                const btn = e.target.closest('[data-w-level]');
                if (!btn) return;
                s.level = btn.dataset.wLevel;
                service.ui({ level: s.level });
                renderTaskList();
            });
            $('w-task-list').addEventListener('click', e => {
                const btn = e.target.closest('[data-w-task]');
                if (btn) selectTask(btn.dataset.wTask);
            });
            $('w-summary').addEventListener('click', e => {
                if (!e.target.closest('[data-w-clear-all]')) return;
                if (!confirm('Xoá toàn bộ lịch sử chấm Writing (không xoá bản nháp)?')) return;
                service.clearHistory();
                s.viewing = null;
                render();
            });
            const main = $('w-main');
            main.addEventListener('input', e => {
                if (e.target.id !== 'w-text') return;
                updateCounter();
                clearTimeout(draftTimer);
                draftTimer = setTimeout(saveDraftNow, 400);
            });
            main.addEventListener('keydown', e => {
                if (e.target.id === 'w-text' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    submit();
                }
            });
            const onClick = e => {
                if (e.target.closest('#w-submit')) return submit();
                if (e.target.closest('#w-clear')) {
                    const area = $('w-text');
                    if (area.value.trim() && !confirm('Xoá toàn bộ nội dung đang viết?')) return;
                    area.value = '';
                    saveDraftNow();
                    updateCounter();
                    return area.focus();
                }
                const mode = e.target.closest('[data-w-mode]');
                if (mode) {
                    s.textMode = mode.dataset.wMode;
                    return renderFeedback();
                }
                const jump = e.target.closest('[data-w-jump]');
                if (jump) {
                    const target = $(jump.dataset.wJump);
                    return target && target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                const corr = e.target.closest('[data-w-corr]');
                if (corr) return focusCorrection(Number(corr.dataset.wCorr), corr.classList.contains('w-item') ? 'mark' : 'list');
                const use = e.target.closest('[data-w-use]');
                if (use && s.viewing) {
                    const area = $('w-text');
                    const text = use.dataset.wUse === 'corrected' ? s.viewing.feedback.correctedText : s.viewing.text;
                    if (area.value.trim() && area.value.trim() !== text.trim() && !confirm('Thay nội dung đang viết bằng bài này?')) return;
                    area.value = text;
                    saveDraftNow();
                    updateCounter();
                    area.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return area.focus({ preventScroll: true });
                }
                const attempt = e.target.closest('[data-w-attempt]');
                if (attempt) {
                    s.viewing = service.attempts(s.taskId).find(a => a.id === attempt.dataset.wAttempt) || null;
                    s.focus = null;
                    renderFeedback();
                    renderHistory();
                    return;
                }
                if (e.target.closest('[data-w-clear-task]') && confirm('Xoá lịch sử chấm của đề này?')) {
                    service.clearHistory(s.taskId);
                    s.viewing = null;
                    render();
                }
            };
            main.addEventListener('click', onClick);
            $('w-feedback').addEventListener('click', onClick);
            global.addEventListener('beforeunload', saveDraftNow);
        }

        return { render, saveDraft: saveDraftNow };
    }

    global.WritingView = { create };
})(typeof window !== 'undefined' ? window : globalThis);
