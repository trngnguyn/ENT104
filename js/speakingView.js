/**
 * Giao diện tab Speaking: Part 1 (câu hỏi + gợi ý 3 mức), Part 2 (ảnh + timer + model answers).
 * Không gọi AI — chỉ hiện gợi ý có sẵn trong data/speaking-tasks.json.
 */
(function (global) {
    'use strict';

    const $ = id => document.getElementById(id);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const HINT_STYLE = {
        basic: {
            icon: 'fa-seedling',
            box: 'border-emerald-100 bg-emerald-50/50',
            iconCls: 'text-emerald-600',
            label: 'text-emerald-700',
        },
        better: {
            icon: 'fa-arrow-up',
            box: 'border-sky-100 bg-sky-50/50',
            iconCls: 'text-sky-600',
            label: 'text-sky-700',
        },
        strong: {
            icon: 'fa-star',
            box: 'border-indigo-100 bg-indigo-50/50',
            iconCls: 'text-indigo-600',
            label: 'text-indigo-700',
        },
    };

    const DEFAULT_LEVELS = [
        { key: 'basic', label: 'Dễ · đạt yêu cầu', vi: 'Câu ngắn, đủ ý cơ bản' },
        { key: 'better', label: 'Khá · rõ ràng hơn', vi: 'Thêm lý do / chi tiết' },
        { key: 'strong', label: 'Giỏi · điểm cao hơn', vi: 'Liên kết ý, từ vựng phong phú hơn' },
    ];

    function create({ service }) {
        const s = {
            loaded: false,
            loading: false,
            loadError: null,
            index: 0,
            remaining: 120,
            total: 120,
            mode: 'PREPARATION',
            interval: null,
            openHints: {},
        };
        let bound = false;

        const test = () => service.tests[s.index] || null;

        function stopTimer() {
            clearInterval(s.interval);
            s.interval = null;
        }

        function showClock() {
            const clock = $('spk-clock');
            const label = $('spk-timelabel');
            const bar = $('spk-bar');
            if (!clock) return;
            const m = String(Math.floor(s.remaining / 60)).padStart(2, '0');
            const sec = String(s.remaining % 60).padStart(2, '0');
            clock.textContent = `${m}:${sec}`;
            if (label) label.textContent = s.mode;
            if (bar) bar.style.width = `${(s.remaining / s.total) * 100}%`;
        }

        function initTimer() {
            stopTimer();
            s.mode = 'PREPARATION';
            s.remaining = s.total = 120;
            const pause = $('spk-pause');
            if (pause) pause.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm dừng';
            showClock();
        }

        function startTimer(seconds, kind) {
            stopTimer();
            s.mode = kind;
            s.remaining = s.total = seconds;
            const pause = $('spk-pause');
            if (pause) pause.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm dừng';
            showClock();
            s.interval = setInterval(() => {
                s.remaining = Math.max(0, s.remaining - 1);
                showClock();
                if (!s.remaining) {
                    stopTimer();
                    const label = $('spk-timelabel');
                    if (label) label.textContent = `${kind} · HẾT GIỜ`;
                    try { if (navigator.vibrate) navigator.vibrate(200); } catch (e) { /* ignore */ }
                }
            }, 1000);
        }

        function togglePause() {
            const pause = $('spk-pause');
            if (s.interval) {
                stopTimer();
                if (pause) pause.innerHTML = '<i class="fa-solid fa-play"></i> Tiếp tục';
                return;
            }
            if (s.remaining <= 0) return;
            s.interval = setInterval(() => {
                s.remaining = Math.max(0, s.remaining - 1);
                showClock();
                if (s.remaining === 0) {
                    stopTimer();
                    const label = $('spk-timelabel');
                    if (label) label.textContent = `${s.mode} · HẾT GIỜ`;
                    if (pause) pause.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm dừng';
                }
            }, 1000);
            if (pause) pause.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm dừng';
        }

        async function ensureLoaded() {
            if (s.loaded || s.loading) return;
            s.loading = true;
            try {
                await service.load();
            } catch (e) {
                console.error(e);
                s.loadError = `Không tải được bài speaking: ${e.message}`;
            }
            s.loading = false;
            s.loaded = true;
            render();
        }

        function saveCurrentNotes() {
            const t = test();
            const notes = $('spk-notes');
            if (t && notes) service.setNotes(t.id, notes.value);
        }

        function go(i) {
            saveCurrentNotes();
            s.index = Math.max(0, Math.min(service.tests.length - 1, i));
            s.openHints = {};
            render();
            if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function hintBlock(hints, openKey) {
            const levels = service.hintLevels.length ? service.hintLevels : DEFAULT_LEVELS;
            const open = !!s.openHints[openKey];
            return `<details class="spk-hints rounded-xl border border-slate-200 bg-slate-50/80" data-spk-hint="${esc(openKey)}" ${open ? 'open' : ''}>
                <summary class="cursor-pointer select-none px-3.5 py-2.5 text-sm font-semibold text-slate-700 list-none flex items-center gap-2">
                    <i class="fa-solid fa-lightbulb text-amber-500"></i>
                    Gợi ý câu trả lời (dễ → điểm cao hơn)
                    <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-auto spk-chevron"></i>
                </summary>
                <div class="px-3.5 pb-3.5 space-y-2.5">
                    ${levels.map(lv => {
                        const st = HINT_STYLE[lv.key] || HINT_STYLE.basic;
                        const text = hints && hints[lv.key] ? hints[lv.key] : '';
                        return `<div class="rounded-lg border ${st.box} px-3 py-2.5">
                            <div class="flex items-center gap-1.5 mb-1">
                                <i class="fa-solid ${st.icon} ${st.iconCls} text-xs"></i>
                                <span class="text-[11px] font-bold uppercase tracking-wide ${st.label}">${esc(lv.label)}</span>
                            </div>
                            <p class="text-[11px] text-slate-500 mb-1">${esc(lv.vi || '')}</p>
                            <p class="text-sm text-slate-800 leading-relaxed">“${esc(text)}”</p>
                        </div>`;
                    }).join('')}
                    <p class="text-[11px] text-slate-400">Gợi ý cố định — không dùng AI. Hãy nói theo ý bạn; mẫu chỉ để học cách diễn đạt.</p>
                </div>
            </details>`;
        }

        function renderList() {
            const list = $('spk-list');
            if (!list) return;
            list.innerHTML = service.tests.map((t, i) => {
                const active = i === s.index;
                return `<button type="button" data-spk-go="${i}"
                    class="w-full flex items-center gap-2.5 text-left rounded-xl px-2.5 py-2 transition-colors ${active
                        ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'}">
                    <span class="w-7 h-7 flex-shrink-0 rounded-lg text-xs font-bold flex items-center justify-center ${active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'}">${String(i + 1).padStart(2, '0')}</span>
                    <span class="min-w-0">
                        <span class="block text-sm font-semibold truncate">${esc(t.title)}</span>
                        <span class="block text-[11px] text-slate-500 truncate">${esc(t.titleVi)}</span>
                    </span>
                </button>`;
            }).join('');
        }

        function bindMain(mainEl) {
            const prep = $('spk-prep');
            const speakBtn = $('spk-speak');
            const pause = $('spk-pause');
            const reset = $('spk-reset');
            const prev = $('spk-prev');
            const next = $('spk-next');
            const notes = $('spk-notes');
            if (prep) prep.onclick = () => startTimer(120, 'PREPARATION');
            if (speakBtn) speakBtn.onclick = () => startTimer(180, 'SPEAKING');
            if (pause) pause.onclick = () => togglePause();
            if (reset) reset.onclick = () => initTimer();
            if (prev) prev.onclick = () => go(s.index - 1);
            if (next) next.onclick = () => go(s.index + 1);
            if (notes) {
                notes.addEventListener('input', () => {
                    const cur = test();
                    if (cur) service.setNotes(cur.id, notes.value);
                });
            }
            mainEl.querySelectorAll('[data-spk-hint]').forEach(el => {
                el.addEventListener('toggle', () => {
                    s.openHints[el.dataset.spkHint] = el.open;
                });
            });
        }

        function renderMain() {
            const mainEl = $('spk-main');
            if (!mainEl) return;
            const t = test();
            if (!t) {
                mainEl.innerHTML = '<div class="card p-8 text-sm text-slate-500">Không có bài speaking.</div>';
                return;
            }
            const n = service.tests.length;
            const pq = service.pictureQuestions;

            mainEl.innerHTML = `
                <article class="card overflow-hidden">
                    <header class="px-5 sm:px-6 py-5 border-b border-slate-200/80 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p class="eyebrow text-blue-600">Speaking ${String(s.index + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</p>
                            <h3 class="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">${esc(t.title)}</h3>
                            <p class="text-sm text-slate-500 mt-0.5">${esc(t.titleVi)} · ${esc(t.topicVi)} · ${esc(service.level)}</p>
                        </div>
                        <span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">${esc(service.level)}</span>
                    </header>

                    <section class="px-5 sm:px-6 py-5 border-b border-slate-200/80">
                        <h4 class="text-base font-bold text-slate-900"><span class="text-blue-600">Part 1.</span> Introduction</h4>
                        <p class="text-sm text-slate-500 mt-1 mb-4">Trả lời 5 câu. Nói rõ, ngắn gọn; mở gợi ý nếu cần mẫu câu.</p>
                        <ol class="space-y-4 list-none">
                            ${t.questions.map((item, i) => `
                                <li class="rounded-xl border border-slate-200/80 p-4">
                                    <p class="text-sm font-semibold text-slate-900">
                                        <span class="inline-flex w-6 h-6 mr-1.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold items-center justify-center align-middle">${i + 1}</span>
                                        ${esc(item.q)}
                                    </p>
                                    <div class="mt-3">${hintBlock(item.hints, `q-${i}`)}</div>
                                </li>`).join('')}
                        </ol>
                    </section>

                    <section class="px-5 sm:px-6 py-5 border-b border-slate-200/80">
                        <h4 class="text-base font-bold text-slate-900"><span class="text-blue-600">Part 2.</span> Picture description</h4>
                        <p class="text-sm text-slate-500 mt-1 mb-4">Chuẩn bị 2 phút · Nói 2–3 phút</p>

                        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3.5 mb-4 flex flex-wrap items-center gap-3">
                            <div class="min-w-[5.5rem]">
                                <div id="spk-timelabel" class="text-[11px] font-bold uppercase tracking-wider text-slate-500">PREPARATION</div>
                                <div id="spk-clock" class="font-mono font-bold text-2xl text-blue-800 tabular-nums">02:00</div>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button type="button" id="spk-prep" class="btn-primary !py-2 !text-xs"><i class="fa-solid fa-play"></i> Chuẩn bị · 2:00</button>
                                <button type="button" id="spk-speak" class="btn-secondary !py-2 !text-xs"><i class="fa-solid fa-microphone"></i> Nói · 3:00</button>
                                <button type="button" id="spk-pause" class="btn-secondary !py-2 !text-xs"><i class="fa-solid fa-pause"></i> Tạm dừng</button>
                                <button type="button" id="spk-reset" class="btn-secondary !py-2 !text-xs"><i class="fa-solid fa-rotate-left"></i> Reset</button>
                            </div>
                            <div class="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div id="spk-bar" class="h-full bg-blue-500 transition-all duration-300" style="width:100%"></div>
                            </div>
                        </div>

                        <div class="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-2">
                            <img id="spk-picture" src="${esc(t.img)}" alt="Ảnh speaking: ${esc(t.topic)}"
                                class="block w-full max-h-[420px] object-cover" referrerpolicy="no-referrer"
                                onerror="this.style.display='none';this.nextElementSibling.classList.remove('hidden')">
                            <div class="hidden p-10 text-center text-sm text-slate-500">Không tải được ảnh. Kiểm tra kết nối mạng rồi tải lại trang.</div>
                        </div>
                        <p class="text-[11px] text-slate-400 mb-4">${esc(t.credit)}</p>

                        <ol class="list-decimal pl-5 text-sm text-slate-800 space-y-1.5 mb-4">
                            ${pq.map(q => `<li>${esc(q)}</li>`).join('')}
                        </ol>

                        <div class="rounded-xl border-l-4 border-blue-400 bg-blue-50/60 px-4 py-3 text-sm text-slate-700 mb-4">
                            <strong class="text-blue-800">Tip:</strong> ${esc(t.picture.vocabTip)}
                        </div>

                        <div class="rounded-xl border border-slate-200 px-4 py-3 mb-4">
                            <p class="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">Useful vocabulary</p>
                            <p class="text-sm text-slate-700">${esc(t.vocab)}</p>
                        </div>

                        ${hintBlock(t.picture.hints, 'picture')}
                    </section>

                    <section class="px-5 sm:px-6 py-5">
                        <h4 class="text-base font-bold text-slate-900">Ghi chú chuẩn bị <span class="text-xs font-normal text-slate-400">(tuỳ chọn)</span></h4>
                        <textarea id="spk-notes" class="field mt-2 min-h-[100px] resize-y" placeholder="Viết từ khoá ngắn ở đây…">${esc(service.getNotes(t.id))}</textarea>
                        <p class="text-[11px] text-slate-400 mt-1.5">Ghi chú được lưu trên máy bạn khi chuyển bài.</p>
                    </section>

                    <div class="px-5 sm:px-6 py-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                        <button type="button" id="spk-prev" class="btn-secondary !py-2 !text-xs" ${s.index === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-left"></i> Bài trước</button>
                        <span class="text-xs text-slate-500 tabular-nums">${s.index + 1} / ${n} bài</span>
                        <button type="button" id="spk-next" class="btn-primary !py-2 !text-xs" ${s.index === n - 1 ? 'disabled' : ''}>Bài sau <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                </article>`;

            initTimer();
            bindMain(mainEl);
        }

        function bind() {
            if (bound) return;
            bound = true;
            const root = $('speaking-view');
            if (!root) return;
            root.addEventListener('click', e => {
                const goBtn = e.target.closest('[data-spk-go]');
                if (goBtn) {
                    go(Number(goBtn.dataset.spkGo));
                    return;
                }
                if (e.target.closest('#spk-random')) {
                    if (service.tests.length < 2) return;
                    let n;
                    do { n = Math.floor(Math.random() * service.tests.length); } while (n === s.index);
                    go(n);
                }
            });
        }

        function render() {
            bind();
            if (!s.loaded) {
                ensureLoaded();
                if ($('spk-main')) {
                    $('spk-main').innerHTML = '<div class="card p-10 text-center text-slate-500 text-sm"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải bài speaking…</div>';
                }
                return;
            }
            if (s.loadError) {
                if ($('spk-list')) $('spk-list').innerHTML = '';
                if ($('spk-main')) {
                    $('spk-main').innerHTML = `<div class="card !border-rose-200 p-8 text-sm text-rose-700"><i class="fa-solid fa-triangle-exclamation mr-1"></i> ${esc(s.loadError)}</div>`;
                }
                return;
            }
            renderList();
            renderMain();
        }

        return { render, saveNotes: saveCurrentNotes };
    }

    global.SpeakingView = { create };
})(typeof window !== 'undefined' ? window : globalThis);
