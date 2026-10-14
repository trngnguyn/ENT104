/**
 * Lưu trạng thái làm bài: chế độ luyện tập (theo ID câu hỏi) và một bài thi đang làm.
 * Dữ liệu được lưu trong localStorage nên tải lại trang không mất tiến độ.
 * Kết quả bài thi (examHistory) được lưu tách biệt với các đề đã soạn (savedPapers).
 */
(function (global) {
    'use strict';

    const KEYS = {
        practice: 'ent104.practice.v1',
        exam: 'ent104.exam.v1',
        history: 'ent104.examHistory.v1',
    };
    const HISTORY_LIMIT = 30;
    const storage = () => global.AppStorage;

    const hasAnswer = a => a !== undefined && a !== null;

    class QuizService {
        constructor(questionService) {
            this.qs = questionService;
            this.practice = storage().get(KEYS.practice, {});
            this.history = storage().get(KEYS.history, []);
            this.exam = this._restoreExam();
        }

        _restoreExam() {
            const exam = storage().get(KEYS.exam, null);
            if (!exam || !Array.isArray(exam.ids)) return null;
            exam.ids = exam.ids.filter(id => this.qs.byId.has(id));
            return exam.ids.length ? exam : null;
        }

        statusOf(question, answer) {
            if (!hasAnswer(answer)) return 'unanswered';
            return answer === question.answer ? 'correct' : 'wrong';
        }

        // ---- Luyện tập ----
        practiceAnswer(id) {
            return this.practice[id];
        }

        practiceStatus(q) {
            return this.statusOf(q, this.practice[q.id]);
        }

        /** Mỗi câu chỉ ghi nhận lần xác nhận đầu tiên; muốn làm lại thì gọi clearPractice([id]). */
        answerPractice(id, index) {
            if (hasAnswer(this.practice[id])) return false;
            this.practice[id] = index;
            storage().set(KEYS.practice, this.practice);
            return true;
        }

        clearPractice(ids = null) {
            if (ids) ids.forEach(id => delete this.practice[id]);
            else this.practice = {};
            storage().set(KEYS.practice, this.practice);
        }

        // ---- Thi thử ----
        get examActive() {
            return !!this.exam && !this.exam.submittedAt;
        }

        /**
         * Bắt đầu bài thi với danh sách câu hỏi đã sắp sẵn (từ đề nhanh hoặc đề đã soạn).
         * meta: { title, paperId, criteria, timeLimit (phút, 0 = không giới hạn) }
         */
        startExam(questions, meta = {}) {
            const ids = [...new Set(questions.map(q => q.id))].filter(id => this.qs.byId.has(id));
            this.exam = {
                ids,
                answers: {},
                title: meta.title || null,
                paperId: meta.paperId || null,
                criteria: meta.criteria || null,
                timeLimit: Math.max(0, Number(meta.timeLimit) || 0),
                startedAt: Date.now(),
                submittedAt: null,
                autoSubmitted: false,
            };
            storage().set(KEYS.exam, this.exam);
            return this.exam;
        }

        get examDeadline() {
            return this.exam && this.exam.timeLimit ? this.exam.startedAt + this.exam.timeLimit * 60000 : null;
        }

        remainingMs(now = Date.now()) {
            const deadline = this.examDeadline;
            return deadline === null ? null : Math.max(0, deadline - now);
        }

        isExpired(now = Date.now()) {
            return this.examActive && this.examDeadline !== null && now >= this.examDeadline;
        }

        examQuestions() {
            return this.exam ? this.exam.ids.map(id => this.qs.byId.get(id)) : [];
        }

        examAnswer(id) {
            return this.exam ? this.exam.answers[id] : undefined;
        }

        examStatus(q) {
            return this.statusOf(q, this.examAnswer(q.id));
        }

        /** Trước khi nộp bài được phép đổi đáp án; sau khi nộp hoặc hết giờ thì khoá. */
        answerExam(id, index) {
            if (!this.examActive || this.isExpired() || !this.exam.ids.includes(id)) return false;
            if (this.exam.answers[id] === index) return false;
            this.exam.answers[id] = index;
            storage().set(KEYS.exam, this.exam);
            return true;
        }

        /** summary lấy từ StatisticsService.summarize; auto = true khi hết giờ. */
        submitExam(summary, { auto = false, now = Date.now() } = {}) {
            if (!this.examActive) return null;
            const deadline = this.examDeadline;
            this.exam.submittedAt = deadline !== null ? Math.min(now, deadline) : now;
            this.exam.autoSubmitted = auto;
            storage().set(KEYS.exam, this.exam);
            const entry = {
                at: this.exam.submittedAt,
                title: this.exam.title,
                paperId: this.exam.paperId,
                total: summary.total,
                correct: summary.correct,
                wrong: summary.wrong,
                unanswered: summary.unanswered,
                score: summary.score,
                durationMs: this.exam.submittedAt - this.exam.startedAt,
                timeLimit: this.exam.timeLimit,
                autoSubmitted: auto,
                criteria: this.exam.criteria,
            };
            this.history.unshift(entry);
            this.history = this.history.slice(0, HISTORY_LIMIT);
            storage().set(KEYS.history, this.history);
            return entry;
        }

        clearExam() {
            this.exam = null;
            storage().remove(KEYS.exam);
        }
    }

    global.QuizService = QuizService;
    if (typeof module === 'object' && module.exports) module.exports = QuizService;
})(typeof window !== 'undefined' ? window : globalThis);
