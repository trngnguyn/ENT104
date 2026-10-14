'use strict';

/**
 * Sinh ngân hàng câu hỏi từ các file nguồn trong scripts/bank/ và ghi ra:
 *   data/questions.json, data/reading-passages.json, data/question-bank.bundle.js
 *
 * Sau khi đã sinh, data/questions.json là nguồn dữ liệu chính (giáo viên có thể sửa trực tiếp).
 * Vì vậy script sẽ KHÔNG ghi đè nếu file đã tồn tại, trừ khi chạy với --force.
 *
 *   node scripts/generate-question-bank.js [--force]
 */

const fs = require('fs');
const path = require('path');
const { reseed, shuffle } = require('./lib/builders');
const { writeBundle } = require('./build-bundle');
const { validate, printReport } = require('./validate-questions');
const { optionNotesFor } = require('./lib/option-notes');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const QUESTIONS_FILE = path.join(DATA, 'questions.json');
const PASSAGES_FILE = path.join(DATA, 'reading-passages.json');

const SKILLS = [
    { skill: 'grammar', prefix: 'GRAM' },
    { skill: 'vocabulary', prefix: 'VOC' },
    { skill: 'communication', prefix: 'COMM' },
    { skill: 'reading', prefix: 'READ' },
    { skill: 'completion_error', prefix: 'CERR' },
    { skill: 'writing', prefix: 'WRIT' },
];
const LEVEL_CODE = { 'A1': 'A1', 'A2': 'A2', 'A1-A2': 'A12' };
const LEVEL_ORDER = ['A1', 'A2', 'A1-A2'];
const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

// Ngoài ngữ pháp và đọc hiểu (level gắn với điểm ngữ pháp / bài đọc), câu A1 có độ khó medium/hard
// được xếp vào nhóm chuyển tiếp A1-A2.
const BOUNDARY_SKILLS = ['vocabulary', 'communication', 'completion_error', 'writing'];
const boundaryLevel = q =>
    (q.level === 'A1' && q.difficulty !== 'easy' && BOUNDARY_SKILLS.includes(q.skill) ? 'A1-A2' : q.level);

// Các bank đã được AI đọc rà soát từng câu (đáp án, phương án nhiễu, giải thích) — 10/2026.
// Câu thuộc bank mới thêm sau này sẽ chỉ có trạng thái 'auto_validated' cho tới khi được rà soát.
const AI_REVIEWED_BANKS = new Set(['original', 'grammar', 'vocabulary', 'communication', 'reading', 'completion-error', 'writing']);

// Mỗi bank có seed riêng để sửa một bank không làm thay đổi thứ tự đáp án của bank khác.
function load(name, seed) {
    reseed(seed);
    const data = require(`./bank/${name}`);
    const tag = list => list.map(q => ({ ...q, bank: name }));
    return Array.isArray(data) ? tag(data) : { ...data, questions: tag(data.questions) };
}

function collect() {
    const original = load('original', 1).map(q => {
        if (q.type !== 'completion') return q;
        const correct = q.options[q.answer];
        const options = shuffle(q.options);
        return { ...q, options, answer: options.indexOf(correct) };
    });
    const reading = load('reading', 4);
    return {
        questions: [
            ...original,
            ...load('grammar', 2),
            ...load('vocabulary', 3),
            ...load('communication', 5),
            ...reading.questions,
            ...load('completion-error', 6),
            ...load('writing', 7),
        ],
        passages: reading.passages,
    };
}

const statusOf = q => {
    if (q.reviewNote) return 'needs_review';
    return AI_REVIEWED_BANKS.has(q.bank) ? 'ai_reviewed' : 'auto_validated';
};

function sortWithinSkill(list, skill) {
    if (skill === 'reading') return list; // giữ nguyên thứ tự bài đọc → câu hỏi
    const catOrder = [];
    list.forEach(q => { if (!catOrder.includes(q.category)) catOrder.push(q.category); });
    return list
        .map((q, i) => ({ q, i }))
        .sort((a, b) =>
            LEVEL_ORDER.indexOf(a.q.level) - LEVEL_ORDER.indexOf(b.q.level)
            || catOrder.indexOf(a.q.category) - catOrder.indexOf(b.q.category)
            || DIFFICULTY_ORDER.indexOf(a.q.difficulty) - DIFFICULTY_ORDER.indexOf(b.q.difficulty)
            || a.i - b.i)
        .map(x => x.q);
}

function finalize(raw) {
    const out = [];
    const leveled = raw.map(q => ({ ...q, level: boundaryLevel(q) }));
    for (const { skill, prefix } of SKILLS) {
        const counters = {};
        for (const q of sortWithinSkill(leveled.filter(x => x.skill === skill), skill)) {
            const code = LEVEL_CODE[q.level];
            counters[code] = (counters[code] || 0) + 1;
            const optionNotes = optionNotesFor(q);
            const item = {
                id: `${prefix}-${code}-${String(counters[code]).padStart(4, '0')}`,
                skill: q.skill,
                type: q.type,
                category: q.category,
                level: q.level,
                difficulty: q.difficulty,
                unit: null,
                source: 'general_a1_a2',
                ...(q.passageId ? { passageId: q.passageId } : {}),
                question: q.question,
                options: q.options,
                answer: q.answer,
                explanation: q.explanation,
                ...(optionNotes ? { optionNotes } : {}),
                ...(q.correction ? { correction: q.correction } : {}),
                tags: [...new Set(q.tags || [])],
                status: statusOf(q),
                ...(q.reviewNote ? { reviewNote: q.reviewNote } : {}),
                ...(q.origin ? { origin: q.origin } : {}),
            };
            out.push(item);
        }
    }
    return out;
}

function main() {
    const force = process.argv.includes('--force');
    if (fs.existsSync(QUESTIONS_FILE) && !force) {
        console.error('data/questions.json đã tồn tại. Đây là dữ liệu chính, có thể đã được chỉnh sửa tay.');
        console.error('Chạy lại với --force nếu thực sự muốn sinh lại toàn bộ (mọi chỉnh sửa tay sẽ mất).');
        process.exit(1);
    }

    const raw = collect();
    const questions = finalize(raw.questions);
    const passages = raw.passages.map(p => ({ ...p, source: 'general_a1_a2', unit: null }));

    fs.mkdirSync(DATA, { recursive: true });
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2) + '\n', 'utf8');
    fs.writeFileSync(PASSAGES_FILE, JSON.stringify(passages, null, 2) + '\n', 'utf8');
    writeBundle();

    console.log(`Đã ghi ${questions.length} câu hỏi và ${passages.length} bài đọc.`);
    const report = validate(questions, passages, { checkBundle: true });
    printReport(report);
    process.exit(report.errors.length ? 1 : 0);
}

if (require.main === module) main();

module.exports = { collect, finalize };
