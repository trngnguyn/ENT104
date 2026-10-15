/**
 * Giao diện tab Thì (Tenses): danh sách các thì A1–A2, lý thuyết (cấu trúc, cách dùng, dấu hiệu, lưu ý, lỗi thường gặp)
 * và luyện tập trắc nghiệm theo từng thì hoặc tổng hợp. Dùng chung mật khẩu với Writing (AccessGate).
 * Đề bài là dữ liệu tin cậy (có thể chứa <br>); lựa chọn và giải thích luôn được escape.
 */
(function (global) {
    'use strict';

    const T = global.TenseService;
    const LEVEL_ORDER = ['A1', 'A1–A2', 'A2'];
    const LEVEL_STYLE = {
        'A1': 'bg-emerald-50 text-emerald-700',
        'A1–A2': 'bg-sky-50 text-sky-700',
        'A2': 'bg-indigo-50 text-indigo-700',
    };
    const LETTERS = ['A', 'B', 'C', 'D'];

    const $ = id => document.getElementById(id);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pctTone = p => (p >= 80 ? 'emerald' : p >= 50 ? 'amber' : 'rose');
    const blank = html => String(html).replace(/_{3,}/g, '<span class="inline-block min-w-[3.5rem] border-b-2 border-blue-400 mx-0.5">&nbsp;</span>');

    function create({ service, access, questions, onAnswer = null }) {
        const s = {
            loaded: false,
            loading: false,
            loadError: null,
            status: null,
            tenseId: null,
            size: 10,
            session: null,
        };
        let bound = false;

        const bank = () => (typeof questions === 'function' ? questions() : questions) || [];
        const tense = () => service.byId.get(s.tenseId) || null;
        const titleOf = id => {
            const t = service.byId.get(id);
            return id === T.MIXED_ID ? 'Tổng hợp các thì' : t ? `${t.vi} · ${t.name}` : id;
        };

        async function ensureLoaded() {
            if (s.loaded || s.loading) return;
            s.loading = true;
            try {
                const [, status] = await Promise.all([service.load(), access.status()]);
                s.status = status;
            } catch (e) {
                console.error(e);
                s.loadError = `Không tải được dữ liệu các thì: ${e.message}`;
            }
            s.loading = false;
            s.loaded = true;
            s.tenseId = service.tenses[0] ? service.tenses[0].id : null;
            render();
        }

        // ------------------------------------------------------------ render

        function render() {
            bind();
            if (!s.loaded) {
                ensureLoaded();
                $('t-main').innerHTML = '<div class="card p-10 text-center text-slate-500 text-sm"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải các thì...</div>';
                return;
            }
            const locked = AccessGate.isLocked(s.status, access);
            $('t-lock').classList.toggle('hidden', !locked);
            $('t-body').classList.toggle('hidden', locked);
            if (locked) {
                return AccessGate.mount($('t-lock'), {
                    service: access,
                    title: 'Nhập mật khẩu để vào phần Thì',
                    description: 'Dùng chung mật khẩu với phần Writing. Hỏi giáo viên nếu bạn chưa có mật khẩu.',
                    onUnlock: render
                });
            }
            if (s.loadError) {
                $('t-list').innerHTML = '';
                $('t-main').innerHTML = `<div class="card !border-rose-200 p-8 text-sm text-rose-700"><i class="fa-solid fa-triangle-exclamation mr-1"></i> ${esc(s.loadError)}</div>`;
                return;
            }
            renderList();
            renderMain();
        }

        function renderMain() {
            $('t-aside').classList.toggle('mobile-hide', !!s.session);
            renderContent();
        }

        function bestBadge(id) {
            const b = service.best(id);
            return b ? `<span class="flex-shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-${pctTone(b.pct)}-50 text-${pctTone(b.pct)}-700 tabular-nums">${b.pct}%</span>` : '';
        }

        function renderList() {
            const groups = LEVEL_ORDER.map(level => [level, service.tenses.filter(t => t.level === level)]).filter(([, list]) => list.length);
            const item = t => {
                const active = t.id === s.tenseId;
                return `<button data-t-tense="${esc(t.id)}" class="w-full min-w-0 text-left px-3 py-2.5 rounded-xl border transition-colors ${active
                    ? 'bg-blue-50 border-blue-200' : 'border-slate-200/70 lg:border-transparent hover:bg-slate-50'}">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-semibold ${active ? 'text-blue-800' : 'text-slate-800'} truncate">${esc(t.vi)}</span>
                        ${bestBadge(t.id)}
                    </div>
                    <div class="mt-0.5 text-[11px] text-slate-500 truncate">${esc(t.name)}</div>
                </button>`;
            };
            const mixedActive = s.tenseId === T.MIXED_ID;
            $('t-list').innerHTML = groups.map(([level, list]) => `
                <div>
                    <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400 px-1 mb-1">${level}</p>
                    <div class="grid grid-cols-2 gap-1.5 lg:flex lg:flex-col lg:gap-0.5">${list.map(item).join('')}</div>
                </div>`).join('') + `
                <button data-t-tense="${T.MIXED_ID}" class="w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${mixedActive
                    ? 'bg-blue-50 border-blue-200' : 'border-dashed border-slate-300 hover:bg-slate-50'}">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-semibold ${mixedActive ? 'text-blue-800' : 'text-slate-800'}"><i class="fa-solid fa-shuffle text-xs mr-1"></i>Tổng hợp các thì</span>
                        ${bestBadge(T.MIXED_ID)}
                    </div>
                    <div class="mt-0.5 text-[11px] text-slate-500">Trộn câu của cả ${service.tenses.length} thì</div>
                </button>`;
        }

        function renderContent() {
            if (s.session) return renderSession();
            if (s.tenseId === T.MIXED_ID) return renderMixed();
            const t = tense();
            if (!t) {
                $('t-main').innerHTML = '<div class="card p-8 text-sm text-slate-500">Chưa có dữ liệu.</div>';
                return;
            }
            $('t-main').innerHTML = `
                <div class="card p-5 sm:p-6">
                    <div class="flex flex-wrap items-start justify-between gap-4">
                        <div class="min-w-0">
                            <span class="text-[11px] font-bold px-2 py-0.5 rounded-md ${LEVEL_STYLE[t.level] || 'bg-slate-100 text-slate-600'}">${esc(t.level)}</span>
                            <h3 class="mt-2 text-xl font-bold text-slate-900">${esc(t.vi)} <span class="text-slate-400 font-medium">· ${esc(t.name)}</span></h3>
                            <p class="mt-1 text-sm text-slate-600">${esc(t.summary)}</p>
                        </div>
                        ${practiceBox(t.id)}
                    </div>
                </div>

                ${section('Cấu trúc', 'fa-diagram-project', `<div class="grid gap-3 sm:grid-cols-2">${t.forms.map(f => `
                    <div class="rounded-xl border border-slate-200 p-4">
                        <p class="text-xs font-bold uppercase tracking-wide text-blue-600">${esc(f.label)}</p>
                        <p class="mt-2 font-mono text-sm font-semibold text-slate-900 whitespace-pre-line">${esc(f.pattern)}</p>
                        <ul class="mt-3 space-y-1 text-sm text-slate-600">${f.examples.map(x => `<li><i class="fa-solid fa-angle-right text-[10px] text-slate-400 mr-1.5"></i><span class="italic">${esc(x)}</span></li>`).join('')}</ul>
                    </div>`).join('')}</div>`)}

                ${section('Cách dùng', 'fa-lightbulb', `<ul class="divide-y divide-slate-100">${t.uses.map((u, i) => `
                    <li class="py-2.5 flex gap-3">
                        <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center">${i + 1}</span>
                        <div class="text-sm"><p class="font-semibold text-slate-800">${esc(u.text)}</p><p class="text-slate-600 italic mt-0.5">${esc(u.example)}</p></div>
                    </li>`).join('')}</ul>`)}

                ${t.signals.length ? section('Dấu hiệu nhận biết', 'fa-magnifying-glass', `<div class="flex flex-wrap gap-2">${t.signals.map(x => `<span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">${esc(x)}</span>`).join('')}</div>`) : ''}

                ${t.notes.length ? section('Lưu ý', 'fa-circle-info', `<ul class="space-y-2 text-sm text-slate-700">${t.notes.map(n => `<li class="flex gap-2"><i class="fa-solid fa-check text-emerald-500 text-xs mt-1"></i><span>${esc(n)}</span></li>`).join('')}</ul>`, { collapsed: true }) : ''}

                ${t.mistakes.length ? section('Lỗi thường gặp', 'fa-triangle-exclamation', `<div class="space-y-3">${t.mistakes.map(m => `
                    <div class="rounded-xl border border-slate-200 p-3 text-sm">
                        <p><i class="fa-solid fa-xmark text-rose-500 w-4"></i> <del class="text-rose-700">${esc(m.wrong)}</del></p>
                        <p class="mt-1"><i class="fa-solid fa-check text-emerald-600 w-4"></i> <span class="font-semibold text-emerald-700">${esc(m.right)}</span></p>
                        <p class="mt-1.5 text-slate-500 text-xs">${esc(m.why)}</p>
                    </div>`).join('')}</div>`, { collapsed: true }) : ''}

                <p class="text-xs text-slate-400 px-1">${esc(service.note)}</p>`;
        }

        function renderMixed() {
            $('t-main').innerHTML = `
                <div class="card p-5 sm:p-6">
                    <div class="flex flex-wrap items-start justify-between gap-4">
                        <div class="min-w-0">
                            <h3 class="text-xl font-bold text-slate-900"><i class="fa-solid fa-shuffle text-blue-600 mr-1"></i> Tổng hợp các thì</h3>
                            <p class="mt-1 text-sm text-slate-600">Luyện phân biệt khi nào dùng thì nào.</p>
                        </div>
                        ${practiceBox(T.MIXED_ID)}
                    </div>
                </div>
                ${section('Các thì được trộn', 'fa-list', `<div class="grid gap-2 sm:grid-cols-2">${service.tenses.map(t => `
                    <button data-t-tense="${esc(t.id)}" class="text-left rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm font-semibold text-slate-800">${esc(t.vi)}</span>
                            <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-md ${LEVEL_STYLE[t.level] || ''}">${esc(t.level)}</span>
                        </div>
                        <p class="mt-1 text-xs text-slate-500">${esc(t.summary)}</p>
                    </button>`).join('')}</div>`)}
                <p class="text-xs text-slate-400 px-1">${esc(service.note)}</p>`;
        }

        function practiceBox(id) {
            const total = service.pool(id, bank()).length;
            const best = service.best(id);
            return `<div class="flex-shrink-0 rounded-xl bg-slate-50 border border-slate-200 p-3 w-full sm:w-auto">
                <p class="text-xs text-slate-500 mb-2">${total} câu luyện tập${best ? ` · Cao nhất <b class="text-${pctTone(best.pct)}-700">${best.pct}%</b> (${best.correct}/${best.total})` : ''}</p>
                <div class="flex items-center gap-2">
                    <div class="flex bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-semibold">${T.SESSION_SIZES.map(n => {
                        const active = s.size === n;
                        return `<button data-t-size="${n}" class="px-2.5 py-1 rounded-md transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}">${n ? n : 'Tất cả'}</button>`;
                    }).join('')}</div>
                    <button data-t-start="${esc(id)}" class="btn-primary !py-2"><i class="fa-solid fa-play"></i> Luyện tập</button>
                </div>
            </div>`;
        }

        function section(title, icon, body, { collapsed = false } = {}) {
            if (collapsed) {
                return `<details class="card p-5 sm:p-6 group">
                    <summary class="eyebrow cursor-pointer flex items-center"><i class="fa-solid ${icon} mr-1"></i> ${title}
                        <i class="fa-solid fa-chevron-down ml-auto text-[10px] transition-transform group-open:rotate-180"></i></summary>
                    <div class="mt-3">${body}</div>
                </details>`;
            }
            return `<div class="card p-5 sm:p-6">
                <h4 class="eyebrow mb-3"><i class="fa-solid ${icon} mr-1"></i> ${title}</h4>
                ${body}
            </div>`;
        }

        // ------------------------------------------------------------ practice

        function start(id, only = null) {
            const items = service.session(id, { size: only ? 0 : s.size, bank: bank(), only });
            if (!items.length) return;
            s.session = { id, items, index: 0, answers: [], done: false };
            renderMain();
            scrollTop();
        }

        function renderSession() {
            const ss = s.session;
            if (ss.done) return renderResult();
            const q = ss.items[ss.index];
            const chosen = ss.answers[ss.index];
            const answered = chosen !== undefined;
            const correctSoFar = ss.answers.filter((a, i) => a === ss.items[i].answer).length;
            const last = ss.index === ss.items.length - 1;
            const qTense = s.session.id === T.MIXED_ID ? service.byId.get(q.tenseId) : null;
            $('t-main').innerHTML = `
                <div class="card p-4 sm:p-5">
                    <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0">
                            <p class="text-xs text-slate-500">Luyện tập</p>
                            <p class="font-semibold text-slate-900 truncate">${esc(titleOf(ss.id))}</p>
                        </div>
                        <div class="flex items-center gap-3 text-sm">
                            <span class="tabular-nums text-slate-600">Câu <b>${ss.index + 1}</b>/${ss.items.length}</span>
                            <span class="tabular-nums text-emerald-700 font-semibold"><i class="fa-solid fa-check text-xs"></i> ${correctSoFar}</span>
                            <button data-t-quit class="btn-secondary !py-1.5 !px-3 text-xs"><i class="fa-solid fa-xmark"></i> Thoát</button>
                        </div>
                    </div>
                    <div class="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full bg-blue-600 transition-all" style="width:${Math.round(((ss.index + (answered ? 1 : 0)) * 100) / ss.items.length)}%"></div></div>
                </div>

                <div class="card p-5 sm:p-6">
                    ${qTense && answered ? `<p class="text-[11px] font-semibold text-blue-600 mb-2">${esc(qTense.vi)}</p>` : ''}
                    <p class="text-lg leading-relaxed text-slate-900">${blank(q.question)}</p>
                    <div class="mt-5 grid gap-2 sm:grid-cols-2">${q.options.map((o, i) => {
                        let cls = 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40';
                        let icon = '';
                        if (answered) {
                            if (i === q.answer) { cls = 'border-emerald-300 bg-emerald-50 text-emerald-900'; icon = '<i class="fa-solid fa-circle-check text-emerald-600 ml-auto"></i>'; }
                            else if (i === chosen) { cls = 'border-rose-300 bg-rose-50 text-rose-900'; icon = '<i class="fa-solid fa-circle-xmark text-rose-500 ml-auto"></i>'; }
                            else cls = 'border-slate-200 opacity-60';
                        }
                        return `<button data-t-answer="${i}" ${answered ? 'disabled' : ''} class="flex items-center gap-3 text-left px-4 py-3 rounded-xl border transition-colors ${cls}">
                            <span class="flex-shrink-0 w-7 h-7 rounded-lg bg-white border border-slate-200 text-xs font-bold flex items-center justify-center text-slate-600">${LETTERS[i]}</span>
                            <span class="text-sm font-medium">${esc(o)}</span>${icon}
                        </button>`;
                    }).join('')}</div>
                    ${answered ? `
                        <div class="mt-5 rounded-xl px-4 py-3 text-sm ${chosen === q.answer ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-rose-50 text-rose-900 border border-rose-100'}">
                            <p class="font-semibold">${chosen === q.answer ? '<i class="fa-solid fa-circle-check mr-1"></i> Chính xác!' : `<i class="fa-solid fa-circle-xmark mr-1"></i> Chưa đúng – đáp án: ${LETTERS[q.answer]}. ${esc(q.options[q.answer])}`}</p>
                            ${q.explanation ? `<p class="mt-1.5 text-slate-700">${esc(q.explanation)}</p>` : ''}
                        </div>
                        <div class="mt-4 flex justify-end">
                            <button data-t-next class="btn-primary">${last ? '<i class="fa-solid fa-flag-checkered"></i> Xem kết quả' : 'Câu tiếp <i class="fa-solid fa-arrow-right"></i>'}</button>
                        </div>` : '<p class="hidden lg:block mt-4 text-xs text-slate-400">Phím tắt: 1–4 chọn, Enter sang câu tiếp.</p>'}
                </div>`;
        }

        function answer(i) {
            const ss = s.session;
            if (!ss || ss.done || ss.answers[ss.index] !== undefined) return;
            ss.answers[ss.index] = i;
            if (onAnswer) {
                const q = ss.items[ss.index];
                onAnswer(q, i === q.answer);
            }
            renderSession();
        }

        function next() {
            const ss = s.session;
            if (!ss || ss.done || ss.answers[ss.index] === undefined) return;
            if (ss.index < ss.items.length - 1) {
                ss.index += 1;
            } else {
                ss.done = true;
                const correct = ss.items.filter((q, i) => ss.answers[i] === q.answer).length;
                if (!ss.retry) service.record(ss.id, correct, ss.items.length);
                renderList();
            }
            renderSession();
            scrollTop();
        }

        function renderResult() {
            const ss = s.session;
            const wrong = ss.items.map((q, i) => ({ q, a: ss.answers[i] })).filter(x => x.a !== x.q.answer);
            const correct = ss.items.length - wrong.length;
            const pct = Math.round((correct * 100) / ss.items.length);
            const tone = pctTone(pct);
            const msg = pct === 100 ? 'Xuất sắc! Bạn làm đúng tất cả.' : pct >= 80 ? 'Rất tốt! Ôn lại vài câu sai là vững.' : pct >= 50 ? 'Khá ổn – xem lại lý thuyết và các câu sai nhé.' : 'Cần ôn thêm – đọc lại cấu trúc và cách dùng rồi luyện lại.';
            $('t-main').innerHTML = `
                <div class="card p-6 text-center">
                    <p class="text-xs text-slate-500">${esc(titleOf(ss.id))}${ss.retry ? ' · làm lại câu sai' : ''}</p>
                    <p class="mt-2 text-5xl font-extrabold text-${tone}-600 tabular-nums">${correct}<span class="text-2xl text-slate-400">/${ss.items.length}</span></p>
                    <p class="mt-1 font-semibold text-${tone}-700">${pct}%</p>
                    <p class="mt-2 text-sm text-slate-600">${msg}</p>
                    <div class="mt-5 flex flex-wrap justify-center gap-2">
                        ${wrong.length ? `<button data-t-retry-wrong class="btn-primary"><i class="fa-solid fa-rotate-left"></i> Làm lại ${wrong.length} câu sai</button>` : ''}
                        <button data-t-start="${esc(ss.id)}" class="${wrong.length ? 'btn-secondary' : 'btn-primary'}"><i class="fa-solid fa-shuffle"></i> Luyện lượt mới</button>
                        <button data-t-quit class="btn-secondary"><i class="fa-solid fa-book-open"></i> Về lý thuyết</button>
                    </div>
                </div>
                ${wrong.length ? section(`Các câu sai (${wrong.length})`, 'fa-circle-xmark', `<div class="space-y-3">${wrong.map(({ q, a }) => `
                    <div class="rounded-xl border border-slate-200 p-4 text-sm">
                        <p class="text-slate-900">${blank(q.question)}</p>
                        <p class="mt-2"><span class="text-rose-700"><i class="fa-solid fa-xmark w-4"></i> Bạn chọn: ${esc(q.options[a])}</span></p>
                        <p class="mt-0.5"><span class="text-emerald-700 font-semibold"><i class="fa-solid fa-check w-4"></i> Đáp án: ${esc(q.options[q.answer])}</span></p>
                        ${q.explanation ? `<p class="mt-1.5 text-slate-500 text-xs">${esc(q.explanation)}</p>` : ''}
                    </div>`).join('')}</div>`) : ''}`;
        }

        function scrollTop() {
            const el = $('tenses-view');
            if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // ------------------------------------------------------------ events

        function bind() {
            if (bound) return;
            bound = true;
            $('tenses-view').addEventListener('click', e => {
                const el = e.target.closest('[data-t-tense], [data-t-size], [data-t-start], [data-t-answer], [data-t-next], [data-t-quit], [data-t-retry-wrong]');
                if (!el) return;
                const d = el.dataset;
                if (d.tTense !== undefined) {
                    s.tenseId = d.tTense;
                    s.session = null;
                    renderList();
                    renderMain();
                    if (window.innerWidth < 1024) $('t-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (d.tSize !== undefined) {
                    s.size = Number(d.tSize);
                    renderMain();
                } else if (d.tStart !== undefined) {
                    start(d.tStart);
                } else if (d.tAnswer !== undefined) {
                    answer(Number(d.tAnswer));
                } else if (d.tNext !== undefined) {
                    next();
                } else if (d.tRetryWrong !== undefined) {
                    const ss = s.session;
                    const ids = ss.items.filter((q, i) => ss.answers[i] !== q.answer).map(q => q.id);
                    const items = ss.items.filter(q => ids.includes(q.id));
                    s.session = { id: ss.id, items: T.shuffle(items), index: 0, answers: [], done: false, retry: true };
                    renderSession();
                    scrollTop();
                } else if (d.tQuit !== undefined) {
                    s.session = null;
                    renderMain();
                }
            });
            document.addEventListener('keydown', e => {
                const view = $('tenses-view');
                if (!s.session || s.session.done || view.classList.contains('hidden') || !$('t-lock').classList.contains('hidden')) return;
                if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
                const k = e.key.toUpperCase();
                const idx = /^[1-4]$/.test(k) ? Number(k) - 1 : LETTERS.indexOf(k);
                if (idx >= 0 && idx < s.session.items[s.session.index].options.length) {
                    e.preventDefault();
                    answer(idx);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    next();
                }
            });
        }

        return { render };
    }

    global.TenseView = { create };
})(typeof window !== 'undefined' ? window : globalThis);
