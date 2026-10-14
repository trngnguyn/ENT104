'use strict';

/**
 * Tạo data/question-bank.bundle.js từ data/questions.json và data/reading-passages.json.
 * File bundle cho phép mở index.html trực tiếp bằng file:// (trình duyệt chặn fetch JSON khi đó).
 * Chạy lại script này mỗi khi sửa file JSON:  node scripts/build-bundle.js
 */

const fs = require('fs');
const path = require('path');

const DATA = path.resolve(__dirname, '..', 'data');
const BUNDLE_FILE = path.join(DATA, 'question-bank.bundle.js');

function readData() {
    return {
        questions: JSON.parse(fs.readFileSync(path.join(DATA, 'questions.json'), 'utf8')),
        passages: JSON.parse(fs.readFileSync(path.join(DATA, 'reading-passages.json'), 'utf8')),
    };
}

function bundleSource({ questions, passages }) {
    return '// File tự động sinh bởi scripts/build-bundle.js — KHÔNG sửa trực tiếp. Hãy sửa data/*.json rồi chạy lại.\n'
        + `window.QUESTION_BANK = ${JSON.stringify({ questions, passages })};\n`;
}

function writeBundle() {
    fs.writeFileSync(BUNDLE_FILE, bundleSource(readData()), 'utf8');
}

if (require.main === module) {
    writeBundle();
    const { questions, passages } = readData();
    console.log(`Đã tạo ${path.relative(process.cwd(), BUNDLE_FILE)} (${questions.length} câu hỏi, ${passages.length} bài đọc).`);
}

module.exports = { BUNDLE_FILE, readData, bundleSource, writeBundle };
