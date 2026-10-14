#!/usr/bin/env node
/**
 * Kiểm thử tab Thì (Tenses): dữ liệu data/tenses.json, gom câu từ ngân hàng, tạo lượt luyện tập, lưu điểm,
 * và máy chủ phục vụ được file dữ liệu.
 * Chạy: npm test
 */
'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const memory = new Map();
const fakeStorage = {
    get: (k, fallback) => (memory.has(k) ? JSON.parse(memory.get(k)) : fallback),
    set: (k, v) => memory.set(k, JSON.stringify(v)),
};

const T = require('../js/tenseService');
const { createApp } = require('../server/app');
const { getConfig } = require('../server/env');
const { loadTasks } = require('../server/load-tasks');

const ROOT = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'tenses.json'), 'utf8'));
const bankRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));
const bank = Array.isArray(bankRaw) ? bankRaw : bankRaw.questions;
const EXPECTED = ['present-simple', 'present-continuous', 'past-simple', 'going-to', 'will',
    'present-continuous-future', 'past-continuous', 'present-perfect'];

const seeded = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const fresh = () => { memory.clear(); const s = new T({ storage: fakeStorage }); s.setData(data); return s; };

const results = [];
function test(name, fn) {
    try {
        fn();
        results.push([true, name]);
    } catch (e) {
        results.push([false, name, e]);
    }
}

(async () => {
    test('1. Dữ liệu hợp lệ: đủ 8 thì A1–A2, không lỗi', () => {
        const s = fresh();
        assert.deepStrictEqual(s.problems, []);
        assert.deepStrictEqual(s.tenses.map(t => t.id), EXPECTED);
        s.tenses.forEach(t => assert.ok(['A1', 'A1–A2', 'A2'].includes(t.level), `${t.id}: level ${t.level}`));
        assert.ok(/chưa đối chiếu/.test(data.note), 'note phải nói rõ chưa đối chiếu đề cương ENT104');
    });

    test('2. Câu hỏi riêng: id duy nhất, 4 lựa chọn khác nhau, đáp án hợp lệ, có chỗ trống', () => {
        const ids = new Set();
        let n = 0;
        data.tenses.forEach(t => t.questions.forEach(q => {
            assert.ok(!ids.has(q.id), `trùng id ${q.id}`);
            ids.add(q.id);
            assert.deepStrictEqual(T.validateQuestion(q), []);
            n++;
        }));
        assert.strictEqual(n, 74);
        bank.forEach(q => assert.ok(!ids.has(q.id), `id ${q.id} trùng với ngân hàng`));
    });

    test('3. Kiểm tra dữ liệu bắt được lỗi', () => {
        const t = JSON.parse(JSON.stringify(data.tenses[0]));
        t.questions[0].options = ['a', 'a', 'b', 'c'];
        t.questions[1].answer = 4;
        t.questions[2].question = 'không có chỗ trống';
        t.forms = t.forms.slice(0, 1);
        const p = T.validateTense(t);
        assert.ok(p.some(x => /trùng/.test(x)) && p.some(x => /answer/.test(x)) && p.some(x => /chỗ trống/.test(x)) && p.some(x => /forms/.test(x)), p.join('; '));
        const s = new T({ storage: null });
        s.setData({ tenses: [t, data.tenses[1]] });
        assert.deepStrictEqual(s.tenses.map(x => x.id), ['present-continuous']);
        assert.ok(s.problems.length > 0);
    });

    test('4. Gom câu ngân hàng: chỉ ngữ pháp A1/A2/A1-A2 có tag trùng, không lấy B1', () => {
        const s = fresh();
        const ps = s.byId.get('present-simple');
        const extra = s.bankQuestions(ps, bank);
        assert.ok(extra.length > 0);
        extra.forEach(q => {
            assert.strictEqual(q.skill, 'grammar');
            assert.ok(['A1', 'A2', 'A1-A2'].includes(q.level));
            assert.ok(q.tags.includes('present-simple'));
        });
        assert.deepStrictEqual(s.bankQuestions(s.byId.get('present-perfect'), bank), []);
        const pool = s.pool('present-simple', bank);
        assert.strictEqual(pool.length, ps.questions.length + extra.length);
        assert.strictEqual(new Set(pool.map(q => q.id)).size, pool.length);
        assert.ok(pool.every(q => q.tenseId === 'present-simple' && Array.isArray(q.options) && Number.isInteger(q.answer)));
    });

    test('5. Mỗi thì có ít nhất 10 câu luyện tập; tổng hợp = toàn bộ câu riêng', () => {
        const s = fresh();
        s.tenses.forEach(t => assert.ok(s.pool(t.id, bank).length >= 10, `${t.id}: ${s.pool(t.id, bank).length}`));
        const mixed = s.pool(T.MIXED_ID, bank);
        assert.strictEqual(mixed.length, 74);
        assert.strictEqual(new Set(mixed.map(q => q.tenseId)).size, 8);
        assert.deepStrictEqual(s.pool('khong-co'), []);
    });

    test('6. Lượt luyện tập: đúng số câu, không trùng, xáo trộn ổn định theo seed, lọc câu sai', () => {
        const s = fresh();
        const a = s.session('past-simple', { size: 10, bank, rng: seeded(7) });
        const b = s.session('past-simple', { size: 10, bank, rng: seeded(7) });
        assert.strictEqual(a.length, 10);
        assert.strictEqual(new Set(a.map(q => q.id)).size, 10);
        assert.deepStrictEqual(a.map(q => q.id), b.map(q => q.id));
        assert.strictEqual(s.session('past-continuous', { size: 0, bank }).length, 12);
        assert.strictEqual(s.session('past-continuous', { size: 20, bank }).length, 12);
        const only = s.session('will', { bank, only: ['TNS-WL-01', 'TNS-WL-03'] });
        assert.deepStrictEqual(only.map(q => q.id).sort(), ['TNS-WL-01', 'TNS-WL-03']);
    });

    test('7. Lưu điểm cao nhất vào localStorage', () => {
        const s = fresh();
        assert.strictEqual(s.best('will'), null);
        s.record('will', 6, 10);
        s.record('will', 4, 10);
        assert.deepStrictEqual({ ...s.best('will'), at: 0 }, { correct: 6, total: 10, pct: 60, attempts: 2, at: 0 });
        s.record('will', 9, 10);
        assert.strictEqual(s.best('will').pct, 90);
        assert.strictEqual(s.best('will').attempts, 3);
        const again = new T({ storage: fakeStorage });
        assert.strictEqual(again.best('will').pct, 90);
        assert.ok(memory.has(T.STORE_KEY));
    });

    test('8. Xáo trộn giữ nguyên phần tử', () => {
        const list = [1, 2, 3, 4, 5, 6];
        const out = T.shuffle(list, seeded(3));
        assert.deepStrictEqual(out.slice().sort(), list);
        assert.deepStrictEqual(list, [1, 2, 3, 4, 5, 6]);
    });

    await (async () => {
        const name = '9. Máy chủ phục vụ data/tenses.json và các file JS mới';
        const server = createApp({
            config: getConfig({ AI_PROVIDER: 'mock' }),
            tasks: loadTasks(path.join(ROOT, 'data', 'writing-tasks.json')),
            log: { info() {}, error() {} },
        });
        try {
            await new Promise(r => server.listen(0, '127.0.0.1', r));
            const base = `http://127.0.0.1:${server.address().port}`;
            for (const p of ['/data/tenses.json', '/js/tenseService.js', '/js/tenseView.js', '/js/accessGate.js']) {
                const res = await fetch(base + p);
                assert.strictEqual(res.status, 200, p);
            }
            const html = await (await fetch(base + '/')).text();
            ['id="tenses-view"', 'data-mode="tenses"', 'js/tenseView.js', 'js/accessGate.js'].forEach(x => assert.ok(html.includes(x), x));
            results.push([true, name]);
        } catch (e) {
            results.push([false, name, e]);
        } finally {
            server.close();
        }
    })();

    let failed = 0;
    for (const [ok, name, err] of results) {
        console.log(`${ok ? '✓' : '✗'} ${name}`);
        if (!ok) { failed++; console.log(`   ${err && err.stack}`); }
    }
    console.log(`\n${results.length - failed}/${results.length} kiểm thử Tenses đạt.`);
    process.exitCode = failed ? 1 : 0;
})();
