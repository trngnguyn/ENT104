/**
 * Tính thống kê từ danh sách câu hỏi và hàm lấy đáp án đã chọn (answerOf(id)).
 * Không giữ trạng thái — mọi con số đều được tính lại từ dữ liệu thật.
 */
(function (global) {
    'use strict';

    const hasAnswer = a => a !== undefined && a !== null;
    const percent = (part, whole) => (whole ? Math.round((part * 100) / whole) : 0);

    const StatisticsService = {
        summarize(questions, answerOf) {
            let answered = 0;
            let correct = 0;
            for (const q of questions) {
                const a = answerOf(q.id);
                if (!hasAnswer(a)) continue;
                answered++;
                if (a === q.answer) correct++;
            }
            return {
                total: questions.length,
                answered,
                correct,
                wrong: answered - correct,
                unanswered: questions.length - answered,
                accuracy: percent(correct, answered),
                score: percent(correct, questions.length),
            };
        },

        /** Nhóm theo keyOf(q); `order` (tuỳ chọn) quy định thứ tự hiển thị các nhóm. */
        breakdown(questions, answerOf, keyOf, order = []) {
            const groups = new Map(order.map(k => [k, []]));
            for (const q of questions) {
                const key = keyOf(q);
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(q);
            }
            return [...groups]
                .filter(([, list]) => list.length)
                .map(([key, list]) => ({ key, ...this.summarize(list, answerOf) }));
        },

        countBy(questions, keyOf) {
            const counts = {};
            for (const q of questions) {
                const key = keyOf(q);
                counts[key] = (counts[key] || 0) + 1;
            }
            return counts;
        },

        formatDuration(ms) {
            const totalSec = Math.max(0, Math.round(ms / 1000));
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            const pad = n => String(n).padStart(2, '0');
            return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
        },
    };

    global.StatisticsService = StatisticsService;
    if (typeof module === 'object' && module.exports) module.exports = StatisticsService;
})(typeof window !== 'undefined' ? window : globalThis);
