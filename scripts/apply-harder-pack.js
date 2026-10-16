'use strict';

/**
 * Áp dụng scripts/bank/harder-pack.js vào data/questions.json:
 * - nâng cấp một số câu easy theo ID (giữ ID)
 * - thêm câu mới với ID tiếp theo theo từng skill+level
 * Rồi validate + build bundle.
 *
 *   node scripts/apply-harder-pack.js
 */

const fs = require('fs');
const path = require('path');
const { UPGRADES, NEW_QUESTIONS } = require('./bank/harder-pack');
const { writeBundle } = require('./build-bundle');
const { validate, printReport } = require('./validate-questions');

const ROOT = path.resolve(__dirname, '..');
const QFILE = path.join(ROOT, 'data', 'questions.json');
const PFILE = path.join(ROOT, 'data', 'reading-passages.json');

const LEVEL_CODE = { A1: 'A1', A2: 'A2', 'A1-A2': 'A12', B1: 'B1' };
const PREFIX = {
    grammar: 'GRAM', vocabulary: 'VOC', communication: 'COMM',
    reading: 'READ', completion_error: 'CERR', writing: 'WRIT',
};
const sourceOf = level => (level === 'B1' ? 'general_b1' : 'general_a1_a2');

function nextId(questions, skill, level) {
    const prefix = PREFIX[skill];
    const code = LEVEL_CODE[level];
    const re = new RegExp(`^${prefix}-${code}-(\\d+)$`);
    let max = 0;
    for (const q of questions) {
        const m = String(q.id).match(re);
        if (m) max = Math.max(max, Number(m[1]));
    }
    return `${prefix}-${code}-${String(max + 1).padStart(4, '0')}`;
}

function main() {
    const questions = JSON.parse(fs.readFileSync(QFILE, 'utf8'));
    const passages = JSON.parse(fs.readFileSync(PFILE, 'utf8'));
    const byId = new Map(questions.map(q => [q.id, q]));

    let upgraded = 0;
    for (const [id, patch] of Object.entries(UPGRADES)) {
        const q = byId.get(id);
        if (!q) throw new Error(`Không tìm thấy câu để nâng cấp: ${id}`);
        Object.assign(q, patch, { status: 'auto_validated' });
        delete q.optionNotes;
        upgraded += 1;
    }

    const existingText = new Set(questions.map(q => String(q.question).replace(/\s+/g, ' ').trim().toLowerCase()));
    let added = 0;
    let skipped = 0;
    for (const raw of NEW_QUESTIONS) {
        if (!PREFIX[raw.skill] || !LEVEL_CODE[raw.level]) throw new Error(`Câu mới thiếu skill/level hợp lệ: ${raw.question}`);
        if (!Array.isArray(raw.options) || raw.options.length !== 4) throw new Error(`Cần đúng 4 options: ${raw.question}`);
        if (raw.answer < 0 || raw.answer > 3) throw new Error(`answer ngoài 0–3: ${raw.question}`);
        const key = String(raw.question).replace(/\s+/g, ' ').trim().toLowerCase();
        if (existingText.has(key)) {
            skipped += 1;
            continue;
        }
        const id = nextId(questions, raw.skill, raw.level);
        questions.push({
            id,
            skill: raw.skill,
            type: raw.type,
            category: raw.category,
            level: raw.level,
            difficulty: raw.difficulty,
            unit: null,
            source: sourceOf(raw.level),
            question: raw.question,
            options: raw.options,
            answer: raw.answer,
            explanation: raw.explanation,
            tags: [...new Set(raw.tags || [raw.skill])],
            status: 'auto_validated',
        });
        existingText.add(key);
        added += 1;
    }

    fs.writeFileSync(QFILE, JSON.stringify(questions, null, 2) + '\n', 'utf8');
    writeBundle();

    const report = validate(questions, passages, { checkBundle: true });
    printReport(report);
    console.log(`\nĐã nâng cấp ${upgraded} câu, thêm ${added} câu (bỏ qua ${skipped} câu đã có). Tổng hiện tại: ${questions.length}.`);
    if (report.errors.length) process.exit(1);
}

main();
