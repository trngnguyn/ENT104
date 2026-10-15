/**
 * Tải và tra cứu ngân hàng câu hỏi.
 * Ưu tiên đọc data/*.json (khi chạy qua web server); nếu không được (ví dụ mở bằng file://)
 * thì dùng data/question-bank.bundle.js.
 */
(function (global) {
    'use strict';

    const SKILLS = [
        { key: 'grammar', label: 'Ngữ pháp', icon: 'fa-spell-check' },
        { key: 'vocabulary', label: 'Từ vựng', icon: 'fa-book' },
        { key: 'communication', label: 'Giao tiếp', icon: 'fa-comments' },
        { key: 'reading', label: 'Đọc hiểu', icon: 'fa-book-open' },
        { key: 'completion_error', label: 'Hoàn thành câu & tìm lỗi', icon: 'fa-pen-to-square' },
        { key: 'writing', label: 'Sắp xếp & viết câu', icon: 'fa-list-ol' },
    ];
    const LEVELS = ['A1', 'A2', 'A1-A2', 'B1'];
    const TYPE_LABELS = {
        completion: 'Điền chỗ trống',
        error: 'Tìm lỗi sai',
        choice: 'Chọn đáp án',
        ordering: 'Sắp xếp',
    };
    const STATUS_LABELS = {
        reviewed: 'Giáo viên đã duyệt',
        ai_reviewed: 'AI đã rà soát',
        auto_validated: 'Chỉ kiểm tra tự động',
        needs_review: 'Cần giáo viên xem lại',
        needs_ent104_verification: 'Cần đối chiếu ENT104',
    };

    const BUNDLE_SRC = 'data/question-bank.bundle.js';
    const JSON_FILES = { questions: 'data/questions.json', passages: 'data/reading-passages.json' };

    const stripHtml = s => String(s ?? '').replace(/<[^>]*>/g, ' ');
    const normalize = s => stripHtml(s).toLowerCase().replace(/\s+/g, ' ').trim();

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.src = src;
            el.onload = resolve;
            el.onerror = () => reject(new Error(`Không tải được ${src}`));
            document.head.appendChild(el);
        });
    }

    async function fetchJson(url) {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
        return res.json();
    }

    const EVIDENCE_TRIM = /^[\s,.;:!?–-]+|[\s,.;:!?–-]+$/g;

    /**
     * Tìm các đoạn trích (đặt trong '...') của lời giải thích có xuất hiện nguyên văn trong bài đọc.
     * Trả về các khoảng [start, end) trong `text` để tô sáng làm căn cứ cho đáp án.
     */
    function findEvidence(text, explanation) {
        const haystack = String(text || '').toLowerCase();
        const expl = String(explanation || '');
        const locate = candidate => {
            const pieces = candidate.split(/\.\.\.|…/).map(s => s.replace(EVIDENCE_TRIM, '')).filter(Boolean);
            if (!pieces.length) return null;
            const found = [];
            for (const piece of pieces) {
                if (piece.length < 6) return null;
                const at = haystack.indexOf(piece.toLowerCase());
                if (at < 0) return null;
                found.push([at, at + piece.length]);
            }
            return found;
        };
        const quotes = [];
        for (let i = 0; i < expl.length; i++) if (expl[i] === "'") quotes.push(i);
        const ranges = [];
        let k = 0;
        while (k < quotes.length - 1) {
            let next = k + 1;
            for (let j = quotes.length - 1; j > k; j--) {
                const found = locate(expl.slice(quotes[k] + 1, quotes[j]));
                if (found) {
                    ranges.push(...found);
                    next = j + 1;
                    break;
                }
            }
            k = next;
        }
        ranges.sort((a, b) => a[0] - b[0]);
        const merged = [];
        for (const r of ranges) {
            const last = merged[merged.length - 1];
            if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
            else merged.push(r.slice());
        }
        return merged;
    }

    function isUsable(q) {
        return q && typeof q.id === 'string'
            && Array.isArray(q.options) && q.options.length === 4
            && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4;
    }

    class QuestionService {
        constructor() {
            this.questions = [];
            this.byId = new Map();
            this.passages = new Map();
            this.searchText = new Map();
            this.source = null;
            this.skipped = [];
        }

        /** Tạo service từ dữ liệu có sẵn (dùng cho kiểm thử hoặc khi đã có window.QUESTION_BANK). */
        static fromData(data) {
            const service = new QuestionService();
            service.source = 'data';
            service._index(data);
            return service;
        }

        async load() {
            let data = null;
            if (location.protocol !== 'file:') {
                try {
                    const [questions, passages] = await Promise.all([
                        fetchJson(JSON_FILES.questions),
                        fetchJson(JSON_FILES.passages),
                    ]);
                    data = { questions, passages };
                    this.source = 'json';
                } catch (e) {
                    console.warn('Không đọc được data/*.json, chuyển sang bundle.', e);
                }
            }
            if (!data) {
                if (!global.QUESTION_BANK) await loadScript(BUNDLE_SRC);
                data = global.QUESTION_BANK;
                this.source = 'bundle';
            }
            if (!data || !Array.isArray(data.questions)) throw new Error('Dữ liệu ngân hàng câu hỏi không hợp lệ.');
            this._index(data);
            return this;
        }

        _index({ questions, passages = [] }) {
            passages.forEach(p => this.passages.set(p.id, p));
            for (const q of questions) {
                if (!isUsable(q) || this.byId.has(q.id) || (q.passageId && !this.passages.has(q.passageId))) {
                    this.skipped.push(q && q.id);
                    continue;
                }
                this.questions.push(q);
                this.byId.set(q.id, q);
                const passage = q.passageId ? this.passages.get(q.passageId) : null;
                this.searchText.set(q.id, normalize([
                    q.id, q.question, ...q.options, q.explanation, q.category, passage ? passage.title : '',
                ].join(' ')));
            }
            if (this.skipped.length) console.warn('Bỏ qua câu hỏi không hợp lệ:', this.skipped);
        }

        passageOf(q) {
            return q && q.passageId ? this.passages.get(q.passageId) || null : null;
        }

        /** Lọc theo kỹ năng, trình độ, chủ đề, từ khoá (nội dung hoặc ID) và điều kiện bổ sung. */
        filter({ skill = 'all', level = 'all', category = 'all', query = '' } = {}, extra = null) {
            const needle = normalize(query);
            return this.questions.filter(q =>
                (skill === 'all' || q.skill === skill)
                && (level === 'all' || q.level === level)
                && (category === 'all' || q.category === category)
                && (!needle || this.searchText.get(q.id).includes(needle))
                && (!extra || extra(q)));
        }

        categories(skill = 'all') {
            const list = [...new Set(this.questions.filter(q => skill === 'all' || q.skill === skill).map(q => q.category))];
            return skill === 'all' ? list.sort((a, b) => a.localeCompare(b)) : list;
        }
    }

    QuestionService.SKILLS = SKILLS;
    QuestionService.LEVELS = LEVELS;
    QuestionService.TYPE_LABELS = TYPE_LABELS;
    QuestionService.STATUS_LABELS = STATUS_LABELS;
    QuestionService.normalize = normalize;
    QuestionService.stripHtml = stripHtml;
    QuestionService.findEvidence = findEvidence;

    global.QuestionService = QuestionService;
    if (typeof module === 'object' && module.exports) module.exports = QuestionService;
})(typeof window !== 'undefined' ? window : globalThis);
