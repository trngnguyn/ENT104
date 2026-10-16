#!/usr/bin/env node
/**
 * Kiểm thử logic (không cần trình duyệt) cho Practice / Exam / Exam Builder trên ngân hàng câu hỏi thật.
 * Chạy: npm test
 */
'use strict';

const assert = require('assert');
const path = require('path');

// localStorage giả lập cho môi trường Node.
const memory = new Map();
globalThis.localStorage = {
    getItem: k => (memory.has(k) ? memory.get(k) : null),
    setItem: (k, v) => memory.set(k, String(v)),
    removeItem: k => memory.delete(k),
    clear: () => memory.clear(),
};

require('../js/storage');
const QuestionService = require('../js/questionService');
const QuizService = require('../js/quizService');
const Stats = require('../js/statisticsService');
const ExamBuilderService = require('../js/examBuilderService');

const data = {
    questions: require(path.join(__dirname, '..', 'data', 'questions.json')),
    passages: require(path.join(__dirname, '..', 'data', 'reading-passages.json')),
};

function seeded(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const qs = QuestionService.fromData(data);
const results = [];
function test(name, fn) {
    try {
        fn();
        results.push([true, name]);
    } catch (e) {
        results.push([false, name, e]);
    }
}

const freshQuiz = () => {
    memory.delete('ent104.practice.v1');
    memory.delete('ent104.exam.v1');
    memory.delete('ent104.examHistory.v1');
    return new QuizService(qs);
};
const unique = list => new Set(list).size === list.length;

/** Câu cùng bài đọc phải đứng liền nhau trong đề. */
function readingContiguous(ids) {
    const seen = new Set();
    let last = null;
    for (const id of ids) {
        const pid = qs.byId.get(id).passageId || null;
        if (pid && pid !== last && seen.has(pid)) return false;
        if (pid) seen.add(pid);
        last = pid;
    }
    return true;
}

// ---------------------------------------------------------------- 1. Practice
test('1. Practice: trả lời đúng / sai cho phản hồi chính xác và khoá đáp án sau khi xác nhận', () => {
    const quiz = freshQuiz();
    const [a, b] = qs.questions;
    const wrongIndex = (b.answer + 1) % 4;
    assert.strictEqual(quiz.practiceStatus(a), 'unanswered');
    assert.ok(quiz.answerPractice(a.id, a.answer));
    assert.strictEqual(quiz.practiceStatus(a), 'correct');
    assert.ok(quiz.answerPractice(b.id, wrongIndex));
    assert.strictEqual(quiz.practiceStatus(b), 'wrong');
    assert.strictEqual(quiz.answerPractice(b.id, b.answer), false, 'không được đổi đáp án sau khi xác nhận');
    assert.strictEqual(quiz.practiceAnswer(b.id), wrongIndex);
    quiz.clearPractice([b.id]);
    assert.ok(quiz.answerPractice(b.id, b.answer), 'làm lại câu hỏi thì được trả lời lại');
    assert.strictEqual(quiz.practiceStatus(b), 'correct');
    // Sau Reset: nếu vẫn lọc theo "Đã sai" thì danh sách trống — app phải đưa status về "all".
    quiz.clearPractice();
    const afterReset = qs.questions.filter(q => quiz.practiceStatus(q) === 'wrong');
    assert.strictEqual(afterReset.length, 0, 'xoá tiến độ thì không còn câu "Đã sai"');
    assert.ok(qs.questions.filter(q => quiz.practiceStatus(q) === 'unanswered').length === qs.questions.length);
    // Dữ liệu phản hồi: mọi câu đều có giải thích; ghi chú phương án sai không trỏ vào đáp án đúng.
    for (const q of qs.questions) {
        assert.ok(q.explanation && q.explanation.length >= 10, `${q.id} thiếu giải thích`);
        for (const opt of Object.keys(q.optionNotes || {})) {
            assert.ok(q.options.includes(opt) && q.options[q.answer] !== opt, `${q.id}: optionNotes sai khoá '${opt}'`);
        }
    }
});

// ---------------------------------------------------------------- 2–3. Exam
test('2. Exam: đổi được đáp án trước khi nộp, không có điểm / lịch sử trước khi nộp', () => {
    const quiz = freshQuiz();
    const builder = new ExamBuilderService(qs, { rand: seeded(1) });
    const ids = builder.quickPaper(qs.questions, 20);
    quiz.startExam(ids.map(id => qs.byId.get(id)), { title: 'T', timeLimit: 0 });
    const q = quiz.examQuestions()[0];
    assert.ok(quiz.answerExam(q.id, (q.answer + 1) % 4));
    assert.ok(quiz.answerExam(q.id, q.answer), 'trước khi nộp được đổi đáp án');
    assert.strictEqual(quiz.history.length, 0);
    assert.strictEqual(quiz.exam.submittedAt, null);
    assert.ok(quiz.examActive);
});

test('3. Exam: sau khi nộp khoá đáp án, mọi câu đều có đáp án đúng và giải thích để xem lại', () => {
    const quiz = freshQuiz();
    const builder = new ExamBuilderService(qs, { rand: seeded(2) });
    quiz.startExam(builder.quickPaper(qs.questions, 50).map(id => qs.byId.get(id)), {});
    const list = quiz.examQuestions();
    list.slice(0, 10).forEach(q => quiz.answerExam(q.id, q.answer));
    quiz.submitExam(Stats.summarize(list, id => quiz.examAnswer(id)));
    assert.strictEqual(quiz.answerExam(list[20].id, 0), false, 'sau khi nộp không được trả lời');
    for (const q of list) {
        assert.ok(Number.isInteger(q.answer) && q.options[q.answer], `${q.id} thiếu đáp án`);
        assert.ok(q.explanation, `${q.id} thiếu giải thích`);
    }
});

// ---------------------------------------------------------------- 4. Random papers
test('4. Đề ngẫu nhiên: đúng số câu, đúng phân bổ, đúng tiêu chí, câu đọc hiểu đi theo bài đọc', () => {
    const builder = new ExamBuilderService(qs, { rand: seeded(3) });
    const example = {
        ...builder.defaultConfig(),
        name: 'Đề mẫu 40 câu',
        total: 40,
        timeLimit: 45,
        quotaBy: 'skill',
        quotas: { skill: { grammar: 15, vocabulary: 10, communication: 5, reading: 10 }, type: {}, category: {} },
    };
    for (let run = 0; run < 200; run++) {
        const r = builder.generate(example);
        assert.ok(r.ok, JSON.stringify(r.check.errors));
        assert.strictEqual(r.ids.length, 40);
        assert.ok(unique(r.ids));
        const comp = builder.composition(r.ids);
        assert.deepStrictEqual(comp.bySkill, { grammar: 15, vocabulary: 10, communication: 5, reading: 10 });
        assert.ok(readingContiguous(r.ids), 'câu cùng bài đọc phải liền nhau');
        assert.ok(comp.passages <= 4, `10 câu đọc hiểu nên gom vào ít bài đọc (đang ${comp.passages})`);
    }
    const strict = {
        ...builder.defaultConfig(), total: 30, levels: ['A2'], difficulties: ['medium', 'hard'],
        types: ['completion', 'choice'], quotaBy: 'type', quotas: { skill: {}, type: { completion: 20, choice: 10 }, category: {} },
    };
    for (let run = 0; run < 100; run++) {
        const r = builder.generate(strict);
        assert.ok(r.ok, JSON.stringify(r.check.errors));
        assert.strictEqual(r.ids.length, 30);
        const list = r.ids.map(id => qs.byId.get(id));
        assert.ok(list.every(q => q.level === 'A2' && q.difficulty !== 'easy'), 'sai trình độ / độ khó');
        assert.deepStrictEqual(builder.composition(r.ids).byType, { completion: 20, choice: 10 });
    }
    const noQuota = { ...builder.defaultConfig(), total: 50 };
    let readingTotal = 0;
    for (let run = 0; run < 200; run++) {
        const r = builder.generate(noQuota);
        assert.strictEqual(r.ids.length, 50);
        assert.ok(unique(r.ids) && readingContiguous(r.ids));
        readingTotal += builder.composition(r.ids).bySkill.reading || 0;
    }
    const avg = readingTotal / 200;
    assert.ok(avg > 5 && avg < 10, `tỉ lệ đọc hiểu khi không phân bổ phải gần 15% (trung bình ${avg})`);
    const topic = 'grammar::Simple Present';
    const byTopic = {
        ...builder.defaultConfig(), total: 12, quotaBy: 'category',
        quotas: { skill: {}, type: {}, category: { [topic]: 8, 'reading::Detail': 4 } },
    };
    const rt = builder.generate(byTopic);
    assert.ok(rt.ok, JSON.stringify(rt.check.errors));
    assert.deepStrictEqual(builder.composition(rt.ids).byTopic, { [topic]: 8, 'reading::Detail': 4 });
});

// ---------------------------------------------------------------- 5–6. Manual editing
test('5. Đề thủ công: thêm, xoá, thay thế câu hỏi', () => {
    const builder = new ExamBuilderService(qs, { rand: seeded(5) });
    const config = { ...builder.defaultConfig(), mode: 'manual', total: 5 };
    const gram = qs.filter({ skill: 'grammar' });
    let ids = [];
    for (const q of gram.slice(0, 4)) ids = builder.addQuestion(ids, q.id).ids;
    assert.strictEqual(ids.length, 4);
    const passageId = qs.filter({ skill: 'reading' })[0].passageId;
    const withPassage = builder.addPassage(ids, passageId);
    assert.ok(withPassage.ok && withPassage.added === builder.byPassage.get(passageId).length);
    ids = withPassage.ids;
    ids = builder.removeQuestion(ids, gram[1].id).ids;
    assert.ok(!ids.includes(gram[1].id));
    const replaced = builder.replaceQuestion(ids, gram[0].id, config);
    assert.ok(replaced.ok);
    assert.strictEqual(replaced.ids.length, ids.length, 'thay thế không làm đổi số câu');
    assert.ok(!replaced.ids.includes(gram[0].id) && replaced.ids.includes(replaced.newId));
    assert.strictEqual(qs.byId.get(replaced.newId).skill, 'grammar');
    assert.ok(unique(replaced.ids) && readingContiguous(replaced.ids));
    const readingId = replaced.ids.find(id => qs.byId.get(id).passageId);
    const noSpare = builder.replaceQuestion(replaced.ids, readingId, { ...config, topics: [] });
    assert.ok(!noSpare.ok && /Không còn câu/.test(noSpare.message), 'báo rõ khi không có câu thay thế');
});

test('6. Không trùng câu hỏi trong cùng một đề', () => {
    const builder = new ExamBuilderService(qs, { rand: seeded(6) });
    const id = qs.questions[0].id;
    const once = builder.addQuestion([], id).ids;
    const twice = builder.addQuestion(once, id);
    assert.ok(!twice.ok && twice.ids.length === 1 && /đã có trong đề/.test(twice.message));
    assert.deepStrictEqual(builder.orderPaper([id, id]), [id]);
    assert.ok(!builder.savePaper({ name: 'X', config: builder.defaultConfig(), questionIds: [id, id] }).ok);
    const passageId = qs.passageOf(qs.byId.get(qs.filter({ skill: 'reading' })[0].id)).id;
    const full = builder.addPassage([], passageId).ids;
    assert.ok(!builder.addPassage(full, passageId).ok);
    for (let run = 0; run < 50; run++) {
        const r = builder.generate({ ...builder.defaultConfig(), total: 50 });
        assert.ok(unique(r.ids));
        let ids = r.ids;
        for (const x of ids.slice(0, 10)) {
            const rep = builder.replaceQuestion(ids, x, builder.defaultConfig());
            if (rep.ok) ids = rep.ids;
            assert.ok(unique(ids));
        }
    }
});

// ---------------------------------------------------------------- 7. Insufficient bank
test('7. Ngân hàng không đủ câu: báo số câu hiện có, gợi ý điều chỉnh, không tự đổi cấu hình', () => {
    const builder = new ExamBuilderService(qs, { rand: seeded(7) });
    const config = {
        ...builder.defaultConfig(), total: 40, levels: ['A1'], difficulties: ['hard'],
        topics: builder.allTopics.filter(t => t.startsWith('reading::')),
    };
    const before = JSON.stringify(config);
    const available = builder.eligible(config).length;
    const check = builder.check(config);
    assert.ok(!check.ok);
    assert.ok(check.errors[0].message.includes(`Chỉ có ${available} câu`), check.errors[0].message);
    assert.ok(check.errors[0].suggestions.length > 0, 'phải có gợi ý điều chỉnh');
    const gen = builder.generate(config);
    assert.ok(!gen.ok && gen.ids.length === 0, 'không được tạo đề thiếu câu');
    assert.strictEqual(JSON.stringify(config), before, 'không được tự sửa cấu hình');

    const readingTotal = qs.questions.filter(q => q.skill === 'reading').length;
    const want = readingTotal + 10;
    const quota = {
        ...builder.defaultConfig(), total: 40, quotaBy: 'skill',
        quotas: { skill: { grammar: 10, reading: want }, type: {}, category: {} },
    };
    const qcheck = builder.check(quota);
    assert.ok(qcheck.errors.some(e => e.message.includes(`Đọc hiểu: cần ${want} câu nhưng chỉ có ${readingTotal}`)));
    assert.ok(qcheck.errors.some(e => e.message.includes(`Tổng số câu đã phân bổ (${want + 10}) khác số câu của đề (40)`)));
    assert.ok(!builder.generate(quota).ok);
    const empty = builder.check({ ...builder.defaultConfig(), levels: [] });
    assert.ok(empty.errors.some(e => /trình độ/.test(e.message)));
});

// ---------------------------------------------------------------- 8. Saved papers
test('8. Lưu, mở lại, sửa, nhân bản và xoá đề', () => {
    memory.delete('ent104.savedPapers.v1');
    const builder = new ExamBuilderService(qs, { rand: seeded(8) });
    const config = { ...builder.defaultConfig(), total: 20, timeLimit: 30 };
    const ids = builder.generate(config).ids;
    assert.ok(!builder.savePaper({ name: '  ', config, questionIds: ids }).ok, 'bắt buộc đặt tên');
    const saved = builder.savePaper({ name: 'Đề ôn tập 1', config, questionIds: ids });
    assert.ok(saved.ok);

    const reopened = new ExamBuilderService(qs).getPaper(saved.paper.id);
    assert.ok(reopened, 'đọc lại được sau khi tạo service mới');
    assert.deepStrictEqual(reopened.questionIds, ids);
    assert.strictEqual(reopened.config.timeLimit, 30);
    assert.strictEqual(reopened.name, 'Đề ôn tập 1');

    const edited = builder.savePaper({ id: saved.paper.id, name: 'Đề ôn tập 1 (sửa)', config, questionIds: ids.slice(0, 15) });
    assert.ok(edited.ok && edited.paper.id === saved.paper.id);
    assert.strictEqual(builder.listPapers().length, 1);
    assert.strictEqual(builder.getPaper(saved.paper.id).questionIds.length, 15);

    const copy = builder.duplicatePaper(saved.paper.id);
    assert.ok(copy.ok && copy.paper.id !== saved.paper.id && /bản sao/.test(copy.paper.name));
    assert.strictEqual(builder.listPapers().length, 2);
    assert.ok(builder.deletePaper(saved.paper.id).ok);
    assert.deepStrictEqual(builder.listPapers().map(p => p.id), [copy.paper.id]);
    assert.ok(!memory.get('ent104.examHistory.v1') || !memory.get('ent104.examHistory.v1').includes('questionIds'),
        'kết quả làm bài lưu tách biệt với đề');
});

// ---------------------------------------------------------------- 9. Scores
test('9. Điểm và thống kê phản ánh đúng câu trả lời; hết giờ thì khoá và tự nộp', () => {
    const quiz = freshQuiz();
    const builder = new ExamBuilderService(qs, { rand: seeded(9) });
    const questions = builder.quickPaper(qs.questions, 40).map(id => qs.byId.get(id));
    quiz.startExam(questions, { title: 'Đề điểm', paperId: 'P1', timeLimit: 45 });
    questions.slice(0, 25).forEach(q => quiz.answerExam(q.id, q.answer));
    questions.slice(25, 35).forEach(q => quiz.answerExam(q.id, (q.answer + 1) % 4));
    const summary = Stats.summarize(quiz.examQuestions(), id => quiz.examAnswer(id));
    assert.deepStrictEqual(
        { total: summary.total, answered: summary.answered, correct: summary.correct, wrong: summary.wrong, unanswered: summary.unanswered, score: summary.score },
        { total: 40, answered: 35, correct: 25, wrong: 10, unanswered: 5, score: 63 });
    const bySkill = Stats.breakdown(questions, id => quiz.examAnswer(id), q => q.skill);
    assert.strictEqual(bySkill.reduce((s, r) => s + r.correct, 0), 25);
    const entry = quiz.submitExam(summary);
    assert.strictEqual(entry.title, 'Đề điểm');
    assert.strictEqual(entry.paperId, 'P1');
    assert.strictEqual(entry.correct, 25);
    assert.strictEqual(quiz.history[0].score, 63);

    const timed = freshQuiz();
    timed.startExam(questions, { timeLimit: 1 });
    timed.exam.startedAt -= 61000;
    assert.ok(timed.isExpired());
    assert.strictEqual(timed.answerExam(questions[0].id, 0), false, 'hết giờ thì không trả lời được');
    const auto = timed.submitExam(Stats.summarize(questions, id => timed.examAnswer(id)), { auto: true });
    assert.ok(auto.autoSubmitted);
    assert.strictEqual(auto.durationMs, 60000, 'thời gian làm bài không vượt quá giới hạn');
});

// ---------------------------------------------------------------- 10. Whole bank
test('10. Hoạt động với ngân hàng A1–A2 + B1 (≥ 1.300 câu), không ảnh hưởng chức năng cũ', () => {
    assert.ok(qs.questions.length >= 1300, `cần ≥ 1300 câu, hiện có ${qs.questions.length}`);
    assert.strictEqual(qs.skipped.length, 0);
    const builder = new ExamBuilderService(qs, { rand: seeded(10) });
    const bySkill = list => Stats.countBy(list, q => q.skill);
    const a12 = qs.questions.filter(q => q.level !== 'B1');
    const b1 = qs.questions.filter(q => q.level === 'B1');
    const a12Skills = bySkill(a12);
    const b1Skills = bySkill(b1);
    // Cơ cấu tối thiểu từ ngân hàng gốc 1.000 + 300; được phép thêm câu khó hơn sau này.
    for (const [k, n] of Object.entries({ grammar: 300, vocabulary: 200, communication: 150, reading: 150, completion_error: 100, writing: 100 })) {
        assert.ok(a12Skills[k] >= n, `A1–A2 ${k}: ${a12Skills[k]} < ${n}`);
    }
    for (const [k, n] of Object.entries({ grammar: 90, vocabulary: 60, communication: 45, reading: 45, completion_error: 30, writing: 30 })) {
        assert.ok(b1Skills[k] >= n, `B1 ${k}: ${b1Skills[k]} < ${n}`);
    }
    assert.ok(b1.every(q => q.source === 'general_b1' && q.unit === null && /-B1-\d{4}$/.test(q.id)));
    assert.ok(a12.every(q => q.source === 'general_a1_a2'));
    assert.ok(QuestionService.LEVELS.includes('B1') && ExamBuilderService.LEVELS.includes('B1'));
    assert.ok(qs.filter({ level: 'B1' }).length >= 300);
    const b1Paper = builder.generate({ ...builder.defaultConfig(), total: 40, levels: ['B1'] });
    assert.ok(b1Paper.ok && b1Paper.ids.length === 40 && b1Paper.ids.every(id => qs.byId.get(id).level === 'B1'));
    for (const id of b1Paper.ids) {
        const q = qs.byId.get(id);
        if (q.passageId) assert.strictEqual(qs.passages.get(q.passageId).level, 'B1');
    }
    for (const size of [20, 40, 50]) {
        const ids = builder.quickPaper(qs.filter({ level: 'A1' }), size);
        assert.strictEqual(ids.length, size);
        assert.ok(unique(ids) && ids.every(id => qs.byId.get(id).level === 'A1'));
    }
    const small = qs.filter({ skill: 'reading', level: 'A1', category: 'Main Idea' });
    assert.ok(small.length > 0 && small.length < 50);
    assert.strictEqual(builder.quickPaper(small, 50).length, small.length, 'đề nhanh không vượt quá số câu có thật');
    assert.ok(qs.filter({ query: 'GRAM-A1-0001' }).some(q => q.id === 'GRAM-A1-0001'));
    const n = qs.questions.length;
    const all = builder.generate({ ...builder.defaultConfig(), total: n });
    assert.ok(all.ok && all.ids.length === n && unique(all.ids));
    assert.ok(!builder.check({ ...builder.defaultConfig(), total: n + 1 }).ok);
    const quiz = freshQuiz();
    quiz.answerPractice('GRAM-A1-0001', 0);
    quiz.startExam([qs.byId.get('VOC-A1-0001')], {});
    assert.strictEqual(quiz.practiceAnswer('GRAM-A1-0001'), 0, 'thi thử không ảnh hưởng tiến độ luyện tập');
});

// ----------------------------------------------------------------
let failed = 0;
for (const [ok, name, err] of results) {
    console.log(`${ok ? '✔' : '✘'} ${name}`);
    if (!ok) {
        failed++;
        console.log(`    ${err && err.message}`);
    }
}
console.log(`\n${results.length - failed}/${results.length} nhóm kiểm thử đạt.`);
process.exit(failed ? 1 : 0);
