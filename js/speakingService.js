/**
 * Speaking practice A1–A2: đọc data/speaking-tasks.json, lưu ghi chú chuẩn bị theo từng bài.
 * Không gọi AI — chỉ gợi ý câu trả lời có sẵn (basic / better / strong).
 */
(function (global) {
    'use strict';

    const STORE_KEY = 'ent104.speaking.v1';
    const HINT_KEYS = ['basic', 'better', 'strong'];

    function str(v) {
        return typeof v === 'string' && v.trim().length > 0;
    }

    function validateHints(hints, label) {
        const problems = [];
        if (!hints || typeof hints !== 'object') return [`${label}: thiếu hints`];
        HINT_KEYS.forEach(k => {
            if (!str(hints[k])) problems.push(`${label}: thiếu hints.${k}`);
        });
        return problems;
    }

    function validateTest(t) {
        const problems = [];
        if (!t || typeof t !== 'object') return ['không phải object'];
        if (!/^spk-\d{2}$/.test(t.id || '')) problems.push(`id sai định dạng: ${t.id}`);
        ['title', 'titleVi', 'topic', 'topicVi', 'img', 'credit', 'vocab'].forEach(k => {
            if (!str(t[k])) problems.push(`${t.id}: thiếu ${k}`);
        });
        if (!Array.isArray(t.questions) || t.questions.length < 3) {
            problems.push(`${t.id}: cần ≥ 3 câu Part 1`);
        } else {
            t.questions.forEach((q, i) => {
                if (!q || !str(q.q)) problems.push(`${t.id} Q${i + 1}: thiếu câu hỏi`);
                problems.push(...validateHints(q && q.hints, `${t.id} Q${i + 1}`));
            });
        }
        if (!t.picture || !str(t.picture.vocabTip)) problems.push(`${t.id}: thiếu picture.vocabTip`);
        else problems.push(...validateHints(t.picture.hints, `${t.id} picture`));
        return problems;
    }

    class SpeakingService {
        constructor({ storage = global.AppStorage, fetchImpl = global.fetch && global.fetch.bind(global), dataBase = '' } = {}) {
            this.storage = storage;
            this.fetch = fetchImpl;
            this.dataBase = dataBase;
            this.tests = [];
            this.byId = new Map();
            this.pictureQuestions = [];
            this.hintLevels = [];
            this.level = 'A1–A2';
            this.problems = [];
            this.notes = (storage && storage.get(STORE_KEY, null)) || {};
        }

        async load() {
            const res = await this.fetch(`${this.dataBase}data/speaking-tasks.json`, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`data/speaking-tasks.json: HTTP ${res.status}`);
            this.setData(await res.json());
            return this.tests;
        }

        setData(data) {
            this.problems = [];
            this.tests = [];
            this.byId = new Map();
            this.pictureQuestions = Array.isArray(data && data.pictureQuestions) ? data.pictureQuestions.filter(str) : [];
            this.hintLevels = Array.isArray(data && data.hintLevels) ? data.hintLevels : [];
            this.level = str(data && data.level) ? data.level : 'A1–A2';
            if (!this.pictureQuestions.length) this.problems.push('thiếu pictureQuestions');
            const list = (data && data.tests) || [];
            list.forEach(t => {
                const errs = validateTest(t);
                if (errs.length) {
                    this.problems.push(...errs);
                    return;
                }
                if (this.byId.has(t.id)) {
                    this.problems.push(`id trùng: ${t.id}`);
                    return;
                }
                this.tests.push(t);
                this.byId.set(t.id, t);
            });
            if (!this.tests.length) throw new Error('Không có bài speaking hợp lệ.');
            return this.tests;
        }

        getNotes(id) {
            return typeof this.notes[id] === 'string' ? this.notes[id] : '';
        }

        setNotes(id, text) {
            this.notes[id] = String(text || '');
            if (this.storage) this.storage.set(STORE_KEY, this.notes);
        }
    }

    SpeakingService.HINT_KEYS = HINT_KEYS;
    SpeakingService.validateTest = validateTest;

    global.SpeakingService = SpeakingService;
    if (typeof module === 'object' && module.exports) module.exports = SpeakingService;
})(typeof window !== 'undefined' ? window : globalThis);
