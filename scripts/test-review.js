#!/usr/bin/env node
/**
 * Kiểm thử ôn câu sai theo lịch (1 → 3 → 7 ngày), mục tiêu mỗi ngày và chuỗi ngày học.
 * Chạy: npm test
 */
'use strict';

const assert = require('assert');

const memory = new Map();
const fakeStorage = {
    get: (k, fallback) => (memory.has(k) ? JSON.parse(memory.get(k)) : fallback),
    set: (k, v) => memory.set(k, JSON.stringify(v)),
};

const R = require('../js/reviewService');

let today = new Date(2026, 9, 15, 9, 0);
const clock = () => today;
const passDays = n => { today = new Date(today.getFullYear(), today.getMonth(), today.getDate() + n, 9, 0); };
const fresh = () => { memory.clear(); today = new Date(2026, 9, 15, 9, 0); return new R({ storage: fakeStorage, now: clock }); };

const results = [];
function test(name, fn) {
    try {
        fn();
        results.push([true, name]);
    } catch (e) {
        results.push([false, name, e]);
    }
}

test('1. Câu sai được hẹn ôn sau 1 ngày, chưa đến hạn thì không hiện', () => {
    const r = fresh();
    r.record('Q1', false);
    assert.deepStrictEqual(r.dueIds(), []);
    passDays(1);
    assert.deepStrictEqual(r.dueIds(), ['Q1']);
});

test('2. Ôn đúng đúng hạn: giãn 3 rồi 7 ngày, đúng ở mốc cuối thì bỏ khỏi lịch', () => {
    const r = fresh();
    r.record('Q1', false);
    passDays(1);
    r.record('Q1', true);
    passDays(2);
    assert.deepStrictEqual(r.dueIds(), []);
    passDays(1);
    assert.deepStrictEqual(r.dueIds(), ['Q1']);
    r.record('Q1', true);
    passDays(6);
    assert.deepStrictEqual(r.dueIds(), []);
    passDays(1);
    r.record('Q1', true);
    assert.strictEqual(r.scheduled, 0);
});

test('3. Ôn sai thì quay về mốc 1 ngày; trả lời đúng khi chưa đến hạn không đổi lịch', () => {
    const r = fresh();
    r.record('Q1', false);
    r.record('Q1', true);
    passDays(1);
    assert.deepStrictEqual(r.dueIds(), ['Q1']);
    r.record('Q1', true);
    passDays(3);
    r.record('Q1', false);
    assert.deepStrictEqual(r.dueIds(), []);
    passDays(1);
    assert.deepStrictEqual(r.dueIds(), ['Q1']);
});

test('4. Lần đầu dùng: câu sai cũ ôn được ngay; chỉ seed một lần; câu đã bị xoá khỏi ngân hàng bị bỏ qua', () => {
    const r = fresh();
    r.seed(['Q1', 'Q2']);
    r.seed(['Q3']);
    assert.deepStrictEqual(r.dueIds().sort(), ['Q1', 'Q2']);
    assert.deepStrictEqual(r.dueIds(id => id !== 'Q2'), ['Q1']);
});

test('5. Câu sai trong bài thi vào lịch nhưng không làm lùi câu đã ở mốc xa', () => {
    const r = fresh();
    r.record('Q1', false);
    passDays(1);
    r.record('Q1', true);
    r.addWrong(['Q1', 'Q2']);
    passDays(1);
    assert.deepStrictEqual(r.dueIds(), ['Q2']);
});

test('6. Mục tiêu ngày, đổi mục tiêu, lưu lại sau khi tải lại trang', () => {
    const r = fresh();
    r.logActivity(1);
    r.logActivity(4);
    assert.strictEqual(r.doneToday, 5);
    r.goal = 30;
    r.goal = 7;
    assert.strictEqual(r.goal, 30);
    const again = new R({ storage: fakeStorage, now: clock });
    assert.strictEqual(again.goal, 30);
    assert.strictEqual(again.doneToday, 5);
    passDays(1);
    assert.strictEqual(again.doneToday, 0);
});

test('7. Chuỗi ngày học: hôm nay chưa học vẫn giữ chuỗi, bỏ một ngày thì về 0', () => {
    const r = fresh();
    assert.strictEqual(r.streak(), 0);
    r.logActivity(1);
    passDays(1);
    r.logActivity(2);
    assert.strictEqual(r.streak(), 2);
    passDays(1);
    assert.strictEqual(r.streak(), 2);
    passDays(1);
    assert.strictEqual(r.streak(), 0);
});

test('8. Xoá tiến độ xoá lịch ôn nhưng giữ số câu đã làm hôm nay', () => {
    const r = fresh();
    r.record('Q1', false);
    r.logActivity(3);
    r.forget();
    assert.strictEqual(r.scheduled, 0);
    assert.strictEqual(r.doneToday, 3);
});

let ok = 0;
for (const [pass, name, err] of results) {
    console.log(`${pass ? '✔' : '✘'} ${name}`);
    if (pass) ok += 1;
    else console.log(`    ${err && err.message}`);
}
console.log(`\n${ok}/${results.length} kiểm thử Ôn tập đạt.`);
if (ok !== results.length) process.exit(1);
