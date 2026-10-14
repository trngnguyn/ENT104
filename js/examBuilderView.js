/**
 * Giao diện Exam Builder: cấu hình đề, kiểm tra đủ câu, xem trước, thêm / xoá / thay câu,
 * lưu – mở – nhân bản – xoá đề đã soạn. Mọi xử lý dữ liệu nằm trong ExamBuilderService.
 */
(function (global) {
    'use strict';

    const { SKILLS, TYPE_LABELS, stripHtml } = global.QuestionService;
    const B = global.ExamBuilderService;
    const DRAFT_KEY = 'ent104.builderDraft.v1';
    const PAGE_SIZE = 30;
    const LETTERS = ['A', 'B', 'C', 'D'];
    const LEVEL_LABELS = { A1: 'A1', A2: 'A2', 'A1-A2': 'A1–A2 (kết hợp)', B1: 'B1' };
    const DIM_LABELS = {
        none: 'Không phân bổ – chọn ngẫu nhiên trong các câu phù hợp',
        skill: 'Theo kỹ năng / chủ đề lớn',
        type: 'Theo loại câu hỏi',
        category: 'Theo chủ đề chi tiết',
    };
    const DIFFICULTY_STYLE = {
        easy: 'bg-emerald-50 text-emerald-700',
        medium: 'bg-amber-50 text-amber-700',
        hard: 'bg-rose-50 text-rose-700',
    };

    const $ = id => document.getElementById(id);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const skillLabel = key => ((SKILLS.find(s => s.key === key) || {}).label || key);
    const snippet = (q, n = 120) => {
        const text = stripHtml(q.question).replace(/\s+/g, ' ').trim();
        return text.length > n ? `${text.slice(0, n - 1)}…` : text;
    };
    const countBy = (list, fn) => list.reduce((acc, x) => {
        const k = fn(x);
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {});
    const fmtDate = ts => new Date(ts).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

    function create({ qs, builder, quiz, onStart }) {
        const store = global.AppStorage;
        const s = {
            config: builder.defaultConfig(),
            ids: [],
            paperId: null,
            dirty: false,
            expanded: new Set(),
            browser: { query: '', skill: 'all', level: 'all', category: 'all', onlyMatch: false, limit: PAGE_SIZE },
            lastCheck: null,
        };
        let bound = false;
        let flashTimer = null;

        const draft = store.get(DRAFT_KEY, null);
        if (draft && draft.config) {
            s.config = builder.normalizeConfig(draft.config);
            s.ids = builder.orderPaper(Array.isArray(draft.ids) ? draft.ids : []);
            s.paperId = draft.paperId && builder.getPaper(draft.paperId) ? draft.paperId : null;
            s.dirty = !!draft.dirty;
        }

        function persist() {
            store.set(DRAFT_KEY, { config: s.config, ids: s.ids, paperId: s.paperId, dirty: s.dirty });
        }

        function changed() {
            s.dirty = true;
            persist();
        }

        function flash(message, type = 'info') {
            const el = $('builder-flash');
            const tone = {
                success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                error: 'bg-rose-50 border-rose-200 text-rose-800',
                info: 'bg-blue-50 border-blue-200 text-blue-800',
            }[type];
            el.className = `mb-4 text-sm rounded-xl border px-4 py-3 ${tone}`;
            el.textContent = message;
            clearTimeout(flashTimer);
            flashTimer = setTimeout(() => el.classList.add('hidden'), 6000);
        }

        // ------------------------------------------------------------ render

        function render() {
            if (!bound) bind();
            renderSaved();
            renderConfig();
            renderDynamic();
        }

        function renderDynamic() {
            renderCheck();
            renderPaper();
            renderResults();
        }

        function renderSaved() {
            const papers = builder.listPapers();
            if (!papers.length) {
                $('builder-saved').innerHTML = '<p class="text-xs text-slate-500">Chưa có đề nào được lưu.</p>';
                return;
            }
            $('builder-saved').innerHTML = `<ul class="flex flex-col gap-2">${papers.map(p => {
                const runs = quiz.history.filter(h => h.paperId === p.id);
                const missing = builder.resolvePaper(p).missing.length;
                const active = p.id === s.paperId;
                return `<li class="border rounded-xl p-3 ${active ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200'}">
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                            <p class="text-sm font-semibold text-slate-800 truncate">${esc(p.name)}</p>
                            <p class="text-[11px] text-slate-500">${p.questionIds.length} câu • ${p.config.timeLimit ? `${p.config.timeLimit} phút` : 'không giới hạn'} • sửa ${fmtDate(p.updatedAt)}</p>
                            <p class="text-[11px] text-slate-400">Kết quả: ${runs.length ? `đã làm ${runs.length} lần, gần nhất ${runs[0].score}%` : 'chưa làm lần nào'}</p>
                            ${missing ? `<p class="text-[11px] text-rose-600">${missing} câu không còn trong ngân hàng.</p>` : ''}
                        </div>
                        ${active ? '<span class="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">Đang mở</span>' : ''}
                    </div>
                    <div class="flex flex-wrap gap-1.5 mt-2 text-[11px] font-semibold">
                        <button data-paper-open="${esc(p.id)}" class="px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"><i class="fa-solid fa-pen mr-1"></i>Mở / sửa</button>
                        <button data-paper-start="${esc(p.id)}" class="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"><i class="fa-solid fa-play mr-1"></i>Làm bài</button>
                        <button data-paper-dup="${esc(p.id)}" class="px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"><i class="fa-regular fa-copy mr-1"></i>Nhân bản</button>
                        <button data-paper-del="${esc(p.id)}" class="px-2 py-1 rounded-md bg-slate-100 text-rose-700 hover:bg-rose-50"><i class="fa-regular fa-trash-can mr-1"></i>Xoá</button>
                    </div>
                </li>`;
            }).join('')}</ul>`;
        }

        function checkbox(list, value, label, count, checked) {
            return `<label class="flex items-center gap-2 text-xs text-slate-700 py-0.5 cursor-pointer">
                <input type="checkbox" data-list="${list}" value="${esc(value)}" ${checked ? 'checked' : ''} class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                <span class="flex-1">${esc(label)}</span>
                ${count === null ? '' : `<span class="text-[11px] text-slate-400">${count}</span>`}
            </label>`;
        }

        const field = (label, html, hint = '') => `<div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">${label}</span>
            ${html}
            ${hint ? `<p class="text-[11px] text-slate-400 mt-1">${hint}</p>` : ''}
        </div>`;

        const inputCls = 'w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

        function renderConfig() {
            const c = s.config;
            const bankLevels = countBy(qs.questions, q => q.level);
            const bankDiffs = countBy(qs.questions, q => q.difficulty);
            const bankTypes = countBy(qs.questions, q => q.type);
            const filtered = qs.questions.filter(q => c.levels.includes(q.level) && c.difficulties.includes(q.difficulty) && c.types.includes(q.type));
            const topicCounts = countBy(filtered, B.topicKey);

            const topicTree = SKILLS.map(sk => {
                const cats = qs.categories(sk.key);
                const keys = cats.map(cat => `${sk.key}::${cat}`);
                const selected = keys.filter(k => c.topics.includes(k));
                const available = selected.reduce((sum, k) => sum + (topicCounts[k] || 0), 0);
                const open = s.expanded.has(sk.key);
                return `<div class="py-1">
                    <div class="flex items-center gap-2 text-xs">
                        <input type="checkbox" data-skill-toggle="${sk.key}" ${selected.length === keys.length ? 'checked' : ''}
                            ${selected.length && selected.length < keys.length ? 'data-indeterminate="1"' : ''} class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                        <button data-expand="${sk.key}" class="flex-1 flex items-center gap-1.5 text-left font-semibold text-slate-700">
                            <i class="fa-solid ${open ? 'fa-chevron-down' : 'fa-chevron-right'} text-[10px] text-slate-400 w-3"></i>${esc(sk.label)}
                        </button>
                        <span class="text-[11px] text-slate-400">${selected.length}/${keys.length} chủ đề • ${available} câu</span>
                    </div>
                    ${open ? `<div class="pl-8 pt-1">${cats.map(cat => {
                        const key = `${sk.key}::${cat}`;
                        return checkbox('topics', key, cat, topicCounts[key] || 0, c.topics.includes(key));
                    }).join('')}</div>` : ''}
                </div>`;
            }).join('');

            const random = c.mode === 'random';
            $('builder-config').innerHTML = `<div class="flex flex-col gap-4">
                ${field('Tên đề', `<input data-field="name" type="text" maxlength="120" value="${esc(c.name)}" placeholder="Ví dụ: Đề ôn tập B1 số 1" class="${inputCls}">`)}
                ${field('Cách chọn câu hỏi', `<div class="grid grid-cols-2 gap-2 text-xs font-semibold">
                    ${[['random', 'Ngẫu nhiên theo tiêu chí'], ['manual', 'Chọn thủ công']].map(([v, l]) => `
                    <label class="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${c.mode === v ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600'}">
                        <input type="radio" name="b-mode" data-field="mode" value="${v}" ${c.mode === v ? 'checked' : ''}> ${l}
                    </label>`).join('')}
                </div>`, random ? '' : 'Thêm câu từ khung “Ngân hàng câu hỏi” bên phải. Các tiêu chí bên dưới dùng để lọc và đối chiếu.')}
                <div class="grid grid-cols-2 gap-3">
                    ${field(random ? 'Số câu hỏi' : 'Số câu dự kiến', `<input data-field="total" type="number" min="1" max="${qs.questions.length}" value="${c.total}" class="${inputCls}">`)}
                    ${field('Thời gian (phút)', `<input data-field="timeLimit" type="number" min="0" max="300" value="${c.timeLimit}" class="${inputCls}">`, '0 = không giới hạn')}
                </div>
                ${field('Trình độ', B.LEVELS.map(l => checkbox('levels', l, LEVEL_LABELS[l], bankLevels[l] || 0, c.levels.includes(l))).join(''))}
                ${field('Độ khó', B.DIFFICULTIES.map(d => checkbox('difficulties', d, B.DIFFICULTY_LABELS[d], bankDiffs[d] || 0, c.difficulties.includes(d))).join(''))}
                ${field('Loại câu hỏi', B.TYPES.map(t => checkbox('types', t, TYPE_LABELS[t], bankTypes[t] || 0, c.types.includes(t))).join(''))}
                ${field('Chủ đề', `<div class="flex gap-3 mb-1 text-[11px] font-semibold">
                        <button data-topics="all" class="text-blue-600 hover:underline">Chọn tất cả</button>
                        <button data-topics="none" class="text-slate-500 hover:underline">Bỏ chọn tất cả</button>
                    </div>
                    <div class="border border-slate-100 rounded-lg px-2 py-1 max-h-72 overflow-y-auto custom-scrollbar">${topicTree}</div>`,
                    'Số câu bên cạnh mỗi chủ đề đã tính theo trình độ, độ khó và loại câu đang chọn. “Ordering & Writing” và “Completion & Error” là nhóm “khác”.')}
                ${random ? field('Phân bổ số câu', `<select data-field="quotaBy" class="${inputCls}">
                    ${B.DIMENSIONS.map(d => `<option value="${d}" ${c.quotaBy === d ? 'selected' : ''}>${DIM_LABELS[d]}</option>`).join('')}
                </select><div id="b-quotas" class="mt-2"></div>`) : ''}
                <div id="b-check"></div>
                ${random ? `<button id="b-generate" class="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed">
                    <i class="fa-solid fa-shuffle mr-1"></i> Tạo đề ngẫu nhiên</button>` : ''}
            </div>`;
            $('builder-config').querySelectorAll('[data-indeterminate]').forEach(el => { el.indeterminate = true; });
            if (random) renderQuotas();
        }

        function renderQuotas() {
            const box = $('b-quotas');
            if (!box) return;
            const c = s.config;
            if (c.quotaBy === 'none') {
                box.innerHTML = '';
                return;
            }
            const groups = builder.groups(c);
            box.innerHTML = `<div class="border border-slate-100 rounded-lg divide-y divide-slate-100 max-h-72 overflow-y-auto custom-scrollbar">
                ${groups.map(g => `<div data-quota-row="${esc(g.key)}" class="flex items-center gap-2 px-2 py-1.5 text-xs">
                    <span class="flex-1 min-w-0 truncate text-slate-700" title="${esc(g.label)}">${esc(g.label)}</span>
                    <span data-avail class="text-[11px] whitespace-nowrap">có ${g.available}</span>
                    <input data-quota="${esc(g.key)}" type="number" min="0" max="${g.available}" value="${g.quota || ''}" placeholder="0"
                        class="w-16 text-xs text-right bg-slate-50 border border-slate-200 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>`).join('')}
            </div>
            <p id="b-quota-sum" class="text-[11px] mt-1"></p>`;
            updateQuotaStatus();
        }

        function updateQuotaStatus() {
            const c = s.config;
            if (c.mode !== 'random' || c.quotaBy === 'none' || !$('b-quota-sum')) return;
            const groups = builder.groups(c);
            let sum = 0;
            for (const g of groups) {
                sum += g.quota;
                const row = document.querySelector(`[data-quota-row="${CSS.escape(g.key)}"] [data-avail]`);
                if (row) row.className = `text-[11px] whitespace-nowrap ${g.quota > g.available ? 'text-rose-600 font-semibold' : 'text-slate-400'}`;
            }
            const ok = sum === c.total;
            $('b-quota-sum').className = `text-[11px] mt-1 ${ok ? 'text-emerald-700' : 'text-rose-600'}`;
            $('b-quota-sum').textContent = `Tổng đã phân bổ: ${sum}/${c.total} câu${ok ? ' ✓' : ''}`;
        }

        function renderCheck() {
            const box = $('b-check');
            if (!box) return;
            const check = builder.check(s.config);
            s.lastCheck = check;
            const random = s.config.mode === 'random';
            const parts = [`<p class="text-xs text-slate-600"><i class="fa-solid fa-database mr-1 text-slate-400"></i>Có <b>${check.pool}</b> câu phù hợp các tiêu chí đã chọn.</p>`];
            check.errors.forEach((err, i) => {
                parts.push(`<div class="text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-2.5">
                    <p><i class="fa-solid fa-triangle-exclamation mr-1"></i>${esc(err.message)}</p>
                    ${err.suggestions.length ? `<p class="mt-1.5 text-[11px] text-rose-700">Gợi ý điều chỉnh (chỉ áp dụng khi bạn bấm chọn):</p>
                    <div class="flex flex-wrap gap-1.5 mt-1">${err.suggestions.map((sg, j) => `
                        <button data-suggest="${i}:${j}" class="text-[11px] font-semibold px-2 py-1 rounded-md bg-white border border-rose-200 hover:bg-rose-100">${esc(sg.label)}</button>`).join('')}
                    </div>` : ''}
                </div>`);
            });
            check.warnings.forEach(w => parts.push(`<p class="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5"><i class="fa-solid fa-circle-info mr-1"></i>${esc(w.message)}</p>`));
            if (random && check.ok) parts.push('<p class="text-xs text-emerald-700"><i class="fa-solid fa-circle-check mr-1"></i>Cấu hình hợp lệ – có thể tạo đề.</p>');
            box.innerHTML = `<div class="flex flex-col gap-2">${parts.join('')}</div>`;
            const gen = $('b-generate');
            if (gen) gen.disabled = !check.ok;
        }

        function chips(counts, labelOf, order = null) {
            const keys = order ? order.filter(k => counts[k]) : Object.keys(counts);
            return keys.map(k => `<span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">${esc(labelOf(k))}: <b>${counts[k]}</b></span>`).join('');
        }

        function questionDetail(q) {
            const passage = qs.passageOf(q);
            return `<div class="px-3 pb-3 pt-1 text-xs text-slate-700 space-y-2">
                ${passage ? `<p class="text-[11px] text-sky-800"><i class="fa-solid fa-book-open mr-1"></i>Bài đọc: ${esc(passage.title)}</p>` : ''}
                <div class="question-html font-medium">${q.question}</div>
                <ul class="space-y-0.5">${q.options.map((o, i) => `<li class="${i === q.answer ? 'text-emerald-700 font-semibold' : ''}">${LETTERS[i]}. ${esc(o)}${i === q.answer ? ' ✓' : ''}</li>`).join('')}</ul>
                <p class="text-slate-500">${esc(q.explanation)}</p>
            </div>`;
        }

        function badgeRow(q) {
            return `<span class="font-mono text-[10px] text-slate-400">${q.id}</span>
                <span class="text-[10px] px-1.5 rounded bg-indigo-50 text-indigo-700 font-semibold">${q.level}</span>
                <span class="text-[10px] px-1.5 rounded ${DIFFICULTY_STYLE[q.difficulty] || ''}">${B.DIFFICULTY_LABELS[q.difficulty] || q.difficulty}</span>
                <span class="text-[10px] text-slate-500">${esc(skillLabel(q.skill))} › ${esc(q.category)}</span>`;
        }

        function renderPaper() {
            const c = s.config;
            const list = s.ids.map(id => qs.byId.get(id)).filter(Boolean);
            const comp = builder.composition(s.ids);
            const warnings = list.length ? builder.paperWarnings(s.ids, c) : [];
            const status = s.paperId
                ? (s.dirty ? '<span class="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Đề đã lưu – có thay đổi chưa lưu</span>'
                    : '<span class="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Đề đã lưu</span>')
                : '<span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">Bản nháp chưa lưu</span>';

            let rows = '';
            let lastSkill = null;
            let lastPassage = null;
            list.forEach((q, i) => {
                if (q.skill !== lastSkill) {
                    rows += `<li class="pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">${esc(skillLabel(q.skill))} (${comp.bySkill[q.skill]})</li>`;
                    lastSkill = q.skill;
                    lastPassage = null;
                }
                if (q.passageId && q.passageId !== lastPassage) {
                    const p = qs.passageOf(q);
                    const inPaper = list.filter(x => x.passageId === q.passageId).length;
                    const inBank = builder.byPassage.get(q.passageId).length;
                    rows += `<li class="flex items-center justify-between gap-2 text-xs font-semibold text-sky-800 bg-sky-50 rounded-lg px-3 py-1.5 mt-1">
                        <span><i class="fa-solid fa-book-open mr-1"></i>Bài đọc: ${esc(p.title)} — ${inPaper}/${inBank} câu</span>
                        ${inPaper < inBank ? `<button data-add-passage="${esc(q.passageId)}" class="text-[11px] text-sky-700 hover:underline">+ thêm các câu còn lại</button>` : ''}
                    </li>`;
                }
                lastPassage = q.passageId || null;
                rows += `<li><details class="border border-slate-200 rounded-lg mt-1">
                    <summary class="flex items-start gap-2 p-2.5 cursor-pointer list-none">
                        <span class="w-7 text-xs font-bold text-slate-500 text-right">${i + 1}.</span>
                        <span class="flex-1 min-w-0">
                            <span class="flex flex-wrap items-center gap-1.5">${badgeRow(q)}</span>
                            <span class="block text-xs text-slate-700 mt-0.5 truncate">${esc(snippet(q))}</span>
                        </span>
                        <button data-replace="${q.id}" title="Thay bằng câu khác cùng kỹ năng" class="text-[11px] font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"><i class="fa-solid fa-arrows-rotate"></i><span class="hidden sm:inline ml-1">Thay</span></button>
                        <button data-remove="${q.id}" title="Xoá khỏi đề" class="text-[11px] font-semibold px-2 py-1 rounded-md bg-slate-100 text-rose-700 hover:bg-rose-50"><i class="fa-solid fa-xmark"></i><span class="hidden sm:inline ml-1">Xoá</span></button>
                    </summary>
                    ${questionDetail(q)}
                </details></li>`;
            });

            $('builder-paper').innerHTML = `
                <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div class="min-w-0">
                        <h3 class="text-base font-bold text-slate-900 truncate">${esc(c.name.trim() || 'Đề chưa đặt tên')}</h3>
                        <p class="text-xs text-slate-500 mt-0.5"><b class="text-slate-800">${list.length}</b> câu${c.total ? ` (mục tiêu ${c.total})` : ''} • ${c.timeLimit ? `${c.timeLimit} phút` : 'không giới hạn thời gian'} • ${comp.passages} bài đọc</p>
                    </div>
                    ${status}
                </div>
                ${list.length ? `<div class="flex flex-col gap-1.5 mb-3">
                    <div class="flex flex-wrap gap-1">${chips(comp.bySkill, skillLabel, B.SKILL_ORDER)}</div>
                    <div class="flex flex-wrap gap-1">${chips(comp.byLevel, k => k, B.LEVELS)}${chips(comp.byDifficulty, k => B.DIFFICULTY_LABELS[k], B.DIFFICULTIES)}</div>
                    <details class="text-xs"><summary class="cursor-pointer text-slate-500 font-semibold">Cơ cấu theo chủ đề và loại câu</summary>
                        <div class="flex flex-wrap gap-1 mt-1.5">${chips(comp.byTopic, k => { const [sk, cat] = k.split('::'); return `${skillLabel(sk)} › ${cat}`; })}</div>
                        <div class="flex flex-wrap gap-1 mt-1.5">${chips(comp.byType, k => TYPE_LABELS[k] || k, B.TYPES)}</div>
                    </details>
                </div>` : ''}
                ${warnings.map(w => `<p class="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5 mb-2"><i class="fa-solid fa-circle-info mr-1"></i>${esc(w)}</p>`).join('')}
                <div class="flex flex-wrap gap-2 mb-2">
                    <button data-action="save" class="text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"><i class="fa-regular fa-floppy-disk mr-1"></i>${s.paperId ? 'Lưu thay đổi' : 'Lưu đề'}</button>
                    ${s.paperId ? '<button data-action="save-copy" class="text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"><i class="fa-regular fa-copy mr-1"></i>Lưu thành đề mới</button>' : ''}
                    <button data-action="start" class="text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40" ${list.length ? '' : 'disabled'}><i class="fa-solid fa-play mr-1"></i>Làm bài với đề này</button>
                    <button data-action="clear" class="text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-slate-200 text-rose-700 hover:bg-rose-50 disabled:opacity-40" ${list.length ? '' : 'disabled'}><i class="fa-regular fa-trash-can mr-1"></i>Xoá hết câu</button>
                </div>
                ${list.length
                    ? `<p class="text-[11px] text-slate-400">Câu hỏi được sắp theo kỹ năng; câu cùng bài đọc luôn đứng liền nhau. Bấm vào một câu để xem đáp án và giải thích.</p>
                       <ul class="max-h-[32rem] overflow-y-auto custom-scrollbar pr-1">${rows}</ul>`
                    : `<p class="text-sm text-slate-500 bg-slate-50 rounded-xl p-4 text-center">Đề chưa có câu hỏi. ${c.mode === 'random' ? 'Bấm <b>Tạo đề ngẫu nhiên</b> hoặc thêm' : 'Thêm'} câu từ ngân hàng câu hỏi bên dưới.</p>`}`;
        }

        function renderBrowserControls() {
            const b = s.browser;
            $('b-skill').innerHTML = `<option value="all">Tất cả kỹ năng</option>${SKILLS.map(sk => `<option value="${sk.key}">${esc(sk.label)}</option>`).join('')}`;
            $('b-skill').value = b.skill;
            $('b-level').innerHTML = `<option value="all">Tất cả trình độ</option>${B.LEVELS.map(l => `<option value="${l}">${LEVEL_LABELS[l]}</option>`).join('')}`;
            $('b-level').value = b.level;
            const cats = qs.categories(b.skill);
            if (b.category !== 'all' && !cats.includes(b.category)) b.category = 'all';
            $('b-category').innerHTML = `<option value="all">Tất cả chủ đề</option>${cats.map(cat => `<option value="${esc(cat)}">${esc(cat)}</option>`).join('')}`;
            $('b-category').value = b.category;
            $('b-only-match').checked = b.onlyMatch;
        }

        function renderResults() {
            const b = s.browser;
            const config = s.config;
            const inPaper = new Set(s.ids);
            const results = qs.filter(
                { skill: b.skill, level: b.level, category: b.category, query: b.query },
                b.onlyMatch ? q => builder.matches(q, config) : null);
            const shown = results.slice(0, b.limit);
            const addedPassages = new Set();
            $('builder-results').innerHTML = `
                <p class="text-xs text-slate-500 mb-2">Tìm thấy <b>${results.length}</b> câu${results.length > shown.length ? ` – đang hiện ${shown.length}` : ''}.</p>
                <ul class="flex flex-col gap-1 max-h-[32rem] overflow-y-auto custom-scrollbar pr-1">${shown.map(q => {
                    const added = inPaper.has(q.id);
                    let passageBtn = '';
                    if (q.passageId && !addedPassages.has(q.passageId)) {
                        addedPassages.add(q.passageId);
                        const rest = builder.byPassage.get(q.passageId).filter(x => !inPaper.has(x.id)).length;
                        if (rest > 1 || (rest === 1 && added)) passageBtn = `<button data-add-passage="${esc(q.passageId)}" class="text-[11px] font-semibold px-2 py-1 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 whitespace-nowrap">+ Cả bài đọc (${rest})</button>`;
                    }
                    return `<li><details class="border border-slate-200 rounded-lg ${added ? 'bg-slate-50' : ''}">
                        <summary class="flex items-start gap-2 p-2.5 cursor-pointer list-none">
                            <span class="flex-1 min-w-0">
                                <span class="flex flex-wrap items-center gap-1.5">${badgeRow(q)}</span>
                                <span class="block text-xs text-slate-700 mt-0.5 truncate">${esc(snippet(q))}</span>
                            </span>
                            ${passageBtn}
                            ${added
                                ? '<span class="text-[11px] font-semibold px-2 py-1 rounded-md text-emerald-700 bg-emerald-50 whitespace-nowrap"><i class="fa-solid fa-check mr-1"></i>Đã có</span>'
                                : `<button data-add="${q.id}" class="text-[11px] font-semibold px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"><i class="fa-solid fa-plus mr-1"></i>Thêm</button>`}
                        </summary>
                        ${questionDetail(q)}
                    </details></li>`;
                }).join('')}</ul>
                ${results.length > shown.length ? `<button id="b-more" class="mt-2 w-full text-xs font-semibold py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Xem thêm ${Math.min(PAGE_SIZE, results.length - shown.length)} câu</button>` : ''}`;
        }

        // ------------------------------------------------------------ actions

        function setIds(ids) {
            s.ids = ids;
            changed();
            renderPaper();
            renderResults();
        }

        function applySuggestion(ref) {
            const [i, j] = ref.split(':').map(Number);
            const sg = s.lastCheck && s.lastCheck.errors[i] && s.lastCheck.errors[i].suggestions[j];
            if (!sg) return;
            for (const [k, v] of Object.entries(sg.patch)) {
                if (k === 'quotas') {
                    for (const [dim, map] of Object.entries(v)) Object.assign(s.config.quotas[dim], map);
                } else s.config[k] = Array.isArray(v) ? [...v] : v;
            }
            changed();
            renderConfig();
            renderDynamic();
            flash(`Đã áp dụng: ${sg.label}.`, 'info');
        }

        function generate() {
            if (s.ids.length && !confirm(`Thay ${s.ids.length} câu hiện có bằng một đề ngẫu nhiên mới?`)) return;
            const result = builder.generate(s.config);
            if (!result.ok) {
                renderCheck();
                flash('Chưa tạo được đề: cấu hình chưa đáp ứng được. Xem thông báo trong phần Cấu hình đề để điều chỉnh.', 'error');
                return;
            }
            setIds(result.ids);
            flash(`Đã tạo đề gồm ${result.ids.length} câu theo cấu hình.`, 'success');
        }

        function save(asCopy) {
            const name = s.config.name.trim();
            if (!name) {
                flash('Hãy đặt tên cho đề thi trước khi lưu.', 'error');
                const input = document.querySelector('#builder-config [data-field="name"]');
                if (input) input.focus();
                return;
            }
            const result = builder.savePaper({ id: asCopy ? null : s.paperId, name, config: s.config, questionIds: s.ids });
            if (!result.ok) return flash(result.message, 'error');
            s.paperId = result.paper.id;
            s.dirty = false;
            persist();
            renderSaved();
            renderPaper();
            flash(`Đã lưu đề “${result.paper.name}” (${result.paper.questionIds.length} câu).`, 'success');
        }

        function start() {
            const questions = s.ids.map(id => qs.byId.get(id)).filter(Boolean);
            if (!questions.length) return;
            const warnings = builder.paperWarnings(s.ids, s.config);
            if (warnings.length && !confirm(`Đề có cảnh báo:\n- ${warnings.join('\n- ')}\n\nVẫn bắt đầu làm bài?`)) return;
            onStart(questions, {
                title: s.config.name.trim() || 'Đề tự soạn (chưa lưu)',
                paperId: s.dirty ? null : s.paperId,
                timeLimit: s.config.timeLimit,
            });
        }

        function confirmDiscard() {
            return !s.dirty || !s.ids.length || confirm('Đề đang soạn có thay đổi chưa lưu. Bỏ các thay đổi này?');
        }

        function openPaper(id) {
            const paper = builder.getPaper(id);
            if (!paper || !confirmDiscard()) return;
            const { missing } = builder.resolvePaper(paper);
            s.config = builder.normalizeConfig({ ...paper.config, name: paper.name });
            s.ids = builder.orderPaper(paper.questionIds);
            s.paperId = paper.id;
            s.dirty = false;
            persist();
            render();
            flash(missing.length
                ? `Đã mở đề “${paper.name}”. ${missing.length} câu không còn trong ngân hàng nên không được hiển thị: ${missing.join(', ')}.`
                : `Đã mở đề “${paper.name}”.`, missing.length ? 'error' : 'info');
        }

        function newPaper() {
            if (!confirmDiscard()) return;
            s.config = builder.defaultConfig();
            s.ids = [];
            s.paperId = null;
            s.dirty = false;
            persist();
            render();
        }

        // ------------------------------------------------------------ events

        function bind() {
            bound = true;
            renderBrowserControls();
            const cfg = $('builder-config');

            cfg.addEventListener('input', e => {
                const t = e.target;
                if (t.dataset.field === 'name') {
                    s.config.name = t.value;
                    changed();
                    renderPaper();
                } else if (t.dataset.field === 'total' || t.dataset.field === 'timeLimit') {
                    s.config[t.dataset.field] = t.value === '' ? 0 : Math.trunc(Number(t.value)) || 0;
                    changed();
                    updateQuotaStatus();
                    renderCheck();
                    renderPaper();
                } else if (t.dataset.quota !== undefined) {
                    s.config.quotas[s.config.quotaBy][t.dataset.quota] = Math.max(0, Math.trunc(Number(t.value)) || 0);
                    changed();
                    updateQuotaStatus();
                    renderCheck();
                    renderPaper();
                }
            });

            cfg.addEventListener('change', e => {
                const t = e.target;
                const c = s.config;
                if (t.dataset.list) {
                    const list = c[t.dataset.list];
                    if (t.checked && !list.includes(t.value)) list.push(t.value);
                    if (!t.checked) c[t.dataset.list] = list.filter(v => v !== t.value);
                } else if (t.dataset.skillToggle) {
                    const keys = qs.categories(t.dataset.skillToggle).map(cat => `${t.dataset.skillToggle}::${cat}`);
                    c.topics = t.checked ? [...new Set([...c.topics, ...keys])] : c.topics.filter(k => !keys.includes(k));
                } else if (t.dataset.field === 'mode' || t.dataset.field === 'quotaBy') {
                    c[t.dataset.field] = t.value;
                } else return;
                changed();
                renderConfig();
                renderDynamic();
            });

            cfg.addEventListener('click', e => {
                const t = e.target.closest('button');
                if (!t) return;
                if (t.dataset.expand) {
                    if (s.expanded.has(t.dataset.expand)) s.expanded.delete(t.dataset.expand);
                    else s.expanded.add(t.dataset.expand);
                    renderConfig();
                    renderCheck();
                } else if (t.dataset.topics) {
                    s.config.topics = t.dataset.topics === 'all' ? [...builder.allTopics] : [];
                    changed();
                    renderConfig();
                    renderDynamic();
                } else if (t.dataset.suggest) applySuggestion(t.dataset.suggest);
                else if (t.id === 'b-generate') generate();
            });

            $('builder-paper').addEventListener('click', e => {
                const t = e.target.closest('button');
                if (!t) return;
                e.preventDefault();
                if (t.dataset.remove) setIds(builder.removeQuestion(s.ids, t.dataset.remove).ids);
                else if (t.dataset.replace) {
                    const r = builder.replaceQuestion(s.ids, t.dataset.replace, s.config);
                    if (!r.ok) return flash(r.message, 'error');
                    setIds(r.ids);
                    flash(`Đã thay ${t.dataset.replace} bằng ${r.newId}.`, 'success');
                } else if (t.dataset.addPassage) {
                    const r = builder.addPassage(s.ids, t.dataset.addPassage);
                    if (!r.ok) return flash(r.message, 'error');
                    setIds(r.ids);
                } else if (t.dataset.action === 'save') save(false);
                else if (t.dataset.action === 'save-copy') save(true);
                else if (t.dataset.action === 'start') start();
                else if (t.dataset.action === 'clear') {
                    if (confirm(`Xoá toàn bộ ${s.ids.length} câu khỏi đề đang soạn?`)) setIds([]);
                }
            });

            $('builder-results').addEventListener('click', e => {
                const t = e.target.closest('button');
                if (!t) return;
                e.preventDefault();
                if (t.dataset.add) {
                    const r = builder.addQuestion(s.ids, t.dataset.add);
                    if (!r.ok) return flash(r.message, 'error');
                    setIds(r.ids);
                } else if (t.dataset.addPassage) {
                    const r = builder.addPassage(s.ids, t.dataset.addPassage);
                    if (!r.ok) return flash(r.message, 'error');
                    setIds(r.ids);
                    flash(`Đã thêm ${r.added} câu của bài đọc.`, 'success');
                } else if (t.id === 'b-more') {
                    s.browser.limit += PAGE_SIZE;
                    renderResults();
                }
            });

            let searchTimer = null;
            $('b-search').addEventListener('input', e => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    s.browser.query = e.target.value.trim();
                    s.browser.limit = PAGE_SIZE;
                    renderResults();
                }, 200);
            });
            const onBrowserChange = patch => {
                Object.assign(s.browser, patch, { limit: PAGE_SIZE });
                renderBrowserControls();
                renderResults();
            };
            $('b-skill').addEventListener('change', e => onBrowserChange({ skill: e.target.value, category: 'all' }));
            $('b-level').addEventListener('change', e => onBrowserChange({ level: e.target.value }));
            $('b-category').addEventListener('change', e => onBrowserChange({ category: e.target.value }));
            $('b-only-match').addEventListener('change', e => onBrowserChange({ onlyMatch: e.target.checked }));

            $('builder-saved').addEventListener('click', e => {
                const t = e.target.closest('button');
                if (!t) return;
                if (t.dataset.paperOpen) openPaper(t.dataset.paperOpen);
                else if (t.dataset.paperStart) {
                    const paper = builder.getPaper(t.dataset.paperStart);
                    if (!paper) return;
                    const { questions, missing } = builder.resolvePaper(paper);
                    if (!questions.length) return flash('Không còn câu hỏi nào của đề này trong ngân hàng.', 'error');
                    if (missing.length && !confirm(`${missing.length} câu không còn trong ngân hàng. Làm bài với ${questions.length} câu còn lại?`)) return;
                    onStart(questions, { title: paper.name, paperId: paper.id, timeLimit: paper.config.timeLimit });
                } else if (t.dataset.paperDup) {
                    const r = builder.duplicatePaper(t.dataset.paperDup);
                    if (!r.ok) return flash(r.message, 'error');
                    renderSaved();
                    flash(`Đã tạo bản sao “${r.paper.name}”.`, 'success');
                } else if (t.dataset.paperDel) {
                    const paper = builder.getPaper(t.dataset.paperDel);
                    if (!paper || !confirm(`Xoá đề “${paper.name}”? Kết quả các lần đã làm vẫn được giữ trong Statistics.`)) return;
                    builder.deletePaper(paper.id);
                    if (s.paperId === paper.id) {
                        s.paperId = null;
                        s.dirty = true;
                        persist();
                    }
                    renderSaved();
                    renderPaper();
                    flash(`Đã xoá đề “${paper.name}”. Đề đang soạn (nếu có) vẫn được giữ dưới dạng bản nháp.`, 'info');
                }
            });

            $('builder-new-btn').addEventListener('click', newPaper);
        }

        return { render };
    }

    global.ExamBuilderView = { create };
})(window);
