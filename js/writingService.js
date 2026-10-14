/**
 * Writing: đề bài, đếm từ, giới hạn bài viết, định vị lỗi trong bài, gọi API chấm bài, lưu bản nháp / lịch sử.
 * Các hàm thuần (countWords, checkSubmission, locateCorrections…) dùng chung cho trình duyệt và server Node.
 */
(function (global) {
    'use strict';

    const LEVELS = ['A1', 'A2', 'B1'];
    const TYPES = {
        descriptive: 'Descriptive paragraph',
        narrative: 'Narrative paragraph',
    };
    const CRITERIA = [
        { key: 'task', label: 'Hoàn thành yêu cầu', en: 'Task achievement' },
        { key: 'grammar', label: 'Ngữ pháp', en: 'Grammar' },
        { key: 'vocabulary', label: 'Từ vựng', en: 'Vocabulary' },
        { key: 'organization', label: 'Bố cục & liên kết', en: 'Organization' },
    ];
    const CORRECTION_TYPES = {
        grammar: 'Ngữ pháp',
        vocabulary: 'Từ vựng',
        spelling: 'Chính tả',
        punctuation: 'Dấu câu / viết hoa',
        word_order: 'Trật tự từ',
        style: 'Văn phong',
    };
    /** Nhóm lỗi để hiển thị: ngữ pháp (cả dấu câu, trật tự từ) và từ vựng (cả chính tả, văn phong). */
    const CORRECTION_GROUPS = {
        grammar: { label: 'Lỗi ngữ pháp', types: ['grammar', 'word_order', 'punctuation'] },
        vocabulary: { label: 'Lỗi từ vựng', types: ['vocabulary', 'spelling', 'style'] },
    };
    const correctionGroup = type => (CORRECTION_GROUPS.vocabulary.types.includes(type) ? 'vocabulary' : 'grammar');
    const MAX_SCORE = 10;
    /** Giới hạn cứng – server từ chối bài ngoài khoảng này (giới hạn chi phí gọi AI). */
    const LIMITS = { minWords: 20, maxWords: 400, maxChars: 3000 };
    const STORE_KEY = 'ent104.writing.v1';
    const ACCESS_KEY = 'ent104.writing.access';
    const MAX_ATTEMPTS_PER_TASK = 5;
    const REQUEST_TIMEOUT_MS = 90000;

    const WORD_RE = /[A-Za-zÀ-ỹ0-9]+(?:['’-][A-Za-zÀ-ỹ0-9]+)*/g;

    function countWords(text) {
        const m = String(text || '').match(WORD_RE);
        return m ? m.length : 0;
    }

    /** Kiểm tra trước khi gửi: lỗi chặn gửi bài, cảnh báo chỉ để nhắc người học. */
    function checkSubmission(task, text) {
        const raw = String(text || '');
        const words = countWords(raw);
        const warnings = [];
        let error = null;
        if (!raw.trim()) error = 'Bạn chưa viết gì.';
        else if (raw.length > LIMITS.maxChars) error = `Bài viết quá dài (tối đa ${LIMITS.maxChars} ký tự).`;
        else if (words < LIMITS.minWords) error = `Bài viết cần ít nhất ${LIMITS.minWords} từ để được chấm.`;
        else if (words > LIMITS.maxWords) error = `Bài viết quá dài (tối đa ${LIMITS.maxWords} từ).`;
        if (!error && task) {
            const cap = lengthCap(task, words);
            if (words < task.minWords) warnings.push(`Đoạn văn mới có ${words} từ; yêu cầu khoảng ${task.targetWords} từ (${task.minWords}–${task.maxWords}). Điểm "Hoàn thành yêu cầu" tối đa ${cap}/${MAX_SCORE}.`);
            if (words > task.maxWords) warnings.push(`Đoạn văn có ${words} từ, dài hơn yêu cầu (${task.minWords}–${task.maxWords} từ). Điểm "Hoàn thành yêu cầu" tối đa ${cap}/${MAX_SCORE}.`);
            if (/\n\s*\n/.test(raw.trim())) warnings.push('Yêu cầu là MỘT đoạn văn – nên viết liền, không tách thành nhiều đoạn.');
        }
        return { ok: !error, error, warnings, words };
    }

    /** Điểm tối đa của tiêu chí "Hoàn thành yêu cầu" theo độ dài (yêu cầu đoạn văn gần ~150 từ). */
    function lengthCap(task, words) {
        if (!task) return MAX_SCORE;
        if (words > task.maxWords) return 8;
        if (words >= task.minWords) return MAX_SCORE;
        if (words >= Math.round(task.minWords * 0.85)) return 7;
        if (words >= Math.round(task.minWords * 0.6)) return 5;
        return 3;
    }

    /** Điểm tổng = trung bình các tiêu chí, làm tròn tới 0,5. */
    function overallScore(criteria) {
        const scores = CRITERIA.map(c => criteria && criteria[c.key] ? criteria[c.key].score : null);
        if (scores.some(s => typeof s !== 'number')) return null;
        return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 2) / 2;
    }

    /**
     * Tìm vị trí phần sai (`original`) trong bài viết. Mỗi lỗi chiếm một khoảng không chồng lên lỗi khác;
     * lỗi không tìm thấy nguyên văn có start = null (vẫn hiện trong danh sách, chỉ không tô trong bài).
     */
    function locateCorrections(text, corrections) {
        const src = String(text || '');
        const lower = src.toLowerCase();
        const taken = [];
        const free = (s, e) => taken.every(([a, b]) => e <= a || s >= b);
        const isWord = ch => !!ch && /[A-Za-zÀ-ỹ0-9']/.test(ch);
        // Không nhận khớp nằm giữa một từ (vd. "i" trong "his").
        const bounded = (at, needle) => (!isWord(needle[0]) || !isWord(src[at - 1]))
            && (!isWord(needle[needle.length - 1]) || !isWord(src[at + needle.length]));
        const find = (hay, needle) => {
            let from = 0;
            while (from <= hay.length) {
                const at = hay.indexOf(needle, from);
                if (at < 0) return -1;
                if (free(at, at + needle.length) && bounded(at, needle)) return at;
                from = at + 1;
            }
            return -1;
        };
        return (corrections || []).map(c => {
            const needle = String(c.original || '');
            let start = needle ? find(src, needle) : -1;
            if (start < 0 && needle) start = find(lower, needle.toLowerCase());
            if (start < 0) return { ...c, start: null, end: null };
            taken.push([start, start + needle.length]);
            return { ...c, start, end: start + needle.length };
        });
    }

    /** Cắt bài viết thành các đoạn để hiển thị: { text, index } với index là số thứ tự lỗi (hoặc null). */
    function segments(text, located) {
        const src = String(text || '');
        const marks = located
            .map((c, index) => ({ start: c.start, end: c.end, index }))
            .filter(m => m.start !== null)
            .sort((a, b) => a.start - b.start);
        const out = [];
        let pos = 0;
        for (const m of marks) {
            if (m.start > pos) out.push({ text: src.slice(pos, m.start), index: null });
            out.push({ text: src.slice(m.start, m.end), index: m.index });
            pos = m.end;
        }
        if (pos < src.length) out.push({ text: src.slice(pos), index: null });
        return out;
    }

    /** Kiểm tra một đề bài; trả về danh sách lỗi (rỗng = hợp lệ). */
    function validateTask(t) {
        const problems = [];
        const str = (v, n = 1) => typeof v === 'string' && v.trim().length >= n;
        if (!t || typeof t !== 'object') return ['không phải object'];
        if (!/^WT-(A1|A2|B1)-\d{2}$/.test(t.id || '')) problems.push('id sai định dạng WT-<LEVEL>-NN');
        if (!LEVELS.includes(t.level)) problems.push(`level không hợp lệ: ${t.level}`);
        else if (!String(t.id).includes(`-${t.level}-`)) problems.push('id không khớp level');
        if (!TYPES[t.type]) problems.push(`type không hợp lệ: ${t.type}`);
        if (!str(t.title, 3)) problems.push('thiếu title');
        if (!str(t.prompt, 10)) problems.push('thiếu prompt');
        if (!str(t.promptVi, 10)) problems.push('thiếu promptVi');
        if (!Array.isArray(t.requirements) || t.requirements.length < 2 || !t.requirements.every(r => str(r, 3))) problems.push('requirements cần ≥ 2 ý');
        if (![t.minWords, t.targetWords, t.maxWords].every(Number.isInteger) || t.minWords < LIMITS.minWords
            || !(t.minWords <= t.targetWords && t.targetWords <= t.maxWords) || t.maxWords > LIMITS.maxWords) {
            problems.push('minWords ≤ targetWords ≤ maxWords không hợp lệ');
        }
        if (!Array.isArray(t.tips) || !t.tips.every(x => str(x, 3))) problems.push('tips phải là danh sách chuỗi');
        const expectedSource = t.level === 'B1' ? 'general_b1' : 'general_a1_a2';
        if (t.source !== expectedSource && t.source !== 'ent104_verified') problems.push(`source phải là ${expectedSource}`);
        if (t.source !== 'ent104_verified' && t.unit !== null) problems.push('unit phải là null với nguồn tổng quát');
        return problems;
    }

    class WritingService {
        constructor({ storage = global.AppStorage, fetchImpl = global.fetch && global.fetch.bind(global), apiBase = '', dataBase = '' } = {}) {
            this.storage = storage;
            this.fetch = fetchImpl;
            this.apiBase = apiBase && !apiBase.endsWith('/') ? `${apiBase}/` : apiBase;
            this.dataBase = dataBase;
            this.tasks = [];
            this.byId = new Map();
            this.data = this._read();
        }

        get offline() {
            return typeof location !== 'undefined' && location.protocol === 'file:';
        }

        async loadTasks() {
            const res = await this.fetch(`${this.dataBase}data/writing-tasks.json`, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`data/writing-tasks.json: HTTP ${res.status}`);
            this.setTasks(await res.json());
            return this.tasks;
        }

        setTasks(list) {
            this.tasks = (Array.isArray(list) ? list : []).filter(t => validateTask(t).length === 0);
            this.byId = new Map(this.tasks.map(t => [t.id, t]));
        }

        filter(level) {
            return level && level !== 'all' ? this.tasks.filter(t => t.level === level) : this.tasks;
        }

        /** Trạng thái backend: { enabled, provider, model, message }. */
        async status() {
            try {
                const res = await this.fetch(`${this.apiBase}api/writing/status`, { cache: 'no-cache' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            } catch (e) {
                const staticHost = !this.apiBase && typeof location !== 'undefined' && /\.github\.io$/i.test(location.hostname);
                return {
                    enabled: false,
                    provider: null,
                    unreachable: true,
                    message: staticHost
                        ? 'Trang này chưa được kết nối với máy chủ chấm bài (cần điền writingApiBase trong js/app-config.js).'
                        : 'Hiện chưa kết nối được máy chủ chấm bài.',
                };
            }
        }

        /** Mật khẩu Writing đã nhập đúng (lưu trên trình duyệt này), hoặc ''. */
        get accessCode() {
            return (this.storage && this.storage.get(ACCESS_KEY, '')) || '';
        }

        set accessCode(code) {
            if (this.storage) this.storage.set(ACCESS_KEY, code || '');
        }

        _headers(extra = {}) {
            return this.accessCode ? { ...extra, 'X-Access-Code': this.accessCode } : extra;
        }

        /** Kiểm tra mật khẩu với máy chủ; đúng thì lưu lại. Sai / bị khoá → ném lỗi kèm thông báo. */
        async unlock(code) {
            const value = String(code || '').trim();
            if (!value) throw new Error('Hãy nhập mật khẩu.');
            let res;
            try {
                res = await this.fetch(`${this.apiBase}api/writing/unlock`, { method: 'POST', headers: { 'X-Access-Code': value } });
            } catch (e) {
                throw new Error('Không kết nối được máy chủ chấm bài.');
            }
            let body = null;
            try { body = await res.json(); } catch (e) { /* không phải JSON */ }
            if (!res.ok) throw new Error((body && body.error && body.error.message) || `Máy chủ trả lỗi (HTTP ${res.status}).`);
            this.accessCode = value;
            return true;
        }

        async requestFeedback(taskId, text, { signal } = {}) {
            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
            if (signal && controller) signal.addEventListener('abort', () => controller.abort());
            let res;
            try {
                res = await this.fetch(`${this.apiBase}api/writing/feedback`, {
                    method: 'POST',
                    headers: this._headers({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ taskId, text }),
                    signal: controller ? controller.signal : undefined,
                });
            } catch (e) {
                const aborted = e && e.name === 'AbortError';
                throw new Error(aborted ? 'Hết thời gian chờ phản hồi. Vui lòng thử lại.' : 'Không kết nối được máy chủ chấm bài.');
            } finally {
                if (timer) clearTimeout(timer);
            }
            let body = null;
            try { body = await res.json(); } catch (e) { /* phản hồi không phải JSON */ }
            if (!res.ok || !body || !body.feedback) {
                const msg = body && body.error && body.error.message;
                const err = new Error(msg || `Máy chủ trả lỗi (HTTP ${res.status}).`);
                if (body && body.error && body.error.code === 'access_denied') {
                    this.accessCode = '';
                    err.locked = true;
                }
                throw err;
            }
            return body.feedback;
        }

        // ---------------------------------------------------------------- lưu trữ

        _read() {
            const d = this.storage ? this.storage.get(STORE_KEY, null) : null;
            return {
                drafts: d && typeof d.drafts === 'object' && d.drafts ? d.drafts : {},
                attempts: d && typeof d.attempts === 'object' && d.attempts ? d.attempts : {},
                ui: d && typeof d.ui === 'object' && d.ui ? d.ui : {},
            };
        }

        _save() {
            if (this.storage) this.storage.set(STORE_KEY, this.data);
        }

        draft(taskId) {
            const d = this.data.drafts[taskId];
            return d ? d.text : '';
        }

        saveDraft(taskId, text) {
            if (text && text.trim()) this.data.drafts[taskId] = { text, updatedAt: Date.now() };
            else delete this.data.drafts[taskId];
            this._save();
        }

        attempts(taskId) {
            return this.data.attempts[taskId] || [];
        }

        addAttempt(taskId, text, feedback) {
            const list = this.attempts(taskId).slice();
            const attempt = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, text, feedback, createdAt: Date.now() };
            list.unshift(attempt);
            this.data.attempts[taskId] = list.slice(0, MAX_ATTEMPTS_PER_TASK);
            this._save();
            return attempt;
        }

        bestScore(taskId) {
            const scores = this.attempts(taskId).map(a => a.feedback && a.feedback.score).filter(s => typeof s === 'number');
            return scores.length ? Math.max(...scores) : null;
        }

        clearHistory(taskId) {
            if (taskId) delete this.data.attempts[taskId];
            else this.data.attempts = {};
            this._save();
        }

        ui(patch) {
            if (patch) {
                Object.assign(this.data.ui, patch);
                this._save();
            }
            return this.data.ui;
        }

        summary() {
            const attempts = Object.values(this.data.attempts).flat();
            const scores = attempts.map(a => a.feedback && a.feedback.score).filter(s => typeof s === 'number');
            return {
                tasksDone: Object.keys(this.data.attempts).filter(id => this.data.attempts[id].length).length,
                attempts: attempts.length,
                average: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
            };
        }
    }

    Object.assign(WritingService, {
        LEVELS, TYPES, CRITERIA, CORRECTION_TYPES, CORRECTION_GROUPS, MAX_SCORE, LIMITS, STORE_KEY,
        correctionGroup, countWords, checkSubmission, lengthCap, overallScore, locateCorrections, segments, validateTask,
    });

    global.WritingService = WritingService;
    if (typeof module === 'object' && module.exports) module.exports = WritingService;
})(typeof window !== 'undefined' ? window : globalThis);
