/**
 * Soạn đề thi: lọc câu hỏi theo cấu hình, kiểm tra đủ câu, chọn ngẫu nhiên theo phân bổ,
 * thêm / xoá / thay thế câu hỏi và lưu các đề đã soạn.
 * Không tự tạo câu hỏi và không tự sửa cấu hình: khi không đáp ứng được, trả về lỗi kèm đề xuất
 * để người dùng tự quyết định.
 */
(function (global) {
    'use strict';

    const PAPERS_KEY = 'ent104.savedPapers.v1';
    const SKILL_ORDER = ['grammar', 'vocabulary', 'communication', 'reading', 'completion_error', 'writing'];
    const LEVELS = ['A1', 'A2', 'A1-A2', 'B1'];
    const DIFFICULTIES = ['easy', 'medium', 'hard'];
    const TYPES = ['completion', 'error', 'choice', 'ordering'];
    const DIMENSIONS = ['none', 'skill', 'type', 'category'];
    const DIFFICULTY_LABELS = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
    const MAX_TIME_LIMIT = 300;

    const topicKey = q => `${q.skill}::${q.category}`;
    const storage = () => global.AppStorage;

    function shuffle(list, rand) {
        const copy = list.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    const countBy = (list, fn) => list.reduce((acc, x) => {
        const k = fn(x);
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {});

    const toInt = (v, fallback = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.trunc(n) : fallback;
    };

    class ExamBuilderService {
        constructor(questionService, { rand = Math.random } = {}) {
            this.qs = questionService;
            this.rand = rand;
            this.bankIndex = new Map(questionService.questions.map((q, i) => [q.id, i]));
            this.byPassage = new Map();
            for (const q of questionService.questions) {
                if (!q.passageId) continue;
                if (!this.byPassage.has(q.passageId)) this.byPassage.set(q.passageId, []);
                this.byPassage.get(q.passageId).push(q);
            }
            this.allTopics = [...new Set(questionService.questions.map(topicKey))];
        }

        // ------------------------------------------------------------ cấu hình

        defaultConfig() {
            return {
                name: '',
                total: 40,
                timeLimit: 45,
                levels: [...LEVELS],
                difficulties: [...DIFFICULTIES],
                types: [...TYPES],
                topics: [...this.allTopics],
                mode: 'random',
                quotaBy: 'none',
                quotas: { skill: {}, type: {}, category: {} },
            };
        }

        normalizeConfig(raw = {}) {
            const d = this.defaultConfig();
            const pickList = (value, allowed, fallback) => (Array.isArray(value) ? value.filter(v => allowed.includes(v)) : fallback);
            const quotas = { skill: {}, type: {}, category: {} };
            for (const dim of ['skill', 'type', 'category']) {
                const src = (raw.quotas && raw.quotas[dim]) || {};
                for (const [k, v] of Object.entries(src)) quotas[dim][k] = Math.max(0, toInt(v));
            }
            return {
                name: typeof raw.name === 'string' ? raw.name : d.name,
                total: raw.total === undefined ? d.total : toInt(raw.total),
                timeLimit: raw.timeLimit === undefined ? d.timeLimit : toInt(raw.timeLimit),
                levels: pickList(raw.levels, LEVELS, d.levels),
                difficulties: pickList(raw.difficulties, DIFFICULTIES, d.difficulties),
                types: pickList(raw.types, TYPES, d.types),
                topics: pickList(raw.topics, this.allTopics, d.topics),
                mode: raw.mode === 'manual' ? 'manual' : 'random',
                quotaBy: DIMENSIONS.includes(raw.quotaBy) ? raw.quotaBy : 'none',
                quotas,
            };
        }

        matches(q, config) {
            return config.levels.includes(q.level)
                && config.difficulties.includes(q.difficulty)
                && config.types.includes(q.type)
                && config.topics.includes(topicKey(q));
        }

        eligible(config) {
            const topics = new Set(config.topics);
            return this.qs.questions.filter(q =>
                config.levels.includes(q.level)
                && config.difficulties.includes(q.difficulty)
                && config.types.includes(q.type)
                && topics.has(topicKey(q)));
        }

        groupKey(q, dim) {
            if (dim === 'skill') return q.skill;
            if (dim === 'type') return q.type;
            if (dim === 'category') return topicKey(q);
            return 'all';
        }

        groupLabel(key, dim) {
            const S = global.QuestionService;
            const skillLabel = k => ((S.SKILLS.find(s => s.key === k) || {}).label || k);
            if (dim === 'skill') return skillLabel(key);
            if (dim === 'type') return S.TYPE_LABELS[key] || key;
            if (dim === 'category') {
                const [skill, category] = key.split('::');
                return `${skillLabel(skill)} › ${category}`;
            }
            return 'Tất cả';
        }

        /** Các nhóm phân bổ theo chiều đang chọn, kèm số câu hiện có (đã áp dụng bộ lọc). */
        groups(config, pool = this.eligible(config)) {
            const dim = config.quotaBy;
            if (dim === 'none') return [];
            let keys;
            if (dim === 'skill') keys = SKILL_ORDER.filter(s => config.topics.some(t => t.startsWith(`${s}::`)));
            else if (dim === 'type') keys = TYPES.filter(t => config.types.includes(t));
            else keys = this.allTopics.filter(t => config.topics.includes(t));
            const available = countBy(pool, q => this.groupKey(q, dim));
            const quotas = config.quotas[dim] || {};
            return keys.map(key => ({
                key,
                label: this.groupLabel(key, dim),
                available: available[key] || 0,
                quota: quotas[key] || 0,
            }));
        }

        /**
         * Kiểm tra cấu hình. Trả về { ok, errors, warnings, pool, groups }.
         * Mỗi lỗi có thể kèm `suggestions: [{ label, patch }]` — patch chỉ được áp dụng khi người dùng bấm chọn.
         */
        check(rawConfig) {
            const config = this.normalizeConfig(rawConfig);
            const errors = [];
            const warnings = [];
            const add = (list, message, suggestions = []) => list.push({ message, suggestions });

            if (!config.levels.length) add(errors, 'Hãy chọn ít nhất một trình độ.');
            if (!config.difficulties.length) add(errors, 'Hãy chọn ít nhất một độ khó.');
            if (!config.types.length) add(errors, 'Hãy chọn ít nhất một loại câu hỏi.');
            if (!config.topics.length) add(errors, 'Hãy chọn ít nhất một chủ đề.');
            if (config.timeLimit < 0 || config.timeLimit > MAX_TIME_LIMIT) {
                add(errors, `Thời gian làm bài phải từ 0 (không giới hạn) đến ${MAX_TIME_LIMIT} phút.`);
            }

            const pool = this.eligible(config);
            const groups = this.groups(config, pool);
            const widenOptions = (needed, extraFilter = null) => {
                const options = [
                    ['levels', LEVELS, 'Chọn tất cả trình độ'],
                    ['difficulties', DIFFICULTIES, 'Chọn tất cả độ khó'],
                    ['types', TYPES, 'Chọn tất cả loại câu hỏi'],
                    ['topics', this.allTopics, 'Chọn tất cả chủ đề'],
                ];
                const out = [];
                for (const [field, all, label] of options) {
                    if (config[field].length === all.length) continue;
                    let alt = this.eligible({ ...config, [field]: all });
                    if (extraFilter) alt = alt.filter(extraFilter);
                    if (alt.length >= needed) out.push({ label: `${label} (sẽ có ${alt.length} câu)`, patch: { [field]: [...all] } });
                }
                return out;
            };

            if (config.mode === 'random') {
                if (config.total < 1) add(errors, 'Số câu hỏi phải lớn hơn 0.');
                else if (pool.length < config.total) {
                    add(errors,
                        `Chỉ có ${pool.length} câu phù hợp với các điều kiện đã chọn, ít hơn số câu yêu cầu (${config.total}).`,
                        [
                            ...(pool.length ? [{ label: `Giảm số câu xuống ${pool.length}`, patch: { total: pool.length } }] : []),
                            ...widenOptions(config.total),
                        ]);
                }

                if (config.quotaBy !== 'none') {
                    const sum = groups.reduce((s, g) => s + g.quota, 0);
                    if (sum !== config.total) {
                        add(errors,
                            `Tổng số câu đã phân bổ (${sum}) khác số câu của đề (${config.total}).`,
                            sum > 0 ? [{ label: `Đặt số câu của đề = ${sum}`, patch: { total: sum } }] : []);
                    }
                    for (const g of groups) {
                        if (g.quota > g.available) {
                            const dim = config.quotaBy;
                            add(errors,
                                `${g.label}: cần ${g.quota} câu nhưng chỉ có ${g.available} câu phù hợp.`,
                                [
                                    { label: `Giảm ${g.label} xuống ${g.available}`, patch: { quotas: { [dim]: { [g.key]: g.available } } } },
                                    ...widenOptions(g.quota, q => this.groupKey(q, dim) === g.key),
                                ]);
                        }
                    }
                    const unassigned = pool.length - groups.reduce((s, g) => s + g.available, 0);
                    if (unassigned > 0) add(warnings, `${unassigned} câu phù hợp không thuộc nhóm phân bổ nào và sẽ không được chọn.`);
                }
            }

            return { ok: errors.length === 0, errors, warnings, pool: pool.length, groups, config };
        }

        // ------------------------------------------------------------ chọn câu

        /** Câu đọc hiểu của cùng một bài đọc được lấy liền nhau. */
        pickClustered(candidates, n) {
            const byPassage = new Map();
            for (const q of candidates) {
                if (!byPassage.has(q.passageId)) byPassage.set(q.passageId, []);
                byPassage.get(q.passageId).push(q);
            }
            const out = [];
            for (const pid of shuffle([...byPassage.keys()], this.rand)) {
                const siblings = byPassage.get(pid).sort((a, b) => this.bankIndex.get(a.id) - this.bankIndex.get(b.id));
                for (const q of siblings) {
                    if (out.length >= n) return out;
                    out.push(q);
                }
            }
            return out;
        }

        /**
         * Chọn ngẫu nhiên n câu. Số câu đọc hiểu được quyết định bằng lấy mẫu đều (giữ tỉ lệ tự nhiên),
         * sau đó các câu đọc hiểu được gom theo bài đọc để không phải đọc quá nhiều bài cho ít câu hỏi.
         */
        pick(candidates, n) {
            const sample = shuffle(candidates, this.rand).slice(0, Math.min(n, candidates.length));
            const nonReading = sample.filter(q => !q.passageId);
            const readingCount = sample.length - nonReading.length;
            const reading = readingCount ? this.pickClustered(candidates.filter(q => q.passageId), readingCount) : [];
            return [...nonReading, ...reading];
        }

        /** Sắp đề theo nhóm kỹ năng; câu cùng bài đọc đứng liền nhau theo thứ tự trong bài. */
        orderPaper(ids) {
            const unique = [...new Set(ids)].filter(id => this.qs.byId.has(id));
            const bySkill = new Map(SKILL_ORDER.map(s => [s, []]));
            for (const id of unique) {
                const q = this.qs.byId.get(id);
                if (!bySkill.has(q.skill)) bySkill.set(q.skill, []);
                bySkill.get(q.skill).push(q);
            }
            const out = [];
            for (const list of bySkill.values()) {
                const passages = [];
                const groups = new Map();
                for (const q of list) {
                    const key = q.passageId || `#${q.id}`;
                    if (!groups.has(key)) {
                        groups.set(key, []);
                        passages.push(key);
                    }
                    groups.get(key).push(q);
                }
                for (const key of passages) {
                    groups.get(key)
                        .sort((a, b) => this.bankIndex.get(a.id) - this.bankIndex.get(b.id))
                        .forEach(q => out.push(q.id));
                }
            }
            return out;
        }

        /** Tạo đề ngẫu nhiên. Không tạo nếu cấu hình chưa hợp lệ. */
        generate(rawConfig) {
            const check = this.check(rawConfig);
            if (!check.ok || check.config.mode !== 'random') return { ok: false, ids: [], check };
            const config = check.config;
            const pool = this.eligible(config);
            let picked;
            if (config.quotaBy === 'none') picked = this.pick(pool, config.total);
            else {
                picked = [];
                for (const g of check.groups) {
                    if (!g.quota) continue;
                    picked.push(...this.pick(pool.filter(q => this.groupKey(q, config.quotaBy) === g.key), g.quota));
                }
            }
            const ids = this.orderPaper(picked.map(q => q.id));
            if (ids.length !== config.total) {
                return { ok: false, ids: [], check: { ...check, ok: false, errors: [{ message: `Chỉ chọn được ${ids.length}/${config.total} câu.`, suggestions: [] }] } };
            }
            return { ok: true, ids, check };
        }

        /** Đề nhanh trong Exam Mode: chọn n câu từ danh sách đã lọc sẵn. */
        quickPaper(pool, n) {
            return this.orderPaper(this.pick(pool, n).map(q => q.id));
        }

        // ------------------------------------------------------------ chỉnh sửa đề

        addQuestion(ids, id) {
            if (!this.qs.byId.has(id)) return { ok: false, ids, message: `Không tìm thấy câu hỏi ${id}.` };
            if (ids.includes(id)) return { ok: false, ids, message: `Câu ${id} đã có trong đề.` };
            return { ok: true, ids: this.orderPaper([...ids, id]) };
        }

        addPassage(ids, passageId) {
            const siblings = (this.byPassage.get(passageId) || []).map(q => q.id).filter(id => !ids.includes(id));
            if (!siblings.length) return { ok: false, ids, message: 'Tất cả câu của bài đọc này đã có trong đề.' };
            return { ok: true, ids: this.orderPaper([...ids, ...siblings]), added: siblings.length };
        }

        removeQuestion(ids, id) {
            return { ok: ids.includes(id), ids: ids.filter(x => x !== id) };
        }

        /**
         * Thay một câu bằng câu khác cùng kỹ năng, phù hợp cấu hình và chưa có trong đề.
         * Ưu tiên: cùng bài đọc → cùng chủ đề và trình độ → cùng chủ đề → cùng kỹ năng.
         */
        replaceQuestion(ids, id, rawConfig) {
            const old = this.qs.byId.get(id);
            if (!old || !ids.includes(id)) return { ok: false, ids, message: 'Câu hỏi không có trong đề.' };
            const config = this.normalizeConfig(rawConfig);
            const used = new Set(ids);
            const candidates = this.eligible(config).filter(q => q.skill === old.skill && !used.has(q.id));
            const tiers = [
                q => old.passageId && q.passageId === old.passageId,
                q => topicKey(q) === topicKey(old) && q.level === old.level,
                q => topicKey(q) === topicKey(old),
                () => true,
            ];
            for (const tier of tiers) {
                const list = candidates.filter(tier);
                if (list.length) {
                    const next = list[Math.floor(this.rand() * list.length)];
                    const replaced = ids.map(x => (x === id ? next.id : x));
                    return { ok: true, ids: this.orderPaper(replaced), newId: next.id };
                }
            }
            return { ok: false, ids, message: `Không còn câu ${this.groupLabel(old.skill, 'skill')} nào khác phù hợp cấu hình để thay thế.` };
        }

        composition(ids) {
            const list = ids.map(id => this.qs.byId.get(id)).filter(Boolean);
            return {
                total: list.length,
                bySkill: countBy(list, q => q.skill),
                byType: countBy(list, q => q.type),
                byTopic: countBy(list, topicKey),
                byLevel: countBy(list, q => q.level),
                byDifficulty: countBy(list, q => q.difficulty),
                passages: new Set(list.filter(q => q.passageId).map(q => q.passageId)).size,
            };
        }

        /** So sánh đề hiện tại với cấu hình (dùng sau khi người dùng tự thêm/xoá/thay câu). */
        paperWarnings(ids, rawConfig) {
            const config = this.normalizeConfig(rawConfig);
            const warnings = [];
            if (config.total > 0 && ids.length !== config.total) {
                warnings.push(`Đề hiện có ${ids.length} câu, khác số câu đã đặt (${config.total}).`);
            }
            const outside = ids.filter(id => !this.matches(this.qs.byId.get(id), config)).length;
            if (outside) warnings.push(`${outside} câu không khớp bộ lọc trình độ / độ khó / loại câu / chủ đề của cấu hình.`);
            if (config.mode === 'random' && config.quotaBy !== 'none') {
                const comp = countBy(ids.map(id => this.qs.byId.get(id)), q => this.groupKey(q, config.quotaBy));
                const diffs = this.groups(config)
                    .filter(g => (comp[g.key] || 0) !== g.quota)
                    .map(g => `${g.label}: ${comp[g.key] || 0}/${g.quota}`);
                if (diffs.length) warnings.push(`Cơ cấu khác phân bổ đã đặt — ${diffs.join('; ')}.`);
            }
            return warnings;
        }

        // ------------------------------------------------------------ đề đã lưu

        listPapers() {
            const list = storage().get(PAPERS_KEY, []);
            return Array.isArray(list) ? list : [];
        }

        getPaper(id) {
            return this.listPapers().find(p => p.id === id) || null;
        }

        _writePapers(list) {
            return storage().set(PAPERS_KEY, list);
        }

        savePaper({ id = null, name, config, questionIds }) {
            const title = String(name || '').trim();
            if (!title) return { ok: false, message: 'Hãy đặt tên cho đề thi trước khi lưu.' };
            const ids = [...new Set(questionIds || [])];
            if (!ids.length) return { ok: false, message: 'Đề thi chưa có câu hỏi nào.' };
            if (ids.length !== (questionIds || []).length) return { ok: false, message: 'Đề thi có câu hỏi bị trùng.' };
            const missing = ids.filter(x => !this.qs.byId.has(x));
            if (missing.length) return { ok: false, message: `Không tìm thấy câu hỏi: ${missing.join(', ')}.` };

            const list = this.listPapers();
            const now = Date.now();
            const data = { name: title, config: { ...this.normalizeConfig(config), name: title }, questionIds: ids, updatedAt: now };
            let paper;
            const existing = id ? list.find(p => p.id === id) : null;
            if (existing) {
                Object.assign(existing, data);
                paper = existing;
            } else {
                paper = { id: `P${now.toString(36)}${Math.floor(this.rand() * 1e6).toString(36)}`, createdAt: now, ...data };
                list.unshift(paper);
            }
            if (!this._writePapers(list)) return { ok: false, message: 'Trình duyệt không cho lưu dữ liệu (localStorage).' };
            return { ok: true, paper };
        }

        duplicatePaper(id) {
            const src = this.getPaper(id);
            if (!src) return { ok: false, message: 'Không tìm thấy đề cần sao chép.' };
            return this.savePaper({ name: `${src.name} (bản sao)`, config: src.config, questionIds: src.questionIds });
        }

        deletePaper(id) {
            const list = this.listPapers();
            const next = list.filter(p => p.id !== id);
            if (next.length === list.length) return { ok: false, message: 'Không tìm thấy đề cần xoá.' };
            this._writePapers(next);
            return { ok: true };
        }

        /** Câu hỏi của đề đã lưu; báo các ID không còn trong ngân hàng thay vì bỏ qua âm thầm. */
        resolvePaper(paper) {
            const ids = paper.questionIds || [];
            return {
                questions: ids.map(id => this.qs.byId.get(id)).filter(Boolean),
                missing: ids.filter(id => !this.qs.byId.has(id)),
            };
        }
    }

    ExamBuilderService.SKILL_ORDER = SKILL_ORDER;
    ExamBuilderService.LEVELS = LEVELS;
    ExamBuilderService.DIFFICULTIES = DIFFICULTIES;
    ExamBuilderService.DIFFICULTY_LABELS = DIFFICULTY_LABELS;
    ExamBuilderService.TYPES = TYPES;
    ExamBuilderService.DIMENSIONS = DIMENSIONS;
    ExamBuilderService.topicKey = topicKey;

    global.ExamBuilderService = ExamBuilderService;
    if (typeof module === 'object' && module.exports) module.exports = ExamBuilderService;
})(typeof window !== 'undefined' ? window : globalThis);
