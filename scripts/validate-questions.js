'use strict';

/**
 * Kiểm tra data/questions.json và data/reading-passages.json.
 *   node scripts/validate-questions.js            → báo cáo, exit code 1 nếu có lỗi
 *   node scripts/validate-questions.js --verbose  → in cả danh sách cảnh báo
 *
 * Lỗi (error) phải sửa. Cảnh báo (warning) cần người xem lại, ví dụ các câu có cấu trúc gần giống nhau.
 */

const fs = require('fs');
const { findEvidence } = require('../js/questionService');

const SKILLS = {
    grammar: 'GRAM', vocabulary: 'VOC', communication: 'COMM',
    reading: 'READ', completion_error: 'CERR', writing: 'WRIT',
};
const LEVEL_CODE = { 'A1': 'A1', 'A2': 'A2', 'A1-A2': 'A12' };
const TYPES = ['completion', 'error', 'choice', 'ordering'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const STATUSES = ['auto_validated', 'ai_reviewed', 'needs_review', 'needs_ent104_verification', 'reviewed'];
const SOURCES = ['general_a1_a2', 'ent104_verified'];
const REQUIRED = ['id', 'skill', 'type', 'category', 'level', 'difficulty', 'unit', 'source',
    'question', 'options', 'answer', 'explanation', 'tags', 'status'];
const BLANK = '______';

const NEAR_DUP_ERROR = 0.85;
const NEAR_DUP_WARN = 0.7;

const stripHtml = s => String(s).replace(/<[^>]+>/g, ' ');
const norm = s => stripHtml(s).toLowerCase().replace(/\s+/g, ' ').trim();
const tokens = s => norm(s).replace(/_{2,}/g, ' ').split(/[^a-z0-9'’:]+/).filter(Boolean);
const wordBag = s => tokens(s).sort().join(' ');

function jaccard(a, b) {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    for (const t of a) if (b.has(t)) inter++;
    return inter / (a.size + b.size - inter);
}

function validate(questions, passages, { checkBundle = false } = {}) {
    const errors = [];
    const warnings = [];
    const err = (id, msg) => errors.push(`${id}: ${msg}`);
    const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

    if (!Array.isArray(questions)) return { errors: ['questions.json phải là một mảng'], warnings, stats: {} };

    // ---------- Bài đọc
    const passageIds = new Set();
    for (const p of passages || []) {
        if (!p.id || !p.title || !p.text || !p.level) err(p.id || '(passage)', 'bài đọc thiếu id/title/text/level');
        if (passageIds.has(p.id)) err(p.id, 'trùng ID bài đọc');
        passageIds.add(p.id);
    }
    const usedPassages = new Set();

    // ---------- Từng câu hỏi
    const ids = new Set();
    for (const q of questions) {
        const id = q.id || '(không có id)';
        for (const f of REQUIRED) if (!(f in q)) err(id, `thiếu trường '${f}'`);

        if (ids.has(q.id)) err(id, 'trùng ID');
        ids.add(q.id);

        if (!SKILLS[q.skill]) err(id, `skill không hợp lệ '${q.skill}'`);
        if (!TYPES.includes(q.type)) err(id, `type không hợp lệ '${q.type}'`);
        if (!LEVEL_CODE[q.level]) err(id, `level không hợp lệ '${q.level}'`);
        if (!DIFFICULTIES.includes(q.difficulty)) err(id, `difficulty không hợp lệ '${q.difficulty}'`);
        if (!STATUSES.includes(q.status)) err(id, `status không hợp lệ '${q.status}'`);
        if (!SOURCES.includes(q.source)) err(id, `source không hợp lệ '${q.source}'`);
        if (q.source === 'general_a1_a2' && q.unit !== null) err(id, "câu nguồn 'general_a1_a2' phải có unit = null");
        if (!Array.isArray(q.tags)) err(id, 'tags phải là mảng');
        if (typeof q.category !== 'string' || !q.category.trim()) err(id, 'category rỗng');

        const m = /^([A-Z]+)-(A1|A2|A12)-(\d{4})$/.exec(q.id || '');
        if (!m) err(id, 'ID sai định dạng (VD: GRAM-A1-0001)');
        else {
            if (SKILLS[q.skill] && m[1] !== SKILLS[q.skill]) err(id, `tiền tố ID '${m[1]}' không khớp skill '${q.skill}'`);
            if (LEVEL_CODE[q.level] && m[2] !== LEVEL_CODE[q.level]) err(id, `mã level trong ID '${m[2]}' không khớp level '${q.level}'`);
        }

        // Lựa chọn & đáp án
        const opts = q.options;
        if (!Array.isArray(opts) || opts.length !== 4) err(id, 'phải có đúng 4 lựa chọn');
        else {
            if (opts.some(o => typeof o !== 'string' || !o.trim())) err(id, 'có lựa chọn rỗng');
            if (new Set(opts.map(norm)).size !== 4) err(id, 'có lựa chọn trùng nhau');
        }
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(id, `answer không hợp lệ '${q.answer}'`);
        if (typeof q.question !== 'string' || !q.question.trim()) err(id, 'nội dung câu hỏi rỗng');
        if (typeof q.explanation !== 'string' || q.explanation.trim().length < 15) err(id, 'giải thích quá ngắn hoặc rỗng');
        else if (q.explanation.length > 400) warn(id, 'giải thích dài (>400 ký tự) – nên rút gọn cho trình độ A1–A2');
        if (q.status === 'needs_review' && !q.reviewNote) warn(id, "status 'needs_review' nhưng không có reviewNote");

        if (!Array.isArray(opts) || opts.length !== 4 || !Number.isInteger(q.answer)) continue;
        const answerText = opts[q.answer] || '';

        if (q.optionNotes !== undefined) {
            if (!q.optionNotes || typeof q.optionNotes !== 'object' || Array.isArray(q.optionNotes)) err(id, 'optionNotes phải là object { "phương án": "ghi chú" }');
            else {
                for (const [opt, note] of Object.entries(q.optionNotes)) {
                    if (!opts.includes(opt)) err(id, `optionNotes có khoá '${opt}' không phải là một phương án`);
                    else if (opt === answerText) err(id, `optionNotes không được ghi chú cho đáp án đúng '${opt}'`);
                    if (typeof note !== 'string' || note.trim().length < 5) err(id, `ghi chú cho '${opt}' rỗng hoặc quá ngắn`);
                }
            }
        }

        // Kiểm tra theo dạng câu
        if (q.type === 'completion' && !q.question.includes(BLANK)) err(id, `câu điền khuyết thiếu chỗ trống '${BLANK}'`);

        if (q.type === 'error') {
            const parts = [...q.question.matchAll(/<u>(.*?)<\/u>\s*\(([A-D])\)/g)];
            if (parts.length !== 4) err(id, 'câu tìm lỗi phải có đúng 4 phần gạch chân (A)–(D)');
            else {
                if (parts.map(p => p[2]).join('') !== 'ABCD') err(id, 'nhãn phần gạch chân phải theo thứ tự A, B, C, D');
                parts.forEach((p, i) => {
                    if (norm(p[1]) !== norm(opts[i])) err(id, `lựa chọn ${'ABCD'[i]} '${opts[i]}' không khớp phần gạch chân '${p[1]}'`);
                });
            }
            const said = /Sai ở \(([A-D])\)/.exec(q.explanation);
            if (!said) err(id, "giải thích câu tìm lỗi phải ghi rõ 'Sai ở (X)'");
            else if (said[1] !== 'ABCD'[q.answer]) err(id, `giải thích nói 'Sai ở (${said[1]})' nhưng đáp án là ${'ABCD'[q.answer]}`);
        }

        if (q.type === 'ordering') {
            const words = /Put the words in the correct order: <br><i>(.*?)<\/i>/.exec(q.question);
            if (words) {
                const bag = wordBag(words[1].split(' / ').join(' '));
                opts.forEach((o, i) => {
                    if (wordBag(o) !== bag) err(id, `lựa chọn ${'ABCD'[i]} không dùng đúng các từ đã cho`);
                });
            } else {
                const labels = [...q.question.matchAll(/<br>([a-f])\. /g)].map(x => x[1]);
                if (labels.length < 3) err(id, 'câu sắp xếp phải liệt kê các dòng a, b, c...');
                const want = labels.slice().sort().join('');
                opts.forEach((o, i) => {
                    const seq = o.split(' - ');
                    if (seq.slice().sort().join('') !== want) err(id, `lựa chọn ${'ABCD'[i]} '${o}' không phải một cách sắp xếp hợp lệ`);
                });
            }
        }

        // Đáp án ngắn (≤ 4 từ) nên được nhắc lại trong giải thích (so theo gốc từ: make/makes, go/going...).
        const unquote = w => w.replace(/^['’]+|['’]+$/g, '');
        const answerWords = tokens(answerText).map(unquote).filter(Boolean);
        if ((q.type === 'completion' || q.type === 'choice') && q.skill !== 'reading' && answerWords.length <= 4) {
            const expl = tokens(q.explanation).map(unquote);
            const stem = w => w.slice(0, Math.max(2, Math.min(4, w.length - 1)));
            if (!answerWords.some(w => expl.some(e => e.startsWith(stem(w))))) {
                warn(id, `giải thích không nhắc tới đáp án '${answerText}'`);
            }
        }

        if (q.skill === 'reading') {
            if (!q.passageId) err(id, 'câu đọc hiểu thiếu passageId');
            else if (!passageIds.has(q.passageId)) err(id, `passageId '${q.passageId}' không tồn tại`);
            else usedPassages.add(q.passageId);
        } else if (q.passageId) err(id, 'chỉ câu đọc hiểu mới có passageId');
    }
    for (const pid of passageIds) if (!usedPassages.has(pid)) warn(pid, 'bài đọc chưa có câu hỏi nào');

    // ---------- Trùng lặp / gần trùng lặp (so sánh câu hoàn chỉnh đã điền đáp án đúng)
    const scopeOf = q => (q.skill === 'reading' ? `R:${q.passageId}` : 'main');
    const fullText = q => {
        const answer = q.options[q.answer];
        if (q.type === 'completion') {
            const parts = answer.split(' / ');
            const blanks = q.question.split(BLANK).length - 1;
            let k = 0;
            return q.question.replace(/_{6}/g, () => (blanks === parts.length ? parts[k++] : answer));
        }
        if (q.type === 'error') {
            let k = 0;
            return q.question.replace(/^Find the incorrect part:/, '')
                .replace(/<u>(.*?)<\/u>\s*\([A-D]\)/g, (_, t) => (k++ === q.answer && q.correction ? q.correction : t));
        }
        if (q.type === 'ordering' && /Put the words/.test(q.question)) return answer;
        return `${q.question} ${answer}`;
    };
    const seen = new Map();
    const prepared = questions
        .filter(q => Array.isArray(q.options) && Number.isInteger(q.answer))
        .map(q => {
            const key = `${scopeOf(q)}|${norm(q.question)}|${q.options.map(norm).sort().join('|')}`;
            if (seen.has(key)) err(q.id, `trùng hoàn toàn với ${seen.get(key)}`);
            else seen.set(key, q.id);
            return { q, scope: scopeOf(q), set: new Set(tokens(fullText(q))) };
        });
    const nearDupes = [];
    for (let i = 0; i < prepared.length; i++) {
        for (let j = i + 1; j < prepared.length; j++) {
            const a = prepared[i];
            const b = prepared[j];
            if (a.scope !== b.scope) continue;
            const sim = jaccard(a.set, b.set);
            if (sim >= NEAR_DUP_WARN) nearDupes.push({ a: a.q.id, b: b.q.id, sim });
        }
    }
    for (const d of nearDupes) {
        const msg = `gần trùng với ${d.b} (độ giống ${(d.sim * 100).toFixed(0)}%)`;
        if (d.sim >= NEAR_DUP_ERROR) err(d.a, msg); else warn(d.a, msg);
    }

    // ---------- Bundle
    if (checkBundle) {
        try {
            const { BUNDLE_FILE, bundleSource } = require('./build-bundle');
            const expected = bundleSource({ questions, passages });
            if (!fs.existsSync(BUNDLE_FILE)) err('bundle', 'chưa có data/question-bank.bundle.js – chạy: node scripts/build-bundle.js');
            else if (fs.readFileSync(BUNDLE_FILE, 'utf8') !== expected) err('bundle', 'data/question-bank.bundle.js không khớp với JSON – chạy: node scripts/build-bundle.js');
        } catch (e) {
            err('bundle', `không kiểm tra được bundle: ${e.message}`);
        }
    }

    // ---------- Căn cứ trong bài đọc (đoạn trích trong lời giải thích có nằm nguyên văn trong bài không)
    const passageText = new Map((passages || []).map(p => [p.id, p.text]));
    let withEvidence = 0;
    for (const q of questions) {
        if (q.skill !== 'reading' || !passageText.has(q.passageId)) continue;
        if (findEvidence(passageText.get(q.passageId), q.explanation).length) withEvidence++;
        else if (q.category === 'Detail') warn(q.id, 'câu hỏi chi tiết nhưng giải thích không trích dẫn được câu nào trong bài đọc');
    }

    const stats = buildStats(questions, passages);
    stats.extras = {
        'Câu có ghi chú phương án sai': questions.filter(q => q.optionNotes).length,
        'Câu đọc hiểu có trích dẫn căn cứ': `${withEvidence}/${questions.filter(q => q.skill === 'reading').length}`,
    };
    return { errors, warnings, stats };
}

function countBy(list, fn) {
    const out = {};
    for (const x of list) {
        const k = fn(x);
        out[k] = (out[k] || 0) + 1;
    }
    return out;
}

function buildStats(questions, passages) {
    return {
        total: questions.length,
        passages: (passages || []).length,
        bySkill: countBy(questions, q => q.skill),
        byLevel: countBy(questions, q => q.level),
        byType: countBy(questions, q => q.type),
        byDifficulty: countBy(questions, q => q.difficulty),
        byStatus: countBy(questions, q => q.status),
        bySource: countBy(questions, q => q.source),
        byAnswer: countBy(questions, q => 'ABCD'[q.answer] || '?'),
        bySkillLevel: countBy(questions, q => `${q.skill} / ${q.level}`),
    };
}

function printReport({ errors, warnings, stats }, { verbose = false } = {}) {
    const table = obj => Object.entries(obj).sort((a, b) => String(a[0]).localeCompare(String(b[0])))
        .map(([k, v]) => `    ${k.padEnd(32)} ${v}`).join('\n');
    console.log('\n=== THỐNG KÊ NGÂN HÀNG CÂU HỎI ===');
    console.log(`  Tổng số câu hỏi: ${stats.total}   |   Số bài đọc: ${stats.passages}`);
    for (const [title, key] of [['Theo nhóm kỹ năng', 'bySkill'], ['Theo trình độ', 'byLevel'], ['Theo dạng câu', 'byType'],
        ['Theo độ khó', 'byDifficulty'], ['Theo trạng thái', 'byStatus'], ['Theo nguồn', 'bySource'],
        ['Vị trí đáp án đúng', 'byAnswer'], ['Kỹ năng × trình độ', 'bySkillLevel']]) {
        console.log(`  ${title}:\n${table(stats[key] || {})}`);
    }
    if (stats.extras) console.log(`  Giải thích:\n${table(stats.extras)}`);
    console.log(`\n=== KẾT QUẢ KIỂM TRA ===\n  Lỗi: ${errors.length}   |   Cảnh báo: ${warnings.length}`);
    if (errors.length) console.log(errors.map(e => `  [LỖI] ${e}`).join('\n'));
    if (warnings.length) {
        if (verbose) console.log(warnings.map(w => `  [CẢNH BÁO] ${w}`).join('\n'));
        else console.log('  (chạy với --verbose để xem danh sách cảnh báo)');
    }
}

function main() {
    const { readData } = require('./build-bundle');
    let data;
    try {
        data = readData();
    } catch (e) {
        console.error(`Không đọc được dữ liệu: ${e.message}`);
        process.exit(1);
    }
    const report = validate(data.questions, data.passages, { checkBundle: true });
    printReport(report, { verbose: process.argv.includes('--verbose') });
    process.exit(report.errors.length ? 1 : 0);
}

if (require.main === module) main();

module.exports = { validate, printReport, jaccard, tokens };
