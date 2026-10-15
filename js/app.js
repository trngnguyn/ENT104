(function () {
    'use strict';

    const { SKILLS, LEVELS, TYPE_LABELS, STATUS_LABELS } = QuestionService;
    const Stats = StatisticsService;
    const Storage = AppStorage;
    const SKILL_BY_KEY = Object.fromEntries(SKILLS.map(s => [s.key, s]));
    const MODES = ['home', 'practice', 'exam', 'builder', 'writing', 'tenses'];
    const PANEL_MODES = ['home', 'builder', 'writing', 'tenses'];
    const DIFFICULTY_LABELS = { easy: 'Dễ', medium: 'Vừa', hard: 'Khó' };
    const EXAM_SIZES = [20, 40, 50];
    const EXAM_TIMES = [0, 15, 30, 45, 60, 90];
    const LETTERS = ['A', 'B', 'C', 'D'];
    const UI_KEY = 'ent104.ui.v1';
    const DEFAULT_FILTERS = { skill: 'all', level: 'all', category: 'all', status: 'all', query: '' };
    const DIFFICULTY_STYLE = {
        easy: 'bg-emerald-50 text-emerald-700',
        medium: 'bg-amber-50 text-amber-700',
        hard: 'bg-rose-50 text-rose-700',
    };
    const EXPLANATION_HEADINGS = {
        grammar: 'Quy tắc ngữ pháp',
        vocabulary: 'Nghĩa và cách dùng từ',
        communication: 'Vì sao câu trả lời phù hợp với tình huống',
        reading: 'Căn cứ trong bài đọc',
        writing: 'Giải thích',
    };

    const $ = id => document.getElementById(id);
    const show = (el, visible) => (typeof el === 'string' ? $(el) : el).classList.toggle('hidden', !visible);
    const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const skillLabel = key => (SKILL_BY_KEY[key] ? SKILL_BY_KEY[key].label : key);
    const hasAnswer = a => a !== undefined && a !== null;

    const qs = new QuestionService();
    let quiz = null;
    let review = null;
    let builder = null;
    let builderView = null;
    let writingView = null;
    let tenseView = null;

    const state = {
        mode: 'home',
        panel: null,
        filters: { ...DEFAULT_FILTERS },
        examFilter: 'all',
        examSize: EXAM_SIZES[0],
        examTime: 0,
        resultFilter: 'all',
        view: [],
        currentId: null,
        pending: null,
        passageCollapsed: false,
        review: null,
    };

    // ------------------------------------------------------------------ helpers

    const inExam = () => state.mode === 'exam' && !!quiz.exam;
    const examSubmitted = () => inExam() && !!quiz.exam.submittedAt;

    function answerOf(id) {
        return inExam() ? quiz.examAnswer(id) : quiz.practiceAnswer(id);
    }

    /** Practice: chỉ hiện sau khi đã xác nhận; Exam: chỉ hiện sau khi nộp bài. */
    function feedbackVisible(q) {
        if (state.mode === 'exam') return examSubmitted();
        return hasAnswer(quiz.practiceAnswer(q.id));
    }

    function current() {
        return state.view.find(q => q.id === state.currentId) || null;
    }

    function pendingFor(q) {
        return state.pending && q && state.pending.id === q.id ? state.pending.index : null;
    }

    function practiceExtra() {
        const status = state.filters.status;
        return status === 'all' ? null : q => quiz.practiceStatus(q) === status;
    }

    function describeCriteria(c) {
        if (!c) return 'Đề tự soạn';
        const parts = [
            c.skill === 'all' ? 'Mọi kỹ năng' : skillLabel(c.skill),
            c.level === 'all' ? 'mọi trình độ' : c.level,
        ];
        if (c.category !== 'all') parts.push(c.category);
        if (c.query) parts.push(`"${c.query}"`);
        return parts.join(' • ');
    }

    const examTitle = exam => exam.title || `Đề ngẫu nhiên: ${describeCriteria(exam.criteria)}`;

    function saveUi() {
        Storage.set(UI_KEY, {
            mode: state.mode,
            filters: state.filters,
            examSize: state.examSize,
            examTime: state.examTime,
            currentId: state.currentId,
        });
    }

    function restoreUi() {
        const saved = Storage.get(UI_KEY, null);
        if (!saved) return;
        const f = { ...DEFAULT_FILTERS, ...(saved.filters || {}) };
        if (f.skill !== 'all' && !SKILL_BY_KEY[f.skill]) f.skill = 'all';
        if (f.level !== 'all' && !LEVELS.includes(f.level)) f.level = 'all';
        if (f.category !== 'all' && !qs.categories(f.skill).includes(f.category)) f.category = 'all';
        if (!['all', 'unanswered', 'correct', 'wrong'].includes(f.status)) f.status = 'all';
        f.query = typeof f.query === 'string' ? f.query : '';
        state.filters = f;
        state.mode = MODES.includes(saved.mode) ? saved.mode : 'practice';
        if (EXAM_SIZES.includes(saved.examSize)) state.examSize = saved.examSize;
        if (EXAM_TIMES.includes(saved.examTime)) state.examTime = saved.examTime;
        if (qs.byId.has(saved.currentId)) state.currentId = saved.currentId;
    }

    // ------------------------------------------------------------------ view

    function computeView() {
        if (state.mode === 'exam') {
            if (!quiz.exam) return [];
            const list = quiz.examQuestions();
            if (!quiz.exam.submittedAt || state.examFilter === 'all') return list;
            // Câu bỏ trống cũng bị mất điểm nên được xếp chung vào mục ôn câu sai.
            if (state.examFilter === 'wrong') return list.filter(q => quiz.examStatus(q) !== 'correct');
            return list.filter(q => quiz.examStatus(q) === state.examFilter);
        }
        if (PANEL_MODES.includes(state.mode)) return [];
        if (state.review) return state.review.map(id => qs.byId.get(id)).filter(Boolean);
        return qs.filter(state.filters, practiceExtra());
    }

    /** Tính lại danh sách đang xem (chỉ khi đổi bộ lọc/chế độ, không tính lại khi vừa trả lời). */
    function refreshView({ keepCurrent = true } = {}) {
        state.view = computeView();
        if (!keepCurrent || !state.view.some(q => q.id === state.currentId)) {
            state.currentId = state.view.length ? state.view[0].id : null;
        }
        render();
    }

    function goTo(id) {
        if (state.pending && state.pending.id !== id) state.pending = null;
        state.currentId = id;
        render();
        if (window.innerWidth < 1024) $('question-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function navigate(step) {
        const idx = state.view.findIndex(q => q.id === state.currentId);
        const next = state.view[idx + step];
        if (next) goTo(next.id);
    }

    // ------------------------------------------------------------------ render

    function render() {
        renderHeader();
        const panels = { home: homeView, builder: builderView, writing: writingView, tenses: tenseView };
        show('quiz-workspace', !panels[state.mode]);
        show('home-view', state.mode === 'home');
        show('builder-view', state.mode === 'builder');
        show('writing-view', state.mode === 'writing');
        show('tenses-view', state.mode === 'tenses');
        if (panels[state.mode]) {
            $('progress-bar-fill').style.width = '0%';
            panels[state.mode].render();
        } else {
            renderProgress();
            renderSidebar();
            renderPalette();
            renderMain();
        }
        updateTimer();
        saveUi();
    }

    function renderHeader() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            const active = btn.dataset.mode === state.mode;
            btn.classList.toggle('is-active', active);
            if (active) btn.setAttribute('aria-current', 'page');
            else btn.removeAttribute('aria-current');
        });
        show('reset-btn', !PANEL_MODES.includes(state.mode));
        $('app-subtitle').textContent = `${qs.questions.length.toLocaleString('vi-VN')} câu hỏi`;
    }

    const homeView = {
        render() {
            const s = Stats.summarize(qs.questions, id => quiz.practiceAnswer(id));
            $('home-progress').innerHTML = s.answered
                ? `Bạn đã làm <b class="text-slate-700">${s.answered}</b> câu, đúng <b class="text-emerald-600">${s.accuracy}%</b>.
                   <button data-home-continue class="ml-1 font-semibold text-blue-600 hover:underline">Làm tiếp <i class="fa-solid fa-arrow-right text-xs"></i></button>`
                : 'Chọn một mục bên dưới để bắt đầu.';
            renderToday();
        },
    };

    const shortDate = key => {
        const [, m, d] = key.split('-');
        return `${d}/${m}`;
    };

    function renderToday() {
        const done = review.doneToday;
        const goal = review.goal;
        const reached = done >= goal;
        const streak = review.streak();
        const due = review.dueIds(id => qs.byId.has(id)).length;
        const next = review.nextDue();
        const goalSelect = `<select data-home-goal aria-label="Mục tiêu mỗi ngày" class="bg-transparent text-[11px] font-semibold text-slate-500 border border-slate-200 rounded-md py-0.5 pl-1.5 pr-5">
            ${ReviewService.GOALS.map(g => `<option value="${g}" ${g === goal ? 'selected' : ''}>${g} câu/ngày</option>`).join('')}
        </select>`;
        $('home-today').innerHTML = `
            <div class="card p-4 sm:p-5">
                <div class="flex items-center justify-between gap-2">
                    <span class="eyebrow">Mục tiêu hôm nay</span>${goalSelect}
                </div>
                <p class="mt-2 text-2xl font-bold tabular-nums text-slate-900">${done}<span class="text-base font-semibold text-slate-400">/${goal} câu</span></p>
                <div class="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div class="h-full rounded-full ${reached ? 'bg-emerald-500' : 'bg-blue-500'}" style="width:${Math.min(100, Math.round((done * 100) / goal))}%"></div>
                </div>
                <p class="mt-2 text-xs ${streak ? 'text-amber-700' : 'text-slate-500'}">
                    <i class="fa-solid fa-fire mr-1 ${streak ? 'text-amber-500' : 'text-slate-300'}"></i>${streak ? `${streak} ngày học liên tiếp` : 'Làm 1 câu để bắt đầu chuỗi ngày học'}${reached ? ' · <b class="text-emerald-600">Đạt mục tiêu!</b>' : ''}
                </p>
            </div>
            <div class="card p-4 sm:p-5 flex flex-col">
                <span class="eyebrow">Ôn tập hôm nay</span>
                ${due ? `
                <p class="mt-2 text-2xl font-bold tabular-nums text-slate-900">${due}<span class="text-base font-semibold text-slate-400"> câu cần ôn</span></p>
                <button data-review-start class="btn-primary mt-3 sm:mt-auto self-start !px-5"><i class="fa-solid fa-rotate"></i> Ôn ngay</button>`
                : `<p class="mt-2 text-sm text-slate-500">${review.scheduled
                    ? `<i class="fa-solid fa-circle-check text-emerald-500 mr-1"></i>Hôm nay không có câu cần ôn.${next ? ` Lần ôn tới: ${shortDate(next)}.` : ''}`
                    : 'Câu làm sai sẽ được hẹn ôn lại ở đây sau 1, 3 và 7 ngày.'}</p>`}
            </div>`;
    }

    function renderReviewBanner() {
        const active = state.mode === 'practice' && !!state.review;
        show('review-banner', active);
        if (!active) return;
        const total = state.view.length;
        const done = state.view.filter(q => hasAnswer(quiz.practiceAnswer(q.id))).length;
        $('review-banner-text').textContent = done >= total ? `Đã ôn xong ${total} câu hôm nay!` : `Ôn tập: ${done}/${total} câu`;
        $('review-exit-btn').textContent = done >= total ? 'Xong' : 'Thoát';
    }

    /** Điện thoại: mở / đóng bộ lọc hoặc danh sách câu (trên màn hình lớn luôn hiện ở cột trái). */
    function renderMobileBar(summary) {
        const sidebar = $('quiz-sidebar');
        if (state.panel) sidebar.dataset.open = state.panel;
        else delete sidebar.dataset.open;
        document.querySelectorAll('[data-panel]').forEach(btn => btn.classList.toggle('is-open', btn.dataset.panel === state.panel));
        const examView = state.mode === 'exam' && !!quiz.exam;
        const f = state.filters;
        const active = ['skill', 'level', 'category'].filter(k => f[k] !== 'all').length
            + (f.query ? 1 : 0) + (state.mode === 'practice' && f.status !== 'all' ? 1 : 0);
        $('m-filter-label').textContent = examView ? 'Bài thi' : `Bộ lọc${active ? ` (${active})` : ''}`;
        show('m-filter-btn', !(state.mode === 'practice' && state.review));
        show('m-map-btn', state.mode === 'practice' || examView);
        const hideResult = state.mode === 'exam' && !examSubmitted();
        $('m-progress').textContent = summary.total
            ? `${summary.answered}/${summary.total}${hideResult ? '' : ` · ${summary.correct} đúng`}`
            : '';
    }

    function renderProgress() {
        let summary;
        let scope;
        if (state.mode === 'exam') {
            summary = Stats.summarize(quiz.examQuestions(), id => quiz.examAnswer(id));
            scope = quiz.exam ? (quiz.exam.submittedAt ? 'Đã nộp' : 'Đang thi') : '';
        } else {
            summary = Stats.summarize(state.view, id => quiz.practiceAnswer(id));
            scope = state.review ? 'Ôn tập' : state.view.length === qs.questions.length ? 'Tất cả câu' : 'Theo bộ lọc';
        }
        renderReviewBanner();
        renderMobileBar(summary);
        const hideResult = state.mode === 'exam' && !examSubmitted();
        $('stat-answered').textContent = `${summary.answered}/${summary.total}`;
        $('stat-correct').textContent = hideResult ? '—' : summary.correct;
        $('stat-incorrect').textContent = hideResult ? '—' : summary.wrong;
        $('progress-scope').textContent = scope;
        $('progress-bar-fill').style.width = `${summary.total ? (summary.answered * 100) / summary.total : 0}%`;

        const wrongBtn = $('review-wrong-btn');
        if (state.mode === 'practice' && !state.review) {
            const base = qs.filter({ ...state.filters, status: 'all' });
            const wrong = base.filter(q => quiz.practiceStatus(q) === 'wrong').length;
            show(wrongBtn, wrong > 0 && state.filters.status !== 'wrong');
            $('review-wrong-label').textContent = `Ôn ${wrong} câu sai`;
        } else {
            show(wrongBtn, false);
        }
    }

    function renderSidebar() {
        const choosingPool = state.mode === 'practice' ? !state.review : !quiz.exam;
        show('search-card', choosingPool);
        show('filter-card', choosingPool);
        show('status-filter-wrap', state.mode === 'practice');
        show('exam-panel', state.mode === 'exam' && !!quiz.exam);
        show('palette-card', state.mode === 'practice' || !!quiz.exam);

        if (choosingPool) renderFilters();
        if (state.mode === 'exam' && quiz.exam) renderExamPanel();
    }

    function renderFilters() {
        const f = state.filters;
        const extra = state.mode === 'practice' ? practiceExtra() : null;

        const bySkill = Stats.countBy(qs.filter({ ...f, skill: 'all', category: 'all' }, extra), q => q.skill);
        const skillTotal = Object.values(bySkill).reduce((a, b) => a + b, 0);
        $('skill-filter').innerHTML = [{ key: 'all', label: 'Tất cả kỹ năng', icon: 'fa-layer-group' }, ...SKILLS].map(s => {
            const count = s.key === 'all' ? skillTotal : (bySkill[s.key] || 0);
            const active = f.skill === s.key;
            return `<button data-skill="${s.key}" class="flex items-center justify-between text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}">
                <span><i class="fa-solid ${s.icon} w-4 mr-1.5 opacity-70"></i>${escapeHtml(s.label)}</span>
                <span class="text-[11px] ${active ? 'text-blue-600' : 'text-slate-400'}">${count}</span>
            </button>`;
        }).join('');

        const byLevel = Stats.countBy(qs.filter({ ...f, level: 'all' }, extra), q => q.level);
        const levelTotal = Object.values(byLevel).reduce((a, b) => a + b, 0);
        $('level-filter').innerHTML = ['all', ...LEVELS].map(l => {
            const count = l === 'all' ? levelTotal : (byLevel[l] || 0);
            const active = f.level === l;
            return `<button data-level="${l}" class="flex flex-col items-center text-xs py-1.5 rounded-lg font-semibold border transition-colors ${active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}">
                <span>${l === 'all' ? 'Tất cả' : l}</span><span class="text-[10px] font-medium opacity-70">${count}</span>
            </button>`;
        }).join('');

        const select = $('category-select');
        const categories = qs.categories(f.skill);
        const byCategory = Stats.countBy(qs.filter({ ...f, category: 'all' }, extra), q => q.category);
        select.innerHTML = `<option value="all">Tất cả chủ đề</option>`
            + categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)} (${byCategory[c] || 0})</option>`).join('');
        select.value = categories.includes(f.category) ? f.category : 'all';

        $('status-select').value = f.status;
        const search = $('search-input');
        if (document.activeElement !== search) search.value = f.query;
    }

    function renderExamPanel() {
        const exam = quiz.exam;
        const summary = Stats.summarize(quiz.examQuestions(), id => quiz.examAnswer(id));
        const badge = $('exam-state-badge');
        const lines = [
            `<b>${escapeHtml(examTitle(exam))}</b>`,
            `${exam.ids.length} câu • ${exam.timeLimit ? `${exam.timeLimit} phút` : 'không giới hạn giờ'}`,
        ];
        if (exam.submittedAt) {
            badge.textContent = exam.autoSubmitted ? 'Hết giờ' : 'Đã nộp';
            badge.className = 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700';
            lines.push(`Kết quả: <b>${summary.correct}/${summary.total}</b> (${summary.score}%)`);
        } else {
            badge.textContent = 'Đang làm';
            badge.className = 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700';
            lines.push(`Đã trả lời: <b>${summary.answered}/${summary.total}</b>`);
        }
        $('exam-info').innerHTML = lines.join('<br>');
        show('exam-review-wrap', !!exam.submittedAt);
        $('exam-review-select').value = state.examFilter;
        show('show-result-btn', !!exam.submittedAt);
        $('exam-new-label').textContent = exam.submittedAt ? 'Đề mới' : 'Huỷ bài';
    }

    function renderPalette() {
        const container = $('question-palette');
        const n = state.view.length;
        $('palette-count-label').textContent = `${n} câu`;

        const reveal = state.mode === 'practice' || examSubmitted();
        const html = state.view.map((q, i) => {
            const answer = answerOf(q.id);
            const answered = hasAnswer(answer);
            const isCurrent = q.id === state.currentId;
            let cls = 'w-full aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all border ';
            if (isCurrent) cls += 'ring-2 ring-blue-600 ring-offset-1 ';
            if (!answered) {
                cls += isCurrent ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100';
            } else if (!reveal) {
                cls += isCurrent ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
            } else if (answer === q.answer) {
                cls += isCurrent ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
            } else {
                cls += isCurrent ? 'bg-rose-600 text-white border-rose-600' : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200';
            }
            return `<button data-qid="${q.id}" title="${q.id}" class="${cls}"${isCurrent ? ' data-current="1"' : ''}>${i + 1}</button>`;
        }).join('');
        container.innerHTML = html;

        const active = container.querySelector('[data-current]');
        if (active) {
            const top = active.offsetTop;
            if (top < container.scrollTop || top + active.offsetHeight > container.scrollTop + container.clientHeight) {
                container.scrollTop = top - container.clientHeight / 2;
            }
        }
    }

    function renderMain() {
        show('loading-state', false);
        const needsSetup = state.mode === 'exam' && !quiz.exam;
        const q = needsSetup ? null : current();
        show('exam-setup', needsSetup);
        show('empty-state', !needsSetup && !q);
        show('question-card', !!q);
        if (needsSetup) renderExamSetup();
        else if (!q) {
            $('empty-text').textContent = state.mode === 'exam'
                ? 'Không có câu nào trong mục xem lại này.'
                : 'Không có câu hỏi nào phù hợp với bộ lọc hoặc từ khoá tìm kiếm.';
        } else renderQuestion(q);
    }

    function renderExamSetup() {
        const pool = qs.filter(state.filters);
        $('exam-pool-info').innerHTML = `Lấy ngẫu nhiên từ <b>${pool.length}</b> câu · ${escapeHtml(describeCriteria(state.filters))}`;
        $('exam-size-group').innerHTML = EXAM_SIZES.map(size => {
            const active = size === state.examSize;
            return `<button data-size="${size}" class="py-3 rounded-xl border text-sm font-bold transition-all ${active ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}">
                ${size}<span class="block text-[11px] font-medium ${active ? 'text-blue-100' : 'text-slate-400'}">câu</span>
            </button>`;
        }).join('');
        $('exam-time-select').value = String(state.examTime);
        const short = pool.length > 0 && pool.length < state.examSize;
        show('exam-size-warning', short);
        if (short) $('exam-size-warning').textContent = `Bộ lọc chỉ có ${pool.length} câu nên đề sẽ gồm ${pool.length} câu.`;
        $('start-exam-btn').disabled = pool.length === 0;
        $('start-exam-label').textContent = pool.length ? `Bắt đầu (${Math.min(pool.length, state.examSize)} câu)` : 'Bắt đầu';

        const papers = builder.listPapers();
        $('exam-saved-papers').innerHTML = papers.length
            ? `<ul class="divide-y divide-slate-100 border border-slate-100 rounded-xl">${papers.map(p => `
                <li class="flex items-center gap-3 px-3 py-2.5">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-800 truncate">${escapeHtml(p.name)}</p>
                        <p class="text-[11px] text-slate-500">${p.questionIds.length} câu • ${p.config.timeLimit ? `${p.config.timeLimit} phút` : 'không giới hạn'}</p>
                    </div>
                    <button data-paper-start="${escapeHtml(p.id)}" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"><i class="fa-solid fa-play mr-1"></i>Làm bài</button>
                </li>`).join('')}</ul>`
            : '<p class="text-xs text-slate-500">Chưa có đề nào.</p>';
    }

    function renderPassage(q, reveal) {
        const passage = qs.passageOf(q);
        show('passage-box', !!passage);
        if (!passage) return;
        $('passage-title').textContent = passage.title;
        $('passage-genre').textContent = passage.genre ? `(${passage.genre})` : '';
        const ranges = reveal ? QuestionService.findEvidence(passage.text, q.explanation) : [];
        if (ranges.length) {
            let html = '';
            let pos = 0;
            for (const [start, end] of ranges) {
                html += escapeHtml(passage.text.slice(pos, start))
                    + `<mark class="evidence">${escapeHtml(passage.text.slice(start, end))}</mark>`;
                pos = end;
            }
            $('passage-text').innerHTML = html + escapeHtml(passage.text.slice(pos));
        } else {
            $('passage-text').textContent = passage.text;
        }
        show('passage-body', !state.passageCollapsed);
        $('passage-toggle-icon').className = `fa-solid ${state.passageCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-sky-600 text-xs`;
    }

    function renderQuestion(q) {
        const index = state.view.findIndex(x => x.id === q.id);
        const answer = answerOf(q.id);
        const reveal = feedbackVisible(q);
        const pending = state.mode === 'practice' && !reveal ? pendingFor(q) : null;
        const selected = state.mode === 'practice' ? (reveal ? answer : pending) : answer;

        $('q-number-badge').textContent = `Câu ${index + 1}/${state.view.length}`;
        $('q-skill-badge').textContent = skillLabel(q.skill);
        $('q-skill-badge').title = TYPE_LABELS[q.type] || q.type;
        $('q-level-badge').textContent = q.level;
        const diff = $('q-difficulty-badge');
        diff.textContent = DIFFICULTY_LABELS[q.difficulty] || q.difficulty;
        diff.className = `hidden sm:inline px-2.5 py-1 font-medium text-xs rounded-full ${DIFFICULTY_STYLE[q.difficulty] || 'bg-slate-100 text-slate-600'}`;
        $('q-topic-badge').textContent = q.category;
        $('q-id-badge').textContent = q.id;

        renderPassage(q, reveal);
        $('q-text').innerHTML = q.question;

        $('options-container').innerHTML = q.options.map((text, i) => {
            let btn = 'w-full text-left p-4 rounded-xl border font-medium text-sm transition-all flex items-start gap-3.5 ';
            let circle = 'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ';
            let icon = '';
            if (reveal) {
                if (i === q.answer) {
                    btn += 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm';
                    circle += 'bg-emerald-600 text-white';
                    icon = '<i class="fa-solid fa-circle-check text-emerald-600 text-lg ml-auto my-auto"></i>';
                } else if (answer === i) {
                    btn += 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm';
                    circle += 'bg-rose-600 text-white';
                    icon = '<i class="fa-solid fa-circle-xmark text-rose-600 text-lg ml-auto my-auto"></i>';
                } else {
                    btn += 'bg-white border-slate-200 text-slate-400 opacity-60';
                    circle += 'bg-slate-100 text-slate-600';
                }
                btn += ' cursor-default';
            } else if (selected === i) {
                btn += 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20';
                circle += 'bg-blue-600 text-white';
            } else {
                btn += 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300';
                circle += 'bg-slate-100 text-slate-600';
            }
            return `<button data-option="${i}" class="${btn}"${reveal ? ' aria-disabled="true"' : ''}>
                <span class="${circle}">${LETTERS[i]}</span>
                <span class="mt-0.5 leading-relaxed flex-1">${escapeHtml(text)}</span>
                ${icon}
            </button>`;
        }).join('');

        const hint = $('answer-hint');
        if (state.mode === 'practice' && !reveal && pending === null) {
            hint.textContent = 'Chọn một đáp án, rồi bấm Kiểm tra.';
            show(hint, true);
        } else if (state.mode === 'exam' && quiz.examActive) {
            hint.textContent = 'Đáp án hiện sau khi nộp bài.';
            show(hint, true);
        } else {
            show(hint, false);
        }

        show('feedback-box', reveal);
        if (reveal) $('feedback-box').innerHTML = feedbackHtml(q, answer);

        const checkBtn = $('check-btn');
        show(checkBtn, state.mode === 'practice' && !reveal);
        checkBtn.disabled = pending === null;

        $('prev-btn').disabled = index <= 0;
        $('next-btn').disabled = index >= state.view.length - 1;
        show('submit-exam-btn', state.mode === 'exam' && quiz.examActive);
    }

    function optionLabel(q, i) {
        return `${LETTERS[i]}. ${escapeHtml(q.options[i])}`;
    }

    /** Ghi chú cho các phương án sai: lấy từ dữ liệu (optionNotes); câu tìm lỗi sai thì các phần còn lại là đúng. */
    function otherOptionNotes(q, answer) {
        const notes = [];
        q.options.forEach((opt, i) => {
            if (i === q.answer) return;
            let text = q.optionNotes ? q.optionNotes[opt] : null;
            if (!text && q.type === 'error') text = 'Phần này dùng đúng, không cần sửa.';
            if (text) notes.push({ i, text, chosen: i === answer });
        });
        return notes.sort((a, b) => Number(b.chosen) - Number(a.chosen));
    }

    function feedbackHtml(q, answer) {
        const answered = hasAnswer(answer);
        const correct = answered && answer === q.answer;
        const tone = correct
            ? { box: 'bg-emerald-50 border-emerald-200 text-emerald-900', icon: 'fa-circle-check text-emerald-600', title: 'Chính xác!' }
            : answered
                ? { box: 'bg-rose-50 border-rose-200 text-rose-900', icon: 'fa-circle-xmark text-rose-600', title: 'Chưa chính xác.' }
                : { box: 'bg-slate-50 border-slate-200 text-slate-800', icon: 'fa-circle-minus text-slate-500', title: 'Bạn chưa trả lời câu này.' };

        const lines = [`Đáp án đúng: <b>${optionLabel(q, q.answer)}</b>`];
        if (answered && !correct) lines.push(`Bạn đã chọn: <b>${optionLabel(q, answer)}</b>`);
        if (q.correction) lines.push(`<i class="fa-solid fa-pen mr-1"></i>Sửa: <b>${escapeHtml(q.options[q.answer])}</b> → <b>${escapeHtml(q.correction)}</b>`);
        const retry = state.mode === 'practice'
            ? `<button data-action="retry" class="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">
                <i class="fa-solid fa-rotate-left"></i> Làm lại</button>`
            : '';

        let heading = EXPLANATION_HEADINGS[q.skill] || 'Giải thích';
        if (q.type === 'error') heading = 'Lỗi sai và cách sửa';
        else if (q.skill === 'completion_error') heading = 'Quy tắc ngữ pháp';

        let evidence = '';
        if (q.passageId) {
            const passage = qs.passageOf(q);
            const found = passage && QuestionService.findEvidence(passage.text, q.explanation).length;
            evidence = found
                ? '<p class="mt-2 text-[11px] text-sky-800"><i class="fa-solid fa-highlighter mr-1"></i>Phần được tô vàng trong bài đọc là căn cứ cho đáp án.</p>'
                : '';
        }

        const notes = otherOptionNotes(q, answer);
        const notesHtml = notes.length
            ? `<div class="mt-3 pt-3 border-t border-amber-200/70">
                <p class="font-semibold text-amber-950 text-xs mb-1.5">Vì sao các phương án khác chưa đúng</p>
                <ul class="space-y-1 text-xs text-slate-700">${notes.map(n => `
                    <li class="${n.chosen ? 'text-rose-800' : ''}"><b>${optionLabel(q, n.i)}</b>${n.chosen ? ' <span class="text-[10px] font-semibold uppercase">(bạn chọn)</span>' : ''} — ${escapeHtml(n.text)}</li>`).join('')}
                </ul></div>`
            : '';

        const needsReview = q.status === 'needs_review' || q.status === 'needs_ent104_verification';
        const reviewNote = needsReview
            ? `<p class="mt-2 text-[11px] text-slate-500 italic">Trạng thái: ${escapeHtml(STATUS_LABELS[q.status])}${q.reviewNote ? ` — ${escapeHtml(q.reviewNote)}` : ''}</p>`
            : '';

        return `
            <div data-feedback="${correct ? 'correct' : answered ? 'wrong' : 'unanswered'}" class="p-4 rounded-xl border ${tone.box}">
                <div class="flex items-start gap-3">
                    <i class="fa-solid ${tone.icon} text-xl mt-0.5"></i>
                    <div class="flex-1 text-sm leading-relaxed">
                        <p class="font-bold">${tone.title}</p>
                        ${lines.map(l => `<p>${l}</p>`).join('')}
                    </div>
                    ${retry}
                </div>
            </div>
            <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                <div class="flex items-start gap-2.5">
                    <i class="fa-solid fa-lightbulb text-amber-600 mt-0.5 text-base"></i>
                    <div class="flex-1">
                        <span class="font-bold text-amber-950 block mb-1">${escapeHtml(heading)}</span>
                        <p class="leading-relaxed text-slate-700 text-xs sm:text-sm">${escapeHtml(q.explanation)}</p>
                        ${evidence}
                        ${notesHtml}
                        ${reviewNote}
                    </div>
                </div>
            </div>`;
    }

    // ------------------------------------------------------------------ timer

    function updateTimer() {
        const active = !!quiz && quiz.examActive && quiz.examDeadline !== null;
        const timers = document.querySelectorAll('[data-timer]');
        show('exam-panel-timer', active && state.mode === 'exam');
        show('q-timer-badge', active && state.mode === 'exam');
        if (!active) return;
        const remaining = quiz.remainingMs();
        const text = Stats.formatDuration(remaining);
        timers.forEach(el => { el.textContent = text; });
        const urgent = remaining <= 60000;
        $('exam-panel-timer').className = `text-center rounded-xl border px-3 py-2 ${urgent ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-blue-50 border-blue-100 text-blue-800'}`
            + (state.mode === 'exam' ? '' : ' hidden');
        $('q-timer-badge').className = `px-2.5 py-1 font-semibold text-xs rounded-full border ${urgent ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`
            + (state.mode === 'exam' ? '' : ' hidden');
    }

    function tick() {
        if (!quiz) return;
        if (quiz.isExpired()) {
            autoSubmit();
            return;
        }
        updateTimer();
    }

    function autoSubmit() {
        const summary = Stats.summarize(quiz.examQuestions(), id => quiz.examAnswer(id));
        afterExamSubmit(quiz.submitExam(summary, { auto: true }));
        state.mode = 'exam';
        state.examFilter = 'all';
        state.resultFilter = 'all';
        refreshView({ keepCurrent: true });
        showResult();
    }

    // ------------------------------------------------------------------ actions

    function choose(index) {
        const q = current();
        if (!q || index < 0 || index > 3) return;
        if (state.mode === 'exam') {
            if (quiz.isExpired()) return autoSubmit();
            if (quiz.answerExam(q.id, index)) render();
            return;
        }
        if (hasAnswer(quiz.practiceAnswer(q.id))) return;
        state.pending = { id: q.id, index };
        render();
    }

    function confirmAnswer() {
        const q = current();
        const index = pendingFor(q);
        if (state.mode !== 'practice' || index === null) return;
        state.pending = null;
        if (!quiz.answerPractice(q.id, index)) return;
        review.record(q.id, index === q.answer);
        review.logActivity(1);
        render();
    }

    /** Sau khi nộp bài thi: câu sai vào lịch ôn, số câu đã làm tính vào mục tiêu ngày. */
    function afterExamSubmit(entry) {
        if (!entry) return;
        const list = quiz.examQuestions();
        review.addWrong(list.filter(q => quiz.examStatus(q) === 'wrong').map(q => q.id));
        review.logActivity(entry.total - entry.unanswered);
    }

    function startReview() {
        const ids = review.dueIds(id => qs.byId.has(id));
        if (!ids.length) return;
        quiz.clearPractice(ids);
        state.mode = 'practice';
        state.review = ids;
        state.examFilter = 'all';
        state.pending = null;
        state.panel = null;
        refreshView({ keepCurrent: false });
        window.scrollTo(0, 0);
    }

    function exitReview() {
        state.review = null;
        state.pending = null;
        setMode('home');
    }

    function retryQuestion() {
        const q = current();
        if (!q || state.mode !== 'practice') return;
        quiz.clearPractice([q.id]);
        state.pending = null;
        render();
    }

    function setMode(mode) {
        if (!MODES.includes(mode) || (mode === state.mode && !(mode === 'practice' && state.review))) return;
        if (state.mode === 'writing') writingView.saveDraft();
        state.mode = mode;
        state.review = null;
        state.examFilter = 'all';
        state.pending = null;
        state.panel = null;
        refreshView({ keepCurrent: false });
        window.scrollTo(0, 0);
    }

    function updateFilters(patch) {
        Object.assign(state.filters, patch);
        state.review = null;
        refreshView();
    }

    /** Bắt đầu một bài thi từ danh sách câu đã sắp sẵn (đề nhanh, đề đã lưu hoặc đề đang soạn). */
    function beginExam(questions, meta) {
        if (!questions.length) return false;
        if (quiz.examActive && !confirm('Bạn đang có một bài thi chưa nộp. Huỷ bài đó để bắt đầu đề này?')) return false;
        quiz.startExam(questions, meta);
        state.mode = 'exam';
        state.examFilter = 'all';
        state.resultFilter = 'all';
        state.pending = null;
        closeModals();
        refreshView({ keepCurrent: false });
        return true;
    }

    function startQuickExam() {
        const pool = qs.filter(state.filters);
        if (!pool.length) return;
        const ids = builder.quickPaper(pool, state.examSize);
        const { skill, level, category, query } = state.filters;
        beginExam(ids.map(id => qs.byId.get(id)), { criteria: { skill, level, category, query }, timeLimit: state.examTime });
    }

    function startSavedPaper(paperId) {
        const paper = builder.getPaper(paperId);
        if (!paper) return;
        const { questions, missing } = builder.resolvePaper(paper);
        if (!questions.length) {
            alert('Không còn câu hỏi nào của đề này trong ngân hàng hiện tại.');
            return;
        }
        if (missing.length && !confirm(`${missing.length} câu của đề không còn trong ngân hàng (${missing.join(', ')}). Làm bài với ${questions.length} câu còn lại?`)) return;
        beginExam(questions, { title: paper.name, paperId: paper.id, timeLimit: paper.config.timeLimit });
    }

    function submitExam() {
        const summary = Stats.summarize(quiz.examQuestions(), id => quiz.examAnswer(id));
        if (summary.unanswered > 0
            && !confirm(`Bạn còn ${summary.unanswered}/${summary.total} câu chưa trả lời. Vẫn nộp bài?`)) return;
        if (quiz.isExpired()) return autoSubmit();
        afterExamSubmit(quiz.submitExam(summary));
        state.examFilter = 'all';
        state.resultFilter = 'all';
        refreshView();
        showResult();
    }

    function newExam() {
        if (quiz.examActive && !confirm('Huỷ đề thi đang làm? Các câu trả lời của đề này sẽ bị xoá.')) return;
        quiz.clearExam();
        state.examFilter = 'all';
        closeModals();
        refreshView({ keepCurrent: false });
    }

    function reviewExam(filter, id = null) {
        state.examFilter = filter;
        closeModals();
        refreshView({ keepCurrent: false });
        if (id && state.view.some(q => q.id === id)) goTo(id);
    }

    function resetAll() {
        if (state.mode === 'exam') {
            if (quiz.exam) newExam();
            return;
        }
        const answered = Object.keys(quiz.practice).length;
        if (!answered && !review.scheduled) return;
        if (!confirm(`Xoá toàn bộ tiến độ luyện tập (${answered} câu đã làm) và lịch ôn tập?`)) return;
        quiz.clearPractice();
        review.forget();
        state.review = null;
        state.pending = null;
        refreshView();
    }

    // ------------------------------------------------------------------ modals

    function closeModals() {
        show('result-modal', false);
        show('stats-modal', false);
    }

    function breakdownRows(rows, labelOf) {
        return rows.map(r => `<div class="flex justify-between py-1 border-b border-slate-100">
            <span>${escapeHtml(labelOf(r.key))}</span>
            <span class="font-semibold text-slate-800">${r.correct}/${r.total}</span>
        </div>`).join('');
    }

    function renderResultList() {
        const list = quiz.examQuestions();
        const wrongCount = list.filter(q => quiz.examStatus(q) !== 'correct').length;
        $('result-list-filter').innerHTML = [['all', `Tất cả (${list.length})`], ['wrong', `Sai & chưa làm (${wrongCount})`]]
            .map(([key, label]) => `<button data-result-filter="${key}" class="px-2.5 py-1 rounded-md ${state.resultFilter === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}">${label}</button>`)
            .join('');
        const rows = list
            .map((q, i) => ({ q, i, status: quiz.examStatus(q), answer: quiz.examAnswer(q.id) }))
            .filter(r => state.resultFilter === 'all' || r.status !== 'correct');
        const icon = {
            correct: '<i class="fa-solid fa-circle-check text-emerald-600"></i>',
            wrong: '<i class="fa-solid fa-circle-xmark text-rose-600"></i>',
            unanswered: '<i class="fa-solid fa-circle-minus text-slate-400"></i>',
        };
        $('result-question-list').innerHTML = rows.length
            ? rows.map(r => `<button data-review-id="${r.q.id}" class="w-full text-left flex items-center gap-3 px-3 py-2 text-xs hover:bg-slate-50">
                <span class="w-6 font-bold text-slate-500 text-right">${r.i + 1}.</span>
                ${icon[r.status]}
                <span class="flex-1 min-w-0">
                    <span class="font-mono text-[10px] text-slate-400 mr-1">${r.q.id}</span>
                    <span class="text-slate-700">${escapeHtml(skillLabel(r.q.skill))} • ${escapeHtml(r.q.category)}</span>
                </span>
                <span class="text-right whitespace-nowrap">
                    <span class="${r.status === 'wrong' ? 'text-rose-700' : 'text-slate-500'}">Bạn chọn: <b>${hasAnswer(r.answer) ? LETTERS[r.answer] : '—'}</b></span>
                    <span class="text-emerald-700 ml-2">Đáp án: <b>${LETTERS[r.q.answer]}</b></span>
                </span>
            </button>`).join('')
            : '<p class="px-3 py-3 text-xs text-slate-500">Không có câu sai hoặc bỏ trống. 🎉</p>';
    }

    function showResult() {
        const exam = quiz.exam;
        if (!exam || !exam.submittedAt) return;
        const list = quiz.examQuestions();
        const answerFn = id => quiz.examAnswer(id);
        const summary = Stats.summarize(list, answerFn);
        $('final-score').textContent = `${summary.score}%`;
        $('final-accuracy').textContent = `${summary.correct}/${summary.total}`;
        $('final-time').textContent = Stats.formatDuration(exam.submittedAt - exam.startedAt);
        $('result-subtitle').textContent = `${summary.correct} đúng • ${summary.wrong} sai • ${summary.unanswered} bỏ trống`;
        show('result-auto-note', !!exam.autoSubmitted);
        const bySkill = Stats.breakdown(list, answerFn, q => q.skill, SKILLS.map(s => s.key));
        const byLevel = Stats.breakdown(list, answerFn, q => q.level, LEVELS);
        $('result-breakdown').innerHTML =
            `<details><summary class="cursor-pointer font-semibold text-slate-500 text-xs"><i class="fa-solid fa-chart-simple mr-1"></i>Chi tiết theo kỹ năng và trình độ</summary>
                <div class="mt-2"><p class="font-bold uppercase tracking-wider text-slate-400 text-[11px] mb-1">Kỹ năng</p>${breakdownRows(bySkill, skillLabel)}
                <p class="font-bold uppercase tracking-wider text-slate-400 text-[11px] mt-3 mb-1">Trình độ</p>${breakdownRows(byLevel, k => k)}</div>
            </details>`;
        renderResultList();
        $('result-review-wrong-btn').disabled = summary.wrong + summary.unanswered === 0;
        $('result-review-wrong-btn').classList.toggle('opacity-40', summary.wrong + summary.unanswered === 0);
        show('result-modal', true);
    }

    function statsTable(title, rows, labelOf) {
        const body = rows.map(r => `<tr class="border-b border-slate-100">
            <td class="py-1.5 pr-2">${escapeHtml(labelOf(r.key))}</td>
            <td class="py-1.5 text-right">${r.total}</td>
            <td class="py-1.5 text-right">${r.answered}</td>
            <td class="py-1.5 text-right text-emerald-700">${r.correct}</td>
            <td class="py-1.5 text-right text-rose-700">${r.wrong}</td>
            <td class="py-1.5 text-right font-semibold">${r.answered ? r.accuracy + '%' : '—'}</td>
        </tr>`).join('');
        return `<div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">${title}</h3>
            <div class="overflow-x-auto"><table class="w-full text-xs">
                <thead><tr class="text-slate-400 border-b border-slate-200">
                    <th class="text-left font-semibold py-1.5">Nhóm</th><th class="text-right font-semibold">Tổng</th>
                    <th class="text-right font-semibold">Đã làm</th><th class="text-right font-semibold">Đúng</th>
                    <th class="text-right font-semibold">Sai</th><th class="text-right font-semibold">Tỉ lệ</th>
                </tr></thead>
                <tbody class="text-slate-700">${body}</tbody>
            </table></div>
        </div>`;
    }

    function showStats() {
        const all = qs.questions;
        const answerFn = id => quiz.practiceAnswer(id);
        const s = Stats.summarize(all, answerFn);
        const bySkill = Stats.breakdown(all, answerFn, q => q.skill, SKILLS.map(x => x.key));
        const byLevel = Stats.breakdown(all, answerFn, q => q.level, LEVELS);
        const byStatus = Stats.countBy(all, q => q.status);

        const history = quiz.history.length
            ? quiz.history.map(h => `<tr class="border-b border-slate-100">
                <td class="py-1.5">${new Date(h.at).toLocaleString('vi-VN')}</td>
                <td class="py-1.5">${escapeHtml(h.title || `Đề ngẫu nhiên: ${describeCriteria(h.criteria || DEFAULT_FILTERS)}`)}${h.autoSubmitted ? ' <span class="text-amber-700">(hết giờ)</span>' : ''}</td>
                <td class="py-1.5 text-right">${h.correct}/${h.total}</td>
                <td class="py-1.5 text-right font-semibold">${h.score}%</td>
                <td class="py-1.5 text-right">${Stats.formatDuration(h.durationMs)}</td>
            </tr>`).join('')
            : '<tr><td colspan="5" class="py-2 text-slate-400">Chưa có bài thi nào.</td></tr>';

        $('stats-content').innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100"><span class="block font-bold text-lg">${s.answered}/${s.total}</span><span class="text-[11px] text-slate-500">Đã luyện</span></div>
                <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-100"><span class="block font-bold text-lg text-emerald-600">${s.correct}</span><span class="text-[11px] text-emerald-600">Đúng</span></div>
                <div class="bg-rose-50 p-3 rounded-xl border border-rose-100"><span class="block font-bold text-lg text-rose-600">${s.wrong}</span><span class="text-[11px] text-rose-600">Sai</span></div>
                <div class="bg-blue-50 p-3 rounded-xl border border-blue-100"><span class="block font-bold text-lg text-blue-600">${s.answered ? s.accuracy + '%' : '—'}</span><span class="text-[11px] text-blue-600">Tỉ lệ đúng</span></div>
            </div>
            ${statsTable('Luyện tập theo kỹ năng', bySkill, skillLabel)}
            ${statsTable('Luyện tập theo trình độ', byLevel, k => k)}
            <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Các lần thi thử</h3>
                <div class="overflow-x-auto"><table class="w-full text-xs text-slate-700">
                    <thead><tr class="text-slate-400 border-b border-slate-200">
                        <th class="text-left font-semibold py-1.5">Ngày</th><th class="text-left font-semibold">Đề</th>
                        <th class="text-right font-semibold">Đúng</th><th class="text-right font-semibold">Điểm</th><th class="text-right font-semibold">Thời gian</th>
                    </tr></thead>
                    <tbody>${history}</tbody>
                </table></div>
            </div>
            <details class="text-[11px] text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                <summary class="cursor-pointer font-semibold">Trạng thái kiểm duyệt câu hỏi</summary>
                <p class="mt-1">${Object.entries(byStatus).map(([k, v]) => `${escapeHtml(STATUS_LABELS[k] || k)}: ${v}`).join(' • ')}.
                Chưa có câu nào được giáo viên duyệt hoặc đối chiếu với đề cương ENT104.</p>
            </details>`;
        show('stats-modal', true);
    }

    // ------------------------------------------------------------------ events

    function bindEvents() {
        document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
        document.querySelectorAll('[data-mode-link]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.modeLink)));
        $('home-progress').addEventListener('click', e => {
            if (!e.target.closest('[data-home-continue]')) return;
            setMode('practice');
            const next = state.view.find(q => !hasAnswer(quiz.practiceAnswer(q.id)));
            if (next) goTo(next.id);
        });
        $('home-today').addEventListener('click', e => {
            if (e.target.closest('[data-review-start]')) startReview();
        });
        $('home-today').addEventListener('change', e => {
            if (!e.target.matches('[data-home-goal]')) return;
            review.goal = Number(e.target.value);
            renderToday();
        });
        $('review-exit-btn').addEventListener('click', exitReview);
        document.querySelectorAll('[data-panel-close]').forEach(btn => btn.addEventListener('click', () => {
            state.panel = null;
            render();
            $('question-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }));
        document.querySelectorAll('[data-panel]').forEach(btn => btn.addEventListener('click', () => {
            state.panel = state.panel === btn.dataset.panel ? null : btn.dataset.panel;
            render();
        }));
        $('stats-btn').addEventListener('click', showStats);
        $('reset-btn').addEventListener('click', resetAll);

        $('skill-filter').addEventListener('click', e => {
            const btn = e.target.closest('[data-skill]');
            if (btn) updateFilters({ skill: btn.dataset.skill, category: 'all' });
        });
        $('level-filter').addEventListener('click', e => {
            const btn = e.target.closest('[data-level]');
            if (btn) updateFilters({ level: btn.dataset.level });
        });
        $('category-select').addEventListener('change', e => updateFilters({ category: e.target.value }));
        $('status-select').addEventListener('change', e => updateFilters({ status: e.target.value }));
        $('clear-filters-btn').addEventListener('click', () => {
            state.filters = { ...DEFAULT_FILTERS };
            $('search-input').value = '';
            refreshView();
        });
        $('review-wrong-btn').addEventListener('click', () => updateFilters({ status: 'wrong' }));

        let searchTimer = null;
        $('search-input').addEventListener('input', e => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => updateFilters({ query: e.target.value.trim() }), 200);
        });

        $('question-palette').addEventListener('click', e => {
            const btn = e.target.closest('[data-qid]');
            if (!btn) return;
            if (state.panel === 'map') state.panel = null;
            goTo(btn.dataset.qid);
        });
        $('options-container').addEventListener('click', e => {
            const btn = e.target.closest('[data-option]');
            if (btn) choose(Number(btn.dataset.option));
        });
        $('check-btn').addEventListener('click', confirmAnswer);
        $('feedback-box').addEventListener('click', e => {
            if (e.target.closest('[data-action="retry"]')) retryQuestion();
        });
        $('prev-btn').addEventListener('click', () => navigate(-1));
        $('next-btn').addEventListener('click', () => navigate(1));
        $('submit-exam-btn').addEventListener('click', submitExam);
        $('passage-toggle').addEventListener('click', () => {
            state.passageCollapsed = !state.passageCollapsed;
            render();
        });
        $('q-id-badge').addEventListener('click', () => {
            const id = $('q-id-badge').textContent;
            if (navigator.clipboard) navigator.clipboard.writeText(id).catch(() => {});
        });

        $('exam-size-group').addEventListener('click', e => {
            const btn = e.target.closest('[data-size]');
            if (!btn) return;
            state.examSize = Number(btn.dataset.size);
            render();
        });
        $('exam-time-select').addEventListener('change', e => {
            state.examTime = Number(e.target.value) || 0;
            saveUi();
        });
        $('start-exam-btn').addEventListener('click', startQuickExam);
        $('exam-saved-papers').addEventListener('click', e => {
            const btn = e.target.closest('[data-paper-start]');
            if (btn) startSavedPaper(btn.dataset.paperStart);
        });
        $('exam-review-select').addEventListener('change', e => reviewExam(e.target.value));
        $('show-result-btn').addEventListener('click', showResult);
        $('exam-new-btn').addEventListener('click', newExam);
        $('result-review-wrong-btn').addEventListener('click', () => reviewExam('wrong'));
        $('result-review-all-btn').addEventListener('click', () => reviewExam('all'));
        $('result-new-exam-btn').addEventListener('click', newExam);
        $('result-list-filter').addEventListener('click', e => {
            const btn = e.target.closest('[data-result-filter]');
            if (!btn) return;
            state.resultFilter = btn.dataset.resultFilter;
            renderResultList();
        });
        $('result-question-list').addEventListener('click', e => {
            const btn = e.target.closest('[data-review-id]');
            if (btn) reviewExam(state.resultFilter, btn.dataset.reviewId);
        });
        $('stats-close-btn').addEventListener('click', closeModals);
        ['result-modal', 'stats-modal'].forEach(id => $(id).addEventListener('click', e => {
            if (e.target.id === id) closeModals();
        }));

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') return closeModals();
            const modalOpen = !$('result-modal').classList.contains('hidden') || !$('stats-modal').classList.contains('hidden');
            if (modalOpen || PANEL_MODES.includes(state.mode) || e.ctrlKey || e.metaKey || e.altKey) return;
            const target = e.target instanceof Element ? e.target : null;
            if (target && target.closest('input, select, textarea')) return;
            if (e.key === 'Enter') {
                if (target && target.closest('button') && !target.closest('[data-option]')) return;
                if (state.mode === 'practice' && pendingFor(current()) !== null) {
                    e.preventDefault();
                    confirmAnswer();
                }
                return;
            }
            const key = e.key.toLowerCase();
            if (['1', '2', '3', '4'].includes(key)) choose(Number(key) - 1);
            else if (['a', 'b', 'c', 'd'].includes(key)) choose(LETTERS.indexOf(key.toUpperCase()));
            else if (e.key === 'ArrowLeft') navigate(-1);
            else if (e.key === 'ArrowRight') navigate(1);
            else if (e.key === '/' && !$('search-card').classList.contains('hidden')) {
                e.preventDefault();
                $('search-input').focus();
            }
        });
    }

    // ------------------------------------------------------------------ init

    async function init() {
        try {
            await qs.load();
        } catch (e) {
            console.error(e);
            show('loading-state', false);
            show('error-state', true);
            $('error-text').textContent = e.message;
            $('app-subtitle').textContent = 'Question bank unavailable';
            return;
        }
        quiz = new QuizService(qs);
        review = new ReviewService();
        review.seed(Object.keys(quiz.practice).filter(id => qs.byId.has(id) && quiz.practiceStatus(qs.byId.get(id)) === 'wrong'));
        builder = new ExamBuilderService(qs);
        builderView = ExamBuilderView.create({
            qs,
            builder,
            quiz,
            onStart: (questions, meta) => beginExam(questions, meta),
        });
        const appConfig = window.APP_CONFIG || {};
        const writingService = new WritingService({ apiBase: appConfig.writingApiBase || '' });
        writingView = WritingView.create({ service: writingService });
        tenseView = TenseView.create({
            service: new TenseService(),
            access: writingService,
            questions: () => qs.questions,
            onAnswer: (q, correct) => {
                if (qs.byId.has(q.id)) review.record(q.id, correct);
                review.logActivity(1);
            },
        });
        restoreUi();
        $('data-source').textContent = `Dữ liệu: ${qs.source === 'json' ? 'data/questions.json' : 'data/question-bank.bundle.js'}`
            + (qs.skipped.length ? ` (bỏ qua ${qs.skipped.length} câu không hợp lệ)` : '') + '.';
        bindEvents();
        refreshView();
        if (quiz.isExpired()) autoSubmit();
        setInterval(tick, 1000);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
