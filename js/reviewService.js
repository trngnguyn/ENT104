/**
 * Ôn câu sai theo lịch (lặp lại ngắt quãng) + mục tiêu mỗi ngày và chuỗi ngày học.
 * Câu làm sai được hẹn ôn sau 1 ngày; mỗi lần ôn đúng đúng hạn thì giãn ra 3 rồi 7 ngày;
 * đúng ở mốc cuối thì coi là đã nhớ và bỏ khỏi lịch. Ôn sai thì quay lại mốc 1 ngày.
 * Ngày tính theo giờ máy của người học.
 */
(function (global) {
    'use strict';

    const KEY = 'ent104.review.v1';
    const INTERVALS = [1, 3, 7];
    const GOALS = [10, 20, 30, 50];
    const DEFAULT_GOAL = 20;
    const KEEP_DAYS = 60;

    const pad = n => String(n).padStart(2, '0');
    const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

    class ReviewService {
        constructor({ storage = global.AppStorage, now = () => new Date() } = {}) {
            this.storage = storage;
            this.now = now;
            const saved = (storage && storage.get(KEY, null)) || {};
            this.data = {
                items: saved.items && typeof saved.items === 'object' ? saved.items : {},
                days: saved.days && typeof saved.days === 'object' ? saved.days : {},
                goal: GOALS.includes(saved.goal) ? saved.goal : DEFAULT_GOAL,
                seeded: !!saved.seeded,
            };
        }

        _save() {
            if (this.storage) this.storage.set(KEY, this.data);
        }

        _today(offset = 0) {
            return dayKey(addDays(this.now(), offset));
        }

        /** Lần đầu dùng: đưa các câu đã làm sai từ trước vào lịch, ôn được ngay hôm nay. */
        seed(wrongIds) {
            if (this.data.seeded) return;
            const today = this._today();
            wrongIds.forEach(id => { if (!this.data.items[id]) this.data.items[id] = { step: 0, due: today }; });
            this.data.seeded = true;
            this._save();
        }

        /** Ghi nhận một lần trả lời câu hỏi trong ngân hàng (luyện tập, các thì). */
        record(id, correct) {
            const item = this.data.items[id];
            if (!correct) {
                this.data.items[id] = { step: 0, due: this._today(INTERVALS[0]) };
            } else if (item && item.due <= this._today()) {
                const step = item.step + 1;
                if (step >= INTERVALS.length) delete this.data.items[id];
                else this.data.items[id] = { step, due: this._today(INTERVALS[step]) };
            } else {
                return;
            }
            this._save();
        }

        /** Câu sai trong bài thi: đưa vào lịch, không làm lùi câu đang ở mốc xa hơn. */
        addWrong(ids) {
            const due = this._today(INTERVALS[0]);
            ids.forEach(id => { if (!this.data.items[id]) this.data.items[id] = { step: 0, due }; });
            this._save();
        }

        forget(ids = null) {
            if (ids) ids.forEach(id => delete this.data.items[id]);
            else this.data.items = {};
            this._save();
        }

        /** ID các câu đến hạn ôn (hôm nay hoặc đã quá hạn), câu quá hạn lâu nhất lên trước. */
        dueIds(exists = () => true) {
            const today = this._today();
            return Object.entries(this.data.items)
                .filter(([id, it]) => it.due <= today && exists(id))
                .sort((a, b) => (a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : 0))
                .map(([id]) => id);
        }

        get scheduled() {
            return Object.keys(this.data.items).length;
        }

        /** Ngày gần nhất có câu đến hạn (sau hôm nay), hoặc null. */
        nextDue() {
            const today = this._today();
            const later = Object.values(this.data.items).map(it => it.due).filter(d => d > today).sort();
            return later[0] || null;
        }

        // ---- mục tiêu mỗi ngày ----

        logActivity(n = 1) {
            if (!(n > 0)) return;
            const today = this._today();
            this.data.days[today] = (this.data.days[today] || 0) + n;
            const oldest = this._today(-KEEP_DAYS);
            Object.keys(this.data.days).forEach(d => { if (d < oldest) delete this.data.days[d]; });
            this._save();
        }

        get doneToday() {
            return this.data.days[this._today()] || 0;
        }

        get goal() {
            return this.data.goal;
        }

        set goal(n) {
            if (!GOALS.includes(n)) return;
            this.data.goal = n;
            this._save();
        }

        /** Số ngày học liên tiếp (có làm ít nhất 1 câu); hôm nay chưa học thì vẫn giữ chuỗi tới hôm qua. */
        streak() {
            let offset = this.data.days[this._today()] ? 0 : -1;
            let count = 0;
            while (this.data.days[this._today(offset)]) {
                count += 1;
                offset -= 1;
            }
            return count;
        }
    }

    ReviewService.GOALS = GOALS;
    ReviewService.INTERVALS = INTERVALS;
    global.ReviewService = ReviewService;
    if (typeof module === 'object' && module.exports) module.exports = ReviewService;
})(typeof window !== 'undefined' ? window : globalThis);
