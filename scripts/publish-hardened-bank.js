'use strict';

/**
 * Sinh lại toàn bộ ngân hàng từ scripts/bank/* đã làm khó hơn.
 * Ghi đè data/questions.json + reading-passages.json + bundle (ID mới theo quy tắc chuẩn).
 *
 * Lưu ý: tiến độ luyện tập theo ID cũ sẽ không còn khớp nội dung — nên xoá tiến độ sau khi cập nhật.
 *
 *   node scripts/publish-hardened-bank.js
 */

const fs = require('fs');
const path = require('path');
const { collect, finalize, sourceOf } = require('./generate-question-bank');
const { writeBundle } = require('./build-bundle');
const { validate, printReport } = require('./validate-questions');

const ROOT = path.resolve(__dirname, '..');
const QFILE = path.join(ROOT, 'data', 'questions.json');
const PFILE = path.join(ROOT, 'data', 'reading-passages.json');

function main() {
    const raw = collect();
    // Nội dung vừa viết lại hàng loạt — chưa rà soát tay từng câu.
    const questions = finalize(raw.questions).map(q => ({ ...q, status: 'auto_validated' }));
    const passages = raw.passages.map(p => ({ ...p, source: sourceOf(p.level), unit: null }));

    fs.writeFileSync(QFILE, JSON.stringify(questions, null, 2) + '\n', 'utf8');
    fs.writeFileSync(PFILE, JSON.stringify(passages, null, 2) + '\n', 'utf8');
    writeBundle();

    const v = validate(questions, passages, { checkBundle: true });
    printReport(v);
    const easy = questions.filter(q => q.difficulty === 'easy').length;
    console.log(`\nĐã xuất ${questions.length} câu, ${passages.length} bài đọc.`);
    console.log(`Độ khó: easy ${easy} / medium ${questions.filter(q => q.difficulty === 'medium').length} / hard ${questions.filter(q => q.difficulty === 'hard').length}`);
    if (v.errors.length) process.exit(1);
}

main();
