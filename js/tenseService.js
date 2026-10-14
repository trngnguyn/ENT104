/**
 * Thì (tenses) A1–A2: đọc data/tenses.json, kiểm tra dữ liệu, gom câu luyện tập (câu riêng của từng thì
 * + câu ngữ pháp cùng thì trong ngân hàng chung), tạo lượt luyện tập và lưu điểm cao nhất.
 * Dùng chung cho trình duyệt và Node (kiểm thử).
 */
(function (global) {
    'use strict';

    const STORE_KEY = 'ent104.tenses.v1';
    const MIXED_ID = 'mixed';
    const BANK_LEVELS = ['A1', 'A2', 'A1-A2'];
    const SESSION_SIZES = [10, 20, 0];

    function validateQuestion(q) {
        const problems = [];
        if (!q || typeof q !== 'object') return ['không phải object'];
        if (!/^TNS-[A-Z]+-\d{2}$/.test(q.id || '')) problems.push(`id sai định dạng: ${q.id}`);
        if (typeof q.question !== 'string' || !q.question.includes('______')) problems.push(`${q.id}: thiếu chỗ trống ______`);
        if (!Array.isArray(q.options) || q.options.length !== 4 || !q.options.every(o => typeof o === 'string' && o.trim())) {
            problems.push(`${q.id}: cần đúng 4 lựa chọn`);
        } else if (new Set(q.options.map(o => o.trim().toLowerCase())).size !== 4) {
            problems.push(`${q.id}: lựa chọn bị trùng`);
        }
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) problems.push(`${q.id}: answer phải là 0–3`);
        if (typeof q.explanation !== 'string' || q.explanation.trim().length < 10) problems.push(`${q.id}: thiếu giải thích`);
        return problems;
    }

    /** Kiểm tra một thì; trả về danh sách lỗi (rỗng = hợp lệ). */
    function validateTense(t) {
        const problems = [];
        const str = v => typeof v === 'string' && v.trim().length > 0;
        if (!t || typeof t !== 'object') return ['không phải object'];
        if (!/^[a-z-]+$/.test(t.id || '') || t.id === MIXED_ID) problems.push(`id không hợp lệ: ${t.id}`);
        ['name', 'vi', 'level', 'summary'].forEach(k => { if (!str(t[k])) problems.push(`${t.id}: thiếu ${k}`); });
        if (!Array.isArray(t.forms) || t.forms.length < 3
            || !t.forms.every(f => f && str(f.label) && str(f.pattern) && Array.isArray(f.examples) && f.examples.length && f.examples.every(str))) {
            problems.push(`${t.id}: forms cần ≥ 3 mục, mỗi mục có label, pattern, examples`);
        }
        if (!Array.isArray(t.uses) || !t.uses.length || !t.uses.every(u => u && str(u.text) && str(u.example))) problems.push(`${t.id}: uses không hợp lệ`);
        if (!Array.isArray(t.signals) || !t.signals.every(str)) problems.push(`${t.id}: signals không hợp lệ`);
        if (!Array.isArray(t.notes) || !t.notes.every(str)) problems.push(`${t.id}: notes không hợp lệ`);
        if (!Array.isArray(t.mistakes) || !t.mistakes.every(m => m && str(m.wrong) && str(m.right) && str(m.why))) problems.push(`${t.id}: mistakes không hợp lệ`);
        if (!Array.isArray(t.bankTags) || !t.bankTags.every(str)) problems.push(`${t.id}: bankTags phải là mảng`);
        if (!Array.isArray(t.questions) || t.questions.length < 5) problems.push(`${t.id}: cần ≥ 5 câu luyện tập`);
        else t.questions.forEach(q => problems.push(...validateQuestion(q)));
        return problems;
    }

    /** Xáo trộn (Fisher–Yates); rng trả về số trong [0, 1). */
    function shuffle(list, rng = Math.random) {
        const a = list.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    class TenseService {
        constructor({ storage = global.AppStorage, fetchImpl = global.fetch && global.fetch.bind(global), dataBase = '' } = {}) {
            this.storage = storage;
            this.fetch = fetchImpl;
            this.dataBase = dataBase;
            this.tenses = [];
            this.byId = new Map();
            this.note = '';
            this.problems = [];
            this.progress = (storage && storage.get(STORE_KEY, null)) || {};
        }

        async load() {
            const res = await this.fetch(`${this.dataBase}data/tenses.json`, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`data/tenses.json: HTTP ${res.status}`);
            this.setData(await res.json());
            return this.tenses;
        }

        /** Nhận dữ liệu; bỏ các thì không hợp lệ (ghi lại trong this.problems) và id câu hỏi bị trùng. */
        setData(data) {
            const list = data && Array.isArray(data.tenses) ? data.tenses : [];
            const seen = new Set();
            this.problems = [];
            this.tenses = list.filter(t => {
                const p = validateTense(t);
                (t && Array.isArray(t.questions) ? t.questions : []).forEach(q => {
                    if (q && seen.has(q.id)) p.push(`id câu hỏi bị trùng: ${q.id}`);
                    if (q) seen.add(q.id);
                });
                if (p.length) this.problems.push(...p);
                return !p.length;
            });
            this.byId = new Map(this.tenses.map(t => [t.id, t]));
            this.note = (data && data.note) || '';
        }

        /** Câu ngữ pháp A1–A2 trong ngân hàng chung có tag trùng với bankTags của thì. */
        bankQuestions(tense, bank) {
            if (!tense || !tense.bankTags.length) return [];
            const tags = new Set(tense.bankTags);
            return (bank || []).filter(q => q.skill === 'grammar' && BANK_LEVELS.includes(q.level)
                && Array.isArray(q.tags) && q.tags.some(t => tags.has(t)));
        }

        /** Toàn bộ câu luyện tập của một thì (hoặc MIXED_ID = câu riêng của mọi thì), mỗi câu kèm tenseId. */
        pool(id, bank = []) {
            if (id === MIXED_ID) {
                return this.tenses.flatMap(t => t.questions.map(q => ({ ...q, tenseId: t.id, origin: 'tense' })));
            }
            const t = this.byId.get(id);
            if (!t) return [];
            const own = t.questions.map(q => ({ ...q, tenseId: t.id, origin: 'tense' }));
            const ids = new Set(own.map(q => q.id));
            const extra = this.bankQuestions(t, bank)
                .filter(q => !ids.has(q.id))
                .map(q => ({ id: q.id, question: q.question, options: q.options, answer: q.answer, explanation: q.explanation, tenseId: t.id, origin: 'bank' }));
            return [...own, ...extra];
        }

        /** Lượt luyện tập: size câu ngẫu nhiên (0 = tất cả). */
        session(id, { size = 10, bank = [], rng = Math.random, only = null } = {}) {
            let list = this.pool(id, bank);
            if (only) list = list.filter(q => only.includes(q.id));
            const picked = shuffle(list, rng);
            return size > 0 ? picked.slice(0, size) : picked;
        }

        best(id) {
            return this.progress[id] || null;
        }

        /** Lưu kết quả một lượt; giữ lượt có tỉ lệ đúng cao nhất. */
        record(id, correct, total) {
            if (!total) return this.best(id);
            const pct = Math.round((correct * 100) / total);
            const prev = this.progress[id];
            const attempts = (prev ? prev.attempts : 0) + 1;
            this.progress[id] = !prev || pct >= prev.pct
                ? { correct, total, pct, attempts, at: Date.now() }
                : { ...prev, attempts };
            if (this.storage) this.storage.set(STORE_KEY, this.progress);
            return this.progress[id];
        }
    }

    Object.assign(TenseService, { STORE_KEY, MIXED_ID, SESSION_SIZES, validateTense, validateQuestion, shuffle });

    global.TenseService = TenseService;
    if (typeof module === 'object' && module.exports) module.exports = TenseService;
})(typeof window !== 'undefined' ? window : globalThis);
